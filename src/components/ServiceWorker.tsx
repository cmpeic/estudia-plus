"use client";

import { useEffect } from "react";

// Registra el service worker solo en producción para estudiar sin conexión.
export default function ServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {
      /* sin soporte: la app sigue funcionando online */
    });
  }, []);
  return null;
}
