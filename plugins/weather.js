module.exports = {

name:"weather",

run: async function(query){

if(query.includes("weather")){

return "Weather plugin activated."

}

return null

}

}
