import { auth } from "./config";
import { Button, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const VerificaCorreo = () => {
    const navigate = useNavigate();

    const reenviarCorreo = async () => {
        if (auth.currentUser) {
            await auth.currentUser.sendEmailVerification();
            alert("📧 Correo de verificación reenviado.");
        }
    };

    const cerrarSesion = async () => {
        await auth.signOut();
        navigate("/login");
    };

    return (
        <Container className="text-center mt-5">
            <h2>📩 Verificá tu correo electrónico</h2>
            <p>Hemos enviado un correo de verificación a tu casilla. Por favor, verificá tu cuenta para continuar. Y vuelve a inciar sesion.</p>
            <div className="d-grid gap-2 mt-4" style={{ maxWidth: "400px", margin: "0 auto" }}>
                <Button variant="primary" onClick={reenviarCorreo}>Reenviar correo</Button>
                <Button variant="secondary" onClick={cerrarSesion}>Cerrar sesión</Button>
            </div>
        </Container>
    );
};

export default VerificaCorreo;
