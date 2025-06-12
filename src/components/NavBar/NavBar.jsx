import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min"; // Esto es clave para que el collapse funcione
import Notificaciones from "../Notificaciones/Notificaciones";

const NavBar = () => {
    
    return (
        <nav className="navbar navbar-expand-lg navbar-dark bg-black sticky-top shadow-sm px-3">
            <div className="container-fluid">
                <Link className="navbar-brand fw-bold text-warning" to="/">StockApp</Link>

                

                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span className="navbar-toggler-icon"></span>
                </button>

                <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
                    <ul className="navbar-nav align-items-center">
                        <li className="nav-item">
                            <Notificaciones />
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link text-light" to="/add-product">➕ Agregar Producto</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link text-light" to="/ingreso-masivo">🧾 Agregar Lista</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link text-light" to="/list-buy">🛒 Lista de Compras</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link text-light" to="/galeria">🖼️ Galería</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link text-light" to="/profile">👤 Perfil</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link text-light" to="/estadisticas">📊 Estadisticas</Link>
                        </li>
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default NavBar;
