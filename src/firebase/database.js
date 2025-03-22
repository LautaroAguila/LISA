// src/firebase/database.js
import { db, auth } from "./config";
import { collection, addDoc } from "firebase/firestore";

// Función para agregar un producto al usuario autenticado
const addProduct = async (producto) => {
  const user = auth.currentUser; // Obtener el usuario actual
    if (!user) {
        console.error("No hay usuario autenticado");
        return;
    }

    try {
        // Agregar el producto en la colección del usuario
        await addDoc(collection(db, "users", user.uid, "productos"), producto);
        console.log("Producto agregado correctamente");
    } catch (error) {
        console.error("Error al agregar el producto:", error);
    }
};

export { addProduct };
