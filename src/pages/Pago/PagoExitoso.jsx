// src/pages/PagoExitoso.jsx
import React, { useEffect } from "react";
import { auth, db } from "../../firebase/config";
import { useAuthState } from "react-firebase-hooks/auth";
import { doc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

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
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-3xl font-bold text-green-600">¡Gracias por tu compra!</h1>
      <p className="text-lg mt-4">Tu plan ha sido actualizado a <strong>premium</strong>.</p>
    </div>
  );
};

export default PagoExitoso;
