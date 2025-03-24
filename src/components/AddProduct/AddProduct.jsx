import { useState, useEffect } from "react";
import { getFirestore, collection, addDoc, getDocs, query, where, updateDoc, doc, setDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { app } from "../../firebase/config";
import "bootstrap/dist/css/bootstrap.min.css";

const AddProduct = () => {
    const [nombre, setNombre] = useState("");
    const [productosSugeridos, setProductosSugeridos] = useState([]);
    const [productoExistente, setProductoExistente] = useState(null);
    const [mostrarFormulario, setMostrarFormulario] = useState(false);
    const [nuevoTipo, setNuevoTipo] = useState("");
    const [tipos, setTipos] = useState([]);
    const [formData, setFormData] = useState({
        tipo: "",
        fecha_ingreso: "",
        precio_ingreso: "",
        local_compra: "",
        cantidad: "0",
        stock_recomendable: "",
    });

    const navigate = useNavigate();
    const db = getFirestore(app);
    const auth = getAuth();

    useEffect(() => {
        if (nombre.length > 1) {
            fetchSugerencias();
        } else {
            setProductosSugeridos([]);
        }
    }, [nombre]);

    useEffect(() => {
        fetchTipos();
    }, []);

    useEffect(() => {
        if (productosSugeridos.length > 0) {
            const timeoutId = setTimeout(() => {
                setProductosSugeridos([]);
            }, 2500); // 🔥 Ocultar después de 5 segundos

            return () => clearTimeout(timeoutId); // 🔄 Limpiar timeout si cambia la búsqueda
        }
    }, [productosSugeridos]);

    const fetchSugerencias = async () => {
        const user = auth.currentUser;
        if (!user) return;

        const userProductsRef = collection(db, "users", user.uid, "productos");
        const querySnapshot = await getDocs(userProductsRef);

        const filtro = nombre.toLowerCase();
        const sugerencias = querySnapshot.docs
            .map((doc) => ({ id: doc.id, ...doc.data() }))
            .filter((producto) => producto.nombre.toLowerCase().includes(filtro));

        setProductosSugeridos(sugerencias);
    };

    const fetchTipos = async () => {
        const user = auth.currentUser;
        if (!user) return;

        const userTypesRef = doc(db, "users", user.uid);
        const userDoc = await getDocs(collection(userTypesRef, "tipos"));

        const tiposArray = userDoc.docs.map((doc) => doc.data().nombre);
        setTipos([...tiposArray, "Otro"]);
    };

    const handleSelectProducto = (producto) => {
        setNombre(producto.nombre);
        setProductoExistente(producto);
        setMostrarFormulario(true);
        setProductosSugeridos([]);
    };

    const handleSearch = () => {
        if (productosSugeridos.length === 0) {
            setProductoExistente(null);
            setMostrarFormulario(true);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const user = auth.currentUser;
        if (!user) {
            alert("Usuario no autenticado.");
            return;
        }

        if (productoExistente) {
            const productRef = doc(db, "users", user.uid, "productos", productoExistente.id);
            await updateDoc(productRef, {
                fecha_ingreso: new Date(formData.fecha_ingreso),
                precio_ingreso: parseFloat(formData.precio_ingreso),
                local_compra: formData.local_compra,
                cantidad: productoExistente.cantidad + parseInt(formData.cantidad, 10),
            });

            alert("Producto actualizado exitosamente.");
        } else {
            const userProductsRef = collection(db, "users", user.uid, "productos");
            const tipoSeleccionado = formData.tipo === "Otro" ? nuevoTipo : formData.tipo;

            await addDoc(userProductsRef, {
                nombre,
                tipo: tipoSeleccionado,
                fecha_ingreso: new Date(formData.fecha_ingreso),
                precio_ingreso: parseFloat(formData.precio_ingreso),
                local_compra: formData.local_compra,
                cantidad: parseInt(formData.cantidad, 10),
                stock_recomendable: parseInt(formData.stock_recomendable, 10),
            });

            if (formData.tipo === "Otro") {
                const userTypesRef = doc(db, "users", user.uid, "tipos", nuevoTipo);
                await setDoc(userTypesRef, { nombre: nuevoTipo });

                setTipos((prev) => [...prev.filter((t) => t !== "Otro"), nuevoTipo, "Otro"]);
            }

            alert("Producto agregado exitosamente.");
        }

        setNombre("");
        setMostrarFormulario(false);
        setProductoExistente(null);
    };

    return (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh", backgroundColor: "#2c2c2c" }}>
            <div className="container d-flex flex-column align-items-center">
                <button className="btn btn-secondary position-absolute top-0 start-0 m-3" onClick={() => navigate(-1)}>
                    Volver
                </button>

                <div className="card p-4 shadow-lg w-50">
                    <h2 className="text-center mb-4">Agregar Producto</h2>

                    <div className="mb-3 position-relative">
                        <label className="form-label">Buscar Producto:</label>
                        <input
                            type="text"
                            className="form-control"
                            value={nombre}
                            onChange={(e) => setNombre(e.target.value)}
                            required
                        />
                        {productosSugeridos.length > 0 && (
                            <ul className="list-group position-absolute w-100 mt-1" style={{ zIndex: 1000 }}>
                                {productosSugeridos.map((producto) => (
                                    <li
                                        key={producto.id}
                                        className="list-group-item list-group-item-action"
                                        onClick={() => handleSelectProducto(producto)}
                                        style={{ cursor: "pointer" }}
                                    >
                                        {producto.nombre}
                                    </li>
                                ))}
                            </ul>
                        )}
                        <button className="btn btn-primary mt-2 w-100" onClick={handleSearch}>
                            Buscar / Agregar
                        </button>
                    </div>

                    {mostrarFormulario && (
                        <form onSubmit={handleSubmit}>
                            {productoExistente ? (
                                <>
                                    <p><strong>Producto encontrado:</strong> {productoExistente.nombre}</p>
                                    <div className="mb-3">
                                        <label className="form-label">Fecha de Ingreso:</label>
                                        <input type="date" className="form-control" name="fecha_ingreso" value={formData.fecha_ingreso} onChange={handleChange} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Precio de Ingreso:</label>
                                        <input type="number" className="form-control" name="precio_ingreso" value={formData.precio_ingreso} onChange={handleChange} min="0" step="0.01" required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Local de Compra:</label>
                                        <input type="text" className="form-control" name="local_compra" value={formData.local_compra} onChange={handleChange} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Cantidad Comprada:</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            name="cantidad"
                                            value={formData.cantidad}
                                            onChange={handleChange}
                                            min="0"  // ✅ Ahora permite cantidad 0
                                            required
                                        />

                                    </div>
                                </>
                            ) : (
                                <>
                                    <p><strong>Producto NO encontrado, ingresarlo:</strong></p>
                                    <div className="mb-3">
                                        <label className="form-label">Tipo:</label>
                                        <select className="form-control" name="tipo" value={formData.tipo} onChange={handleChange} required>
                                            <option value="">Seleccionar</option>
                                            {tipos.map((tipo) => (
                                                <option key={tipo} value={tipo}>{tipo}</option>
                                            ))}
                                        </select>
                                    </div>
                                    {formData.tipo === "Otro" && (
                                        <div className="mb-3">
                                            <label className="form-label">Nuevo Tipo:</label>
                                            <input type="text" className="form-control" value={nuevoTipo} onChange={(e) => setNuevoTipo(e.target.value)} required />
                                        </div>
                                    )}
                                    <div className="mb-3">
                                        <label className="form-label">Fecha de Ingreso:</label>
                                        <input type="date" className="form-control" name="fecha_ingreso" value={formData.fecha_ingreso} onChange={handleChange} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Precio de Ingreso:</label>
                                        <input type="number" className="form-control" name="precio_ingreso" value={formData.precio_ingreso} onChange={handleChange} min="0" step="0.01" required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Local de Compra:</label>
                                        <input type="text" className="form-control" name="local_compra" value={formData.local_compra} onChange={handleChange} required />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Cantidad:</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            name="cantidad"
                                            value={formData.cantidad}
                                            onChange={handleChange}
                                            min="0"  // ✅ Ahora permite cantidad 0
                                            required
                                        />

                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Stock Recomendable:</label>
                                        <input type="number" className="form-control" name="stock_recomendable" value={formData.stock_recomendable} onChange={handleChange} min="0" required />
                                    </div>
                                </>
                            )}

                            <button type="submit" className="btn btn-success w-100 mt-3">Guardar Producto</button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddProduct;
