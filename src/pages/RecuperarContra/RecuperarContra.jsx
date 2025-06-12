import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebase/config"; // Ajustá según tu estructura
import { Alert, Button, Form } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const RecuperarContra = () => {
    const [email, setEmail] = useState("");
    const [mensaje, setMensaje] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMensaje("");
        setError("");

        try {
            await sendPasswordResetEmail(auth, email);
            setMensaje("📩 Se envió un correo para restablecer tu contraseña.");
            
        } catch (err) {
            setError("❌ No se pudo enviar el correo. Verifica el email ingresado.");
        }
    };

    return (
        <div className="container mt-5" style={{ maxWidth: "500px" }}>
            <h3 className="mb-3">Recuperar contraseña</h3>
            <Form onSubmit={handleSubmit}>
                <Form.Group controlId="formEmail">
                    <Form.Label>Correo electrónico</Form.Label>
                    <Form.Control
                        type="email"
                        placeholder="Ingresa tu email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </Form.Group>
                <Button  type="submit" className="mt-3">
                    Enviar enlace de recuperación
                </Button>
            </Form>
            {mensaje && <Alert variant="success" className="mt-3">{mensaje}</Alert>}
            {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
            <button className="btn btn-link mt-3 w-100" onClick={() => navigate("/login")} style={{ color: "var(--color-primario)" }}>
                ¿Recuerda su contraseña? Inicie sesion.
            </button>
        </div>
    );
};

export default RecuperarContra;
