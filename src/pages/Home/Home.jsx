import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";

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
                className="btn btn-danger position-absolute top-0 end-0 m-3"
                onClick={handleLogout}
            >
                Cerrar Sesión
            </button>

            <div className="text-center text-white">
                <h1>Bienvenido a ListaIA</h1>
                <div className="row">
                    <div className="col-12 col-md-3">
                        <Link to="/add-product" className="btn btn-warning w-100">Compré</Link>
                    </div>
                    <div className="col-12 col-md-3">
                        <Link to="/use-product" className="btn btn-success w-100">Usé</Link>
                    </div>
                    <div className="col-12 col-md-3">
                        <Link to="/stock-list" className="btn btn-primary w-100">Ver Stock</Link>
                    </div>
                    <div className="col-12 col-md-3">
                        <Link to="/list-buy" className="btn btn-info w-100">Ver Compra</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
