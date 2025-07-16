# Development

## Development Environment Setup

### Prerequisites

- **Node.js**: v16 or higher
- **npm** or **yarn**: Package manager
- **Git**: Version control
- **TypeScript**: For type checking and compilation
- **Code Editor**: VS Code (recommended) with TypeScript support

### Initial Setup

1. **Clone Repository**
   ```bash
   git clone <repository-url>
   cd mediasoup-documemtation-repo
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Generate SSL Certificates**
   ```bash
   mkdir -p ssl
   openssl req -x509 -newkey rsa:4096 \
     -keyout ssl/key.pem \
     -out ssl/cert.pem \
     -days 365 \
     -nodes \
     -subj "/C=US/ST=State/L=City/O=Organization/CN=localhost"
   ```

4. **Configure Development Environment**
   ```typescript
   // src/config.ts - Development configuration
   const config: Config = {
     listenIp: '0.0.0.0',
     listenPort: 3016,
     sslCrt: '../ssl/cert.pem',
     sslKey: '../ssl/key.pem',
     mediasoup: {
       numWorkers: 2,  // Reduced for development
       worker: {
         rtcMinPort: 10000,
         rtcMaxPort: 10100,
         logLevel: 'debug',  // Verbose logging
         logTags: ['info', 'ice', 'dtls', 'rtp', 'srtp', 'rtcp', 'rtx', 'bwe']
       },
       webRtcTransport: {
         listenIps: [{
           ip: '0.0.0.0',
           announcedIp: '192.168.1.6'  // Your local IP
         }],
         maxIncomingBitrate: 1500000,
         initialAvailableOutgoingBitrate: 1000000
       }
     }
   };
   ```

## Development Workflow

### Available Scripts

```json
{
  "scripts": {
    "dev": "ts-node src/app.ts",
    "build": "tsc && npm run build:frontend",
    "build:frontend": "cd public && tsc",
    "start": "node dist/app.js",
    "mon": "nodemon --exec ts-node src/app.ts",
    "watch": "watchify public/index.js -o public/bundle.js -v",
    "lint": "npx prettier --write .",
    "compile-mediasoup-client": "npx browserify mediasoup-client-compile.js -o public/modules/mediasoupclient.min.js"
  }
}
```

### Development Commands

```bash
# Start development server with hot reload
npm run dev

# Start with nodemon for automatic restarts
npm run mon

# Build the project
npm run build

# Start production server
npm start

# Format code
npm run lint

# Compile MediaSoup client
npm run compile-mediasoup-client
```

### Hot Reload Development

```bash
# Install nodemon globally (if not already installed)
npm install -g nodemon

# Start development with automatic restarts
npm run mon
```

## Code Organization

### Backend Architecture

#### Main Application (`src/app.ts`)

```typescript
import express from 'express';
import { Server as SocketIOServer } from 'socket.io';
import Room from './Room';
import Peer from './Peer';
import config from './config';

// Server setup
const app = express();
const httpsServer = https(options, app);
const io = new SocketIOServer(httpsServer);

// MediaSoup workers
const workers: any[] = [];
let nextMediasoupWorkerIdx = 0;

// Room management
const roomList = new Map<string, Room>();

// Socket.IO event handlers
io.on('connection', (socket: ExtendedSocket) => {
  // Event handlers for room management, media streaming, etc.
});
```

#### Room Management (`src/Room.ts`)

```typescript
export default class Room {
  public id: string;
  public router!: Router;
  public peers: Map<string, Peer>;
  public io: SocketIOServer;

  constructor(room_id: string, worker: Worker, io: SocketIOServer) {
    // Initialize room with MediaSoup router
  }

  // Room management methods
  addPeer(peer: Peer): void;
  createWebRtcTransport(socket_id: string): Promise<{ params: any }>;
  produce(socket_id: string, producerTransportId: string, rtpParameters: RtpParameters, kind: 'audio' | 'video'): Promise<string>;
  consume(socket_id: string, consumer_transport_id: string, producer_id: string, rtpCapabilities: RtpCapabilities): Promise<any>;
}
```

#### Peer Management (`src/Peer.ts`)

```typescript
export default class Peer {
  public id: string;
  public name: string;
  public transports: Map<string, Transport>;
  public consumers: Map<string, Consumer>;
  public producers: Map<string, Producer>;

  constructor(socket_id: string, name: string) {
    // Initialize peer
  }

  // Peer management methods
  addTransport(transport: Transport): void;
  createProducer(producerTransportId: string, rtpParameters: RtpParameters, kind: 'audio' | 'video'): Promise<Producer>;
  createConsumer(consumer_transport_id: string, producer_id: string, rtpCapabilities: RtpCapabilities): Promise<{ consumer: Consumer; params: any }>;
}
```

### Frontend Architecture

#### Room Client (`public/RoomClient.ts`)

```typescript
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
    // Initialize room client
  }

  // Media management methods
  async produce(type: MediaType, deviceId?: string): Promise<void>;
  closeProducer(type: MediaType): void;
  async consume(producer_id: string): Promise<void>;
  exit(offline?: boolean): void;
}
```

## TypeScript Configuration

### TypeScript Setup (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": [
    "src/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist"
  ]
}
```

### Type Definitions

#### Custom Types (`src/types/`)

```typescript
// Extended Socket.IO types
interface ExtendedSocket extends Socket {
  room_id?: string;
}

// Media types
type MediaType = 'audioType' | 'videoType' | 'screenType';

// Event types
type EventType = 'exitRoom' | 'openRoom' | 'startVideo' | 'stopVideo' | 'startAudio' | 'stopAudio' | 'startScreen' | 'stopScreen';

// Producer/Consumer types
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
```

## Development Tools

### VS Code Configuration

#### Recommended Extensions

```json
{
  "recommendations": [
    "ms-vscode.vscode-typescript-next",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-json"
  ]
}
```

#### VS Code Settings (`.vscode/settings.json`)

```json
{
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "typescript.suggest.autoImports": true,
  "typescript.updateImportsOnFileMove.enabled": "always"
}
```

### Prettier Configuration (`.prettierrc`)

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false
}
```

### ESLint Configuration (`.eslintrc.js`)

```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended'
  ],
  rules: {
    '@typescript-eslint/no-unused-vars': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn'
  }
};
```

