// Force HTTPS redirect
if (location.href.substr(0, 5) !== 'https') {
  location.href = 'https' + location.href.substr(4, location.href.length - 4);
}

// Extend Window interface
interface Window {
  mediasoupClient: any;
  io: any;
  RoomClient: any;
}



// Initialize socket
const socket = window.io();

let producer: any = null;

// Access global variables from HTML
const nameInput = document.getElementById('nameInput') as HTMLInputElement;
const localMedia = document.getElementById('localMedia') as HTMLElement;
const remoteVideos = document.getElementById('remoteVideos') as HTMLElement;
const remoteAudios = document.getElementById('remoteAudios') as HTMLElement;
const login = document.getElementById('login') as HTMLElement;
const control = document.getElementById('control') as HTMLElement;
const videoMedia = document.getElementById('videoMedia') as HTMLElement;
const startAudioButton = document.getElementById('startAudioButton') as HTMLElement;
const stopAudioButton = document.getElementById('stopAudioButton') as HTMLElement;
const startVideoButton = document.getElementById('startVideoButton') as HTMLElement;
const stopVideoButton = document.getElementById('stopVideoButton') as HTMLElement;
const startScreenButton = document.getElementById('startScreenButton') as HTMLElement;
const stopScreenButton = document.getElementById('stopScreenButton') as HTMLElement;
const exitButton = document.getElementById('exitButton') as HTMLElement;
const copyButton = document.getElementById('copyButton') as HTMLElement;
const devicesButton = document.getElementById('devicesButton') as HTMLElement;
const devicesList = document.getElementById('devicesList') as HTMLElement;
const audioSelect = document.getElementById('audioSelect') as HTMLSelectElement;
const videoSelect = document.getElementById('videoSelect') as HTMLSelectElement;

nameInput.value = 'user_' + Math.round(Math.random() * 1000);

// Extend socket with request method
socket.request = function request(type: string, data: any = {}): Promise<any> {
  return new Promise((resolve, reject) => {
    socket.emit(type, data, (data: any) => {
      if (data.error) {
        reject(data.error);
      } else {
        resolve(data);
      }
    });
  });
};

let rc: any = null;

function joinRoom(name: string, room_id: string): void {
  if (rc && rc.isOpen()) {
    console.log('Already connected to a room');
  } else {
    initEnumerateDevices();

    rc = new (window as any).RoomClient(localMedia, remoteVideos, remoteAudios, window.mediasoupClient, socket, room_id, name, roomOpen);

    addListeners();
  }
}

function roomOpen(): void {
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

function hide(elem: HTMLElement): void {
  elem.className = 'hidden';
}

function reveal(elem: HTMLElement): void {
  elem.className = '';
}

function addListeners(): void {
  if (!rc) return;

  rc.on((window as any).RoomClient.EVENTS.startScreen, () => {
    hide(startScreenButton);
    reveal(stopScreenButton);
  });

  rc.on((window as any).RoomClient.EVENTS.stopScreen, () => {
    hide(stopScreenButton);
    reveal(startScreenButton);
  });

  rc.on((window as any).RoomClient.EVENTS.stopAudio, () => {
    hide(stopAudioButton);
    reveal(startAudioButton);
  });
  rc.on((window as any).RoomClient.EVENTS.startAudio, () => {
    hide(startAudioButton);
    reveal(stopAudioButton);
  });

  rc.on((window as any).RoomClient.EVENTS.startVideo, () => {
    hide(startVideoButton);
    reveal(stopVideoButton);
  });
  rc.on((window as any).RoomClient.EVENTS.stopVideo, () => {
    hide(stopVideoButton);
    reveal(startVideoButton);
  });
  rc.on((window as any).RoomClient.EVENTS.exitRoom, () => {
    hide(control);
    hide(devicesList);
    hide(videoMedia);
    hide(copyButton);
    hide(devicesButton);
    reveal(login);
  });
}

let isEnumerateDevices = false;

function initEnumerateDevices(): void {
  // Many browsers, without the consent of getUserMedia, cannot enumerate the devices.
  if (isEnumerateDevices) return;

  const constraints = {
    audio: true,
    video: true
  };

  navigator.mediaDevices
    .getUserMedia(constraints)
    .then((stream) => {
      enumerateDevices();
      stream.getTracks().forEach(function (track) {
        track.stop();
      });
    })
    .catch((err) => {
      console.error('Access denied for audio/video: ', err);
    });
}

function enumerateDevices(): void {
  // Load mediaDevice options
  navigator.mediaDevices.enumerateDevices().then((devices) =>
    devices.forEach((device) => {
      let el: HTMLSelectElement | null = null;
      if ('audioinput' === device.kind) {
        el = audioSelect;
      } else if ('videoinput' === device.kind) {
        el = videoSelect;
      }
      if (!el) return;

      let option = document.createElement('option');
      option.value = device.deviceId;
      option.innerText = device.label;
      el.appendChild(option);
      isEnumerateDevices = true;
    })
  );
}

// Make functions globally available
(window as any).joinRoom = joinRoom; 