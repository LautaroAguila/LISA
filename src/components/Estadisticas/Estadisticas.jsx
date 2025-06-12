import { useEffect, useState } from "react";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { app } from "../../firebase/config";
import NavBar from "../NavBar/NavBar";
import ChartBar from "../ChartBar/ChartBar";
import { Form, Spinner } from "react-bootstrap";
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(LineElement, PointElement, CategoryScale, LinearScale, Tooltip, Legend);

const Estadisticas = () => {
  const [productos, setProductos] = useState([]);
  const [gastosPorMes, setGastosPorMes] = useState({});
  const [productosPorMes, setProductosPorMes] = useState({});
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [gananciaEstimada, setGananciaEstimada] = useState(null);
  const [cargandoHistorial, setCargandoHistorial] = useState(false);

  const db = getFirestore(app);
  const auth = getAuth();
  const uid = auth.currentUser?.uid;

  useEffect(() => {
    const obtenerProductos = async () => {
      const productosRef = collection(db, "users", uid, "productos");
      const snap = await getDocs(productosRef);
      const productosData = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setProductos(productosData);

      const gastos = {};
      const productosMes = {};

      productosData.forEach((p) => {
        const fecha = p.fecha_ingreso?.split("T")[0] || "";
        const mes = fecha.slice(0, 7); // "YYYY-MM"
        const gasto = p.precio_ingreso * p.cantidad;

        if (!gastos[mes]) gastos[mes] = 0;
        if (!productosMes[mes]) productosMes[mes] = 0;

        gastos[mes] += gasto;
        productosMes[mes] += p.cantidad;
      });

      setGastosPorMes(gastos);
      setProductosPorMes(productosMes);
    };

    obtenerProductos();
  }, [uid]);

  useEffect(() => {
    const cargarHistorial = async () => {
      if (!productoSeleccionado) return;
      setCargandoHistorial(true);

      const historialRef = collection(db, `users/${uid}/productos/${productoSeleccionado.id}/historial_precios`);
      const historialSnap = await getDocs(query(historialRef, orderBy("fecha", "asc")));
      const historialData = historialSnap.docs.map((doc) => doc.data());

      setHistorial(historialData);

      const docProducto = await getDoc(doc(db, `users/${uid}/productos/${productoSeleccionado.id}`));
      const data = docProducto.data();
      const ganancia = (data.precio_venta - data.precio_ingreso) * data.cantidad;
      setGananciaEstimada(ganancia.toFixed(2));

      setCargandoHistorial(false);
    };

    cargarHistorial();
  }, [productoSeleccionado]);

  const dataHistorial = {
    labels: historial.map(h => new Date(h.fecha).toLocaleDateString()),
    datasets: [
      {
        label: "Precio Ingreso",
        data: historial.map(h => h.tipo === "ingreso" ? h.nuevo : null),
        borderColor: "blue",
        spanGaps: true,
        tension: 0.3,
      },
      {
        label: "Precio Venta",
        data: historial.map(h => h.tipo === "venta" ? h.nuevo : null),
        borderColor: "green",
        spanGaps: true,
        tension: 0.3,
      }
    ]
  };

  return (
    <>
      <NavBar />
      <div className="container mt-4">
        <h2 className="mb-4">📊 Estadísticas</h2>

        <div className="row mb-4">
          <div className="col-md-4">
            <div className="card text-white bg-primary mb-3">
              <div className="card-header">Total productos</div>
              <div className="card-body">
                <h5 className="card-title">{productos.length}</h5>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card text-white bg-success mb-3">
              <div className="card-header">Stock bajo</div>
              <div className="card-body">
                <h5 className="card-title">
                  {productos.filter(p => p.cantidad <= (p.stock_recomendable || 5)).length}
                </h5>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card text-white bg-warning mb-3">
              <div className="card-header">Stock alto</div>
              <div className="card-body">
                <h5 className="card-title">
                  {productos.filter(p => p.cantidad > (p.stock_recomendable || 5)).length}
                </h5>
              </div>
            </div>
          </div>
        </div>

        {/* Gráficos por mes */}
        <div className="row">
          <div className="col-md-6 mb-4">
            <h5>🗓️ Productos ingresados por mes</h5>
            <ChartBar
              data={productosPorMes}
              label="Cantidad de productos"
              title="Productos por mes"
              color="rgba(75, 192, 192, 0.6)"
            />
          </div>
          <div className="col-md-6 mb-4">
            <h5>💰 Total gastado por mes</h5>
            <ChartBar
              data={gastosPorMes}
              label="Total gastado ($)"
              title="Gasto mensual"
              color="rgba(255, 99, 132, 0.6)"
            />
          </div>
        </div>

        {/* Sección de producto y gráfico de precios */}
        <div className="mt-5">
          <h4>📈 Evolución de precios de un producto</h4>
          <Form.Select
            className="mb-3"
            onChange={(e) => {
              const seleccionado = productos.find(p => p.id === e.target.value);
              setProductoSeleccionado(seleccionado);
            }}
            defaultValue=""
          >
            <option value="" disabled>Seleccionar producto</option>
            {productos.map(p => (
              <option key={p.id} value={p.id}>{p.nombre} - {p.marca}</option>
            ))}
          </Form.Select>

          {cargandoHistorial && <Spinner animation="border" />}

          {!cargandoHistorial && historial.length > 0 && (
            <>
              <Line data={dataHistorial} />
              <p className="mt-3"><strong>💰 Ganancia estimada:</strong> ${gananciaEstimada}</p>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Estadisticas;
