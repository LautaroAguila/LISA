const PLANES = {
  gratis: {
    nombre: "Plan Gratuito",
    precio: 0,
    maxProductos: 50,
    beneficios: [ "Acceso a resumen de stock", "Sin acceso a funcinalidades generales" ]
  },
  premium: {
    nombre: "Plan Premium",
    precio: 5000,
    maxProductos: 100000,
    beneficios: ["Acceso a estadisticas", "Acceso a ingreso masivo de producto", "Acceso a galeria de productos"]
  }
};

export default PLANES;
