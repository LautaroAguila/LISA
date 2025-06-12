import React, { useEffect, useState } from "react";
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase/config";
import NavBar from "../components/NavBar/NavBar";
import { Table, Spinner, Form } from "react-bootstrap";

const AdminPanel = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtroRol, setFiltroRol] = useState("todos");
    const [busqueda, setBusqueda] = useState("");

    useEffect(() => {
        const obtenerUsuarios = async () => {
        try {
            const querySnapshot = await getDocs(collection(db, "users"));
            const listaUsuarios = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
            }));
            setUsuarios(listaUsuarios);
        } catch (error) {
            console.error("Error al obtener usuarios:", error);
        } finally {
            setLoading(false);
        }
        };

        obtenerUsuarios();
    }, []);

    const handleRolChange = async (userId, nuevoRol) => {
        try {
        await updateDoc(doc(db, "users", userId), { rol: nuevoRol });
        setUsuarios((prev) =>
            prev.map((u) => (u.id === userId ? { ...u, rol: nuevoRol } : u))
        );
        } catch (error) {
        console.error("Error al actualizar rol:", error);
        }
    };

    const usuariosFiltrados = usuarios.filter((u) => {
        const coincideRol = filtroRol === "todos" || u.rol === filtroRol;
        const coincideBusqueda =
        u.nombre?.toLowerCase().includes(busqueda.toLowerCase()) ||
        u.email?.toLowerCase().includes(busqueda.toLowerCase());
        return coincideRol && coincideBusqueda;
    });

    return (
        <>
        <NavBar />
        <div className="container mt-5">
            <h2 className="mb-4">👥 Panel de Administrador</h2>

            <div className="d-flex gap-3 mb-3">
            <Form.Select
                value={filtroRol}
                onChange={(e) => setFiltroRol(e.target.value)}
                style={{ maxWidth: "200px" }}
            >
                <option value="todos">Todos los roles</option>
                <option value="admin">Administradores</option>
                <option value="usuario">Usuarios</option>
            </Form.Select>

            <Form.Control
                type="text"
                placeholder="Buscar por nombre o email"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                style={{ maxWidth: "300px" }}
            />
            </div>

            {loading ? (
            <div className="text-center">
                <Spinner animation="border" />
            </div>
            ) : (
            <Table striped bordered hover responsive>
                <thead>
                    <tr>
                    <th>📛 Nombre</th>
                    <th>📧 Email</th>
                    <th>🧑 Rol</th>
                    <th>💳 Suscripción</th>
                    <th>📅 Registro</th>
                    </tr>
                </thead>
                <tbody>
                    {usuariosFiltrados.map((usuario) => (
                    <tr key={usuario.id}>
                        <td>{usuario.nombre || "Sin nombre"}</td>
                        <td>{usuario.email}</td>
                        <td>
                        <Form.Select
                            value={usuario.rol || "usuario"}
                            onChange={(e) =>
                            handleRolChange(usuario.id, e.target.value)
                            }
                        >
                            <option value="usuario">usuario</option>
                            <option value="admin">admin</option>
                        </Form.Select>
                        </td>
                        <td>{usuario.suscripcion || "gratis"}</td>
                        <td>{usuario.fechaRegistro || "N/A"}</td>
                    </tr>
                    ))}
                </tbody>
            </Table>

            )}
        </div>
        </>
    );
};

export default AdminPanel;
