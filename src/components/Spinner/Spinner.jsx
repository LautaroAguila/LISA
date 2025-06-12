import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const Spinner = () => {
    return (
        <div
            className="d-flex justify-content-center align-items-center"
            style={{
            height: "100vh",
            backgroundColor: "var(--color-fondo-claro)",
            color: "var(--color-primario)",
            padding: "20px",
        }}
        >
        <div
            className="spinner-border"
            role="status"
            style={{
            width: "3rem",
            height: "3rem",
            color: "var(--color-primario)",
            }}
        >
            <span className="visually-hidden">Cargando...</span>
        </div>
    </div>
    );
};

export default Spinner;

