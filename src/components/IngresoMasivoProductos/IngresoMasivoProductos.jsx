import { useState } from "react";
import * as XLSX from "xlsx";
import { getFirestore, collection, getDocs, doc, getDoc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../../firebase/config";
import { guardarProductosDesdeExcel } from "./guardarProductosDesdeExcel";
import NavBar from "../NavBar/NavBar";
import PLANES from "../../utils/planes";
import { utils, writeFile } from "xlsx";
import Spinner from "../Spinner/Spinner";


const IngresoMasivoProductos = () => {
    const [archivo, setArchivo] = useState(null);
    const [mensaje, setMensaje] = useState("");

    const [productosPreview, setProductosPreview] = useState([]);
    const [readyToUpload, setReadyToUpload] = useState(false);

    const [erroresPorFila, setErroresPorFila] = useState([]); // Ahora será: [["Falta nombre", "Cantidad no es número"], [], ...]

    const auth = getAuth();
    const user = auth.currentUser;

    const [cargando, setCargando] = useState(false);


    const puedeAgregarProducto = async () => {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const plan = userDoc.data()?.plan || "gratis";
        const maxPermitidos = PLANES[plan].maxProductos;

        const productosRef = collection(db, `users/${user.uid}/productos`);
        const snapshot = await getDocs(productosRef);
        const cantidadActual = snapshot.size;

        return cantidadActual < maxPermitidos;
    };

    const descargarPlantilla = () => {
        const ejemplo = [
            {
                codigo_barras: "123123123",
                nombre: "Ejemplo Producto",
                marca: "Marca X",
                tipo: "Tipo X",
                proveedor: "Proveedor X",
                precio_ingreso: 0,
                precio_venta: 0,
                cantidad: 0,
                stock_recomendable: 0,
                fecha_ingreso: "AAAA-MM-DD",
                fecha_vencimiento: "AAAA-MM-DD",
            },
        ];

        const ws = utils.json_to_sheet(ejemplo);
        const wb = utils.book_new();
        utils.book_append_sheet(wb, ws, "Productos");

        writeFile(wb, "plantilla_productos.xlsx");
    };

    const handleCellChange = (index, campo, valor) => {
        const nuevosProductos = [...productosPreview];
        nuevosProductos[index] = { ...nuevosProductos[index], [campo]: valor };
    
        setProductosPreview(nuevosProductos);
    
        // Validación en caliente para esa fila
        const nuevosErrores = [...erroresPorFila];
        const p = nuevosProductos[index];
        const erroresFila = [];
    
        if (!p.nombre || typeof p.nombre !== "string") erroresFila.push("Falta o es inválido: nombre");
        if (!p.tipo || typeof p.tipo !== "string") erroresFila.push("Falta o es inválido: tipo");
        if (!p.marca || typeof p.marca !== "string") erroresFila.push("Falta o es inválido: marca");
        if (!p.proveedor || typeof p.proveedor !== "string") erroresFila.push("Falta o es inválido: proveedor");
    
        if (!p.fecha_ingreso || !/^\d{4}-\d{2}-\d{2}$/.test(p.fecha_ingreso)) erroresFila.push("Fecha ingreso inválida");
        if (p.fecha_vencimiento && !/^\d{4}-\d{2}-\d{2}$/.test(p.fecha_vencimiento)) erroresFila.push("Fecha vencimiento inválida");
    
        if (p.precio_ingreso === undefined || isNaN(parseFloat(p.precio_ingreso))) erroresFila.push("Precio ingreso inválido");
        if (p.cantidad === undefined || isNaN(parseInt(p.cantidad))) erroresFila.push("Cantidad inválida");
    
        nuevosErrores[index] = erroresFila;
        setErroresPorFila(nuevosErrores);
    };
    
    const handleEliminarFila = (index) => {
        const nuevosProductos = productosPreview.filter((_, i) => i !== index);
        const nuevosErrores = erroresPorFila.filter((_, i) => i !== index);
        setProductosPreview(nuevosProductos);
        setErroresPorFila(nuevosErrores);
    };

    const handleFileChange = (e) => {
        setArchivo(e.target.files[0]);
        setMensaje("");
    };

    const leerExcel = async () => {
        if (!archivo) return alert("Por favor seleccioná un archivo Excel.");
        setCargando(true);
        const reader = new FileReader();
    
        reader.onload = async (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: "array" });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                const productos = XLSX.utils.sheet_to_json(sheet);
    
                const excelDateToJSDate = (serial) => {
                    const utc_days = Math.floor(serial - 25569);
                    const utc_value = utc_days * 86400;
                    const date_info = new Date(utc_value * 1000);
                    return date_info.toISOString().split("T")[0]; // YYYY-MM-DD
                };
    
                const productosConvertidos = productos.map((p) => {
                    const fecha_ingreso = typeof p.fecha_ingreso === "number"
                        ? excelDateToJSDate(p.fecha_ingreso)
                        : p.fecha_ingreso;
                
                    const fecha_vencimiento = typeof p.fecha_vencimiento === "number"
                        ? excelDateToJSDate(p.fecha_vencimiento)
                        : p.fecha_vencimiento;
                
                    return {
                        ...p,
                        fecha_ingreso,
                        fecha_vencimiento
                    };
                });
                
                const errores = productosConvertidos.map((p, i) => {
                    const erroresFila = [];
                
                    if (!p.nombre || typeof p.nombre !== "string") erroresFila.push("Falta o es inválido: nombre");
                    if (!p.tipo || typeof p.tipo !== "string") erroresFila.push("Falta o es inválido: tipo");
                    if (!p.marca || typeof p.marca !== "string") erroresFila.push("Falta o es inválido: marca");
                    if (!p.proveedor || typeof p.proveedor !== "string") erroresFila.push("Falta o es inválido: proveedor");
                
                    if (!p.fecha_ingreso || !/^\d{4}-\d{2}-\d{2}$/.test(p.fecha_ingreso)) erroresFila.push("Fecha ingreso inválida");
                    
                    if (p.fecha_vencimiento && !/^\d{4}-\d{2}-\d{2}$/.test(p.fecha_vencimiento)) erroresFila.push("Fecha vencimiento inválida");
                
                    if (p.precio_ingreso === undefined || isNaN(parseFloat(p.precio_ingreso))) erroresFila.push("Precio ingreso inválido");
                    if (p.cantidad === undefined || isNaN(parseInt(p.cantidad))) erroresFila.push("Cantidad inválida");
                
                    return erroresFila;
                });
                
                setProductosPreview(productosConvertidos);
                setErroresPorFila(errores);
                setReadyToUpload(true);
                setMensaje("📋 Previsualización lista. Revisá los datos antes de confirmar.");
                
            } catch (error) {
                console.error("Error al procesar archivo:", error);
                setMensaje("❌ Error al procesar el archivo.");
            } finally {
            setCargando(false); // ✅ Fin
            }
        };
    
        reader.readAsArrayBuffer(archivo);
    };
    
    const confirmarCarga = async () => {
        const permitido = await puedeAgregarProducto();

        if (!permitido) {
            alert("❌ Has alcanzado el límite de productos según tu plan. Mejora tu suscripción para continuar.");
            return;
        }
        setCargando(true);
        try {
            await guardarProductosDesdeExcel(productosPreview);
            setMensaje("✅ Productos cargados exitosamente.");
            setProductosPreview([]);
            setReadyToUpload(false);
        } catch (error) {
            console.error("Error al guardar productos:", error);
            setMensaje("❌ Error al guardar productos.");
        }finally {
            setCargando(false); // ✅ Fin
        }
    };
    

    return (
  <>
    <NavBar />

    {cargando ? (
      <div className="d-flex justify-content-center align-items-center" style={{ height: "80vh" }}>
        <Spinner />
      </div>
    ) : (
      <div
        className="container py-5"
        style={{
          backgroundColor: "var(--color-fondo-claro)",
          minHeight: "100vh",
          color: "var(--color-texto)",
        }}
      >
        <h2 className="mb-4 fw-bold">📤 Subir Productos desde Excel</h2>

        <div className="bg-white p-4 rounded shadow-sm mb-5" style={{ maxWidth: "700px" }}>
          <input
            type="file"
            accept=".xlsx, .xls"
            className="form-control mb-3"
            onChange={handleFileChange}
          />

          <div className="d-flex flex-wrap gap-3">
            <button className="btn btn-outline-secondary" onClick={descargarPlantilla}>
              📄 Descargar Plantilla
            </button>
            <button className="btn btn-success" onClick={leerExcel}>
              📁 Subir Archivo
            </button>
          </div>
        </div>

        {readyToUpload && productosPreview.length > 0 && (
          <div className="mt-4">
            <h5 className="fw-bold mb-3">🔍 Vista Previa</h5>
            <div className="table-responsive bg-dark p-3 rounded shadow">
              <table className="table table-dark table-hover table-sm align-middle">
                <thead className="table-secondary text-dark">
                  <tr>
                    <th>Errores</th>
                    <th>Cód. Barras</th>
                    <th>Nombre</th>
                    <th>Tipo</th>
                    <th>Marca</th>
                    <th>Proveedor</th>
                    <th>$ Ingreso</th>
                    <th>$ Venta</th>
                    <th>Cantidad</th>
                    <th>Stock Recom.</th>
                    <th>Ingreso</th>
                    <th>Vencimiento</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {productosPreview.map((p, index) => (
                    <tr key={index}>
                      <td style={{ minWidth: "150px" }}>
                        {erroresPorFila[index]?.length > 0 ? (
                          <ul className="text-warning m-0 ps-3" style={{ fontSize: "0.8rem" }}>
                            {erroresPorFila[index].map((err, i) => (
                              <li key={i}>{err}</li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-success fw-bold">✅ Sin errores</span>
                        )}
                      </td>
                      {[
                        "codigo_barras",
                        "nombre",
                        "tipo",
                        "marca",
                        "proveedor",
                        "precio_ingreso",
                        "precio_venta",
                        "cantidad",
                        "stock_recomendable",
                      ].map((campo) => (
                        <td key={campo}>
                          <input
                            className="form-control form-control-sm"
                            value={p[campo] || ""}
                            onChange={(e) => handleCellChange(index, campo, e.target.value)}
                          />
                        </td>
                      ))}
                      <td>
                        <input
                          type="date"
                          className="form-control form-control-sm"
                          value={p.fecha_ingreso}
                          onChange={(e) => handleCellChange(index, "fecha_ingreso", e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="date"
                          className="form-control form-control-sm"
                          value={p.fecha_vencimiento || ""}
                          onChange={(e) => handleCellChange(index, "fecha_vencimiento", e.target.value)}
                        />
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => handleEliminarFila(index)}
                          title="Eliminar fila"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              className="btn btn-primary mt-4 shadow-sm"
              onClick={confirmarCarga}
              disabled={erroresPorFila.some((fila) => fila.length > 0)}
            >
              ✅ Guardar Productos
            </button>
          </div>
        )}

        {erroresPorFila.some((fila) => fila.length > 0) && (
          <div className="alert alert-warning mt-4" style={{ maxWidth: "700px" }}>
            ⚠️ Hay {erroresPorFila.filter((f) => f.length > 0).length} fila(s) con errores. Corregilas antes de continuar.
          </div>
        )}

        {mensaje && (
          <div
            className="alert mt-4 shadow-sm"
            style={{
              whiteSpace: "pre-wrap",
              backgroundColor: "#222",
              color: "lightgreen",
              maxWidth: "700px",
            }}
          >
            {mensaje}
          </div>
        )}
      </div>
    )}
  </>
);


};

export default IngresoMasivoProductos;
