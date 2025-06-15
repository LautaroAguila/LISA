import { Link , useLocation, useNavigate} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min"; // Esto es clave para que el collapse funcione
import Notificaciones from "../Notificaciones/Notificaciones";
import { FaHome, FaImage, FaChartBar, FaPlus, FaListUl, FaShoppingCart, FaUser  } from "react-icons/fa";
import { getAuth, signOut } from "firebase/auth";

const NavBar = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        const auth = getAuth();
        try {
        await signOut(auth);
        navigate("/login"); // o a donde quieras redirigir
        } catch (error) {
        console.error("Error al cerrar sesión", error);
        }
    };
    const location = useLocation();
    const isActive = (path) => location.pathname === path;
    return (
        <nav className="navbar navbar-expand-lg shadow-sm custom-navbar px-3">
            <div className="container-fluid d-flex justify-content-between align-items-center">

                {/* Branding */}
                <Link className="navbar-brand fw-bold brand-highlight " to="/">
                <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR7RmvuhvqZZFqmNl2yyQLlwY2zqx7HJRGeog&s" alt="LOGO-HOME" className="nav-icon-btn"/>
                </Link>

                {/* Centro - Navegación principal */}
                <ul className="navbar-nav mx-auto d-flex flex-row gap-4">
                <li className="nav-item">
                    <Link to="/" className={`nav-link nav-center-link ${isActive("/") ? "active" : ""}`}>
                    <FaHome />
                    </Link>
                </li>
                <li className="nav-item">
                    <Link to="/galeria" className={`nav-link nav-center-link ${isActive("/galeria") ? "active" : ""}`}>
                    <FaImage />
                    </Link>
                </li>
                <li className="nav-item">
                    <Link to="/estadisticas" className={`nav-link nav-center-link ${isActive("/estadisticas") ? "active" : ""}`}>
                    <FaChartBar />
                    </Link>
                </li>
                </ul>

                {/* Derecha - Acciones rápidas */}
                <ul className="navbar-nav d-flex flex-row gap-2 align-items-center">
                <li className="nav-item">
                    <Notificaciones />
                </li>
                <li className="nav-item">
                    <Link to="/add-product" className="nav-link nav-icon-btn" title="Agregar Producto">
                    <FaPlus />
                    </Link>
                </li>
                <li className="nav-item">
                    <Link to="/ingreso-masivo" className="nav-link nav-icon-btn" title="Agregar Lista">
                    <FaListUl />
                    </Link>
                </li>
                <li className="nav-item">
                    <Link to="/list-buy" className="nav-link nav-icon-btn" title="Lista de Compras">
                    <FaShoppingCart />
                    </Link>
                </li>
                <li className="nav-item dropdown">
                    <button
                        className="btn nav-icon-btn d-flex justify-content-center align-items-center"
                        id="perfilDropdown"
                        data-bs-toggle="dropdown"
                        aria-expanded="false"
                    >
                        <FaUser />
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end" aria-labelledby="perfilDropdown">
                        <li>
                        <Link className="dropdown-item" to="/profile">👤 Ver Perfil</Link>
                        </li>
                        <li>
                        <button className="dropdown-item text-danger" onClick={handleLogout}>🔒 Cerrar Sesión</button>
                        </li>
                    </ul>
                </li>
                </ul>
            </div>
        </nav>
        );
    };

export default NavBar;
