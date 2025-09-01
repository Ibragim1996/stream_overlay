// app/overlay/OverlayClient.tsx
"use client";

import { useEffect, useRef, useState, useCallback } from "react";

type Mode = "challenge" | "daily" | "question" | "goal";

export default function OverlayClient(props: {
  name?: string;
  mode?: Mode;
  auto?: boolean;
  intervalSec?: number;
}) {
  const [task, setTask] = useState<string>("Loading...");
  const [loading, setLoading] = useState(false);
  const timerRef = useRef<number | null>(null);

  const mode = (props.mode ?? "challenge") as Mode;
  const name = props.name ?? "";

  const fetchTask = useCallback(async () => {
    try {
      setLoading(true);
      const url = new URL("/api/task", window.location.origin);
      url.searchParams.set("mode", mode);
      if (name) url.searchParams.set("name", name);

      const res = await fetch(url.toString(), { cache: "no-store" });
      const data = await res.json();
      setTask(data.task || "Try a quick smile to the camera.");
    } catch {
      setTask("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }, [mode, name]);

  // авто-обновление
  useEffect(() => {
    if (!props.auto) return;
    const ms = Math.max(5, props.intervalSec ?? 15) * 1000;
    timerRef.current = window.setInterval(fetchTask, ms);
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current);
    };
  }, [props.auto, props.intervalSec, fetchTask]);

  // первичный запрос
  useEffect(() => {
    fetchTask();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, name]);

  return (
    <div
      style={{
        position: "fixed",
        left: 24,
        right: 24,
        bottom: 24,
        padding: 16,
        borderRadius: 14,
        background: "rgba(13,18,33,.85)",
        color: "#e6e9f2",
        backdropFilter: "blur(6px)",
        boxShadow: "0 10px 30px rgba(0,0,0,.35)",
        maxWidth: 900,
        margin: "0 auto",
      }}
    >
      <div style={{ opacity: .7, fontSize: 12, marginBottom: 6 }}>AI task</div>
      <div style={{ fontSize: 22, lineHeight: 1.25, fontWeight: 700 }}>
        {loading ? "…" : task}
      </div>
      <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
        <button
          onClick={fetchTask}
          style={{
            background: "#5b7cff",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "10px 14px",
            cursor: "pointer",
            fontWeight: 600,
          }}
        >
          Next
        </button>
      </div>
    </div>
  );
}