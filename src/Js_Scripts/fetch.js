
function ai_Call(userInput){

        return fetch("http://127.0.0.1:5000/responseGenerator",{
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body:JSON.stringify({userMessage:userInput,ExtraData:localStorage.getItem("tasksArr")})
          })
    
}
          let dateObj = String(new Date())
          let timeStr = /\d{2}:\d{2}/.exec(String(dateObj))[0]
console.log(timeStr)

export {ai_Call}