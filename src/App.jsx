import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";

import Home from "./pages/Home/Home";
import AddProduct from "./components/AddProduct/AddProduct";
import UseProduct from "./components/UseProduct/UseProduct";
import StockList from "./components/StockList/StockList";
import ListBuy from "./components/ListBuy/ListBuy";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";

function App() {
  const [user, setUser] = useState(null);
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribe();
  }, [auth]);

  return (
    <Router>
      <Routes>
        {/* Rutas de autenticación */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Rutas protegidas: Si no hay usuario, redirige a /login */}
        <Route path="/" element={user ? <Home /> : <Navigate to="/login" />} />
        <Route path="/add-product" element={user ? <AddProduct /> : <Navigate to="/login" />} />
        <Route path="/use-product" element={user ? <UseProduct /> : <Navigate to="/login" />} />
        <Route path="/stock-list" element={user ? <StockList /> : <Navigate to="/login" />} />
        <Route path="/list-buy" element={user ? <ListBuy /> : <Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
