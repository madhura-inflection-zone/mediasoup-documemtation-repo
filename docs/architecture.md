# Architecture

## System Overview

The MediaSoup Video Conferencing Service follows a modern, scalable architecture designed for real-time communication. The system is built using a microservices-inspired approach with clear separation of concerns and modular components.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                             │
├─────────────────────────────────────────────────────────────────┤
│  Browser A  │  Browser B  │  Browser C  │  Browser D  │  ...   │
│             │             │             │             │        │
│ ┌─────────┐ │ ┌─────────┐ │ ┌─────────┐ │ ┌─────────┐ │        │
│ │MediaSoup│ │ │MediaSoup│ │ │MediaSoup│ │ │MediaSoup│ │        │
│ │ Client  │ │ │ Client  │ │ │ Client  │ │ │ Client  │ │        │
│ └─────────┘ │ └─────────┘ │ └─────────┘ │ └─────────┘ │        │
└─────────────┴─────────────┴─────────────┴─────────────┴────────┘
                              │
                              │ WebRTC + Socket.IO
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Server Layer                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                 Express.js Server                       │    │
│  │                                                         │    │
│  │  ┌─────────────────┐  ┌─────────────────────────────┐   │    │
│  │  │   Socket.IO     │  │      Static File Server     │   │    │
│  │  │   (Signaling)   │  │     (HTML, CSS, JS)         │   │    │
│  │  └─────────────────┘  └─────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                 │
│                              │ HTTPS/SSL                       │
│                              ▼                                 │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                MediaSoup Workers                        │    │
│  │                                                         │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐     │    │
│  │  │   Worker 1  │  │   Worker 2  │  │   Worker N  │     │    │
│  │  │             │  │             │  │             │     │    │
│  │  │ ┌─────────┐ │  │ ┌─────────┐ │  │ ┌─────────┐ │     │    │
│  │  │ │ Router  │ │  │ │ Router  │ │  │ │ Router  │ │     │    │
│  │  │ │         │ │  │ │         │ │  │ │         │ │     │    │
│  │  │ │ ┌─────┐ │ │  │ │ ┌─────┐ │ │  │ │ ┌─────┐ │ │     │    │
│  │  │ │ │Room │ │ │  │ │ │Room │ │ │  │ │ │Room │ │ │     │    │
│  │  │ │ │ A   │ │ │  │ │ │ B   │ │ │  │ │ │ C   │ │ │     │    │
│  │  │ │ └─────┘ │ │  │ │ └─────┘ │ │  │ │ └─────┘ │ │     │    │
│  │  │ └─────────┘ │  │ └─────────┘ │  │ └─────────┘ │     │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘     │    │
│  └─────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────┘
```

## Component Architecture

### 1. Client Layer

#### MediaSoup Client
- **Purpose**: WebRTC client implementation
- **Responsibilities**:
  - Media capture and encoding
  - WebRTC transport management
  - Media playback and rendering
  - Device management

#### User Interface
- **Purpose**: User interaction and media display
- **Components**:
  - Room joining interface
  - Media controls (audio/video/screen)
  - Device selection
  - Video/audio elements

### 2. Server Layer

#### Express.js Server
```typescript
// Main server setup
const app = express();
const httpsServer = https(options, app);
const io = new SocketIOServer(httpsServer);

// Static file serving
app.use(express.static(path.join(__dirname, '..', 'public')));

// HTTPS server
httpsServer.listen(config.listenPort, () => {
  console.log('Listening on https://' + config.listenIp + ':' + config.listenPort);
});
```

#### Socket.IO Signaling
- **Purpose**: Real-time communication and signaling
- **Responsibilities**:
  - Room management events
  - Transport creation and connection
  - Media producer/consumer coordination
  - Peer discovery and management

### 3. MediaSoup Layer

#### Worker Management
```typescript
// Worker creation and management
const workers: any[] = [];
let nextMediasoupWorkerIdx = 0;

async function createWorkers(): Promise<void> {
  const { numWorkers } = config.mediasoup;
  
  for (let i = 0; i < numWorkers; i++) {
    const worker = await mediasoup.createWorker({
      logLevel: config.mediasoup.worker.logLevel as any,
      logTags: config.mediasoup.worker.logTags as any,
      rtcMinPort: config.mediasoup.worker.rtcMinPort,
      rtcMaxPort: config.mediasoup.worker.rtcMaxPort
    });
    
    worker.on('died', () => {
      console.error('mediasoup worker died, exiting in 2 seconds... [pid:%d]', worker.pid);
      setTimeout(() => process.exit(1), 2000);
    });
    
    workers.push(worker);
  }
}
```

#### Router Management
- **Purpose**: Media routing and codec negotiation
- **Responsibilities**:
  - RTP capabilities management
  - Codec selection and negotiation
  - Media stream routing
  - Quality adaptation

## Core Classes

### Room Class

The `Room` class manages individual video conference rooms and their participants.

```typescript
export default class Room {
  public id: string;
  public router!: Router;
  public peers: Map<string, Peer>;
  public io: SocketIOServer;

  constructor(room_id: string, worker: Worker, io: SocketIOServer) {
    this.id = room_id;
    const mediaCodecs = config.mediasoup.router.mediaCodecs;
    worker.createRouter({ mediaCodecs }).then((router: Router) => {
      this.router = router;
    });
    this.peers = new Map();
    this.io = io;
  }
}
```

#### Key Methods

##### `addPeer(peer: Peer)`
Adds a new participant to the room.

##### `createWebRtcTransport(socket_id: string)`
Creates a new WebRTC transport for a participant.

##### `produce(socket_id: string, producerTransportId: string, rtpParameters: RtpParameters, kind: 'audio' | 'video')`
Handles media production from a participant.

##### `consume(socket_id: string, consumer_transport_id: string, producer_id: string, rtpCapabilities: RtpCapabilities)`
Handles media consumption for a participant.

### Peer Class

The `Peer` class manages individual participant connections and media streams.

```typescript
export default class Peer {
  public id: string;
  public name: string;
  public transports: Map<string, Transport>;
  public consumers: Map<string, Consumer>;
  public producers: Map<string, Producer>;

  constructor(socket_id: string, name: string) {
    this.id = socket_id;
    this.name = name;
    this.transports = new Map();
    this.consumers = new Map();
    this.producers = new Map();
  }
}
```

#### Key Methods

##### `addTransport(transport: Transport)`
Adds a new transport to the peer.

##### `createProducer(producerTransportId: string, rtpParameters: RtpParameters, kind: 'audio' | 'video')`
Creates a new media producer.

##### `createConsumer(consumer_transport_id: string, producer_id: string, rtpCapabilities: RtpCapabilities)`
Creates a new media consumer.

## Data Flow

### 1. Room Creation Flow

```
Client Request → Socket.IO → Server → Worker → Router → Room Created
     ↑                                                      ↓
     └────────────── Room ID Response ──────────────────────┘
```

### 2. Participant Join Flow

```
Client Join → Socket.IO → Room.addPeer() → Peer Created → Room Info Response
     ↑                                                           ↓
     └────────────── Room State Sent ───────────────────────────┘
```

### 3. Media Transport Flow

```
Client Request Transport → Socket.IO → Room.createWebRtcTransport()
     ↑                                                           ↓
     └────────────── Transport Parameters ───────────────────────┘
```

### 4. Media Production Flow

```
Client Produce → Socket.IO → Room.produce() → Peer.createProducer()
     ↑                                                           ↓
     └────────────── Producer ID ────────────────────────────────┘
```

### 5. Media Consumption Flow

```
Client Consume → Socket.IO → Room.consume() → Peer.createConsumer()
     ↑                                                           ↓
     └────────────── Consumer Parameters ────────────────────────┘
```

## Network Architecture

### WebRTC Transport

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │    │   Server    │    │   Client    │
│             │    │             │    │             │
│ ┌─────────┐ │    │ ┌─────────┐ │    │ ┌─────────┐ │
│ │Producer │ │───▶│ │Router   │ │───▶│ │Consumer │ │
│ │Transport│ │    │ │         │ │    │ │Transport│ │
│ └─────────┘ │    │ └─────────┘ │    │ └─────────┘ │
└─────────────┘    └─────────────┘    └─────────────┘
```

### ICE and DTLS

```
1. ICE Candidate Exchange
   Client ←→ Server (via Socket.IO)

2. DTLS Handshake
   Client ←→ Server (direct WebRTC)

3. SRTP Media Stream
   Client ←→ Server (encrypted media)
```

## Security Architecture

### Transport Security

- **HTTPS**: All signaling traffic encrypted
- **DTLS-SRTP**: All media streams encrypted
- **Certificate-based**: Secure key exchange

### Access Control

- **Room-based**: Participants can only access their room
- **Transport isolation**: Each transport is isolated
- **Resource limits**: Per-room and per-peer limits

## Scalability Architecture

### Horizontal Scaling

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │    │   Load Balancer │    │   Load Balancer │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │   Server 1  │ │    │ │   Server 2  │ │    │ │   Server N  │ │
│ │             │ │    │ │             │ │    │ │             │ │
│ │ ┌─────────┐ │ │    │ │ ┌─────────┐ │ │    │ │ ┌─────────┐ │ │
│ │ │ Worker  │ │ │    │ │ │ Worker  │ │ │    │ │ │ Worker  │ │ │
│ │ │ Pool    │ │ │    │ │ │ Pool    │ │ │    │ │ │ Pool    │ │ │
│ │ └─────────┘ │ │    │ │ └─────────┘ │ │    │ │ └─────────┘ │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Vertical Scaling

- **Worker per CPU core**: Optimal resource utilization
- **Memory management**: Efficient producer/consumer lifecycle
- **Bandwidth optimization**: Adaptive bitrate and codec selection

## Performance Considerations

### Resource Management

#### CPU Optimization
- Worker distribution across CPU cores
- Efficient codec processing
- Minimal signaling overhead

#### Memory Management
- Producer/consumer cleanup
- Transport lifecycle management
- Room state optimization

#### Network Optimization
- ICE candidate optimization
- Bandwidth adaptation
- Quality selection algorithms

### Monitoring and Metrics

#### Key Metrics
- **Active rooms**: Number of active video conferences
- **Active participants**: Total participants across all rooms
- **Bandwidth usage**: Incoming and outgoing bandwidth
- **CPU usage**: Per-worker CPU utilization
- **Memory usage**: Per-worker memory consumption

#### Health Checks
- Worker health monitoring
- Transport state monitoring
- Room lifecycle tracking

## Deployment Architecture

### Development Environment

```
┌─────────────────┐
│   Development   │
│                 │
│ ┌─────────────┐ │
│ │   Local     │ │
│ │   Server    │ │
│ │             │ │
│ │ ┌─────────┐ │ │
│ │ │ Worker  │ │ │
│ │ │ Pool    │ │ │
│ │ └─────────┘ │ │
│ └─────────────┘ │
└─────────────────┘
```

### Production Environment

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   CDN/Proxy     │    │   Load Balancer │    │   Application   │
│                 │    │                 │    │   Servers       │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │   Static    │ │    │ │   Traffic   │ │    │ │   MediaSoup │ │
│ │   Assets    │ │    │ │  Routing    │ │    │ │   Workers   │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   Database      │
                    │   (Optional)    │
                    │                 │
                    │ ┌─────────────┐ │
                    │ │   Room      │ │
                    │ │   State     │ │
                    │ │   Storage   │ │
                    │ └─────────────┘ │
                    └─────────────────┘
```

## Configuration Architecture

### Environment-Based Configuration

```typescript
interface Config {
  listenIp: string;
  listenPort: number;
  sslCrt: string;
  sslKey: string;
  mediasoup: {
    numWorkers: number;
    worker: WorkerConfig;
    router: RouterConfig;
    webRtcTransport: WebRtcTransportConfig;
  };
}
```

### Configuration Sources

1. **Environment Variables**: Production settings
2. **Configuration Files**: Development settings
3. **Runtime Configuration**: Dynamic settings

## Error Handling Architecture

### Error Categories

#### Network Errors
- Connection failures
- Transport errors
- ICE failures

#### Media Errors
- Codec errors
- Device errors
- Stream errors

#### Application Errors
- Room errors
- Peer errors
- Resource errors

### Error Recovery

#### Automatic Recovery
- Transport reconnection
- Producer/consumer recreation
- Worker failover

#### Manual Recovery
- Room recreation
- Peer reconnection
- Service restart

## Future Architecture Considerations

### Microservices Migration

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   API Gateway   │    │   Room Service  │    │   Media Service │
│                 │    │                 │    │                 │
│ ┌─────────────┐ │    │ ┌─────────────┐ │    │ ┌─────────────┐ │
│ │   Routing   │ │    │ │   Room      │ │    │ │   MediaSoup │ │
│ │   & Auth    │ │    │ │   Mgmt      │ │    │ │   Workers   │ │
│ └─────────────┘ │    │ └─────────────┘ │    │ └─────────────┘ │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                    ┌─────────────────┐
                    │   Database      │
                    │   Service       │
                    └─────────────────┘
```

### Container Orchestration

- **Docker**: Containerized deployment
- **Kubernetes**: Orchestration and scaling
- **Service Mesh**: Inter-service communication

### Monitoring and Observability

- **Metrics**: Prometheus integration
- **Logging**: Centralized logging
- **Tracing**: Distributed tracing
- **Alerting**: Proactive monitoring 