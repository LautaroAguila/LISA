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
    <div className="dropdown me-3">
      <button
        className="btn btn-outline-warning dropdown-toggle"
        type="button"
        data-bs-toggle="dropdown"
        aria-expanded="false"
      >
        🔔{" "}
        {notificaciones.length > 0 && (
          <span className="badge bg-danger">{notificaciones.length}</span>
        )}
      </button>
      <ul
          className="dropdown-menu dropdown-menu-end"
          style={{ maxHeight: "300px", overflowY: "auto" }}
        >
        {notificaciones.length === 0 ? (
          <li className="dropdown-item text-muted">Sin notificaciones</li>
        ) : (
          <div>
            {notificaciones.map((n) => (
              <li key={n.id} className="dropdown-item small">
                {n.mensaje}
              </li>
            ))}
            <li><hr className="dropdown-divider" /></li>
            <li>
              <button
                className="dropdown-item text-center text-primary"
                onClick={marcarComoLeidas}
              >
                ✅ Marcar todas como leídas
              </button>
            </li>
          </div>
        )}
      </ul>
    </div>
  );
};

export default Notificaciones;
