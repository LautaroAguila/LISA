import { useState, useEffect } from "react";
import { getFirestore, collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { app } from "../../firebase/config";
import { useNavigate } from "react-router-dom";
import Spinner from "../../components/Spinner/Spinner";
import "bootstrap/dist/css/bootstrap.min.css";

const UseProduct = () => {
    const [productos, setProductos] = useState([]);
    const [tipos, setTipos] = useState([]);
    const [tipoFiltro, setTipoFiltro] = useState("");
    const [cantidadConsumida, setCantidadConsumida] = useState({});
    const [loading, setLoading] = useState(true); // 🔄 Estado de carga

    const navigate = useNavigate();
    const db = getFirestore(app);
    const auth = getAuth();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const user = auth.currentUser;
                if (!user) return;

                const productosRef = collection(db, "users", user.uid, "productos");
                const tiposRef = collection(db, "users", user.uid, "tipos");

                const [productosSnap, tiposSnap] = await Promise.all([
                    getDocs(productosRef),
                    getDocs(tiposRef)
                ]);

                const listaProductos = productosSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                const tiposArray = tiposSnap.docs.map(doc => doc.data().nombre);

                setProductos(listaProductos);
                setTipos(tiposArray);
            } catch (error) {
                console.error("❌ Error al obtener datos:", error);
            } finally {
                setLoading(false); // 🔄 Desactivar spinner cuando termine la carga
            }
        };

        fetchData();
    }, [auth]);

    const handleConsumoChange = (id, value) => {
        setCantidadConsumida(prev => ({
            ...prev,
            [id]: value
        }));
    };

    const handleConsumoSubmit = async (id, stockActual) => {
        const cantidad = parseInt(cantidadConsumida[id], 10);
        if (isNaN(cantidad) || cantidad <= 0) {
            alert("Ingrese una cantidad válida.");
            return;
        }

        if (cantidad > stockActual) {
            alert("No puedes consumir más de lo que tienes en stock.");
            return;
        }

        const user = auth.currentUser;
        if (!user) return;

        const productoRef = doc(db, "users", user.uid, "productos", id);
        await updateDoc(productoRef, {
            cantidad: stockActual - cantidad
        });

        setProductos(prevProductos =>
            prevProductos.map(prod =>
                prod.id === id ? { ...prod, cantidad: stockActual - cantidad } : prod
            )
        );

        setCantidadConsumida(prev => ({
            ...prev,
            [id]: ""
        }));

        alert("Consumo registrado exitosamente.");
    };

    const handleBack = () => {
        navigate(-1);
    };

    if (loading) return <Spinner />; // 🔄 Muestra el Spinner mientras carga

    return (
        <div className="d-flex justify-content-center align-items-center"
            style={{ height: "100vh", backgroundColor: "#2c2c2c", color: "white", padding: "20px" }}>
            <div className="container">
                <button className="btn btn-secondary position-absolute top-0 start-0 m-3" onClick={handleBack}>
                    Volver
                </button>

                <h2 className="mb-4 text-center">Consumir Producto</h2>

                {/* Filtro por tipo */}
                <div className="mb-3">
                    <label className="form-label">Filtrar por tipo:</label>
                    <select className="form-control" value={tipoFiltro} onChange={(e) => setTipoFiltro(e.target.value)}>
                        <option value="">Todos</option>
                        {tipos.map(tipo => (
                            <option key={tipo} value={tipo}>{tipo}</option>
                        ))}
                    </select>
                </div>

                {/* Lista de productos */}
                {productos.length === 0 ? (
                    <p className="text-center">No hay productos disponibles.</p>
                ) : (
                    <ul className="list-group">
                        {productos
                            .filter(prod => tipoFiltro === "" || prod.tipo === tipoFiltro)
                            .map(producto => (
                                <li key={producto.id}
                                    className="list-group-item d-flex justify-content-between align-items-center"
                                    style={{ cursor: "pointer" }}>
                                    <span onClick={() => handleConsumoChange(producto.id, cantidadConsumida[producto.id] || "")}>
                                        {producto.nombre} - Stock: {producto.cantidad}
                                    </span>

                                    {/* Input para ingresar cantidad consumida */}
                                    {cantidadConsumida[producto.id] !== undefined && (
                                        <div className="d-flex">
                                            <input
                                                type="number"
                                                className="form-control me-2"
                                                placeholder="Cantidad"
                                                value={cantidadConsumida[producto.id]}
                                                onChange={(e) => handleConsumoChange(producto.id, e.target.value)}
                                                min="1"
                                                max={producto.cantidad}
                                                style={{ width: "100px" }}
                                            />
                                            <button className="btn btn-danger"
                                                onClick={() => handleConsumoSubmit(producto.id, producto.cantidad)}>
                                                Consumir
                                            </button>
                                        </div>
                                    )}
                                </li>
                            ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default UseProduct;
