const functions = require("firebase-functions");
const cors = require("cors")({ origin: true }); // habilita CORS
const { MercadoPagoConfig, Preference } = require("mercadopago");
require("dotenv").config();

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN, });

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
              unit_price: 2165,
            },
          ],
          payer: { email },
          back_urls: {
            success: "https://lisa-gyni.vercel.app/pago-exitoso",
            failure: "https://lisa-gyni.vercel.app/pago-fallido",
            pending: "https://lisa-gyni.vercel.app/pago-pendiente",
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
