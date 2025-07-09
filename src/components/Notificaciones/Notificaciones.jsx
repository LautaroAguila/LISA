import { useEffect, useState } from "react";
import { auth, db } from "../../firebase/config";
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  updateDoc,
  doc,
} from "firebase/firestore";
import { FaBell } from "react-icons/fa";

const Notificaciones = () => {
  const [notificaciones, setNotificaciones] = useState([]);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "users", user.uid, "notificaciones"),
      where("leida", "==", false),
      orderBy("timestamp", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const lista = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setNotificaciones(lista);
    });

    return () => unsubscribe();
  }, []);

  const marcarComoLeidas = async () => {
  const user = auth.currentUser;
  if (!user) return;

  const promesas = notificaciones.map((noti) =>
    updateDoc(doc(db, "users", user.uid, "notificaciones", noti.id), {
      leida: true,
    })
  );

  await Promise.all(promesas);

  // Actualizamos el estado local inmediatamente
  setNotificaciones([]);
};


 return (
    <div className="dropdown me-3 position-relative">
      <button
        className="btn btn-outline-warning rounded-circle position-relative"
        type="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
        style={{
          width: "2.7rem",
          height: "2.7rem",
          display: "flex",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <FaBell />
        {notificaciones.length > 0 && (
          <span
            className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger"
            style={{ fontSize: "0.65rem" }}
          >
            {notificaciones.length}
          </span>
        )}
      </button>

      <ul
        className="dropdown-menu shadow"
        style={{
          width: "310px",
          maxHeight: "350px",
          overflowY: "auto",
          position: "absolute",
          top: "100%",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1050 // asegúrate que esté encima de otros elementos
        }}
      >
        {notificaciones.length === 0 ? (
          <li className="dropdown-item text-center text-muted small py-3">
            🎉 ¡No hay notificaciones nuevas!
          </li>
        ) : (
          <>
            {notificaciones.map((n) => (
              <li key={n.id} className="dropdown-item small d-flex align-items-start">
                <span className="me-2 text-warning">🔔</span>
                <span>{n.mensaje}</span>
              </li>
            ))}
            <li><hr className="dropdown-divider" /></li>
            <li className="text-center pb-2">
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={marcarComoLeidas}
              >
                ✅ Marcar todas como leídas
              </button>
            </li>
          </>
        )}
      </ul>
    </div>
  );
};

export default Notificaciones;
