const chat = document.getElementById("chat")
const input = document.getElementById("input")
const send = document.getElementById("send")
const mode = document.getElementById("mode")

/* VOICE REPLY TOGGLE */

let voiceEnabled = true

/* ENTER SEND */

input.addEventListener("keydown", function(e){

if(e.key === "Enter" && !e.shiftKey){
e.preventDefault()
send.click()
}

})

/* LANGUAGE DETECT */

function detectLanguage(text){

const langMap = {
vi:/[ăâêôơưđ]/i,
ja:/[\u3040-\u30ff]/,
ko:/[\uac00-\ud7af]/,
ru:/[а-яА-Я]/,
zh:/[\u4e00-\u9fff]/,
ar:/[\u0600-\u06FF]/,
hi:/[\u0900-\u097F]/,
th:/[\u0E00-\u0E7F]/
}

for(const lang in langMap){
if(langMap[lang].test(text)){
return lang
}
}

return "en"

}

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

chat.scrollTo({
top: chat.scrollHeight,
behavior: "smooth"
})

}

/* STREAMING TEXT */

function typeWriter(text){

const msg = document.createElement("div")

msg.className = "message"

msg.innerHTML = `
<img class="avatar bot-avatar" src="bot.png">
<div class="bubble" id="stream"></div>
`

chat.appendChild(msg)

const bubble = msg.querySelector("#stream")

let i = 0

function typing(){

if(i < text.length){

bubble.innerHTML += text.charAt(i)

i++

chat.scrollTop = chat.scrollHeight

setTimeout(typing,20)

}else{

if(voiceEnabled){
speak(text)
}

}

}

typing()

}

/* VOICE REPLY */

function speak(text){

const speech = new SpeechSynthesisUtterance()

speech.text = text
speech.lang = "en-US"

speech.rate = 1
speech.pitch = 1

window.speechSynthesis.speak(speech)

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

/* SEND MESSAGE */

send.onclick = () => {

const text = input.value

if(!text) return

hideIntro()

addMessage(text,true)

input.value=""

botTyping()

const language = detectLanguage(text)

const selectedMode = mode.value

fetch("/chat",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
message:text,
lang:language,
mode:selectedMode
})

})
.then(res=>res.json())
.then(data=>{

removeTyping()

typeWriter(data.reply)

})
.catch(err=>{

removeTyping()

addMessage("Siggy lost connection to the arcane realm... ⚡",false)

})

}

/* LOAD OLD CHAT */

window.onload = function() {
chat.innerHTML = ""
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

/* FILE UPLOAD */

const attach = document.getElementById("attach")
const fileInput = document.getElementById("fileInput")

attach.onclick = () => {
fileInput.click()
}

fileInput.onchange = () => {

const file = fileInput.files[0]

if(!file) return

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

/* VOICE INPUT */

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

/* VOICE TOGGLE BUTTON */

const voiceToggle = document.getElementById("voiceToggle")

if(voiceToggle){

voiceToggle.onclick = () => {

voiceEnabled = !voiceEnabled

if(voiceEnabled){

voiceToggle.innerText = "🔊"

}else{

voiceToggle.innerText = "🔇"

window.speechSynthesis.cancel()

}

}

}
