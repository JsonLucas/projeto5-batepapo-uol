
let paramsData = {
    'userName': '',
    'sendTo': '',
    'messageType': ''
}
const htmlBody = document.querySelector('body');
const containerMessages = document.querySelector('.container-messages');

function loading(){
    const logadingImage = document.querySelector('.enter-username');
    logadingImage.innerHTML = '';
    logadingImage.innerHTML += `<div class='loading'>
        <img src='image/loading.gif'>
        <div class='entering'>Entrando...</div>
    </div>`;
}

function verifyNameInUse(userName){
    let verify = false;
    const request = axios.get('https://mock-api.driven.com.br/api/v4/uol/participants');
    request.then((response) => {
        const data = response.data;
        for(let index in data){
            if(userName.toLowerCase() === data[index].name.toLowerCase()){
                verify = true;
            }
        }
        return verify;
    }).catch((error) => {
        alert('algum erro ocorreu, tente novamente.');
    });
    return verify;
}

function nameInChat(){
    const userName = document.querySelector('.div-input > input').value;
    if(userName !== ''){
        if(verifyNameInUse(userName)){
            alert('este nome já está em uso.');
            window.location.href = 'initial.html';
        }else{
            loading();
            setTimeout(() => { window.location.href = `index.html?user=${userName}` }, 2000);
        }
    }else{
        alert('você deve escrever algum nome de usuário.');
    }
}

function loadFeatures(){
    const url = location.search.slice(6);
    const formatUserName = url.split('%20');
    for(let i = 0; i < formatUserName.length; i++){
        paramsData.userName += formatUserName[i]+' ';
    }
    paramsData.userName = paramsData.userName.trim();
    serverConnection();
    activeUsers();
    setInterval(getInfo, 10000);
    setInterval(isConnected, 5000);
    setInterval(showMessages, 3000);
}

function getInfo(){
    const request = axios.get('https://mock-api.driven.com.br/api/v4/uol/participants');
    request.then((response) => { 
        const data = response.data; //lista de quem tá online
        activeUsers(data);
    }).catch((error) => { 
        alert('falha ao carregar a lista de participantes, recarregue a página.');
    });
}

function activeUsers(data){
    const activeParticipants = document.querySelector('.active-participants');
    activeParticipants.innerHTML = '';
    activeParticipants.innerHTML += "<li class='single-participant'>"
        +"<ion-icon name='people'></ion-icon>"
        +"<span data-identifier='participant' id='Todos' onclick='selectMessageOptions(this);'>Todos</span>"
        +"<span class='non-checked checked'><ion-icon name='checkmark'></ion-icon></span></li>"
    for(let i in data){
        if(data[i].name !== paramsData.userName){
            activeParticipants.innerHTML += `<li class='single-participant'>
            <ion-icon name="person-circle"></ion-icon>
            <span data-identifier='participant' id='${data[i].name}' onclick='selectMessageOptions(this);'>${data[i].name}</span>
            <span class='non-checked checked'><ion-icon name="checkmark"></ion-icon></span></li>`;
        }
    }
}

function serverConnection(){
    const request = axios.post('https://mock-api.driven.com.br/api/v4/uol/participants', {'name': paramsData.userName});
    request.then((response) => { 
    }).catch((error) => {
        alert('você foi deconectado.');
        window.location.href='initial.html';
    });
}

function isConnected(){
    const request = axios.post('https://mock-api.driven.com.br/api/v4/uol/status', { 'name': paramsData.userName });
    request.then((response) => {
    }).catch((error) => {
        alert('você foi desconectado');
        window.location.href='initial.html';
    });
}

function showMessages(){
    let rowMessage;
    const request = axios.get('https://mock-api.driven.com.br/api/v4/uol/messages');
    request.then((response) => {
        const data = response.data;
        loadMessages(data);
        rowMessage = document.querySelectorAll('.row-message');
        rowMessage[(rowMessage.length - 1)].scrollIntoView();
    }).catch((error) => {
        alert('falha ao carregar as mensagens.');
    });
}

function loadMessages(data){
    for(let i in data){
        switch(data[i].type){
            case 'message':
                containerMessages.innerHTML += 
                    `<div class='row-message'>
                        <div class='messages' data-identifier='message'>
                            <div class='message-to-all'>
                                <span class='hour'>${data[i].time}</span>
                                <span class='username'>${data[i].from}</span>
                                <span class='messate-to'>para <span>${data[i].to}</span>:</span>
                                <span class='sent-message'>${data[i].text}</span>
                            </div>
                        </div>
                    </div>`
            break;
            case 'private_message': 
                if((data[i].from === paramsData.userName) || (data[i].to === paramsData.userName)){
                    containerMessages.innerHTML += 
                        `<div class='row-message'>
                            <div class='messages' data-identifier='message'>
                                <div class='privative-message'>
                                    <span class='hour'>${data[i].time}</span>
                                    <span class='username'>${data[i].from}</span>
                                    <span class='messate-to'>para <span>${data[i].to}</span>:</span>
                                    <span class='sent-message'>${data[i].text}</span>
                                </div>
                            </div>
                        </div>`;
                }
            break;
            default:
                containerMessages.innerHTML += 
                    `<div class='row-message' data-identifier='message'>
                        <div class='status'>
                            <span class='hour'>${data[i].time}</span>
                            <span class='username'>${data[i].from}</span>
                            <span class='joined'>${data[i].text}</span>
                        </div>
                    </div>`;
            break;
        }
    }
}

function sendMessage(){
    const message = document.querySelector('.message-input');
    if(message.value !== ''){
        if(paramsData.messageType === ''){
            paramsData.messageType = 'public';
        }
        if(paramsData.sendTo === ''){
            paramsData.sendTo = 'Todos';
        }
        switch(paramsData.messageType){
            case 'public':
                body = {
                    'from': paramsData.userName,
                    'to': paramsData.sendTo,
                    'text': message.value,
                    'type': 'message'
                }
            break;
            case 'private':
                body = {
                    'from': paramsData.userName,
                    'to': paramsData.sendTo,
                    'text': message.value,
                    'type': 'private_message'
                }
            break;
        }
        const request = axios.post('https://mock-api.driven.com.br/api/v4/uol/messages', body);
        request.then((response) => {
            message.value = '';
            showMessages();
        }).catch((error) => {
            alert('mensagem não enviada, tente novamente ou atualize a página.');
        });
    }
}

function selectMessageOptions(option){
    const checked = document.querySelector(`#${option.id}`).parentNode.lastChild;
    if((option.id === 'public') || (option.id === 'private')){
        if(paramsData.messageType === ''){
            checked.classList.remove('non-checked');
        }else{
            document.querySelector(`#${paramsData.messageType}`).parentNode.lastChild.classList.remove('checked');
            document.querySelector(`#${paramsData.messageType}`).parentNode.lastChild.classList.add('non-checked');
            checked.classList.remove('non-checked');
            checked.classList.add('checked');
        }
        paramsData.messageType = option.id;
    }else{
        if(paramsData.sendTo === ''){
            checked.classList.remove('non-checked');
        }else{
            document.querySelector(`#${paramsData.sendTo}`).parentNode.lastChild.classList.add('non-checked');
            document.querySelector(`#${paramsData.sendTo}`).parentNode.lastChild.classList.remove('checked');
            checked.classList.remove('non-checked');
            checked.classList.add('checked');
        }
        paramsData.sendTo = option.id;
    }
    if((paramsData.messageType === 'private') && (paramsData.userName !== '')){
        document.querySelector('.content-submit-message > input').style.height = '70%';
        document.querySelector('.subtitle-private').innerHTML = `Enviar para ${paramsData.userName} (reservadamente)`
    }else{
        document.querySelector('.content-submit-message > input').style.height = '100%';
        document.querySelector('.subtitle-private').innerHTML = '';
    }
}

function openNav() {
    document.querySelector("#mySidebar").style.width = "75%";
    document.querySelector('.container-sidebar').style.width = '100%';
    window.addEventListener('click', (event)=>{
        const containerSidebar = document.querySelector('.container-sidebar');
        if(event.target === containerSidebar){
            closeNav();
        }
    });
}

function closeNav() {
    document.querySelector("#mySidebar").style.width = "0";
    document.querySelector('.container-sidebar').style.width = '0';
}

function pressEnterToSend(){
    function keyPressed(evt){
        evt = evt || window.event;
        var key = evt.keyCode || evt.which;
        return key;
    }
    document.onkeypress = (evt) => {
        const key = keyPressed(evt);
        if(key === 13){
            nameInChat();
        }
    };
}

