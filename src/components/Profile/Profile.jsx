import React, { useEffect, useState } from "react";
import { getAuth,updateProfile, signOut } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/config"; // Asegurate de tener tu archivo firebase.js configurado
import { Form, Alert} from "react-bootstrap";
import NavBar from "../NavBar/NavBar";
import { Link, useNavigate } from "react-router-dom";
import PLANES from "../../utils/planes";
import Spinner from "../Spinner/Spinner";
import noFoto from "../../assets/img/noFoto.webp"




const Profile = () => {
    const auth = getAuth();
    const navigate = useNavigate();
    const user = auth.currentUser;
    const [loading, setLoading] = useState(true);
    const [userData, setUserData] = useState({
        nombre: "",
        telefono: "",
        email: user?.email || "",
        rol: ""
    });
    const [statusMsg, setStatusMsg] = useState(null);
    const [mensaje, setMensaje] = useState("");
    const [umbralStockBajo, setUmbralStockBajo] = useState();

    const handleReiniciarTour = async () => {
        const user = auth.currentUser;
        if (!user) return;

        const userRef = doc(db, "users", user.uid);
        await updateDoc(userRef, { hasSeenTour: false });
        alert("El tour se reiniciará la próxima vez que ingreses.");
    };

    useEffect(() => {
        if (!user) return;

        const fetchUserData = async () => {
            try {
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    setUserData((prev) => ({ ...prev, ...docSnap.data() }));
                }
            } catch (error) {
                console.error("Error al obtener perfil:", error);
            } finally {
                setLoading(false);
            }
        };

        if (userData?.stock_bajo_umbral) {
        setUmbralStockBajo(userData.stock_bajo_umbral);
        }

        fetchUserData();
    }, [user]);
    const handleLogout = async () => {
        await signOut(auth);
        navigate("/login");
    };
    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
    
        const reader = new FileReader();
        reader.onloadend = async () => {
        const base64 = reader.result;
    
        try {
            // Guarda la imagen en Firestore, no en Firebase Auth
            const userRef = doc(db, "users", user.uid);
            await updateDoc(userRef, { photoBase64: base64 });
    
            setUserData((prev) => ({ ...prev, photoBase64: base64 }));
            setStatusMsg("✅ Foto de perfil actualizada.");
        } catch (err) {
            console.error(err);
            setStatusMsg("❌ Error al subir la imagen.");
        }
        };
    
        reader.readAsDataURL(file);
    };

    const handleChange = (e) => {
        setUserData({ ...userData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        try {
            const docRef = doc(db, "users", user.uid);
            await updateDoc(docRef, {
                nombre: userData.nombre,
                telefono: userData.telefono,
                stock_bajo_umbral: umbralStockBajo,
            });
            setMensaje("✅ Perfil actualizado correctamente.");
        } catch (error) {
            console.error("Error al actualizar perfil:", error);
            setMensaje("❌ Error al guardar cambios.");
        }
    };

    const handlePagarPremium = async () => {
        try {
            const res = await fetch("https://crearpreferencia-b3gpo6a4ra-uc.a.run.app", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ uid: usuario.uid }) // Asegurate de tener el UID
            });

            const data = await res.json();

            if (data.init_point) {
            window.location.href = data.init_point; // Redirige a MercadoPago
            } else {
            alert("No se pudo generar el link de pago.");
            }
        } catch (err) {
            console.error("Error al generar preferencia:", err);
            alert("Hubo un error al intentar pagar.");
        }
    };




    if (loading) return <><NavBar/><Spinner/></>;

    return (
  <>
  <NavBar />
  <div className="container mt-5">
    <h2 className="mb-4 text-center text-primary">👤 Mi Perfil</h2>

    {statusMsg && <Alert variant="info">{statusMsg}</Alert>}

    <div className="row gap-4 align-items-start">
      {/* COLUMNA IZQUIERDA: FOTO + EXTRA */}
      <div className="col-md-4 text-center">
        <img
          src={userData?.photoBase64 || noFoto}
          alt="foto perfil"
          className="rounded-circle shadow-sm mb-3"
          style={{
            width: "150px",
            height: "150px",
            objectFit: "cover",
            border: "3px solid var(--color-primario)"
          }}
        />

        <Form.Group className="mb-3">
          <Form.Label className="fw-semibold">📷 Cambiar Foto</Form.Label>
          <Form.Control type="file" accept="image/*" onChange={handlePhotoUpload} />
        </Form.Group>

        {userData.rol === "admin" && (
          <Link className="btn btn-outline-dark fw-bold w-100 mb-2" to="/admin">
            🛠️ Panel de Administración
          </Link>
        )}

        <button className="btn btn-outline-warning fw-bold w-100 mb-2" onClick={handleReiniciarTour}>
          🔄 Ver tour nuevamente
        </button>

        <button className="btn btn-outline-danger fw-bold w-100" onClick={handleLogout}>
          🚪 Cerrar sesión
        </button>
      </div>

      {/* COLUMNA DERECHA: FORMULARIO Y PLAN */}
      <div className="col-md-7">
        {/* FORMULARIO */}
        <div className="mb-3">
          <label className="form-label fw-bold">📧 Email</label>
          <input type="email" className="form-control" value={userData.email} disabled />
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold">🧑 Nombre</label>
          <input
            type="text"
            className="form-control"
            name="nombre"
            value={userData.nombre}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold">📞 Teléfono</label>
          <input
            type="tel"
            className="form-control"
            name="telefono"
            value={userData.telefono}
            onChange={handleChange}
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-bold">🔔 Umbral de stock bajo</label>
          <input
            type="number"
            className="form-control"
            min={1}
            placeholder={userData.stock_bajo_umbral}
            onChange={(e) => setUmbralStockBajo(Number(e.target.value))}
          />
        </div>

        <div className="d-grid mb-4">
          <button className="btn btn-success fw-bold" onClick={handleSave}>
            💾 Guardar Cambios
          </button>
        </div>

        {/* PLAN DE SUSCRIPCIÓN */}
        <div className="p-4 border rounded bg-light mb-4 shadow-sm">
          <h5 className="fw-bold text-primary mb-3">📦 Tu Plan de Suscripción</h5>

          {userData.plan === "premium" ? (
            <>
              <p className="fw-bold text-success">🎉 Ya sos usuario Premium.</p>
              <p>¡Gracias por tu suscripción!</p>
            </>
          ) : (
            <>
              <p className="fw-bold text-secondary">Plan Gratuito</p>
              <p>
                💡 Podés pasarte al plan <strong>Premium</strong> y acceder a estos beneficios:
              </p>
            </>
          )}

          <ul className="mb-3">
            {PLANES["premium"].beneficios.map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
          </ul>

          {userData.plan !== "premium" && (
            <Link className="btn btn-outline-primary w-100 fw-bold" to="/planes">
              🚀 Ver planes disponibles
            </Link>
          )}
        </div>

        {mensaje && <div className="alert alert-info">{mensaje}</div>}
      </div>
    </div>
  </div>
</>
);

};

export default Profile;
