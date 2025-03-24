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
    const [busqueda, setBusqueda] = useState("");  
    const [cantidadConsumida, setCantidadConsumida] = useState({});
    const [loading, setLoading] = useState(true);

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
                setLoading(false);
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

    const productosFiltrados = productos.filter(prod =>
        (tipoFiltro === "" || prod.tipo === tipoFiltro) &&
        (busqueda === "" || prod.nombre.toLowerCase().includes(busqueda.toLowerCase()))
    );

    if (loading) return <Spinner />;

    return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh", backgroundColor: "#2c2c2c", color: "white", padding: "20px" }}>
            <div className="container">
                <button className="btn btn-secondary position-absolute top-0 start-0 m-3" onClick={handleBack}>
                    Volver
                </button>

                <h2 className="mb-4 text-center fw-bold">📉 Consumir Producto</h2>

                <div className="row mb-3">
                    <div className="col-md-6">
                        <label className="form-label">Filtrar por tipo:</label>
                        <select 
                            className="form-select bg-dark text-white border-light"
                            value={tipoFiltro} 
                            onChange={(e) => setTipoFiltro(e.target.value)}
                        >
                            <option value="">Todos</option>
                            {tipos.map(tipo => (
                                <option key={tipo} value={tipo}>{tipo}</option>
                            ))}
                        </select>
                    </div>

                    <div className="col-md-6">
                        <label className="form-label">Buscar producto:</label>
                        <input
                            type="text"
                            className="form-control bg-dark text-white border-light"
                            placeholder="🔍 Escribe el nombre..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </div>
                </div>

                {productosFiltrados.length === 0 ? (
                    <p className="text-center mt-4">⚠ No hay productos disponibles.</p>
                ) : (
                    <ul className="list-group">
                        {productosFiltrados.map(producto => (
                            <li key={producto.id}
                                className="list-group-item d-flex justify-content-between align-items-center bg-dark text-white mb-2 rounded-3 shadow-sm"
                                style={{ cursor: "pointer", transition: "0.3s" }}
                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#505050"}
                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = "#6c757d"}
                            >
                                <span onClick={() => handleConsumoChange(producto.id, cantidadConsumida[producto.id] || "")}>
                                    {producto.nombre} - <b>Stock:</b> {producto.cantidad}
                                </span>

                                {cantidadConsumida[producto.id] !== undefined && (
                                    <div className="d-flex">
                                        <input
                                            type="number"
                                            className="form-control me-2 bg-white text-black border-light"
                                            placeholder="Cantidad"
                                            value={cantidadConsumida[producto.id]}
                                            onChange={(e) => handleConsumoChange(producto.id, e.target.value)}
                                            min="1"
                                            max={producto.cantidad}
                                            style={{ width: "110px" }}
                                        />
                                        <button 
                                            className="btn btn-danger px-3 fw-bold"
                                            onClick={() => handleConsumoSubmit(producto.id, producto.cantidad)}
                                        >
                                            ❌ Consumir
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
