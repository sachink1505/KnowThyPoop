"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[global-error]", error);
  }, [error]);

  return (
    <html lang="en">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif" }}>
        <main
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            background: "#fafaf9",
            color: "#1c1917",
            textAlign: "center",
          }}
        >
          <h1 style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>
            Something went wrong
          </h1>
          <p style={{ fontSize: 14, color: "#78716c", marginTop: 8 }}>
            The app ran into an unexpected error.
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: 24,
              padding: "12px 20px",
              borderRadius: 14,
              background: "#d97706",
              color: "white",
              border: "none",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
