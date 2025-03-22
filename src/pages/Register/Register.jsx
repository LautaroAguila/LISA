import { useState } from "react";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";

const Register = () => {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const auth = getAuth();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        try {
            await createUserWithEmailAndPassword(auth, formData.email, formData.password);
            alert("Cuenta creada exitosamente.");
            navigate("/login");
        } catch (error) {
            setError("Error al registrar usuario. Verifica los datos.");
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-dark">
            <div className="card p-4 shadow-lg w-50">
                <h2 className="text-center mb-4">Registrarse</h2>

                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label className="form-label">Correo Electrónico:</label>
                        <input
                            type="email"
                            className="form-control"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="mb-3">
                        <label className="form-label">Contraseña:</label>
                        <div className="d-flex align-items-center position-relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                className="form-control pe-4"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                minLength="6"
                                required
                            />
                            <i 
                                className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"} position-absolute`} 
                                style={{ right: 10, cursor: "pointer", fontSize: "1.2rem" }} 
                                onClick={() => setShowPassword(!showPassword)}
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary w-100">Registrarse</button>
                </form>

                <div className="text-center mt-3">
                    <p>
                        ¿Ya tienes cuenta? <a href="/login">Inicia sesión aquí</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Register;
