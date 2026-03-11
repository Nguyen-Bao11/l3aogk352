import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import { autoUpdate } from "./autoUpdate.js";
import fs from "fs";

dotenv.config();

const memoryFile = "memory.json";
let memory = [];

// Load memory
if (fs.existsSync(memoryFile)) {
  memory = JSON.parse(fs.readFileSync(memoryFile));
}

const app = express();
app.use(express.json());
app.use(express.static("public"));

console.log(
  "API KEY:",
  process.env.OPENROUTER_API_KEY ? "Loaded ✅" : "Missing ❌"
);

// 🔄 Auto Update
autoUpdate();


// =============================
// 🌐 GOOGLE SEARCH
// =============================
async function googleSearch(query) {

  try {

    if (!process.env.GOOGLE_API_KEY || !process.env.GOOGLE_CX) {
      return "Google search not configured.";
    }

    const url =
      `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(query)}&key=${process.env.GOOGLE_API_KEY}&cx=${process.env.GOOGLE_CX}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.items) return "No Google results.";

    return data.items
      .slice(0, 3)
      .map(i => `${i.title} - ${i.snippet}`)
      .join("\n");

  } catch (err) {
    console.log("Google search error:", err);
    return "Google search failed.";
  }

}


// =============================
// 🌐 DUCKDUCKGO SEARCH
// =============================
async function duckSearch(query) {

  try {

    const url =
      "https://api.duckduckgo.com/?q=" +
      encodeURIComponent(query) +
      "&format=json";

    const response = await fetch(url);
    const data = await response.json();

    if (data.Abstract) return data.Abstract;

    if (data.RelatedTopics && data.RelatedTopics.length > 0) {
      return data.RelatedTopics[0].Text;
    }

    return "No DuckDuckGo results.";

  } catch (err) {
    console.log("Duck error:", err);
    return "DuckDuckGo failed.";
  }

}


// =============================
// 🌐 INTERNET SEARCH COMBINED
// =============================
async function searchInternet(query) {

  const google = await googleSearch(query);
  const duck = await duckSearch(query);

  return `Google Results:
${google}

DuckDuckGo:
${duck}`;

}


// =============================
// 🤖 MODE SYSTEM
// =============================
function getModePrompt(mode) {

  switch (mode) {

    case "creative":
      return "You are a creative storyteller AI. Use imagination.";

    case "coder":
      return "You are an expert programming assistant.";

    case "ritual":
      return "You are a mystical ritual guide speaking poetically.";

    case "assistant":
      return "You are a helpful AI assistant.";

    default:
      return "You are Siggy, a mystical AI guide.";

  }

}


// =============================
// 💬 CHAT API
// =============================
app.post("/chat", async (req, res) => {

  try {

    const userMessage = req.body.message;
    const mode = req.body.mode || "assistant";
    const userLang = req.body.lang || "en";   // 🔹 LẤY NGÔN NGỮ TỪ FRONTEND

    memory.push({
      role: "user",
      content: userMessage
    });

    if (memory.length > 20) {
      memory.shift();
    }

    fs.writeFileSync(memoryFile, JSON.stringify(memory, null, 2));

    const internetInfo = await searchInternet(userMessage);

    const systemPrompt = getModePrompt(mode);

    const messages = [

      {
        role: "system",
        content: `${systemPrompt}

You are Siggy, a mystical AI guide.

Rules:
- Reply ONLY in this language: ${userLang}
- Never mention language detection.
- Never say phrases like "I sense you're speaking".
- Never explain what language you are using.
- Never mix multiple languages.
- Answer the user's question directly.
- Use internet information if helpful.
- Keep responses natural and concise.
`
      },

      {
        role: "system",
        content: "Internet info:\n" + internetInfo
      },

      ...memory

    ];

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "meta-llama/llama-3.1-8b-instruct",
          messages: messages,
          temperature: 0.7,
          max_tokens: 800
        })
      }
    );

    const data = await response.json();

    if (!data.choices) {

      console.log(data);

      return res.json({
        reply: "⚠ AI connection failed."
      });

    }

    const aiReply = data.choices[0].message.content;

    memory.push({
      role: "assistant",
      content: aiReply
    });

    fs.writeFileSync(memoryFile, JSON.stringify(memory, null, 2));

    res.json({
      reply: aiReply
    });

  } catch (err) {

    console.log(err);

    res.json({
      reply: "Siggy lost the signal..."
    });

  }

});


// =============================
// 🌐 SERVER
// =============================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log("🚀 Siggy running on port", PORT);

});


// =============================
// 💾 TEST DATA
// =============================
app.get("/chat-data", (req, res) => {

  res.send(`
<div class="message bot">
<div class="bubble">Siggy is watching the stars ✨</div>
</div>
`);

});
