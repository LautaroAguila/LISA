import { useEffect, useState } from "react";
import { db } from "../../firebase/config";
import { collection, getDocs, getDoc, doc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import "bootstrap/dist/css/bootstrap.min.css";
import Spinner from "../../components/Spinner/Spinner";
import NavBar from "../NavBar/NavBar";

const ListBuy = () => {
    const [productos, setProductos] = useState([]);
    const [planUsuario, setPlanUsuario] = useState("gratis");
    const [loading, setLoading] = useState(true);
    const [filtroTipo, setFiltroTipo] = useState("");
    const [filtroMarca, setFiltroMarca] = useState("");
    const [filtroProveedor, setFiltroProveedor] = useState("");
    const auth = getAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const user = auth.currentUser;
                if (!user) return;

                const productosRef = collection(db, "users", user.uid, "productos");
                const querySnapshot = await getDocs(productosRef);
                const listaProductos = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                const productosFiltrados = listaProductos.filter(prod =>
                    (prod.stock_actual ?? prod.cantidad) < prod.stock_recomendable
                );
                setProductos(productosFiltrados);

                const userRef = doc(db, "users", user.uid);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    setPlanUsuario(userSnap.data().plan || "gratis");
                }

            } catch (error) {
                console.error("❌ Error al obtener productos o plan:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [auth]);

    const filtrarProductos = () => {
        return productos.filter(p =>
            (filtroTipo === "" || p.tipo === filtroTipo) &&
            (filtroMarca === "" || p.marca === filtroMarca) &&
            (filtroProveedor === "" || p.proveedor === filtroProveedor)
        );
    };

    const productosFiltrados = filtrarProductos();

    const productosPorTipo = productosFiltrados.reduce((acc, producto) => {
        const tipo = producto.tipo || "Sin Categoría";
        if (!acc[tipo]) acc[tipo] = [];
        acc[tipo].push(producto);
        return acc;
    }, {});

    const descargarPDF = () => {
        const docPDF = new jsPDF();
        docPDF.text("Lista de Productos a Comprar", 14, 10);

        let startY = 20;
        Object.keys(productosPorTipo).forEach((tipo) => {
            docPDF.text(tipo, 14, startY);
            startY += 10;

            autoTable(docPDF, {
                startY,
                head: [["Producto", "Actual", "Recomendado", "A Comprar"]],
                body: productosPorTipo[tipo].map(p => {
                    const actual = p.stock_actual ?? p.cantidad;
                    const recomendado = p.stock_recomendable;
                    const comprar = Math.max(recomendado - actual, 0);
                    return [p.nombre, actual, recomendado, comprar];
                }),
                theme: "grid",
                styles: { fontSize: 10 },
                margin: { left: 14, right: 14 },
            });

            startY = docPDF.lastAutoTable.finalY + 10;
        });

        // Agregar fecha actual al nombre del archivo
        const hoy = new Date();
        const fechaStr = hoy.toISOString().split("T")[0]; // formato YYYY-MM-DD
        docPDF.save(`Lista_Compra_${fechaStr}.pdf`);
    };

    if (loading) return <><NavBar /><Spinner /></>;

    return (
        <>
            <NavBar />
            <div className="d-flex justify-content-center align-items-start" style={{ minHeight: "100vh", paddingTop: "40px", paddingBottom: "40px" }}>
                <div className="container card-container">
                    <h2 className="text-center section-title">
                        🛒 Lista de Productos a Comprar
                    </h2>

                    {productos.length === 0 ? (
                        <p className="text-center fs-5 mt-4 text-muted">No hay productos por comprar.</p>
                    ) : (
                        <>
                            {/* Filtros */}
                            <div className="row mb-3 mt-4">
                                <div className="col-md-4 mb-2">
                                    <select className="form-select" value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}>
                                        <option value="">Filtrar por Tipo</option>
                                        {[...new Set(productos.map(p => p.tipo))].filter(Boolean).map(tipo => (
                                            <option key={tipo} value={tipo}>{tipo}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-4 mb-2">
                                    <select className="form-select" value={filtroMarca} onChange={e => setFiltroMarca(e.target.value)}>
                                        <option value="">Filtrar por Marca</option>
                                        {[...new Set(productos.map(p => p.marca))].filter(Boolean).map(marca => (
                                            <option key={marca} value={marca}>{marca}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="col-md-4 mb-2">
                                    <select className="form-select" value={filtroProveedor} onChange={e => setFiltroProveedor(e.target.value)}>
                                        <option value="">Filtrar por Proveedor</option>
                                        {[...new Set(productos.map(p => p.proveedor))].filter(Boolean).map(prov => (
                                            <option key={prov} value={prov}>{prov}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {(filtroTipo || filtroMarca || filtroProveedor) && (
                                <div className="text-center mb-4">
                                    <button
                                        className="btn btn-outline-secondary"
                                        onClick={() => {
                                            setFiltroTipo("");
                                            setFiltroMarca("");
                                            setFiltroProveedor("");
                                        }}
                                    >
                                        ❌ Quitar Filtros
                                    </button>
                                </div>
                            )}

                            {/* Tablas agrupadas */}
                            <div className="table-responsive">
                                {Object.keys(productosPorTipo).map((tipo) => (
                                    <div key={tipo} className="mb-5">
                                        <h4 className="text-center section-subtitle border-bottom pb-2 mb-3">
                                            {tipo}
                                        </h4>
                                        <table className="table table-light table-hover rounded overflow-hidden">
                                            <thead className="table-dark">
                                                <tr>
                                                    <th>🧾 Producto</th>
                                                    <th>📦 Cantidad Actual</th>
                                                    <th>🎯 Stock Recomendado</th>
                                                    <th>🛍️ A Comprar</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {productosPorTipo[tipo].map((producto) => {
                                                    const actual = producto.stock_actual ?? producto.cantidad;
                                                    const recomendado = producto.stock_recomendable;
                                                    const comprar = Math.max(recomendado - actual, 0);
                                                    return (
                                                        <tr key={producto.id}>
                                                            <td>{producto.nombre}</td>
                                                            <td>{actual}</td>
                                                            <td>{recomendado}</td>
                                                            <td>{comprar}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                ))}
                            </div>

                            {/* Botón PDF */}
                            <div className="text-center mt-4">
                                {planUsuario === "premium" ? (
                                    <button className="btn btn-success btn-lg shadow" onClick={descargarPDF}>
                                        📥 Descargar PDF
                                    </button>
                                ) : (
                                    <>
                                        <button className="btn btn-secondary btn-lg shadow" disabled>
                                            🔒 Solo disponible en plan Premium
                                        </button>
                                        <p className="mt-2 text-muted">
                                            Para descargar la lista en PDF, pasate al <strong>Plan Premium</strong> desde tu perfil.
                                        </p>
                                    </>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default ListBuy;
