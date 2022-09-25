/* eslint-disable no-unused-vars */
/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
import { AiType } from '@common/ai-name';
import { GameSettings } from '@common/game-settings';
import { GameType } from '@common/game-type';
import { Letter } from '@common/letter';
import { Room, State } from '@common/room';
import { expect } from 'chai';
import * as http from 'http';
import * as sinon from 'sinon';
import { createStubInstance, SinonStubbedInstance } from 'sinon';
import * as io from 'socket.io';
import { DefaultEventsMap } from 'socket.io/dist/typed-events';
import { RoomManagerService } from './room-manager.service';
import { SocketManagerService } from './socket-manager.service';

describe('SocketManagerService', () => {
    let roomManagerService: SinonStubbedInstance<RoomManagerService>;
    let service: SocketManagerService;
    let sio: SinonStubbedInstance<io.Server>;
    const socketId = 'socket1';
    const settings: GameSettings = new GameSettings(['mi', 'ma'], 1, '01', '00', AiType.beginner, 'Activer', 'francais', '00');
    const scrabbleBoard: string[][] = [[]];

    const fakeIn = {
        in: (roomId: string) => {},
        emit: (eventName: string, args: any[] | any) => {
            return;
        },
    } as unknown as io.BroadcastOperator<DefaultEventsMap>;

    beforeEach(() => {
        roomManagerService = createStubInstance(RoomManagerService);
        sio = createStubInstance(io.Server);
        service = new SocketManagerService(http.createServer(), roomManagerService);
        service['sio'] = sio as unknown as io.Server;
    });

    it('handleSockets socket should add events on sockets', () => {
        const fakeSocket = {
            // eslint-disable-next-line no-unused-vars
            on: (eventName: string, callback: () => void) => {
                return;
            },
        };

        service['sio'] = {
            on: (eventName: string, callback: (socket: any) => void) => {
                if (eventName === 'connection') {
                    callback(fakeSocket);
                }
            },
        } as io.Server;

        const spy = sinon.spy(fakeSocket, 'on');
        service.handleSockets();
        expect(spy.called).to.equal(true);
    });

    it('should call createRoom callback', () => {
        const fakeSocket = {
            on: (eventName: string, callback: (gameSettings: GameSettings, gameType: GameType) => void) => {
                if (eventName === 'createRoom') {
                    callback(settings, GameType.Classic);
                }
            },

            id: '5544s',

            join: (roomId: string) => {
                return;
            },

            emit: (eventName: string, args: any[] | any) => {
                return;
            },
        };

        service['sio'] = {
            on: (eventName: string, callback: (socket: any) => void) => {
                if (eventName === 'connection') {
                    callback(fakeSocket);
                }
            },
            emit: (eventName: string, args: any[] | any) => {
                return;
            },
        } as unknown as io.Server;
        const spyOnJoin = sinon.spy(fakeSocket, 'join');
        const spyOnEmit = sinon.spy(fakeSocket, 'emit');
        const room = new Room('mike1234', socketId, settings, State.Waiting);
        roomManagerService.rooms = [[room], []];
        roomManagerService.createRoomId.returns('mike1234');
        service.handleSockets();
        expect(spyOnEmit.calledWith('yourRoomId', 'mike1234')).to.equal(true);
        expect(roomManagerService.createRoomId.calledWith(settings.playersNames[0])).to.equal(true);
        expect(roomManagerService.createRoom.called).to.equal(true);
        expect(spyOnJoin.calledWith('mike1234')).to.equal(true);
    });

    it('should handle delete game event ', () => {
        const fakeSocket = {
            // eslint-disable-next-line no-unused-vars
            on: (eventName: string, callback: (roomId: string) => void) => {
                if (eventName === 'deleteGame') {
                    callback('mike1234');
                }
            },
            emit: (eventName: string, args: any[] | any) => {
                return;
            },
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            disconnect: () => {},
        } as unknown as io.Socket;

        service['sio'] = {
            on: (eventName: string, callback: (socket: any) => void) => {
                if (eventName === 'connection') {
                    callback(fakeSocket);
                }
            },
            emit: (eventName: string, args: any[] | any) => {
                return;
            },
            socketsLeave: (roomId: string) => {
                return;
            },
        } as unknown as io.Server;

        const spyOnEmit = sinon.spy(service['sio'], 'emit');
        const spyOnLeave = sinon.spy(service['sio'], 'socketsLeave');
        const room = new Room('mike1234', socketId, settings, State.Waiting);
        roomManagerService.rooms = [[room], []];
        service.handleSockets();
        expect(spyOnEmit.called).to.equal(true);
        expect(spyOnEmit.calledWith('roomAvailable', roomManagerService.getNumberOfRoomInWaitingState()));
        expect(spyOnLeave.calledWith('mike1234'));
        expect(roomManagerService.deleteRoom.calledWith('mike1234')).to.equal(true);
    });

    it('should emit RoomConfigurations', () => {
        const typeOfGame = GameType.Classic;
        const fakeSocket = {
            // eslint-disable-next-line no-unused-vars
            on: (eventName: string, callback: (gameType: GameType) => void) => {
                if (eventName === 'getRoomsConfiguration') {
                    callback(typeOfGame);
                }
            },
            emit: (eventName: string, args: any[] | any) => {
                return;
            },
        };
        const spy = sinon.spy(fakeSocket, 'emit');
        service['sio'] = {
            on: (eventName: string, callback: (socket: any) => void) => {
                if (eventName === 'connection') {
                    callback(fakeSocket);
                }
            },
            emit: (eventName: string, args: any[] | any) => {
                return;
            },
        } as unknown as io.Server;
        const room = new Room('mike1234', socketId, settings, State.Waiting);
        roomManagerService.rooms = [[room], []];
        service.handleSockets();
        expect(spy.calledWith('roomConfiguration', roomManagerService.rooms)).to.equal(true);
    });

    it('should not emit the event onNewRoomCustomerOfRandomPlacement if the room is undefined', () => {
        const typeOfGame = GameType.Classic;
        const fakeSocket = {
            // eslint-disable-next-line no-unused-vars
            on: (eventName: string, callback: (customerName: string, gameType: GameType) => void) => {
                if (eventName === 'newRoomCustomerOfRandomPlacement') {
                    callback('Paul', typeOfGame);
                }
            },
            emit: (eventName: string, args: any[] | any) => {
                return;
            },
        };
        const spy = sinon.spy(fakeSocket, 'emit');

        service['sio'] = {
            on: (eventName: string, callback: (socket: any) => void) => {
                if (eventName === 'connection') {
                    callback(fakeSocket);
                }
            },
        } as unknown as io.Server;

        roomManagerService.rooms = [[], []];
        roomManagerService.findRoomInWaitingState.returns(undefined);
        service.handleSockets();
        expect(spy.called).to.equal(false);
    });

    it('should  emit the event onNewRoomCustomerOfRandomPlacement if the room exist', () => {
        const typeOfGame = GameType.Classic;
        const fakeSocket = {
            // eslint-disable-next-line no-unused-vars
            on: (eventName: string, callback: (customerName: string, gameType: GameType) => void) => {
                if (eventName === 'newRoomCustomerOfRandomPlacement') {
                    callback('Paul', typeOfGame);
                }
            },
            emit: (eventName: string, args: any[] | any) => {
                return;
            },
        };
        const spy = sinon.spy(fakeSocket, 'emit');

        service['sio'] = {
            on: (eventName: string, callback: (socket: any) => void) => {
                if (eventName === 'connection') {
                    callback(fakeSocket);
                }
            },
        } as unknown as io.Server;
        // const spyOnEmit = sinon.spy(service['sio'], 'emit');
        const room = new Room('mike1234', socketId, settings, State.Waiting);
        roomManagerService.rooms = [[room], []];
        roomManagerService.findRoomInWaitingState.returns(room);
        service.handleSockets();
        expect(spy.called).to.equal(true);
    });
    it('should emit the roomAvailable', () => {
        const fakeSocket = {
            // eslint-disable-next-line no-unused-vars
            on: (eventName: string, callback: () => void) => {
                if (eventName === 'getRoomAvailable') {
                    callback();
                }
            },
            emit: (eventName: string, args: any[] | any) => {
                return;
            },
        };
        service['sio'] = {
            on: (eventName: string, callback: (socket: any) => void) => {
                if (eventName === 'connection') {
                    callback(fakeSocket);
                }
            },
            emit: (eventName: string, args: any[] | any) => {
                return;
            },
        } as unknown as io.Server;
        const spyOnEmit = sinon.spy(service['sio'], 'emit');
        const room = new Room('mike1234', socketId, settings, State.Waiting);
        roomManagerService.rooms = [[room], []];
        service.handleSockets();
        expect(spyOnEmit.calledWith('roomAvailable', roomManagerService.getNumberOfRoomInWaitingState())).to.equal(true);
    });

    it('should update objectives', () => {
        const fakeSocket = {
            on: (eventName: string, callback: (id: number, roomId: string) => void) => {
                if (eventName === 'objectiveAccomplished') {
                    callback(1, 'mike1234');
                }
            },
            to: (roomId: string) => {
                return fakeIn;
            },
            emit: (eventName: string, args: any[] | any) => {
                return;
            },
        };
        service['sio'] = {
            on: (eventName: string, callback: (socket: any) => void) => {
                if (eventName === 'connection') {
                    callback(fakeSocket);
                }
            },
        } as unknown as io.Server;
        const spy = sinon.spy(fakeSocket, 'to');
        service.handleSockets();
        expect(spy.called).to.equal(true);
    });

    it('should update the PlayedWords', () => {
        const fakeSocket = {
            // eslint-disable-next-line no-unused-vars
            on: (eventName: string, callback: (playedWords: string, roomId: string) => void) => {
                if (eventName === 'updatePlayedWords') {
                    callback('a', '1');
                }
            },
            emit: (eventName: string, args: any[] | any) => {
                return;
            },
            to: (roomId: string) => {
                return fakeIn;
            },
        };
        const spy = sinon.spy(fakeSocket, 'to');
        service['sio'] = {
            on: (eventName: string, callback: (socket: any) => void) => {
                if (eventName === 'connection') {
                    callback(fakeSocket);
                }
            },
            emit: (eventName: string, args: any[] | any) => {
                return;
            },
        } as unknown as io.Server;
        service.handleSockets();
        expect(spy.calledWith('1')).to.equal(true);
    });

    it('should update CurrentWords', () => {
        const fakeCurrentWord = 'fakeCurrent';
        const fakePriorCurrentWords = 'fakePrior';
        const fakeRoomId = 'fakeId';
        const fakeSocket = {
            // eslint-disable-next-line no-unused-vars
            on: (eventName: string, callback: (currentWords: string, priorCurrentWords: string, roomId: string) => void) => {
                if (eventName === 'updateCurrentWords') {
                    callback(fakeCurrentWord, fakePriorCurrentWords, fakeRoomId);
                }
            },
            emit: (eventName: string, args: any[] | any) => {
                return;
            },
            to: (roomId: string) => {
                return fakeIn;
            },
        };
        const spy = sinon.spy(fakeSocket, 'to');
        service['sio'] = {
            on: (eventName: string, callback: (socket: any) => void) => {
                if (eventName === 'connection') {
                    callback(fakeSocket);
                }
            },
            emit: (eventName: string, args: any[] | any) => {
                return;
            },
        } as unknown as io.Server;
        service.handleSockets();
        expect(spy.called).to.equal(true);
    });

    it('should handle a new customer', () => {
        const typeMode = GameType.Classic;
        const fakeSocket = {
            // eslint-disable-next-line no-unused-vars
            on: (eventName: string, callback: (playerName: string, roomId: string, gameType: GameType) => void) => {
                if (eventName === 'newRoomCustomer') {
                    callback('Mike', 'mike1234', typeMode);
                }
            },
            join: (roomId: string) => {
                return;
            },
            emit: (eventName: string, args: any[] | any) => {
                return;
            },
            to: (roomId: string) => {
                return fakeIn;
            },
        };

        service['sio'] = {
            on: (eventName: string, callback: (socket: any) => void) => {
                if (eventName === 'connection') {
                    callback(fakeSocket);
                }
            },
            emit: (eventName: string, args: any[] | any) => {
                return;
            },
            in: (roomId: string) => {
                return fakeIn;
            },
        } as unknown as io.Server;
        const spy = sinon.spy(fakeSocket, 'emit');
        const spyTo = sinon.spy(fakeSocket, 'to');
        const spyJoin = sinon.spy(fakeSocket, 'join');
        const spyOnEmit = sinon.spy(service['sio'], 'emit');
        const spyIn = sinon.spy(service['sio'], 'in');

        const room = new Room('mike1234', socketId, settings, State.Waiting);
        roomManagerService.rooms = [[room], []];
        roomManagerService.find.returns(room);

        service.handleSockets();
        expect(spyTo.called).to.equal(true);
        expect(spyJoin.called).to.equal(true);
        expect(spyOnEmit.called).to.equal(true);
        expect(spyIn.called).to.equal(true);
        expect(spy.called).to.equal(true);
        expect(roomManagerService.setSocket.called).to.equal(true);
        expect(roomManagerService.setState.called).to.equal(true);
    });

    it('should handle an end game by give up', () => {
        const fakeSocket = {
            on: (eventName: string, callback: (isEndGame: boolean, roomId: string, gameType: GameType) => void) => {
                if (eventName === 'sendEndGameByGiveUp') {
                    callback(true, 'mike1234', GameType.Classic);
                }
            },
            emit: (eventName: string, args: any[] | any) => {
                return;
            },
            to: (roomId: string) => {
                return fakeIn;
            },
        } as unknown as io.Socket;

        service['sio'] = {
            on: (eventName: string, callback: (socket: any) => void) => {
                if (eventName === 'connection') {
                    callback(fakeSocket);
                }
            },
            emit: (eventName: string, args: any[] | any) => {
                return;
            },
            socketsLeave: (roomId: string) => {
                return;
            },
            in: (roomId: string) => {
                return fakeIn;
            },
        } as unknown as io.Server;

        const spyOnEmit = sinon.spy(service['sio'], 'emit');
        const spyOnTo = sinon.spy(fakeSocket, 'to');
        const spyOnLeave = sinon.spy(service['sio'], 'socketsLeave');
        const room = new Room('mike1234', socketId, settings, State.Waiting);
        roomManagerService.rooms = [[room], []];

        service.handleSockets();
        expect(spyOnLeave.calledWith(room.id)).to.equal(true);
        expect(spyOnEmit.calledWith('roomConfiguration', roomManagerService.rooms)).to.equal(true);
        expect(spyOnTo.calledWith(room.id)).to.equal(true);
    });

    it('should do nothing if the room is undefined', () => {
        const fakeSocket = {
            // eslint-disable-next-line no-unused-vars
            on: (eventName: string, callback: () => void) => {
                if (eventName === 'disconnect') {
                    callback();
                }
            },
        } as unknown as io.Socket;

        service['sio'] = {
            on: (eventName: string, callback: (socket: any) => void) => {
                if (eventName === 'connection') {
                    callback(fakeSocket);
                }
            },
        } as unknown as io.Server;
        roomManagerService.find.returns(undefined);
        service.handleSockets();
        expect(roomManagerService.deleteRoom.called).to.equal(false);
    });

    it('should delete the room and update the client if he is waiting on disconnect', () => {
        const fakeSocket = {
            // eslint-disable-next-line no-unused-vars
            on: (eventName: string, callback: () => void) => {
                if (eventName === 'disconnect') {
                    callback();
                }
            },
        } as unknown as io.Socket;

        service['sio'] = {
            on: (eventName: string, callback: (socket: any) => void) => {
                if (eventName === 'connection') {
                    callback(fakeSocket);
                }
            },
            emit: (eventName: string, args: any[] | any) => {
                return;
            },
        } as unknown as io.Server;
        const spyOnEmit = sinon.spy(service['sio'], 'emit');
        const room = new Room('mike1234', socketId, settings, State.Waiting);
        roomManagerService.rooms = [[room], []];
        roomManagerService.find.returns(room);
        roomManagerService.findRoomIdOf.returns(room.id);
        service.handleSockets();
        expect(roomManagerService.deleteRoom.calledWith(room.id)).to.equal(true);
        expect(spyOnEmit.calledWith('roomConfiguration', roomManagerService.rooms)).to.equal(true);
    });

    it('should send winnerName when i close my window', () => {
        const fakeSocket = {
            // eslint-disable-next-line no-unused-vars
            on: (eventName: string, callback: () => void) => {
                if (eventName === 'disconnect') {
                    callback();
                }
            },
            emit: (eventName: string, args: any[] | any) => {
                return;
            },

            leave: (roomId: string) => {
                return;
            },
            to: (roomId: string) => {
                return fakeIn;
            },
        } as unknown as io.Socket;

        service['sio'] = {
            on: (eventName: string, callback: (socket: any) => void) => {
                if (eventName === 'connection') {
                    callback(fakeSocket);
                }
            },
            in: (roomId: string) => {
                return fakeIn;
            },
            emit: (eventName: string, args: any[] | any) => {
                return;
            },
        } as unknown as io.Server;
        const spyOnTo = sinon.spy(fakeSocket, 'to');
        const spyOnLeave = sinon.spy(fakeSocket, 'leave');
        const room = new Room('mike1234', socketId, settings, State.Playing);
        roomManagerService.rooms = [[room], []];
        roomManagerService.find.returns(room);
        roomManagerService.findRoomIdOf.returns(room.id);
        const clock = sinon.useFakeTimers();
        service.handleSockets();
        clock.tick(6000);
        expect(spyOnTo.calledWith(room.id)).to.equal(true);
        expect(spyOnLeave.calledWith(room.id)).to.equal(true);
        clock.restore();
    });

    it('should delete the game when the second client is leaving', () => {
        const fakeSocket = {
            // eslint-disable-next-line no-unused-vars
            on: (eventName: string, callback: () => void) => {
                if (eventName === 'disconnect') {
                    callback();
                }
            },
        } as unknown as io.Socket;

        service['sio'] = {
            on: (eventName: string, callback: (socket: any) => void) => {
                if (eventName === 'connection') {
                    callback(fakeSocket);
                }
            },
            emit: (eventName: string, args: any[] | any) => {
                return;
            },
            socketsLeave: (roomId: string) => {
                return;
            },
        } as unknown as io.Server;
        const room = new Room('mike1234', socketId, settings, State.Finish);
        const spyOnEmit = sinon.spy(service['sio'], 'emit');
        const spyOnLeave = sinon.spy(service['sio'], 'socketsLeave');
        roomManagerService.rooms = [[room], []];
        roomManagerService.find.returns(room);
        roomManagerService.findRoomIdOf.returns(room.id);
        service.handleSockets();
        expect(spyOnLeave.calledWith(room.id)).to.equal(true);
        expect(roomManagerService.deleteRoom.calledWith(room.id)).to.equal(true);
        expect(spyOnEmit.calledWith('roomConfiguration', roomManagerService.rooms)).to.equal(true);
    });

    it('should send a message', () => {
        const fakeSocket = {
            on: (eventName: string, callback: (message: string, roomId: string) => void) => {
                if (eventName === 'sendRoomMessage') {
                    callback('Mike', 'mike1234');
                }
            },

            emit: (eventName: string, args: any[] | any) => {
                return;
            },
            to: (roomId: string) => {
                return fakeIn;
            },
        };

        const spy = sinon.spy(fakeSocket, 'to');
        service['sio'] = {
            on: (eventName: string, callback: (socket: any) => void) => {
                if (eventName === 'connection') {
                    callback(fakeSocket);
                }
            },
        } as unknown as io.Server;
        service.handleSockets();
        expect(spy.calledWith('mike1234')).to.equal(true);
    });

    it('should send GameConversion a message', () => {
        const fakeSocket = {
            on: (eventName: string, callback: (message: string, roomId: string) => void) => {
                if (eventName === 'sendGameConversionMessage') {
                    callback('Mike', 'mike1234');
                }
            },

            emit: (eventName: string, args: any[] | any) => {
                return;
            },
            to: (roomId: string) => {
                return fakeIn;
            },
        };

        const spy = sinon.spy(fakeSocket, 'to');
        service['sio'] = {
            on: (eventName: string, callback: (socket: any) => void) => {
                if (eventName === 'connection') {
                    callback(fakeSocket);
                }
            },
        } as unknown as io.Server;
        service.handleSockets();
        expect(spy.calledWith('mike1234')).to.equal(true);
    });

    it('should not add a new player in the room if the room is busy', () => {
        const typeMode = GameType.Classic;
        const fakeSocket = {
            on: (eventName: string, callback: (playerName: string, roomId: string, gameType: GameType) => void) => {
                if (eventName === 'newRoomCustomer') {
                    callback('Mike', 'mike1234', typeMode);
                }
            },

            emit: (eventName: string, args: any[] | any) => {
                return;
            },
        };

        service['sio'] = {
            on: (eventName: string, callback: (socket: any) => void) => {
                if (eventName === 'connection') {
                    callback(fakeSocket);
                }
            },
        } as unknown as io.Server;

        roomManagerService.isNotAvailable.returns(true);
        const spy = sinon.spy(fakeSocket, 'emit');
        service.handleSockets();
        expect(spy.calledWith('roomAlreadyToken')).to.equal(true);
    });

    it('should emit receivePlacement on sendPlacement event', () => {
        const fakeSocket = {
            on: (
                eventName: string,
                callback: (scrabbleBoard: string[][], startPosition: unknown, orientation: string, word: string, roomId: string) => void,
            ) => {
                if (eventName === 'sendPlacement') {
                    callback(scrabbleBoard, 'H8', 'h', 'manger', 'mike1234');
                }
            },
            to: (roomId: string) => {
                return fakeIn;
            },
            emit: (eventName: string, args: any[] | any) => {
                return;
            },
        };

        service['sio'] = {
            on: (eventName: string, callback: (socket: any) => void) => {
                if (eventName === 'connection') {
                    callback(fakeSocket);
                }
            },
        } as unknown as io.Server;
        const spy = sinon.spy(fakeSocket, 'to');
        service.handleSockets();
        expect(spy.called).to.equal(true);
    });

    it('should emit receiveReserve on sendReserve event', () => {
        const fakeSocket = {
            on: (
                eventName: string,
                // eslint-disable-next-line no-unused-vars
                callback: (reserve: unknown, reserveSize: number, roomId: string) => void,
            ) => {
                if (eventName === 'sendReserve') {
                    callback('reserve', 102, 'mike123');
                }
            },
            to: (roomId: string) => {
                return fakeIn;
            },
            emit: (eventName: string, args: any[] | any) => {
                return;
            },
        };

        service['sio'] = {
            on: (eventName: string, callback: (socket: any) => void) => {
                if (eventName === 'connection') {
                    callback(fakeSocket);
                }
            },
        } as unknown as io.Server;
        const spy = sinon.spy(fakeSocket, 'to');
        service.handleSockets();
        expect(spy.calledWith('mike123')).to.equal(true);
    });

    it('should emit newTurn and startTimer on switchTurn event', () => {
        const fakeSocket = {
            on: (
                eventName: string,
                // eslint-disable-next-line no-unused-vars
                callback: (turn: boolean, roomId: string) => void,
            ) => {
                if (eventName === 'switchTurn') {
                    callback(true, 'mike123');
                }
            },
            to: (roomId: string) => {
                return fakeIn;
            },
            emit: (eventName: string, args: any[] | any) => {
                return;
            },
        };

        service['sio'] = {
            on: (eventName: string, callback: (socket: any) => void) => {
                if (eventName === 'connection') {
                    callback(fakeSocket);
                }
            },
            in: (roomId: string) => {
                return fakeIn;
            },
            emit: (eventName: string, args: any[] | any) => {
                return;
            },
        } as unknown as io.Server;
        const spyOnToFakeSocket = sinon.spy(fakeSocket, 'to');
        const spyOnInSio = sinon.spy(service['sio'], 'in');
        service.handleSockets();
        expect(spyOnInSio.called).to.equal(true);
        expect(spyOnToFakeSocket.called).to.equal(true);
    });

    it('should not emit newTurn and startTimer on switchTurn event', () => {
        const fakeSocket = {
            on: (
                eventName: string,
                // eslint-disable-next-line no-unused-vars
                callback: (turn: boolean, roomId: string) => void,
            ) => {
                if (eventName === 'switchTurn') {
                    callback(false, 'mike123');
                }
            },
            to: (roomId: string) => {
                return fakeIn;
            },

            emit: (eventName: string, args: any[] | any) => {
                return;
            },
        };

        service['sio'] = {
            on: (eventName: string, callback: (socket: any) => void) => {
                if (eventName === 'connection') {
                    callback(fakeSocket);
                }
            },
            in: (roomId: string) => {
                return fakeIn;
            },

            emit: (eventName: string, args: any[] | any) => {
                return;
            },
        } as unknown as io.Server;
        const spyOnToFakeSocket = sinon.spy(fakeSocket, 'to');
        const spyOnInSio = sinon.spy(service['sio'], 'in');
        service.handleSockets();
        expect(spyOnInSio.called).to.equal(false);
        expect(spyOnToFakeSocket.called).to.equal(false);
    });

    it('should emit receiveScoreInfo on updateScoreInfo event', () => {
        const fakeSocket = {
            on: (
                eventName: string,
                // eslint-disable-next-line no-unused-vars
                callback: (score: number, indexPlayer: number, roomId: string) => void,
            ) => {
                if (eventName === 'updateScoreInfo') {
                    callback(5, 0, 'mike123');
                }
            },
            to: (roomId: string) => {
                return fakeIn;
            },

            emit: (eventName: string, args: any[] | any) => {
                return;
            },
        };

        service['sio'] = {
            on: (eventName: string, callback: (socket: any) => void) => {
                if (eventName === 'connection') {
                    callback(fakeSocket);
                }
            },
        } as unknown as io.Server;
        const spy = sinon.spy(fakeSocket, 'to');
        const spyOnEmit = sinon.spy(fakeIn, 'emit');
        service.handleSockets();
        expect(spyOnEmit.calledWith('receiveScoreInfo', 5, 0)).to.equal(true);
        expect(spy.calledWith('mike123')).to.equal(true);
    });

    it('should emit receiveActions on receiveActions event', () => {
        const fakeSocket = {
            on: (eventName: string, callback: (actions: string[], roomId: string) => void) => {
                if (eventName === 'sendActions') {
                    callback(['passer', 'passer'], 'mike123');
                }
            },
            to: (roomId: string) => {
                return fakeIn;
            },

            emit: (eventName: string, args: any[] | any) => {
                return;
            },
        };

        service['sio'] = {
            on: (eventName: string, callback: (socket: any) => void) => {
                if (eventName === 'connection') {
                    callback(fakeSocket);
                }
            },
        } as unknown as io.Server;
        const spy = sinon.spy(fakeSocket, 'to');
        service.handleSockets();
        expect(spy.calledWith('mike123')).to.equal(true);
    });

    it('should emit receiveEndGame on sendEndGame event', () => {
        const letterTable: Letter[] = [];
        const fakeSocket = {
            on: (eventName: string, callback: (isEndGame: boolean, letterTable: Letter[], roomId: string) => void) => {
                if (eventName === 'sendEndGame') {
                    callback(true, letterTable, 'mike123');
                }
            },
            to: (roomId: string) => {
                return fakeIn;
            },

            emit: (eventName: string, args: any[] | any) => {},
        };

        service['sio'] = {
            on: (eventName: string, callback: (socket: any) => void) => {
                if (eventName === 'connection') {
                    callback(fakeSocket);
                }
            },

            in: (roomId: string) => {
                return fakeIn;
            },
        } as unknown as io.Server;
        const spyOnIn = sinon.spy(service['sio'], 'in');
        const spyTwo = sinon.spy(fakeSocket, 'to');
        service.handleSockets();
        expect(spyOnIn.called).to.equal(true);
        expect(spyTwo.called).to.equal(true);
    });

    it('should emit receivePlayerTwo on sendPlayerTwo event', () => {
        const fakeSocket = {
            on: (eventName: string, callback: (letterTable: unknown, roomId: string) => void) => {
                if (eventName === 'sendPlayerTwo') {
                    callback('asvgavs', 'mike123');
                }
            },
            to: (roomId: string) => {
                return fakeIn;
            },

            emit: (eventName: string, args: any[] | any) => {},
        };

        service['sio'] = {
            on: (eventName: string, callback: (socket: any) => void) => {
                if (eventName === 'connection') {
                    callback(fakeSocket);
                }
            },

            in: (roomId: string) => {
                return fakeIn;
            },
        } as unknown as io.Server;
        const spy = sinon.spy(fakeSocket, 'to');
        service.handleSockets();
        expect(spy.calledWith('mike123')).to.equal(true);
    });

    it('should send easel', () => {
        const letterTable: Letter[] = [];
        const fakeSocket = {
            // eslint-disable-next-line no-unused-vars
            on: (eventName: string, callback: (letterTable: Letter[], roomId: string) => void) => {
                if (eventName === 'sendEasel') {
                    callback(letterTable, '1');
                }
            },
            emit: (eventName: string, args: any[] | any) => {
                return;
            },
            to: (roomId: string) => {
                return fakeIn;
            },
        };

        service['sio'] = {
            on: (eventName: string, callback: (socket: any) => void) => {
                if (eventName === 'connection') {
                    callback(fakeSocket);
                }
            },

            in: (roomId: string) => {
                return fakeIn;
            },
        } as unknown as io.Server;
        const spy = sinon.spy(fakeSocket, 'to');
        service.handleSockets();
        expect(spy.called).to.equal(true);
    });
});
