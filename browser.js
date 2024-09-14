var socketStarted = false
var playerId = null;

function updatePlayerId() {
    var players = document.getElementById("online");
    let playerIdInput = players.value.split(": ")[1];

    var urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has("user") && playerIdInput === undefined) {
        playerId = urlParams.get("user");
        for (let i = 0; i < players.list.options.length; i++) {
            if (playerId === players.list.options[i].value.split(": ")[1]) {
                players.value = players.list.options[i].value;
                return true;
            }
        }
    }
    playerId = players.value.split(": ")[1];
    if (playerId) {
        window.history.pushState({}, "", `?user=${playerId}`);
    }
    return !!playerId;
}

function startWebSocket() {
    console.log(socketStarted);
    initMusic();
    if (socketStarted) {
        return;
    }
    if (!playerId) {
        return;
    }
    console.log("Opening socket");
    const socket = new WebSocket("wss://hs.vtolvr.live");

    socket.addEventListener("open", (event) => {
        socket.send(JSON.stringify({type: "subscribe", data: ["kill"], pid: self.crypto.randomUUID()}));
    });

    socket.addEventListener("message", (event) => {
        const message = JSON.parse(event.data);
        console.log(JSON.stringify(message));
        console.log("Current playerid is: " + playerId);
        if (message.type === "ping") {
            socket.send(JSON.stringify({type: "pong"}));
        } else {
            console.log(JSON.stringify(message));
            if (message.data.killer.ownerId === playerId || playerId === "*") {
                var musicPlayer = document.getElementById("musicPlayer");
                musicPlayer.play();
            }
        }
    });
    var websocketStatus = document.getElementById("websocket-status");
    websocketStatus.textContent = "Websocket: Connected";
    websocketStatus.style.color = "#AAFFAA";
    socketStarted = true;
}

function initAndPlayMusic() {
    initMusic();
    playMusic();
}

function initMusic() {
    var musicPlayer = document.getElementById("musicPlayer");

    var musicFile = document.getElementById("musicFile").files[0];
    if (musicFile === undefined) {
        var soundSelect = document.getElementById("kill_sound");
        var srcUrl = soundSelect.options[soundSelect.selectedIndex].value;
        musicPlayer.src = "https://cdn.jsdelivr.net/gh/sustorm2/sustorm2.github.io/" + srcUrl;
        var volume = 1.0;
        if (soundSelect.selectedIndex == 1)
            volume = 0.1;
        if (soundSelect.selectedIndex == 2)
            volume = 0.05;
        var volumeSlider = document.getElementById("volume");
        volumeSlider.value = volume;
        musicPlayer.volume = volume;

    } else {
        musicPlayer.src = URL.createObjectURL(musicFile);
        var volumeSlider = document.getElementById("volume");
        musicPlayer.volume = volume;
    }
}

function playMusic() {
    var musicPlayer = document.getElementById("musicPlayer");
    var volume = document.getElementById("volume").value;
    musicPlayer.volume = volume;
    musicPlayer.play();
}

window.onload = function() {
    initMusic();
    console.log("Fetching users");
    var players = document.getElementById("online");
    var options = document.getElementById("players");

    players.onchange = (event) => {
        if (updatePlayerId()) {
            startWebSocket();
        } else {
            console.log("Invalid player id");
        }
    }

    fetch("https://hs.vtolvr.live/api/v1/public/online")
        .then(response => {
            if (!response.ok) {
                throw new Error("Error fetching users");
            }
            return response.json();
        })
        .then(data => {
            console.log(data);
            for (var element of data) {
                var option = document.createElement("option");
                option.text = element.name + ": " + element.id;
                options.appendChild(option);
            }
            if (updatePlayerId()) {
                startWebSocket();
            } else {
                console.log("Invalid player id");
            }
        })
        .catch(error => {
            console.log("Error:", error);
        });
};
