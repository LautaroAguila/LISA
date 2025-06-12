import React, { useState } from "react";
import { createUserWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { db , auth} from "../../firebase/config";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [email, setEmail] = useState("");
  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [error, setError] = useState("");
  const [mensaje, setMensaje] = useState("");
  const navigate = useNavigate();

  const passwordSegura = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMensaje("");

    if (!passwordSegura.test(password)) {
      setError("La contraseña debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un símbolo.");
      return;
    }

    if (password !== confirmarPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);

      await sendEmailVerification(cred.user);

      await setDoc(doc(db, "users", cred.user.uid), {
        nombre,
        apellido,
        email,
        telefono: telefono || null,
        direccion: direccion || null,
        rol: "usuario",
        verificado: false, // se puede actualizar luego al verificar
        plan: "gratis",
        fechaRegistro: new Date().toISOString(),
        stock_bajo_umbral: 0
      });

      setMensaje("Registro exitoso. Se envió un correo de verificación. Verifica tu cuenta antes de iniciar sesión.");
      setEmail("");
      setNombre("");
      setApellido("");
      setTelefono("");
      setDireccion("");
      setPassword("");
      setConfirmarPassword("");
    } catch (err) {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        setError("El correo ya está registrado.");
      } else {
        setError("Ocurrió un error al registrarse.");
      }
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "500px" }}>
      <h2>📝 Crear Cuenta</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label>Nombre</label>
          <input type="text" className="form-control" value={nombre} onChange={(e) => setNombre(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label>Apellido</label>
          <input type="text" className="form-control" value={apellido} onChange={(e) => setApellido(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label>Correo Electrónico</label>
          <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label>Teléfono </label>
          <input type="tel" className="form-control" value={telefono} onChange={(e) => setTelefono(e.target.value)} required />
        </div>
        <div className="mb-3">
          <label>Dirección <small className="text-muted">(opcional)</small></label>
          <input type="text" className="form-control" value={direccion} onChange={(e) => setDireccion(e.target.value)} />
        </div>
        <div className="mb-3">
          <label>Contraseña</label>
          <input type="password" className="form-control" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <small className="text-muted">
            Mínimo 8 caracteres, 1 mayúscula, 1 minúscula, 1 número y 1 símbolo.
          </small>
        </div>
        <div className="mb-3">
          <label>Confirmar Contraseña</label>
          <input type="password" className="form-control" value={confirmarPassword} onChange={(e) => setConfirmarPassword(e.target.value)} required />
        </div>

        {error && <div className="alert alert-danger">{error}</div>}
        {mensaje && <div className="alert alert-success">{mensaje}</div>}

        <button type="submit" className="btn btn-primary w-100">Registrarse</button>
      </form>
      <button className="btn btn-link mt-3 w-100" onClick={() => navigate("/login")} style={{ color: "var(--color-primario)" }}>
        ¿Ya tenes cuenta? Iniciar sesion.
      </button>
    </div>
  );
};

export default Register;
