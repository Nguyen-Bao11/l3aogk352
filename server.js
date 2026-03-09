import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import { autoUpdate } from "./autoUpdate.js";
import fs from "fs";

dotenv.config();

const memoryFile = "memory.json";

let memory = [];

if (fs.existsSync(memoryFile)) {
memory = JSON.parse(fs.readFileSync(memoryFile));
}

const app = express();

app.use(express.json());
app.use(express.static("public"));

console.log("API KEY:", process.env.OPENROUTER_API_KEY ? "Loaded ✅" : "Missing ❌");


// 🔄 Auto Update khi khởi động
autoUpdate();


// 🌐 Internet Search
async function searchInternet(query) {

  try {

    const url = "https://api.duckduckgo.com/?q=" + encodeURIComponent(query) + "&format=json";

    const response = await fetch(url);
    const data = await response.json();

    if (data.Abstract) {
      return data.Abstract;
    }

    if (data.RelatedTopics && data.RelatedTopics.length > 0) {
      return data.RelatedTopics[0].Text;
    }

    return "No internet results found.";

  } catch (err) {

    console.log("Search error:", err);
    return "Internet search failed.";

  }

}



// 💬 Chat API
app.post("/chat", async (req, res) => {

  try {

    const userMessage = req.body.message;
    
    memory.push({
role:"user",
content:userMessage
});

fs.writeFileSync(memoryFile, JSON.stringify(memory,null,2));

    // 🌐 lấy thông tin internet
    const internetInfo = await searchInternet(userMessage);

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
role:"system",
content:`You are Siggy, a mystical AI guide`
},

...memory,

{
role:"user",
content:userMessage
}

]

Rules:
- Detect the user's language
- Always reply in the same language
- Be wise, calm and helpful
`
          },

          {
            role: "system",
            content: "Internet info: " + internetInfo
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

      return res.json({
        reply: "⚠ AI connection failed."
      });

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



// 🌐 Server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log("🚀 Siggy running on port", PORT);

});



// 💾 Chat data test
app.get("/chat-data", (req, res) => {

res.send(`
<div class="message bot">
<div class="bubble">Siggy is watching the stars ✨</div>
</div>
`)

});
