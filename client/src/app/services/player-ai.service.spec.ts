/* eslint-disable max-lines */
/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-magic-numbers */

import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BOARD_COLUMNS, BOARD_ROWS, DELAY_TO_PASS_TURN, ONE_SECOND_DELAY, RESERVE } from '@app/classes/constants';
import { MessageType } from '@app/classes/enum';
import { Orientation, PossibleWords } from '@app/classes/scrabble-board-pattern';
import { PlayerAI } from '@app/models/player-ai.model';
import { Player } from '@app/models/player.model';
import { PlayerAIService } from '@app/services/player-ai.service';

describe('PlayerAIService', () => {
    let service: PlayerAIService;
    const scrabbleBoard: string[][] = [];
    let spyOnDisplayMessage: jasmine.Spy<(message: string, messageType: MessageType) => void>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterTestingModule],
        }).compileComponents();
        service = TestBed.inject(PlayerAIService);
    });

    beforeEach(() => {
        for (let i = 0; i < BOARD_COLUMNS; i++) {
            scrabbleBoard[i] = [];
            for (let j = 0; j < BOARD_ROWS; j++) {
                scrabbleBoard[i][j] = '';
            }
        }
        const letterA = RESERVE[0];
        const letterB = RESERVE[1];
        const letterC = RESERVE[2];
        const letterD = RESERVE[3];

        const player = new Player(1, 'Player 1', [letterA, letterB, letterC, letterD, letterD, letterB, letterA]);
        const playerAi = new Player(2, 'Player 2', [letterA, letterB, letterC, letterD, letterA, letterB, letterC]);
        service.playerService.addPlayer(player);
        service.playerService.addPlayer(playerAi);

        spyOnDisplayMessage = spyOn(service.sendMessageService, 'displayMessageByType');
        jasmine.clock().install();
    });

    afterEach(() => {
        jasmine.clock().uninstall();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('skip should call switchTurn and display message', () => {
        const spyOnSwitchTurn = spyOn(service.skipTurnService, 'switchTurn');
        service.skip();
        jasmine.clock().tick(DELAY_TO_PASS_TURN);
        expect(spyOnSwitchTurn).toHaveBeenCalled();
        expect(spyOnDisplayMessage).toHaveBeenCalled();
    });

    it('skip should call switchTurn', () => {
        const spyOnSwitchTurn = spyOn(service.skipTurnService, 'switchTurn');
        service.skip(false);
        jasmine.clock().tick(DELAY_TO_PASS_TURN + 500);
        expect(spyOnSwitchTurn).toHaveBeenCalled();
        expect(spyOnDisplayMessage).toHaveBeenCalledTimes(0);
    });

    it('placeWordOnBoard should place word on board horizontally', () => {
        const word = { word: 'MAJID', orientation: Orientation.Horizontal, line: 5, startIndex: 0, point: 0 };
        const expected = JSON.parse(JSON.stringify(scrabbleBoard));
        expected[5][0] = 'M';
        expected[5][1] = 'A';
        expected[5][2] = 'J';
        expected[5][3] = 'I';
        expected[5][4] = 'D';

        expect(service.placeWordOnBoard(scrabbleBoard, word.word, { x: word.line, y: word.startIndex }, word.orientation)).toEqual(expected);
    });

    it('placeWordOnBoard should place word on board vertically', () => {
        const word = { word: 'MAJID', orientation: Orientation.Vertical, line: 5, startIndex: 0, point: 0 };
        const expected = JSON.parse(JSON.stringify(scrabbleBoard));
        expected[5][0] = 'M';
        expected[6][0] = 'A';
        expected[7][0] = 'J';
        expected[8][0] = 'I';
        expected[9][0] = 'D';

        expect(service.placeWordOnBoard(scrabbleBoard, word.word, { x: word.line, y: word.startIndex }, word.orientation)).toEqual(expected);
    });

    it('sortDecreasingPoint should sort words by points rewards', () => {
        const word8: PossibleWords = { word: 'mare', orientation: Orientation.Vertical, line: 0, startIndex: 0, point: 2 };
        const word1: PossibleWords = { word: 'amar', orientation: Orientation.Horizontal, line: 0, startIndex: 0, point: 15 };
        const word2: PossibleWords = { word: 'maree', orientation: Orientation.Horizontal, line: 0, startIndex: 0, point: 15 };
        const word3: PossibleWords = { word: 'martin', orientation: Orientation.Horizontal, line: 0, startIndex: 0, point: 3 };
        const word4: PossibleWords = { word: 'mare', orientation: Orientation.Horizontal, line: 0, startIndex: 0, point: 4 };

        const word5: PossibleWords = { word: 'amar', orientation: Orientation.Vertical, line: 0, startIndex: 0, point: 8 };
        const word6: PossibleWords = { word: 'maree', orientation: Orientation.Vertical, line: 0, startIndex: 0, point: 8 };
        const word7: PossibleWords = { word: 'martin', orientation: Orientation.Vertical, line: 0, startIndex: 0, point: 3 };

        const possibleWord: PossibleWords[] = [];
        possibleWord.push(word1);
        possibleWord.push(word2);
        possibleWord.push(word3);
        possibleWord.push(word4);
        possibleWord.push(word5);
        possibleWord.push(word6);
        possibleWord.push(word7);
        possibleWord.push(word8);

        const expected: PossibleWords[] = [];
        expected.push(word1);
        expected.push(word2);
        expected.push(word5);
        expected.push(word6);
        expected.push(word4);
        expected.push(word3);
        expected.push(word7);
        expected.push(word8);

        service.sortDecreasingPoints(possibleWord);

        expect(possibleWord).toEqual(expected);
    });

    it('filterByRange should remove words not matching the pointing range', () => {
        const word6: PossibleWords = { word: 'maree', orientation: Orientation.Vertical, line: 0, startIndex: 0, point: 8 };
        const word7: PossibleWords = { word: 'martin', orientation: Orientation.Vertical, line: 0, startIndex: 0, point: 9 };
        const word8: PossibleWords = { word: 'mare', orientation: Orientation.Vertical, line: 0, startIndex: 0, point: 10 };
        const word1: PossibleWords = { word: 'amar', orientation: Orientation.Horizontal, line: 0, startIndex: 0, point: 3 };
        const word3: PossibleWords = { word: 'martin', orientation: Orientation.Horizontal, line: 0, startIndex: 0, point: 5 };
        const word4: PossibleWords = { word: 'mare', orientation: Orientation.Horizontal, line: 0, startIndex: 0, point: 6 };
        const word2: PossibleWords = { word: 'maree', orientation: Orientation.Horizontal, line: 0, startIndex: 0, point: 4 };

        const word5: PossibleWords = { word: 'amar', orientation: Orientation.Vertical, line: 0, startIndex: 0, point: 6 };

        const possibleWord: PossibleWords[] = [];
        possibleWord.push(word1);
        possibleWord.push(word2);
        possibleWord.push(word3);
        possibleWord.push(word4);
        possibleWord.push(word5);
        possibleWord.push(word6);
        possibleWord.push(word7);
        possibleWord.push(word8);

        const expected: PossibleWords[] = [];
        expected.push(word1);
        expected.push(word2);
        expected.push(word3);

        expect(service.filterByRange(possibleWord, { min: 1, max: 5 })).toEqual(expected);
    });

    it('generateRandomNumber should generate random numbers with between [0, max value[', () => {
        const max = 5;
        expect(service.generateRandomNumber(max)).toBeLessThan(max);
    });

    it('place should ask placeLetterService to place some word on the board', async () => {
        const word = { word: 'MAJID', orientation: Orientation.Vertical, line: 5, startIndex: 0, point: 0 };
        const spyOnPlace = spyOn<any>(service.placeLetterService, 'placeCommand').and.returnValue(Promise.resolve(true));
        await service.place(word);
        jasmine.clock().tick(ONE_SECOND_DELAY);
        expect(spyOnPlace).toHaveBeenCalledOnceWith({ x: word.line, y: word.startIndex }, word.orientation, word.word);
    });

    it('place should ask placeLetterService to place some word on the board', async () => {
        const word = { word: 'MAJID', orientation: Orientation.Horizontal, line: 5, startIndex: 0, point: 0 };
        const spyOnPlace = spyOn<any>(service.placeLetterService, 'placeCommand').and.returnValue(Promise.resolve(true));
        await service.place(word);
        jasmine.clock().tick(ONE_SECOND_DELAY);
        expect(spyOnPlace).toHaveBeenCalledOnceWith({ x: word.startIndex, y: word.line }, word.orientation, word.word);
    });

    it('should swap if placement fails (placement should never fails from the AI placement)', async () => {
        const word1 = { word: 'MAJID', orientation: Orientation.Horizontal, line: 5, startIndex: 0, point: 0 };
        const word2 = { word: 'MAJID', orientation: Orientation.Vertical, line: 10, startIndex: 0, point: 0 };
        const spyOnPlace = spyOn<any>(service.placeLetterService, 'placeCommand').and.returnValue(Promise.resolve(false));
        const spyOnSwap = spyOn<any>(service, 'skip');
        await service.place(word1);
        await service.place(word2);
        expect(spyOnPlace).toHaveBeenCalledWith({ x: word1.startIndex, y: word1.line }, word1.orientation, word1.word);
        expect(spyOnSwap).toHaveBeenCalledTimes(2);
    });

    it('swap should not perform a swap when reserve is empty', () => {
        const letterTable = [
            { value: 'A', quantity: 0, points: 0, isSelectedForSwap: false, isSelectedForManipulation: false },
            { value: 'B', quantity: 0, points: 0, isSelectedForSwap: false, isSelectedForManipulation: false },
            { value: 'C', quantity: 0, points: 0, isSelectedForSwap: false, isSelectedForManipulation: false },
            { value: 'E', quantity: 0, points: 0, isSelectedForSwap: false, isSelectedForManipulation: false },
            { value: 'E', quantity: 0, points: 0, isSelectedForSwap: false, isSelectedForManipulation: false },
            { value: 'E', quantity: 0, points: 0, isSelectedForSwap: false, isSelectedForManipulation: false },
            { value: 'G', quantity: 0, points: 0, isSelectedForSwap: false, isSelectedForManipulation: false },
        ];
        const playerAi = new PlayerAI(0, 'name', letterTable, service);
        service.playerService.players[1] = playerAi;
        service.letterService.reserveSize = 0;
        // No matter
        const isExpertLevel = false;

        service.swap(isExpertLevel);

        expect(service.swap(isExpertLevel)).toBeFalsy();
    });

    it('swap should perform a swap when easy && reserveSize>=7', () => {
        const letterTable = [
            { value: 'A', quantity: 0, points: 0, isSelectedForSwap: false, isSelectedForManipulation: false },
            { value: 'B', quantity: 0, points: 0, isSelectedForSwap: false, isSelectedForManipulation: false },
            { value: 'C', quantity: 0, points: 0, isSelectedForSwap: false, isSelectedForManipulation: false },
            { value: 'E', quantity: 0, points: 0, isSelectedForSwap: false, isSelectedForManipulation: false },
            { value: 'E', quantity: 0, points: 0, isSelectedForSwap: false, isSelectedForManipulation: false },
            { value: 'E', quantity: 0, points: 0, isSelectedForSwap: false, isSelectedForManipulation: false },
            { value: 'G', quantity: 0, points: 0, isSelectedForSwap: false, isSelectedForManipulation: false },
        ];

        const copy = JSON.parse(JSON.stringify(letterTable));
        const playerAi = new PlayerAI(0, 'name', letterTable, service);
        service.playerService.players[1] = playerAi;
        service.letterService.reserveSize = 7;
        const reserveLengthBeforeSwap = service.letterService.reserveSize;
        const isExpertLevel = false;

        expect(service.swap(isExpertLevel)).toBeTrue();
        expect(spyOnDisplayMessage).toHaveBeenCalled();
        expect(service.playerService.players[1].letterTable === copy).toEqual(false);
        expect(service.letterService.reserveSize === reserveLengthBeforeSwap).toEqual(true);
    });

    it('swap should perform a swap when easy && reserveSize < 7', () => {
        const letterTable = [
            { value: 'A', quantity: 0, points: 0, isSelectedForSwap: false, isSelectedForManipulation: false },
            { value: 'B', quantity: 0, points: 0, isSelectedForSwap: false, isSelectedForManipulation: false },
            { value: 'C', quantity: 0, points: 0, isSelectedForSwap: false, isSelectedForManipulation: false },
            { value: 'E', quantity: 0, points: 0, isSelectedForSwap: false, isSelectedForManipulation: false },
            { value: 'E', quantity: 0, points: 0, isSelectedForSwap: false, isSelectedForManipulation: false },
            { value: 'E', quantity: 0, points: 0, isSelectedForSwap: false, isSelectedForManipulation: false },
            { value: 'G', quantity: 0, points: 0, isSelectedForSwap: false, isSelectedForManipulation: false },
        ];

        const copy = JSON.parse(JSON.stringify(letterTable));
        const playerAi = new PlayerAI(0, 'name', letterTable, service);
        service.playerService.players[1] = playerAi;
        service.letterService.reserveSize = 4;
        const reserveLengthBeforeSwap = service.letterService.reserveSize;
        const isExpertLevel = false;

        expect(service.swap(isExpertLevel)).toBeFalse();
        expect(spyOnDisplayMessage).not.toHaveBeenCalled();
        expect(service.playerService.players[1].letterTable).toEqual(copy);
        expect(service.letterService.reserveSize === reserveLengthBeforeSwap).toEqual(true);
    });

    it('swap should perform a swap when difficult && reserveSize>=7', () => {
        const letterTable = [
            { value: 'A', quantity: 0, points: 0, isSelectedForSwap: false, isSelectedForManipulation: false },
            { value: 'B', quantity: 0, points: 0, isSelectedForSwap: false, isSelectedForManipulation: false },
            { value: 'C', quantity: 0, points: 0, isSelectedForSwap: false, isSelectedForManipulation: false },
            { value: 'E', quantity: 0, points: 0, isSelectedForSwap: false, isSelectedForManipulation: false },
            { value: 'E', quantity: 0, points: 0, isSelectedForSwap: false, isSelectedForManipulation: false },
            { value: 'E', quantity: 0, points: 0, isSelectedForSwap: false, isSelectedForManipulation: false },
            { value: 'G', quantity: 0, points: 0, isSelectedForSwap: false, isSelectedForManipulation: false },
        ];

        const copy = JSON.parse(JSON.stringify(letterTable));
        const playerAi = new PlayerAI(0, 'name', letterTable, service);
        service.playerService.players[1] = playerAi;
        service.letterService.reserveSize = 4;
        const reserveLengthBeforeSwap = service.letterService.reserveSize;
        const isExpertLevel = true;

        expect(service.swap(isExpertLevel)).toBeTrue();
        expect(spyOnDisplayMessage).toHaveBeenCalled();
        expect(service.playerService.players[1].letterTable === copy).toEqual(false);
        expect(service.letterService.reserveSize === reserveLengthBeforeSwap).toEqual(true);
    });

    it('swap should perform a swap when difficult && reserveSize < 7', () => {
        const letterTable = [
            { value: 'A', quantity: 0, points: 0, isSelectedForSwap: false, isSelectedForManipulation: false },
            { value: 'B', quantity: 0, points: 0, isSelectedForSwap: false, isSelectedForManipulation: false },
            { value: 'C', quantity: 0, points: 0, isSelectedForSwap: false, isSelectedForManipulation: false },
            { value: 'E', quantity: 0, points: 0, isSelectedForSwap: false, isSelectedForManipulation: false },
            { value: 'E', quantity: 0, points: 0, isSelectedForSwap: false, isSelectedForManipulation: false },
            { value: 'E', quantity: 0, points: 0, isSelectedForSwap: false, isSelectedForManipulation: false },
            { value: 'G', quantity: 0, points: 0, isSelectedForSwap: false, isSelectedForManipulation: false },
        ];

        const copy = JSON.parse(JSON.stringify(letterTable));
        const playerAi = new PlayerAI(0, 'name', letterTable, service);
        service.playerService.players[1] = playerAi;
        service.letterService.reserveSize = 1;
        const reserveLengthBeforeSwap = service.letterService.reserveSize;
        const isExpertLevel = true;

        expect(service.swap(isExpertLevel)).toBeTrue();
        expect(spyOnDisplayMessage).toHaveBeenCalled();
        expect(service.playerService.players[1].letterTable === copy).toEqual(false);
        expect(service.letterService.reserveSize === reserveLengthBeforeSwap).toEqual(true);
    });

    it('swap should perform a swap even if letterTable.length<7', () => {
        const letterTable = [
            { value: 'A', quantity: 0, points: 0, isSelectedForSwap: false, isSelectedForManipulation: false },
            { value: 'B', quantity: 0, points: 0, isSelectedForSwap: false, isSelectedForManipulation: false },
            { value: 'C', quantity: 0, points: 0, isSelectedForSwap: false, isSelectedForManipulation: false },
            { value: 'E', quantity: 0, points: 0, isSelectedForSwap: false, isSelectedForManipulation: false },
            { value: 'E', quantity: 0, points: 0, isSelectedForSwap: false, isSelectedForManipulation: false },
        ];

        const copy = JSON.parse(JSON.stringify(letterTable));
        const playerAi = new PlayerAI(0, 'name', letterTable, service);
        service.playerService.players[1] = playerAi;
        service.letterService.reserveSize = 4;
        const reserveLengthBeforeSwap = service.letterService.reserveSize;
        const isExpertLevel = true;

        expect(service.swap(isExpertLevel)).toBeTrue();
        expect(spyOnDisplayMessage).toHaveBeenCalled();
        expect(service.playerService.players[1].letterTable === copy).toEqual(false);
        expect(service.letterService.reserveSize === reserveLengthBeforeSwap).toEqual(true);
    });

    it('calculatePoint should compute points of valid words', async () => {
        const word1: PossibleWords = { word: 'amar', orientation: Orientation.Horizontal, line: 0, startIndex: 0, point: 0 };
        const word2: PossibleWords = { word: 'maree', orientation: Orientation.Horizontal, line: 0, startIndex: 0, point: 0 };
        const word3: PossibleWords = { word: 'martin', orientation: Orientation.Horizontal, line: 0, startIndex: 0, point: 0 };
        const word4: PossibleWords = { word: 'mare', orientation: Orientation.Horizontal, line: 0, startIndex: 0, point: 0 };

        const word5: PossibleWords = { word: 'amar', orientation: Orientation.Vertical, line: 0, startIndex: 0, point: 0 };
        const word6: PossibleWords = { word: 'maree', orientation: Orientation.Vertical, line: 0, startIndex: 0, point: 0 };
        const word7: PossibleWords = { word: 'martin', orientation: Orientation.Vertical, line: 0, startIndex: 0, point: 0 };
        const word8: PossibleWords = { word: 'mare', orientation: Orientation.Vertical, line: 0, startIndex: 0, point: 0 };

        const possibleWord: PossibleWords[] = [word1, word2, word3, word4, word5, word6, word7, word8];

        const expected: PossibleWords[] = [];
        expected.push(word1);
        expected.push(word2);
        expected.push(word5);

        spyOn<any>(service.wordValidation, 'validateAllWordsOnBoard').and.returnValues(
            { validation: true, score: 1 },
            { validation: true, score: 2 },
            { validation: false, score: 0 },
            { validation: false, score: 0 },
            { validation: true, score: 3 },
            { validation: false, score: 0 },
            { validation: false, score: 0 },
            { validation: false, score: 0 },
        );

        const returned = await service.calculatePoints(possibleWord);

        expect(returned).toEqual(expected);
    });
});
