//console.log("Chat.js Read")
//var socket=io()
// make connection with server from user side
// socket.on('connect', function(){
//   console.log('Connected to Server')
 
// })
//io()

/*
const socket=io()//allows us to send and receive event 
const btn=document.getElementById("increment")
socket.on('countUpdated',(count)=>{
    console.log("Count has been updated",count)
   
})

btn.addEventListener('click',()=>{
    console.log("clicked")
    socket.emit('increment')

})

const socket=io()


*/
const socket=io()


const $messageForm=document.getElementById('blog')
const $messageFormInput=$messageForm.querySelector('input')
const $messageFormButton=$messageForm.querySelector('button')
const $sendLocationBtn=document.querySelector('#send-location')
const $messages=document.querySelector('#messages')

//Templates

const $messageTemplate=document.querySelector('#message-template').innerHTML
const $locationTemplate=document.querySelector('#location-template').innerHTML
const sidebarTemplate=document.querySelector('#sidebar-template').innerHTML


//option
const {username,room}=  Qs.parse(location.search,{ignoreQueryPrefix:true})


const autoScroll=()=>{
    // New message elelmt

    const $newMessage=$messages.lastElementChild

    //Height of the last new message
    
    const newMessageStyles=getComputedStyle($newMessage)
    const newMessageMargin=parseInt(newMessageStyles.marginBottom)
    const newMessageHeight=$newMessage.offsetHeight+newMessageMargin
    //console.log(newMessageMargin)

    //Visisble Height

    const visibleHeight=$messages.offsetHeight

    //Height of messages container

    const contentHeight=$messages.scrollHeight
    
    // How far have I scrolled?

    const scrollOffSet=$messages.scrollTop+visibleHeight

    if(contentHeight-newMessageHeight<=scrollOffSet){

        $messages.scrollTop=$messages.scrollHeight

    }



}



socket.on('message',(message)=>{
    //console.log(message)
    const html=Mustache.render($messageTemplate,{username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format('h:mm A')     
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()



})


socket.on('locationMessage',(url)=>{
  //  console.log(url)
    const html=Mustache.render($locationTemplate,{username:url.username,
        url:url.text,
        createdAt:moment(url.createdAt).format('hh:mm A')
    
    })

    $messages.insertAdjacentHTML('beforeend',html)
    autoScroll()
})

$messageForm.onsubmit=(e)=>{
     e.preventDefault()
     $messageFormButton.setAttribute("disabled","disabled")
    

     const userMessage=e.target.elements.userMessage.value
 //    console.log(userMessage)
  socket.emit('sendMessage',userMessage,(ack)=>{ // (event,any no of arguments , function that runs on event acknowledgement)

    $messageFormButton.removeAttribute("disabled")
    $messageFormInput.value=""
    $messageFormInput.focus()

  //  console.log(ack)


  })
    }

$sendLocationBtn.addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert('GeoLocatiobn is not supported')
    }
    $sendLocationBtn.setAttribute("disabled","disabled")

    navigator.geolocation.getCurrentPosition((position)=>{
        const geoLocation={
            latitude: position.coords.latitude,
           longitude:position.coords.longitude
        }
       // console.log(geoLocation)
  

       socket.emit("sendLocation",geoLocation,(serverMessage)=>{
        $sendLocationBtn.removeAttribute("disabled")
       // console.log(serverMessage)

       })

    })

})    





socket.on('roomData',({room,users})=>{

    const html=Mustache.render(sidebarTemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML=html


})





socket.emit('join',{username,room},(error)=>{
    if(error){
        alert(error)
        location.href="/"
        console.log(error)
    }
    

})






















//    form.querySelector('button').addEventListener('click',()=>{
//     let userMessage=form.querySelector('input').value
//       console.log("Clicked")
//       console.log(userMessage)
//     socket.on('sendMessage',userMessage)
    
//    })