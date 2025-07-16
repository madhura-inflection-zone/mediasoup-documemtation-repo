

# Steps to create video calling app
## Step 1: Install  required packages

Before starting, initialize a new Node.js project and install the necessary dependencies for Mediasoup, Express, Socket.IO, and TypeScript.

1. Initialize a Node.js project:

   `npm init -y` 
 
2. necessary packages like Mediasoup, Express, Socket.IO, and TypeScript.

    `npm install mediasoup express socket.io`
    `npm install --save-dev typescript @types/express @types/socket.io`

3. Initialize TypeScript:

    `npx tsc --init`
4. In the tsconfig.json file, set the following options for strict type-checking and using ES2020 as the target    version:
```ts
{
  "strict": true,
  "target": "ES2020"
}
```

    
## Step 2: Mediasoup server setup

1. **Install additional dependencies:**
   ```bash
   npm install httpolyglot mediasoup-client fluent-ffmpeg
   npm install --save-dev @types/node @types/fluent-ffmpeg ts-node nodemon prettier
   ```

2. **Create SSL certificates for HTTPS:**
   ```bash
   mkdir ssl
   cd ssl
   ```
   
   Generate self-signed certificates (for development):
   ```bash
   openssl req -x509 -newkey rsa:4096 -keyout key.pem -out cert.pem -days 365 -nodes
   ```
   
   Or use existing certificates by placing them in the `ssl/` directory as `key.pem` and `cert.pem`.

3. **Configure the server:**
   
   Create `src/config.ts` with your network settings:
   ```typescript
   const config = {
     listenIp: '0.0.0.0',
     listenPort: 3016,
     sslCrt: '../ssl/cert.pem',
     sslKey: '../ssl/key.pem',
     mediasoup: {
       numWorkers: 4,
       worker: {
         rtcMinPort: 10000,
         rtcMaxPort: 10100,
         logLevel: 'warn',
         logTags: ['info', 'ice', 'dtls', 'rtp', 'srtp', 'rtcp']
       },
       router: {
         mediaCodecs: [
           {
             kind: 'audio',
             mimeType: 'audio/opus',
             clockRate: 48000,
             channels: 2
           },
           {
             kind: 'video',
             mimeType: 'video/VP8',
             clockRate: 90000,
             parameters: {
               'x-google-start-bitrate': 1000
             }
           }
         ]
       },
       webRtcTransport: {
         listenIps: [
           {
             ip: '0.0.0.0',
             announcedIp: 'YOUR_PUBLIC_IP' // Replace with your public IP
           }
         ],
         maxIncomingBitrate: 1500000,
         initialAvailableOutgoingBitrate: 1000000
       }
     }
   };
   ```

4. **Update package.json scripts:**
   ```json
   {
     "scripts": {
       "start": "node dist/app.js",
       "dev": "ts-node src/app.ts",
       "build": "tsc && npm run build:frontend",
       "build:frontend": "cd public && tsc",
       "mon": "nodemon --exec ts-node src/app.ts"
     }
   }
   ```

## Step 3: WebSocket Signaling
    1. Install WebSocket Client:
        <script src="/socket.io/socket.io.js"></script>
    2. Client WebRTC and Socket.IO Code.

## Step 4: Build and Run the Project

1. **Build the project:**
   ```bash
   npm run build
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```
   
   Or for production:
   ```bash
   npm start
   ```

3. **Access the application:**
   Open your browser and navigate to:
   ```
   https://localhost:3016
   ```
   
   Note: Since we're using self-signed certificates, your browser will show a security warning. Click "Advanced" and "Proceed to localhost" to continue.

## Step 5: Testing the Video Call

1. Open the application in two different browser tabs or devices
2. Create a room in the first tab
3. Join the same room from the second tab
4. Allow camera and microphone permissions when prompted
5. You should now see and hear each other in the video call

## Troubleshooting

- **SSL Certificate Issues:** Make sure your SSL certificates are properly placed in the `ssl/` directory
- **Port Issues:** Ensure ports 3016 and 10000-10100 are not blocked by firewall
- **Network Issues:** Update the `announcedIp` in config.ts to match your public IP address
- **Permission Issues:** Make sure your application has permission to access camera and microphone
