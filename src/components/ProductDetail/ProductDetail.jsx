import { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { getFirestore, doc, updateDoc, collection, getDocs } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { app } from "../../firebase/config";
import { PencilSquare, XCircle, Image, Upload } from "react-bootstrap-icons";

import {
  FaEdit,
  FaTimesCircle,
  FaImage,
  FaUpload,
  FaIndustry,
  FaBoxOpen,
  FaCalendarAlt,
  FaBarcode,
  FaTags,
  FaStore,
  FaDollarSign,
  FaCheckCircle,
  FaBoxes
} from "react-icons/fa";

const ProductDetail = ({ show, onClose, producto, onUpdateProducto }) => {
    const db = getFirestore(app);
    const auth = getAuth();
    const user = auth.currentUser;

    const [imagenBase64, setImagenBase64] = useState("");
    const [tipos, setTipos] = useState([]);
    const [marcas, setMarcas] = useState([]);
    const [proveedores, setProveedores] = useState([]);
    const [productoEditado, setProductoEditado] = useState(null);

    useEffect(() => {
        const fetchOpciones = async () => {
            if (!user) return;

            const [tipoSnap, marcaSnap, proveedorSnap] = await Promise.all([
                getDocs(collection(db, "users", user.uid, "tipos")),
                getDocs(collection(db, "users", user.uid, "marcas")),
                getDocs(collection(db, "users", user.uid, "proveedores")),
            ]);

            setTipos(tipoSnap.docs.map(doc => doc.id));
            setMarcas(marcaSnap.docs.map(doc => doc.id));
            setProveedores(proveedorSnap.docs.map(doc => doc.id));
        };

        fetchOpciones();
    }, [user]);

    useEffect(() => {
        if (producto) {
            setImagenBase64(producto.imagen || "");
            setProductoEditado({
                ...producto,
                fecha_vencimiento: producto.fecha_vencimiento?.toDate?.().toISOString().split("T")[0] || "",
            });
        }
    }, [producto]);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => setImagenBase64(reader.result);
        reader.readAsDataURL(file);
    };

    const handleSaveImage = async () => {
        if (!user || !producto?.id) return;

        const ref = doc(db, "users", user.uid, "productos", producto.id);
        await updateDoc(ref, { imagen: imagenBase64 });

        onUpdateProducto({ ...producto, imagen: imagenBase64 });
        onClose();
    };

    const handleChange = (campo, valor) => {
        setProductoEditado(prev => ({ ...prev, [campo]: valor }));
    };

    const handleSaveChanges = async () => {
        if (!user || !producto?.id) return;

        const ref = doc(db, "users", user.uid, "productos", producto.id);
        await updateDoc(ref, {
            tipo: productoEditado.tipo,
            marca: productoEditado.marca,
            proveedor: productoEditado.proveedor,
            fecha_vencimiento: productoEditado.fecha_vencimiento,
        });

        onUpdateProducto({ ...producto, ...productoEditado });
        onClose();
    };

    if (!productoEditado) return null;

    return (
        <Modal show={show} onHide={onClose} size="lg" centered>
            <Modal.Header closeButton style={{ backgroundColor: "var(--color-primario)", color: "#fff" }}>
                <Modal.Title><FaEdit className="me-2" />Detalle del Producto</Modal.Title>
            </Modal.Header>

            <Modal.Body style={{ backgroundColor: "var(--color-fondo-claro)", color: "var(--color-texto)" }}>
                {imagenBase64 && (
                    <div className="text-center mb-4">
                        <img
                            src={imagenBase64}
                            alt="Producto"
                            className="img-fluid rounded border shadow-sm"
                            style={{ maxHeight: "300px", objectFit: "contain", backgroundColor: "#fff" }}
                        />
                    </div>
                )}

                <div className="px-2">
                    <h5 className="fw-bold border-bottom pb-2 mb-3">{producto.nombre}</h5>
                    <div className="row">
                        <div className="col-12 col-md-6 mb-2">
                            <Form.Label><FaTags className="me-2"/><strong>Tipo</strong></Form.Label>
                            <Form.Select
                                value={productoEditado.tipo || ""}
                                onChange={(e) => handleChange("tipo", e.target.value)}
                            >
                                <option value="">Seleccionar</option>
                                {tipos.map(t => <option key={t}>{t}</option>)}
                            </Form.Select>
                        </div>
                        <div className="col-12 col-md-6 mb-2">
                            <Form.Label><FaIndustry className="me-2"/><strong>Proveedor</strong></Form.Label>
                            <Form.Select
                                value={productoEditado.proveedor || ""}
                                onChange={(e) => handleChange("proveedor", e.target.value)}
                            >
                                <option value="">Seleccionar</option>
                                {proveedores.map(p => <option key={p}>{p}</option>)}
                            </Form.Select>
                        </div>
                        <div className="col-12 col-md-6 mb-2">
                            <Form.Label><FaStore className="me-2"/><strong>Marca</strong></Form.Label>
                            <Form.Select
                                value={productoEditado.marca || ""}
                                onChange={(e) => handleChange("marca", e.target.value)}
                            >
                                <option value="">Seleccionar</option>
                                {marcas.map(m => <option key={m}>{m}</option>)}
                            </Form.Select>
                        </div>
                        <div className="col-12 col-md-6 mb-2">
                            <FaCalendarAlt className="me-2"/><strong>Fecha Ingreso:</strong> {producto.fecha_ingreso?.toDate?.().toLocaleDateString() || "—"}
                        </div>
                        <div className="col-12 col-md-6 mb-2">
                            <Form.Label><FaCalendarAlt className="me-2"/><strong>Fecha Vencimiento</strong></Form.Label>
                            <Form.Control
                                type="date"
                                value={productoEditado.fecha_vencimiento || ""}
                                onChange={(e) => handleChange("fecha_vencimiento", e.target.value)}
                            />
                        </div>
                        <div className="col-12 col-md-6 mb-2">
                            <FaDollarSign className="me-2"/><strong>Precio Ingreso:</strong> ${producto.precio_ingreso ?? "—"}
                        </div>
                        <div className="col-12 col-md-6 mb-2">
                            <FaDollarSign className="me-2"/><strong>Precio Venta:</strong> ${producto.precio_venta ?? "—"}
                        </div>
                        <div className="col-12 col-md-6 mb-2"><FaBoxOpen className="me-2"/><strong>Cantidad:</strong> {producto.cantidad ?? "—"}</div>
                        <div className="col-12 col-md-6 mb-2"><FaBoxes className="me-2"/><strong>Stock Recom.:</strong> {producto.stock_recomendable ?? "—"}</div>
                        <div className="col-12 col-md-6 mb-2"><FaBarcode className="me-2"/><strong>Código de Barras:</strong> {producto.codigo_barras || "—"}</div>
                    </div>
                </div>

                <Form.Group controlId="formImagen" className="mt-4">
                    <Form.Label className="fw-bold"><FaImage className="me-2" />Subir nueva imagen</Form.Label>
                    <Form.Control type="file" accept="image/*" onChange={handleFileChange} className="form-control shadow-sm" />
                </Form.Group>

                <div className="d-flex justify-content-end mt-4 gap-2">
                    <Button variant="success" onClick={handleSaveImage} className="shadow-sm">
                        <FaUpload className="me-2" />Guardar Imagen
                    </Button>
                    <Button variant="primary" onClick={handleSaveChanges} className="shadow-sm">
                        <FaCheckCircle className="me-2" />Guardar Cambios
                    </Button>
                </div>
            </Modal.Body>

            <Modal.Footer style={{ backgroundColor: "var(--color-fondo-oscuro)" }}>
                <Button variant="secondary" onClick={onClose}><FaTimesCircle className="me-2"/>Cerrar</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ProductDetail;
