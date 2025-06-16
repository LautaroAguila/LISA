import { Link, useNavigate, useLocation } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { FaPlus, FaListUl, FaShoppingCart, FaUser, FaImage, FaChartBar, FaHome } from "react-icons/fa";
import Notificaciones from "../Notificaciones/Notificaciones"; // si lo tenés como componente aparte
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import logo from "../../assets/img/logo.png"

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    }
  };

  return (
    <nav className="navbar navbar-expand-lg shadow-sm custom-navbar px-3 sticky-top">
      <div className="container-fluid">
        {/* Logo / Marca */}
        <Link className="navbar-brand fw-bold brand-highlight d-flex align-items-center" to="/">
          <img
            src={logo}
            alt="LOGO"
            className="nav-icon-btn me-2"
          />
          
        </Link>

        {/* Toggle Mobile */}
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarResponsive"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Contenido colapsable */}
        <div className="collapse navbar-collapse" id="navbarResponsive">
          {/* Íconos centrales (nav principal) */}
          <ul className="navbar-nav mx-auto d-flex flex-row flex-lg-row justify-content-center gap-3 mt-3 mt-lg-0">
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

          {/* Íconos de acción derecha */}
          <ul className="navbar-nav d-flex flex-row flex-lg-row justify-content-end gap-2 align-items-center mt-3 mt-lg-0">
            <li className="nav-item">
              <Notificaciones />
            </li>
            <li className="nav-item">
              <Link to="/add-product" className="nav-icon-btn d-flex" title="Agregar Producto">
                <FaPlus />
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/ingreso-masivo" className="nav-icon-btn d-flex" title="Agregar Lista">
                <FaListUl />
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/list-buy" className="nav-icon-btn d-flex" title="Lista de Compras">
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
      </div>
    </nav>
  );
};

export default NavBar;
