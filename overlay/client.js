var API_Socket = "ws://localhost:8080/";

// Start ws connection after document is loaded
$(document).ready(function () {
    connectWebsocket();
});

$("#header").fitText().fitText(1.2);;
$("#time").fitText().fitText(0.5);;

// Connect to ChatBot websocket
// Automatically tries to reconnect on
// disconnection by recalling this method
function connectWebsocket() {

    //-------------------------------------------
    //  Create WebSocket
    //-------------------------------------------
    var socket = new WebSocket(API_Socket);

    //-------------------------------------------
    //  Websocket Event: OnOpen
    //-------------------------------------------
    socket.onopen = function () {

        var auth = {
            author: "EncryptedThoughts",
            website: "twitch.tv/encryptedthoughts",
            id: "1337",
            request: "Subscribe",
            events: {
                General: [
                    "Custom"
                ]
            }
        };

        // Send authentication data to ChatBot ws server
        socket.send(JSON.stringify(auth));
    };

    //-------------------------------------------
    //  Websocket Event: OnMessage
    //-------------------------------------------
    socket.onmessage = function (message) {

        var socketMessage = JSON.parse(message.data);
        console.log(socketMessage);

        if (socketMessage.event && socketMessage.event.source === "None" && socketMessage.event.type === "Custom") {

            switch (socketMessage.data.name) {
                case "EVENT_WORD_BAN_START":
                    playSuccess = true;
                    $('#bannedword').text(socketMessage.data.word);
                    if (timer > 0)
                        timer += socketMessage.data.seconds;
                    else {
                        var minutes = parseInt(socketMessage.data.seconds / 60, 10);
                        var seconds = parseInt(socketMessage.data.seconds % 60, 10);
                        minutes = minutes < 10 ? "0" + minutes : minutes;
                        seconds = seconds < 10 ? "0" + seconds : seconds;
                        $('#time').text(minutes + ":" + seconds);
                        StartTimer(socketMessage.data.seconds - 1, $('#time'), socketMessage.data.finishedSFXPath, socketMessage.data.finishedSFXVolume);
                        $("body").css('visibility', 'visible');
                        $("body").removeClass("animate__zoomOut");
                        $("body").addClass("animate__zoomIn");
                    }
                    break;
                case "EVENT_WORD_BAN_RESET_TIME":
                    if (timer <= 0) {
                        var minutes = parseInt(socketMessage.data.seconds / 60, 10);
                        var seconds = parseInt(socketMessage.data.seconds % 60, 10);
                        minutes = minutes < 10 ? "0" + minutes : minutes;
                        seconds = seconds < 10 ? "0" + seconds : seconds;
                        $('#time').text(minutes + ":" + seconds);
                        StartTimer(socketMessage.data.seconds - 1, $('#time'), socketMessage.data.finishedSFXPath, socketMessage.data.finishedSFXVolume);
                        $("body").css('visibility', 'visible');
                        $("body").removeClass("animate__zoomOut");
                        $("body").addClass("animate__zoomIn");
                    }
                    else
                        timer = timer - (timer % socketMessage.data.seconds) + socketMessage.data.seconds;
                    break;
                case "EVENT_WORD_BAN_ADD_TIME":
                    if (timer <= 0) {
                        var minutes = parseInt(socketMessage.data.seconds / 60, 10);
                        var seconds = parseInt(socketMessage.data.seconds % 60, 10);
                        minutes = minutes < 10 ? "0" + minutes : minutes;
                        seconds = seconds < 10 ? "0" + seconds : seconds;
                        $('#time').text(minutes + ":" + seconds);
                        StartTimer(socketMessage.data.seconds - 1, $('#time'), socketMessage.data.finishedSFXPath, socketMessage.data.finishedSFXVolume);
                        $("body").css('visibility', 'visible');
                        $("body").removeClass("animate__zoomOut");
                        $("body").addClass("animate__zoomIn");
                    }
                    else
                        timer = timer + socketMessage.data.seconds;
                    break;
                case "EVENT_WORD_BAN_SET_TIME":
                    if (timer <= 0 && socketMessage.data.seconds > 0) {
                        var minutes = parseInt(socketMessage.data.seconds / 60, 10);
                        var seconds = parseInt(socketMessage.data.seconds % 60, 10);
                        minutes = minutes < 10 ? "0" + minutes : minutes;
                        seconds = seconds < 10 ? "0" + seconds : seconds;
                        $('#time').text(minutes + ":" + seconds);
                        StartTimer(socketMessage.data.seconds - 1, $('#time'), socketMessage.data.finishedSFXPath, socketMessage.data.finishedSFXVolume);
                        $("body").css('visibility', 'visible');
                        $("body").removeClass("animate__zoomOut");
                        $("body").addClass("animate__zoomIn");
                    }
                    timer = socketMessage.data.seconds;
                    break;
                case "EVENT_WORD_BAN_FAIL":
                    playSuccess = false;
                    timer = 0;
                    break;
            }
        }
    };

    //-------------------------------------------
    //  Websocket Event: OnError
    //-------------------------------------------
    socket.onerror = function (error) {
        console.log("Error: " + error);
    };

    //-------------------------------------------
    //  Websocket Event: OnClose
    //-------------------------------------------
    socket.onclose = function () {
        // Clear socket to avoid multiple ws objects and EventHandlings
        socket = null;
        // Try to reconnect every 5s
        setTimeout(function () { connectWebsocket() }, 5000);
    };

    var timer = 0
    StartTimer = function (duration, display, path, volume) {
        timer = duration;
        var minutes = parseInt(timer / 60, 10);
        var seconds = parseInt(timer % 60, 10);
        var interval = setInterval(function () {
            minutes = parseInt(timer / 60, 10);
            seconds = parseInt(timer % 60, 10);

            minutes = minutes < 10 ? "0" + minutes : minutes;
            seconds = seconds < 10 ? "0" + seconds : seconds;

            display.text(minutes + ":" + seconds);

            if (timer > 0)
                timer--;
            else {
                timer = 0;
                display.text("00:00");
                clearInterval(interval);
                $("body").removeClass("animate__zoomIn");
                $("body").addClass("animate__zoomOut");
                if (playSuccess)
                    PlaySound(path, volume);
            }
        }, 1000);
    }

    var playSuccess = true;
    PlaySound = function (path, volume) {
        var audio = new Audio(path);
        audio.volume = volume;
        audio.loop = false;
        audio.play();
    }

}
