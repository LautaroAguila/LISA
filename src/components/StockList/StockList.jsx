import { useState, useEffect } from "react";
import { getFirestore, collection, getDocs, deleteDoc, doc, updateDoc, setDoc, serverTimestamp  } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { Link } from "react-router-dom";
import { app } from "../../firebase/config";
import { Alert, Button, Modal } from "react-bootstrap";
import Spinner from "../../components/Spinner/Spinner";
import "bootstrap/dist/css/bootstrap.min.css";
import { FaTrash, FaEdit } from "react-icons/fa";
import EditProductModal from "./EditProductModal"; // ✅ Importamos el modal
import NavBar from "../NavBar/NavBar";
import ProductDetail from "../ProductDetail/ProductDetail";
import ResumenStock from "../ResumenStock/ResumenStock";
import BienvenidaTour from "../BienvenidaTour/BienvenidaTour";
import './StockList.css'

const StockList = () => {
    const [productos, setProductos] = useState([]);
    const [selectedProducts, setSelectedProducts] = useState(new Set());
    const [orden, setOrden] = useState({ campo: "nombre", asc: true });
    const [tipoFiltro, setTipoFiltro] = useState("");
    const [marcaFiltro, setMarcaFiltro] = useState("");
    const [proveedorFiltro, setProveedorFiltro] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(true);
    const [productoEditar, setProductoEditar] = useState(null); // ✅ Nuevo estado para el modal
    const [umbralStockBajo, setUmbralStockBajo] = useState(3); // Valor por defecto
    const db = getFirestore(app);
    const auth = getAuth();
    const [productoSeleccionado, setProductoSeleccionado] = useState(null);
    const [mostrarModal, setMostrarModal] = useState(false);
    const [productoAConsumir, setProductoAConsumir] = useState(null);
    const [cantidadAConsumir, setCantidadAConsumir] = useState("");
    const UMBRAL_VENCIMIENTO_DIAS = 7;
    const [mostrarAvisoVencimiento, setMostrarAvisoVencimiento] = useState(false);
    const [mostrarModalFiltros, setMostrarModalFiltros] = useState(false);


    const generarNotificaciones = async (productos, umbralStockBajo) => {
        const user = auth.currentUser;
        if (!user) return;

        const hoy = new Date();
        const notificacionesRef = collection(db, "users", user.uid, "notificaciones");

        for (const producto of productos) {
            // Notificación por stock bajo
            if (producto.cantidad < umbralStockBajo) {
                await setDoc(doc(notificacionesRef, `stock-${producto.id}`), {
                    tipo: "stock_bajo",
                    productoId: producto.id,
                    nombreProducto: producto.nombre,
                    mensaje: `El producto "${producto.nombre}" tiene poco stock.`,
                    leida: false,
                    timestamp: serverTimestamp(),
                });
            }

            // Notificación por vencimiento próximo
            const fechaVenc = producto.fecha_vencimiento?.toDate?.() ?? new Date(producto.fecha_vencimiento);
            if (fechaVenc && (fechaVenc - hoy) / (1000 * 60 * 60 * 24) <= UMBRAL_VENCIMIENTO_DIAS) {
                await setDoc(doc(notificacionesRef, `vencimiento-${producto.id}`), {
                    tipo: "vencimiento_proximo",
                    productoId: producto.id,
                    nombreProducto: producto.nombre,
                    mensaje: `El producto "${producto.nombre}" vence pronto.`,
                    leida: false,
                    timestamp: serverTimestamp(),
                });
            }
        }
    };

    useEffect(() => {
        const aviso = localStorage.getItem("mostrarAvisoVencimiento");
        if (aviso === "true") {
            setMostrarAvisoVencimiento(true);
            localStorage.removeItem("mostrarAvisoVencimiento");
        }
        const fetchData = async () => {
            try {
                const user = auth.currentUser;
                if (!user) return;

                const db = getFirestore(app);

                // Obtener datos del usuario
                const userDoc = await getDocs(collection(db, "users"));
                const userData = userDoc.docs.find(doc => doc.id === user.uid)?.data();
                if (userData?.stock_bajo_umbral) {
                    setUmbralStockBajo(userData.stock_bajo_umbral);
                }

                // Obtener productos
                const productosRef = collection(db, "users", user.uid, "productos");
                const querySnapshot = await getDocs(productosRef);
                const listaProductos = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

                setProductos(listaProductos);
                generarNotificaciones(listaProductos, userData?.stock_bajo_umbral ?? 3);
            } catch (error) {
                console.error("❌ Error al obtener datos:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleOrdenar = (campo) => {
        setOrden((prev) => ({
            campo,
            asc: prev.campo === campo ? !prev.asc : true
        }));
    };

    const handleToggleSelect = (id) => {
        setSelectedProducts((prevSelected) => {
            const newSelected = new Set(prevSelected);
            newSelected.has(id) ? newSelected.delete(id) : newSelected.add(id);
            return newSelected;
        });
    };

    const handleEliminar = async (id) => {
        const confirmar = window.confirm("¿Eliminar este producto?");
        if (!confirmar) return;

        const user = auth.currentUser;
        if (!user) return;

        await deleteDoc(doc(db, "users", user.uid, "productos", id));
        setProductos((prevProductos) => prevProductos.filter(prod => prod.id !== id));
    };

    const handleEditar = (producto) => {
        setProductoEditar(producto); // ✅ Se abre el modal con el producto seleccionado
    };

    const updateProductList = (id, updatedData) => {
        setProductos(prev => prev.map(prod => (prod.id === id ? { ...prod, ...updatedData } : prod)));
    };

    const productosFiltrados = productos
        .filter(prod => 
            (tipoFiltro === "" || prod.tipo === tipoFiltro) &&
            (marcaFiltro === "" || prod.marca === marcaFiltro) &&
            (proveedorFiltro === "" || prod.proveedor === proveedorFiltro) &&
            (searchTerm === "" || (prod.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            prod.codigo_barras?.toString().includes(searchTerm)))
        )
        .sort((a, b) => {
            if (a[orden.campo] < b[orden.campo]) return orden.asc ? -1 : 1;
            if (a[orden.campo] > b[orden.campo]) return orden.asc ? 1 : -1;
            return 0;
        });

    const productosAgrupados = productosFiltrados.reduce((acc, producto) => {
        if (!acc[producto.tipo]) acc[producto.tipo] = [];
        acc[producto.tipo].push(producto);
        return acc;
    }, {});

    const handleAbrirModal = (producto) => {
        setMostrarModal(true);
        setProductoSeleccionado({ ...producto }); // En handleAbrirModal

    };

    const handleUpdateProducto = (productoActualizado) => {
        setProductos((prevProductos) =>
            prevProductos.map((p) =>
                p.id === productoActualizado.id ? productoActualizado : p
            )
            );
        
            // 🔁 Actualizá también el producto que está en el modal
            setProductoSeleccionado(productoActualizado);
        };
        
    
    const handleAbrirConsumo = (producto) => {
        setProductoAConsumir(producto);
        setCantidadAConsumir("");
    };
    
    const handleCerrarConsumo = () => {
        setProductoAConsumir(null);
        setCantidadAConsumir("");
    };
    
    const handleConfirmarConsumo = async () => {
        const cantidad = parseInt(cantidadAConsumir, 10);
    
        if (isNaN(cantidad) || cantidad <= 0) {
            alert("Ingrese una cantidad válida.");
            return;
        }
    
        if (cantidad > productoAConsumir.cantidad) {
            alert("No puedes consumir más de lo que hay en stock.");
            return;
        }
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) return;
        const db = getFirestore(app);
        const productoRef = doc(db, "users", user.uid, "productos", productoAConsumir.id);
        await updateDoc(productoRef, {
            cantidad: productoAConsumir.cantidad - cantidad,
        });
        // Actualiza lista local
        setProductos(prev =>
            prev.map(prod =>
                prod.id === productoAConsumir.id
                ? { ...prod, cantidad: prod.cantidad - cantidad }
                : prod
            )
        );
        alert("✅ Consumo registrado.");
        handleCerrarConsumo();
    };

    if (loading) return <><NavBar/>  <Spinner/> </>;

    return (
    <>
      <NavBar id="navbar" />
      <BienvenidaTour />

      {mostrarAvisoVencimiento && (
        <div className="container mt-4">
          <Alert variant="warning" className="text-center fw-bold">
            ⚠️ Tu suscripción Premium vence pronto. Renovala desde tu perfil para
            no perder los beneficios.
          </Alert>
        </div>
      )}

      <div
        className="container-fluid text-dark"
        style={{
          backgroundColor: "var(--color-fondo-claro)",
          minHeight: "100vh",
          paddingTop: "10px",
        }}
      >
        {/* Botón filtros para móviles */}
        <div className="d-md-none text-center my-3">
          <Button
            variant="dark"
            className="btn-filtros-movil"
            onClick={() => setMostrarModalFiltros(true)}
            >
            🧰 Filtros
            </Button>

        </div>

        <div className="row g-0" style={{ height: "calc(100vh - 80px)" }}>
          {/* Filtros: desktop */}
          <div
            className="col-md-2 d-none d-md-block p-3 border-end overflow-auto"
            style={{ height: "100vh", position: "sticky", top: "80px" }}
          >
            <h4 style={{ color: "var(--color-primario)" }}>Filtros</h4>

            <div className="mb-4">
              <label className="form-label">📌 Tipo de Producto:</label>
              <select
                className="form-select"
                value={tipoFiltro}
                onChange={(e) => setTipoFiltro(e.target.value)}
              >
                <option value="">Todos</option>
                {[...new Set(productos.map((prod) => prod.tipo))].map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="form-label">📌 Marca:</label>
              <select
                className="form-select"
                value={marcaFiltro}
                onChange={(e) => setMarcaFiltro(e.target.value)}
              >
                <option value="">Todos</option>
                {[...new Set(productos.map((prod) => prod.marca))].map((marca) => (
                  <option key={marca} value={marca}>
                    {marca}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="form-label">📌 Proveedor:</label>
              <select
                className="form-select"
                value={proveedorFiltro}
                onChange={(e) => setProveedorFiltro(e.target.value)}
              >
                <option value="">Todos</option>
                {[...new Set(productos.map((prod) => prod.proveedor))].map(
                  (p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  )
                )}
              </select>
            </div>

            <Button
              variant="outline-dark"
              className="mt-3 w-100"
              onClick={() => {
                setMarcaFiltro("");
                setProveedorFiltro("");
                setTipoFiltro("");
              }}
            >
              Limpiar Filtros
            </Button>
          </div>

          {/* Contenido principal: lista y buscador */}
          <div className="col-md-8 p-4 " style={{ height: "100vh" }}>
            {/* Aquí va tu título, buscador y tabla como tenías */}

            {/* Buscador */}
            <h2
              className="text-center mb-4"
              style={{ color: "var(--color-primario)" }}
              id="buscador-producto"
            >
              LISA STOCK
            </h2>
            <div
              className="mb-4 position-relative"
              id="buscador-producto"
              style={{ maxWidth: "400px", margin: "0 auto" }}
            >
              
              <input
                type="text"
                className="form-control search-input ps-5"
                placeholder="Escribí el nombre o código..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span
                className="search-icon position-absolute text-muted"
                style={{ top: "50%", left: "15px", transform: "translateY(-50%)" }}
              >
                🔍
              </span>
            </div>

            {/* Aquí tu código para mostrar productos agrupados por tipo */}
            {Object.keys(productosAgrupados).map((tipo) => (
              <div key={tipo} className="mb-5">
                <h4
                  className="text-center"
                  style={{
                    color: "var(--color-secundario)",
                    borderBottom: "1px solid var(--color-borde-claro)",
                    paddingBottom: "5px",
                  }}
                >
                  {tipo}
                </h4>

                <div className="table-responsive">
                  <table
                    className="table table-striped table-bordered text-center align-middle"
                    id="tabla-stock"
                  >
                    <thead className="table-light">
                      <tr>
                        <th
                          onClick={() => handleOrdenar("nombre")}
                          style={{ cursor: "pointer" }}
                        >
                          Producto {orden.campo === "nombre" ? (orden.asc ? "↑" : "↓") : ""}
                        </th>
                        <th
                          onClick={() => handleOrdenar("cantidad")}
                          style={{ cursor: "pointer" }}
                        >
                          Cantidad {orden.campo === "cantidad" ? (orden.asc ? "↑" : "↓") : ""}
                        </th>
                        <th>Marca</th>
                        <th>Proveedor</th>
                        <th>Precio</th>
                        <th>Vencimiento</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productosAgrupados[tipo].map((producto) => (
                        <tr key={producto.id}>
                          <td
                            style={{
                              cursor: "pointer",
                              color: "var(--color-primario)",
                              textDecoration: "underline",
                            }}
                            onClick={() => handleAbrirModal(producto)}
                          >
                            {producto.nombre}
                          </td>
                          <td>{producto.cantidad}</td>
                          <td>{producto.marca ?? "—"}</td>
                          <td>{producto.proveedor ?? "—"}</td>
                          <td>${producto.precio_venta ?? "—"}</td>
                          <td>{producto.fecha_vencimiento ?? "—"}</td>
                          <td>
                            <div className="acciones-botones">
                                <button className="btn btn-sm btn-outline-primary" onClick={() => handleEditar(producto)}>
                                <FaEdit />
                                </button>
                                <button className="btn btn-sm btn-outline-danger" onClick={() => handleEliminar(producto.id)}>
                                <FaTrash />
                                </button>
                                <button className="btn btn-sm btn-outline-dark" onClick={() => handleAbrirConsumo(producto)}>
                                🔽
                                </button>
                            </div>
                          </td>

                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
            {/* Modales, etc. */}
            {productoEditar && (
              <EditProductModal
                show={!!productoEditar}
                handleClose={() => setProductoEditar(null)}
                product={productoEditar}
                updateProductList={updateProductList}
              />
            )}

            {productoSeleccionado && (
              <ProductDetail
                show={mostrarModal}
                onClose={() => setMostrarModal(false)}
                producto={productoSeleccionado}
                onUpdateProducto={handleUpdateProducto}
              />
            )}

            {/* Modal consumo */}
            {productoAConsumir && (
              <div
                className="modal show d-block"
                tabIndex="-1"
                style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
              >
                <div className="modal-dialog">
                  <div className="modal-content border-dark shadow-lg">
                    <div className="modal-header bg-warning">
                      <h5 className="modal-title fw-bold text-dark">📉 Consumir producto</h5>
                      <button type="button" className="btn-close" onClick={handleCerrarConsumo}></button>
                    </div>
                    <div className="modal-body">
                      <p className="fw-bold">
                        Producto: <span className="text-primary">{productoAConsumir.nombre}</span>
                      </p>
                      <p>Stock actual: <strong>{productoAConsumir.cantidad}</strong></p>

                      <label className="form-label">Cantidad a consumir:</label>
                      <input
                        type="number"
                        className="form-control"
                        value={cantidadAConsumir}
                        onChange={(e) => setCantidadAConsumir(e.target.value)}
                        min="1"
                        max={productoAConsumir.cantidad}
                      />
                    </div>
                    <div className="modal-footer">
                      <button className="btn btn-secondary" onClick={handleCerrarConsumo}>
                        Cancelar
                      </button>
                      <button className="btn btn-danger" onClick={handleConfirmarConsumo}>
                        Consumir
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Resumen de stock */}
          <div className="col-md-2 d-none d-md-block" id="resumen-stock">
            <ResumenStock umbralStockBajo={umbralStockBajo} />
          </div>
        </div>
      </div>

      {/* Modal filtros para móvil */}
      <Modal
        show={mostrarModalFiltros}
        onHide={() => setMostrarModalFiltros(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Filtros</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div>
            <div className="mb-4">
              <label className="form-label">📌 Tipo de Producto:</label>
              <select
                className="form-select"
                value={tipoFiltro}
                onChange={(e) => setTipoFiltro(e.target.value)}
              >
                <option value="">Todos</option>
                {[...new Set(productos.map((prod) => prod.tipo))].map((tipo) => (
                  <option key={tipo} value={tipo}>
                    {tipo}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="form-label">📌 Marca:</label>
              <select
                className="form-select"
                value={marcaFiltro}
                onChange={(e) => setMarcaFiltro(e.target.value)}
              >
                <option value="">Todos</option>
                {[...new Set(productos.map((prod) => prod.marca))].map((marca) => (
                  <option key={marca} value={marca}>
                    {marca}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="form-label">📌 Proveedor:</label>
              <select
                className="form-select"
                value={proveedorFiltro}
                onChange={(e) => setProveedorFiltro(e.target.value)}
              >
                <option value="">Todos</option>
                {[...new Set(productos.map((prod) => prod.proveedor))].map(
                  (p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  )
                )}
              </select>
            </div>

            <Button
              variant="outline-dark"
              className="w-100"
              onClick={() => {
                setMarcaFiltro("");
                setProveedorFiltro("");
                setTipoFiltro("");
              }}
            >
              Limpiar Filtros
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </>
  );
    };
    
    export default StockList;

    