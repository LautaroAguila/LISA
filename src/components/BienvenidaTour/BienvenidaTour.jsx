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
          setRun(true);
          await updateDoc(userRef, { hasSeenTour: true }); // Marcar como visto
        }
      }

      setSteps([
        {
          target: '.navbar-brand',
          content: 'Bienvenido a StockApp. Este es el logo.',
        },
        {
          target: '.nav-link[href="/add-product"]',
          content: 'Acá podés agregar productos.',
        },
        {
      target: '.nav-link[href="/ingreso-masivo"]',
      content: '¿Muchos productos? Cargalos con un Excel desde aquí.',
      placement: 'bottom',
    },
    {
      target: '.nav-link[href="/list-buy"]',
      content: 'Tu lista de compras o productos a reponer.',
      placement: 'bottom',
    },
    {
      target: '.nav-link[href="/galeria"]',
      content: 'Mirá imágenes de tus productos desde la galería.',
      placement: 'bottom',
    },
    {
      target: '.nav-link[href="/estadisticas"]',
      content: 'Mirá las estadísticas de precios, stock y más.',
      placement: 'bottom',
    },
    {
      target: '.nav-link[href="/profile"]',
      content: 'Desde acá podés editar tu perfil y cambiar tu contraseña.',
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
      target: '.col-md-2:last-child',
      content: 'Este resumen te muestra el stock bajo en tiempo real.',
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
