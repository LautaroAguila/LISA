import { useState, useEffect } from "react";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { app } from "../../firebase/config";
import { useNavigate } from "react-router-dom";
import Spinner from "../../components/Spinner/Spinner";
import "bootstrap/dist/css/bootstrap.min.css";

const StockList = () => {
    const [productos, setProductos] = useState([]);
    const [orden, setOrden] = useState({ campo: "nombre", asc: true });
    const [tipoFiltro, setTipoFiltro] = useState("");
    const [loading, setLoading] = useState(true); // 🔄 Estado de carga

    const navigate = useNavigate();
    const db = getFirestore(app);
    const auth = getAuth();

    useEffect(() => {
        const fetchProductos = async () => {
            try {
                const user = auth.currentUser;
                if (!user) return;

                const productosRef = collection(db, "users", user.uid, "productos");
                const querySnapshot = await getDocs(productosRef);
                const listaProductos = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                setProductos(listaProductos);
            } catch (error) {
                console.error("❌ Error al obtener productos:", error);
            } finally {
                setLoading(false); // 🔄 Desactivar spinner cuando termine la carga
            }
        };

        fetchProductos();
    }, [auth]);

    const handleOrdenar = (campo) => {
        setOrden((prev) => ({
            campo,
            asc: prev.campo === campo ? !prev.asc : true
        }));
    };

    const handleEliminar = async (id) => {
        const confirmar = window.confirm("¿Estás seguro de que quieres eliminar este producto?");
        if (!confirmar) return;

        const user = auth.currentUser;
        if (!user) return;

        await deleteDoc(doc(db, "users", user.uid, "productos", id));

        setProductos((prevProductos) => prevProductos.filter(prod => prod.id !== id));
        alert("Producto eliminado correctamente.");
    };

    const handleBack = () => {
        navigate(-1);
    };

    const productosFiltrados = productos
        .filter(prod => tipoFiltro === "" || prod.tipo === tipoFiltro)
        .sort((a, b) => {
            if (a[orden.campo] < b[orden.campo]) return orden.asc ? -1 : 1;
            if (a[orden.campo] > b[orden.campo]) return orden.asc ? 1 : -1;
            return 0;
        });

    if (loading) return <Spinner />; // 🔄 Muestra el Spinner mientras carga

    return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: "100vh", backgroundColor: "#2c2c2c", color: "white", padding: "20px" }}>
            <div className="container">
                <button className="btn btn-secondary position-absolute top-0 start-0 m-3" onClick={handleBack}>
                    Volver
                </button>

                <h2 className="mb-4 text-center">Lista de Stock</h2>

                {/* Filtro por tipo */}
                <div className="mb-3">
                    <label className="form-label">Filtrar por tipo:</label>
                    <select className="form-control" value={tipoFiltro} onChange={(e) => setTipoFiltro(e.target.value)}>
                        <option value="">Todos</option>
                        {[...new Set(productos.map(prod => prod.tipo))].map(tipo => (
                            <option key={tipo} value={tipo}>{tipo}</option>
                        ))}
                    </select>
                </div>

                {/* Tabla de productos */}
                {productos.length === 0 ? (
                    <p className="text-center">No hay productos en stock.</p>
                ) : (
                    <table className="table table-dark table-hover">
                        <thead>
                            <tr>
                                <th onClick={() => handleOrdenar("nombre")} style={{ cursor: "pointer" }}>
                                    Producto {orden.campo === "nombre" ? (orden.asc ? "↑" : "↓") : ""}
                                </th>
                                <th onClick={() => handleOrdenar("tipo")} style={{ cursor: "pointer" }}>
                                    Tipo {orden.campo === "tipo" ? (orden.asc ? "↑" : "↓") : ""}
                                </th>
                                <th onClick={() => handleOrdenar("cantidad")} style={{ cursor: "pointer" }}>
                                    Cantidad {orden.campo === "cantidad" ? (orden.asc ? "↑" : "↓") : ""}
                                </th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {productosFiltrados.map(producto => (
                                <tr key={producto.id}>
                                    <td>{producto.nombre}</td>
                                    <td>{producto.tipo}</td>
                                    <td>{producto.cantidad}</td>
                                    <td>
                                        <button className="btn btn-danger btn-sm" onClick={() => handleEliminar(producto.id)}>
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default StockList;
