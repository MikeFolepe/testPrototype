import { OUT_BOUND_INDEX_OF_SOCKET } from '@app/classes/constants';
import { GameSettings, StartingPlayer } from '@common/game-settings';
import { GameType } from '@common/game-type';
import { ObjectiveTypes } from '@common/objectives-type';
import { PlayerIndex } from '@common/player-index';
import { Room, State } from '@common/room';
import { Service } from 'typedi';

@Service()
export class RoomManagerService {
    rooms: Room[][];

    constructor() {
        this.rooms = [[], []];
    }

    createRoom(socketId: string, roomId: string, gameSettings: GameSettings, gameType: GameType) {
        this.rooms[gameType].push(new Room(roomId, socketId, gameSettings));
    }

    createRoomId(playerName: string, socketId: string) {
        return (
            new Date().getFullYear().toString() +
            new Date().getMonth().toString() +
            new Date().getHours().toString() +
            new Date().getMinutes().toString() +
            new Date().getSeconds().toString() +
            new Date().getMilliseconds().toString() +
            socketId +
            playerName
        );
    }

    addCustomer(customerName: string, roomId: string): boolean {
        const room = this.find(roomId);
        if (room === undefined) return false;
        room.gameSettings.playersNames[PlayerIndex.CUSTOMER] = customerName;

        return true;
    }

    setState(roomId: string, state: State): void {
        const room = this.find(roomId) as Room;
        room.state = state;
    }

    setSocket(room: Room, socketId: string): void {
        room.socketIds.push(socketId);
    }

    getGameSettings(roomId: string): GameSettings {
        const room = this.find(roomId) as Room;
        return room.gameSettings;
    }

    formatGameSettingsForCustomerIn(roomId: string): GameSettings {
        const room = this.find(roomId) as Room;
        const gameSettings = room.gameSettings;
        const playerNames: string[] = [gameSettings.playersNames[PlayerIndex.CUSTOMER], gameSettings.playersNames[PlayerIndex.OWNER]];
        const startingPlayer = gameSettings.startingPlayer ? StartingPlayer.Player1 : StartingPlayer.Player2;
        let temp = gameSettings.objectiveIds[ObjectiveTypes.Private].slice(0, 2);
        temp = [temp[1], temp[0]];
        const formattedGameSettings = new GameSettings(
            playerNames,
            startingPlayer,
            gameSettings.timeMinute,
            gameSettings.timeSecond,
            gameSettings.level,
            gameSettings.randomBonus,
            gameSettings.bonusPositions,
            gameSettings.dictionary,
            [gameSettings.objectiveIds[ObjectiveTypes.Public], temp],
        );

        return formattedGameSettings;
    }

    deleteRoom(roomId: string): void {
        // JUSTIFICATION : We use it for use splice method of Array for (i,j) 2D array of Rooms
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < this.rooms.length; i++) {
            for (let j = 0; j < this.rooms[i].length; j++) {
                if (this.rooms[i][j].id === roomId) this.rooms[i].splice(j, 1);
            }
        }
    }

    findRoomIdOf(socketIdToCompare: string): string {
        for (const roomMode of this.rooms) {
            for (const room of roomMode) {
                for (const socketId of room.socketIds) {
                    if (socketId === socketIdToCompare) return room.id;
                }
            }
        }
        return '';
    }

    findLooserIndex(socketIdToCompare: string): number {
        for (const roomMode of this.rooms) {
            for (const room of roomMode) {
                for (const socketId of room.socketIds) {
                    if (socketId === socketIdToCompare) return room.socketIds.indexOf(socketId) as number;
                }
            }
        }
        return OUT_BOUND_INDEX_OF_SOCKET;
    }

    getWinnerName(roomId: string, indexOfLoser: number): string {
        const room = this.find(roomId) as Room;
        if (room === undefined) return '';
        return indexOfLoser === 0 ? room.gameSettings.playersNames[1] : room.gameSettings.playersNames[0];
    }

    isNotAvailable(roomId: string): boolean {
        const room = this.find(roomId);
        return room === undefined ? false : room.state === State.Playing;
    }

    find(roomId: string): Room | undefined {
        for (const roomMode of this.rooms) {
            for (const room of roomMode) {
                if (room.id === roomId) return room;
            }
        }
        return undefined;
    }

    findRoomInWaitingState(customerName: string, gameType: GameType): Room | undefined {
        const roomWaiting: Room[] = [];
        for (const room of this.rooms[gameType]) {
            if (room.state === State.Waiting && room.gameSettings.playersNames[PlayerIndex.OWNER] !== customerName) {
                roomWaiting.push(room);
            }
        }
        if (roomWaiting.length === 0) return;
        const roomIndex = Math.floor(Math.random() * roomWaiting.length);
        return roomWaiting[roomIndex] as Room;
    }

    getNumberOfRoomInWaitingState(): number[] {
        const numberOfRoom: number[] = [0, 0];
        // special case
        if (this.rooms === undefined || this.rooms.length === 0) return numberOfRoom;

        for (let i = 0; i < this.rooms.length; i++) {
            let count = 0;
            for (const room of this.rooms[i]) {
                if (room.state === State.Waiting) count++;
            }
            numberOfRoom[i] = count;
        }

        return numberOfRoom;
    }
}
