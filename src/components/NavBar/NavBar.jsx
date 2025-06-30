import { Link, useNavigate, useLocation } from "react-router-dom";
import { getAuth, signOut } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import { db } from "../../firebase/config";
import { FaPlus, FaListUl, FaShoppingCart, FaUser, FaImage, FaChartBar, FaHome } from "react-icons/fa";
import Notificaciones from "../Notificaciones/Notificaciones";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
import logo from "../../assets/img/logo.png";

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [userPlan, setUserPlan] = useState("gratis");

  const auth = getAuth();
  const user = auth.currentUser;

  useEffect(() => {
    const fetchUserPlan = async () => {
      if (user) {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserPlan(docSnap.data().plan || "gratis");
        }
      }
    };
    fetchUserPlan();
  }, [user]);

  const isActive = (path) => location.pathname === path;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    }
  };

  const handleRestriccion = () => {
    alert("⚠️ Esta funcionalidad es exclusiva para usuarios Premium. Accedé desde tu perfil y mejorá tu plan.");
  };

  return (
    <nav className="navbar navbar-expand-lg shadow-sm custom-navbar px-3 sticky-top">
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold brand-highlight d-flex align-items-center" to="/">
          <img src={logo} alt="LOGO" className="nav-icon-btn me-2" />
        </Link>

        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarResponsive">
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarResponsive">
          <ul className="navbar-nav mx-auto d-flex flex-row flex-lg-row justify-content-center gap-3 mt-3 mt-lg-0">
            <li className="nav-item">
              <Link to="/" className={`nav-link nav-center-link ${isActive("/") ? "active" : ""}`}>
                <FaHome />
              </Link>
            </li>

            <li className="nav-item">
              {userPlan === "premium" ? (
                <Link to="/galeria" className={`nav-link nav-center-link ${isActive("/galeria") ? "active" : ""}`}>
                  <FaImage />
                </Link>
              ) : (
                <button className="nav-link nav-center-link btn btn-link" onClick={handleRestriccion}>
                  <FaImage />
                </button>
              )}
            </li>

            <li className="nav-item">
              {userPlan === "premium" ? (
                <Link to="/estadisticas" className={`nav-link nav-center-link ${isActive("/estadisticas") ? "active" : ""}`}>
                  <FaChartBar />
                </Link>
              ) : (
                <button className="nav-link nav-center-link btn btn-link" onClick={handleRestriccion}>
                  <FaChartBar />
                </button>
              )}
            </li>
          </ul>

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
              {userPlan === "premium" ? (
                <Link to="/ingreso-masivo" className="nav-icon-btn d-flex" title="Agregar Lista">
                  <FaListUl />
                </Link>
              ) : (
                <button className="nav-icon-btn d-flex btn btn-link" onClick={handleRestriccion} title="Solo Premium">
                  <FaListUl />
                </button>
              )}
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
