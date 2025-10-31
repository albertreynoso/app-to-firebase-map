// Importar las funciones de Firebase que necesitas
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Tu configuración de Firebase (la que tienes en la imagen)
const firebaseConfig = {
    apiKey: "AIzaSyB9VVPrgxozAesYLkJW17ks96wp1H-LSE0",
    authDomain: "app-dental-d2b34.firebaseapp.com",
    projectId: "app-dental-d2b34",
    storageBucket: "app-dental-d2b34.firebasestorage.app",
    messagingSenderId: "253456552287",
    appId: "1:253456552287:web:ce3d24b99629f5dd2e26ea"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);

// Exportar los servicios que vas a usar
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;