// src/pages/PagoExitoso.jsx
import React, { useEffect } from "react";
import { auth, db } from "../../firebase/config";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import NavBar from "../../components/NavBar/NavBar"; // Si usás la misma navbar
import { Container, Row, Col, Card } from "react-bootstrap";

const PagoExitoso = () => {
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      const updatePlan = async () => {
        try {
          const userRef = doc(db, "users", user.uid);
          await updateDoc(userRef, { plan: "premium" });
          console.log("✅ Plan actualizado a premium");
        } catch (error) {
          console.error("❌ Error al actualizar plan:", error);
        }
      };

      updatePlan();
    } else if (!loading && !user) {
      // Si no hay usuario, lo redirige a login
      navigate("/login");
    }
  }, [user, loading, navigate]);

  return (
    <>
      <NavBar />

      <Container fluid className="bg-light min-vh-100 pt-5">
        <Row className="justify-content-center mt-5">
          <Col md={8} lg={6}>
            <Card className="shadow border-success">
              <Card.Body className="text-center py-5">
                <h1 className="text-success fw-bold mb-4">¡Gracias por tu compra!</h1>
                <p className="fs-5">
                  Tu plan ha sido actualizado a <strong className="text-primary">Premium</strong>.
                </p>
                <p className="mt-3 text-muted">
                  Ya podés acceder a todas las funciones exclusivas.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default PagoExitoso;
