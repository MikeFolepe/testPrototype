import { Injectable } from '@angular/core';
import {
    DELAY_BEFORE_PLAYING,
    ONE_SECOND_DELAY,
    PLAYER_AI_INDEX,
    PLAYER_ONE_INDEX,
    PLAYER_TWO_INDEX,
    THREE_SECONDS_DELAY,
} from '@app/classes/constants';
import { PlayerAI } from '@app/models/player-ai.model';
import { ClientSocketService } from '@app/services/client-socket.service';
import { GameSettingsService } from '@app/services/game-settings.service';
import { CommunicationService } from './communication.service';
import { EndGameService } from './end-game.service';
import { ObjectivesService } from './objectives.service';
import { PlayerService } from './player.service';
import { SendMessageService } from './send-message.service';

@Injectable({
    providedIn: 'root',
})
export class SkipTurnService {
    isTurn: boolean;
    minutes: number;
    seconds: number;
    // JUSTIFICATION : Next line is mandatory, NodeJS return an eslint issue
    // eslint-disable-next-line no-undef
    intervalID: NodeJS.Timeout;
    shouldNotBeDisplayed: boolean;

    constructor(
        public gameSettingsService: GameSettingsService,
        private endGameService: EndGameService,
        private clientSocket: ClientSocketService,
        private playerService: PlayerService,
        private objectivesService: ObjectivesService,
        private sendMessageService: SendMessageService,
        private communicationService: CommunicationService,
    ) {
        this.receiveNewTurn();
        this.receiveStartFromServer();
        this.receiveStopFromServer();
        this.shouldNotBeDisplayed = false;
    }

    receiveNewTurn(): void {
        this.clientSocket.socket.on('turnSwitched', (turn: boolean) => {
            this.isTurn = turn;
        });
    }

    receiveStartFromServer(): void {
        this.clientSocket.socket.on('startTimer', () => {
            this.stopTimer();
            this.startTimer();
        });
    }
    receiveStopFromServer(): void {
        this.clientSocket.socket.on('stopTimer', () => {
            this.stopTimer();
        });
    }

    switchTurn(): void {
        this.checkEndGame();
        if (this.endGameService.isEndGame) return;

        this.stopTimer();
        if (this.isTurn) this.shouldNotBeDisplayed = true;
        setTimeout(() => {
            if (this.gameSettingsService.isSoloMode) {
                if (this.isTurn) {
                    this.isTurn = false;
                    this.startTimer();
                    const playerAi = this.playerService.players[PLAYER_AI_INDEX] as PlayerAI;
                    setTimeout(() => {
                        playerAi.play();
                    }, DELAY_BEFORE_PLAYING);
                } else {
                    this.isTurn = true;
                    this.shouldNotBeDisplayed = false;
                    this.startTimer();
                }
            } else {
                this.shouldNotBeDisplayed = false;
                this.clientSocket.socket.emit('switchTurn', this.isTurn, this.clientSocket.roomId);
                this.isTurn = false;
            }
        }, THREE_SECONDS_DELAY);
    }

    startTimer(): void {
        this.minutes = parseInt(this.gameSettingsService.gameSettings.timeMinute, 10);
        this.seconds = parseInt(this.gameSettingsService.gameSettings.timeSecond, 10);

        this.intervalID = setInterval(() => {
            if (this.seconds === 0 && this.minutes !== 0) {
                this.minutes = this.minutes - 1;
                this.seconds = 59;
                this.updateActiveTime();
            } else if (this.seconds === 0 && this.minutes === 0) {
                if (this.isTurn || this.gameSettingsService.isSoloMode) {
                    this.endGameService.actionsLog.push('AucuneAction');
                    this.clientSocket.socket.emit('sendActions', this.endGameService.actionsLog, this.clientSocket.roomId);
                    this.switchTurn();
                }
            } else {
                this.seconds = this.seconds - 1;
                this.updateActiveTime();
            }
        }, ONE_SECOND_DELAY);
    }

    stopTimer(): void {
        clearInterval(this.intervalID);
        this.minutes = 0;
        this.seconds = 0;
    }

    updateActiveTime() {
        if (this.isTurn && this.objectivesService.activeTimeRemaining[PLAYER_ONE_INDEX] > 0)
            this.objectivesService.activeTimeRemaining[PLAYER_ONE_INDEX]--;

        if (!this.isTurn && this.objectivesService.activeTimeRemaining[PLAYER_TWO_INDEX] > 0)
            this.objectivesService.activeTimeRemaining[PLAYER_TWO_INDEX]--;
    }

    checkEndGame(): void {
        if (this.endGameService.isEndGame) return;
        this.endGameService.checkEndGame();
        if (this.endGameService.isEndGame) {
            this.endGameService.getFinalScore(PLAYER_ONE_INDEX);
            this.endGameService.getFinalScore(PLAYER_TWO_INDEX);
            this.stopTimer();
            this.clientSocket.socket.emit('sendEasel', this.playerService.players[PLAYER_ONE_INDEX].letterTable, this.clientSocket.roomId);
            this.sendMessageService.displayFinalMessage(PLAYER_ONE_INDEX);
            this.sendMessageService.displayFinalMessage(PLAYER_TWO_INDEX);
            this.shouldNotBeDisplayed = true;
            this.communicationService.addPlayersScores(this.endGameService.playersScores, this.gameSettingsService.gameType).subscribe();
        }
    }
}
