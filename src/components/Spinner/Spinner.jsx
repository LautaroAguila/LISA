import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const Spinner = ({ mensaje = "Cargando..." }) => {
    return (
        <div
            className="d-flex flex-column justify-content-center align-items-center"
            style={{
                height: "100vh",
                backgroundColor: "var(--color-fondo-claro)",
                color: "var(--color-primario)",
                padding: "20px",
            }}
        >
            <div
                className="spinner-border mb-3"
                role="status"
                style={{
                    width: "3rem",
                    height: "3rem",
                    color: "var(--color-primario)",
                }}
            >
                <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="fw-bold">{mensaje}</p>
        </div>
    );
};

export default Spinner;
