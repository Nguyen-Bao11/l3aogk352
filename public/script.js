const chat = document.getElementById("chat")
const input = document.getElementById("input")
const send = document.getElementById("send")

/* ENTER SEND */

input.addEventListener("keydown", function(e){

if(e.key === "Enter" && !e.shiftKey){
e.preventDefault()
send.click()
}

})

/* ADD MESSAGE */

function addMessage(text, user){

const msg = document.createElement("div")
msg.className = "message"

if(user){

msg.classList.add("user")

msg.innerHTML = `
<div class="bubble">${text}</div>
<img class="avatar user-avatar" src="user.png">
`

}else{

msg.innerHTML = `
<img class="avatar bot-avatar" src="bot.png">
<div class="bubble">${text}</div>
`

}

chat.appendChild(msg)

/* AUTO SCROLL FIX */
chat.scrollTo({
top: chat.scrollHeight,
behavior: "smooth"
})

}

/* SEND MESSAGE */

send.onclick = () => {

const text = input.value

if(!text) return

hideIntro()

addMessage(text,true)

input.value=""

botTyping()

fetch("/chat",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
message:text
})

})
.then(res=>res.json())
.then(data=>{

removeTyping()

addMessage(data.reply,false)

})
.catch(err=>{

removeTyping()

addMessage("Siggy lost connection to the arcane realm... ⚡",false)

})

}

/* LOAD OLD CHAT */

window.onload = function() {
  chat.innerHTML = "";
}

/* PARTICLES */

tsParticles.load("tsparticles",{

particles:{
number:{value:60},
color:{value:"#a78bfa"},
links:{
enable:true,
color:"#a78bfa",
distance:150
},
move:{
enable:true,
speed:1
},
size:{
value:2
}
}

})

/* INTRO */

let startedChat = false

function hideIntro(){

if(startedChat) return
startedChat = true

document.body.classList.add("chat-mode")

const intro = document.querySelector(".title-zone")

if(intro){
intro.classList.add("hide")
}

}

/* BOT TYPING */

function botTyping(){

const typing = document.createElement("div")

typing.className = "message bot typing"
typing.id = "typing"

typing.innerHTML = `
<img class="avatar bot-avatar" src="bot.png">
<div class="bubble">Siggy is thinking...</div>
`

chat.appendChild(typing)

chat.scrollTop = chat.scrollHeight

}

function removeTyping(){

const typing = document.getElementById("typing")

if(typing){
typing.remove()
}

}

/* FILE UPLOAD */

const attach = document.getElementById("attach")
const fileInput = document.getElementById("fileInput")

attach.onclick = () => {

fileInput.click()

}

fileInput.onchange = () => {

const file = fileInput.files[0]

if(!file) return

/* IMAGE PREVIEW */

if(file.type.startsWith("image/")){

const reader = new FileReader()

reader.onload = function(e){

addMessage(
`<img src="${e.target.result}" style="max-width:200px;border-radius:10px">`,
true
)

}

reader.readAsDataURL(file)

}else{

addMessage("📎 " + file.name, true)

}

}

/* VOICE */

const voice = document.getElementById("voice")

if ('webkitSpeechRecognition' in window) {

const recognition = new webkitSpeechRecognition()

recognition.lang = "auto"
recognition.continuous = true
recognition.interimResults = true

voice.onclick = () => {

recognition.start()

voice.classList.add("recording")

}

recognition.onend = ()=>{

voice.classList.remove("recording")

}

recognition.onresult = (event) => {

let text=""

for(let i=0;i<event.results.length;i++){

text += event.results[i][0].transcript

}

input.value = text

}

}

/* MODE SELECT */

const mode = document.getElementById("mode")

mode.onchange = () => {

const selected = mode.value

console.log("Mode:", selected)

}

/* IMAGE ZOOM */

document.addEventListener("click", function(e){

if(e.target.tagName === "IMG" && e.target.closest(".bubble")){

const overlay = document.createElement("div")
overlay.className = "image-overlay"

overlay.innerHTML = `
<img src="${e.target.src}" class="zoom-image">
`

document.body.appendChild(overlay)

overlay.onclick = ()=>{
overlay.remove()
}

}

})

app.post("/search", async (req,res)=>{

const query = req.body.query

const response = await fetch(
`https://google.serper.dev/search`,
{
method:"POST",
headers:{
"X-API-KEY":process.env.SERPER_KEY,
"Content-Type":"application/json"
},
body:JSON.stringify({q:query})
}
)

const data = await response.json()

res.json(data)

})
