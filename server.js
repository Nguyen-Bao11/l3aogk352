const express = require("express");
const path = require("path");

const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname,"public")));

/*
Simple AI logic
You can later connect OpenAI API here
*/

function botReply(question){

question = question.toLowerCase()

if(question.includes("ritual")){
 return "Ritual is an AI infrastructure project focused on decentralized compute and AI agents."
}

if(question.includes("chainopera")){
 return "ChainOpera AI is a decentralized AI network enabling collaborative AI training and usage."
}

if(question.includes("blockstreet")){
 return "BlockStreet is a Web3 project exploring blockchain infrastructure and ecosystem tools."
}

if(question.includes("hello") || question.includes("hi")){
 return "Hello! I'm Siggy AI. Ask me about crypto or AI projects."
}

return "I'm Siggy AI. I can answer questions about AI, crypto projects, Ritual, ChainOpera, and BlockStreet."
}

app.post("/ask",(req,res)=>{

const question = req.body.question || ""

const answer = botReply(question)

res.json({
 question: question,
 answer: answer
})

})

app.get("/health",(req,res)=>{
res.json({status:"ok"})
})

const PORT = process.env.PORT || 3000

app.listen(PORT,"0.0.0.0",()=>{
console.log("Siggy AI bot running on port "+PORT)
})