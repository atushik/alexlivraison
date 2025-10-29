import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/pay", async (req, res) => {
  const { amount, name, phone } = req.body;

  try {
    const response = await fetch("https://b2b.revolut.com/api/1.0/order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.REVOLUT_SECRET}`
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100),
        currency: "EUR",
        merchant_order_ext_ref: `alexlivraison-${Date.now()}`,
        description: `Livraison pour ${name || "client"} (${phone})`,
        capture_mode: "AUTOMATIC"
      })
    });

    const data = await response.json();
    if (data && data.checkout_url) {
      res.json({ ok: true, url: data.checkout_url });
    } else {
      res.status(400).json({ ok: false, error: data });
    }
  } catch (err) {
    res.status(500).json({ ok: false, message: "Internal error" });
  }
});

app.get("/", (req, res) => {
  res.send("AlexLivraison API online");
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
