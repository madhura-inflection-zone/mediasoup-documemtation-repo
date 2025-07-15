"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var mediaType = {
    audio: 'audioType',
    video: 'videoType',
    screen: 'screenType'
};
var _EVENTS = {
    exitRoom: 'exitRoom',
    openRoom: 'openRoom',
    startVideo: 'startVideo',
    stopVideo: 'stopVideo',
    startAudio: 'startAudio',
    stopAudio: 'stopAudio',
    startScreen: 'startScreen',
    stopScreen: 'stopScreen'
};
var RoomClient = /** @class */ (function () {
    function RoomClient(localMediaEl, remoteVideoEl, remoteAudioEl, mediasoupClient, socket, room_id, name, successCallback) {
        var _this = this;
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
        Object.keys(_EVENTS).forEach(function (evt) {
            _this.eventListeners.set(evt, []);
        });
        this.createRoom(room_id).then(function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.join(name, room_id)];
                    case 1:
                        _a.sent();
                        this.initSockets();
                        this._isOpen = true;
                        successCallback();
                        return [2 /*return*/];
                }
            });
        }); });
    }
    ////////// INIT /////////
    RoomClient.prototype.createRoom = function (room_id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.socket
                            .request('createRoom', {
                            room_id: room_id
                        })
                            .catch(function (err) {
                            console.log('Create room error:', err);
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    RoomClient.prototype.join = function (name, room_id) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                this.socket
                    .request('join', {
                    name: name,
                    room_id: room_id
                })
                    .then(function (e) { return __awaiter(_this, void 0, void 0, function () {
                    var data, device;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                console.log('Joined to room', e);
                                return [4 /*yield*/, this.socket.request('getRouterRtpCapabilities')];
                            case 1:
                                data = _a.sent();
                                return [4 /*yield*/, this.loadDevice(data)];
                            case 2:
                                device = _a.sent();
                                this.device = device;
                                return [4 /*yield*/, this.initTransports(device)];
                            case 3:
                                _a.sent();
                                this.socket.emit('getProducers');
                                return [2 /*return*/];
                        }
                    });
                }); })
                    .catch(function (err) {
                    console.log('Join error:', err);
                });
                return [2 /*return*/];
            });
        });
    };
    RoomClient.prototype.loadDevice = function (routerRtpCapabilities) {
        return __awaiter(this, void 0, void 0, function () {
            var device;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        try {
                            device = new this.mediasoupClient.Device();
                        }
                        catch (error) {
                            if (error.name === 'UnsupportedError') {
                                console.error('Browser not supported');
                                alert('Browser not supported');
                            }
                            console.error(error);
                        }
                        return [4 /*yield*/, device.load({
                                routerRtpCapabilities: routerRtpCapabilities
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, device];
                }
            });
        });
    };
    RoomClient.prototype.initTransports = function (device) {
        return __awaiter(this, void 0, void 0, function () {
            var data_1, data;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.socket.request('createWebRtcTransport', {
                            forceTcp: false,
                            rtpCapabilities: device.rtpCapabilities
                        })];
                    case 1:
                        data_1 = _a.sent();
                        if (data_1.error) {
                            console.error(data_1.error);
                            return [2 /*return*/];
                        }
                        this.producerTransport = device.createSendTransport(data_1);
                        this.producerTransport.on('connect', function (_a, callback_1, errback_1) { return __awaiter(_this, [_a, callback_1, errback_1], void 0, function (_b, callback, errback) {
                            var dtlsParameters = _b.dtlsParameters;
                            return __generator(this, function (_c) {
                                this.socket
                                    .request('connectTransport', {
                                    dtlsParameters: dtlsParameters,
                                    transport_id: data_1.id
                                })
                                    .then(callback)
                                    .catch(errback);
                                return [2 /*return*/];
                            });
                        }); });
                        this.producerTransport.on('produce', function (_a, callback_1, errback_1) { return __awaiter(_this, [_a, callback_1, errback_1], void 0, function (_b, callback, errback) {
                            var producer_id, err_1;
                            var kind = _b.kind, rtpParameters = _b.rtpParameters;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        _c.trys.push([0, 2, , 3]);
                                        return [4 /*yield*/, this.socket.request('produce', {
                                                producerTransportId: this.producerTransport.id,
                                                kind: kind,
                                                rtpParameters: rtpParameters
                                            })];
                                    case 1:
                                        producer_id = (_c.sent()).producer_id;
                                        callback({
                                            id: producer_id
                                        });
                                        return [3 /*break*/, 3];
                                    case 2:
                                        err_1 = _c.sent();
                                        errback(err_1);
                                        return [3 /*break*/, 3];
                                    case 3: return [2 /*return*/];
                                }
                            });
                        }); });
                        this.producerTransport.on('connectionstatechange', function (state) {
                            switch (state) {
                                case 'connecting':
                                    break;
                                case 'connected':
                                    //localVideo.srcObject = stream
                                    break;
                                case 'failed':
                                    _this.producerTransport.close();
                                    break;
                                default:
                                    break;
                            }
                        });
                        return [4 /*yield*/, this.socket.request('createWebRtcTransport', {
                                forceTcp: false
                            })];
                    case 2:
                        data = _a.sent();
                        if (data.error) {
                            console.error(data.error);
                            return [2 /*return*/];
                        }
                        // only one needed
                        this.consumerTransport = device.createRecvTransport(data);
                        this.consumerTransport.on('connect', function (_a, callback, errback) {
                            var dtlsParameters = _a.dtlsParameters;
                            _this.socket
                                .request('connectTransport', {
                                transport_id: _this.consumerTransport.id,
                                dtlsParameters: dtlsParameters
                            })
                                .then(callback)
                                .catch(errback);
                        });
                        this.consumerTransport.on('connectionstatechange', function (state) {
                            switch (state) {
                                case 'connecting':
                                    break;
                                case 'connected':
                                    break;
                                case 'failed':
                                    _this.consumerTransport.close();
                                    break;
                                default:
                                    break;
                            }
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    RoomClient.prototype.initSockets = function () {
        var _this = this;
        this.socket.on('newProducers', function (producerList) {
            producerList.forEach(function (producer) {
                _this.consume(producer.producer_id);
            });
        });
        this.socket.on('consumerClosed', function (_a) {
            var consumer_id = _a.consumer_id;
            _this.removeConsumer(consumer_id);
        });
    };
    RoomClient.prototype.produce = function (type_1) {
        return __awaiter(this, arguments, void 0, function (type, deviceId) {
            var mediaConstraints, audio, screen, stream, _a, track, params, producer_1, elem_1, err_2;
            var _this = this;
            if (deviceId === void 0) { deviceId = null; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        mediaConstraints = {};
                        audio = false;
                        screen = false;
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
                                return [2 /*return*/];
                        }
                        if (!this.device.canProduce('video') && !audio) {
                            console.error('Cannot produce video');
                            return [2 /*return*/];
                        }
                        if (this.producerLabel.has(type)) {
                            console.log('Producer already exists for this type ' + type);
                            return [2 /*return*/];
                        }
                        console.log('Mediacontraints:', mediaConstraints);
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 7, , 8]);
                        if (!screen) return [3 /*break*/, 3];
                        return [4 /*yield*/, navigator.mediaDevices.getDisplayMedia()];
                    case 2:
                        _a = _b.sent();
                        return [3 /*break*/, 5];
                    case 3: return [4 /*yield*/, navigator.mediaDevices.getUserMedia(mediaConstraints)];
                    case 4:
                        _a = _b.sent();
                        _b.label = 5;
                    case 5:
                        stream = _a;
                        console.log(navigator.mediaDevices.getSupportedConstraints());
                        track = audio ? stream.getAudioTracks()[0] : stream.getVideoTracks()[0];
                        params = {
                            track: track
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
                        return [4 /*yield*/, this.producerTransport.produce(params)];
                    case 6:
                        producer_1 = _b.sent();
                        console.log('Producer', producer_1);
                        this.producers.set(producer_1.id, producer_1);
                        if (!audio) {
                            elem_1 = document.createElement('video');
                            elem_1.srcObject = stream;
                            elem_1.id = producer_1.id;
                            elem_1.playsInline = false;
                            elem_1.autoplay = true;
                            elem_1.className = 'vid';
                            this.localMediaEl.appendChild(elem_1);
                            this.handleFS(elem_1.id);
                        }
                        producer_1.on('trackended', function () {
                            _this.closeProducer(type);
                        });
                        producer_1.on('transportclose', function () {
                            var _a;
                            console.log('Producer transport close');
                            if (!audio && elem_1) {
                                var stream_1 = elem_1.srcObject;
                                stream_1 === null || stream_1 === void 0 ? void 0 : stream_1.getTracks().forEach(function (track) {
                                    track.stop();
                                });
                                (_a = elem_1.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(elem_1);
                            }
                            _this.producers.delete(producer_1.id);
                        });
                        producer_1.on('close', function () {
                            var _a;
                            console.log('Closing producer');
                            if (!audio && elem_1) {
                                var stream_2 = elem_1.srcObject;
                                stream_2 === null || stream_2 === void 0 ? void 0 : stream_2.getTracks().forEach(function (track) {
                                    track.stop();
                                });
                                (_a = elem_1.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(elem_1);
                            }
                            _this.producers.delete(producer_1.id);
                        });
                        this.producerLabel.set(type, producer_1.id);
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
                                return [2 /*return*/];
                        }
                        return [3 /*break*/, 8];
                    case 7:
                        err_2 = _b.sent();
                        console.log('Produce error:', err_2);
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    RoomClient.prototype.consume = function (producer_id) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                this.getConsumeStream(producer_id).then(function (_a) {
                    var consumer = _a.consumer, stream = _a.stream, kind = _a.kind;
                    _this.consumers.set(consumer.id, consumer);
                    var elem;
                    if (kind === 'video') {
                        elem = document.createElement('video');
                        elem.srcObject = stream;
                        elem.id = consumer.id;
                        elem.playsInline = false;
                        elem.autoplay = true;
                        elem.className = 'vid';
                        _this.remoteVideoEl.appendChild(elem);
                        _this.handleFS(elem.id);
                    }
                    else {
                        elem = document.createElement('audio');
                        elem.srcObject = stream;
                        elem.id = consumer.id;
                        elem.autoplay = true;
                        _this.remoteAudioEl.appendChild(elem);
                    }
                    consumer.on('trackended', function () {
                        _this.removeConsumer(consumer.id);
                    });
                    consumer.on('transportclose', function () {
                        _this.removeConsumer(consumer.id);
                    });
                });
                return [2 /*return*/];
            });
        });
    };
    RoomClient.prototype.getConsumeStream = function (producerId) {
        return __awaiter(this, void 0, void 0, function () {
            var rtpCapabilities, data, id, kind, rtpParameters, codecOptions, consumer, stream;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        rtpCapabilities = this.device.rtpCapabilities;
                        return [4 /*yield*/, this.socket.request('consume', {
                                rtpCapabilities: rtpCapabilities,
                                consumerTransportId: this.consumerTransport.id,
                                producerId: producerId
                            })];
                    case 1:
                        data = _a.sent();
                        id = data.id, kind = data.kind, rtpParameters = data.rtpParameters;
                        codecOptions = {};
                        if (kind === 'video') {
                            codecOptions = {
                                videoGoogleStartBitrate: 1000
                            };
                        }
                        return [4 /*yield*/, this.consumerTransport.consume({
                                id: id,
                                producerId: producerId,
                                kind: kind,
                                rtpParameters: rtpParameters,
                                codecOptions: codecOptions
                            })];
                    case 2:
                        consumer = _a.sent();
                        stream = new MediaStream([consumer.track]);
                        return [2 /*return*/, { consumer: consumer, stream: stream, kind: kind }];
                }
            });
        });
    };
    RoomClient.prototype.closeProducer = function (type) {
        var _a;
        var producer_id = this.producerLabel.get(type);
        if (!producer_id)
            return;
        (_a = this.producers.get(producer_id)) === null || _a === void 0 ? void 0 : _a.close();
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
    };
    RoomClient.prototype.pauseProducer = function (type) {
        var _a;
        var producer_id = this.producerLabel.get(type);
        if (!producer_id)
            return;
        (_a = this.producers.get(producer_id)) === null || _a === void 0 ? void 0 : _a.pause();
    };
    RoomClient.prototype.resumeProducer = function (type) {
        var _a;
        var producer_id = this.producerLabel.get(type);
        if (!producer_id)
            return;
        (_a = this.producers.get(producer_id)) === null || _a === void 0 ? void 0 : _a.resume();
    };
    RoomClient.prototype.removeConsumer = function (consumer_id) {
        var _a;
        var elem = document.getElementById(consumer_id);
        if (elem) {
            (_a = elem.parentNode) === null || _a === void 0 ? void 0 : _a.removeChild(elem);
        }
        this.consumers.delete(consumer_id);
    };
    RoomClient.prototype.exit = function (offline) {
        var _a, _b;
        if (offline === void 0) { offline = false; }
        this.producers.forEach(function (producer) {
            producer.close();
        });
        this.consumers.forEach(function (consumer) {
            consumer.close();
        });
        (_a = this.producerTransport) === null || _a === void 0 ? void 0 : _a.close();
        (_b = this.consumerTransport) === null || _b === void 0 ? void 0 : _b.close();
        this.socket.emit('exitRoom', {}, function () {
            console.log('Exited room');
        });
        this._isOpen = false;
        this.event(_EVENTS.exitRoom);
    };
    RoomClient.prototype.roomInfo = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.socket.request('getMyRoomInfo')];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    Object.defineProperty(RoomClient, "mediaType", {
        get: function () {
            return mediaType;
        },
        enumerable: false,
        configurable: true
    });
    RoomClient.prototype.event = function (evt) {
        var listeners = this.eventListeners.get(evt);
        if (listeners) {
            listeners.forEach(function (callback) { return callback(); });
        }
    };
    RoomClient.prototype.on = function (evt, callback) {
        var listeners = this.eventListeners.get(evt);
        if (listeners) {
            listeners.push(callback);
        }
    };
    RoomClient.prototype.isOpen = function () {
        return this._isOpen;
    };
    Object.defineProperty(RoomClient, "EVENTS", {
        get: function () {
            return _EVENTS;
        },
        enumerable: false,
        configurable: true
    });
    RoomClient.prototype.copyURL = function () {
        var url = window.location.href;
        navigator.clipboard.writeText(url).then(function () {
            console.log('URL copied to clipboard');
        });
    };
    RoomClient.prototype.showDevices = function () {
        this.isDevicesVisible = !this.isDevicesVisible;
        var devicesList = document.getElementById('devicesList');
        if (devicesList) {
            devicesList.className = this.isDevicesVisible ? '' : 'hidden';
        }
    };
    RoomClient.prototype.handleFS = function (id) {
        var elem = document.getElementById(id);
        if (!elem)
            return;
        elem.addEventListener('dblclick', function () {
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            }
            else if (elem.webkitRequestFullscreen) {
                elem.webkitRequestFullscreen();
            }
            else if (elem.mozRequestFullScreen) {
                elem.mozRequestFullScreen();
            }
            else if (elem.msRequestFullscreen) {
                elem.msRequestFullscreen();
            }
        });
    };
    return RoomClient;
}());
// Make RoomClient globally available
window.RoomClient = RoomClient;
//# sourceMappingURL=RoomClient.js.map