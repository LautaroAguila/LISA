import { useState, useEffect } from "react";
import { getFirestore, collection, doc, getDoc, getDocs, query, where, setDoc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { app } from "../../firebase/config";
import NavBar from "../NavBar/NavBar";
import PLANES from "../../utils/planes";

const AddProduct = () => {
    const db = getFirestore(app);
    const auth = getAuth();
    const uid = auth.currentUser?.uid;
    const user = auth.currentUser;

    const [modoBusqueda, setModoBusqueda] = useState("codigo_barras");
    const [busqueda, setBusqueda] = useState("");
    const [productoEncontrado, setProductoEncontrado] = useState(null);
    const [productosCoincidentes, setProductosCoincidentes] = useState([]);
    const [formulario, setFormulario] = useState({
        codigo_barras: "",
        nombre: "",
        marca: "",
        tipo: "",
        proveedor: "",
        cantidad: "",
        precio_ingreso: "",
        precio_venta: "",
        stock_recomendable: "",
        fecha_ingreso: "",
        fecha_vencimiento: ""
    });

    const [nuevaMarca, setNuevaMarca] = useState("");
    const [crearMarca, setCrearMarca] = useState(false);
    const [nuevoProveedor, setNuevoProveedor] = useState("");
    const [crearProveedor, setCrearProveedor] = useState(false);
    const [nuevoTipo, setNuevoTipo] = useState("");
    const [crearTipo, setCrearTipo] = useState(false);
    const [cargando, setCargando] = useState(false);
    const [mensaje, setMensaje] = useState("");


    const [listas, setListas] = useState({ marcas: [], tipos: [], proveedores: [] });

    const puedeAgregarProducto = async () => {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const plan = userDoc.data()?.plan || "gratis";
        const maxPermitidos = PLANES[plan].maxProductos;

        const productosRef = collection(db, `users/${user.uid}/productos`);
        const snapshot = await getDocs(productosRef);
        const cantidadActual = snapshot.size;

        return cantidadActual < maxPermitidos;
    };

    // 🔄 Cargar listas existentes (marcas, tipos, proveedores)
    useEffect(() => {
        const cargarListas = async () => {
        const marcas = await getDocs(collection(db, "users", uid, "marcas"));
        const tipos = await getDocs(collection(db, "users", uid, "tipos"));
        const proveedores = await getDocs(collection(db, "users", uid, "proveedores"));
        setListas({
            marcas: marcas.docs.map(d => d.id),
            tipos: tipos.docs.map(d => d.id),
            proveedores: proveedores.docs.map(d => d.id),
        });
        };
        cargarListas();
    }, []);

    // 🔍 Buscar producto por código o nombre + marca
    const buscarProducto = async () => {
        setCargando(true);
        setMensaje("Buscando producto...");
        const productosRef = collection(db, "users", uid, "productos");
        let resultado = null;
      
        if (modoBusqueda === "codigo_barras") {
            const q = query(productosRef, where("codigo_barras", "==", busqueda));
          const snap = await getDocs(q);
          if (!snap.empty) resultado = snap.docs[0];
        } else {
          const [nombre, ...restoMarca] = busqueda.split(" ");
          const marca = restoMarca.join(" ");
          const q = query(productosRef, where("nombre", "==", nombre.trim()), where("marca", "==", marca.trim()));
          const snap = await getDocs(q);
          if (!snap.empty) resultado = snap.docs[0];
        }
      
        if (resultado) {
          const data = resultado.data();
          setProductoEncontrado({ id: resultado.id, ...data });
          setFormulario(prev => ({
            ...prev,
            nombre: data.nombre,
            marca: data.marca,
            tipo: data.tipo,
            codigo_barras: data.codigo_barras || ""
          }));
          setMensaje("✅ Producto encontrado.");
        } else {
          setProductoEncontrado(null);
          setMensaje("🆕 Producto no encontrado, complete todos los campos.");
        }
        setCargando(false);
    };
    

    // 📝 Guardar producto nuevo o actualizar existente
    const guardarProducto = async () => {
        setCargando(true);
        setMensaje("Guardando producto...");

        const permitido = await puedeAgregarProducto();

        if (!permitido) {
            alert("❌ Has alcanzado el límite de productos según tu plan. Mejora tu suscripción para continuar.");
            return;
        }

        const productosRef = collection(db, "users", uid, "productos");
        const docRef = productoEncontrado
            ? doc(productosRef, productoEncontrado.id)
            : doc(productosRef, `${formulario.nombre.trim().toLowerCase().replace(/\s+/g, "_")}_${formulario.marca.trim().toLowerCase().replace(/\s+/g, "_")}_${Date.now()}`);
        
        const dataGuardar = {
            ...formulario,
            cantidad: parseInt(formulario.cantidad),
            precio_ingreso: parseFloat(formulario.precio_ingreso),
            precio_venta: parseFloat(formulario.precio_venta),
            stock_recomendable: parseInt(formulario.stock_recomendable || 0),
            codigo_barras: formulario.codigo_barras || null
        };

        if (productoEncontrado) {
            const docSnap = await getDoc(docRef);
            const dataExistente = docSnap.data();

            await updateDoc(docRef, {
                cantidad: dataExistente.cantidad + dataGuardar.cantidad,
                precio_ingreso: dataGuardar.precio_ingreso,
                precio_venta: dataGuardar.precio_venta,
                proveedor: dataGuardar.proveedor,
                fecha_ingreso: dataGuardar.fecha_ingreso,
                fecha_vencimiento: dataGuardar.fecha_vencimiento
            });

            // 💾 Guardar historial si cambió el precio
            const historialRef = collection(docRef, "historial_precios");
            const ahora = new Date().toISOString();

            if (dataExistente.precio_ingreso !== dataGuardar.precio_ingreso) {
                await setDoc(doc(historialRef, `${Date.now()}_ingreso`), {
                    tipo: "ingreso",
                    anterior: dataExistente.precio_ingreso,
                    nuevo: dataGuardar.precio_ingreso,
                    fecha: ahora,
                    usuario: user.email || "desconocido"
                });
            }

            if (dataExistente.precio_venta !== dataGuardar.precio_venta) {
                await setDoc(doc(historialRef, `${Date.now()}_venta`), {
                    tipo: "venta",
                    anterior: dataExistente.precio_venta,
                    nuevo: dataGuardar.precio_venta,
                    fecha: ahora,
                    usuario: user.email || "desconocido"
                });
            }
        }else {
            await setDoc(docRef, dataGuardar);
        }

        // Guardar marcas/tipos/proveedores
        const actualizarColeccion = async (coleccion, valor) => {
            const ref = doc(db, "users", uid, coleccion, valor);
            const snap = await getDoc(ref);
            if (!snap.exists()) await setDoc(ref, {});
        };
        await Promise.all([
            actualizarColeccion("marcas", formulario.marca),
            actualizarColeccion("tipos", formulario.tipo),
            actualizarColeccion("proveedores", formulario.proveedor)
        ]);
      
        setMensaje("✅ Producto guardado correctamente.");
        setCargando(false);
    };

    // ✏️ Manejador para inputs
    const handleChange = (campo, valor) => {
        setFormulario(prev => ({ ...prev, [campo]: valor }));
    };

    return (
    <>
      <NavBar />
      <div className="container mt-4 text-dark">
        <h2 className="mb-4">📦 Ingreso de Producto Individual</h2>

        <div className="card p-4 shadow-sm">
          <h5>🔍 Buscar Producto Existente</h5>
          <div className="row mb-3">
            <div className="col-md-6">
              <label className="form-label">Método de búsqueda</label>
              <select className="form-control" onChange={(e) => setModoBusqueda(e.target.value)}>
                <option value="codigo_barras">Código de Barras</option>
                <option value="nombre_marca">Nombre + Marca</option>
              </select>
            </div>
            <div className="col-md-6">
              <label className="form-label">Buscar</label>
              <input
                className="form-control"
                value={busqueda}
                placeholder={modoBusqueda === "codigo_barras" ? "12345678" : "nombre marca"}
                onChange={(e) => setBusqueda(e.target.value)}
              />
              {modoBusqueda === "nombre_marca" && (
                <small className="text-muted">Ingrese el nombre del producto, un espacio, y luego la marca.</small>
              )}
              <button className="btn btn-primary mt-2" onClick={buscarProducto}>Buscar</button>
              {cargando && <div className="alert alert-info mt-2">⏳ {mensaje}</div>}
            </div>
          </div>
        </div>

        <hr className="my-4" />

        {!cargando && mensaje && <div className="alert alert-secondary">{mensaje}</div>}

        <h5>{productoEncontrado ? "✅ Producto encontrado" : "🆕 Nuevo producto"}</h5>

        <div className="card p-4 shadow-sm">
          <div className="row g-3">
            {/* Nombre y Código */}
            <div className="col-md-6">
              <label className="form-label">Nombre</label>
              <input className="form-control" value={formulario.nombre} onChange={(e) => handleChange("nombre", e.target.value)} />
            </div>
            <div className="col-md-6">
              <label className="form-label">Código de Barras</label>
              <input className="form-control" value={formulario.codigo_barras} onChange={(e) => handleChange("codigo_barras", e.target.value)} />
            </div>

            {/* Marca */}
            <div className="col-md-6">
              <label className="form-label">Marca</label>
              {!crearMarca ? (
                <select className="form-control" value={formulario.marca} onChange={(e) => {
                  const val = e.target.value;
                  if (val === "__nueva__") {
                    setCrearMarca(true);
                    setFormulario(prev => ({ ...prev, marca: "" }));
                  } else {
                    setFormulario(prev => ({ ...prev, marca: val }));
                  }
                }}>
                  <option value="">Seleccionar Marca</option>
                  {listas.marcas.map((m, i) => <option key={i} value={m}>{m}</option>)}
                  <option value="__nueva__">➕ Crear nueva marca</option>
                </select>
              ) : (
                <div className="d-flex gap-2">
                  <input type="text" className="form-control" placeholder="Nueva marca" value={nuevaMarca} onChange={(e) => setNuevaMarca(e.target.value)} />
                  <button className="btn btn-success" onClick={async () => {
                    const ref = doc(db, "users", uid, "marcas", nuevaMarca);
                    await setDoc(ref, {});
                    setListas(prev => ({ ...prev, marcas: [...prev.marcas, nuevaMarca] }));
                    setFormulario(prev => ({ ...prev, marca: nuevaMarca }));
                    setNuevaMarca("");
                    setCrearMarca(false);
                  }}>Guardar</button>
                </div>
              )}
            </div>

            {/* Proveedor */}
            <div className="col-md-6">
              <label className="form-label">Proveedor</label>
              {!crearProveedor ? (
                <select className="form-control" value={formulario.proveedor} onChange={(e) => {
                  const val = e.target.value;
                  if (val === "__nueva__") {
                    setCrearProveedor(true);
                    setFormulario(prev => ({ ...prev, proveedor: "" }));
                  } else {
                    setFormulario(prev => ({ ...prev, proveedor: val }));
                  }
                }}>
                  <option value="">Seleccionar Proveedor</option>
                  {listas.proveedores.map((p, i) => <option key={i} value={p}>{p}</option>)}
                  <option value="__nueva__">➕ Crear nuevo proveedor</option>
                </select>
              ) : (
                <div className="d-flex gap-2">
                  <input type="text" className="form-control" placeholder="Nuevo proveedor" value={nuevoProveedor} onChange={(e) => setNuevoProveedor(e.target.value)} />
                  <button className="btn btn-success" onClick={async () => {
                    const ref = doc(db, "users", uid, "proveedores", nuevoProveedor);
                    await setDoc(ref, {});
                    setListas(prev => ({ ...prev, proveedores: [...prev.proveedores, nuevoProveedor] }));
                    setFormulario(prev => ({ ...prev, proveedor: nuevoProveedor }));
                    setNuevoProveedor("");
                    setCrearProveedor(false);
                  }}>Guardar</button>
                </div>
              )}
            </div>

            {/* Tipo */}
            <div className="col-md-6">
              <label className="form-label">Tipo</label>
              {!crearTipo ? (
                <select className="form-control" value={formulario.tipo} onChange={(e) => {
                  const val = e.target.value;
                  if (val === "__nueva__") {
                    setCrearTipo(true);
                    setFormulario(prev => ({ ...prev, tipo: "" }));
                  } else {
                    setFormulario(prev => ({ ...prev, tipo: val }));
                  }
                }}>
                  <option value="">Seleccionar Tipo</option>
                  {listas.tipos.map((t, i) => <option key={i} value={t}>{t}</option>)}
                  <option value="__nueva__">➕ Crear nuevo tipo</option>
                </select>
              ) : (
                <div className="d-flex gap-2">
                  <input type="text" className="form-control" placeholder="Nuevo tipo" value={nuevoTipo} onChange={(e) => setNuevoTipo(e.target.value)} />
                  <button className="btn btn-success" onClick={async () => {
                    const ref = doc(db, "users", uid, "tipos", nuevoTipo);
                    await setDoc(ref, {});
                    setListas(prev => ({ ...prev, tipos: [...prev.tipos, nuevoTipo] }));
                    setFormulario(prev => ({ ...prev, tipo: nuevoTipo }));
                    setNuevoTipo("");
                    setCrearTipo(false);
                  }}>Guardar</button>
                </div>
              )}
            </div>

            {/* Otros campos */}
            <div className="col-md-3">
              <label className="form-label">Stock Recom.</label>
              <input className="form-control" value={formulario.stock_recomendable} onChange={(e) => handleChange("stock_recomendable", e.target.value)} />
            </div>
            <div className="col-md-3">
              <label className="form-label">Fecha Ingreso</label>
              <input type="date" className="form-control" value={formulario.fecha_ingreso} onChange={(e) => handleChange("fecha_ingreso", e.target.value)} />
            </div>
            <div className="col-md-3">
              <label className="form-label">Fecha Vencimiento</label>
              <input type="date" className="form-control" value={formulario.fecha_vencimiento} onChange={(e) => handleChange("fecha_vencimiento", e.target.value)} />
            </div>
            <div className="col-md-3">
              <label className="form-label">Precio Ingreso</label>
              <input className="form-control" value={formulario.precio_ingreso} onChange={(e) => handleChange("precio_ingreso", e.target.value)} />
            </div>
            <div className="col-md-3">
              <label className="form-label">Precio Venta</label>
              <input className="form-control" value={formulario.precio_venta} onChange={(e) => handleChange("precio_venta", e.target.value)} />
            </div>
            <div className="col-md-3">
              <label className="form-label">Cantidad</label>
              <input className="form-control" value={formulario.cantidad} onChange={(e) => handleChange("cantidad", e.target.value)} />
            </div>
          </div>

          <div className="mt-4 text-end">
            <button className="btn btn-success" onClick={guardarProducto}>💾 Guardar Producto</button>
          </div>
        </div>
      </div>
    </>
  );
    };

    export default AddProduct;
