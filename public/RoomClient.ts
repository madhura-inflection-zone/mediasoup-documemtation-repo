const mediaType = {
  audio: 'audioType',
  video: 'videoType',
  screen: 'screenType'
} as const;

const _EVENTS = {
  exitRoom: 'exitRoom',
  openRoom: 'openRoom',
  startVideo: 'startVideo',
  stopVideo: 'stopVideo',
  startAudio: 'startAudio',
  stopAudio: 'stopAudio',
  startScreen: 'startScreen',
  stopScreen: 'stopScreen'
} as const;

type MediaType = typeof mediaType[keyof typeof mediaType];
type EventType = typeof _EVENTS[keyof typeof _EVENTS];

interface ProducerInfo {
  producer_id: string;
  producer_socket_id: string;
}

interface ConsumerParams {
  producerId: string;
  id: string;
  kind: 'audio' | 'video';
  rtpParameters: any;
  type: string;
  producerPaused: boolean;
}

interface TransportData {
  id: string;
  iceParameters: any;
  iceCandidates: any;
  dtlsParameters: any;
}

class RoomClient {
  private localMediaEl: HTMLElement;
  private remoteVideoEl: HTMLElement;
  private remoteAudioEl: HTMLElement;
  private mediasoupClient: any;
  private socket: any;
  private producerTransport: any;
  private consumerTransport: any;
  private device: any;
  private room_id: string;
  private isVideoOnFullScreen: boolean;
  private isDevicesVisible: boolean;
  private consumers: Map<string, any>;
  private producers: Map<string, any>;
  private producerLabel: Map<MediaType, string>;
  private _isOpen: boolean;
  private eventListeners: Map<EventType, (() => void)[]>;

  constructor(
    localMediaEl: HTMLElement,
    remoteVideoEl: HTMLElement,
    remoteAudioEl: HTMLElement,
    mediasoupClient: any,
    socket: any,
    room_id: string,
    name: string,
    successCallback: () => void
  ) {
    this.localMediaEl = localMediaEl;
    this.remoteVideoEl = remoteVideoEl;
    this.remoteAudioEl = remoteAudioEl;
    this.mediasoupClient = mediasoupClient;
    this.socket = socket;
    this.producerTransport = null;
    this.consumerTransport = null;
    this.device = null;
    this.room_id = room_id;
    this.isVideoOnFullScreen = false;
    this.isDevicesVisible = false;
    this.consumers = new Map();
    this.producers = new Map();
    this.producerLabel = new Map();
    this._isOpen = false;
    this.eventListeners = new Map();

    console.log('Mediasoup client', mediasoupClient);

    // Initialize event listeners
    Object.keys(_EVENTS).forEach((evt) => {
      this.eventListeners.set(evt as EventType, []);
    });

    this.createRoom(room_id).then(async () => {
      await this.join(name, room_id);
      this.initSockets();
      this._isOpen = true;
      successCallback();
    });
  }

  ////////// INIT /////////

  async createRoom(room_id: string): Promise<void> {
    await this.socket
      .request('createRoom', {
        room_id
      })
      .catch((err: any) => {
        console.log('Create room error:', err);
      });
  }

  async join(name: string, room_id: string): Promise<void> {
    this.socket
      .request('join', {
        name,
        room_id
      })
      .then(async (e: any) => {
        console.log('Joined to room', e);
        const data = await this.socket.request('getRouterRtpCapabilities');
        const device = await this.loadDevice(data);
        this.device = device;
        await this.initTransports(device);
        this.socket.emit('getProducers');
      })
      .catch((err: any) => {
        console.log('Join error:', err);
      });
  }

  async loadDevice(routerRtpCapabilities: any): Promise<any> {
    let device: any;
    try {
      device = new this.mediasoupClient.Device();
    } catch (error: any) {
      if (error.name === 'UnsupportedError') {
        console.error('Browser not supported');
        alert('Browser not supported');
      }
      console.error(error);
    }
    await device.load({
      routerRtpCapabilities
    });
    return device;
  }

  async initTransports(device: any): Promise<void> {
    // init producerTransport
    {
      const data = await this.socket.request('createWebRtcTransport', {
        forceTcp: false,
        rtpCapabilities: device.rtpCapabilities
      });

      if (data.error) {
        console.error(data.error);
        return;
      }

      this.producerTransport = device.createSendTransport(data);

      this.producerTransport.on('connect', async ({ dtlsParameters }: any, callback: any, errback: any) => {
        this.socket
          .request('connectTransport', {
            dtlsParameters,
            transport_id: data.id
          })
          .then(callback)
          .catch(errback);
      });

      this.producerTransport.on('produce', async ({ kind, rtpParameters }: any, callback: any, errback: any) => {
        try {
          const { producer_id } = await this.socket.request('produce', {
            producerTransportId: this.producerTransport.id,
            kind,
            rtpParameters
          });
          callback({
            id: producer_id
          });
        } catch (err) {
          errback(err);
        }
      });

      this.producerTransport.on('connectionstatechange', (state: string) => {
        switch (state) {
          case 'connecting':
            break;
          case 'connected':
            //localVideo.srcObject = stream
            break;
          case 'failed':
            this.producerTransport.close();
            break;
          default:
            break;
        }
      });
    }

    // init consumerTransport
    {
      const data = await this.socket.request('createWebRtcTransport', {
        forceTcp: false
      });

      if (data.error) {
        console.error(data.error);
        return;
      }

      // only one needed
      this.consumerTransport = device.createRecvTransport(data);
      this.consumerTransport.on('connect', ({ dtlsParameters }: any, callback: any, errback: any) => {
        this.socket
          .request('connectTransport', {
            transport_id: this.consumerTransport.id,
            dtlsParameters
          })
          .then(callback)
          .catch(errback);
      });

      this.consumerTransport.on('connectionstatechange', (state: string) => {
        switch (state) {
          case 'connecting':
            break;
          case 'connected':
            break;
          case 'failed':
            this.consumerTransport.close();
            break;
          default:
            break;
        }
      });
    }
  }

  initSockets(): void {
    this.socket.on('newProducers', (producerList: ProducerInfo[]) => {
      producerList.forEach((producer) => {
        this.consume(producer.producer_id);
      });
    });

    this.socket.on('consumerClosed', ({ consumer_id }: { consumer_id: string }) => {
      this.removeConsumer(consumer_id);
    });
  }

  async produce(type: MediaType, deviceId: string | null = null): Promise<void> {
    let mediaConstraints: any = {};
    let audio = false;
    let screen = false;

    switch (type) {
      case mediaType.audio:
        mediaConstraints = {
          audio: {
            deviceId: deviceId
          },
          video: false
        };
        audio = true;
        break;
      case mediaType.video:
        mediaConstraints = {
          audio: false,
          video: {
            width: {
              min: 640,
              ideal: 1920
            },
            height: {
              min: 400,
              ideal: 1080
            },
            deviceId: deviceId
          }
        };
        break;
      case mediaType.screen:
        mediaConstraints = false;
        screen = true;
        break;
      default:
        return;
    }

    if (!this.device.canProduce('video') && !audio) {
      console.error('Cannot produce video');
      return;
    }

    if (this.producerLabel.has(type)) {
      console.log('Producer already exists for this type ' + type);
      return;
    }

    console.log('Mediacontraints:', mediaConstraints);
    let stream: MediaStream;

    try {
      stream = screen
        ? await navigator.mediaDevices.getDisplayMedia()
        : await navigator.mediaDevices.getUserMedia(mediaConstraints);

      console.log(navigator.mediaDevices.getSupportedConstraints());

      const track = audio ? stream.getAudioTracks()[0] : stream.getVideoTracks()[0];
      const params: any = {
        track
      };

      if (!audio && !screen) {
        params.encodings = [
          {
            rid: 'r0',
            maxBitrate: 100000,
            scalabilityMode: 'S1T3'
          },
          {
            rid: 'r1',
            maxBitrate: 300000,
            scalabilityMode: 'S1T3'
          },
          {
            rid: 'r2',
            maxBitrate: 900000,
            scalabilityMode: 'S1T3'
          }
        ];
        params.codecOptions = {
          videoGoogleStartBitrate: 1000
        };
      }

      const producer = await this.producerTransport.produce(params);

      console.log('Producer', producer);

      this.producers.set(producer.id, producer);

      let elem: HTMLElement;
      if (!audio) {
        elem = document.createElement('video');
        (elem as HTMLVideoElement).srcObject = stream;
        elem.id = producer.id;
        (elem as HTMLVideoElement).playsInline = false;
        (elem as HTMLVideoElement).autoplay = true;
        elem.className = 'vid';
        this.localMediaEl.appendChild(elem);
        this.handleFS(elem.id);
      }

      producer.on('trackended', () => {
        this.closeProducer(type);
      });

      producer.on('transportclose', () => {
        console.log('Producer transport close');
        if (!audio && elem) {
          const stream = (elem as HTMLVideoElement).srcObject as MediaStream;
          stream?.getTracks().forEach(function (track) {
            track.stop();
          });
          elem.parentNode?.removeChild(elem);
        }
        this.producers.delete(producer.id);
      });

      producer.on('close', () => {
        console.log('Closing producer');
        if (!audio && elem) {
          const stream = (elem as HTMLVideoElement).srcObject as MediaStream;
          stream?.getTracks().forEach(function (track) {
            track.stop();
          });
          elem.parentNode?.removeChild(elem);
        }
        this.producers.delete(producer.id);
      });

      this.producerLabel.set(type, producer.id);

      switch (type) {
        case mediaType.audio:
          this.event(_EVENTS.startAudio);
          break;
        case mediaType.video:
          this.event(_EVENTS.startVideo);
          break;
        case mediaType.screen:
          this.event(_EVENTS.startScreen);
          break;
        default:
          return;
      }
    } catch (err) {
      console.log('Produce error:', err);
    }
  }

  async consume(producer_id: string): Promise<void> {
    this.getConsumeStream(producer_id).then(({ consumer, stream, kind }) => {
      this.consumers.set(consumer.id, consumer);

      let elem: HTMLElement;
      if (kind === 'video') {
        elem = document.createElement('video');
        (elem as HTMLVideoElement).srcObject = stream;
        elem.id = consumer.id;
        (elem as HTMLVideoElement).playsInline = false;
        (elem as HTMLVideoElement).autoplay = true;
        elem.className = 'vid';
        this.remoteVideoEl.appendChild(elem);
        this.handleFS(elem.id);
      } else {
        elem = document.createElement('audio');
        (elem as HTMLAudioElement).srcObject = stream;
        elem.id = consumer.id;
        (elem as HTMLAudioElement).autoplay = true;
        this.remoteAudioEl.appendChild(elem);
      }

      consumer.on('trackended', () => {
        this.removeConsumer(consumer.id);
      });

      consumer.on('transportclose', () => {
        this.removeConsumer(consumer.id);
      });
    });
  }

  async getConsumeStream(producerId: string): Promise<{ consumer: any; stream: MediaStream; kind: string }> {
    const { rtpCapabilities } = this.device;
    const data = await this.socket.request('consume', {
      rtpCapabilities,
      consumerTransportId: this.consumerTransport.id,
      producerId
    });
    const { id, kind, rtpParameters } = data;

    let codecOptions = {};
    if (kind === 'video') {
      codecOptions = {
        videoGoogleStartBitrate: 1000
      };
    }

    const consumer = await this.consumerTransport.consume({
      id,
      producerId,
      kind,
      rtpParameters,
      codecOptions
    });

    const stream = new MediaStream([consumer.track]);

    return { consumer, stream, kind };
  }

  closeProducer(type: MediaType): void {
    const producer_id = this.producerLabel.get(type);
    if (!producer_id) return;

    this.producers.get(producer_id)?.close();
    this.producers.delete(producer_id);
    this.producerLabel.delete(type);

    switch (type) {
      case mediaType.audio:
        this.event(_EVENTS.stopAudio);
        break;
      case mediaType.video:
        this.event(_EVENTS.stopVideo);
        break;
      case mediaType.screen:
        this.event(_EVENTS.stopScreen);
        break;
      default:
        return;
    }
  }

  pauseProducer(type: MediaType): void {
    const producer_id = this.producerLabel.get(type);
    if (!producer_id) return;

    this.producers.get(producer_id)?.pause();
  }

  resumeProducer(type: MediaType): void {
    const producer_id = this.producerLabel.get(type);
    if (!producer_id) return;

    this.producers.get(producer_id)?.resume();
  }

  removeConsumer(consumer_id: string): void {
    const elem = document.getElementById(consumer_id);
    if (elem) {
      elem.parentNode?.removeChild(elem);
    }
    this.consumers.delete(consumer_id);
  }

  exit(offline = false): void {
    this.producers.forEach((producer) => {
      producer.close();
    });
    this.consumers.forEach((consumer) => {
      consumer.close();
    });

    this.producerTransport?.close();
    this.consumerTransport?.close();

    this.socket.emit('exitRoom', {}, () => {
      console.log('Exited room');
    });

    this._isOpen = false;
    this.event(_EVENTS.exitRoom);
  }

  async roomInfo(): Promise<any> {
    return await this.socket.request('getMyRoomInfo');
  }

  static get mediaType(): typeof mediaType {
    return mediaType;
  }

  event(evt: EventType): void {
    const listeners = this.eventListeners.get(evt);
    if (listeners) {
      listeners.forEach((callback) => callback());
    }
  }

  on(evt: EventType, callback: () => void): void {
    const listeners = this.eventListeners.get(evt);
    if (listeners) {
      listeners.push(callback);
    }
  }

  isOpen(): boolean {
    return this._isOpen;
  }

  static get EVENTS(): typeof _EVENTS {
    return _EVENTS;
  }

  copyURL(): void {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      console.log('URL copied to clipboard');
    });
  }

  showDevices(): void {
    this.isDevicesVisible = !this.isDevicesVisible;
    const devicesList = document.getElementById('devicesList');
    if (devicesList) {
      devicesList.className = this.isDevicesVisible ? '' : 'hidden';
    }
  }

  handleFS(id: string): void {
    const elem = document.getElementById(id) as HTMLVideoElement;
    if (!elem) return;

    elem.addEventListener('dblclick', () => {
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if ((elem as any).webkitRequestFullscreen) {
        (elem as any).webkitRequestFullscreen();
      } else if ((elem as any).mozRequestFullScreen) {
        (elem as any).mozRequestFullScreen();
      } else if ((elem as any).msRequestFullscreen) {
        (elem as any).msRequestFullscreen();
      }
    });
  }
}

// Make RoomClient globally available
(window as any).RoomClient = RoomClient; 