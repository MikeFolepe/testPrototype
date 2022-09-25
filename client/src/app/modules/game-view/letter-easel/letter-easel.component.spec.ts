/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { RouterTestingModule } from '@angular/router/testing';
import { PLAYER_ONE_INDEX } from '@app/classes/constants';
import { Player } from '@app/models/player.model';
import { Letter } from '@common/letter';
import { LetterEaselComponent } from './letter-easel.component';

describe('LetterEaselComponent', () => {
    let component: LetterEaselComponent;
    let fixture: ComponentFixture<LetterEaselComponent>;
    let getLettersSpy: jasmine.Spy<(indexPlayer: number) => Letter[]>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [LetterEaselComponent],
            imports: [HttpClientTestingModule, RouterTestingModule],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LetterEaselComponent);
        component = fixture.componentInstance;
        getLettersSpy = spyOn(component['playerService'], 'getEasel').and.returnValue(component.letterEaselTab);
        spyOn(component['playerService'], 'bindUpdateEasel');
        fixture.detectChanges();

        const letterA: Letter = { value: 'A', quantity: 0, points: 0, isSelectedForSwap: false, isSelectedForManipulation: false };
        const letterB: Letter = { value: 'B', quantity: 0, points: 0, isSelectedForSwap: false, isSelectedForManipulation: false };
        const letterC: Letter = { value: 'C', quantity: 0, points: 0, isSelectedForSwap: false, isSelectedForManipulation: false };
        const letterD: Letter = { value: 'D', quantity: 0, points: 0, isSelectedForSwap: false, isSelectedForManipulation: false };
        const letterE: Letter = { value: 'E', quantity: 0, points: 0, isSelectedForSwap: false, isSelectedForManipulation: false };
        const letterH: Letter = { value: 'H', quantity: 0, points: 0, isSelectedForSwap: false, isSelectedForManipulation: false };
        const letterWhite: Letter = { value: '*', quantity: 0, points: 0, isSelectedForSwap: false, isSelectedForManipulation: false };

        component.letterEaselTab = [letterA, letterE, letterB, letterC, letterD, letterH, letterWhite];
        const firstPlayer = new Player(1, 'Player 1', component.letterEaselTab);
        component['playerService'].addPlayer(firstPlayer);
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('each initialization should update by calling by calling getLettersEasel of player service', () => {
        const updateSpy = spyOn<any>(component, 'update');
        component.ngOnInit();
        expect(updateSpy).toHaveBeenCalled();
        expect(getLettersSpy).toHaveBeenCalled();
    });

    it('left clicking on a letter in the easel should call onLeftClick()', () => {
        spyOn(component, 'onLeftClick');
        fixture.detectChanges();
        const letterContainer = fixture.debugElement.query(By.css('.letter-container'));
        letterContainer.triggerEventHandler('click', null);
        expect(component.onLeftClick).toHaveBeenCalled();
    });

    it('right clicking on a letter in the easel should call onRightClick()', () => {
        spyOn(component, 'onRightClick');
        fixture.detectChanges();
        const letterContainer = fixture.debugElement.query(By.css('.letter-container'));
        letterContainer.triggerEventHandler('contextmenu', null);
        expect(component.onRightClick).toHaveBeenCalled();
    });

    it('left clicking the 1st letter that is unselected should select it for manipulation', () => {
        spyOn(component['manipulateService'], 'selectWithClick');
        component.letterEaselTab[0].isSelectedForSwap = false;
        component.letterEaselTab[0].isSelectedForManipulation = false;
        const clickEvent = new MouseEvent('click');
        component.onLeftClick(clickEvent, 0);
        expect(component['manipulateService'].selectWithClick).toHaveBeenCalledWith(0);
    });

    it('right clicking the 1st letter that is unselected should select it for swapping', () => {
        component.letterEaselTab[0].isSelectedForSwap = false;
        component.letterEaselTab[0].isSelectedForManipulation = false;
        const clickEvent = new MouseEvent('contextmenu');
        component.onRightClick(clickEvent, 0);
        expect(component.letterEaselTab[0].isSelectedForSwap).toBeTrue();
    });

    it('right clicking the 1st letter that is already selected for swapping should unselect it', () => {
        component.letterEaselTab[0].isSelectedForSwap = true;
        const clickEvent = new MouseEvent('contextmenu');
        component.onRightClick(clickEvent, 0);
        expect(component.letterEaselTab[0].isSelectedForSwap).toBeFalse();
    });

    it('swapping a letter should call swap() from swapLetterService', () => {
        const swapSpy = spyOn(component['swapLetterService'], 'swap');
        spyOn(component['sendMessageService'], 'displayMessageByType');
        spyOn(component['skipTurnService'], 'switchTurn');

        component.letterEaselTab[0].isSelectedForSwap = true;
        component.swap();
        expect(swapSpy).toHaveBeenCalledOnceWith(0, PLAYER_ONE_INDEX);
    });

    it('cancelling selection should unselect all letters and disable cancel button', () => {
        for (const letters of component.letterEaselTab) {
            letters.isSelectedForSwap = true;
        }
        component.cancelSelection();
        expect(component.isCancelButtonActive()).toBeFalse();
    });

    it('cancel button should be active if at least one letter is selected', () => {
        component.letterEaselTab[0].isSelectedForSwap = true;
        expect(component.isCancelButtonActive()).toBeTrue();
    });

    it('swap button should be disabled if it is not your turn', () => {
        component['skipTurnService'].isTurn = false;
        expect(component.isSwapButtonActive()).toBeFalse();
    });

    it('swap button should be disabled if there is less than 7 letters in the reserve', () => {
        component['skipTurnService'].isTurn = true;
        component['letterService'].reserveSize = 6;
        expect(component.isSwapButtonActive()).toBeFalse();
    });

    it('swap button should be disabled if none letters are selected for swapping', () => {
        component['skipTurnService'].isTurn = true;
        component['letterService'].reserveSize = 7;
        expect(component.isSwapButtonActive()).toBeFalse();
    });

    it('swap button should be active if at least one letter is selected for swapping', () => {
        component['skipTurnService'].isTurn = true;
        component['letterService'].reserveSize = 7;
        component.letterEaselTab[0].isSelectedForSwap = true;
        expect(component.isSwapButtonActive()).toBeTrue();
    });

    it('clicking outside the easel should unselect all letters', () => {
        component.letterEaselTab[0].isSelectedForManipulation = true;
        const event = new Event('click');
        document.dispatchEvent(event);
        expect(component.letterEaselTab[0].isSelectedForManipulation).toBeFalse();
    });

    it('clicking inside the easel should call cancelPlacement from BoardHandlerService', () => {
        spyOn(component['boardHandlerService'], 'cancelPlacement');
        fixture.detectChanges();
        const easel = fixture.debugElement.query(By.css('.easel-container'));
        easel.triggerEventHandler('click', null);
        expect(component['boardHandlerService'].cancelPlacement).toHaveBeenCalled();
    });

    it('pressing key while the easel is focused should call onKeyPress from manipulateService', () => {
        spyOn(component.easel.nativeElement, 'contains').and.returnValue(true);
        spyOn(component['manipulateService'], 'onKeyPress');
        const event = new Event('keydown');
        fixture.nativeElement.dispatchEvent(event);
        expect(component['manipulateService'].onKeyPress).toHaveBeenCalled();
    });

    it('scrolling one wheel tick while one letter is selected for manipulation should call onMouseWheelTick from manipulateService', () => {
        spyOn(component['manipulateService'], 'onMouseWheelTick');
        component.letterEaselTab[0].isSelectedForManipulation = true;
        const event = new Event('wheel');
        document.dispatchEvent(event);
        expect(component['manipulateService'].onMouseWheelTick).toHaveBeenCalled();
    });

    it('should be selected to be swapped only if the letter is not already selected for swap or manipulation', () => {
        component.letterEaselTab[0].isSelectedForSwap = false;
        component.letterEaselTab[0].isSelectedForManipulation = false;
        component['handleSwapSelection'](0);
        expect(component.letterEaselTab[0].isSelectedForSwap).toBeTrue();

        component.letterEaselTab[0].isSelectedForSwap = false;
        component.letterEaselTab[0].isSelectedForManipulation = true;
        component['handleSwapSelection'](0);
        expect(component.letterEaselTab[0].isSelectedForSwap).toBeFalse();
    });

    it('should returns if easel nativeElement contains(event.target)', () => {
        const clickEvent = new MouseEvent('contextmenu');
        spyOn(component.easel.nativeElement, 'contains').and.returnValue(MouseEvent);
        const spyManipulate = spyOn(component['manipulateService'], 'enableScrolling');
        component.clickEvent(clickEvent);
        expect(spyManipulate).not.toHaveBeenCalled();
    });
    it('should not manipulate easel  if keyPress nativeElement', () => {
        spyOn(component.easel.nativeElement, 'contains').and.returnValue(false);
        spyOn(component['manipulateService'], 'onKeyPress');
        const event = new Event('keydown');
        fixture.nativeElement.dispatchEvent(event);
        expect(component['manipulateService'].onKeyPress).not.toHaveBeenCalled();
    });

    it(' Do not scrolling one wheel tick while one letter is selected for manipulation should call onMouseWheelTick from manipulateService', () => {
        spyOn(component['manipulateService'], 'onMouseWheelTick');
        component.letterEaselTab[0].isSelectedForManipulation = false;
        const event = new Event('wheel');
        document.dispatchEvent(event);
        expect(component['manipulateService'].onMouseWheelTick).not.toHaveBeenCalled();
    });
});
