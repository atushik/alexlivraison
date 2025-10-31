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
    const orderId = "alex-" + Date.now();

    const response = await fetch("https://b2b.revolut.com/api/1.0/checkout/order", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${REVOLUT_SECRET}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        amount: {
          currency: "EUR",
          value: Math.round(amount * 100)
        },
        merchant_order_ext_ref: orderId,
        capture_mode: "AUTOMATIC",
        description: `AlexLivraison - ${name}`,
        email: "client@example.com",
        phone
      })
    });

    const data = await response.json();
    console.log("Revolut response:", data);

    const message = `💳 New paid order\n👤 Name: ${name}\n📞 Phone: ${phone}\n💶 Amount: ${amount} €`;
    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage?chat_id=${TELEGRAM_CHAT}&text=${encodeURIComponent(message)}`);

    if (data?.links?.checkout_url) {
      res.json({ checkout_url: data.links.checkout_url });
    } else if (data?.checkout_url) {
      res.json({ checkout_url: data.checkout_url });
    } else {
      res.status(400).json({ error: "Invalid Revolut response", details: data });
    }

  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Payment processing failed" });
  }
});

app.listen(3000, () => console.log("✅ AlexLivraison API is running on port 3000"));
