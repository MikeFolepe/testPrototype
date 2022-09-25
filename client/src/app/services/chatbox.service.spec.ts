/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { RESERVE } from '@app/classes/constants';
import { MessageType } from '@app/classes/enum';
import { Orientation, PossibleWords } from '@app/classes/scrabble-board-pattern';
import { Player } from '@app/models/player.model';
import { ChatboxService } from '@app/services/chatbox.service';

describe('ChatboxService', () => {
    let service: ChatboxService;
    let possibleWord: PossibleWords;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterTestingModule],
        });
        service = TestBed.inject(ChatboxService);

        const letterA = RESERVE[0];
        const letterB = RESERVE[1];
        const letterC = RESERVE[2];

        const firstPlayerEasel = [letterA, letterA, letterB, letterB, letterC, letterC, letterA];
        const firstPlayer = new Player(1, 'Player 1', firstPlayerEasel);
        service['playerService'].addPlayer(firstPlayer);
        possibleWord = { word: 'test', orientation: Orientation.Horizontal, line: 0, startIndex: 0, point: 1 };

        spyOn(service['sendMessageService'], 'displayMessageByType');
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should have type error if command is not valid', () => {
        service['message'] = '!debugg';
        service.sendPlayerMessage(service['message']);
        expect(service['message']).toEqual('ERREUR : La syntaxe est invalide');
    });

    it('should have type player if command is valid', () => {
        spyOn<any>(service, 'isValid').and.returnValue(true);

        service['message'] = '';
        service.sendPlayerMessage(service['message']);
        expect(service['messageType']).toEqual(MessageType.Player);
    });

    it('should have type player if command is valid', () => {
        spyOn<any>(service, 'isValid').and.returnValue(true);

        service.sendPlayerMessage(service['message']);
        expect(service['messageType']).toEqual(MessageType.Player);
        expect(service['command']).toEqual('');
    });

    it('should know if input is valid', () => {
        service['message'] = '!debug';
        expect(service['isValid']()).toBeTrue();

        service['message'] = '!passer';
        expect(service['isValid']()).toBeTrue();

        service['message'] = '!échanger *s';
        expect(service['isValid']()).toBeTrue();

        service['message'] = '!échanger';
        expect(service['isValid']()).toBeFalse();
        expect(service['message']).toEqual('ERREUR : La syntaxe est invalide');

        service['message'] = '!placer h8h test';
        expect(service['isValid']()).toBeTrue();

        service['message'] = '!placer 333';
        expect(service['isValid']()).toBeFalse();

        service['message'] = '!placer';
        expect(service['isValid']()).toBeFalse();

        service['message'] = '!notok';
        expect(service['isValid']()).toBeFalse();

        service['message'] = 'random text';
        expect(service['isValid']()).toBeTrue();
    });

    it('using command !debug should call executeDebug()', () => {
        const spy = spyOn<any>(service, 'executeDebug');
        service['command'] = 'debug';
        const table: PossibleWords[] = [];
        table.push(possibleWord);

        service['debugService'].receiveAIDebugPossibilities(table);
        service.sendPlayerMessage('!debug');
        expect(spy).toHaveBeenCalled();
        service.sendPlayerMessage('!debug');
        expect(spy).toHaveBeenCalled();
    });

    it('using command !debug without debug messages should display the respective message', () => {
        service['command'] = 'debug';
        service['debugService'].isDebugActive = false;
        service['debugService'].clearDebugMessage();

        service.sendPlayerMessage('!debug');
        expect(service['sendMessageService'].displayMessageByType).toHaveBeenCalledWith(
            'Aucune possibilité de placement trouvée!',
            MessageType.System,
        );
    });

    it('using command !passer should display the respective message', () => {
        spyOn(service['skipTurnService'], 'switchTurn');
        service['skipTurnService'].isTurn = true;
        service['command'] = 'passer';
        service.sendPlayerMessage('!passer');
        expect(service['message']).toEqual('!passer');
    });

    it('using a valid command !placer should not display any error message', async () => {
        spyOn(service['skipTurnService'], 'switchTurn');
        service['skipTurnService'].isTurn = true;
        spyOn(service['placeLetterService'], 'placeCommand').and.returnValue(Promise.resolve(true));
        service['command'] = 'placer';
        service['message'] = '!placer h8v hello';
        service['messageType'] = MessageType.Player;
        await service['executePlace']();
        expect(service['sendMessageService'].displayMessageByType).toHaveBeenCalledTimes(0);
    });

    it('using a valid command !placer vertical should not display any error message', async () => {
        spyOn(service['skipTurnService'], 'switchTurn');
        service['skipTurnService'].isTurn = true;
        spyOn(service['placeLetterService'], 'placeCommand').and.returnValue(Promise.resolve(true));
        service['command'] = 'placer';
        service['message'] = '!placer h8h hello';
        service['messageType'] = MessageType.Player;
        await service['executePlace']();
        expect(service['sendMessageService'].displayMessageByType).toHaveBeenCalledTimes(0);
    });

    it('using a valid command !échanger should display the respective message', () => {
        spyOn(service['skipTurnService'], 'switchTurn');
        service['skipTurnService'].isTurn = true;
        spyOn(service['swapLetterService'], 'swapCommand').and.returnValue(true);
        service['command'] = 'echanger';
        service.sendPlayerMessage('!échanger abc');
        expect(service['message']).toEqual('Player 1 : !échanger abc');
    });

    it('deactivating debug should display the respective message', () => {
        spyOn<any>(service, 'displayDebugMessage');

        service['command'] = 'debug';
        const table: { word: string; orientation: Orientation; line: number; startIndex: number; point: number }[] = [
            { word: 'message de debug', orientation: Orientation.Horizontal, line: 0, startIndex: 0, point: 1 },
        ];

        service['debugService'].debugServiceMessage = table;
        service['debugService'].isDebugActive = true;

        service.sendPlayerMessage('!debug');
        expect(service['sendMessageService'].displayMessageByType).toHaveBeenCalledWith('Affichages de débogage désactivés', MessageType.System);
    });

    it('using command !passer while it is not your turn should display an error', () => {
        service['skipTurnService'].isTurn = false;
        service['command'] = 'passer';
        service.sendPlayerMessage('!passer');
        expect(service['sendMessageService'].displayMessageByType).toHaveBeenCalledWith("ERREUR : Ce n'est pas ton tour", MessageType.Error);
    });

    it('using command !échanger while it is not your turn should display an error', () => {
        service['skipTurnService'].isTurn = false;
        service['command'] = 'echanger';
        service.sendPlayerMessage('!échanger');
        expect(service['sendMessageService'].displayMessageByType).toHaveBeenCalledWith("ERREUR : Ce n'est pas ton tour", MessageType.Error);
    });

    it('using command !placer while it is not your turn should display an error', async () => {
        service['skipTurnService'].isTurn = false;
        service['command'] = 'placer';
        await service['executePlace']();
        expect(service['sendMessageService'].displayMessageByType).toHaveBeenCalledWith("ERREUR : Ce n'est pas ton tour", MessageType.Error);
    });

    it('should display the right debug message if no possibility has been found', () => {
        service['debugService'].debugServiceMessage = [];
        service['displayDebugMessage']();
        expect(service['sendMessageService'].displayMessageByType).toHaveBeenCalledWith(
            'Aucune possibilité de placement trouvée!',
            MessageType.System,
        );
    });

    it('should display the right debug message if at least one possibility has been found', () => {
        service['debugService'].debugServiceMessage = [{ word: 'test', orientation: Orientation.Horizontal, line: 0, startIndex: 0, point: 3 }];
        service['displayDebugMessage']();
        expect(service['message']).toEqual('test: -- 3');
    });

    it('should not write a message if swapCommand is false in executeSwap()', () => {
        service['skipTurnService'].isTurn = true;
        const spy = spyOn(service['skipTurnService'], 'switchTurn');
        spyOn(service['swapLetterService'], 'swapCommand').and.returnValue(false);
        service['message'] = '!échanger *s';
        service['executeSwap']();
        expect(spy).not.toHaveBeenCalled();
    });

    it('should not display message if place is false when executePlace() is called', async () => {
        service['skipTurnService'].isTurn = true;
        const spy = spyOn(service['skipTurnService'], 'switchTurn');
        spyOn(service['placeLetterService'], 'placeCommand').and.returnValue(Promise.resolve(false));
        service['message'] = '!placer h8h test';
        await service['executePlace']();
        expect(spy).not.toHaveBeenCalled();
    });

    it('sending a command placer should call executePlace', () => {
        spyOn<any>(service, 'executePlace');
        service['message'] = 'placer h8h allo';
        service['command'] = 'placer';
        service.sendPlayerMessage(service['message']);
        expect(service['executePlace']).toHaveBeenCalled();
    });

    it('using command !reserve while debug is active should call sendMessageService', () => {
        service['command'] = 'reserve';
        service['debugService'].isDebugActive = true;
        service.sendPlayerMessage('!reserve');
        expect(service['sendMessageService'].displayMessageByType).toHaveBeenCalledTimes(service['letterService'].reserve.length);
    });

    it('using command !reserve while debug is inactive should display the respective message', () => {
        service['command'] = 'reserve';
        service['debugService'].isDebugActive = false;
        service.sendPlayerMessage('!reserve');
        expect(service['sendMessageService'].displayMessageByType).toHaveBeenCalledWith('Commande non réalisable', MessageType.Error);
    });

    it('should call executeHelp() when !aide is written by player', () => {
        spyOn<any>(service, 'executeHelp');
        service['message'] = 'aide';
        service['command'] = 'aide';
        service.sendPlayerMessage(service['message']);
        expect(service['executeHelp']).toHaveBeenCalled();
    });

    it('should write the right help message', () => {
        let expected = "Liste des commandes :\n\n!aide\nListe l'ensemble des commandes disponibles et explique brièvement leur utilisation. ";
        expected += "Ne prend aucun argument.\n\n!debug\nActive et désactive l'affichage d'informations relatives aux choix de jeu faits par les ";
        expected += 'joueurs virtuels. Ne prend aucun argument.\n\n!échanger\nÉchange une ou plusieurs lettres du chevalet. Entrer les lettres à ';
        expected += 'échanger sans espace entre-elles.\n\n!passer\nPasse son tour. Ne prend aucun argument.\n\n!placer\nPlace une lettre sur le ';
        expected += "plateau. Entrer les coordonnées de la case de la première lettre,suivi de l'orientation (h pour horizontal ou v pour vertical).";
        expected += " Vient ensuite le mot à placer. Une lettre en majuscule utilisera la lettre *.\n\n!réserve\nAffiche l'état courant de la ";
        expected += 'réserve. Ne prend aucun argument.';

        service['command'] = 'aide';
        service.sendPlayerMessage('!aide');
        expect(service['sendMessageService'].displayMessageByType).toHaveBeenCalledWith(expected, MessageType.System);
    });
});
