const chat = document.getElementById("chat")
const input = document.getElementById("input")
const send = document.getElementById("send")
const attach = document.getElementById("attach")
const fileInput = document.getElementById("fileInput")

let memory = []

function addMessage(text,user,img=null){

const msg = document.createElement("div")
msg.className="message"

if(user){

msg.classList.add("user")

msg.innerHTML=`
<div class="bubble">
${img ? `<img src="${img}" style="max-width:200px;border-radius:10px"><br>`:""}
${text}
</div>
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

send.onclick=sendMessage

function sendMessage(){

const text=input.value
if(!text) return

addMessage(text,true)

memory.push({role:"user",content:text})

input.value=""

botTyping()

fetch("/chat",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
message:text,
memory:memory
})

})

.then(res=>res.json())
.then(data=>{

removeTyping()

memory.push({role:"assistant",content:data.reply})

addMessage(data.reply,false)

})

}

input.addEventListener("keydown",e=>{
if(e.key==="Enter"){
e.preventDefault()
sendMessage()
}
})

/* IMAGE UPLOAD */

attach.onclick=()=>{
fileInput.click()
}

fileInput.onchange=()=>{

const file=fileInput.files[0]
if(!file) return

const reader=new FileReader()

reader.onload=e=>{

const base64=e.target.result

addMessage("Image sent",true,base64)

botTyping()

fetch("/image",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
image:base64
})
})
.then(res=>res.json())
.then(data=>{
removeTyping()
addMessage(data.reply,false)
})

}

reader.readAsDataURL(file)

}

/* VOICE */

const voice=document.getElementById("voice")

const recognition=new webkitSpeechRecognition()

recognition.lang="auto"
recognition.continuous=true
recognition.interimResults=true

voice.onclick=()=>{
recognition.start()
voice.classList.add("recording")
}

recognition.onend=()=>{
voice.classList.remove("recording")
}

recognition.onresult=e=>{

let text=""

for(let i=e.resultIndex;i<e.results.length;i++){
text+=e.results[i][0].transcript
}

input.value=text

}

/* typing */

function botTyping(){

const typing=document.createElement("div")

typing.id="typing"
typing.className="message"

typing.innerHTML=`
<img class="avatar bot-avatar" src="bot.png">
<div class="bubble">Siggy is thinking...</div>
`

chat.appendChild(typing)

}

function removeTyping(){

const typing=document.getElementById("typing")

if(typing) typing.remove()

}
