import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { GameSettingsService } from '@app/services/game-settings.service';
import { GameSettings } from '@common/game-settings';
import { GameType } from '@common/game-type';
import { io, Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class ClientSocketService {
    socket: Socket;
    roomId: string;
    gameType: GameType;

    constructor(private gameSettingsService: GameSettingsService, private router: Router) {
        this.socket = io(environment.serverUrl);
        this.initializeRoomId();
        this.initializeGameSettings();
        this.routeToGameView();
    }

    routeToGameView(): void {
        this.socket.on('goToGameView', () => {
            this.router.navigate(['game']);
        });
    }

    initializeRoomId(): void {
        this.socket.on('yourRoomId', (roomIdFromServer: string) => {
            this.roomId = roomIdFromServer;
        });
    }

    initializeGameSettings(): void {
        this.socket.on('yourGameSettings', (gameSettingsFromServer: GameSettings) => {
            this.gameSettingsService.gameSettings = gameSettingsFromServer;
        });
    }
}
