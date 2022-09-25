/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable dot-notation */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BOARD_COLUMNS, BOARD_ROWS, RESERVE } from '@app/classes/constants';
import { Orientation } from '@app/classes/scrabble-board-pattern';
import { Player } from '@app/models/player.model';
import { Letter } from '@common/letter';
import { Vec2 } from '@common/vec2';
import { Socket } from 'socket.io-client';
import { PlacementsHandlerService } from './placements-handler.service';

describe('PlacementsHandlerService', () => {
    let service: PlacementsHandlerService;
    const scrabbleBoard: string[][] = [];
    for (let i = 0; i < BOARD_ROWS; i++) {
        scrabbleBoard[i] = [];
        for (let j = 0; j < BOARD_COLUMNS; j++) {
            scrabbleBoard[i][j] = '';
        }
    }
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterTestingModule],
        });
        service = TestBed.inject(PlacementsHandlerService);

        const letterA: Letter = RESERVE[0];
        const letterB: Letter = RESERVE[1];
        const letterC: Letter = RESERVE[2];
        const letterD: Letter = RESERVE[3];

        const firstPlayerEasel = [letterA, letterA, letterB, letterB, letterC, letterC, letterD];
        const firstPlayer = new Player(1, 'Player 1', firstPlayerEasel);
        service['playerService'].addPlayer(firstPlayer);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('receiveCurrentWords should update currentWords and priorCurrentWords', () => {
        const words = new Map<string, string[]>();
        const priorWords = new Map<string, string[]>();

        words.set('test', ['H8', 'H9', 'H10', 'H11']);
        priorWords.set('test', ['H8', 'H9', 'H10', 'H11']);

        service['clientSocketService'].socket = {
            on: (eventName: string, callback: (currentWords: string, priorCurrentWords: string) => void) => {
                if (eventName === 'receiveCurrentWords') {
                    callback(JSON.stringify(Array.from(words)), JSON.stringify(Array.from(priorWords)));
                }
            },
        } as unknown as Socket;

        service.receiveCurrentWords();

        expect(service['wordValidationService'].currentWords.has('test')).toEqual(true);
        expect(service['wordValidationService'].priorCurrentWords.has('test')).toEqual(true);
    });

    it('getExtendedWords should find the respective word when we horizontally prolong an already placed word', () => {
        const word = 'labo';
        service['wordValidationService'].priorCurrentWords.set('la', ['H8', 'H9']);
        const orientation = Orientation.Horizontal;
        for (let i = 0; i < word.length; i++) {
            scrabbleBoard[7][7 + i] = word[i];
        }
        const lastLettersPlaced = new Map<string, Vec2>();
        lastLettersPlaced.set('b', { x: 9, y: 7 });
        lastLettersPlaced.set('o', { x: 10, y: 7 });
        const extendedWords = service.getExtendedWords(orientation, scrabbleBoard, lastLettersPlaced);
        expect(extendedWords[0]).toEqual('la');
    });

    it('getExtendedWords should find the respective word when we vertically prolong an already placed word', () => {
        const word = 'plateau';
        service['wordValidationService'].priorCurrentWords.set('plat', ['H8', 'I8', 'J8', 'K8', 'H8', 'H9', 'H10', 'H11']);
        const orientation = Orientation.Vertical;
        for (let i = 0; i < word.length; i++) {
            scrabbleBoard[7 + i][7] = word[i];
        }
        const lastLettersPlaced = new Map<string, Vec2>();
        lastLettersPlaced.set('e', { x: 7, y: 11 });
        lastLettersPlaced.set('a', { x: 7, y: 12 });
        lastLettersPlaced.set('u', { x: 7, y: 13 });
        const extendedWords = service.getExtendedWords(orientation, scrabbleBoard, lastLettersPlaced);
        expect(extendedWords[0]).toEqual('plat');
    });

    it('getLastLettersPlaced should only return the letters placed on the most recent turn', () => {
        const startPosition = { x: 7, y: 4 };
        const orientation = Orientation.Vertical;
        const word = 'bateau';
        const validLetters = [false, false, false, true, true, true];
        const lastLettersPlaced = service.getLastLettersPlaced(startPosition, orientation, word, validLetters);
        expect(lastLettersPlaced.has('b')).toBeTrue();
        expect(lastLettersPlaced.get('b')).toEqual({ x: 7, y: 4 });
        expect(lastLettersPlaced.has('a')).toBeTrue();
        expect(lastLettersPlaced.get('a')).toEqual({ x: 7, y: 5 });
        expect(lastLettersPlaced.has('t')).toBeTrue();
        expect(lastLettersPlaced.get('t')).toEqual({ x: 7, y: 6 });
    });

    it('arePositionsEqual should return false when the arrays have different positions', () => {
        const extendedWord = 'pi';
        const extendedPositions = ['H8', 'H9'];
        const playedPositions = ['H8', 'I8'];
        expect(service.arePositionsEqual(extendedPositions, playedPositions, extendedWord)).toBeFalse();
    });

    it('isPositionFilled should return false if the position is out of bounds', () => {
        const position: Vec2 = { x: 16, y: -5 };
        expect(service.isPositionFilled(position, scrabbleBoard)).toBeFalse();
    });

    it('calling goToNextPosition with an invalid direction should stay at the same position', () => {
        const position: Vec2 = { x: 7, y: 7 };
        const orientation = Orientation.Horizontal;
        const direction = 999;
        service.goToNextPosition(position, orientation, direction);
        expect(position).toEqual({ x: 7, y: 7 });
    });

    it('first word placed on central case should be valid', () => {
        // central case H8
        const position: Vec2 = { x: 7, y: 7 };
        let orientation = Orientation.Horizontal;
        const word = 'office';
        expect(service.isFirstWordValid(position, orientation, word)).toBeTrue();
        orientation = Orientation.Vertical;
        expect(service.isFirstWordValid(position, orientation, word)).toBeTrue();
    });

    it('first word not placed on central case should be invalid', () => {
        const position: Vec2 = { x: 2, y: 9 };
        const orientation = Orientation.Vertical;
        const word = 'stage';
        expect(service.isFirstWordValid(position, orientation, word)).toBeFalse();
    });

    it('isLetterInEasel should return true for a letter in the easel', () => {
        const indexLetters: number[] = [];
        const indexPlayer = 0;
        const letter = 'a';
        expect(service.isLetterInEasel(letter, indexPlayer, indexLetters)).toBeTrue();
        expect(service.isLetterInEasel(letter, indexPlayer, indexLetters)).toBeTrue();
    });

    it('isLetterInEasel should return false for a letter not in the easel', () => {
        const indexLetters: number[] = [];
        const indexPlayer = 0;
        const letter = 'f';
        expect(service.isLetterInEasel(letter, indexPlayer, indexLetters)).toBeFalse();
    });

    it('isLetterInEasel should return false for an identical letter that is only present once in the easel ', () => {
        const indexLetters: number[] = [];
        const indexPlayer = 0;
        const letter = 'd';
        expect(service.isLetterInEasel(letter, indexPlayer, indexLetters)).toBeTrue();
        expect(service.isLetterInEasel(letter, indexPlayer, indexLetters)).toBeFalse();
    });
});
