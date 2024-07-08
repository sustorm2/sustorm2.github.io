var socketStarted = false
function startWebSocket() {
    console.log(socketStarted);
    initMusic();
    if (socketStarted) {
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
        if (message.type === "ping") {
            socket.send(JSON.stringify({type: "pong"}));
        } else {
            console.log(JSON.stringify(message));
            var players = document.getElementById("online");
            var playerId = players.value.split(": ")[1];
            console.log(playerId);
            if (message.data.killer.ownerId === playerId || playerId === "*") {
                var musicPlayer = document.getElementById("musicPlayer");
                musicPlayer.play();
            }
        }
    });
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
        startWebSocket();
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
        })
        .catch(error => {
            console.log("Error:", error);
        });
};
