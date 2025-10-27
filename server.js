import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import twilio from "twilio";

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// === Twilio credentials (you can also set them in Render environment variables) ===
const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || "ACf3295da30ea7398a45a4c66c09132071";
const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || "74be117ca8cd030f91f285e98b7d7aac";
const FROM_WHATSAPP = "whatsapp:+14155238886"; // Twilio sandbox number

// === ROUTE: test ===
app.get("/", (req, res) => {
  res.send("🚀 Alex Livraison API en ligne !");
});

// === ROUTE: send WhatsApp notification ===
app.post("/api/notify-whatsapp", async (req, res) => {
  try {
    const client = twilio(ACCOUNT_SID, AUTH_TOKEN);

    const { to, de, a, distance_km, prix_eur, heure, payment_method } = req.body;
    if (!to || !de || !a) {
      return res.status(400).json({ error: "Champs manquants" });
    }

    const messageText = `
🚴 Nouvelle commande Alex Livraison !
📍 De : ${de}
🎯 À : ${a}
📏 Distance : ${distance_km} km
💶 Prix : ${prix_eur} €
⏰ Heure : ${heure}
💳 Paiement : ${payment_method}
    `.trim();

    await client.messages.create({
      from: FROM_WHATSAPP,
      to: `whatsapp:${to}`,
      body: messageText,
    });

    res.json({ success: true, message: "Message WhatsApp envoyé avec succès" });
  } catch (err) {
    console.error("Erreur Twilio:", err);
    res.status(500).json({ error: "Erreur d'envoi WhatsApp", details: err.message });
  }
});

// === Start Server ===
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Serveur actif sur le port ${PORT}`));
