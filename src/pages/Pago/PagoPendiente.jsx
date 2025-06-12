import React from "react";
import NavBar from "../../components/NavBar/NavBar"; // Si usás NavBar global
import { Container, Row, Col, Card } from "react-bootstrap";

const PagoPendiente = () => {
  return (
    <>
      <NavBar />

      <Container fluid className="bg-light min-vh-100 pt-5">
        <Row className="justify-content-center mt-5">
          <Col md={8} lg={6}>
            <Card className="shadow border-warning">
              <Card.Body className="text-center py-5">
                <h2 className="text-warning fw-bold mb-4">Pago pendiente 🕓</h2>
                <p className="fs-5 text-muted">
                  Estamos esperando la confirmación de tu pago.
                  Te notificaremos en cuanto se acredite.
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default PagoPendiente;
