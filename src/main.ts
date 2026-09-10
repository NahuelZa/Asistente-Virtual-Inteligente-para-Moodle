import './style.css'
// Import the functions you need from the SDKs you need
import { initializeApp, } from "firebase/app";
import { 
  initializeFirestore, 
  persistentLocalCache, 
  persistentMultipleTabManager,
  getFirestore,
  serverTimestamp,
  addDoc,
  collection,
  onSnapshot
} from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAiQ5EUpdTgQu2suyiYF5TOTlNwCtLUbzU",
  authDomain: "beekeep-2bdea.firebaseapp.com",
  projectId: "beekeep-2bdea",
  storageBucket: "beekeep-2bdea.firebasestorage.app",
  messagingSenderId: "337711164964",
  appId: "1:337711164964:web:e1b9771fe0491c279572b1",
  measurementId: "G-KLSSKCPFXX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// 2. Habilitar la Persistencia Offline en IndexedDB
let db;

try {
  // Intenta inicializar Firestore con caché persistente en IndexedDB
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  });
} catch (error) {
  console.warn("No se pudo activar la persistencia offline de IndexedDB:", error , "Se continuará en modo memoria normal. Datos se borraran al cerrar la app");
  // Si falla la persistencia, inicializa Firestore en modo memoria/normal
  db = getFirestore(app);
}

export { db };

// Elementos del DOM
const form = document.getElementById("inspectionForm");
const statusDiv = document.getElementById("connectionStatus");
const outputPre = document.getElementById("localOutput");

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

// 3. Guardar inspección (Soportado completamente Offline)
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const colmenaId = document.getElementById("colmenaId").value;
  const notas = document.getElementById("notas").value;

  const nuevaInspeccion = {
    colmenaId: colmenaId,
    userId: "user_test_01", // Hardcodeado por ahora para la prueba
    notas: notas,
    fecha: serverTimestamp(),
    createdAtLocal: new Date().toISOString()
  };

  try {
    // Guarda inmediatamente en IndexedDB (incluso sin conexión)
    const docRef = await addDoc(collection(db, "inspecciones"), nuevaInspeccion);
    
    console.log("📝 Documento escrito localmente con ID:", docRef.id);
    form.reset();

    // Escuchar el estado de sincronización del documento creado
    escucharEstadoSincronizacion(docRef.id);

  } catch (error) {
    console.error("Error al guardar la inspección:", error);
  }
});

// 4. Verificar la sincronización e idempotencia con la nube
function escucharEstadoSincronizacion(docId) {
  const docRef = collection(db, "inspecciones");
  
  onSnapshot(docRef, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.doc.id === docId) {
        // snapshot.metadata.hasPendingWrites determina si el cambio aún vive solo en local
        const pendienteSincro = change.doc.metadata.hasPendingWrites;
        
        outputPre.textContent = JSON.stringify({
          id: change.doc.id,
          data: change.doc.data(),
          estado: pendienteSincro ? "⏳ Guardado solo en Local (Pendiente subir)" : "☁️ Sincronizado en la Nube"
        }, null, 2);
      }
    });
  });
}