const functions = require("firebase-functions");
const cors = require("cors")({ origin: true }); // habilita CORS
const { MercadoPagoConfig, Preference } = require("mercadopago");

const client = new MercadoPagoConfig({ accessToken: 
  "APP_USR-6566159949744482-052615-c04fd1dd23762c0c2e5d1162bae3fdb4-1045338675" });

exports.createSubscription = functions.https.onRequest((req, res) => {
  cors(req, res, async () => {
    try {
      const { email } = req.body;

      const preference = new Preference(client);
      const response = await preference.create({
        body: {
          items: [
            {
              title: "Suscripción Premium",
              quantity: 1,
              unit_price: 1,
            },
          ],
          payer: { email },
          back_urls: {
            success: "https://www.google.com/?hl=es",
            failure: "https://www.youtube.com/",
            pending: "http://localhost:5173/pago-pendiente",
          },
          auto_return: "approved",
        },
      });

      return res.json({ preferenceId: response.id });
    } catch (error) {
      console.error("❌ Error en createSubscription:", error);
      return res.status(500).json({ error: "Error al crear suscripción" });
    }
  });
});
