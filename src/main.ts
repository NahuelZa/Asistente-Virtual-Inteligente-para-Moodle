import './style.css';

// Import Web Awesome components
import '@awesome.me/webawesome/dist/components/page/page.js';
import '@awesome.me/webawesome/dist/components/button/button.js';
import '@awesome.me/webawesome/dist/components/input/input.js';
import '@awesome.me/webawesome/dist/components/textarea/textarea.js';
import '@awesome.me/webawesome/dist/components/card/card.js';
import '@awesome.me/webawesome/dist/components/callout/callout.js';
import '@awesome.me/webawesome/dist/components/badge/badge.js';
import '@awesome.me/webawesome/dist/components/icon/icon.js';

import { FirestoreService } from "./services";
import type { Inspeccion } from "./models/inspeccion.model";
import { db } from "./config/firebase";

export { db };

// Instancia del servicio para la colección "inspecciones"
const inspeccionesService = new FirestoreService<Inspeccion>("inspecciones");

// Elementos del DOM
const form = document.getElementById("inspectionForm")! as HTMLFormElement;
const statusCallout = document.getElementById("connectionStatus");
const statusText = document.getElementById("connectionStatusText");
const statusIcon = statusCallout?.querySelector("wa-icon");
const outputPre = document.getElementById("localOutput")!;
const submitBtn = document.getElementById("submitBtn");

// Detectar estado de la conexión a nivel de navegador
window.addEventListener("online", updateNetworkStatus);
window.addEventListener("offline", updateNetworkStatus);

function updateNetworkStatus() {
  if (navigator.onLine) {
    if (statusCallout) statusCallout.setAttribute("variant", "success");
    if (statusIcon) statusIcon.setAttribute("name", "circle-check");
    if (statusText) statusText.textContent = "Conectado a Internet";
  } else {
    if (statusCallout) statusCallout.setAttribute("variant", "danger");
    if (statusIcon) statusIcon.setAttribute("name", "triangle-exclamation");
    if (statusText) statusText.textContent = "Modo Offline (Modo Avión)";
  }
}
updateNetworkStatus();

// Guardar inspección (Soportado completamente Offline)
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const colmenaIdInput = document.getElementById("colmenaId") as HTMLInputElement | null;
  const notasInput = document.getElementById("notas") as HTMLTextAreaElement | null;

  const colmenaId = colmenaIdInput?.value?.trim() || "";
  const notas = notasInput?.value?.trim() || "";

  if (!colmenaId || !notas) {
    return;
  }

  const nuevaInspeccion: Inspeccion = {
    colmenaId: colmenaId,
    userId: "user_test_01", // Hardcodeado por ahora para la prueba
    notas: notas,
    fecha: FirestoreService.serverTimestamp(),
    createdAtLocal: new Date().toISOString()
  };

  try {
    submitBtn?.setAttribute("loading", "");

    // Guarda inmediatamente en IndexedDB a través de la abstracción (incluso sin conexión)
    const docId = await inspeccionesService.create(nuevaInspeccion);
    
    console.log("📝 Documento escrito localmente con ID:", docId);
    form?.reset();

    // Escuchar el estado de sincronización del documento creado
    escucharEstadoSincronizacion(docId);

  } catch (error) {
    console.error("Error al guardar la inspección:", error);
  } finally {
    submitBtn?.removeAttribute("loading");
  }
});

// Verificar la sincronización e idempotencia con la nube usando el servicio
function escucharEstadoSincronizacion(docId: string) {
  inspeccionesService.listenById(docId, (doc, metadata) => {
    if (!doc || !outputPre) return;

    // metadata.hasPendingWrites determina si el cambio aún vive solo en local
    const pendienteSincro = metadata.hasPendingWrites;

    outputPre.textContent = JSON.stringify(
      {
        id: doc.id,
        data: doc,
        estado: pendienteSincro
          ? "⏳ Guardado solo en Local (Pendiente subir)"
          : "☁️ Sincronizado en la Nube",
        desdeCache: metadata.fromCache
      },
      null,
      2
    );
  });
}
