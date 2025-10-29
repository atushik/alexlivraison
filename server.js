import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const app = express();
app.use(express.json());

const REVOLUT_SECRET = process.env.REVOLUT_SECRET;
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const TELEGRAM_CHAT = process.env.TELEGRAM_CHAT;

app.post("/pay", async (req, res) => {
  try {
    const { name, phone, amount } = req.body;
    const order = await fetch("https://b2b.revolut.com/api/1.0/order", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${REVOLUT_SECRET}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100),
        currency: "EUR",
        merchant_order_ext_ref: Date.now().toString(),
        capture_mode: "AUTOMATIC",
        description: `AlexLivraison – ${name || "Client"} ${phone}`
      })
    });

    const data = await order.json();

    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage?chat_id=${TELEGRAM_CHAT}&text=${encodeURIComponent(`New order from ${name || "Client"}\nPhone: ${phone}\nAmount: ${amount} €`)}`);

    res.json({ checkout_url: data.checkout_url });
  } catch (err) {
    res.status(500).json({ error: "Failed to create payment" });
  }
});

app.listen(10000, () => console.log("Server running"));
