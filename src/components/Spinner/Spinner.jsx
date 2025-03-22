import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";

const Spinner = () => {
    return (
        <div className="d-flex justify-content-center align-items-center"  style={{ height: "100vh", backgroundColor: "#2c2c2c", color: "white", padding: "20px" }}>
            <div className="spinner-border text-info" role="status" style={{ width: "3rem", height: "3rem" }}>
                <span className="visually-hidden">Cargando...</span>
            </div>
        </div>
    );
};

export default Spinner;
