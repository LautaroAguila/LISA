import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { FaCheckCircle, FaClipboardList, FaSignOutAlt, FaShoppingBag } from "react-icons/fa";
import { HiOutlineShoppingCart } from "react-icons/hi";
import "bootstrap/dist/css/bootstrap.min.css";

const Home = () => {
    const navigate = useNavigate();
    const auth = getAuth();

    const handleLogout = async () => {
        try {
            await signOut(auth);
            navigate("/login");
        } catch (error) {
            console.error("Error al cerrar sesión:", error);
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-dark">
            {/* Botón de Cerrar Sesión */}
            <button 
                className="btn btn-danger position-absolute top-0 end-0 m-3 d-flex align-items-center gap-2"
                onClick={handleLogout}
            >
                <FaSignOutAlt size={24} className="flex-shrink-0" /> Cerrar Sesión
            </button>

            <div className="text-center text-white fade-in">
                <h1 className="mb-4 fw-bold">Bienvenido a <span className="text-warning">ListaIA</span></h1>
                
                <div className="row g-4 justify-content-center">
                    <div className="col-12 col-md-3">
                        <Link 
                            to="/add-product" 
                            className="btn btn-warning btn-lg w-100 d-flex align-items-center justify-content-center gap-2"
                            style={{ minWidth: "150px" }}
                        >
                            <HiOutlineShoppingCart size={24} className="flex-shrink-0" /> Compré
                        </Link>
                    </div>
                    <div className="col-12 col-md-3">
                        <Link 
                            to="/use-product" 
                            className="btn btn-success btn-lg w-100 d-flex align-items-center justify-content-center gap-2"
                            style={{ minWidth: "150px" }}
                        >
                            <FaCheckCircle size={24} className="flex-shrink-0" /> Usé
                        </Link>
                    </div>
                    <div className="col-12 col-md-3">
                        <Link 
                            to="/stock-list" 
                            className="btn btn-primary btn-lg w-100 d-flex align-items-center justify-content-center gap-2"
                            style={{ minWidth: "150px" }}
                        >
                            <FaClipboardList size={24} className="flex-shrink-0" /> Stock
                        </Link>
                    </div>
                    <div className="col-12 col-md-3">
                        <Link 
                            to="/list-buy" 
                            className="btn btn-info btn-lg w-100 d-flex align-items-center justify-content-center gap-2"
                            style={{ minWidth: "150px" }}
                        >
                            <FaShoppingBag size={24} className="flex-shrink-0" /> Compra
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
