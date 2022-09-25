import { GameSettings } from '@common/game-settings';
import { PlayerIndex } from '@common/player-index';

export enum State {
    Playing,
    Waiting,
    Finish,
}

export class Room {
    id: string;
    gameSettings: GameSettings;
    state: State;
    socketIds: string[];

    constructor(roomId: string, socketId: string, gameSettings: GameSettings, state: State = State.Waiting) {
        this.id = roomId;
        this.socketIds = [];
        this.socketIds[PlayerIndex.OWNER] = socketId;
        this.gameSettings = gameSettings;
        this.state = state;
    }
}
