import { useEffect, useState } from "react";
import { getFirestore, collection, getDocs, doc, getDoc, query, orderBy } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend } from "chart.js";
import { app } from "../../firebase/config";
import { Form, Spinner } from "react-bootstrap";

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

const EstadisticasProducto = () => {
  const db = getFirestore(app);
  const auth = getAuth();
  const uid = auth.currentUser?.uid;

  const [productos, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [gananciaEstimada, setGananciaEstimada] = useState(null);

  // 🔄 Cargar productos al iniciar
  useEffect(() => {
    const cargarProductos = async () => {
      const productosSnap = await getDocs(collection(db, `users/${uid}/productos`));
      const productosList = productosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProductos(productosList);
    };
    cargarProductos();
  }, []);

  // 🔄 Cargar historial de precios al cambiar de producto
  useEffect(() => {
    const cargarHistorial = async () => {
      if (!productoSeleccionado) return;
      setCargando(true);

      // 1. Obtener historial
      const historialRef = collection(db, `users/${uid}/productos/${productoSeleccionado.id}/historial_precios`);
      const historialSnap = await getDocs(query(historialRef, orderBy("fecha", "asc")));
      const historialData = historialSnap.docs.map(doc => doc.data());

      setHistorial(historialData);

      // 2. Calcular ganancia estimada
      const docProducto = await getDoc(doc(db, `users/${uid}/productos/${productoSeleccionado.id}`));
      const data = docProducto.data();
      const ganancia = (data.precio_venta - data.precio_ingreso) * data.cantidad;
      setGananciaEstimada(ganancia.toFixed(2));

      setCargando(false);
    };

    cargarHistorial();
  }, [productoSeleccionado]);

  // 📊 Datos para el gráfico
  const data = {
    labels: historial.map(h => new Date(h.fecha.toDate()).toLocaleDateString()),
    datasets: [
      {
        label: "Precio de Ingreso",
        data: historial.map(h => h.tipo === "ingreso" ? h.nuevo : null),
        borderColor: "blue",
        tension: 0.3,
        spanGaps: true
      },
      {
        label: "Precio de Venta",
        data: historial.map(h => h.tipo === "venta" ? h.nuevo : null),
        borderColor: "green",
        tension: 0.3,
        spanGaps: true
      }
    ]
  };

  return (
    <div className="container my-4">
      <h3>📊 Estadísticas de Producto</h3>

      <Form.Select
        onChange={e => {
          const seleccionado = productos.find(p => p.id === e.target.value);
          setProductoSeleccionado(seleccionado);
        }}
        defaultValue=""
      >
        <option value="" disabled>Seleccione un producto</option>
        {productos.map(p => (
          <option key={p.id} value={p.id}>{p.nombre} - {p.marca}</option>
        ))}
      </Form.Select>

      {cargando && <Spinner animation="border" className="mt-3" />}

      {!cargando && historial.length > 0 && (
        <>
          <div className="mt-4">
            <Line data={data} />
          </div>

          <div className="mt-3">
            <strong>💰 Ganancia estimada actual:</strong> ${gananciaEstimada}
          </div>
        </>
      )}
    </div>
  );
};

export default EstadisticasProducto;
