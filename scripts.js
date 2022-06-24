let nickname;

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
loadMessages();

function startDelay(){
    const promise = axios.get('https://mock-api.driven.com.br/api/v6/uol/messages');
    promise.then(start);
}

function start() {
    nickname = prompt("Digite seu lindo nome:");

    const promise = axios.post("https://mock-api.driven.com.br/api/v6/uol/participants",{name: nickname});
    promise.then(validNickname);
    promise.catch(invalidNickname);
}

function validNickname() {
    alert ('Bem-vindo ao chat UOL!');
    reloadMessages();
    setInterval(checkUserStatus, 5000);
    setInterval(reloadMessages, 3000);
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
            chat.innerHTML += message;

        } else if (post.type === "message") {
            
            message = 
            `<div class="${post.type}">
                <span><time>(${post.time})</time> <strong>${post.from}</strong> para <strong>${post.to}</strong>: ${post.text}</span>
            </div>`
            chat.innerHTML += message;

        } else if (post.type === "private_message") {
            
            message = 
            `<div class="${post.type}">
                <span><time>(${post.time})</time> <strong>${post.from}</strong> reservadamente para <strong>${post.to}</strong>: ${post.text}</span>
            </div>`
            if (post.to === nickname){
                chat.innerHTML += message;
            }
        }  
    }

    let lastPost = document.querySelector(".centerContainer :nth-child(100)");
    lastPost.scrollIntoView();
}

function clickSend(){
    let message = document.querySelector("textarea").value;

    const promise = axios.post('https://mock-api.driven.com.br/api/v6/uol/messages',
        {
        from:nickname,
        text:message,
        time: "",
        to: "Todos",
        type: "message"
        }
    );

    promise.then(reloadMessages);
    promise.catch(errorMessage);
}