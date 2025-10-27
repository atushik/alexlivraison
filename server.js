import express from "express";
import bodyParser from "body-parser";
import twilio from "twilio";

const app = express();
app.use(bodyParser.json());

// Twilio credentials (loaded from Render environment variables)
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

// === Endpoint: Receive delivery data and send WhatsApp notification ===
app.post("/api/notify-whatsapp", async (req, res) => {
  try {
    const { de, a, distance_km, prix_eur, heure, payment_method } = req.body;

    const message = `
🚴 New Alex Livraison Order!
📍 From: ${de}
🎯 To: ${a}
📏 Distance: ${distance_km} km
💶 Price: ${prix_eur} €
⏰ Time: ${heure}
💳 Payment: ${payment_method}
`;

    await client.messages.create({
      from: "whatsapp:+14155238886", // Twilio Sandbox number
      to: "whatsapp:+33677171188",   // Your WhatsApp number
      body: message,
    });

    console.log("✅ WhatsApp message sent successfully");
    res.json({ success: true });
  } catch (error) {
    console.error("❌ Error sending WhatsApp message:", error.message);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Simple health check route
app.get("/", (req, res) => {
  res.send("🚀 Alex Livraison WhatsApp API is live");
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
