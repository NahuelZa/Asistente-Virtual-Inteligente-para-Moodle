import './style.css'
import { FirestoreService } from "./services";
import type { Inspeccion } from "./models/inspeccion.model";
import { db } from "./config/firebase";

export { db };

// Instancia del servicio para la colección "inspecciones"
const inspeccionesService = new FirestoreService<Inspeccion>("inspecciones");

// Elementos del DOM
const form = document.getElementById("inspectionForm")! as HTMLFormElement;
const statusDiv = document.getElementById("connectionStatus")!;
const outputPre = document.getElementById("localOutput")!;

// Detectar estado de la conexión a nivel de navegador
window.addEventListener("online", updateNetworkStatus);
window.addEventListener("offline", updateNetworkStatus);

function updateNetworkStatus() {
  if (navigator.onLine) {
    statusDiv.textContent = "🟢 Conectado a Internet";
    statusDiv.className = "status online";
  } else {
    statusDiv.textContent = "🔴 Modo Offline (Modo Avión)";
    statusDiv.className = "status offline";
  }
}
updateNetworkStatus();

// Guardar inspección (Soportado completamente Offline)
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const colmenaIdInput = document.getElementById("colmenaId")! as HTMLInputElement;
  const notasInput = document.getElementById("notas")! as HTMLTextAreaElement;


  const colmenaId = colmenaIdInput.value;
  const notas = notasInput.value;

  const nuevaInspeccion: Inspeccion = {
    colmenaId: colmenaId,
    userId: "user_test_01", // Hardcodeado por ahora para la prueba
    notas: notas,
    fecha: FirestoreService.serverTimestamp(),
    createdAtLocal: new Date().toISOString()
  };

  try {
    // Guarda inmediatamente en IndexedDB a través de la abstracción (incluso sin conexión)
    const docId = await inspeccionesService.create(nuevaInspeccion);
    
    console.log("📝 Documento escrito localmente con ID:", docId);
    form?.reset();

    // Escuchar el estado de sincronización del documento creado
    escucharEstadoSincronizacion(docId);

  } catch (error) {
    console.error("Error al guardar la inspección:", error);
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
