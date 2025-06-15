import { useState, useEffect } from "react";
import { getFirestore, collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { Card, Row, Col, Modal, Button, Form } from "react-bootstrap";
import { app } from "../../firebase/config";
import NavBar from "../NavBar/NavBar"; 
import Spinner from "../Spinner/Spinner";

const Gallery = () => {
    const db = getFirestore(app);
    const auth = getAuth();
    const user = auth.currentUser;
    const [loading, setLoading] = useState(true);
    const [productos, setProductos] = useState([]);
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [descripcion, setDescripcion] = useState("");
    const [editandoDescripcion, setEditandoDescripcion] = useState(false);
    const [filtroTipo, setFiltroTipo] = useState("");
    const [filtroMarca, setFiltroMarca] = useState("");
    const [busqueda, setBusqueda] = useState("");


    useEffect(() => {
        const fetchProductos = async () => {
            try{
                if (!user) return;
                const productosRef = collection(db, "users", user.uid, "productos");
                const snapshot = await getDocs(productosRef);
                const productosData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setProductos(productosData);
            }catch (error) {
                console.error("❌ Error al obtener productos:", error);
            } finally {
                setLoading(false);
            }
            
        };
        fetchProductos();
    }, [user]);

    const handleMostrarDetalle = (producto) => {
        setProductoSeleccionado(producto);
        setDescripcion(producto.descripcion || "");
        setEditandoDescripcion(false);
        setMostrarModal(true);
    };

    const handleGuardarDescripcion = async () => {
        if (!productoSeleccionado) return;
        const productoRef = doc(db, "users", user.uid, "productos", productoSeleccionado.id);
        await updateDoc(productoRef, { descripcion });
        const actualizado = { ...productoSeleccionado, descripcion };
        setProductoSeleccionado(actualizado);
        setProductos((prev) =>
            prev.map((p) => (p.id === actualizado.id ? actualizado : p))
        );
        setEditandoDescripcion(false);
    };

    const handleCerrarModal = () => {
        setProductoSeleccionado(null);
        setMostrarModal(false);
    };

    const productosFiltrados = productos.filter(p => {
        const coincideTipo = !filtroTipo || p.tipo === filtroTipo;
        const coincideMarca = !filtroMarca || p.marca === filtroMarca;
        const coincideBusqueda = !busqueda || 
            (p.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
            p.codigo_barras?.toString().includes(busqueda));
        return coincideTipo && coincideMarca && coincideBusqueda;
    });
    

    if (loading) return <><NavBar/>  <Spinner/> </>;

    return (
        <>
        <NavBar />
        <div className="d-flex" style={{ minHeight: "100vh" }}>
            {/* Panel de filtros */}
            <div className="p-3 border-end bg-dark text-light" style={{ width: "700px" }}>
                <h5 className="text-center mb-4">🔍 Filtros</h5>
                <Form.Group className="mb-3">
                    <Form.Label>Tipo</Form.Label>
                    <Form.Select
                        value={filtroTipo}
                        onChange={(e) => setFiltroTipo(e.target.value)}
                        className="form-select form-select-sm"
                    >
                        <option value="">Todos</option>
                        {[...new Set(productos.map(p => p.tipo).filter(Boolean))].map(tipo => (
                            <option key={tipo} value={tipo}>{tipo}</option>
                        ))}
                    </Form.Select>
                </Form.Group>
    
                <Form.Group className="mb-3">
                    <Form.Label>Marca</Form.Label>
                    <Form.Select
                        value={filtroMarca}
                        onChange={(e) => setFiltroMarca(e.target.value)}
                        className="form-select form-select-sm"
                    >
                        <option value="">Todas</option>
                        {[...new Set(productos.map(p => p.marca).filter(Boolean))].map(marca => (
                            <option key={marca} value={marca}>{marca}</option>
                        ))}
                    </Form.Select>
                </Form.Group>
    
                <Button variant="outline-light" className="mt-2 w-100" onClick={() => {
                    setFiltroMarca("");
                    setFiltroTipo("");
                    setBusqueda("");
                }}>
                    🧹 Limpiar Filtros
                </Button>
            </div>
    
            {/* Contenido principal */}
            <div className="flex-grow-1 p-4 bg-light">
                <Form.Group className="mb-4" style={{ maxWidth: "400px" }}>
                    <Form.Label className="fw-bold">Buscar por nombre o código</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Ej: crema o 779..."
                        value={busqueda}
                        onChange={(e) => setBusqueda(e.target.value)}
                        className="form-control-sm"
                    />
                </Form.Group>
    
                <h3 className="text-center mb-4 fw-bold">🛍️ Catálogo de Productos</h3>
                <Row xs={1} sm={2} md={3} lg={4} className="g-4">
                    {productosFiltrados.map(producto => (
                        <Col key={producto.id}>
                            <Card
                                onClick={() => handleMostrarDetalle(producto)}
                                className="shadow-sm border-0"
                                style={{ cursor: "pointer", borderRadius: "12px", transition: "transform 0.2s" }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = "scale(1.02)"}
                                onMouseLeave={(e) => e.currentTarget.style.transform = "scale(1)"}
                            >
                                {producto.imagen && (
                                    <Card.Img
                                        variant="top"
                                        src={producto.imagen}
                                        style={{
                                            height: "180px",
                                            objectFit: "cover",
                                            borderTopLeftRadius: "12px",
                                            borderTopRightRadius: "12px"
                                        }}
                                    />
                                )}
                                <Card.Body>
                                    <Card.Title className="text-truncate fw-semibold">
                                        {producto.nombre}
                                    </Card.Title>
    
                                    <div className="mb-2">
                                        <span className="badge bg-info text-dark me-2">
                                            {producto.marca ?? "Sin marca"}
                                        </span>
                                        <span className={`badge ${producto.cantidad > 0 ? "bg-success" : "bg-danger"}`}>
                                            {producto.cantidad > 0 ? `Stock: ${producto.cantidad}` : "Sin stock"}
                                        </span>
                                    </div>
    
                                    <Card.Text className="small">
                                        <strong>💲 Precio:</strong> ${producto.precio_venta ?? "—"}<br />
                                        <strong>🗓️ Vence:</strong> {producto.fecha_vencimiento ?? "—"}
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </div>
        </div>
    
        {/* Modal Detalle */}
        <Modal show={mostrarModal} onHide={handleCerrarModal} centered size="lg">
            <Modal.Header closeButton className="bg-dark text-light">
                <Modal.Title>{productoSeleccionado?.nombre}</Modal.Title>
            </Modal.Header>
            <Modal.Body className="text-center bg-light">
                {productoSeleccionado?.imagen && (
                    <img
                        src={productoSeleccionado.imagen}
                        alt={productoSeleccionado.nombre}
                        className="img-fluid rounded mb-3 shadow-sm"
                        style={{ maxHeight: "300px", objectFit: "contain" }}
                    />
                )}
                <p><strong>💲 Precio de venta:</strong> ${productoSeleccionado?.precio_venta ?? "—"}</p>
                <p><strong>📦 Stock disponible:</strong> {productoSeleccionado?.cantidad ?? 0}</p>
                <p><strong>🏷️ Marca:</strong> {productoSeleccionado?.marca ?? "—"}</p>
    
                {editandoDescripcion ? (
                    <>
                        <Form.Group>
                            <Form.Label className="fw-bold">📝 Descripción</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={descripcion}
                                onChange={(e) => setDescripcion(e.target.value)}
                            />
                        </Form.Group>
                        <Button variant="success" className="mt-3" onClick={handleGuardarDescripcion}>
                            💾 Guardar Descripción
                        </Button>
                    </>
                ) : (
                    <>
                        <p><strong>📝 Descripción:</strong> {productoSeleccionado?.descripcion || "Sin descripción"}</p>
                        <Button variant="outline-secondary" onClick={() => setEditandoDescripcion(true)}>
                            ✏️ Agregar / Editar Descripción
                        </Button>
                    </>
                )}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleCerrarModal}>Cerrar</Button>
            </Modal.Footer>
        </Modal>
    </>
    
    );
    
    
};

export default Gallery;
