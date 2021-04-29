const socket = io()

//------------------elements $ means dom elemenets
const $messageform = document.querySelector("#message-form")
const $messageforminput = $messageform.querySelector('input')
const $messageformbutton = $messageform.querySelector('button')
const $sendlocationbutton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')
const $locationurl = document.querySelector('#messages')

//----------------- templates-----------------
const messagetemplate = document.querySelector('#message-template').innerHTML
const locationmessagetemplate = document.querySelector('#location-message-template').innerHTML
const sidebartemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})

const autoscroll= ()=> {
    const $newMessage = $messages.lastElementChild
    
    // Height of the new message  
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    //visible height
    const visibleHeight = $messages.offsetHeight
    
    //height of message container
    const containerHeight = $messages.scrollHeight
    
    //how far have i scrolled
    const scrolloffset = $messages.scrollTop + visibleHeight
  
    if(containerHeight - newMessageHeight <= scrolloffset){
        $messages.scrollTop  = $messages.scrollHeight
    }
}

// ------------------- mustache html js css ---------
socket.on('message',(message)=>{
    console.log(message)
    const html = Mustache.render(messagetemplate,{
        username : message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a' )
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

//message is a object
socket.on('locationmessage',(message)=>{
    console.log(message)
    const html = Mustache.render(locationmessagetemplate, {
        username:message.username,
        url:message.url,
        createdAt: moment(message.createdAt).format('h:mm a' )

    })
    $messages.insertAdjacentHTML('beforeend',html) 
    autoscroll()

})

socket.on('roomData',({room,users})=>{
    const html = Mustache.render(sidebartemplate,{
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML = html
})

//  --------------------------- MESSAGE -----------------------------

document.querySelector('#message-form').addEventListener('submit',(e)=>{
    e.preventDefault()

    //disable form
    $messageformbutton.setAttribute('disabled','disabled')
 
    //using name from index.html in case there are multiple i/ps
    const message = e.target.elements.message.value

    socket.emit('sendmessage', message,(error)=>{

        //reenable form
        $messageformbutton.removeAttribute('disabled')
        $messageforminput.value = ''
        $messageforminput.focus()
    
        if(error){
            return console.log(error)
        }
        console.log('Message delivered')
    })
})

//  -------------- LOCATION ---------------------

document.querySelector('#send-location').addEventListener('click',()=>{
    if(!navigator.geolocation){
        return alert("geolocation is not supported by ur browser")
    }
    $sendlocationbutton.setAttribute('disabled','disabled')

    navigator.geolocation.getCurrentPosition((position)=>
    {
        $sendlocationbutton.removeAttribute('disabled')
        
        socket.emit('sendlocation',{
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            console.log("location shared")
        })
    })
})

socket.emit('join', {username , room},(error) =>{
    if(error){
        alert(error)
        location.href='/'
    }
})