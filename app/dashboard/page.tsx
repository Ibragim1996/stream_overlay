"use client";

import { useEffect, useRef, useState } from "react";

type OverlayMode = "funny" | "motivator" | "serious" | "chill";

export default function DashboardClient() {
  const [mode, setMode] = useState<OverlayMode>(() => {
    if (typeof window === "undefined") return "motivator";
    return (localStorage.getItem("overlay-mode") as OverlayMode) || "motivator";
  });

  const [seconds, setSeconds] = useState<number>(() => {
    if (typeof window === "undefined") return 12;
    return Number(localStorage.getItem("overlay-seconds") || 12);
  });

  const [voiceOn, setVoiceOn] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("overlay-voice") === "1";
  });

  const [friendOn, setFriendOn] = useState<boolean>(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("overlay-friend") !== "0";
  });

  const busRef = useRef<BroadcastChannel | null>(null);

  // Поднимаем канал связи с overlay
  useEffect(() => {
    const bc = new BroadcastChannel("overlay-bus");
    busRef.current = bc;

    // отправим текущее состояние при загрузке
    bc.postMessage({ type: "mode", value: mode });
    bc.postMessage({ type: "voice", value: voiceOn });
    bc.postMessage({ type: "friend", value: friendOn });

    return () => bc.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // сохраняем и вещаем изменения
  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("overlay-mode", mode);
    busRef.current?.postMessage({ type: "mode", value: mode });
  }, [mode]);

  useEffect(() => {
    if (typeof window !== "undefined")
      localStorage.setItem("overlay-seconds", String(seconds));
  }, [seconds]);

  useEffect(() => {
    if (typeof window !== "undefined")
      localStorage.setItem("overlay-voice", voiceOn ? "1" : "0");
    busRef.current?.postMessage({ type: "voice", value: voiceOn });
  }, [voiceOn]);

  useEffect(() => {
    if (typeof window !== "undefined")
      localStorage.setItem("overlay-friend", friendOn ? "1" : "0");
    busRef.current?.postMessage({ type: "friend", value: friendOn });
  }, [friendOn]);

  // const sendTip = (text: string) =>
  //   busRef.current?.postMessage({ type: "friend-tip", text });

  // const sendTask = (text: string) =>
  //   busRef.current?.postMessage({ type: "task", text });

  return (
    <div style={wrap}>
      <h2 style={{ margin: 0 }}>Streamer Dashboard</h2>
      <div style={{ opacity: 0.7, fontSize: 14, marginTop: 6 }}>
        1) Открой <code>/overlay?t=ВАШ_ТОКЕН</code> в OBS/Browser Source. 2) Здесь выбирай режим и управляй.
      </div>
      <div style={{ height: 18 }} />
      {/* Режимы */}
      <section style={card}>
        <div style={sectionTitle}>Mode</div>
        <div style={row}>
          <ModeButton current={mode} value="funny" onClick={setMode} />
          <ModeButton current={mode} value="motivator" onClick={setMode} />
          <ModeButton current={mode} value="serious" onClick={setMode} />
          <ModeButton current={mode} value="chill" onClick={setMode} />
        </div>
      </section>
      {/* Параметры */}
      <section style={card}>
        <div style={sectionTitle}>Settings</div>
        <div style={row}>
          <label style={label}>
            Interval (sec)
            <input
              type="number"
              min={5}
              value={seconds}
              onChange={(e) =>
                setSeconds(Math.max(5, Number(e.target.value || 0)))
              }
              style={num}
            />
          </label>
          <button
            style={btn(voiceOn)}
            onClick={() => setVoiceOn((v) => !v)}
            title="Включить/выключить озвучку заданий"
          >
            {voiceOn ? "Voice: ON" : "Voice: OFF"}
          </button>
          <button
            style={btn(friendOn)}
            onClick={() => setFriendOn((v) => !v)}
            title="Включить/выключить подсказки AI Friend"
          >
            {friendOn ? "Friend: ON" : "Friend: OFF"}
          </button>
        </div>
      </section>
    </div>
  );
}

// ...existing code...

/* ui */
function ModeButton({
  current,
  value,
  onClick,
}: {
  current: OverlayMode;
  value: OverlayMode;
  onClick: (m: OverlayMode) => void;
}) {
  const active = current === value;
  return (
    <button style={btn(active)} onClick={() => onClick(value)}>
      {value[0].toUpperCase() + value.slice(1)}
    </button>
  );
}

const wrap: React.CSSProperties = {
  fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto",
  color: "#e6e9f2",
  background: "linear-gradient(180deg, #0b1020 0%, #0c1226 100%)",
  minHeight: "100vh",
  padding: 24,
};

const card: React.CSSProperties = {
  background: "rgba(10,14,28,.88)",
  border: "1px solid #243058",
  borderRadius: 12,
  padding: 16,
  marginBottom: 14,
  boxShadow: "0 10px 36px rgba(0,0,0,.35)",
};

const sectionTitle: React.CSSProperties = {
  fontSize: 13,
  letterSpacing: 0.3,
  opacity: 0.75,
  marginBottom: 10,
  textTransform: "uppercase",
};

const row: React.CSSProperties = { display: "flex", gap: 10, flexWrap: "wrap" };

const btn = (active = false): React.CSSProperties => ({
  background: active ? "#415cff" : "#1f2a55",
  color: active ? "#fff" : "#d3ddff",
  border: "1px solid #2a3a7a",
  borderRadius: 10,
  padding: "10px 14px",
  cursor: "pointer",
});

const label: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 8,
  fontSize: 14,
  opacity: 0.9,
};

const num: React.CSSProperties = {
  width: 84,
  background: "#0c1226",
  color: "#e6e9f2",
  border: "1px solid #243058",
  borderRadius: 10,
  padding: "8px 10px",
};