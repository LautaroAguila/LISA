import { useState, useEffect, useMemo } from "react";
import { getFirestore, collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { Card, Row, Col, Modal, Button, Form } from "react-bootstrap";
import { app } from "../../firebase/config";
import NavBar from "../NavBar/NavBar";
import Spinner from "../Spinner/Spinner";

const Gallery = () => {
  const db = getFirestore(app);
  const auth = getAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [productos, setProductos] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [descripcion, setDescripcion] = useState("");
  const [editandoDescripcion, setEditandoDescripcion] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState("");
  const [filtroMarca, setFiltroMarca] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchProductos = async () => {
      if (!user) return;
      try {
        const productosRef = collection(db, "users", user.uid, "productos");
        const snapshot = await getDocs(productosRef);
        const productosData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setProductos(productosData);
      } catch (error) {
        console.error("❌ Error al obtener productos:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProductos();
  }, [user]);

  const tiposUnicos = useMemo(() => [...new Set(productos.map(p => p.tipo).filter(Boolean))], [productos]);
  const marcasUnicos = useMemo(() => [...new Set(productos.map(p => p.marca).filter(Boolean))], [productos]);

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
    setProductos(prev => prev.map(p => (p.id === actualizado.id ? actualizado : p)));
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

  if (loading) return <><NavBar /><Spinner /></>;

  return (
    <>
      <NavBar />

      {/* Botón de filtros solo en mobile */}
      <div className="d-lg-none text-center my-3">
        <Button variant="dark" onClick={() => setMostrarFiltros(true)}>🔍 Filtros</Button>
      </div>

      <div className="d-flex flex-column flex-lg-row w-100" style={{ height: "100vh", overflow: "hidden" }}>
        {/* Sidebar en desktop */}
        <div className="d-none d-lg-block col-lg-3 sidebar-filtros bg-white text-dark">
          <div className="p-3 h-100 border-end">
            

            <Form.Group className="mb-3">
              <Form.Label className="text-dark">Tipo</Form.Label>
              <Form.Select
                value={filtroTipo}
                onChange={(e) => setFiltroTipo(e.target.value)}
                className="form-select form-select-sm"
              >
                <option value="">Todos</option>
                {tiposUnicos.map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="text-dark">Marca</Form.Label>
              <Form.Select
                value={filtroMarca}
                onChange={(e) => setFiltroMarca(e.target.value)}
                className="form-select form-select-sm"
              >
                <option value="">Todas</option>
                {marcasUnicos.map(marca => (
                  <option key={marca} value={marca}>{marca}</option>
                ))}
              </Form.Select>
            </Form.Group>

            <Button variant="outline-dark" className="mt-2 w-100" onClick={() => {
              setFiltroMarca("");
              setFiltroTipo("");
              setBusqueda("");
            }}>
              Limpiar Filtros
            </Button>
          </div>
        </div>

        {/* Zona principal con scroll */}
        <div className="col overflow-auto p-4" style={{ flexGrow: 1 }}>
          <div className="mb-4" style={{ maxWidth: "400px", position: "relative" }}>
            <Form.Label className="fw-bold mb-2">Buscar por nombre o código</Form.Label>
            <Form.Control
              type="text"
              placeholder="🔍 Ej: crema o 779..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="busqueda-input"
            />
          </div>

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
                    <Card.Title className="text-truncate fw-semibold">{producto.nombre}</Card.Title>
                    <div className="mb-2">
                      <span className="badge bg-info text-dark me-2">{producto.marca ?? "Sin marca"}</span>
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

          {productosFiltrados.length === 0 && (
            <p className="text-center text-muted mt-4">🕵️‍♂️ No se encontraron productos con los filtros aplicados.</p>
          )}
        </div>
      </div>

      {/* Modal para ver detalle */}
      <Modal show={mostrarModal} onHide={handleCerrarModal} centered size="lg">
        <Modal.Header closeButton className="bg-dark text-light">
          <Modal.Title>{productoSeleccionado?.nombre}</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-light px-4 py-3 text-center">
          {productoSeleccionado?.imagen && (
            <img
              src={productoSeleccionado.imagen}
              alt={productoSeleccionado.nombre}
              className="img-fluid rounded shadow-sm mb-3"
              style={{ maxHeight: "280px", objectFit: "contain" }}
            />
          )}

          <div className="text-start">
            <p><strong>💲 Precio:</strong> ${productoSeleccionado?.precio_venta ?? "—"}</p>
            <p><strong>📦 Stock:</strong> {productoSeleccionado?.cantidad ?? 0}</p>
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
                <Button
                  variant="success"
                  className="mt-3"
                  onClick={handleGuardarDescripcion}
                  disabled={descripcion === productoSeleccionado?.descripcion}
                >
                  💾 Guardar
                </Button>
              </>
            ) : (
              <>
                <p><strong>📝 Descripción:</strong> {productoSeleccionado?.descripcion || "Sin descripción"}</p>
                <Button variant="outline-secondary" onClick={() => setEditandoDescripcion(true)}>✏️ Editar Descripción</Button>
              </>
            )}
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCerrarModal}>Cerrar</Button>
        </Modal.Footer>
      </Modal>

      {/* Modal de filtros para móviles */}
      <Modal show={mostrarFiltros} onHide={() => setMostrarFiltros(false)} fullscreen animation={true}>
        <Modal.Header closeButton className="bg-dark text-light">
          <Modal.Title>🔍 Filtros</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-light">
          <Form.Group className="mb-3">
            <Form.Label>Tipo</Form.Label>
            <Form.Select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="form-select form-select-sm"
            >
              <option value="">Todos</option>
              {tiposUnicos.map(tipo => (
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
              {marcasUnicos.map(marca => (
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
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Gallery;
