import { Injectable } from '@angular/core';
import { NUMBER_OF_SKIP, PLAYER_AI_INDEX, PLAYER_ONE_INDEX, PLAYER_TWO_INDEX } from '@app/classes/constants';
import { PlayerAI } from '@app/models/player-ai.model';
import { DebugService } from '@app/services/debug.service';
import { Letter } from '@common/letter';
import { PlayerScore } from '@common/player';
import { ClientSocketService } from './client-socket.service';
import { GameSettingsService } from './game-settings.service';
import { LetterService } from './letter.service';
import { PlayerService } from './player.service';
import { SendMessageService } from './send-message.service';

@Injectable({
    providedIn: 'root',
})
export class EndGameService {
    actionsLog: string[] = [];
    isEndGame: boolean = false;
    isEndGameByGiveUp = false;
    winnerNameByGiveUp = '';
    playersScores: PlayerScore[] = [];

    constructor(
        public clientSocketService: ClientSocketService,
        public letterService: LetterService,
        public playerService: PlayerService,
        public debugService: DebugService,
        public gameSettingsService: GameSettingsService,
        private sendMessageService: SendMessageService,
    ) {
        this.clearAllData();
        this.actionsLog = [];
        this.isEndGame = false;
        this.receiveEndGameFromServer();
        this.receiveActionsFromServer();
    }

    receiveEndGameFromServer(): void {
        this.clientSocketService.socket.on('receiveEndGame', (isEndGame: boolean, letterTable: Letter[]) => {
            this.isEndGame = isEndGame;
            this.playerService.players[PLAYER_TWO_INDEX].letterTable = letterTable;
            this.clientSocketService.socket.emit(
                'sendEasel',
                this.playerService.players[PLAYER_ONE_INDEX].letterTable,
                this.clientSocketService.roomId,
            );
            this.sendMessageService.displayFinalMessage(PLAYER_ONE_INDEX);
            this.sendMessageService.displayFinalMessage(PLAYER_TWO_INDEX);
        });
    }

    receiveActionsFromServer(): void {
        this.clientSocketService.socket.on('receiveActions', (actionsLog: string[]) => {
            this.actionsLog = actionsLog;
        });
    }

    getWinnerName(): string {
        if (this.playerService.players[PLAYER_ONE_INDEX].score > this.playerService.players[PLAYER_TWO_INDEX].score) {
            return this.playerService.players[PLAYER_ONE_INDEX].name;
        }
        if (this.playerService.players[PLAYER_ONE_INDEX].score < this.playerService.players[PLAYER_TWO_INDEX].score) {
            return this.playerService.players[PLAYER_TWO_INDEX].name;
        }
        return this.playerService.players[PLAYER_ONE_INDEX].name + '  ' + this.playerService.players[PLAYER_TWO_INDEX].name;
    }

    addActionsLog(actionLog: string): void {
        this.actionsLog.push(actionLog);
        this.clientSocketService.socket.emit('sendActions', this.actionsLog, this.clientSocketService.roomId);
    }

    checkEndGame(): void {
        this.isEndGame = this.isEndGameByActions() || this.isEndGameByEasel() || this.isEndGameByGiveUp;
        if (this.isEndGame) {
            this.clientSocketService.socket.emit(
                'sendEndGame',
                this.isEndGame,
                this.playerService.players[PLAYER_ONE_INDEX].letterTable,
                this.clientSocketService.roomId,
            );
        }
    }

    getFinalScore(indexPlayer: number): void {
        for (const letter of this.playerService.players[indexPlayer].letterTable) {
            this.playerService.players[indexPlayer].score -= letter.points;
            // Check if score decrease under 0 after substraction

            if (this.playerService.players[indexPlayer].score <= 0) {
                this.playerService.players[indexPlayer].score = 0;
            }
        }
        if (this.playerService.players[indexPlayer] instanceof PlayerAI) return;

        this.playersScores.push({
            score: this.playerService.players[indexPlayer].score,
            playerName: this.playerService.players[indexPlayer].name,
            isDefault: false,
        });
    }

    clearAllData(): void {
        this.playerService.players = [];
        this.isEndGameByGiveUp = false;
        this.winnerNameByGiveUp = '';
        this.isEndGame = false;
        this.actionsLog = [];
        this.debugService.debugServiceMessage = [];
    }

    isEndGameByActions(): boolean {
        if (this.actionsLog.length < NUMBER_OF_SKIP) {
            return false;
        }
        const lastIndex = this.actionsLog.length - 1;
        for (let i = lastIndex; i > lastIndex - NUMBER_OF_SKIP; i--) {
            if (this.actionsLog[i] !== 'passer') {
                return false;
            }
        }
        return true;
    }

    isEndGameByEasel(): boolean {
        return (
            this.letterService.reserveSize === 0 &&
            (this.playerService.isEaselEmpty(PLAYER_ONE_INDEX) || this.playerService.isEaselEmpty(PLAYER_AI_INDEX))
        );
    }
}
