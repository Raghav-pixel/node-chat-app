const socket =  io()

// Elements
const $messageForm = document.querySelector('#message-form')
const $messageFormButton = $messageForm.querySelector('button')
const $messageFormInput = $messageForm.querySelector('input')
const $sendLocationButton = document.querySelector('#send-location')
const $messages = document.querySelector('#messages')

// Templates
const messageTemplates = document.querySelector('#message-template').innerHTML
const locationMessageTemplates = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate   =   document.querySelector('#sidebar-template').innerHTML

// Options

const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true})


const autoScroll    =   ()=>{

    //  New message content
    const $newMessage   =   $messages.lastElementChild

    //  Height of the message
    const newMessageStyles  =   getComputedStyle($newMessage)
    const newMessageMargin  =   parseInt(newMessageStyles.marginBottom)
    const newMessageHeight  =   $newMessage.offsetHeight + newMessageMargin

    //  Visible Height
    const visibleHeight =   $messages.offsetHeight

    //  Height of messages container
    const containerHeight   =   $messages.scrollHeight

    //  How far have I scrolled
    const scrolloffset  =   $messages.scrollTop + visibleHeight

    if(containerHeight - newMessageHeight <= scrolloffset){
        $messages.scrollTop =   $messages.scrollHeight
    }
}

socket.on('message', (message)=>{
    console.log(message)

    const html = Mustache.render(messageTemplates, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
    })

socket.on('locationMessage', (message)=>{
    const html = Mustache.render(locationMessageTemplates, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
    console.log(message)
})

socket.on('roomData', ({room, users})=>{
    const html  =   Mustache.render(sidebarTemplate , {
        room,
        users
    })
    document.querySelector('#sidebar').innerHTML    =   html
})

$messageForm.addEventListener('submit', (e)=>{
    e.preventDefault()

    $messageFormButton.setAttribute('disabled', 'disabled')
    
    const message =  e.target.elements.message.value 

    socket.emit('sendMessage', message, (error)=>{

        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if(error){
            return console.log(error)
        }
        console.log('The message was delivered!')
    })
})

     // Location

    $sendLocationButton.addEventListener('click', ()=>{

        $sendLocationButton.setAttribute('disabled', 'disabled')
         
    if(!navigator.geolocation){
       return alert('GeoLocation is not supported by your browser')
    }

    navigator.geolocation.getCurrentPosition((position)=>{

        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, (error)=>{
            console.log(error1)
            $sendLocationButton.removeAttribute('disabled')
            if(error){
                return console.log(error)
            }
            console.log('Location shared')
        })
    })
})

socket.emit('join', {username, room}, (error)=>{
    if(error){
        alert(error)
        location.href= '/'
    }
})