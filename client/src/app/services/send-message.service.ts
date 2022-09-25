import { Injectable } from '@angular/core';
import { PLAYER_ONE_INDEX, TWO_SECOND_DELAY } from '@app/classes/constants';
import { MessageType } from '@app/classes/enum';
import { ClientSocketService } from './client-socket.service';
import { GameSettingsService } from './game-settings.service';
import { PlayerService } from './player.service';

@Injectable({
    providedIn: 'root',
})
export class SendMessageService {
    message: string = '';
    messageType: MessageType;
    private displayMessage: () => void;

    constructor(
        private clientSocketService: ClientSocketService,
        private gameSettingsService: GameSettingsService,
        private playerService: PlayerService,
    ) {
        this.receiveMessageFromOpponent();
        // To display message in real time in chat box
        this.receiveConversionMessage();
    }

    // displayMessage() will call the method from chatBoxComponent to display the message
    displayBound(fn: () => void) {
        this.displayMessage = fn;
    }

    displayMessageByType(message: string, messageType: MessageType): void {
        this.message = message;
        this.messageType = messageType;
        if (this.messageType === MessageType.Player)
            this.sendMessageToOpponent(this.message, this.gameSettingsService.gameSettings.playersNames[PLAYER_ONE_INDEX]);

        this.displayMessage();
    }

    sendMessageToOpponent(message: string, myName: string): void {
        this.clientSocketService.socket.emit('sendRoomMessage', 'Message de ' + myName + ' : ' + message, this.clientSocketService.roomId);
    }

    // Function to send message of conversion to all players in the room
    sendConversionMessage(): void {
        this.clientSocketService.socket.emit(
            'sendGameConversionMessage',
            'Attention la partie est sur le point de se faire convertir en partie Solo.',
            this.clientSocketService.roomId,
        );
    }
    // Function to receive the conversion Message to the players which is the room
    receiveConversionMessage(): void {
        this.clientSocketService.socket.on('receiveGameConversionMessage', (message: string) => {
            this.displayMessageByType(message, MessageType.System);
        });
    }
    sendOpponentMessage(opponentMessage: string): void {
        this.messageType = MessageType.Opponent;
        this.message = opponentMessage;
        this.displayMessage();
    }

    receiveMessageFromOpponent(): void {
        this.clientSocketService.socket.on('receiveRoomMessage', (message: string) => {
            this.sendOpponentMessage(message);
        });
    }

    displayFinalMessage(indexPlayer: number): void {
        setTimeout(() => {
            let endGameEasel = '';
            this.displayMessageByType('Fin de partie - lettres restantes', MessageType.System);
            for (const letter of this.playerService.players[indexPlayer].letterTable) {
                endGameEasel += letter.value;
            }
            this.displayMessageByType(this.playerService.players[indexPlayer].name + ' : ' + endGameEasel, MessageType.System);
        }, TWO_SECOND_DELAY);
    }
}
