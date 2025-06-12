// src/components/ResumenStock.jsx
import { useEffect, useState } from "react";
import { getFirestore, collection, onSnapshot } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { app } from "../../firebase/config";

const ResumenStock = ({ umbralStockBajo }) => {
  const db = getFirestore(app);
  const auth = getAuth();
  const uid = auth.currentUser?.uid;

  const [totalProductos, setTotalProductos] = useState(0);
  const [totalGastadoMes, setTotalGastadoMes] = useState(0);
  const [bajoStock, setBajoStock] = useState(0);

  useEffect(() => {
    if (!uid) return;
    const productosRef = collection(db, "users", uid, "productos");

    const unsubscribe = onSnapshot(productosRef, (snapshot) => {
      let total = 0;
      let gastadoMes = 0;
      let bajos = 0;
      const hoy = new Date();
      const mesActual = hoy.getMonth();
      const anioActual = hoy.getFullYear();

      snapshot.forEach(doc => {
        const data = doc.data();
        const cantidad = data.cantidad || 0;
        const precio = data.precio_ingreso || 0;
        const fecha = data.fecha_ingreso ? new Date(data.fecha_ingreso) : null;

        total += cantidad;

        if (fecha && fecha.getMonth() === mesActual && fecha.getFullYear() === anioActual) {
          gastadoMes += cantidad * precio;
        }

        if (cantidad <= umbralStockBajo) {
          bajos += 1;
        }
      });

      setTotalProductos(total);
      setTotalGastadoMes(gastadoMes);
      setBajoStock(bajos);
    });

    return () => unsubscribe();
  }, [uid, umbralStockBajo]);

  return (
    <div className="card bg-light p-3">
      <h5 className="mb-3">📦 Resumen del Stock</h5>
      <p><strong>Total Productos:</strong> {totalProductos}</p>
      <p><strong>Gastado este mes:</strong> ${totalGastadoMes.toFixed(2)}</p>
      <p className={bajoStock > 0 ? "text-danger" : "text-success"}>
        <strong>Productos con bajo stock:</strong> {bajoStock}
      </p>
    </div>
  );
};

export default ResumenStock;
