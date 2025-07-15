import express from 'express';
const https = require('httpolyglot').createServer;
import fs from 'fs';
const mediasoup = require('mediasoup');
import config from './config';
import path from 'path';
import { Server as SocketIOServer, Socket } from 'socket.io';
import Room from './Room';
import Peer from './Peer';

const app = express();
const options = {
  key: fs.readFileSync(path.join(__dirname, config.sslKey), 'utf-8'),
  cert: fs.readFileSync(path.join(__dirname, config.sslCrt), 'utf-8')
};

const httpsServer = https(options, app);
const io = new SocketIOServer(httpsServer);

app.use(express.static(path.join(__dirname, '..', 'public')));

httpsServer.listen(config.listenPort, () => {
  console.log('Listening on https://' + config.listenIp + ':' + config.listenPort);
});

// all mediasoup workers
const workers: any[] = [];
let nextMediasoupWorkerIdx = 0;

/**
 * roomList
 * {
 *  room_id: Room {
 *      id:
 *      router:
 *      peers: {
 *          id:,
 *          name:,
 *          master: [boolean],
 *          transports: [Map],
 *          producers: [Map],
 *          consumers: [Map],
 *          rtpCapabilities:
 *      }
 *  }
 * }
 */
const roomList = new Map<string, Room>();

(async () => {
  await createWorkers();
})();

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

    // log worker resource usage
    /*setInterval(async () => {
            const usage = await worker.getResourceUsage();

            console.info('mediasoup Worker resource usage [pid:%d]: %o', worker.pid, usage);
        }, 120000);*/
  }
}

interface ExtendedSocket extends Socket {
  room_id?: string;
}

io.on('connection', (socket: ExtendedSocket) => {
  socket.on('createRoom', async ({ room_id }: { room_id: string }, callback: (response: any) => void) => {
    if (roomList.has(room_id)) {
      callback('already exists');
    } else {
      console.log('Created room', { room_id: room_id });
      const worker = await getMediasoupWorker();
      roomList.set(room_id, new Room(room_id, worker, io));
      callback(room_id);
    }
  });

  socket.on('join', ({ room_id, name }: { room_id: string; name: string }, cb: (response: any) => void) => {
    console.log('User joined', {
      room_id: room_id,
      name: name
    });

    if (!roomList.has(room_id)) {
      return cb({
        error: 'Room does not exist'
      });
    }

    roomList.get(room_id)!.addPeer(new Peer(socket.id, name));
    socket.room_id = room_id;

    cb(roomList.get(room_id)!.toJson());
  });

  socket.on('getProducers', () => {
    if (!socket.room_id || !roomList.has(socket.room_id)) return;
    console.log('Get producers', { name: `${roomList.get(socket.room_id)!.getPeers().get(socket.id)!.name}` });

    // send all the current producer to newly joined member
    const producerList = roomList.get(socket.room_id)!.getProducerListForPeer();

    socket.emit('newProducers', producerList);
  });

  socket.on('getRouterRtpCapabilities', (_, callback: (response: any) => void) => {
    if (!socket.room_id || !roomList.has(socket.room_id)) {
      return callback({ error: 'Not in a room' });
    }
    console.log('Get RouterRtpCapabilities', {
      name: `${roomList.get(socket.room_id)!.getPeers().get(socket.id)!.name}`
    });

    try {
      callback(roomList.get(socket.room_id)!.getRtpCapabilities());
    } catch (e: any) {
      callback({
        error: e.message
      });
    }
  });

  socket.on('createWebRtcTransport', async (_, callback: (response: any) => void) => {
    if (!socket.room_id || !roomList.has(socket.room_id)) {
      return callback({ error: 'Not in a room' });
    }
    console.log('Create webrtc transport', {
      name: `${roomList.get(socket.room_id)!.getPeers().get(socket.id)!.name}`
    });

    try {
      const { params } = await roomList.get(socket.room_id)!.createWebRtcTransport(socket.id);

      callback(params);
    } catch (err: any) {
      console.error(err);
      callback({
        error: err.message
      });
    }
  });

  socket.on('connectTransport', async ({ transport_id, dtlsParameters }: { transport_id: string; dtlsParameters: any }, callback: (response: any) => void) => {
    if (!socket.room_id || !roomList.has(socket.room_id)) {
      return callback({ error: 'Not in a room' });
    }
    console.log('Connect transport', { name: `${roomList.get(socket.room_id)!.getPeers().get(socket.id)!.name}` });

    await roomList.get(socket.room_id)!.connectPeerTransport(socket.id, transport_id, dtlsParameters);

    callback('success');
  });

  socket.on('produce', async ({ kind, rtpParameters, producerTransportId }: { kind: 'audio' | 'video'; rtpParameters: any; producerTransportId: string }, callback: (response: any) => void) => {
    if (!socket.room_id || !roomList.has(socket.room_id)) {
      return callback({ error: 'not is a room' });
    }

    const producer_id = await roomList.get(socket.room_id)!.produce(socket.id, producerTransportId, rtpParameters, kind);

    console.log('Produce', {
      type: `${kind}`,
      name: `${roomList.get(socket.room_id)!.getPeers().get(socket.id)!.name}`,
      id: `${producer_id}`
    });

    callback({
      producer_id
    });
  });

  socket.on('consume', async ({ consumerTransportId, producerId, rtpCapabilities }: { consumerTransportId: string; producerId: string; rtpCapabilities: any }, callback: (response: any) => void) => {
    if (!socket.room_id || !roomList.has(socket.room_id)) {
      return callback({ error: 'Not in a room' });
    }
    //TODO null handling
    const params = await roomList.get(socket.room_id)!.consume(socket.id, consumerTransportId, producerId, rtpCapabilities);

    console.log('Consuming', {
      name: `${roomList.get(socket.room_id) && roomList.get(socket.room_id)!.getPeers().get(socket.id)!.name}`,
      producer_id: `${producerId}`,
      consumer_id: `${params.id}`
    });

    callback(params);
  });

  socket.on('resume', async (data: any, callback: () => void) => {
    // Note: This seems to have an issue in the original code - consumer is not defined
    // await consumer.resume();
    callback();
  });

  socket.on('getMyRoomInfo', (_, cb: (response: any) => void) => {
    if (!socket.room_id || !roomList.has(socket.room_id)) {
      return cb({ error: 'Not in a room' });
    }
    cb(roomList.get(socket.room_id)!.toJson());
  });

  socket.on('disconnect', () => {
    console.log('Disconnect', {
      name: `${socket.room_id && roomList.get(socket.room_id) && roomList.get(socket.room_id)!.getPeers().get(socket.id)?.name}`
    });

    if (!socket.room_id) return;
    roomList.get(socket.room_id)?.removePeer(socket.id);
  });

  socket.on('producerClosed', ({ producer_id }: { producer_id: string }) => {
    if (!socket.room_id || !roomList.has(socket.room_id)) return;
    console.log('Producer close', {
      name: `${roomList.get(socket.room_id)!.getPeers().get(socket.id)!.name}`
    });

    roomList.get(socket.room_id)!.closeProducer(socket.id, producer_id);
  });

  socket.on('exitRoom', async (_, callback: (response: any) => void) => {
    console.log('Exit room', {
      name: `${socket.room_id && roomList.get(socket.room_id) && roomList.get(socket.room_id)!.getPeers().get(socket.id)?.name}`
    });

    if (!socket.room_id || !roomList.has(socket.room_id)) {
      callback({
        error: 'not currently in a room'
      });
      return;
    }
    // close transports
    await roomList.get(socket.room_id)!.removePeer(socket.id);
    if (roomList.get(socket.room_id)!.getPeers().size === 0) {
      roomList.delete(socket.room_id);
    }

    socket.room_id = undefined;

    callback('successfully exited room');
  });
});

// TODO remove - never used?
function room(): any[] {
  return Object.values(roomList).map((r) => {
    return {
      router: r.router.id,
      peers: Array.from(r.peers.values()).map((p: any) => {
        return {
          name: p.name
        };
      }),
      id: r.id
    };
  });
}

function getMediasoupWorker(): any {
  const worker = workers[nextMediasoupWorkerIdx];
  nextMediasoupWorkerIdx = (nextMediasoupWorkerIdx + 1) % workers.length;
  return worker;
} 