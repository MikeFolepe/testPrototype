import { Injectable } from '@angular/core';
import { User } from '@common/user';
import { Router } from '@angular/router';

import { ClientSocketService } from './client-socket.service';
import { environment } from 'src/environments/environment';
import { CommunicationService } from './communication.service';
import { HttpErrorResponse } from '@angular/common/http';
import { ChatEvents } from '@common/chat.gateway.events';
import { ErrorHandlerService } from './error-handler.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ERROR_MESSAGE_DELAY } from '@app/classes/constants';
@Injectable({
    providedIn: 'root',
})
export class AuthService {
    currentUser: User;
    constructor(
        private clientSocketService: ClientSocketService,
        private router: Router,
        private communicationService: CommunicationService,
        public errorHandler: ErrorHandlerService,
        public snackBar: MatSnackBar,
    ) {}

    signIn(userData: User) {
        environment.serverUrl = userData.ipAddress;
        this.communicationService.connectUser(userData).subscribe(
            (valid: boolean) => {
                if (valid) {
                    this.currentUser = userData;
                    this.clientSocketService.socket.connect();
                    this.clientSocketService.socket.emit(ChatEvents.JoinRoom);
                    localStorage.setItem('ACCESS_TOKEN', 'access_token');
                    this.router.navigate(['/chat']);
                } else {
                    this.displayMessage('Cet utilisateur est déjà connecté');
                }
            },
            (error: HttpErrorResponse) => {
                this.errorHandler.handleRequestError(error);
            },
        );
    }
    isLoggedIn() {
        return true;
    }
    logout() {
        localStorage.removeItem('ACCESS_TOKEN');
    }

    private displayMessage(message: string): void {
        this.snackBar.open(message, 'OK', {
            duration: ERROR_MESSAGE_DELAY,
            horizontalPosition: 'center',
            verticalPosition: 'bottom',
            panelClass: ['snackBarStyle'],
        });
    }
}
