import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

const REVOLUT_SECRET = process.env.REVOLUT_SECRET;

app.post("/create-payment", async (req, res) => {
  try {
    const { amount, name, phone } = req.body;

    const r = await fetch("https://b2b.revolut.com/api/1.0/order", {
      method: "POST",
      headers: {
        "Authorization": Bearer ${REVOLUT_SECRET},
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100),
        currency: "EUR",
        description: Commande AlexLivraison - ${name} (${phone}),
        capture_mode: "AUTOMATIC",
      }),
    });

    const data = await r.json();
    res.json(data);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erreur de paiement" });
  }
});

app.get("/", (req, res) => {
  res.send("✅ AlexLivraison API active !");
});

app.listen(10000, () => console.log("✅ Serveur API AlexLivraison en ligne (port 10000)"));
