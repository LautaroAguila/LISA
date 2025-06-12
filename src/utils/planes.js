const PLANES = {
  gratis: {
    nombre: "Plan Gratuito",
    precio: 0,
    maxProductos: 50,
    beneficios: ["Hasta 50 productos", "Acceso a resumen de stock", "Sin acceso a funcinalidades generales" ]
  },
  premium: {
    nombre: "Plan Premium",
    precio: 5000,
    maxProductos: 100000,
    beneficios: ["Productos ilimitados", "Acceso a estadisticas", "Acceso a ingreso masivo de producto", "Acceso a galeria de productos", "Acceso a notificaciones de vencimiento y stock bajo"]
  }
};

export default PLANES;
