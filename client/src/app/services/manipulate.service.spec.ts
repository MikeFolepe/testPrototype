/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable dot-notation */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { EASEL_SIZE, INVALID_INDEX } from '@app/classes/constants';
import { Player } from '@app/models/player.model';
import { Letter } from '@common/letter';
import { ManipulateService } from './manipulate.service';

describe('ManipulateService', () => {
    let service: ManipulateService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterTestingModule],
        });
        service = TestBed.inject(ManipulateService);

        const letterA: Letter = { value: 'A', quantity: 0, points: 0, isSelectedForSwap: false, isSelectedForManipulation: false };
        const letterB: Letter = { value: 'B', quantity: 0, points: 0, isSelectedForSwap: false, isSelectedForManipulation: false };
        const letterC: Letter = { value: 'C', quantity: 0, points: 0, isSelectedForSwap: false, isSelectedForManipulation: false };
        const letterD: Letter = { value: 'D', quantity: 0, points: 0, isSelectedForSwap: false, isSelectedForManipulation: false };
        const letterE: Letter = { value: 'E', quantity: 0, points: 0, isSelectedForSwap: false, isSelectedForManipulation: false };
        const letterWhite: Letter = { value: '*', quantity: 0, points: 0, isSelectedForSwap: false, isSelectedForManipulation: false };

        service.letterEaselTab = [letterA, letterE, letterB, letterC, letterD, letterA, letterWhite];
        const firstPlayer = new Player(1, 'Player 1', service.letterEaselTab);
        service['playerService'].addPlayer(firstPlayer);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('sending an easel should update the current one', () => {
        service.sendEasel(service['playerService'].getEasel(0));
        expect(service.letterEaselTab).toEqual(service['playerService'].getEasel(0));
    });

    it('pressing a key not present in the easel should unselect all letters', () => {
        const keyboardEvent = new KeyboardEvent('keydown', { key: 'z' });
        service.onKeyPress(keyboardEvent);
        expect(service.letterEaselTab.some((letter) => letter.isSelectedForManipulation)).toBeFalse();
    });

    it('pressing a key present in the easel should select the respective letter', () => {
        const keyboardEvent = new KeyboardEvent('keydown', { key: 'a' });
        service.onKeyPress(keyboardEvent);
        expect(service.letterEaselTab[0].isSelectedForManipulation).toBeTrue();
    });

    it('pressing an invalid key should unselect all letters', () => {
        const keyboardEvent = new KeyboardEvent('keydown', { key: 'Enter' });
        service.onKeyPress(keyboardEvent);
        expect(service.letterEaselTab.some((letter) => letter.isSelectedForManipulation)).toBeFalse();
    });

    it('selecting the same key two times that is only present once in the easel should unselect the respective letter', () => {
        const keyboardEvent = new KeyboardEvent('keydown', { key: 'e' });
        service.onKeyPress(keyboardEvent);
        service.onKeyPress(keyboardEvent);
        expect(service.letterEaselTab[1].isSelectedForManipulation).toBeFalse();
    });

    it('selecting two different keys in the easel should select the latest letter pressed', () => {
        let keyboardEvent = new KeyboardEvent('keydown', { key: 'e' });
        service.onKeyPress(keyboardEvent);
        keyboardEvent = new KeyboardEvent('keydown', { key: 'a' });
        service.onKeyPress(keyboardEvent);
        expect(service.usedLetters[0]).toBeTrue();
        expect(service.usedLetters[1]).toBeFalse();
    });

    it('clicking a letter should select the respective letter', () => {
        service.selectWithClick(3);
        expect(service.usedLetters[3]).toBeTrue();
    });

    it('clicking a letter while there is already the same letter selected earlier in the easel should update usedLetters', () => {
        service.usedLetters[0] = true;
        service.selectWithClick(5);
        expect(service.usedLetters[0]).toBeTrue();
        expect(service.usedLetters[5]).toBeTrue();
    });

    it('scrolling up by one wheel tick should call shiftUp', () => {
        spyOn(service, 'shiftUp');
        const event = new WheelEvent('wheel', { deltaY: -1 });
        service.onMouseWheelTick(event);
        expect(service.shiftUp).toHaveBeenCalled();
    });

    it('scrolling down by one wheel tick should call shiftDown', () => {
        spyOn(service, 'shiftDown');
        const event = new WheelEvent('wheel', { deltaY: 1 });
        service.onMouseWheelTick(event);
        expect(service.shiftDown).toHaveBeenCalled();
    });

    it('not scrolling should not call shiftUp or shiftDown', () => {
        spyOn(service, 'shiftUp');
        spyOn(service, 'shiftDown');
        const event = new WheelEvent('wheel', { deltaY: 0 });
        service.onMouseWheelTick(event);
        expect(service.shiftDown).toHaveBeenCalledTimes(0);
        expect(service.shiftUp).toHaveBeenCalledTimes(0);
    });

    it('pressing the left arrow key should shift up the letter selected', () => {
        const keyboardEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
        service.letterEaselTab[3].isSelectedForManipulation = true;
        service.usedLetters[3] = true;
        service.onKeyPress(keyboardEvent);
        expect(service.usedLetters[3]).toBeFalse();
        expect(service.usedLetters[3 - 1]).toBeTrue();
    });

    it('pressing the right arrow key should shift down the letter selected', () => {
        const keyboardEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
        service.letterEaselTab[3].isSelectedForManipulation = true;
        service.usedLetters[3] = true;
        service.onKeyPress(keyboardEvent);
        expect(service.usedLetters[3]).toBeFalse();
        expect(service.usedLetters[3 + 1]).toBeTrue();
    });

    it('pressing the left arrow key while the 1st letter is selected should shift up the letter to the last index', () => {
        const keyboardEvent = new KeyboardEvent('keydown', { key: 'ArrowUp' });
        service.letterEaselTab[0].isSelectedForManipulation = true;
        service.usedLetters[0] = true;
        service.onKeyPress(keyboardEvent);
        expect(service.usedLetters[0]).toBeFalse();
        expect(service.usedLetters[EASEL_SIZE - 1]).toBeTrue();
    });

    it('pressing the right arrow key while the last letter is selected should shift down the letter to the first index', () => {
        const keyboardEvent = new KeyboardEvent('keydown', { key: 'ArrowDown' });
        service.letterEaselTab[EASEL_SIZE - 1].isSelectedForManipulation = true;
        service.usedLetters[EASEL_SIZE - 1] = true;
        service.onKeyPress(keyboardEvent);
        expect(service.usedLetters[EASEL_SIZE - 1]).toBeFalse();
        expect(service.usedLetters[0]).toBeTrue();
    });

    it('calling findIndexSelected while there is no selection made should return INVALID_INDEX', () => {
        expect(service.findIndexSelected()).toEqual(INVALID_INDEX);
    });

    it('shifting up or down while no letter is selected should not call swapPositions', () => {
        spyOn(service, 'swapPositions');
        service.shiftDown();
        service.shiftUp();
        expect(service.swapPositions).toHaveBeenCalledTimes(0);
    });

    it('pressing Shift should not unselect all letters', () => {
        spyOn(service, 'unselectAll');
        const keyboardEvent = new KeyboardEvent('keydown', { key: 'Shift' });
        service.onKeyPress(keyboardEvent);
        expect(service.unselectAll).toHaveBeenCalledTimes(0);
    });

    it('unselectManipulation should unselect the letter selected for manipulation', () => {
        service.letterEaselTab[0].isSelectedForManipulation = true;
        service.unselectManipulation();
        expect(service.letterEaselTab[0].isSelectedForManipulation).toBeFalse();
    });
});
