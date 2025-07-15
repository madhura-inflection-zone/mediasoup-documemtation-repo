"use strict";
// Force HTTPS redirect
if (location.href.substr(0, 5) !== 'https') {
    location.href = 'https' + location.href.substr(4, location.href.length - 4);
}
// Initialize socket
var socket = window.io();
var producer = null;
// Access global variables from HTML
var nameInput = document.getElementById('nameInput');
var localMedia = document.getElementById('localMedia');
var remoteVideos = document.getElementById('remoteVideos');
var remoteAudios = document.getElementById('remoteAudios');
var login = document.getElementById('login');
var control = document.getElementById('control');
var videoMedia = document.getElementById('videoMedia');
var startAudioButton = document.getElementById('startAudioButton');
var stopAudioButton = document.getElementById('stopAudioButton');
var startVideoButton = document.getElementById('startVideoButton');
var stopVideoButton = document.getElementById('stopVideoButton');
var startScreenButton = document.getElementById('startScreenButton');
var stopScreenButton = document.getElementById('stopScreenButton');
var exitButton = document.getElementById('exitButton');
var copyButton = document.getElementById('copyButton');
var devicesButton = document.getElementById('devicesButton');
var devicesList = document.getElementById('devicesList');
var audioSelect = document.getElementById('audioSelect');
var videoSelect = document.getElementById('videoSelect');
nameInput.value = 'user_' + Math.round(Math.random() * 1000);
// Extend socket with request method
socket.request = function request(type, data) {
    if (data === void 0) { data = {}; }
    return new Promise(function (resolve, reject) {
        socket.emit(type, data, function (data) {
            if (data.error) {
                reject(data.error);
            }
            else {
                resolve(data);
            }
        });
    });
};
var rc = null;
function joinRoom(name, room_id) {
    if (rc && rc.isOpen()) {
        console.log('Already connected to a room');
    }
    else {
        initEnumerateDevices();
        rc = new window.RoomClient(localMedia, remoteVideos, remoteAudios, window.mediasoupClient, socket, room_id, name, roomOpen);
        addListeners();
    }
}
function roomOpen() {
    login.className = 'hidden';
    reveal(startAudioButton);
    hide(stopAudioButton);
    reveal(startVideoButton);
    hide(stopVideoButton);
    reveal(startScreenButton);
    hide(stopScreenButton);
    reveal(exitButton);
    reveal(copyButton);
    reveal(devicesButton);
    control.className = '';
    reveal(videoMedia);
}
function hide(elem) {
    elem.className = 'hidden';
}
function reveal(elem) {
    elem.className = '';
}
function addListeners() {
    if (!rc)
        return;
    rc.on(window.RoomClient.EVENTS.startScreen, function () {
        hide(startScreenButton);
        reveal(stopScreenButton);
    });
    rc.on(window.RoomClient.EVENTS.stopScreen, function () {
        hide(stopScreenButton);
        reveal(startScreenButton);
    });
    rc.on(window.RoomClient.EVENTS.stopAudio, function () {
        hide(stopAudioButton);
        reveal(startAudioButton);
    });
    rc.on(window.RoomClient.EVENTS.startAudio, function () {
        hide(startAudioButton);
        reveal(stopAudioButton);
    });
    rc.on(window.RoomClient.EVENTS.startVideo, function () {
        hide(startVideoButton);
        reveal(stopVideoButton);
    });
    rc.on(window.RoomClient.EVENTS.stopVideo, function () {
        hide(stopVideoButton);
        reveal(startVideoButton);
    });
    rc.on(window.RoomClient.EVENTS.exitRoom, function () {
        hide(control);
        hide(devicesList);
        hide(videoMedia);
        hide(copyButton);
        hide(devicesButton);
        reveal(login);
    });
}
var isEnumerateDevices = false;
function initEnumerateDevices() {
    // Many browsers, without the consent of getUserMedia, cannot enumerate the devices.
    if (isEnumerateDevices)
        return;
    var constraints = {
        audio: true,
        video: true
    };
    navigator.mediaDevices
        .getUserMedia(constraints)
        .then(function (stream) {
        enumerateDevices();
        stream.getTracks().forEach(function (track) {
            track.stop();
        });
    })
        .catch(function (err) {
        console.error('Access denied for audio/video: ', err);
    });
}
function enumerateDevices() {
    // Load mediaDevice options
    navigator.mediaDevices.enumerateDevices().then(function (devices) {
        return devices.forEach(function (device) {
            var el = null;
            if ('audioinput' === device.kind) {
                el = audioSelect;
            }
            else if ('videoinput' === device.kind) {
                el = videoSelect;
            }
            if (!el)
                return;
            var option = document.createElement('option');
            option.value = device.deviceId;
            option.innerText = device.label;
            el.appendChild(option);
            isEnumerateDevices = true;
        });
    });
}
// Make functions globally available
window.joinRoom = joinRoom;
//# sourceMappingURL=index.js.map