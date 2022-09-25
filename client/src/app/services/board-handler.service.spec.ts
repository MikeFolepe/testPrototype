/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { GRID_CASE_SIZE, INVALID_INDEX } from '@app/classes/constants';
import { Orientation } from '@app/classes/scrabble-board-pattern';
import { Vec2 } from '@common/vec2';
import { BoardHandlerService } from './board-handler.service';
import { GridService } from './grid.service';

describe('BoardHandlerService', () => {
    let service: BoardHandlerService;
    let gridServiceSpy: jasmine.SpyObj<GridService>;

    beforeEach(() => {
        gridServiceSpy = jasmine.createSpyObj('GridServiceSpy', ['eraseLayer', 'drawBorder', 'drawArrow', 'eraseLetter']);
        TestBed.configureTestingModule({
            providers: [{ provide: GridService, useValue: gridServiceSpy }],
            imports: [HttpClientTestingModule, RouterTestingModule],
        });
        service = TestBed.inject(BoardHandlerService);

        service['placeLetterService'].placeWithKeyboard = jasmine.createSpy().and.returnValue(Promise.resolve(true));
        service['skipTurnService'].isTurn = true;
        spyOn(service['placeLetterService'], 'removePlacedLetter');
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('left clicking a case on the board should select it as the starting case', () => {
        const gridPosition: Vec2 = { x: 7 * GRID_CASE_SIZE + GRID_CASE_SIZE, y: 7 * GRID_CASE_SIZE + GRID_CASE_SIZE };
        const mouseEvent = {
            offsetX: gridPosition.x,
            offsetY: gridPosition.y,
            button: 0,
        } as MouseEvent;
        service.mouseHitDetect(mouseEvent);
        expect(service['currentCase']).toEqual({ x: 7, y: 7 });
    });

    it('left clicking an out of bounds case should not select it', () => {
        const gridPosition: Vec2 = { x: -1 * GRID_CASE_SIZE + GRID_CASE_SIZE, y: -1 * GRID_CASE_SIZE + GRID_CASE_SIZE };
        const mouseEvent = {
            offsetX: gridPosition.x,
            offsetY: gridPosition.y,
            button: 0,
        } as MouseEvent;
        service.mouseHitDetect(mouseEvent);
        expect(service['currentCase']).toEqual({ x: -1, y: -1 });
    });

    it('left clicking on the current selected case should switch the orientation of the placement', () => {
        service['currentCase'] = { x: 7, y: 7 };
        const gridPosition: Vec2 = { x: 7 * GRID_CASE_SIZE + GRID_CASE_SIZE, y: 7 * GRID_CASE_SIZE + GRID_CASE_SIZE };
        const mouseEvent = {
            offsetX: gridPosition.x,
            offsetY: gridPosition.y,
            button: 0,
        } as MouseEvent;
        service.mouseHitDetect(mouseEvent);
        expect(service['orientation']).toEqual(Orientation.Vertical);
    });

    it('pressing multiple keyboard buttons that are valid letters should all be placed', async () => {
        service['currentCase'] = { x: 7, y: 7 };
        service['isFirstCasePicked'] = true;
        const wordToPlace = 'Frite';
        for (const letterToPlace of wordToPlace) {
            await service['placeLetter'](letterToPlace);
        }

        expect(service.word).toEqual('Frite');
    });

    it('pressing a keyboard button that is a letter not present in the easel should not be placed', async () => {
        service['firstCase'] = { x: 7, y: 7 };
        service['currentCase'] = { x: 7, y: 7 };
        service['isFirstCasePicked'] = true;
        const keyboardEvent = new KeyboardEvent('keydown', { key: 'a' });
        service.buttonDetect(keyboardEvent);

        service['placeLetterService'].placeWithKeyboard = jasmine.createSpy().and.returnValue(Promise.resolve(false));
        await service['placeLetter']('z');
        expect(service.word).toEqual('a');
    });

    it('pressing Backspace should remove the last letter placed', () => {
        const spy = spyOn<any>(service, 'removePlacedLetter').and.callThrough();
        service['firstCase'] = { x: 7, y: 7 };
        service['currentCase'] = { x: 12, y: 7 };
        service['isFirstCasePicked'] = true;
        service['isFirstCaseLocked'] = true;
        service.word = 'Frites';
        service['placedLetters'] = [true, true, true, true, true, true];

        const keyboardEvent = new KeyboardEvent('keydown', { key: 'Backspace' });
        service.buttonDetect(keyboardEvent);

        expect(service.word).toEqual('Frite');
        expect(spy).toHaveBeenCalledTimes(1);
    });

    it('removing all letters placed with Backspace should allow the user to pick a new starting case', () => {
        const keyboardEvent = new KeyboardEvent('keydown', { key: 'Backspace' });
        service['firstCase'] = { x: 7, y: 7 };
        service['currentCase'] = { x: 11, y: 7 };
        service['isFirstCasePicked'] = true;
        service['isFirstCaseLocked'] = true;
        service.word = 'Frite';
        service['placedLetters'] = [true, true, true, true, true];
        while (service.word.length) {
            service.buttonDetect(keyboardEvent);
        }

        expect(service.word).toEqual('');
        expect(service['isFirstCaseLocked']).toBeFalse();
    });

    it('pressing escape should cancel all the placements and the case selection made', () => {
        service['firstCase'] = { x: 7, y: 7 };
        service['currentCase'] = { x: 11, y: 7 };
        service['isFirstCasePicked'] = true;
        service['isFirstCaseLocked'] = true;
        service.word = 'Frite';
        service['placedLetters'] = [true, true, true, true, true];

        const keyboardEvent = new KeyboardEvent('keydown', { key: 'Escape' });
        service.buttonDetect(keyboardEvent);

        expect(service.word).toEqual('');
        expect(service['currentCase']).toEqual({ x: INVALID_INDEX, y: INVALID_INDEX });
        expect(service['isFirstCaseLocked']).toBeFalse();
        expect(service['isFirstCasePicked']).toBeFalse();
    });

    it('pressing Enter with a valid word placed should reset to initial values multiple variables ', async () => {
        service['placeLetterService'].validateKeyboardPlacement = jasmine.createSpy().and.returnValue(Promise.resolve(true));
        service['currentCase'] = { x: 7, y: 7 };
        service['firstCase'] = { x: 7, y: 7 };
        service['isFirstCasePicked'] = true;
        let keyboardEvent;

        const wordToPlace = 'Frite';
        for (const letterToPlace of wordToPlace) {
            keyboardEvent = new KeyboardEvent('keydown', { key: letterToPlace });
            service.buttonDetect(keyboardEvent);
        }
        await service.confirmPlacement();
        expect(service.word).toEqual('');
        expect(service['isFirstCaseLocked']).toBeFalse();
        expect(service['isFirstCasePicked']).toBeFalse();
    });

    it('pressing Enter with an invalid word placed should cancel the placement', async () => {
        service['placeLetterService'].validateKeyboardPlacement = jasmine.createSpy().and.returnValue(Promise.resolve(false));
        service['currentCase'] = { x: 7, y: 7 };
        service['isFirstCasePicked'] = true;
        let keyboardEvent;

        const wordToPlace = 'Frite';
        for (const letterToPlace of wordToPlace) {
            keyboardEvent = new KeyboardEvent('keydown', { key: letterToPlace });
            service.buttonDetect(keyboardEvent);
        }
        await service.confirmPlacement();
        expect(service.word).toEqual('');
    });

    it('forming a valid word out of already placed letters should be valid', async () => {
        service['placeLetterService'].validateKeyboardPlacement = jasmine.createSpy().and.returnValue(Promise.resolve(true));

        service['placeLetterService'].scrabbleBoard[7][7] = 'l';
        service['placeLetterService'].scrabbleBoard[7][8] = 'i';
        service['placeLetterService'].scrabbleBoard[7][9] = 't';

        service['firstCase'] = { x: 6, y: 7 };
        service['currentCase'] = { x: 6, y: 7 };
        service['isFirstCasePicked'] = true;

        const wordToPlace = 'ee';
        for (const letterToPlace of wordToPlace) {
            await service['placeLetter'](letterToPlace);
        }
        await service.confirmPlacement();
        expect(service.word).toEqual('');
        expect(service['isFirstCaseLocked']).toBeFalse();
        expect(service['isFirstCasePicked']).toBeFalse();
    });

    it('placing horizontally out of bounds letters following already placed letters should not be placed', async () => {
        service['placeLetterService'].validateKeyboardPlacement = jasmine.createSpy().and.returnValue(Promise.resolve(true));

        service['placeLetterService'].scrabbleBoard[7][11] = 'l';
        service['placeLetterService'].scrabbleBoard[7][12] = 'i';
        service['placeLetterService'].scrabbleBoard[7][13] = 't';
        service['placeLetterService'].scrabbleBoard[7][14] = 'e';

        service['firstCase'] = { x: 10, y: 7 };
        service['currentCase'] = { x: 10, y: 7 };
        service['isFirstCasePicked'] = true;
        const wordToPlace = 'ees';

        await service['placeLetter'](wordToPlace[0]);
        service['placeLetterService'].placeWithKeyboard = jasmine.createSpy().and.returnValue(Promise.resolve(false));
        await service['placeLetter'](wordToPlace[1]);
        await service['placeLetter'](wordToPlace[2]);

        await service.confirmPlacement();
        expect(service.word).toEqual('');
        expect(service['isFirstCaseLocked']).toBeFalse();
        expect(service['isFirstCasePicked']).toBeFalse();
    });

    it('placing vertically out of bounds letters following already placed letters should not be placed', async () => {
        service['placeLetterService'].validateKeyboardPlacement = jasmine.createSpy().and.returnValue(Promise.resolve(true));

        service['placeLetterService'].scrabbleBoard[11][7] = 'l';
        service['placeLetterService'].scrabbleBoard[12][7] = 'i';
        service['placeLetterService'].scrabbleBoard[13][7] = 't';
        service['placeLetterService'].scrabbleBoard[14][7] = 'e';

        service['firstCase'] = { x: 7, y: 10 };
        service['currentCase'] = { x: 7, y: 10 };
        service['isFirstCasePicked'] = true;
        service['orientation'] = Orientation.Vertical;
        const wordToPlace = 'ees';

        await service['placeLetter'](wordToPlace[0]);
        service['placeLetterService'].placeWithKeyboard = jasmine.createSpy().and.returnValue(Promise.resolve(false));
        await service['placeLetter'](wordToPlace[1]);
        await service['placeLetter'](wordToPlace[2]);

        await service.confirmPlacement();
        expect(service.word).toEqual('');
        expect(service['isFirstCaseLocked']).toBeFalse();
        expect(service['isFirstCasePicked']).toBeFalse();
    });

    it('pressing the button enter with a word placed should call confirmPlacement', () => {
        spyOn(service, 'confirmPlacement');
        service.word = 'girafe';
        const keyboardEvent = new KeyboardEvent('keydown', { key: 'Enter' });
        service.buttonDetect(keyboardEvent);
        expect(service.confirmPlacement).toHaveBeenCalled();
    });

    it('pressing Enter while it is not your turn should call cancelPlacement', () => {
        spyOn(service, 'cancelPlacement');
        service.word = 'abc';
        service['skipTurnService'].isTurn = false;

        const keyboardEvent = new KeyboardEvent('keydown', { key: 'Enter' });
        service.buttonDetect(keyboardEvent);
        expect(service.cancelPlacement).toHaveBeenCalled();
    });
});
