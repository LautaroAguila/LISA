import Joyride from "react-joyride";
import { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { auth, db } from "../../firebase/config";

const BienvenidaTour = () => {
  const [run, setRun] = useState(false);
  const [steps, setSteps] = useState([]);

  useEffect(() => {
    const cargarTour = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();
        if (!data.hasSeenTour) {
          // Esperar un poco para asegurar que todo está renderizado
          setTimeout(() => setRun(true), 1000);
          await updateDoc(userRef, { hasSeenTour: true }); // Marcar como visto
        }
      }

      setSteps([
        {
          target: '.navbar-brand',
          content: 'Bienvenido a StockApp. Este es nuestro logo. Si lo clickeas podras volver al inicio.',
        },
        {
          target: '.nav-icon-btn[title="Agregar Producto"]',
          content: 'Acá podés agregar productos.',
        },
        {
          target: '.nav-icon-btn[title="Agregar Lista"]',
          content: '¿Muchos productos? Cargalos con un Excel desde aquí. Descarga el template y completalo para subirlo.',
          placement: 'bottom',
        },
        {
          target: '.nav-icon-btn[title="Lista de Compras"]',
          content: 'Tu lista de compras o productos a reponer.',
          placement: 'bottom',
        },
        {
          target: '.nav-link.nav-center-link[href="/galeria"]',
          content: 'La galería muestra las fotos de tus productos. Las imágenes se cargan desde la vista de detalle que se abre al hacer clic en el nombre de un producto en el stock.',
          placement: 'bottom',
        },
        {
          target: '.nav-link.nav-center-link[href="/estadisticas"]',
          content: 'Mirá las estadísticas de precios, stock y más.',
          placement: 'bottom',
        },
        {
          target: '#perfilDropdown',
          content: 'Desde acá podés editar tu perfil o cerrar sesión.',
          placement: 'bottom',
        },
        {
          target: 'label[for="tipoFiltro"]',
          content: 'Podés filtrar los productos por tipo.',
        },
        {
          target: 'label[for="marcaFiltro"]',
          content: 'También por marca.',
        },
        {
          target: 'label[for="proveedorFiltro"]',
          content: 'Y por proveedor.',
        },
        {
          target: 'input[placeholder="Escribe el nombre..."]',
          content: 'Buscá por nombre o código de barras acá.',
        },
        {
          target: 'table',
          content: 'Este es tu stock agrupado por tipo. Podés ordenar las columnas o hacer clic en un producto para ver más.',
        },
        {
          target: '.btn-outline-dark',
          content: 'Desde acá podés consumir un producto y descontar su stock.',
        },
        {
          target: '.btn-outline-primary',
          content: 'Editá cualquier producto con este botón.',
        },
        {
          target: '.btn-outline-danger',
          content: 'Eliminá productos desde acá (¡con cuidado!).',
        },
        {
          target: '#resumen-stock',
          content: 'Finalmente, este resumen te muestra el stock bajo en tiempo real, tu cantidad de productos y el dinero gastado este mes. Si quieres puedes volver a activar este tour luego de ingresar tus productos para mas informacion, encontras el boton de ver tour de bienvenida en tu perfil.',
        },
      ]);
    };

    cargarTour();
  }, []);

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      scrollToFirstStep
      showProgress
      showSkipButton
      locale={{ last: 'Finalizar', skip: 'Saltar', next: 'Siguiente', back: 'Atrás' }}
      styles={{
        options: {
          primaryColor: '#000',
          zIndex: 10000,
        },
      }}
    />
  );
};

export default BienvenidaTour;
