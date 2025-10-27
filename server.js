import express from "express";
import bodyParser from "body-parser";
import twilio from "twilio";

const app = express();
app.use(bodyParser.json());

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);

app.post("/send-message", async (req, res) => {
  const { from, to, distance, price, time } = req.body;
  try {
    await client.messages.create({
      from: process.env.TWILIO_NUMBER,
      to: process.env.MY_PHONE,
      body: `🚴 Nouvelle commande Alex Livraison !\n📍 De : ${from}\n🎯 À : ${to}\n📏 Distance : ${distance}\n💶 Prix : ${price}\n⏰ Heure : ${time}`,
    });
    res.send("Message envoyé avec succès !");
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur d’envoi du message");
  }
});

app.get("/", (req, res) => {
  res.send("Alex Livraison API est en ligne 🚀");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
