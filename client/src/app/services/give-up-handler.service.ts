import { Injectable, OnDestroy } from '@angular/core';
import { MINIMUM_TIME_PLAYING_AI, PLAYER_TWO_INDEX } from '@app/classes/constants';
import { PlayerAI } from '@app/models/player-ai.model';
import { ClientSocketService } from '@app/services/client-socket.service';
import { AdministratorService } from './administrator.service';
import { GameSettingsService } from './game-settings.service';
import { PlayerAIService } from './player-ai.service';
import { PlayerService } from './player.service';
import { SkipTurnService } from './skip-turn.service';

@Injectable({
    providedIn: 'root',
})
export class GiveUpHandlerService implements OnDestroy {
    isGivenUp: boolean;
    constructor(
        public gameSettingsService: GameSettingsService,
        private clientSocket: ClientSocketService,
        public playerService: PlayerService,
        public skipTurnService: SkipTurnService,
        private playerAIservice: PlayerAIService,
        private administratorService: AdministratorService,
    ) {
        this.isGivenUp = false;
        this.administratorService.initializeAiPlayers();
    }

    receiveEndGameByGiveUp(): void {
        this.clientSocket.socket.on('receiveEndGameByGiveUp', (isGiveUp: boolean, winnerName: string) => {
            if (winnerName === this.gameSettingsService.gameSettings.playersNames[0]) {
                this.gameSettingsService.isSoloMode = isGiveUp;
                this.isGivenUp = isGiveUp;
                const randomName = this.administratorService.getAiBeginnerName();
                this.gameSettingsService.gameSettings.playersNames[PLAYER_TWO_INDEX] = randomName;
                const playerAi = new PlayerAI(
                    2,
                    randomName,
                    this.playerService.players[PLAYER_TWO_INDEX].letterTable,
                    this.playerAIservice,
                    this.playerService.players[PLAYER_TWO_INDEX].score,
                );
                this.playerService.players[PLAYER_TWO_INDEX] = playerAi;
                if (!this.skipTurnService.isTurn && this.skipTurnService.seconds > MINIMUM_TIME_PLAYING_AI) playerAi.play();
            }
        });
    }

    ngOnDestroy(): void {
        this.isGivenUp = false;
    }
}
