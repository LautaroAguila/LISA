// src/pages/Suscribirse.jsx
import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase/config";
import { useNavigate } from "react-router-dom";
import { Wallet, initMercadoPago } from "@mercadopago/sdk-react";

initMercadoPago("APP_USR-5f6e0283-b66c-4567-b8bb-c168e23741b4"); // Tu public key

const Suscribirse = () => {
  const [user, loading] = useAuthState(auth);
  const [preferenceId, setPreferenceId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate("/login");
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
          body: JSON.stringify({
            email: user.email,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Respuesta inválida del servidor");
      }

      const data = await response.json();

      if (data.preferenceId) {
        setPreferenceId(data.preferenceId); // ⚠️ Se muestra el botón con Wallet
      } else {
        throw new Error("No se recibió preferenceId");
      }
    } catch (err) {
      console.error("Error al iniciar suscripción:", err);
      alert("Hubo un problema al iniciar la suscripción.");
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 mt-10">
      <h2 className="text-2xl font-bold">Suscribirme</h2>

      <button
        onClick={handleSubscribe}
        className="bg-blue-600 hover:bg-blue-700 text-black font-bold py-2 px-4 rounded"
      >
        Generar botón de pago
      </button>

      {preferenceId && (
        <div className="mt-4 w-[300px]">
          <Wallet initialization={{ preferenceId }} />
        </div>
      )}
    </div>
  );
};

export default Suscribirse;
