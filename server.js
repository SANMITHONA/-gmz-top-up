
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors({
  origin: "https://sanmithona.github.io"
}));
app.use(express.json({ limit: "10kb" }));

app.get("/", (req, res) => {
  res.send("GMZ TOP UP API is running!");
});

app.post("/api/order", async (req, res) => {
  const { game, playerId, packageName, contact, note } = req.body || {};

  if (!game || !playerId || !packageName || !contact) {
    return res.status(400).json({ error: "Please fill in all required fields." });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return res.status(503).json({ error: "Telegram is not configured." });
  }

  const message = [
    "🛒 GMZ TOP UP - NEW ORDER",
    `🎮 Game: ${String(game).slice(0, 60)}`,
    `🆔 Player ID: ${String(playerId).slice(0, 80)}`,
    `📦 Package: ${String(packageName).slice(0, 100)}`,
    `📞 Contact: ${String(contact).slice(0, 100)}`,
    note ? `📝 Note: ${String(note).slice(0, 300)}` : ""
  ].filter(Boolean).join("\n");

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${token}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: message })
      }
    );

    const result = await response.json();

    if (!response.ok || !result.ok) {
      return res.status(502).json({ error: "Telegram message failed." });
    }

    res.json({ ok: true, message: "Order sent successfully!" });
  } catch (error) {
    res.status(500).json({ error: "Server error." });
  }
});

app.listen(PORT, () => {
  console.log(`GMZ TOP UP API running on port ${PORT}`);
});

