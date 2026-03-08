# Siggy AI Auto Reply Bot

A simple automatic reply bot with a clean web interface.  
Currently it uses keyword‑based logic, but it can easily be upgraded to OpenAI, Groq, or Llama in the future.

## Features

- Simple chat-style web interface
- `/ask` API (POST) to send questions to the bot
- `/health` endpoint for deployment monitoring
- Easy deployment on Railway, Render, or other Node.js platforms

## Project Structure

siggy-ai-bot/
├── public/
│   └── index.html
├── package.json
├── railway.json
├── README.md
└── server.js

## Installation & Run Locally

1. Clone or download this repository

2. Install dependencies

npm install

3. Start the server

npm start

4. Open your browser

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on " + PORT);
});

## Future Improvements

- Integrate OpenAI API for smarter responses
- Add chat history
- Improve UI with real chat bubbles
- Support multiple languages
