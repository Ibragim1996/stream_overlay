// app/panel/page.tsx
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

type Mode = "funny" | "motivator" | "serious" | "chill";
type TaskType = "question" | "challenge" | "just_talk" | "joke";
type StreamKind = "just_chat" | "irl" | "gaming" | "music" | "cooking";
type Status = "idle" | "ok" | "err";

export default function PanelPage() {
  // form
  const [name, setName] = useState("");
  const [mode, setMode] = useState<Mode>("motivator");
  const [taskType, setTaskType] = useState<TaskType>("challenge");
  const [streamKind, setStreamKind] = useState<StreamKind>("just_chat");
  const [auto, setAuto] = useState(true);
  const [interval, setInterval] = useState<number>(12);

  // system
  const [overlayLink, setOverlayLink] = useState("");
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState<Status>("idle");

  const clampInterval = (n: unknown) => {
    const num = Math.floor(Number(n));
    return Math.max(5, Math.min(60, Number.isFinite(num) ? num : 12));
  };

  async function generate() {
    try {
      setBusy(true);
      setStatus("idle");
      setOverlayLink("");

      const trimmed = name.trim();
      if (!trimmed) throw new Error("Enter streamer name");

      // запрос токена
      const r = await fetch("/api/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmed }),
      });

      const data: unknown = await r.json().catch(() => ({}));
      if (
        !data ||
        typeof data !== "object" ||
        (!("overlayUrl" in data) && !("token" in data))
      ) {
        throw new Error("Unexpected response from /api/token");
      }

      // из ответа берём готовый overlayUrl (предпочтительно), иначе собираем сами из token
      let baseUrl = "";
      // безопасный разбор без any и без @ts-expect-error
      const d = data as Record<string, unknown>;
      const overlayUrlVal = d["overlayUrl"];

      if (typeof overlayUrlVal === "string" && overlayUrlVal.length > 0) {
        baseUrl = overlayUrlVal;
      } else {
        const tokenVal = d["token"];
        const token = typeof tokenVal === "string" ? tokenVal : "";
        if (!token) throw new Error("Token missing in response");
        const origin = typeof window !== "undefined" ? window.location.origin : "";
        baseUrl = `${origin}/overlay?t=${encodeURIComponent(token)}`;
      }

      const u = new URL(baseUrl, typeof window !== "undefined" ? window.location.href : "http://localhost");

      // добавляем/обновляем параметры для overlay
      u.searchParams.set("m", mode);                 // tone
      u.searchParams.set("tt", taskType);           // task type
      u.searchParams.set("sc", streamKind);         // stream kind
      u.searchParams.set("a", auto ? "1" : "0");    // auto
      u.searchParams.set("s", String(clampInterval(interval))); // seconds
      u.searchParams.set("panel", "1");             // чтобы панелька в overlay открывалась

      setOverlayLink(u.toString());
      setStatus("ok");
    } catch (e: unknown) {
      const msg =
        e instanceof Error ? e.message : "Failed to generate link";
      setStatus("err");
      // alert(msg); // заменено на UI уведомление
      if (typeof window !== "undefined") {
        const evt = new CustomEvent("seeko:notify", { detail: { type: "error", message: msg } });
        window.dispatchEvent(evt);
      }
    } finally {
      setBusy(false);
    }
  }

  async function copyLink() {
    if (!overlayLink) return;
    try {
      await navigator.clipboard.writeText(overlayLink);
      // alert("Copied!");
      if (typeof window !== "undefined") {
        const evt = new CustomEvent("seeko:notify", { detail: { type: "success", message: "Copied!" } });
        window.dispatchEvent(evt);
      }
    } catch {
      // alert("Copy failed");
      if (typeof window !== "undefined") {
        const evt = new CustomEvent("seeko:notify", { detail: { type: "error", message: "Copy failed" } });
        window.dispatchEvent(evt);
      }
    }
  }

  // лёгкий пинг, чтобы прогреть api (необязательно)
  useEffect(() => {
    void fetch("/api/ping").catch(() => {});
  }, []);

  return (
    <div style={wrap}>
      <header style={header}>
        <div style={brandDot} />
        <h1 style={{ margin: 0, fontSize: 18, letterSpacing: 0.5 }}>
          SEEKO • Stream
        </h1>
        <nav style={{ marginLeft: "auto", display: "flex", gap: 16 }}>
          <Link href="/" style={link}>
            Home
          </Link>
          <Link href="/overlay" style={link}>
            Overlay
          </Link>
        </nav>
      </header>

      <div style={grid}>
        {/* генерация ссылки */}
        <section style={card}>
          <h3 style={{ marginTop: 0 }}>Your overlay link</h3>

          <label style={label}>Streamer name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. ibra_tv"
            style={input}
            aria-label="Streamer name"
          />

          {/* настройки тона/типа */}
          <div style={{ marginTop: 12 }}>
            <div style={groupLabel}>Tone</div>
            <div style={chips}>
              {(["funny", "motivator", "serious", "chill"] as Mode[]).map((m) => (
                <Chip key={m} active={mode === m} onClick={() => setMode(m)} label={cap(m)} />
              ))}
            </div>

            <div style={groupLabel}>Task type</div>
            <div style={chips}>
              {(["question", "challenge", "just_talk", "joke"] as TaskType[]).map((t) => (
                <Chip key={t} active={taskType === t} onClick={() => setTaskType(t)} label={labelTask(t)} />
              ))}
            </div>

            <div style={groupLabel}>Stream type</div>
            <div style={chips}>
              {(["just_chat", "irl", "gaming", "music", "cooking"] as StreamKind[]).map((s) => (
                <Chip key={s} active={streamKind === s} onClick={() => setStreamKind(s)} label={labelStream(s)} />
              ))}
            </div>
          </div>

          {/* авто и интервал */}
          <div style={{ display: "flex", gap: 16, marginTop: 12, flexWrap: "wrap" }}>
            <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                checked={auto}
                onChange={(e) => setAuto(e.target.checked)}
              />
              Auto-update tasks
            </label>
            <label>
              <span style={{ opacity: 0.8, marginRight: 8 }}>Interval (sec)</span>
              <input
                type="number"
                min={5}
                max={60}
                value={interval}
                onChange={(e) => setInterval(clampInterval(e.target.value))}
                style={numInput}
                aria-label="Interval seconds"
              />
            </label>
          </div>

          {/* действия */}
          <div style={{ display: "flex", gap: 10, marginTop: 14, flexWrap: "wrap" }}>
            <button onClick={generate} disabled={busy || !name.trim()} style={btnPrimary} aria-busy={busy}>
              {busy ? "Generating…" : "Generate link"}
            </button>
            <button onClick={copyLink} disabled={!overlayLink} style={btnGhost}>
              Copy
            </button>
            <a
              href={overlayLink || "#"}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                ...btnGhost,
                textDecoration: "none",
                pointerEvents: overlayLink ? "auto" : "none",
                opacity: overlayLink ? 1 : 0.5,
              }}
            >
              Open overlay (test)
            </a>
          </div>

          <input
            value={overlayLink}
            readOnly
            placeholder="—"
            style={{ ...input, marginTop: 12 }}
            aria-label="Overlay link"
          />

          <div style={{ marginTop: 10, fontSize: 13, opacity: 0.85 }}>
            Status:{" "}
            {status === "idle" && <span>Idle</span>}
            {status === "ok" && <span style={{ color: "#8be28b" }}>Ready ✓</span>}
            {status === "err" && <span style={{ color: "#ff7d7d" }}>Error</span>}
          </div>
        </section>

        {/* помощь по OBS/Streamlabs */}
        <section style={card}>
          <h3 style={{ marginTop: 0 }}>How to add to OBS/Streamlabs</h3>
          <ol style={{ marginTop: 8, lineHeight: 1.6, opacity: 0.9 }}>
            <li>
              Click <b>Generate link</b>, then <b>Copy</b>.
            </li>
            <li>
              In OBS or Streamlabs add a <b>Browser Source</b>.
            </li>
            <li>
              Paste the link, set width/height to your canvas (e.g. 1920×1080).
            </li>
            <li>Done. Viewers will see tasks on top of your stream.</li>
          </ol>
        </section>
      </div>
    </div>
  );
}

/* ---------- small ui helpers ---------- */

function cap(s: string) {
  return s.slice(0, 1).toUpperCase() + s.slice(1).replace("_", " ");
}
function labelTask(t: TaskType) {
  if (t === "just_talk") return "Just talk";
  if (t === "challenge") return "Challenge";
  if (t === "question") return "Question";
  return "Joke/Roast";
}
function labelStream(s: StreamKind) {
  if (s === "just_chat") return "Just chatting";
  if (s === "irl") return "IRL";
  if (s === "gaming") return "Gaming";
  if (s === "music") return "Music";
  return "Cooking";
}
function Chip(props: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={props.onClick}
      style={{
        padding: "8px 12px",
        borderRadius: 12,
        border: "1px solid #2a3a7a",
        background: props.active ? "#415cff" : "#141a35",
        color: props.active ? "#fff" : "#d3ddff",
        cursor: "pointer",
      }}
    >
      {props.label}
    </button>
  );
}

/* ---------- styles ---------- */

const wrap: React.CSSProperties = {
  minHeight: "100vh",
  background:
    "radial-gradient(1200px 600px at 50% 20%, rgba(90,110,200,.25), transparent), #0b1020",
  color: "#e6e9f2",
  padding: "24px",
  fontFamily:
    "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif",
};

const header: React.CSSProperties = {
  maxWidth: 1000,
  margin: "0 auto 18px auto",
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const brandDot: React.CSSProperties = {
  width: 10,
  height: 10,
  borderRadius: 999,
  background: "#5a6bff",
};

const link: React.CSSProperties = {
  color: "#a9b4d0",
  textDecoration: "none",
};

const grid: React.CSSProperties = {
  maxWidth: 1000,
  margin: "0 auto",
  display: "grid",
  gap: 18,
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
};

const card: React.CSSProperties = {
  padding: 18,
  background: "rgba(10,13,30,.65)",
  border: "1px solid rgba(60,70,110,.6)",
  borderRadius: 16,
  backdropFilter: "blur(6px)",
};

const label: React.CSSProperties = {
  display: "block",
  marginBottom: 6,
  opacity: 0.85,
};

const groupLabel: React.CSSProperties = {
  marginTop: 12,
  marginBottom: 6,
  fontSize: 12,
  opacity: 0.8,
};

const chips: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
  marginBottom: 4,
};

const input: React.CSSProperties = {
  width: "100%",
  padding: "12px 14px",
  borderRadius: 12,
  background: "#0f1220",
  color: "#e6e9f2",
  border: "1px solid #2b2f45",
};

const numInput: React.CSSProperties = {
  width: 90,
  padding: "8px 10px",
  borderRadius: 10,
  background: "#0f1220",
  color: "#e6e9f2",
  border: "1px solid #2b2f45",
};

const btnPrimary: React.CSSProperties = {
  padding: "10px 16px",
  borderRadius: 12,
  background: "#4f6bff",
  color: "#fff",
  border: "none",
  cursor: "pointer",
};

const btnGhost: React.CSSProperties = {
  padding: "10px 16px",
  borderRadius: 12,
  background: "#2b2f45",
  color: "#e6e9f2",
  border: "none",
  cursor: "pointer",
};