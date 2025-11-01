import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import cors from "cors";
import Stripe from "stripe";

dotenv.config();
const app = express();
app.use(express.json());
app.use(cors());

const stripe = new Stripe(process.env.STRIPE_SECRET);
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN;
const TELEGRAM_CHAT = process.env.TELEGRAM_CHAT;

app.post("/api/pay", async (req, res) => {
  try {
    const { amount, name, phone } = req.body;
    if (!amount || !phone) return res.status(400).json({ error: "Missing amount or phone" });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: { name: `AlexLivraison - ${name}` },
            unit_amount: Math.round(amount * 100),
          },
          quantity: 1,
        },
      ],
      mode: "payment",
      success_url: "https://alexlivraison.shop/success",
      cancel_url: "https://alexlivraison.shop/fail",
    });

    const message = `💳 New Stripe order\n👤 Name: ${name}\n📞 Phone: ${phone}\n💶 Amount: ${amount} €`;
    await fetch(`https://api.telegram.org/bot${TELEGRAM_TOKEN}/sendMessage?chat_id=${TELEGRAM_CHAT}&text=${encodeURIComponent(message)}`);

    res.json({ checkout_url: session.url });
  } catch (error) {
    console.error("Server error:", error);
    res.status(500).json({ error: "Payment processing failed" });
  }
});

app.listen(3000, () => console.log("✅ AlexLivraison API (Stripe) is running on port 3000"));
