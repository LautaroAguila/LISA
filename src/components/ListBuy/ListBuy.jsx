import { useEffect, useState } from "react";
import { db } from "../../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import "bootstrap/dist/css/bootstrap.min.css";
import Spinner from "../../components/Spinner/Spinner";
import NavBar from "../NavBar/NavBar";

const ListBuy = () => {
    const [productos, setProductos] = useState([]);
    const auth = getAuth();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

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
            } catch (error) {
                console.error("❌ Error al obtener productos:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [auth]);

    const productosPorTipo = productos.reduce((acc, producto) => {
        const tipo = producto.tipo || "Sin Categoría"; 
        if (!acc[tipo]) acc[tipo] = [];
        acc[tipo].push(producto);
        return acc;
    }, {});

    const descargarPDF = () => {
        const doc = new jsPDF();
        doc.text("Lista de Productos a Comprar", 14, 10);

        let startY = 20;
        Object.keys(productosPorTipo).forEach((tipo) => {
            doc.text(tipo, 14, startY);
            startY += 10;

            autoTable(doc, {
                startY,
                head: [["Producto", "Cantidad Actual", "Stock Recomendado"]],
                body: productosPorTipo[tipo].map(producto => [
                    producto.nombre, 
                    producto.stock_actual ?? producto.cantidad, 
                    producto.stock_recomendable
                ]),
                theme: "grid",
                styles: { fontSize: 10 },
                margin: { left: 14, right: 14 },
            });

            startY = doc.lastAutoTable.finalY + 10;
        });

        doc.save("Lista_Compra.pdf");
    };

    if (loading) return <><NavBar/><Spinner/></>;

    return (
        <>
        <NavBar/>
        <div className="d-flex justify-content-center align-items-start" style={{ minHeight: "100vh", paddingTop: "40px", paddingBottom: "40px" }}>
            <div className="container card-container">
                <h2 className="text-center section-title">
                🛒 Lista de Productos a Comprar
                </h2>

                {productos.length === 0 ? (
                <p className="text-center fs-5 mt-4 text-muted">No hay productos por comprar.</p>
                ) : (
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
                            </tr>
                        </thead>
                        <tbody>
                            {productosPorTipo[tipo].map((producto) => (
                            <tr key={producto.id}>
                                <td>{producto.nombre}</td>
                                <td>{producto.stock_actual ?? producto.cantidad}</td>
                                <td>{producto.stock_recomendable}</td>
                            </tr>
                            ))}
                        </tbody>
                        </table>
                    </div>
                    ))}
                </div>
                )}

                {productos.length > 0 && (
                <div className="text-center mt-4">
                    <button className="btn btn-success btn-lg shadow">
                    📥 Descargar PDF
                    </button>
                </div>
                )}
            </div>
        </div>

        </>
    );
};

export default ListBuy;
