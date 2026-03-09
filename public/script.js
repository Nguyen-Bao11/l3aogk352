const chat = document.getElementById("chat")
const input = document.getElementById("input")
const send = document.getElementById("send")

input.addEventListener("keydown", function(e){

if(e.key === "Enter" && !e.shiftKey){
e.preventDefault()
send.click()
}

})

function addMessage(text, user){

const chat = document.getElementById("chat")

const msg = document.createElement("div")
msg.className = "message"

if(user){
msg.classList.add("user")
msg.innerHTML = `
<div class="bubble">${text}</div>
<img class="avatar user-avatar" src="user.png">
`
}
else{
msg.innerHTML = `
<img class="avatar bot-avatar" src="bot.png">
<div class="bubble">${text}</div>
`
}

chat.appendChild(msg)
chat.scrollTop = chat.scrollHeight

/* LƯU CHAT */
localStorage.setItem("siggy_chat", chat.innerHTML)

}

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

/* LOAD CHAT CŨ */

const saved = localStorage.getItem("siggy_chat")
if(saved){
chat.innerHTML = saved
}

/* particles */

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

function botTyping(){

const chat = document.getElementById("chat")

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

/* UPLOAD FILE */

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

addMessage(`<img src="${e.target.result}" style="max-width:200px;border-radius:10px">`, true)

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
text+=event.results[i][0].transcript
}

input.value = text

}

}

const mode = document.getElementById("mode")

mode.onchange = () => {

const selected = mode.value

console.log("Mode:", selected)

}
