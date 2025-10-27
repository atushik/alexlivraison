// ==== Alex Livraison API ====
const express = require("express");
const fetch = require("node-fetch");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

// --- Test route ---
app.get("/", (req, res) => {
  res.send("✅ Alex Livraison API est en ligne 🚀");
});

// --- WhatsApp Notification ---
app.post("/api/notify-whatsapp", async (req, res) => {
  try {
    const { to, de, a, distance_km, prix_eur, heure, payment_method } = req.body;

    const msg = `🚴 Nouvelle commande Alex Livraison !
📍 De : ${de}
🎯 À : ${a}
📏 Distance : ${distance_km} km
💶 Prix : ${prix_eur} €
💳 Paiement : ${payment_method}
⏰ Heure : ${heure}`;

    const response = await fetch("https://api.twilio.com/2010-04-01/Accounts/" + process.env.TWILIO_ACCOUNT_SID + "/Messages.json", {
      method: "POST",
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(process.env.TWILIO_ACCOUNT_SID + ":" + process.env.TWILIO_AUTH_TOKEN).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: `whatsapp:${to}`,
        From: `whatsapp:+14155238886`, // numéro officiel de Twilio Sandbox
        Body: msg,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Erreur Twilio:", text);
      return res.status(500).send("Erreur d'envoi WhatsApp.");
    }

    console.log("✅ Message envoyé à", to);
    res.send("WhatsApp envoyé avec succès !");
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur interne serveur.");
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur en ligne sur le port ${PORT}`);
});
