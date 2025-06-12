import { useState, useEffect } from "react";
import { getFirestore, doc, updateDoc, setDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { app } from "../../firebase/config";

const EditProductModal = ({ show, handleClose, product, updateProductList }) => {
    const [nombre, setNombre] = useState("");
    const [cantidad, setCantidad] = useState(0);
    const [marca, setMarca] = useState("");
    const [proveedor, setProveedor] = useState("");
    const [precioVenta, setPrecioVenta] = useState(0);
    const [stockMinimo, setStockMinimo] = useState(0);
    const [fechaVencimiento, setFechaVencimiento] = useState("");
    const [tipo, setTipo] = useState("");
    const [codigoBarras, setCodigoBarras] = useState("");

    const db = getFirestore(app);
    const auth = getAuth();

    useEffect(() => {
        if (product) {
            setNombre(product.nombre || "");
            setCantidad(product.cantidad || 0);
            setMarca(product.marca || "");
            setProveedor(product.proveedor || "");
            setPrecioVenta(product.precio_venta || 0);
            setStockMinimo(product.stock_minimo || 0);
            setFechaVencimiento(product.fecha_vencimiento || "");
            setTipo(product.tipo || "");
            setCodigoBarras(product.codigo_barras || "");
        }
    }, [product]);

    const handleSave = async () => {
        const user = auth.currentUser;
        if (!user) return;

        const productRef = doc(db, "users", user.uid, "productos", product.id);
        const updatedData = {
            nombre,
            cantidad: Number(cantidad),
            marca,
            proveedor,
            precio_venta: Number(precioVenta),
            stock_minimo: Number(stockMinimo),
            fecha_vencimiento: fechaVencimiento,
            tipo,
            codigo_barras: codigoBarras
        };

        // 👉 Verificar cambio en precio_venta
        const precioAnterior = product.precio_venta;
        const nuevoPrecio = updatedData.precio_venta;

        if (precioAnterior !== nuevoPrecio) {
            const historialRef = doc(
                db,
                "users",
                user.uid,
                "productos",
                product.id,
                "historial_precios",
                `${Date.now()}_venta`
            );
            await setDoc(historialRef, {
                tipo: "venta",
                anterior: precioAnterior,
                nuevo: nuevoPrecio,
                fecha: new Date().toISOString(),
                usuario: user.email || "desconocido"
            });
        }

        await updateDoc(productRef, updatedData);
        updateProductList(product.id, updatedData);
        handleClose();
    };


    if (!show) return null;

    return (
        <div
            className="modal show d-block"
            tabIndex="-1"
            style={{
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                backdropFilter: "blur(3px)",
            }}
        >
            <div className="modal-dialog modal-lg modal-dialog-centered">
                <div className="modal-content shadow" style={{ border: "1px solid var(--color-primario)", borderRadius: "12px" }}>
                    <div className="modal-header" style={{ backgroundColor: "var(--color-primario)", color: "#fff" }}>
                        <h5 className="modal-title">✏️ Editar Producto</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={handleClose}></button>
                    </div>
    
                    <div className="modal-body" style={{ backgroundColor: "var(--color-fondo-claro)" }}>
                        <div className="row">
                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-bold">📛 Nombre</label>
                                <input type="text" className="form-control" value={nombre} onChange={(e) => setNombre(e.target.value)} />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-bold">📦 Cantidad</label>
                                <input type="number" className="form-control" value={cantidad} onChange={(e) => setCantidad(e.target.value)} />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-bold">🏷️ Marca</label>
                                <input type="text" className="form-control" value={marca} onChange={(e) => setMarca(e.target.value)} />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-bold">🚚 Proveedor</label>
                                <input type="text" className="form-control" value={proveedor} onChange={(e) => setProveedor(e.target.value)} />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-bold">💲 Precio de Venta</label>
                                <input type="number" className="form-control" value={precioVenta} onChange={(e) => setPrecioVenta(e.target.value)} />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-bold">⚠️ Stock Mínimo</label>
                                <input type="number" className="form-control" value={stockMinimo} onChange={(e) => setStockMinimo(e.target.value)} />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-bold">📅 Fecha de Vencimiento</label>
                                <input type="date" className="form-control" value={fechaVencimiento} onChange={(e) => setFechaVencimiento(e.target.value)} />
                            </div>
                            <div className="col-md-6 mb-3">
                                <label className="form-label fw-bold">📂 Tipo</label>
                                <input type="text" className="form-control" value={tipo} onChange={(e) => setTipo(e.target.value)} />
                            </div>
                            <div className="col-12 mb-3">
                                <label className="form-label fw-bold">📎 Código de Barras</label>
                                <input type="text" className="form-control" value={codigoBarras} onChange={(e) => setCodigoBarras(e.target.value)} />
                            </div>
                        </div>
                    </div>
    
                    <div className="modal-footer" style={{ backgroundColor: "var(--color-fondo-oscuro)" }}>
                        <button className="btn btn-secondary" onClick={handleClose}>❌ Cancelar</button>
                        <button className="btn btn-success" onClick={handleSave}>💾 Guardar Cambios</button>
                    </div>
                </div>
            </div>
        </div>
    );
    
};

export default EditProductModal;
