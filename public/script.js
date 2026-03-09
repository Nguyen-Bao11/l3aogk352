const chat = document.getElementById("chat")
const input = document.getElementById("input")
const send = document.getElementById("send")

/* HISTORY */

let history = JSON.parse(localStorage.getItem("siggy_history")) || []

history.forEach(msg=>{
renderMessage(msg.text,msg.user)
})

/* ENTER SEND */

input.addEventListener("keydown",(e)=>{
if(e.key==="Enter" && !e.shiftKey){
e.preventDefault()
send.click()
}
})

/* RENDER MESSAGE */

function renderMessage(text,user){

const msg=document.createElement("div")
msg.className="message"

if(user){

msg.classList.add("user")

msg.innerHTML=`
<div class="bubble">${text}</div>
<img class="avatar user-avatar" src="user.png">
`

}else{

msg.innerHTML=`
<img class="avatar bot-avatar" src="bot.png">
<div class="bubble">${text}</div>
`

}

chat.appendChild(msg)
chat.scrollTop=chat.scrollHeight
}

/* ADD MESSAGE */

function addMessage(text,user){

renderMessage(text,user)

if(text){
history.push({text,user})
localStorage.setItem("siggy_history",JSON.stringify(history))
}

}

/* TYPE EFFECT */

function typeEffect(text,callback){

if(!text) return

let i=0
let output=""

const interval=setInterval(()=>{

output+=text.charAt(i)
i++

callback(output)

if(i>=text.length){
clearInterval(interval)
}

},15)

}

/* SPEAK */

function speak(text){

if(!("speechSynthesis" in window)) return

const speech=new SpeechSynthesisUtterance(text)

speech.lang="en-US"
speech.rate=1
speech.pitch=1

speechSynthesis.speak(speech)

}

/* SEND */

send.onclick=()=>{

const text=input.value.trim()
if(!text) return

hideIntro()

addMessage(text,true)

input.value=""

botTyping()

fetch("/chat",{
method:"POST",
headers:{ "Content-Type":"application/json"},
body:JSON.stringify({message:text})
})
.then(res=>res.json())
.then(data=>{

removeTyping()

renderMessage("",false)

const bubbles=document.querySelectorAll(".message .bubble")
const last=bubbles[bubbles.length-1]

typeEffect(data.reply,(t)=>{
last.innerText=t
})

speak(data.reply)

})
.catch(()=>{
removeTyping()
addMessage("Siggy lost connection to the arcane realm ⚡",false)
})

}

/* PARTICLES */

if(window.tsParticles){

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
size:{value:2}
}
})

}

/* INTRO */

let startedChat=false

function hideIntro(){

if(startedChat) return
startedChat=true

document.body.classList.add("chat-mode")

const intro=document.querySelector(".title-zone")

if(intro){
intro.classList.add("hide")
}

}

/* BOT TYPING */

function botTyping(){

const typing=document.createElement("div")

typing.className="message bot typing"
typing.id="typing"

typing.innerHTML=`
<img class="avatar bot-avatar" src="bot.png">
<div class="bubble">Siggy is thinking...</div>
`

chat.appendChild(typing)
chat.scrollTop=chat.scrollHeight

}

function removeTyping(){

const typing=document.getElementById("typing")

if(typing){
typing.remove()
}

}

/* FILE */

const attach=document.getElementById("attach")
const fileInput=document.getElementById("fileInput")

attach.onclick=()=>fileInput.click()

fileInput.onchange=()=>{

const file=fileInput.files[0]
if(!file) return

hideIntro()

if(file.type.startsWith("image/")){

const reader=new FileReader()

reader.onload=(e)=>{

const msg=document.createElement("div")
msg.className="message user"

msg.innerHTML=`
<div class="bubble image-bubble">
<img src="${e.target.result}" class="chat-image">
</div>
<img class="avatar user-avatar" src="user.png">
`

chat.appendChild(msg)

}

reader.readAsDataURL(file)

}else{

addMessage("📎 "+file.name,true)

}

const formData=new FormData()
formData.append("file",file)

botTyping()

fetch("/analyze",{method:"POST",body:formData})
.then(res=>res.json())
.then(data=>{
removeTyping()
addMessage(data.reply,false)
})
.catch(()=>{
removeTyping()
addMessage("Siggy could not analyze the artifact ⚡",false)
})

}

/* VOICE */

const voice=document.getElementById("voice")

const SpeechRecognition=window.SpeechRecognition || window.webkitSpeechRecognition

let recognition

if(SpeechRecognition){

recognition=new SpeechRecognition()

recognition.lang="en-US"
recognition.continuous=false

voice.onclick=()=>recognition.start()

recognition.onresult=(event)=>{

const text=event.results[0][0].transcript
input.value=text

}

}

/* MODE */

const mode=document.getElementById("mode")

mode.onchange=()=>{
console.log("Mode:",mode.value)
}
