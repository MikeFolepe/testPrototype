import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { DEFAULT_CHAT_HEIGHT, LOG2990_CHAT_HEIGHT } from '@app/classes/constants';
import { MessageType } from '@app/classes/enum';
import { BoardHandlerService } from '@app/services/board-handler.service';
import { ChatboxService } from '@app/services/chatbox.service';
import { EndGameService } from '@app/services/end-game.service';
import { GameSettingsService } from '@app/services/game-settings.service';
import { SendMessageService } from '@app/services/send-message.service';
import { GameType } from '@common/game-type';

@Component({
    selector: 'app-chatbox',
    templateUrl: './chatbox.component.html',
    styleUrls: ['./chatbox.component.scss'],
})
export class ChatboxComponent implements OnInit {
    @ViewChild('scrollMe') private myScrollContainer: ElementRef;

    message: string;
    listMessages: string[];
    listTypes: MessageType[];

    // Used to access MessageType enum in the HTML
    htmlTypeMessage = MessageType;

    private messageType: MessageType;

    constructor(
        private chatBoxService: ChatboxService,
        private sendMessageService: SendMessageService,
        public endGameService: EndGameService,
        private boardHandlerService: BoardHandlerService,
        private gameSettingsService: GameSettingsService,
    ) {
        this.message = '';
        this.listMessages = [];
        this.listTypes = [];
    }

    // Disable the current placement on the board when a click occurs in the chatbox
    @HostListener('mouseup', ['$event'])
    @HostListener('contextmenu', ['$event'])
    clickInChatBox(): void {
        this.boardHandlerService.cancelPlacement();
    }

    ngOnInit(): void {
        this.sendMessageService.displayBound(this.displayMessageByType.bind(this));
        this.initializeChatHeight();
        const gameType = this.gameSettingsService.gameType === GameType.Classic ? 'Classique' : 'LOG2990';
        this.sendSystemMessage('Début de la partie, mode ' + gameType + '.');
        this.sendSystemMessage(
            "Affichez la liste des commandes disponibles en tapant la commande '!aide', puis en appuyant sur la touche 'Entrée' de votre clavier.",
        );
    }

    handleKeyEvent(event: KeyboardEvent): void {
        if (event.key === 'Enter') {
            event.preventDefault();
            this.chatBoxService.sendPlayerMessage(this.message);
            this.scrollToBottom();
        }
    }

    displayMessageByType(): void {
        if (this.sendMessageService.messageType === MessageType.Error && this.message.length) {
            this.listTypes.push(this.sendMessageService.messageType);
            this.listMessages.push(this.message);
        }
        this.listTypes.push(this.sendMessageService.messageType);
        this.listMessages.push(this.sendMessageService.message);
        // Clear input
        this.message = '';
        this.scrollToBottom();
    }

    sendSystemMessage(systemMessage: string): void {
        this.messageType = MessageType.System;
        this.listTypes.push(this.messageType);
        this.listMessages.push(systemMessage);
    }

    scrollToBottom(): void {
        setTimeout(() => {
            // Timeout is used to update the scroll after the last element added
            this.myScrollContainer.nativeElement.scrollTop = this.myScrollContainer.nativeElement.scrollHeight;
        }, 1);
    }

    initializeChatHeight(): void {
        const chatBox = document.getElementById('chat-box');
        if (chatBox) {
            if (this.gameSettingsService.gameType) chatBox.style.height = LOG2990_CHAT_HEIGHT + 'vh';
            else chatBox.style.height = DEFAULT_CHAT_HEIGHT + 'vh';
        }
    }
}
