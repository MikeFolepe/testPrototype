/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { TestBed } from '@angular/core/testing';
import { CanvasTestHelper } from '@app/classes/canvas-test-helper';
import { DEFAULT_HEIGHT, DEFAULT_WIDTH } from '@app/classes/constants';
import { Orientation } from '@app/classes/scrabble-board-pattern';
import { GridService } from '@app/services/grid.service';

describe('GridService', () => {
    let service: GridService;
    let contextStub: CanvasRenderingContext2D;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(GridService);
        contextStub = CanvasTestHelper.createCanvas(DEFAULT_WIDTH, DEFAULT_HEIGHT).getContext('2d') as CanvasRenderingContext2D;
        service.gridContextBoardLayer = contextStub;
        service.gridContextLettersLayer = contextStub;
        service.gridContextPlacementLayer = contextStub;
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return canvas default width', () => {
        expect(service.width).toEqual(DEFAULT_WIDTH);
    });

    it('should return canvas default height', () => {
        expect(service.height).toEqual(DEFAULT_HEIGHT);
    });

    it(' drawLetter should call fillText on the canvas', () => {
        const fillTextSpy = spyOn(service.gridContextLettersLayer, 'fillText').and.callThrough();
        service.drawLetter(service.gridContextLettersLayer, 'L', { x: 1, y: 5 }, 13);
        expect(fillTextSpy).toHaveBeenCalled();
    });

    it(' drawLetter should color pixels on the canvas', () => {
        let imageData = service.gridContextLettersLayer.getImageData(0, 0, service.width, service.height).data;
        const beforeSize = imageData.filter((x) => x !== 0).length;
        service.drawLetter(service.gridContextLettersLayer, 'L', { x: 1, y: 5 }, 13);
        imageData = service.gridContextLettersLayer.getImageData(0, 0, service.width, service.height).data;
        const afterSize = imageData.filter((x) => x !== 0).length;
        expect(afterSize).toBeGreaterThan(beforeSize);
    });

    it(' drawGrid should color pixels on the canvas', () => {
        let imageData = service.gridContextBoardLayer.getImageData(0, 0, service.width, service.height).data;
        const beforeSize = imageData.filter((x) => x !== 0).length;
        service.drawGrid();
        imageData = service.gridContextBoardLayer.getImageData(0, 0, service.width, service.height).data;
        const afterSize = imageData.filter((x) => x !== 0).length;
        expect(afterSize).toBeGreaterThan(beforeSize);
    });

    it('eraseLetter should call clearRect on the canvas', () => {
        const clearRectSpy = spyOn(service.gridContextLettersLayer, 'clearRect').and.callThrough();
        service.eraseLetter(service.gridContextLettersLayer, { x: 1, y: 5 });
        expect(clearRectSpy).toHaveBeenCalled();
    });

    it('eraseLayer should call clearRect on the canvas', () => {
        const clearRectSpy = spyOn(service.gridContextLettersLayer, 'clearRect').and.callThrough();
        service.eraseLayer(service.gridContextLettersLayer);
        expect(clearRectSpy).toHaveBeenCalled();
    });

    it('drawBorder should call strokeRect on the canvas', () => {
        const strokeRectSpy = spyOn(service.gridContextLettersLayer, 'strokeRect').and.callThrough();
        service.drawBorder(service.gridContextLettersLayer, { x: 1, y: 5 });
        expect(strokeRectSpy).toHaveBeenCalled();
    });

    it('drawBonusesBoxes should call colorBonusBox and writeBonusName', () => {
        const bonusPositionsStub = new Map<string, string>([
            ['A1', 'tripleWord'],
            ['A4', 'doubleLetter'],
            ['A8', 'tripleLetter'],
            ['A12', 'doubleWord'],
            ['A15', 'tripleWord'],
            ['B2', 'doubleWord'],
            ['B6', 'tripleLetter'],
            ['B10', 'doubleLetter'],
            ['B14', 'doubleWord'],
            ['C3', ''],
        ]);
        const colorBonusBoxSpy = spyOn<any>(service, 'colorBonusBox').and.callThrough();
        const writeBonusNameSpy = spyOn<any>(service, 'writeBonusName').and.callThrough();
        service['drawBonusBoxes'](bonusPositionsStub);
        expect(colorBonusBoxSpy).toHaveBeenCalled();
        expect(writeBonusNameSpy).toHaveBeenCalled();
    });

    it('should set grid context', () => {
        service.setGridContext(contextStub);
        expect(service.gridContextBoardLayer).toBe(contextStub);
    });

    it('drawArrow should call stroke and fill on the canvas', () => {
        const strokeSpy = spyOn(service.gridContextPlacementLayer, 'stroke');
        const fillSpy = spyOn(service.gridContextPlacementLayer, 'fill');
        service.drawArrow(service.gridContextPlacementLayer, { x: 7, y: 7 }, Orientation.Horizontal);
        service.drawArrow(service.gridContextPlacementLayer, { x: 7, y: 7 }, Orientation.Vertical);
        expect(strokeSpy).toHaveBeenCalledTimes(2);
        expect(fillSpy).toHaveBeenCalledTimes(2);
    });

    it('Should call NgOnDestroy and eraseLayer', () => {
        const spyErase = spyOn(service, 'eraseLayer');
        service.ngOnDestroy();
        expect(spyErase).toHaveBeenCalled();
    });
});
