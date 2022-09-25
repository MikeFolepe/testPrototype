import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { BestScoresComponent } from '@app/pages/best-scores/best-scores.component';
import { ClientSocketService } from '@app/services/client-socket.service';
import { EndGameService } from '@app/services/end-game.service';
import { GameSettingsService } from '@app/services/game-settings.service';
import { GiveUpHandlerService } from '@app/services/give-up-handler.service';
import { LetterService } from '@app/services/letter.service';
import { PlaceLetterService } from '@app/services/place-letter.service';
import { WordValidationService } from '@app/services/word-validation.service';
import { GameType } from '@common/game-type';

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    styleUrls: ['./main-page.component.scss'],
})
export class MainPageComponent {
    selectedGameTypeIndex: number;
    selectedGameType: string | GameType;
    selectedGameMode?: string;
    readonly gameType: string[];
    readonly gameModes: string[];

    constructor(
        public gameSettingsService: GameSettingsService,
        private router: Router,
        public bestScoresDialog: MatDialog,
        private clientSocketService: ClientSocketService,
        private letterService: LetterService,
        private placeLetterService: PlaceLetterService,
        private giveUpHandlerService: GiveUpHandlerService,
        private endGameService: EndGameService,
        private wordValidationService: WordValidationService,
    ) {
        this.selectedGameTypeIndex = 0;
        this.gameType = ['Scrabble classique', 'Scrabble LOG2990'];
        this.gameModes = ['Jouer une partie en solo', 'Créer une partie multijoueur', 'Joindre une partie multijoueur'];
        this.resetServices();
    }

    routeToGameMode(): void {
        // Update game type and game mode, then route
        this.selectedGameType = this.gameType[this.selectedGameTypeIndex];
        const gameTypeIndex = this.gameType[0] === this.selectedGameType ? 0 : 1;
        this.gameSettingsService.gameType = gameTypeIndex;
        this.clientSocketService.gameType = gameTypeIndex;
        switch (this.selectedGameMode) {
            case this.gameModes[0]: {
                this.gameSettingsService.isSoloMode = true;
                this.router.navigate(['solo-game-ai']);
                break;
            }
            case this.gameModes[1]: {
                this.gameSettingsService.isSoloMode = false;
                this.router.navigate(['multiplayer-mode']);
                break;
            }
            case this.gameModes[2]: {
                this.gameSettingsService.isSoloMode = false;
                this.router.navigate(['join-room']);
                break;
            }
        }
    }

    openBestScoresDialog(): void {
        this.bestScoresDialog.open(BestScoresComponent, { disableClose: true });
    }

    resetServices() {
        this.giveUpHandlerService.isGivenUp = false;
        this.endGameService.actionsLog = [];
        this.wordValidationService.ngOnDestroy();
        this.letterService.ngOnDestroy();
        this.placeLetterService.ngOnDestroy();
        this.gameSettingsService.ngOnDestroy();
    }
}
