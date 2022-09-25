/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { PLAYER_AI_INDEX, PLAYER_ONE_INDEX, RESERVE, THREE_SECONDS_DELAY } from '@app/classes/constants';
import { MessageType } from '@app/classes/enum';
import { Orientation } from '@app/classes/scrabble-board-pattern';
import { Player } from '@app/models/player.model';
import { GridService } from '@app/services/grid.service';
import { PlaceLetterService } from '@app/services/place-letter.service';
import { Letter } from '@common/letter';
import { Vec2 } from '@common/vec2';
import { Socket } from 'socket.io-client';
import { CommunicationService } from './communication.service';

describe('PlaceLetterService', () => {
    let service: PlaceLetterService;
    let gridServiceSpy: jasmine.SpyObj<GridService>;
    beforeEach(() => {
        gridServiceSpy = jasmine.createSpyObj('GridService', ['drawLetter', 'eraseLetter']);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [CommunicationService],
        });
        TestBed.configureTestingModule({
            providers: [{ provide: GridService, useValue: gridServiceSpy }],
            imports: [HttpClientTestingModule, RouterTestingModule],
        });
        service = TestBed.inject(PlaceLetterService);
    });

    beforeEach(() => {
        jasmine.clock().install();
        const letterA: Letter = RESERVE[0];
        const letterB: Letter = RESERVE[1];
        const letterC: Letter = RESERVE[2];
        const letterD: Letter = RESERVE[3];
        const letterH: Letter = RESERVE[7];
        const letterWhite: Letter = RESERVE[26];

        const firstPlayerEasel = [letterA, letterA, letterB, letterB, letterC, letterC, letterD];
        const firstPlayer = new Player(1, 'Player 1', firstPlayerEasel);
        service['playerService'].addPlayer(firstPlayer);
        const secondPlayerEasel = [letterA, letterA, letterB, letterC, letterC, letterH, letterWhite];
        const secondPlayer = new Player(2, 'Player 2', secondPlayerEasel);
        service['playerService'].addPlayer(secondPlayer);

        // Fake these methods to be able to call placeCommand()
        spyOn(service['playerService'], 'removeLetter');
        spyOn(service['playerService'], 'refillEasel');
        spyOn(service['wordValidationService'], 'validateAllWordsOnBoard').and.returnValue(Promise.resolve({ validation: true, score: 0 }));
        spyOn(service['sendMessageService'], 'displayMessageByType');
        spyOn(service['sendMessageService'], 'receiveMessageFromOpponent');
        spyOn(service['sendMessageService'], 'sendMessageToOpponent');
        spyOn(service['objectivesService'], 'checkObjectivesCompletion');
    });

    afterEach(() => {
        jasmine.clock().uninstall();
    });

    it('should create', () => {
        expect(service).toBeTruthy();
    });

    it('word placed outside the grid should be invalid', () => {
        const position: Vec2 = { x: 12, y: 12 };
        let orientation = Orientation.Horizontal;
        const word = 'douleur';
        expect(service.isWordFitting(position, orientation, word)).toBeFalse(); // Horizontally
        orientation = Orientation.Vertical;
        expect(service.isWordFitting(position, orientation, word)).toBeFalse(); // Vertically
    });

    it('word placed inside the grid should be valid', () => {
        const position: Vec2 = { x: 2, y: 7 };
        const orientation = Orientation.Horizontal;
        const word = 'cadeau';
        expect(service.isWordFitting(position, orientation, word)).toBeTrue();
    });

    it('word placed on the following rounds should be valid if he touches other words', async () => {
        // Place first word
        let position: Vec2 = { x: 7, y: 7 };
        let orientation = Orientation.Horizontal;
        let word = 'bac';
        await service.placeCommand(position, orientation, word, PLAYER_ONE_INDEX);
        // Try to place a word vertically while touching the previous word placed
        position = { x: 10, y: 6 };
        orientation = Orientation.Vertical;
        word = 'cba';
        let isWordTouching = service.isWordTouchingOthers(position, orientation, word);
        // Try to place words horizontally while touching the previous word placed
        position = { x: 4, y: 8 };
        orientation = Orientation.Horizontal;
        word = 'dabb';
        isWordTouching = service.isWordTouchingOthers(position, orientation, word);
        position = { x: 7, y: 6 };
        orientation = Orientation.Horizontal;
        word = 'cabd';
        isWordTouching = service.isWordTouchingOthers(position, orientation, word);

        expect(isWordTouching).toBeTrue();
    });

    it("word placed on the following rounds should be invalid if he's not touching others", async () => {
        // Place first word
        let position: Vec2 = { x: 7, y: 7 };
        let orientation = Orientation.Vertical;
        let word = 'bac';
        await service.placeCommand(position, orientation, word, PLAYER_ONE_INDEX);
        // Try to place a word vertically without touching the previous word placed
        position = { x: 11, y: 13 };
        orientation = Orientation.Vertical;
        word = 'acab';
        const isWordTouching = service.isWordTouchingOthers(position, orientation, word);
        expect(isWordTouching).toBeFalse();
    });

    it("placing letters that aren't present in the easel or the scrabble board should be invalid", async () => {
        const position: Vec2 = { x: 7, y: 7 };
        const orientation = Orientation.Horizontal;
        const word = 'fil';
        const isPlacementValid = await service.placeCommand(position, orientation, word, PLAYER_ONE_INDEX);
        expect(isPlacementValid).toEqual(false);
    });

    it('placing letters present in the easel or the scrabble board should be valid', async () => {
        // Player 1 places the first word
        let position: Vec2 = { x: 7, y: 7 };
        let orientation = Orientation.Horizontal;
        let word = 'abcd';
        await service.placeCommand(position, orientation, word, PLAYER_ONE_INDEX);
        // Player 2 tries to vertically place a word while using letters already on the scrabbleBoard
        position = { x: 10, y: 6 };
        orientation = Orientation.Vertical;
        word = 'adbcc';
        let isWordValid = service.isWordValid(position, orientation, word, PLAYER_AI_INDEX);
        // Player 2 tries to horizontally place a word while using letters already on the scrabbleBoard
        position = { x: 10, y: 7 };
        orientation = Orientation.Horizontal;
        word = 'daah';
        isWordValid = service.isWordValid(position, orientation, word, PLAYER_AI_INDEX);
        expect(isWordValid).toBeTrue();
    });

    it('placing a word containing a white letter (*) which is present in the easel should be valid', () => {
        const position: Vec2 = { x: 7, y: 7 };
        const orientation = Orientation.Horizontal;
        const word = 'bOa'; // white letter is used as 'O'
        expect(service.isWordValid(position, orientation, word, PLAYER_AI_INDEX)).toBeTrue();
    });

    it("placing letters that doesn't form a valid word should be removed from scrabbleBoard", async () => {
        service['wordValidationService'].validateAllWordsOnBoard = jasmine.createSpy().and.returnValue({ validation: false, score: 0 });
        // Player 1 places an invalid word
        const position: Vec2 = { x: 7, y: 7 };
        const orientation = Orientation.Horizontal;
        const word = 'abcd';
        service['gameSettingsService'].isSoloMode = true;
        const isPlacementValid = await service.placeCommand(position, orientation, word, PLAYER_ONE_INDEX);
        jasmine.clock().tick(THREE_SECONDS_DELAY);
        expect(isPlacementValid).toEqual(false);
    });

    it('only the invalid letters that we just placed should be removed from scrabbleBoard', async () => {
        spyOn(service['skipTurnService'], 'switchTurn');
        let isPlacementValid;
        // Player 1 places the 1st word
        let position: Vec2 = { x: 7, y: 7 };
        let orientation = Orientation.Horizontal;
        let word = 'bac';
        await service.placeCommand(position, orientation, word, PLAYER_ONE_INDEX);

        // Player 2 places an invalid word on top of the previous one
        service['wordValidationService'].validateAllWordsOnBoard = jasmine.createSpy().and.returnValue({ validation: false, score: 0 });
        // Horizontally
        position = { x: 7, y: 7 };
        orientation = Orientation.Horizontal;
        word = 'baccabd';
        service['gameSettingsService'].isSoloMode = false;
        isPlacementValid = await service.placeCommand(position, orientation, word, PLAYER_ONE_INDEX);
        jasmine.clock().tick(THREE_SECONDS_DELAY);
        expect(isPlacementValid).toEqual(false);

        jasmine.clock().tick(THREE_SECONDS_DELAY + 1);
        // Vertically
        position = { x: 7, y: 7 };
        orientation = Orientation.Vertical;
        word = 'bEcchaa';
        service['gameSettingsService'].isSoloMode = false;
        isPlacementValid = await service.placeCommand(position, orientation, word, PLAYER_ONE_INDEX);
        jasmine.clock().tick(THREE_SECONDS_DELAY);
        expect(isPlacementValid).toEqual(false);
    });

    it('placing a word on top of a different existing word should be invalid', async () => {
        spyOn(service['skipTurnService'], 'switchTurn');
        service['wordValidationService'].validateAllWordsOnBoard = jasmine.createSpy().and.returnValue({ validation: true, score: 0 });
        // Player 1 places the 1st word
        const position: Vec2 = { x: 7, y: 7 };
        const orientation = Orientation.Horizontal;
        let word = 'aabb';
        await service.placeCommand(position, orientation, word, PLAYER_ONE_INDEX);
        // Player 1 horizontally places a second word on top of the 1st word that has different letters
        word = 'ccd';
        jasmine.clock().tick(THREE_SECONDS_DELAY + 1);
        const isPlacementValid = await service.placeCommand(position, orientation, word, PLAYER_ONE_INDEX);
        expect(isPlacementValid).toEqual(false);
    });

    it('placing letters in the easel with the keyboard should be valid', async () => {
        const position: Vec2 = { x: 7, y: 7 };
        const orientation = Orientation.Horizontal;
        const word = 'abcd';
        let isPlacementValid = true;
        for (let i = 0; i < word.length; i++) {
            if ((await service.placeWithKeyboard(position, word[i], orientation, i, PLAYER_ONE_INDEX)) === false) isPlacementValid = false;
            position.x++;
        }
        expect(isPlacementValid).toBeTrue();
    });

    it('placing letters that are not in the easel with the keyboard should be invalid', async () => {
        const position: Vec2 = { x: 7, y: 7 };
        const orientation = Orientation.Horizontal;
        const word = 'zyx';
        let isPlacementValid;
        for (let i = 0; i < word.length; i++) {
            isPlacementValid = await service.placeWithKeyboard(position, word[i], orientation, i, PLAYER_ONE_INDEX);
            expect(isPlacementValid).toBeFalse();
            position.x++;
        }
    });

    it('validating multiple valid keyboard placements should return true', async () => {
        spyOn(service, 'isWordTouchingOthers').and.returnValue(true);
        let isPlacementValid;
        service['isFirstRound'] = true;
        let position: Vec2 = { x: 7, y: 7 };
        let orientation = Orientation.Horizontal;
        const word = 'abcd';
        isPlacementValid = await service.validateKeyboardPlacement(position, orientation, word, PLAYER_ONE_INDEX);
        expect(isPlacementValid).toBeTrue();

        service['isFirstRound'] = false;
        position = { x: 7, y: 8 };
        orientation = Orientation.Vertical;
        isPlacementValid = await service.validateKeyboardPlacement(position, orientation, word, PLAYER_ONE_INDEX);
        expect(isPlacementValid).toBeTrue();
    });

    it('validating multiple invalid keyboard placements should return false', async () => {
        let isPlacementValid;
        service['isFirstRound'] = true;
        let position: Vec2 = { x: 10, y: 10 };
        const orientation = Orientation.Horizontal;
        const word = 'abcd';
        isPlacementValid = await service.validateKeyboardPlacement(position, orientation, word, PLAYER_ONE_INDEX);
        jasmine.clock().tick(THREE_SECONDS_DELAY);
        expect(isPlacementValid).toBeFalse();

        service['isFirstRound'] = false;
        position = { x: 1, y: 1 };
        isPlacementValid = await service.validateKeyboardPlacement(position, orientation, word, PLAYER_ONE_INDEX);
        jasmine.clock().tick(THREE_SECONDS_DELAY);
        expect(isPlacementValid).toBeFalse();
    });

    it('validating the first invalid keyboard placement should return false', async () => {
        service['isFirstRound'] = true;
        const position: Vec2 = { x: 10, y: 10 };
        const orientation = Orientation.Horizontal;
        const word = 'abcd';
        const isPlacementValid = await service.validateKeyboardPlacement(position, orientation, word, PLAYER_ONE_INDEX);
        jasmine.clock().tick(THREE_SECONDS_DELAY);
        expect(isPlacementValid).toBeFalse();
    });

    it('placing all the letters from the easel to form a valid word should give a bonus', async () => {
        service['wordValidationService'].validateAllWordsOnBoard = jasmine.createSpy().and.returnValue({ validation: true, score: 0 });
        const position: Vec2 = { x: 7, y: 7 };
        const orientation = Orientation.Horizontal;
        const word = 'abah*cc';
        await service.placeCommand(position, orientation, word, PLAYER_AI_INDEX);
        expect(service['isEaselSize']).toBeTrue();
    });

    it('placing a word containing the same letter multiple times that is only present once in the easel should be invalid', () => {
        const position: Vec2 = { x: 7, y: 7 };
        const orientation = Orientation.Horizontal;
        const word = 'dad';
        expect(service.isWordValid(position, orientation, word, PLAYER_ONE_INDEX)).toEqual(false);
    });

    it('when the opponent place a word, the scrabbleboard of the player should be updated', () => {
        const startPosition: Vec2 = { x: 0, y: 0 };
        const orientation = Orientation.Horizontal;
        const word = 'opponent';
        const scrabbleBoard: string[][] = [['o', 'p', 'p', 'o', 'n', 'e', 'n', 't']];
        service['placeByOpponent'](scrabbleBoard, startPosition, orientation, word);
        expect(service['scrabbleBoard']).toEqual(scrabbleBoard);
    });

    it('the emit receivePlacement should call placeByOpponent', () => {
        const startPosition: Vec2 = { x: 0, y: 0 };
        const orientation = Orientation.Horizontal;
        const word = 'opponent';
        const scrabbleBoard: string[][] = [['o', 'p', 'p', 'o', 'n', 'e', 'n', 't']];
        service['clientSocketService'].socket = {
            // eslint-disable-next-line no-unused-vars
            on: (eventName: string, callback: (scrabbleBoard: string[][], startPosition: Vec2, orientation: Orientation, word: string) => void) => {
                if (eventName === 'receivePlacement') {
                    callback(scrabbleBoard, startPosition, orientation, word);
                }
            },
        } as unknown as Socket;
        spyOn<any>(service, 'placeByOpponent');
        service['receivePlacement']();
        expect(service['placeByOpponent']).toHaveBeenCalledWith(scrabbleBoard, startPosition, orientation, word);
    });

    it('displayValid on solo mode with the Ai player index should display the correct message', () => {
        service['startPosition'] = { x: 7, y: 7 };
        service['orientation'] = Orientation.Horizontal;
        service['gameSettingsService'].isSoloMode = true;
        service['word'] = 'test';
        service.displayValid(PLAYER_AI_INDEX);
        expect(service['sendMessageService'].displayMessageByType).toHaveBeenCalledWith('Player 2 : !placer h8h test', MessageType.Opponent);
    });
});
