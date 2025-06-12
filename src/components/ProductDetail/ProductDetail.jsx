import { useState, useEffect } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { getFirestore, doc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { app } from "../../firebase/config";

const ProductDetail = ({ show, onClose, producto, onUpdateProducto }) => {
    const db = getFirestore(app);
    const auth = getAuth();
    const user = auth.currentUser;

    const [imagenBase64, setImagenBase64] = useState("");

    useEffect(() => {
        if (producto?.imagen) {
        setImagenBase64(producto.imagen);
        } else {
        setImagenBase64(""); // Limpiar si no hay imagen
        }
    }, [producto]);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
        setImagenBase64(reader.result);
        };
        reader.readAsDataURL(file);
    };

    const handleSaveImage = async () => {
        if (!user || !producto?.id) return;

        const productoRef = doc(db, "users", user.uid, "productos", producto.id);
        await updateDoc(productoRef, { imagen: imagenBase64 });

        onUpdateProducto({ ...producto, imagen: imagenBase64 }); // actualizar en el frontend
        onClose(); // cerrar modal
    };

    if (!producto) return null;

    return (
        <Modal show={show} onHide={onClose} size="lg" centered>
            <Modal.Header closeButton style={{ backgroundColor: "var(--color-primario)", color: "#fff" }}>
                <Modal.Title>📝 Detalle del Producto</Modal.Title>
            </Modal.Header>
    
            <Modal.Body style={{ backgroundColor: "var(--color-fondo-claro)", color: "var(--color-texto)" }}>
                {/* Imagen del producto */}
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
    
                {/* Información detallada */}
                <div className="px-3">
                    <h5 className="fw-bold mb-3 border-bottom pb-2">📌 {producto.nombre}</h5>
                    <div className="row">
                        <div className="col-md-6 mb-2"><strong>🧩 Tipo:</strong> {producto.tipo || "—"}</div>
                        <div className="col-md-6 mb-2"><strong>🏢 Proveedor:</strong> {producto.proveedor || "—"}</div>
                        <div className="col-md-6 mb-2"><strong>📅 Ingreso:</strong> {producto.fecha_ingreso?.toDate?.().toLocaleDateString() || "—"}</div>
                        <div className="col-md-6 mb-2">
                            {producto.fecha_vencimiento && (
                                <><strong>⏳ Vencimiento:</strong> {producto.fecha_vencimiento.toDate?.().toLocaleDateString()}</>
                            )}
                        </div>
                        <div className="col-md-6 mb-2"><strong>💵 Precio Ingreso:</strong> ${producto.precio_ingreso || "—"}</div>
                        <div className="col-md-6 mb-2"><strong>💲 Precio Venta:</strong> ${producto.precio_venta || "—"}</div>
                        <div className="col-md-6 mb-2"><strong>📦 Cantidad:</strong> {producto.cantidad}</div>
                        <div className="col-md-6 mb-2"><strong>✅ Stock Recomendable:</strong> {producto.stock_recomendable}</div>
                        <div className="col-md-6 mb-2"><strong>🔢 Código de Barras:</strong> {producto.codigo_barras || "—"}</div>
                        <div className="col-md-6 mb-2"><strong>🏷️ Marca:</strong> {producto.marca || "—"}</div>
                    </div>
                </div>
    
                {/* Subida de imagen */}
                <Form.Group controlId="formImagen" className="mt-4">
                    <Form.Label className="fw-bold">🖼️ Subir nueva imagen</Form.Label>
                    <Form.Control type="file" accept="image/*" onChange={handleFileChange} />
                </Form.Group>
    
                <div className="d-flex justify-content-end mt-3">
                    <Button variant="success" onClick={handleSaveImage} className="shadow">
                        💾 Guardar imagen
                    </Button>
                </div>
            </Modal.Body>
    
            <Modal.Footer style={{ backgroundColor: "var(--color-fondo-oscuro)" }}>
                <Button variant="secondary" onClick={onClose}>Cerrar</Button>
            </Modal.Footer>
        </Modal>
    );
    
};

export default ProductDetail;
