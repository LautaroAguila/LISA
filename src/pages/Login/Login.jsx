import { useState, useEffect } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [recordar, setRecordar] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const savedEmail = localStorage.getItem("savedEmail");
        if (savedEmail) {
            setEmail(savedEmail);
            setRecordar(true);
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault(); // Previene recarga de la página
        const savedEmail = recordar ? email : "";
        localStorage.setItem("savedEmail", savedEmail);
        await handleLogin(); // Usa tu lógica bien hecha
    };

    
    const handleLogin = async () => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Verificamos si el correo está verificado
            if (!user.emailVerified) {
            navigate("/verifica-correo");
            return;
            }

            // Obtenemos su rol desde Firestore
            const userDoc = await getDoc(doc(db, "users", user.uid));
            const data = userDoc.data();

            if (!data || !data.rol) {
            console.error("Usuario sin rol definido");
            return;
            }

            // Redirigimos según el rol
            if (user) {
            navigate("/");
            } else {
            navigate("/login"); // o donde quieras para usuarios normales
            }
        } catch (error) {
            console.error("Error al iniciar sesión:", error.message);
        }
        };
    

    return (
        <div className="d-flex justify-content-center align-items-center vh-100" style={{ backgroundColor: "var(--color-fondo-claro)" }}>
            <div className="card p-4 shadow-lg w-100" style={{ maxWidth: "450px", border: "1px solid var(--color-fondo-oscuro)", borderRadius: "10px" }}>
                <h2 className="text-center mb-4" style={{ color: "var(--color-primario)" }}>Iniciar Sesión</h2>
                {error && <p className="text-danger text-center">{error}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Correo Electrónico:</label>
                        <input
                            type="email"
                            className="form-control"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
    
                    <div className="mb-3">
                        <label className="form-label">Contraseña:</label>
                        <div className="d-flex align-items-center position-relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                className="form-control pe-4"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <i
                                className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"} position-absolute`}
                                style={{ right: 10, cursor: "pointer", fontSize: "1.2rem", color: "var(--color-secundario)" }}
                                onClick={() => setShowPassword(!showPassword)}
                            />
                        </div>
                    </div>
    
                    <button type="submit" className="btn btn-primary w-100">Ingresar</button>
                </form>
    
                <div className="form-check mt-3">
                    <input
                        type="checkbox"
                        className="form-check-input"
                        id="recordar"
                        checked={recordar}
                        onChange={(e) => setRecordar(e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="recordar">Recordar usuario</label>
                </div>
    
                <button className="btn btn-link mt-3 w-100" onClick={() => navigate("/register")} style={{ color: "var(--color-primario)" }}>
                    Registrarse
                </button>
                <button className="btn btn-link mt-3 w-100" onClick={() => navigate("/recuperar-contra")} style={{ color: "var(--color-primario)" }}>
                    ¿Olvidaste tu contraseña?
                </button>
            </div>
        </div>
    );
    
};

export default Login;
