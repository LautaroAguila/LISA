import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "./firebase/config";

import "./App.css";
import AddProduct from "./components/AddProduct/AddProduct";
import Profile from "./components/Profile/Profile";
import StockList from "./components/StockList/StockList";
import ListBuy from "./components/ListBuy/ListBuy";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import ProductDetail from "./components/ProductDetail/ProductDetail";
import Gallery from "./components/Gallery/Gallery";
import IngresoMasivoProductos from "./components/IngresoMasivoProductos/IngresoMasivoProductos";
import VerificaCorreo from "./firebase/VerificarCorreo";
import AdminPanel from "./protect/AdminPanel";
import Estadisticas from "./components/Estadisticas/Estadisticas";
import RecuperarContra from "./pages/RecuperarContra/RecuperarContra";

import PagoExitoso from "./pages/Pago/PagoExitoso";
import PagoFallido from "./pages/Pago/PagoFallido";
import PagoPendiente from "./pages/Pago/PagoPendiente";
import Suscribirse from "./utils/Suscribirse";

function App() {
  const auth = getAuth();
  const [userAuth, setUserAuth] = useState(null);       // Usuario Firebase Auth
  const [userData, setUserData] = useState(null);       // Datos de Firestore (rol, etc.)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUserAuth(firebaseUser);

      if (firebaseUser) {
        const userDocRef = doc(db, "users", firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          setUserData(userDocSnap.data());
        }
      } else {
        setUserData(null);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, [auth]);

  if (loading) return <p className="text-center mt-5">Cargando...</p>;

  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/recuperar-contra" element={<RecuperarContra />} />

        <Route path="/pago-exitoso" element={userAuth ?<PagoExitoso />: <Navigate to="/login" />} />
        <Route path="/pago-fallido" element={userAuth ?<PagoFallido />: <Navigate to="/login" />} />
        <Route path="/pago-pendiente" element={userAuth ?<PagoPendiente />: <Navigate to="/login" />} />

        <Route path="/planes" element={<Suscribirse />} />

        {/* Rutas protegidas */}
        <Route path="/" element={userAuth ? <StockList /> : <Navigate to="/login" />} />
        <Route path="/add-product" element={userAuth ? <AddProduct /> : <Navigate to="/login" />} />
        <Route path="/profile" element={userAuth ? <Profile /> : <Navigate to="/login" />} />
        <Route path="/list-buy" element={userAuth ? <ListBuy /> : <Navigate to="/login" />} />
        <Route path="/producto/:productoId" element={userAuth ? <ProductDetail /> : <Navigate to="/login" />} />
        <Route path="/galeria" element={userAuth ? <Gallery /> : <Navigate to="/login" />} />
        <Route path="/ingreso-masivo" element={userAuth ? <IngresoMasivoProductos /> : <Navigate to="/login" />} />
        <Route path="/verifica-correo" element={userAuth ? <VerificaCorreo /> : <Navigate to="/login" />} />

        <Route path="/estadisticas" element={userAuth ? <Estadisticas /> : <Navigate to="/login" />} />
        {/* Ruta de administrador */}
        <Route path="/admin" element={
          userAuth && userData?.rol === "admin" ? (
            <AdminPanel />
          ) : (
            <Navigate to="/" />
          )
        } />

        {/* Ruta por defecto */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
