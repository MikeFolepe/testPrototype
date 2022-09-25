/* eslint-disable max-len */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { OUT_BOUND_INDEX_OF_SOCKET } from '@app/classes/constants';
import { RoomManagerService } from '@app/services/room-manager.service';
import { AiType } from '@common/ai-name';
import { GameSettings, StartingPlayer } from '@common/game-settings';
import { GameType } from '@common/game-type';
import { State } from '@common/room';
import { expect } from 'chai';

describe('RoomManagerService', () => {
    let roomManagerService: RoomManagerService;
    const id = 'LOG2990';
    const socketId1 = 'socket1';
    const settings: GameSettings = new GameSettings(
        ['Paul', 'Mike'],
        StartingPlayer.Player1,
        '00',
        '30',
        AiType.beginner,
        'Désactiver',
        'français',
        '00',
    );

    const id1 = 'LOG2991';
    const socketId3 = 'socket3';
    const mySettings: GameSettings = new GameSettings(
        ['Etienne', ''],
        StartingPlayer.Player1,
        '00',
        '30',
        AiType.beginner,
        'Désactiver',
        'français',
        '00',
    );

    const id4 = 'LOG2992';
    const socketId4 = 'socket4';
    const mySettings1: GameSettings = new GameSettings(
        ['Johanna', ''],
        StartingPlayer.Player1,
        '00',
        '30',
        AiType.beginner,
        'Désactiver',
        'français',
        '00',
    );

    beforeEach(() => {
        roomManagerService = new RoomManagerService();
        roomManagerService.rooms = [[], []];
    });

    afterEach(() => {
        roomManagerService.rooms = [[], []];
    });

    it('should create a Room', () => {
        roomManagerService.createRoom(socketId1, id, settings, GameType.Classic);
        expect(roomManagerService.rooms[0].length).to.equal(1);
    });

    it('should create a specific rew roomId base on the playerName', () => {
        const roomIdtest1 = roomManagerService.createRoomId('Paul', socketId1);
        expect(roomIdtest1).to.equal(roomIdtest1);
    });

    it('should not add customer at the Room if ht name are same', () => {
        roomManagerService.createRoom(socketId1, id, settings, GameType.Classic);
        expect(roomManagerService.addCustomer('Paul', 'noFountID')).to.equal(false);
    });

    it('should add customer at the Room if ht name are same', () => {
        roomManagerService.createRoom(socketId1, id, settings, GameType.Classic);
        settings.playersNames[1] = '';
        expect(roomManagerService.addCustomer('Paul', id)).to.equal(true);
    });

    it('should set the state of Room', () => {
        roomManagerService.createRoom(socketId1, id, settings, GameType.Classic);
        roomManagerService.setState(id, State.Playing);
        expect(roomManagerService.rooms[0][0].state).to.equal(State.Playing);
    });

    it('should setSocket in the room', () => {
        roomManagerService.createRoom(socketId1, id, settings, GameType.Classic);
        const socketId2 = 'socket2';
        const myRoom = roomManagerService.rooms[0][0];
        roomManagerService.setSocket(myRoom, socketId2);
        expect(roomManagerService.rooms[0][0].socketIds[1]).to.equal(socketId2);
    });

    it('should return the gamesettings  of room', () => {
        roomManagerService.createRoom(socketId1, id, settings, GameType.Classic);
        settings.startingPlayer = 0;
        expect(roomManagerService.rooms[0][0].gameSettings.startingPlayer).to.equal(0);
        expect(roomManagerService.formatGameSettingsForCustomerIn(id)).not.to.equal(undefined);
        expect(roomManagerService.getGameSettings(id)).not.to.equal(undefined);
    });

    it('should return the formatGameSettings for the Customer in a specific Room', () => {
        roomManagerService.createRoom(socketId1, id, settings, GameType.Classic);
        settings.startingPlayer = 0;
        expect(roomManagerService.rooms[0][0].gameSettings.startingPlayer).to.equal(0);
        expect(roomManagerService.formatGameSettingsForCustomerIn(id)).not.to.equal(undefined);
    });

    it('should return the formatGameSettings for the Customer in a specific Room and swith the starting player', () => {
        roomManagerService.createRoom(socketId1, id, settings, GameType.Classic);
        settings.startingPlayer = 1;
        expect(roomManagerService.rooms[0][0].gameSettings.startingPlayer).to.equal(1);
        expect(roomManagerService.formatGameSettingsForCustomerIn(id)).not.to.equal(undefined);
    });

    it('should delete the room with the right id', () => {
        roomManagerService.createRoom(socketId1, id, settings, GameType.Classic);
        roomManagerService.deleteRoom(id);
        expect(roomManagerService.rooms[0].length).to.equal(0);
    });

    it('should not delete the room if his ID is not in the table', () => {
        roomManagerService.createRoom(socketId1, id, settings, GameType.Classic);
        roomManagerService.deleteRoom('fakeId');
        expect(roomManagerService.rooms[0].length).to.equal(1);
    });

    it('should find the room with the soketId and return it', () => {
        roomManagerService.createRoom(socketId1, id, settings, GameType.Classic);
        const myRoomId = roomManagerService.findRoomIdOf(socketId1);
        expect(myRoomId).to.equal(id);
    });

    it('should not find the room with the soketId and return it', () => {
        roomManagerService.createRoom(socketId1, id, settings, GameType.Classic);
        const myRoomId = roomManagerService.findRoomIdOf('fakesocketId');
        expect(myRoomId).to.equal('');
    });

    it('should return  false if the room does not exist', () => {
        roomManagerService.rooms = [[], []];
        expect(roomManagerService.isNotAvailable(id)).to.equal(false);
    });

    it('should return false if the room  is available ', () => {
        roomManagerService.createRoom(socketId1, id, settings, GameType.Classic);
        expect(roomManagerService.isNotAvailable(id)).to.equal(false);
    });

    it('should return the index of the player who leave the game', () => {
        roomManagerService.createRoom(socketId1, id, settings, GameType.Classic);
        const socketId2 = 'socketId2';
        roomManagerService.setSocket(roomManagerService.rooms[0][0], socketId2);
        expect(roomManagerService.findLooserIndex(socketId2)).to.equal(1);
    });

    it('should return the index of the player who leave the game', () => {
        roomManagerService.createRoom(socketId1, id, settings, GameType.Classic);
        const socketId2 = 'socketId2';
        roomManagerService.setSocket(roomManagerService.rooms[0][0], socketId2);
        expect(roomManagerService.findLooserIndex(socketId2)).to.equal(1);
    });
    it('should return the winner name depend of the index  the player who give up the game ', () => {
        roomManagerService.rooms = [[], []];
        roomManagerService.createRoom(socketId1, id, settings, GameType.Classic);
        const socketId2 = 'socket2';
        roomManagerService.setSocket(roomManagerService.rooms[0][0], socketId2);
        expect(roomManagerService.getWinnerName(id, roomManagerService.findLooserIndex(socketId1))).to.equal('Paul');
    });

    it('should return the outbound index of socket if the socketId of the player who leave the game is not in the room', () => {
        roomManagerService.createRoom(socketId1, id, settings, GameType.Classic);
        const socketId2 = 'socketId2';
        const fakeSocket = 'socketId3';
        roomManagerService.setSocket(roomManagerService.rooms[0][0], socketId2);
        expect(roomManagerService.findLooserIndex(fakeSocket)).to.equal(OUT_BOUND_INDEX_OF_SOCKET);
    });

    it('should return the winner name depend of the index  the player who give up the game ', () => {
        roomManagerService.createRoom(socketId1, id, settings, GameType.Classic);
        const socketId2 = 'socket2';
        roomManagerService.setSocket(roomManagerService.rooms[0][0], socketId2);
        expect(roomManagerService.getWinnerName(id, roomManagerService.findLooserIndex(socketId2))).to.equal('Paul');
    });
    it('should return a empty string if the room is undefined ', () => {
        roomManagerService.createRoom(socketId1, id, settings, GameType.Classic);
        const socketId2 = 'socket2';
        roomManagerService.setSocket(roomManagerService.rooms[0][0], socketId2);
        expect(roomManagerService.getWinnerName('fake', roomManagerService.findLooserIndex(socketId2))).to.equal('');
    });
    it('should find the room with state in waiting and return it', () => {
        settings.playersNames[1] = '';
        roomManagerService.createRoom(socketId1, id, settings, GameType.Classic);
        // Second room with player in waiting state
        roomManagerService.createRoom(socketId3, id1, mySettings, GameType.Classic);
        roomManagerService.createRoom(socketId4, id4, mySettings1, GameType.Classic);
        expect(roomManagerService.findRoomInWaitingState('Mike', GameType.Classic)).not.to.equal(undefined);
    });
    it('should not find the room with state in waiting and return it', () => {
        // first room in waitin  state
        settings.playersNames[1] = '';
        roomManagerService.createRoom(socketId1, id, settings, GameType.Classic);
        roomManagerService.setState(id, State.Playing);
        // Second room with player in waiting state
        roomManagerService.createRoom(socketId3, id1, mySettings, GameType.Classic);
        roomManagerService.setState(id1, State.Playing);
        // third room in waiting state
        roomManagerService.createRoom(socketId4, id4, mySettings1, GameType.Classic);
        roomManagerService.setState(id4, State.Playing);

        expect(roomManagerService.findRoomInWaitingState('Mike', GameType.Classic)).to.equal(undefined);
    });

    it('should return the number of rooms in state Waiting', () => {
        const myTable = [3, 0];
        settings.playersNames[1] = '';
        roomManagerService.createRoom(socketId1, id, settings, GameType.Classic);
        roomManagerService.createRoom(socketId3, id1, mySettings, GameType.Classic);
        roomManagerService.createRoom(socketId4, id4, mySettings1, GameType.Classic);
        expect(roomManagerService.getNumberOfRoomInWaitingState()).to.deep.equal(myTable);
    });
    it('should return 0 if the number of rooms in state Waiting is 0', () => {
        settings.playersNames[1] = '';
        const myTable = [0, 0];
        roomManagerService.createRoom(socketId1, id, settings, GameType.Classic);
        roomManagerService.setState(id, State.Playing);
        roomManagerService.createRoom(socketId3, id1, mySettings, GameType.Classic);
        roomManagerService.setState(id1, State.Playing);
        expect(roomManagerService.getNumberOfRoomInWaitingState()).to.deep.equal(myTable);
    });
    it('should return 0 if the number of rooms gameType is equal 0', () => {
        roomManagerService.rooms = [[], []];
        const myTable = [0, 0];
        expect(roomManagerService.getNumberOfRoomInWaitingState()).to.deep.equal(myTable);
    });

    it('should return 0 if the type of rooms gameType is undefined ', () => {
        const myTable = [0, 0];
        roomManagerService.rooms = [];
        expect(roomManagerService.getNumberOfRoomInWaitingState()).to.deep.equal(myTable);
    });
});
