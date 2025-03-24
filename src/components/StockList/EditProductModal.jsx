import { useState } from "react";
import { getFirestore, doc, updateDoc } from "firebase/firestore";
import { app } from "../../firebase/config";
import { getAuth } from "firebase/auth";
import "bootstrap/dist/css/bootstrap.min.css";

const EditProductModal = ({ show, handleClose, product, updateProductList }) => {
    const [tipo, setTipo] = useState(product.tipo || "");
    const [fechaIngreso, setFechaIngreso] = useState(product.fecha_ingreso || "");
    const [precioIngreso, setPrecioIngreso] = useState(product.precio_ingreso || "");
    const [localCompra, setLocalCompra] = useState(product.local_compra || "");
    const [cantidad, setCantidad] = useState(product.cantidad || "");
    const [stockRecomendable, setStockRecomendable] = useState(product.stock_recomendable || "");

    const db = getFirestore(app);
    const auth = getAuth();

    const handleSave = async () => {
        try {
            const user = auth.currentUser;
            if (!user) return;

            const productRef = doc(db, "users", user.uid, "productos", product.id);
            const updatedProduct = {
                tipo,
                fecha_ingreso: fechaIngreso,
                precio_ingreso: Number(precioIngreso),
                local_compra: localCompra,
                cantidad: Number(cantidad),
                stock_recomendable: Number(stockRecomendable)
            };

            await updateDoc(productRef, updatedProduct);
            updateProductList(product.id, updatedProduct);
            handleClose();
        } catch (error) {
            console.error("❌ Error al actualizar producto:", error);
        }
    };

    if (!show) return null;

    return (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
            <div className="modal-dialog">
                <div className="modal-content border-black shadow-lg">
                    <div className="modal-header bg-secondary text-white">
                        <h5 className="modal-title">✏️ Editar Producto</h5>
                        <button type="button" className="btn-close btn-close-white" onClick={handleClose}></button>
                    </div>
                    <div className="modal-body">
                        {/* Tipo */}
                        <div className="mb-3 text-black">
                            <label className="form-label fw-bold">📂 Tipo de Producto</label>
                            <input type="text" className="form-control form-control-lg" value={tipo} onChange={(e) => setTipo(e.target.value)} />
                        </div>

                        {/* Fecha de Ingreso */}
                        <div className="mb-3 text-black">
                            <label className="form-label fw-bold">📅 Fecha de Ingreso</label>
                            <input type="date" className="form-control form-control-lg" value={fechaIngreso} onChange={(e) => setFechaIngreso(e.target.value)} />
                        </div>

                        {/* Precio de Ingreso */}
                        <div className="mb-3 text-black">
                            <label className="form-label fw-bold">💲 Precio de Ingreso</label>
                            <input type="number" className="form-control form-control-lg" value={precioIngreso} onChange={(e) => setPrecioIngreso(e.target.value)} />
                        </div>

                        {/* Local de Compra */}
                        <div className="mb-3 text-black">
                            <label className="form-label fw-bold">🛒 Local de Compra</label>
                            <input type="text" className="form-control form-control-lg" value={localCompra} onChange={(e) => setLocalCompra(e.target.value)} />
                        </div>

                        {/* Cantidad */}
                        <div className="mb-3 text-black">
                            <label className="form-label fw-bold">📦 Cantidad</label>
                            <input type="number" className="form-control form-control-lg" value={cantidad} onChange={(e) => setCantidad(e.target.value)} />
                        </div>

                        {/* Stock Recomendable */}
                        <div className="mb-3 text-black">
                            <label className="form-label fw-bold">⚠️ Stock Recomendable</label>
                            <input type="number" className="form-control form-control-lg" value={stockRecomendable} onChange={(e) => setStockRecomendable(e.target.value)} />
                        </div>
                    </div>
                    
                    <div className="modal-footer">
                        <button className="btn btn-secondary" onClick={handleClose}>❌ Cancelar</button>
                        <button className="btn btn-success" onClick={handleSave}>💾 Guardar Cambios</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditProductModal;
