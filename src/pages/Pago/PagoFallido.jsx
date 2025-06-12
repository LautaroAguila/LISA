import React from "react";
import NavBar from "../../components/NavBar/NavBar"; // Asegurate de tener la NavBar si la usás
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const PagoFallido = () => {
  const navigate = useNavigate();

  return (
    <>
      <NavBar />

      <Container fluid className="bg-light min-vh-100 pt-5">
        <Row className="justify-content-center mt-5">
          <Col md={8} lg={6}>
            <Card className="shadow border-danger">
              <Card.Body className="text-center py-5">
                <h2 className="text-danger fw-bold mb-4">El pago ha fallado ❌</h2>
                <p className="fs-5 text-muted">
                  Ocurrió un problema al procesar tu pago. Por favor, intentá nuevamente.
                </p>

                <Button
                  variant="outline-danger"
                  className="mt-4"
                  onClick={() => navigate("/suscribirse")}
                >
                  Reintentar Pago
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default PagoFallido;

