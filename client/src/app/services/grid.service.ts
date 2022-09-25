// JUSTIFICATION : We use  magic numbers to generate correct positions of the cases
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Injectable, OnDestroy } from '@angular/core';
import { BOARD_ROWS, COLOR_BLACK, DEFAULT_HEIGHT, DEFAULT_WIDTH, GRID_CASE_SIZE, RESERVE } from '@app/classes/constants';
import { Orientation } from '@app/classes/scrabble-board-pattern';
import { Vec2 } from '@common/vec2';
@Injectable({
    providedIn: 'root',
})
export class GridService implements OnDestroy {
    gridContextBoardLayer: CanvasRenderingContext2D;
    gridContextLettersLayer: CanvasRenderingContext2D;
    gridContextPlacementLayer: CanvasRenderingContext2D;
    bonusPositions: Map<string, string>;
    private canvasSize: Vec2;
    private readonly gridLength;

    constructor() {
        this.canvasSize = { x: DEFAULT_WIDTH, y: DEFAULT_HEIGHT };
        this.bonusPositions = new Map<string, string>();
        this.gridLength = BOARD_ROWS;
    }

    get width(): number {
        return this.canvasSize.x;
    }

    get height(): number {
        return this.canvasSize.y;
    }

    setGridContext(gridContext: CanvasRenderingContext2D): void {
        this.gridContextBoardLayer = gridContext;
    }

    drawGrid(): void {
        this.writeGridIndexes(this.gridContextBoardLayer, this.gridLength);
        this.drawSimpleGrid(this.gridContextBoardLayer);
        this.drawBonusBoxes(this.bonusPositions);
        this.drawCenterBox();
    }

    drawBorder(context: CanvasRenderingContext2D, positionTab: Vec2): void {
        const gridPosition = this.positionTabToPositionGrid(positionTab.x, positionTab.y);
        context.strokeStyle = 'purple';
        context.lineWidth = 5;
        context.strokeRect(gridPosition.x, gridPosition.y, GRID_CASE_SIZE, GRID_CASE_SIZE);
    }

    eraseLayer(context: CanvasRenderingContext2D): void {
        // Clear all the elements drawn on a layer
        context.clearRect(0, 0, DEFAULT_WIDTH, DEFAULT_HEIGHT);
    }

    drawLetter(context: CanvasRenderingContext2D, letter: string, positionTab: Vec2, fontSize: number): void {
        const gridPosition = this.positionTabToPositionGrid(positionTab.x, positionTab.y);
        // Grid case style
        const borderOffSet = 2;
        context.fillStyle = COLOR_BLACK;
        context.fillRect(gridPosition.x, gridPosition.y, GRID_CASE_SIZE, GRID_CASE_SIZE);
        context.fillStyle = 'tan';
        context.fillRect(
            gridPosition.x + borderOffSet,
            gridPosition.y + borderOffSet,
            GRID_CASE_SIZE - borderOffSet * 2,
            GRID_CASE_SIZE - borderOffSet * 2,
        );

        // Score of the letter placed
        let letterScore = '';
        for (const letterReserve of RESERVE) {
            if (letter.toUpperCase() === letterReserve.value) {
                letterScore = letterReserve.points.toString();
            }
        }
        // Placing the respective letter
        context.font = fontSize * 1.5 + 'px system-ui';
        context.fillStyle = COLOR_BLACK;
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(letter.toUpperCase(), gridPosition.x + GRID_CASE_SIZE / 2, gridPosition.y + GRID_CASE_SIZE / 2);
        // Placing the letter's score
        context.font = (fontSize / 2) * 1.5 + 'px system-ui';
        context.fillText(
            letterScore,
            gridPosition.x + GRID_CASE_SIZE / 2 + GRID_CASE_SIZE / 3,
            gridPosition.y + GRID_CASE_SIZE / 2 + GRID_CASE_SIZE / 3,
        );
    }

    eraseLetter(context: CanvasRenderingContext2D, positionTab: Vec2): void {
        const gridPosition = this.positionTabToPositionGrid(positionTab.x, positionTab.y);
        context.clearRect(gridPosition.x, gridPosition.y, GRID_CASE_SIZE, GRID_CASE_SIZE);
    }

    drawArrow(context: CanvasRenderingContext2D, positionTab: Vec2, orientation: Orientation): void {
        const gridPosition = this.positionTabToPositionGrid(positionTab.x, positionTab.y);
        context.beginPath();
        if (orientation === Orientation.Horizontal) {
            context.moveTo(gridPosition.x + GRID_CASE_SIZE / 2, gridPosition.y + GRID_CASE_SIZE / 4);
            context.lineTo(gridPosition.x + GRID_CASE_SIZE / 2, gridPosition.y + (3 * GRID_CASE_SIZE) / 4);
            context.lineTo(gridPosition.x + (5 * GRID_CASE_SIZE) / 6, gridPosition.y + GRID_CASE_SIZE / 2);
            context.lineTo(gridPosition.x + GRID_CASE_SIZE / 2, gridPosition.y + GRID_CASE_SIZE / 4);
            context.lineTo(gridPosition.x + GRID_CASE_SIZE / 2, gridPosition.y + (3 * GRID_CASE_SIZE) / 4);
        } else {
            context.moveTo(gridPosition.x + GRID_CASE_SIZE / 4, gridPosition.y + GRID_CASE_SIZE / 2);
            context.lineTo(gridPosition.x + (3 * GRID_CASE_SIZE) / 4, gridPosition.y + GRID_CASE_SIZE / 2);
            context.lineTo(gridPosition.x + GRID_CASE_SIZE / 2, gridPosition.y + (5 * GRID_CASE_SIZE) / 6);
            context.lineTo(gridPosition.x + GRID_CASE_SIZE / 4, gridPosition.y + GRID_CASE_SIZE / 2);
            context.lineTo(gridPosition.x + (3 * GRID_CASE_SIZE) / 4, gridPosition.y + GRID_CASE_SIZE / 2);
        }
        context.fillStyle = 'orange';
        context.lineWidth = 4;
        context.strokeStyle = COLOR_BLACK;
        context.stroke();
        context.fill();
    }

    ngOnDestroy(): void {
        this.eraseLayer(this.gridContextLettersLayer);
    }

    // Convert the positions from 15x15 array to 750x750 grid
    private positionTabToPositionGrid(positionTabX: number, positionTabY: number): Vec2 {
        return {
            x: positionTabX * GRID_CASE_SIZE + GRID_CASE_SIZE,
            y: positionTabY * GRID_CASE_SIZE + GRID_CASE_SIZE,
        };
    }

    // draw the game grid without any bonus on it
    private drawSimpleGrid(context: CanvasRenderingContext2D): void {
        const startPosition: Vec2 = { x: 0, y: 0 };
        for (let i = 1; i <= this.gridLength; i++) {
            startPosition.x = i * GRID_CASE_SIZE;
            for (let j = 1; j <= this.gridLength; j++) {
                startPosition.y = j * GRID_CASE_SIZE;
                context.fillStyle = 'lightGrey';
                context.fillRect(startPosition.x, startPosition.y, GRID_CASE_SIZE, GRID_CASE_SIZE);
                context.strokeRect(startPosition.x, startPosition.y, GRID_CASE_SIZE, GRID_CASE_SIZE);
            }
        }
    }

    private writeGridIndexes(context: CanvasRenderingContext2D, columnsNumber: number): void {
        context.font = '18px system-ui';
        context.fillStyle = COLOR_BLACK;
        // We have same number of columns and rows
        for (let i = 0; i < columnsNumber; i++) {
            const indexForColumns = i + 1;
            let indexForLines = 'A'.charCodeAt(0);
            indexForLines = indexForLines + i;
            context.fillText(indexForColumns.toString(), (5 * GRID_CASE_SIZE) / 4 + i * GRID_CASE_SIZE, (3 * GRID_CASE_SIZE) / 4);
            context.fillText(String.fromCharCode(indexForLines), GRID_CASE_SIZE / 2, (7 * GRID_CASE_SIZE) / 4 + i * GRID_CASE_SIZE);
        }
    }

    private colorBonusBox(context: CanvasRenderingContext2D, color: string, startPosition: Vec2): void {
        context.fillStyle = color;
        context.fillRect(startPosition.x, startPosition.y, GRID_CASE_SIZE, GRID_CASE_SIZE);
        context.strokeRect(startPosition.x, startPosition.y, GRID_CASE_SIZE, GRID_CASE_SIZE);
    }

    private writeBonusName(context: CanvasRenderingContext2D, text: string, startPosition: Vec2): void {
        context.font = '14px system-ui';
        context.fillStyle = COLOR_BLACK;
        context.textBaseline = 'middle';
        context.textAlign = 'center';
        const lines = text.split(' ');
        context.fillText(lines[0], startPosition.x + GRID_CASE_SIZE / 2, startPosition.y + GRID_CASE_SIZE / 2.5);
        context.fillText(lines[1], startPosition.x + GRID_CASE_SIZE / 2, startPosition.y + GRID_CASE_SIZE / 1.5);
    }

    // specify bonuses boxes on the grid by adding colors and bonuses names
    private drawBonusBoxes(bonusPositions: Map<string, string>): void {
        const COLOR_INDEX = 0;
        const TEXT_INDEX = 1;
        const tilesFormat = new Map<string, string[]>([
            ['doubleLetter', ['lightblue', 'Lettre x2']],
            ['tripleLetter', ['cadetBlue', 'Lettre x3']],
            ['doubleWord', ['pink', 'Mot x2']],
            ['tripleWord', ['red', 'Mot x3']],
        ]);

        bonusPositions.forEach((bonus: string, position: string) => {
            const positionSplitted = position.split(/([0-9]+)/);
            const convertedPositon = {
                x: (positionSplitted[0].charCodeAt(0) - 'A'.charCodeAt(0) + 1) * GRID_CASE_SIZE,
                y: Number(positionSplitted[1]) * GRID_CASE_SIZE,
            };
            const tileFormat = tilesFormat.get(bonus);
            if (tileFormat) {
                this.colorBonusBox(this.gridContextBoardLayer, tileFormat[COLOR_INDEX], convertedPositon);
                this.writeBonusName(this.gridContextBoardLayer, tileFormat[TEXT_INDEX], convertedPositon);
            }
        });
    }

    // color the center box of the grid then draw a star on it
    private drawCenterBox(): void {
        const centerPosition: Vec2 = { x: 8 * GRID_CASE_SIZE, y: 8 * GRID_CASE_SIZE };
        // coloring the box
        this.gridContextBoardLayer.fillStyle = 'pink';
        this.gridContextBoardLayer.fillRect(centerPosition.x, centerPosition.y, GRID_CASE_SIZE, GRID_CASE_SIZE);
        this.gridContextBoardLayer.strokeRect(centerPosition.x, centerPosition.y, GRID_CASE_SIZE, GRID_CASE_SIZE);
        // drawing star
        const NB_SPIKES = 5;
        this.drawStar(centerPosition.x + GRID_CASE_SIZE / 2, centerPosition.y + GRID_CASE_SIZE / 1.85, NB_SPIKES, GRID_CASE_SIZE / 3, 7);
    }

    private drawStar(cx: number, cy: number, spikes: number, outerRadius: number, innerRadius: number): void {
        let rot = (Math.PI / 2) * 3;
        let x = cx;
        let y = cy;
        const step = Math.PI / spikes;

        this.gridContextBoardLayer.beginPath();
        this.gridContextBoardLayer.moveTo(cx, cy - outerRadius);
        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            this.gridContextBoardLayer.lineTo(x, y);
            rot += step;

            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            this.gridContextBoardLayer.lineTo(x, y);
            rot += step;
        }
        this.gridContextBoardLayer.lineTo(cx, cy - outerRadius);
        this.gridContextBoardLayer.closePath();
        this.gridContextBoardLayer.lineWidth = 5;
        this.gridContextBoardLayer.strokeStyle = 'darkSlateGrey';
        this.gridContextBoardLayer.stroke();
        this.gridContextBoardLayer.fillStyle = 'darkSlateGrey';
        this.gridContextBoardLayer.fill();
    }
}
