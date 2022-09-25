import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ONE_SECOND_DELAY, TWO_SECOND_DELAY } from '@app/classes/constants';
import { ClientSocketService } from '@app/services/client-socket.service';
import { GameSettingsService } from '@app/services/game-settings.service';
import { PlayerIndex } from '@common/player-index';

@Component({
    selector: 'app-waiting-room',
    templateUrl: './waiting-room.component.html',
    styleUrls: ['./waiting-room.component.scss'],
})
export class WaitingRoomComponent implements OnInit {
    status: string;
    isWaiting: boolean;

    constructor(private router: Router, private gameSettingsService: GameSettingsService, private clientSocket: ClientSocketService) {
        this.status = '';
        this.isWaiting = true;
        this.clientSocket.routeToGameView();
    }

    ngOnInit(): void {
        this.playAnimation();
    }

    playAnimation(): void {
        const startMessage = 'Connexion au serveur...';
        this.waitBeforeChangeStatus(ONE_SECOND_DELAY, startMessage);
        this.clientSocket.socket.connect();

        this.handleReloadErrors();
        setTimeout(() => {
            if (this.clientSocket.socket.connected) {
                const connexionSuccess = 'Connexion réussie';
                this.isWaiting = true;
                this.waitBeforeChangeStatus(0, connexionSuccess);
                const waitingMessage = "En attente d'un joueur...";
                this.waitBeforeChangeStatus(TWO_SECOND_DELAY, waitingMessage);
                this.clientSocket.socket.emit('createRoom', this.gameSettingsService.gameSettings, this.clientSocket.gameType);
            } else {
                this.status = 'Erreur de connexion... Veuillez réessayer';
                this.isWaiting = false;
            }
        }, TWO_SECOND_DELAY);
    }

    handleReloadErrors(): void {
        if (this.gameSettingsService.gameSettings.playersNames[PlayerIndex.OWNER] === '') {
            const errorMessage = 'Une erreur est survenue';
            this.waitBeforeChangeStatus(ONE_SECOND_DELAY, errorMessage);
            this.router.navigate(['home']);
            return;
        }
    }

    waitBeforeChangeStatus(waitingTime: number, message: string): void {
        setTimeout(() => {
            this.status = message;
        }, waitingTime);
    }

    deleteGame(): void {
        this.clientSocket.socket.emit('deleteGame', this.clientSocket.roomId);
    }

    routeToGameView(): void {
        this.gameSettingsService.isSoloMode = true;
        this.gameSettingsService.isRedirectedFromMultiplayerGame = true;
        this.deleteGame();
        this.router.navigate(['solo-game-ai']);
    }
}
