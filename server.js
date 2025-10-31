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

app.post("/api/pay", async (req, res) => {
  try {
    const { amount, name, phone } = req.body;
    if (!amount || !phone) return res.status(400).json({ error: "Missing data" });

    const orderId = "alex-" + Date.now();

    const response = await fetch("https://b2b.revolut.com/api/1.0/checkout-link/create", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${REVOLUT_SECRET}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100),
        currency: "EUR",
        country: "FR",
        merchant_order_ext_ref: orderId,
        description: `AlexLivraison - ${name}`,
        customer_email: "client@example.com",
        customer_phone: phone,
        capture_mode: "AUTOMATIC",
        success_url: "https://alexlivraison.shop/success",
        failure_url: "https://alexlivraison.shop/fail",
      }),
    });

    const data = await response.json();
    console.log("Revolut →", data);

    if (data?.id) {
      const checkoutUrl = data.checkout_url || `https://merchant.revolut.com/pay/${data.id}`;
      const message = `💳 New order\n👤 ${name}\n📞 ${phone}\n💶 ${amount} €`;
      await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage?chat_id=${TELEGRAM_CHAT}&text=${encodeURIComponent(message)}`);
      res.json({ checkout_url: checkoutUrl });
    } else {
      res.status(400).json({ error: "Invalid Revolut response", details: data });
    }
  } catch (e) {
    console.error("Server error:", e);
    res.status(500).json({ error: "Server failure" });
  }
});

app.listen(3000, () => console.log("✅ AlexLivraison API is running on port 3000"));
