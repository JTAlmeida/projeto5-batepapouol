let nickname;
let tipoMensagem = "message";
let recipient = "Todos";

function errorMessage(element) {
    let status = (element.response.status);

    alert (`Erro ${status}, sua página será recarregada.`);
    window.location.reload();
}

function loadMessages() {
    const promise = axios.get('https://mock-api.driven.com.br/api/v6/uol/messages');
    promise.then(showPosts);
    promise.catch(errorMessage);
    promise.then(startDelay);
}

function startDelay(){
    const promise = axios.get('https://mock-api.driven.com.br/api/v6/uol/messages');
    promise.then(start);
}

function start() {
    nickname = document.querySelector(".nickname").value;

    const promise = axios.post("https://mock-api.driven.com.br/api/v6/uol/participants",{name: nickname});
    promise.then(validNickname);
    promise.catch(invalidNickname);
}

function validNickname() {
    loadingScreen();
    reloadMessages();
    loadParticipants();
    setInterval(checkUserStatus, 5000);
    setInterval(reloadMessages, 3000);
    setInterval(loadParticipants, 10000);
}

function invalidNickname(element){
    let status = (element.response.status);
    if (status === 400) {
        alert (`Este nome já está sendo usado, tente novamente.`);
        start();

    } else {
        alert (`Erro ${status}`);
        start();
    }
}

function reloadMessages() {
    const promise = axios.get('https://mock-api.driven.com.br/api/v6/uol/messages');
    promise.then(showPosts);
    promise.catch(errorMessage);
}

function checkUserStatus(){
    axios.post('https://mock-api.driven.com.br/api/v6/uol/status',{name: nickname});
}

function showPosts (element){
    let messageQuantity = element.data.length;
    let chat = document.querySelector(".centerContainer")
    chat.innerHTML = "";
    
    for (let i = 0; i < messageQuantity; i++){
        let post = element.data[i];
        let message;

        if (post.type === "status") {            
            message = 
            `<div class="${post.type}">
                <span><time>(${post.time})</time> <strong>${post.from}</strong> ${post.text}</span>
            </div>`
        } else if (post.type === "message") {           
            message = 
            `<div class="${post.type}">
                <span><time>(${post.time})</time> <strong>${post.from}</strong> para <strong>${post.to}</strong>: ${post.text}</span>
            </div>`            
        } else if ( (post.to === nickname || post.from === nickname) && post.type === "private_message") {            
            message = 
            `<div class="${post.type}">
                <span><time>(${post.time})</time> <strong>${post.from}</strong> reservadamente para <strong>${post.to}</strong>: ${post.text}</span>
            </div>`
        }  
        chat.innerHTML += message;
    }

    let lastPost = document.querySelector(".centerContainer :nth-child(100)");
    lastPost.scrollIntoView();
}

function clickSend(){
    let message = document.querySelector("textarea").value;
    document.querySelector("textarea").value = "";
    const promise = axios.post('https://mock-api.driven.com.br/api/v6/uol/messages',
        {
        from:nickname,
        text:message,
        time: "",
        to: recipient,
        type: tipoMensagem,
        }
    );
    promise.then(reloadMessages);
    promise.catch(errorMessage);
}

document.querySelector(".input").addEventListener("keydown", function (e) {
    if (e.key === "Enter") {  
        clickSend();
    }
});

document.querySelector(".nickname").addEventListener("keydown", function (e) {
    if (e.key === "Enter") {  
        start();
    }
});  

function loadingScreen() {
    document.querySelector(".nickname").classList.add("hidden");
    document.querySelector(".loginScreen button").classList.add("hidden");
    document.querySelector(".loading").classList.remove("hidden");

    setTimeout(hideLoading,1500);
}

function hideLoading() {
    document.querySelector(".loginScreen").classList.add("hidden");
}


function toggleSideMenu() {
    document.querySelector(".sideMenu").classList.toggle('hidden')
}

function loadParticipants() {
    let promise = axios.get("https://mock-api.driven.com.br/api/v6/uol/participants");
    promise.then(showParticipants);
}

function showParticipants(promise) {
    let toAll = [{name: "Todos"}];
    let listParticipants = toAll.concat(promise.data);
    let numParticipants = listParticipants.length;
    let list = document.querySelector(".contacts");
    list.innerHTML = "";

    for (let i = 0; i < numParticipants; i++){
        let participant = listParticipants[i];
        let contactList;

        if (participant.name !== recipient){
            contactList = `
            <div class="contato" onclick="selectName(this)">
                <ion-icon name="person-circle"></ion-icon>
                <h2>${participant.name}</h2>
                <ion-icon name="checkmark-outline"></ion-icon>
            </div>
            `;
        } else {       
            contactList = `
            <div class="contato selected" onclick="selectName(this)">
                <ion-icon name="person-circle"></ion-icon>
                <h2>${participant.name}</h2>
                <ion-icon name="checkmark-outline"></ion-icon>
            </div>
            `;
        }
        list.innerHTML += contactList;
    }

    let contactName = document.querySelector(".contacts .selected");
    if (contactName === null){
        document.querySelector(".contacts :nth-child(1)").classList.add("selected");
        recipient = "Todos";
        document.querySelector(".bottom h2").innerHTML = `Enviando para ${recipient}`
    }
}

function selectName(div) {

    let contactName = document.querySelector(".contacts .selected");
    if (contactName !== null){
        contactName.classList.remove("selected");
    }
    div.classList.toggle('selected');

    recipient = div.querySelector("h2").innerHTML;
    document.querySelector(".bottom h2").innerHTML = `Enviando para ${recipient}`
}

function selectVisibility(div) {

    document.querySelector(".publico").classList.remove('selected');
    document.querySelector(".reservadamente").classList.remove('selected');
    
    div.classList.add('selected');

    let visibilidade = div.querySelector("h2").innerHTML;

    if (visibilidade === "Reservadamente"){
        tipoMensagem = "private_message";
        document.querySelector(".bottom h2").innerHTML = `Enviando para ${recipient} (reservadamente)`
    } else {
        tipoMensagem = "message";
        document.querySelector(".bottom h2").innerHTML = `Enviando para ${recipient}`
    }
}