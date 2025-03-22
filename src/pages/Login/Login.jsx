import { useState, useEffect } from "react";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [recordar, setRecordar] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const auth = getAuth();

    useEffect(() => {
        const savedEmail = localStorage.getItem("savedEmail");
        if (savedEmail) {
            setEmail(savedEmail);
            setRecordar(true);
        }
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate("/");
        } catch (error) {
            setError("Correo o contraseña incorrectos");
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-dark">
            <div className="card p-4 shadow-lg w-50">
                <h2 className="text-center mb-4">Iniciar Sesión</h2>
                {error && <p className="text-danger text-center">{error}</p>}
                <form onSubmit={handleLogin}>
                    <div className="mb-3">
                        <label className="form-label">Correo Electrónico:</label>
                        <input type="email" className="form-control" value={email} onChange={(e) => setEmail(e.target.value)} required />
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
                                style={{ right: 10, cursor: "pointer", fontSize: "1.2rem" }} 
                                onClick={() => setShowPassword(!showPassword)}
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary w-100">Ingresar</button>
                </form>
                
                <div className="form-check mb-3">
                    <input
                        type="checkbox"
                        className="form-check-input"
                        id="recordar"
                        checked={recordar}
                        onChange={(e) => setRecordar(e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="recordar">Recordar usuario</label>
                </div>
                
                <button className="btn btn-link mt-3 w-100" onClick={() => navigate("/register")}>Registrarse</button>
            </div>
        </div>
    );
};

export default Login;
