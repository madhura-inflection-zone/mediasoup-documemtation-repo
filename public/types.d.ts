// Global type declarations for the mediasoup project

declare global {
  interface Window {
    mediasoupClient: any;
    io: any;
  }
}

// Global variables defined in HTML
declare const socket: any;
declare const nameInput: HTMLInputElement;
declare const localMedia: HTMLElement;
declare const remoteVideos: HTMLElement;
declare const remoteAudios: HTMLElement;
declare const login: HTMLElement;
declare const control: HTMLElement;
declare const videoMedia: HTMLElement;
declare const startAudioButton: HTMLElement;
declare const stopAudioButton: HTMLElement;
declare const startVideoButton: HTMLElement;
declare const stopVideoButton: HTMLElement;
declare const startScreenButton: HTMLElement;
declare const stopScreenButton: HTMLElement;
declare const exitButton: HTMLElement;
declare const copyButton: HTMLElement;
declare const devicesButton: HTMLElement;
declare const devicesList: HTMLElement;
declare const audioSelect: HTMLSelectElement;
declare const videoSelect: HTMLSelectElement;

// RoomClient class declaration
declare class RoomClient {
  static EVENTS: {
    exitRoom: string;
    openRoom: string;
    startVideo: string;
    stopVideo: string;
    startAudio: string;
    stopAudio: string;
    startScreen: string;
    stopScreen: string;
  };
  
  constructor(
    localMediaEl: HTMLElement,
    remoteVideoEl: HTMLElement,
    remoteAudioEl: HTMLElement,
    mediasoupClient: any,
    socket: any,
    room_id: string,
    name: string,
    successCallback: () => void
  );
  
  isOpen(): boolean;
  on(event: string, callback: () => void): void;
}

export {}; 