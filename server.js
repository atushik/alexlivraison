import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

const REVOLUT_SECRET = process.env.REVOLUT_SECRET;
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const TELEGRAM_CHAT = process.env.TELEGRAM_CHAT;

app.get("/api/test", async (req, res) => {
  try {
    const r = await fetch("https://b2b.revolut.com/api/1.0/merchant", {
      headers: { "Authorization": `Bearer ${process.env.REVOLUT_SECRET}` }
    });
    const j = await r.text();
    res.send(j);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur test Revolut");
  }
});

app.post("/api/pay", async (req, res) => {
  try {
    const { amount, name, phone } = req.body;
    if (!amount || !phone) return res.status(400).json({ error: "Missing amount or phone" });
    const orderId = "alex-" + Date.now();

    const response = await fetch("https://b2b.revolut.com/api/1.0/checkout-link", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${REVOLUT_SECRET}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100),
        currency: "EUR",
        merchant_order_ext_ref: orderId,
        description: `AlexLivraison - ${name}`,
        capture_mode: "AUTOMATIC",
        callback_url: "https://alexlivraison.shop",
        success_url: "https://alexlivraison.shop/success",
        failure_url: "https://alexlivraison.shop/fail"
      })
    });

    const data = await response.json();

    if (data.public_id) {
      const checkoutUrl = `https://merchant.revolut.com/pay/${data.public_id}`;
      const message = `💳 New order\n👤 Name: ${name}\n📞 Phone: ${phone}\n💶 Amount: ${amount} €`;
      await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage?chat_id=${TELEGRAM_CHAT}&text=${encodeURIComponent(message)}`);
      res.json({ checkout_url: checkoutUrl });
    } else {
      res.status(400).json({ error: "Invalid Revolut response", details: data });
    }
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Payment processing failed" });
  }
});

app.listen(3000, () => console.log("✅ AlexLivraison API is running on port 3000"));
