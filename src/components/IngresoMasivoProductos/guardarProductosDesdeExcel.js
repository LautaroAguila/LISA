import {
  getFirestore,
  collection,
  doc,
  setDoc,
  updateDoc,
  getDocs,
  getDoc,
  Timestamp,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { app } from "../../firebase/config";

export const guardarProductosDesdeExcel = async (productosExcel) => {
  const db = getFirestore(app);
  const auth = getAuth();
  const user = auth.currentUser;
  if (!user) throw new Error("Usuario no autenticado.");

  const uid = user.uid;
  const productosRef = collection(db, "users", uid, "productos");
  const marcasCol = collection(db, "users", uid, "marcas");
  const tiposCol = collection(db, "users", uid, "tipos");
  const proveedoresCol = collection(db, "users", uid, "proveedores");

  const nuevasMarcas = new Set();
  const nuevosTipos = new Set();
  const nuevosProveedores = new Set();

  const excelDateToJSDate = (serial) => {
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);
    return date_info.toISOString().split("T")[0]; // "YYYY-MM-DD"
  };

  const productosSnapshot = await getDocs(productosRef);
  const productosExistentes = productosSnapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));

  for (const [i, prod] of productosExcel.entries()) {
    const {
      codigo_barras = "",
      nombre,
      marca,
      tipo,
      proveedor,
      cantidad,
      precio_ingreso,
      precio_venta = "",
      stock_recomendable = "",
      fecha_ingreso,
      fecha_vencimiento = "",
    } = prod;

    const fechaIngresoFinal =
      typeof fecha_ingreso === "number"
        ? excelDateToJSDate(fecha_ingreso)
        : fecha_ingreso;

    const fechaVencimientoFinal =
      typeof fecha_vencimiento === "number"
        ? excelDateToJSDate(fecha_vencimiento)
        : fecha_vencimiento;

    if (
      !nombre ||
      !marca ||
      !tipo ||
      !proveedor ||
      !cantidad ||
      !precio_ingreso ||
      !fecha_ingreso
    ) {
      console.warn(`Fila ${i + 2}: campos obligatorios faltantes`);
      continue;
    }

    const cantidadInt = parseInt(cantidad, 10);
    const precioIngresoFloat = parseFloat(precio_ingreso);
    const precioVentaFloat = precio_venta ? parseFloat(precio_venta) : null;
    const stockRecomendableInt = parseInt(stock_recomendable, 10);

    let productoEncontrado = null;
    let productoDocId = null;

    for (const producto of productosExistentes) {
      if (
        codigo_barras &&
        producto.codigo_barras === String(codigo_barras).trim()
      ) {
        productoEncontrado = producto;
        productoDocId = producto.id;
        break;
      }

      if (
        !codigo_barras &&
        producto.nombre?.trim().toLowerCase() === nombre.trim().toLowerCase() &&
        producto.marca?.trim().toLowerCase() === marca.trim().toLowerCase()
      ) {
        productoEncontrado = producto;
        productoDocId = producto.id;
        break;
      }
    }

    nuevasMarcas.add(marca.trim());
    nuevosTipos.add(tipo.trim());
    nuevosProveedores.add(proveedor.trim());

    if (productoEncontrado && productoDocId) {
      const productoDocRef = doc(productosRef, productoDocId);
      const cantidadActual = productoEncontrado.cantidad || 0;

      const nuevoPrecioVenta =
        precioVentaFloat ?? productoEncontrado.precio_venta;

      try {
        // Guardar historial si cambió precio de venta
        if (
          productoEncontrado.precio_venta !== undefined &&
          nuevoPrecioVenta !== null &&
          productoEncontrado.precio_venta !== nuevoPrecioVenta
        ) {
          await setDoc(
            doc(
              db,
              "users",
              uid,
              "productos",
              productoDocId,
              "historial_precios",
              `${Date.now()}_venta`
            ),
            {
              tipo: "venta",
              anterior: productoEncontrado.precio_venta,
              nuevo: nuevoPrecioVenta,
              fecha: new Date().toISOString(),
              usuario: user.email || "excel",
            }
          );
        }

        // Historial precio de compra
        if (
          productoEncontrado.precio_ingreso !== undefined &&
          productoEncontrado.precio_ingreso !== precioIngresoFloat
        ) {
          await setDoc(
            doc(
              db,
              "users",
              uid,
              "productos",
              productoDocId,
              "historial_precios",
              `${Date.now()}_compra`
            ),
            {
              tipo: "ingreso",
              anterior: productoEncontrado.precio_ingreso,
              nuevo: precioIngresoFloat,
              fecha: new Date().toISOString(),
              usuario: user.email || "excel",
            }
          );
        }

        await updateDoc(productoDocRef, {
          cantidad: cantidadActual + cantidadInt,
          precio_ingreso: precioIngresoFloat,
          precio_venta: nuevoPrecioVenta,
          fecha_ingreso: fechaIngresoFinal,
          fecha_vencimiento: fechaVencimientoFinal,
          codigo_barras: String(codigo_barras).trim(),
          stock_recomendable:
            productoEncontrado.stock_recomendable ?? stockRecomendableInt,
        });

        console.log("Producto actualizado:", productoDocId);
      } catch (error) {
        console.error("Error actualizando producto:", error);
      }
    } else {
      const nuevoId = `${nombre
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "_")}_${marca
        .trim()
        .toLowerCase()
        .replace(/\s+/g, "_")}_${Date.now()}`;
      const productoDocRef = doc(productosRef, nuevoId);

      try {
        await setDoc(productoDocRef, {
          nombre,
          marca,
          tipo,
          proveedor,
          cantidad: cantidadInt,
          precio_ingreso: precioIngresoFloat,
          precio_venta: precioVentaFloat,
          stock_recomendable: stockRecomendableInt,
          fecha_ingreso: fechaIngresoFinal,
          fecha_vencimiento: fechaVencimientoFinal,
          codigo_barras: String(codigo_barras).trim(),
        });

        console.log("Producto nuevo guardado:", nuevoId);
      } catch (error) {
        console.error("Error guardando producto nuevo:", error);
      }
    }
  }

  const guardarDocumentosUnicos = async (coleccion, items) => {
    const existentesSnap = await getDocs(coleccion);
    const existentes = new Set(existentesSnap.docs.map((doc) => doc.id));

    await Promise.all(
      Array.from(items).map(async (item) => {
        const nombreItem = item.trim();
        if (!existentes.has(nombreItem)) {
          await setDoc(doc(coleccion, nombreItem), {
            creadoEn: Timestamp.now(),
          });
        }
      })
    );
  };

  await Promise.all([
    guardarDocumentosUnicos(marcasCol, nuevasMarcas),
    guardarDocumentosUnicos(tiposCol, nuevosTipos),
    guardarDocumentosUnicos(proveedoresCol, nuevosProveedores),
  ]);

  console.log("Carga desde Excel finalizada correctamente.");
};
