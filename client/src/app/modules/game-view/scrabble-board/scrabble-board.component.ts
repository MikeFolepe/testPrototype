import { AfterViewInit, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { BoardHandlerService } from '@app/services/board-handler.service';
import { GridService } from '@app/services/grid.service';

@Component({
    selector: 'app-scrabble-board',
    templateUrl: './scrabble-board.component.html',
    styleUrls: ['./scrabble-board.component.scss'],
})
export class ScrabbleBoardComponent implements AfterViewInit {
    @ViewChild('gridCanvas', { static: false }) private boardLayer!: ElementRef<HTMLCanvasElement>;
    @ViewChild('gridCanvasLettersLayer', { static: false }) private lettersLayer!: ElementRef<HTMLCanvasElement>;
    @ViewChild('gridCanvasPlacementLayer', { static: false }) private placementLayer!: ElementRef<HTMLCanvasElement>;

    constructor(private readonly gridService: GridService, private boardHandlerService: BoardHandlerService) {}

    @HostListener('keydown', ['$event'])
    buttonDetect(event: KeyboardEvent): void {
        this.boardHandlerService.buttonDetect(event);
    }

    mouseHitDetect(event: MouseEvent): void {
        this.boardHandlerService.mouseHitDetect(event);
    }

    ngAfterViewInit(): void {
        this.gridService.gridContextBoardLayer = this.boardLayer.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.gridService.gridContextLettersLayer = this.lettersLayer.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.gridService.gridContextPlacementLayer = this.placementLayer.nativeElement.getContext('2d') as CanvasRenderingContext2D;
        this.gridService.drawGrid();
        this.gridService.setGridContext(this.gridService.gridContextBoardLayer);
    }

    get width(): number {
        return this.gridService.width;
    }
    get height(): number {
        return this.gridService.height;
    }
}
