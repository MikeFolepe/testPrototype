import { Injectable } from '@angular/core';
import { MAX_NUMBER_OF_POSSIBILITY, PLAYER_ONE_INDEX } from '@app/classes/constants';
import { MessageType } from '@app/classes/enum';
import { Orientation } from '@app/classes/scrabble-board-pattern';
import { DebugService } from '@app/services/debug.service';
import { EndGameService } from '@app/services/end-game.service';
import { LetterService } from '@app/services/letter.service';
import { PlaceLetterService } from '@app/services/place-letter.service';
import { PlayerService } from '@app/services/player.service';
import { SendMessageService } from '@app/services/send-message.service';
import { SkipTurnService } from '@app/services/skip-turn.service';
import { SwapLetterService } from '@app/services/swap-letter.service';
import { Vec2 } from '@common/vec2';

@Injectable({
    providedIn: 'root',
})
export class ChatboxService {
    private message: string;
    private messageType: MessageType;
    private command: string;

    private readonly notTurnErrorMessage;

    constructor(
        private playerService: PlayerService,
        private swapLetterService: SwapLetterService,
        private placeLetterService: PlaceLetterService,
        private debugService: DebugService,
        private sendMessageService: SendMessageService,
        public endGameService: EndGameService,
        public letterService: LetterService,
        public skipTurnService: SkipTurnService,
    ) {
        this.message = '';
        this.command = '';
        this.notTurnErrorMessage = "ERREUR : Ce n'est pas ton tour";
    }

    sendPlayerMessage(message: string): void {
        this.messageType = MessageType.Player;
        this.message = message;
        if (!this.isValid()) this.sendMessageService.displayMessageByType(this.message, MessageType.Error);

        switch (this.command) {
            case 'debug': {
                this.executeDebug();
                break;
            }
            case 'passer': {
                this.executeSkipTurn();
                break;
            }
            case 'echanger': {
                this.executeSwap();
                break;
            }
            case 'placer': {
                this.executePlace();
                break;
            }
            case 'reserve': {
                this.executeReserve();
                break;
            }
            case 'aide': {
                this.executeHelp();
                break;
            }
            default: {
                break;
            }
        }
        // reset value for next message
        this.command = '';
    }

    private executeDebug(): void {
        this.debugService.switchDebugMode();
        if (this.debugService.isDebugActive) {
            this.sendMessageService.displayMessageByType('Affichages de débogage activés', MessageType.System);
            this.displayDebugMessage();
        } else {
            this.sendMessageService.displayMessageByType('Affichages de débogage désactivés', MessageType.System);
        }
    }

    private executeSwap(): void {
        if (this.skipTurnService.isTurn) {
            const messageSplitted = this.message.split(/\s/);

            if (this.swapLetterService.swapCommand(messageSplitted[1], PLAYER_ONE_INDEX)) {
                this.message = this.playerService.players[PLAYER_ONE_INDEX].name + ' : ' + this.message;
                this.sendMessageService.displayMessageByType(this.message, this.messageType);
                this.skipTurnService.switchTurn();
            }
        } else {
            this.sendMessageService.displayMessageByType(this.notTurnErrorMessage, MessageType.Error);
        }
    }

    private executeSkipTurn(): void {
        if (this.skipTurnService.isTurn) {
            this.endGameService.addActionsLog('passer');
            this.sendMessageService.displayMessageByType(this.message, this.messageType);
            this.skipTurnService.switchTurn();
        } else {
            this.sendMessageService.displayMessageByType(this.notTurnErrorMessage, MessageType.Error);
        }
    }

    private async executePlace(): Promise<void> {
        if (this.skipTurnService.isTurn) {
            const messageSplitted = this.message.split(/\s/);
            const positionSplitted = messageSplitted[1].split(/([0-9]+)/);

            // Vector containing start position of the word to place
            const position: Vec2 = {
                x: Number(positionSplitted[1]) - 1,
                y: positionSplitted[0].charCodeAt(0) - 'a'.charCodeAt(0),
            };
            const orientation = positionSplitted[2] === 'h' ? Orientation.Horizontal : Orientation.Vertical;

            await this.placeLetterService.placeCommand(position, orientation, messageSplitted[2], PLAYER_ONE_INDEX);
            return;
        }
        this.sendMessageService.displayMessageByType(this.notTurnErrorMessage, MessageType.Error);
    }

    private executeReserve(): void {
        if (!this.debugService.isDebugActive) {
            this.sendMessageService.displayMessageByType('Commande non réalisable', MessageType.Error);
            return;
        }
        for (const letter of this.letterService.reserve) {
            this.sendMessageService.displayMessageByType(letter.value + ':' + letter.quantity.toString(), MessageType.System);
        }
    }

    private executeHelp(): void {
        const commands = new Map<string, string>([
            ['aide', "Liste l'ensemble des commandes disponibles et explique brièvement leur utilisation. Ne prend aucun argument."],
            [
                'debug',
                "Active et désactive l'affichage d'informations relatives aux choix de jeu faits par les joueurs virtuels. Ne prend aucun argument.",
            ],
            ['échanger', 'Échange une ou plusieurs lettres du chevalet. Entrer les lettres à échanger sans espace entre-elles.'],
            ['passer', 'Passe son tour. Ne prend aucun argument.'],
            [
                'placer',
                'Place une lettre sur le plateau. Entrer les coordonnées de la case de la première lettre,' +
                    "suivi de l'orientation (h pour horizontal ou v pour vertical). Vient ensuite le mot à placer. " +
                    'Une lettre en majuscule utilisera la lettre *.',
            ],
            ['réserve', "Affiche l'état courant de la réserve. Ne prend aucun argument."],
        ]);

        const DOUBLE_SPACE = '\n\n';
        let finalMessage = 'Liste des commandes :' + DOUBLE_SPACE;

        for (const command of commands.keys()) {
            finalMessage += '!' + command + '\n';
            finalMessage += commands.get(command) + DOUBLE_SPACE;
        }
        const LAST_TWO_SKIP_LINES = 2;
        finalMessage = finalMessage.substring(0, finalMessage.length - LAST_TWO_SKIP_LINES);
        this.sendMessageService.displayMessageByType(finalMessage, MessageType.System);
    }

    private isValid(): boolean {
        if (this.message[0] !== '!') {
            this.sendMessageService.displayMessageByType(this.message, this.messageType);
            // If it's a normal message, it's always valid
            return true;
        }
        // If it's a command, we call the validation
        return this.isCommandValid() && this.isSyntaxValid();
    }

    private isCommandValid(): boolean {
        const validInputs = [/^!debug/g, /^!passer/g, /^!échanger/g, /^!placer/g, /^!reserve/g, /^!aide/g];

        for (const input of validInputs) if (input.test(this.message)) return true;

        this.message = "ERREUR : L'entrée est invalide";
        return false;
    }

    private isSyntaxValid(): boolean {
        const syntaxes = new Map<RegExp, string>([
            [/^!debug$/g, 'debug'],
            [/^!passer$/g, 'passer'],
            [/^!échanger\s([a-z]|[*]){1,7}$/g, 'echanger'],
            [/^!placer\s([a-o]([1-9]|1[0-5])[hv])\s([a-zA-Z\u00C0-\u00FF]|[*])+/g, 'placer'],
            [/^!reserve$/g, 'reserve'],
            [/^!aide$/g, 'aide'],
        ]);

        for (const syntax of syntaxes.keys()) {
            if (syntax.test(this.message) && syntaxes.get(syntax)) {
                this.command = syntaxes.get(syntax) as string;
                return true;
            }
        }
        this.message = 'ERREUR : La syntaxe est invalide';
        return false;
    }

    // Method which check the different size of table of possibility for the debug
    private displayDebugMessage(): void {
        const nbPossibilities = this.debugService.debugServiceMessage.length;
        if (nbPossibilities === 0) {
            this.sendMessageService.displayMessageByType('Aucune possibilité de placement trouvée!', MessageType.System);
        } else {
            for (let i = 0; i < Math.min(MAX_NUMBER_OF_POSSIBILITY, nbPossibilities); i++) {
                this.message = this.debugService.debugServiceMessage[i].word + ': -- ' + this.debugService.debugServiceMessage[i].point.toString();
                this.sendMessageService.displayMessageByType(this.message, MessageType.System);
            }
        }
        this.debugService.clearDebugMessage();
    }
}
