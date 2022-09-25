import { Component, OnDestroy, OnInit } from '@angular/core';
import { DELAY_BEFORE_PLAYING, PLAYER_AI_INDEX, PLAYER_ONE_INDEX, PLAYER_TWO_INDEX } from '@app/classes/constants';
import { PlayerAI } from '@app/models/player-ai.model';
import { Player } from '@app/models/player.model';
import { ClientSocketService } from '@app/services/client-socket.service';
import { EndGameService } from '@app/services/end-game.service';
import { GameSettingsService } from '@app/services/game-settings.service';
import { LetterService } from '@app/services/letter.service';
import { PlayerAIService } from '@app/services/player-ai.service';
import { PlayerService } from '@app/services/player.service';
import { SkipTurnService } from '@app/services/skip-turn.service';
import { WordValidationService } from '@app/services/word-validation.service';
import { Letter } from '@common/letter';

@Component({
    selector: 'app-information-panel',
    templateUrl: './information-panel.component.html',
    styleUrls: ['./information-panel.component.scss'],
})
export class InformationPanelComponent implements OnInit, OnDestroy {
    constructor(
        public gameSettingsService: GameSettingsService,
        public letterService: LetterService,
        public playerService: PlayerService,
        public skipTurnService: SkipTurnService,
        public endGameService: EndGameService,
        private clientSocketService: ClientSocketService,
        public playerAiService: PlayerAIService,
        private wordValidation: WordValidationService,
    ) {
        this.receivePlayerTwo();
    }

    ngOnInit(): void {
        this.wordValidation.fileName = this.gameSettingsService.gameSettings.dictionary;
        this.initializePlayers();
        this.initializeFirstTurn();
        this.skipTurnService.startTimer();
        this.callThePlayerAiOnItsTurn();
    }

    receivePlayerTwo(): void {
        this.clientSocketService.socket.on('receivePlayerTwo', (letterTable: Letter[]) => {
            const player = new Player(2, this.gameSettingsService.gameSettings.playersNames[PLAYER_TWO_INDEX], letterTable);
            if (this.playerService.players.length < 2) {
                this.playerService.addPlayer(player);
                this.letterService.removeLettersFromReserve(this.playerService.players[PLAYER_ONE_INDEX].letterTable);
            }
        });
    }

    callThePlayerAiOnItsTurn(): void {
        if (!this.skipTurnService.isTurn && this.gameSettingsService.isSoloMode) {
            const playerAi = this.playerService.players[PLAYER_AI_INDEX] as PlayerAI;
            setTimeout(() => {
                playerAi.play();
            }, DELAY_BEFORE_PLAYING);
        }
    }

    initializePlayers(): void {
        let player = new Player(1, this.gameSettingsService.gameSettings.playersNames[PLAYER_ONE_INDEX], this.letterService.getRandomLetters());
        this.playerService.addPlayer(player);
        if (this.gameSettingsService.isSoloMode) {
            player = new PlayerAI(
                2,
                this.gameSettingsService.gameSettings.playersNames[PLAYER_TWO_INDEX],
                this.letterService.getRandomLetters(),
                this.playerAiService,
            );
            this.playerService.addPlayer(player);
            return;
        }
        this.clientSocketService.socket.emit('sendPlayerTwo', player.letterTable, this.clientSocketService.roomId);
    }

    initializeFirstTurn(): void {
        this.skipTurnService.isTurn = Boolean(this.gameSettingsService.gameSettings.startingPlayer.valueOf());
    }

    displaySeconds(): string {
        let secondsFormatted: string;
        const seconds = this.skipTurnService.seconds;
        secondsFormatted = seconds > 0 ? seconds.toString() : '0';
        const BIGGER_NUMBER_ONE_DIGIT = 9;
        if (seconds <= BIGGER_NUMBER_ONE_DIGIT) secondsFormatted = '0' + secondsFormatted;
        return secondsFormatted;
    }

    ngOnDestroy(): void {
        this.playerService.clearPlayers();
        this.skipTurnService.stopTimer();
    }
}
