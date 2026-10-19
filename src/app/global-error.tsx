"use client";

// Último recurso si falla el layout raíz: documento propio, estilos en línea.
export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="es">
      <body style={{ margin: 0, fontFamily: "system-ui, sans-serif", background: "#f6f7fb", color: "#0f172a" }}>
        <title>Algo salió mal · Estudia+</title>
        <div style={{ minHeight: "100dvh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
          <div style={{ fontSize: 56 }}>🛠️</div>
          <h1 style={{ fontSize: 22, margin: "16px 0 8px" }}>Algo salió mal</h1>
          <p style={{ fontSize: 14, color: "#64748b", maxWidth: 280 }}>Tu progreso está guardado en este dispositivo. Vuelve a intentarlo.</p>
          <button
            type="button"
            onClick={() => retry()}
            style={{ marginTop: 20, height: 48, padding: "0 24px", borderRadius: 16, border: 0, background: "#4f46e5", color: "white", fontWeight: 600, fontSize: 15 }}
          >
            Reintentar
          </button>
        </div>
      </body>
    </html>
  );
}
