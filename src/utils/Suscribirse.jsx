import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase/config";
import { useNavigate } from "react-router-dom";
import { Wallet, initMercadoPago } from "@mercadopago/sdk-react";
import { Container, Row, Col, Card, Button, Badge } from "react-bootstrap";
import NavBar from "../components/NavBar"; // Opcional

initMercadoPago("APP_USR-5f6e0283-b66c-4567-b8bb-c168e23741b4");

const Suscribirse = () => {
  const [user, loading] = useAuthState(auth);
  const [preferenceId, setPreferenceId] = useState(null);
  const navigate = useNavigate();
  const [userPlan, setUserPlan] = useState(null);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
    if (user) {
      // 🔄 Cargar plan actual del usuario
      const fetchUserPlan = async () => {
        const token = await user.getIdToken();
        const res = await fetch(
          `https://us-central1-listaia-c2889.cloudfunctions.net/getUserPlan`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        setUserPlan(data.plan);
      };

      fetchUserPlan();
    }
  }, [loading, user]);

  const handleSubscribe = async () => {
    try {
      const response = await fetch(
        "https://us-central1-listaia-c2889.cloudfunctions.net/createSubscription",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email: user.email }),
        }
      );

      if (!response.ok) throw new Error("Respuesta inválida del servidor");

      const data = await response.json();
      if (data.preferenceId) setPreferenceId(data.preferenceId);
      else throw new Error("No se recibió preferenceId");
    } catch (err) {
      console.error("Error al iniciar suscripción:", err);
      alert("Hubo un problema al iniciar la suscripción.");
    }
  };

  return (
    <>
      <NavBar />

      <Container className="py-5">
        <h2 className="text-center mb-5">Elegí tu plan</h2>
        <Row className="justify-content-center">
          {/* PLAN GRATIS */}
          <Col md={5}>
            <Card
              className={`shadow-sm border ${
                userPlan === "gratis" ? "border-success" : ""
              }`}
            >
              <Card.Body className="text-center">
                <h4 className="text-secondary">Plan Gratuito</h4>
                <p>Acceso limitado a funcionalidades básicas.</p>
                <h5 className="text-success fw-bold">Gratis</h5>
                {userPlan === "gratis" && (
                  <Badge bg="success" className="mt-2">
                    Tu plan actual
                  </Badge>
                )}
              </Card.Body>
            </Card>
          </Col>

          {/* PLAN PREMIUM */}
          <Col md={5}>
            <Card
              className={`shadow-sm border ${
                userPlan === "premium" ? "border-success" : ""
              }`}
            >
              <Card.Body className="text-center">
                <h4 className="text-primary">Plan Premium</h4>
                <p>Funciones avanzadas y sin restricciones.</p>
                <h5 className="text-primary fw-bold">$1000 / mes</h5>
                {userPlan === "premium" ? (
                  <Badge bg="success" className="mt-2">
                    Tu plan actual
                  </Badge>
                ) : (
                  <>
                    <Button
                      variant="outline-primary"
                      className="mt-3"
                      onClick={handleSubscribe}
                    >
                      Suscribirme
                    </Button>

                    {preferenceId && (
                      <div className="mt-3 d-flex justify-content-center">
                        <Wallet initialization={{ preferenceId }} />
                      </div>
                    )}
                  </>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default Suscribirse;
