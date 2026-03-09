const chat=document.getElementById("chat")
const input=document.getElementById("input")
const send=document.getElementById("send")

input.addEventListener("keydown",(e)=>{
if(e.key==="Enter"&&!e.shiftKey){
e.preventDefault()
send.click()
}
})

function addMessage(text,user){

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

function typeEffect(text,callback){

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

send.onclick=()=>{

const text=input.value.trim()
if(!text) return

hideIntro()

addMessage(text,true)

input.value=""

botTyping()

fetch("/chat",{
method:"POST",
headers:{"Content-Type":"application/json"},
body:JSON.stringify({message:text})
})
.then(res=>res.json())
.then(data=>{

removeTyping()

addMessage("",false)

const bubbles=document.querySelectorAll(".message .bubble")
const last=bubbles[bubbles.length-1]

typeEffect(data.reply,(t)=>{
last.innerText=t
})

})
.catch(()=>{
removeTyping()
addMessage("Siggy lost connection ⚡",false)
})

}

if(window.tsParticles){

tsParticles.load("tsparticles",{
particles:{
number:{value:60},
color:{value:"#a78bfa"},
links:{enable:true,color:"#a78bfa",distance:150},
move:{enable:true,speed:1},
size:{value:2}
}
})

}

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

function botTyping(){

const typing=document.createElement("div")
typing.className="message"
typing.id="typing"

typing.innerHTML=`
<img class="avatar bot-avatar" src="bot.png">
<div class="bubble">Siggy is thinking...</div>
`

chat.appendChild(typing)

}

function removeTyping(){

const typing=document.getElementById("typing")

if(typing){
typing.remove()
}

}

const attach=document.getElementById("attach")
const fileInput=document.getElementById("fileInput")

attach.onclick=()=>fileInput.click()

fileInput.onchange=()=>{

const file=fileInput.files[0]
if(!file) return

if(file.type.startsWith("image/")){

const reader=new FileReader()

reader.onload=(e)=>{

const msg=document.createElement("div")
msg.className="message user"

msg.innerHTML=`
<div class="bubble">
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

}

const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition

if(SpeechRecognition){

const recognition=new SpeechRecognition()

recognition.lang="en-US"

document.getElementById("voice").onclick=()=>recognition.start()

recognition.onresult=(event)=>{

input.value=event.results[0][0].transcript

}

}
