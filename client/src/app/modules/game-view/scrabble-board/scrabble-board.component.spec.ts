/* eslint-disable dot-notation */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BoardHandlerService } from '@app/services/board-handler.service';
import { ScrabbleBoardComponent } from './scrabble-board.component';

describe('ScrabbleBoardComponent', () => {
    let component: ScrabbleBoardComponent;
    let fixture: ComponentFixture<ScrabbleBoardComponent>;
    let boardHandlerServiceSpy: jasmine.SpyObj<BoardHandlerService>;

    beforeEach(() => {
        boardHandlerServiceSpy = jasmine.createSpyObj('BoardHandlerService', ['mouseHitDetect', 'buttonDetect']);
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ScrabbleBoardComponent],
            providers: [{ provide: BoardHandlerService, useValue: boardHandlerServiceSpy }],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ScrabbleBoardComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('Pressing a keyboard button should call buttonDetect from BoardHandlerService', () => {
        const event = new Event('keydown');
        fixture.elementRef.nativeElement.dispatchEvent(event);
        expect(component['boardHandlerService'].buttonDetect).toHaveBeenCalled();
    });
    it('Clicking on the scrabble board should call mouseHitDetect from BoardHandlerService', () => {
        fixture.detectChanges();
        const gridCanvasPlacementLayer = fixture.debugElement.query(By.css('#layer3'));
        gridCanvasPlacementLayer.triggerEventHandler('click', null);
        expect(component['boardHandlerService'].mouseHitDetect).toHaveBeenCalled();
    });
});
