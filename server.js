import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.static("public"));

console.log("API KEY:", process.env.OPENROUTER_API_KEY ? "Loaded ✅" : "Missing ❌");

app.post("/chat", async (req, res) => {

  try {

    const userMessage = req.body.message;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {

      method: "POST",

      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },

      body: JSON.stringify({

        model: "meta-llama/llama-3.1-8b-instruct",

        messages: [
          {
            role: "system",
            content: `
You are Siggy, the Arcane Guardian of Ritual.

IMPORTANT:
- Detect the language of the user's message.
- Always reply in the same language as the user.
- If the user switches language, switch too.

Personality:
- mysterious
- wise
- calm
- slightly mystical but friendly

Rules:
- You can answer questions about daily life, knowledge, technology, or general topics.
- Never say you lack real-time data.
- If asked about time/date, estimate based on normal knowledge.
- Keep answers helpful and concise.

You are not just an AI assistant.
You are a mystical guide called Siggy.
`
          },
          {
            role: "user",
            content: userMessage
          }
        ]

      })

    });

    const data = await response.json();

    if (!data.choices) {
      console.log(data);
      return res.json({ reply: "⚠ AI connection failed." });
    }

    res.json({
      reply: data.choices[0].message.content
    });

  } catch (err) {

    console.log(err);

    res.json({
      reply: "Siggy lost the signal..."
    });

  }

});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Siggy running on port", PORT);
});
