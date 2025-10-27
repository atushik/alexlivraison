// ===== Alex Livraison API =====
import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// === Test route ===
app.get("/", (req, res) => {
  res.send("✅ Alex Livraison API est en ligne 🚀");
});

// === WhatsApp Notification ===
app.post("/api/notify-whatsapp", async (req, res) => {
  try {
    const { to, de, a, distance_km, prix_eur, heure, payment_method } = req.body;

    // Message WhatsApp à envoyer
    const msg = `🚴 Nouvelle commande Alex Livraison !
📍 De : ${de}
🎯 À : ${a}
📏 Distance : ${distance_km} km
💶 Prix : ${prix_eur} €
⏰ Heure : ${heure}
💳 Paiement : ${payment_method}
——————————————
💜 Nous livrons vos commandes jusqu’à votre porte 💜`;

    // Appel Twilio API
    const twilioRes = await fetch(
      "https://api.twilio.com/2010-04-01/Accounts/ACf3295da30ea7398a45a4c66c09132071/Messages.json",
      {
        method: "POST",
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(
              "ACf3295da30ea7398a45a4c66c09132071:74be117ca8cd030f91f285e98b7d7aac"
            ).toString("base64"),
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          To: `whatsapp:${to}`,
          From: "whatsapp:+14155238886",
          Body: msg,
        }),
      }
    );

    const data = await twilioRes.json();
    if (!twilioRes.ok) {
      console.error("Twilio error:", data);
      throw new Error(data.message || "Erreur Twilio");
    }

    console.log("✅ WhatsApp envoyé avec succès :", data.sid);
    res.json({ success: true, sid: data.sid });
  } catch (err) {
    console.error("❌ Erreur serveur:", err);
    res.status(500).json({ error: err.message });
  }
});

// === Lancer le serveur ===
app.listen(PORT, () => {
  console.log(`🚀 Serveur démarré sur le port ${PORT}`);
});
