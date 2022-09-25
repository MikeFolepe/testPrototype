import { Injectable } from '@angular/core';
import { BOARD_COLUMNS, BOARD_ROWS, GRID_CASE_SIZE, INVALID_INDEX, LAST_INDEX, PLAYER_ONE_INDEX } from '@app/classes/constants';
import { MouseButton } from '@app/classes/enum';
import { Orientation } from '@app/classes/scrabble-board-pattern';
import { Vec2 } from '@common/vec2';
import { GridService } from './grid.service';
import { PlaceLetterService } from './place-letter.service';
import { SkipTurnService } from './skip-turn.service';
import { PlacementsHandlerService } from './placements-handler.service';

@Injectable({
    providedIn: 'root',
})
export class BoardHandlerService {
    word: string;
    private currentCase: Vec2;
    private firstCase: Vec2;
    private placedLetters: boolean[];
    private isFirstCasePicked: boolean;
    private isFirstCaseLocked: boolean;
    private orientation: Orientation;

    constructor(
        private gridService: GridService,
        private placeLetterService: PlaceLetterService,
        private skipTurnService: SkipTurnService,
        private placementsService: PlacementsHandlerService,
    ) {
        this.currentCase = { x: INVALID_INDEX, y: INVALID_INDEX };
        this.firstCase = { x: INVALID_INDEX, y: INVALID_INDEX };
        this.word = '';
        this.placedLetters = [];
        this.isFirstCasePicked = false;
        this.isFirstCaseLocked = false;
        this.orientation = Orientation.Horizontal;
    }

    buttonDetect(event: KeyboardEvent): void {
        switch (event.key) {
            case 'Backspace': {
                this.removePlacedLetter();
                break;
            }
            case 'Enter': {
                if (this.word.length) {
                    if (this.skipTurnService.isTurn) {
                        this.confirmPlacement();
                        break;
                    }
                    this.cancelPlacement();
                }
                break;
            }
            case 'Escape': {
                this.cancelPlacement();
                break;
            }
            default: {
                if (!this.skipTurnService.isTurn) break;
                if (/([a-zA-Z\u00C0-\u00FF])+/g.test(event.key) && event.key.length === 1) {
                    // Removes accents from the letter to place
                    const letterNoAccents = event.key.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
                    this.placeLetter(letterNoAccents);
                }
                break;
            }
        }
    }

    mouseHitDetect(event: MouseEvent): void {
        if (event.button === MouseButton.Left) {
            if (this.isFirstCaseLocked) return;
            const caseClicked: Vec2 = this.calculateFirstCasePosition(event);
            if (!this.isCasePositionValid(caseClicked)) return;

            // If the click is on the same case, it will change the orientation
            if (this.areCasePositionsEqual(this.currentCase, caseClicked)) {
                this.switchOrientation();
                // If the click is on a different case, it will select this case as the new starting case
            } else {
                this.selectStartingCase(caseClicked);
            }
        }
    }

    async confirmPlacement(): Promise<void> {
        // Validation of the placement
        await this.placeLetterService.validateKeyboardPlacement(this.firstCase, this.orientation, this.word, PLAYER_ONE_INDEX);
        this.word = '';
        this.placedLetters = [];
        this.isFirstCasePicked = false;
        this.isFirstCaseLocked = false;
        this.gridService.eraseLayer(this.gridService.gridContextPlacementLayer);
    }

    cancelPlacement(): void {
        while (this.word.length) this.removePlacedLetter();
        this.gridService.eraseLayer(this.gridService.gridContextPlacementLayer);
        this.currentCase.x = INVALID_INDEX;
        this.currentCase.y = INVALID_INDEX;
        this.isFirstCasePicked = false;
    }

    private async placeLetter(letter: string): Promise<void> {
        if (this.isFirstCasePicked && !this.isFirstCaseLocked) {
            // Placing the 1st letter
            if (await this.placeLetterService.placeWithKeyboard(this.currentCase, letter, this.orientation, this.word.length, PLAYER_ONE_INDEX)) {
                this.placedLetters[this.word.length] = true;
                this.word += letter;
                this.isFirstCaseLocked = true;
                this.updateCaseDisplay();
            }
        } else if (this.isFirstCaseLocked) {
            // Placing following letters
            this.goToNextCase(this.orientation);
            if (await this.placeLetterService.placeWithKeyboard(this.currentCase, letter, this.orientation, this.word.length, PLAYER_ONE_INDEX)) {
                this.placedLetters[this.word.length] = true;
                this.word += letter;
                this.updateCaseDisplay();
            } else {
                this.goToPreviousCase();
            }
        }
    }

    private removePlacedLetter(): void {
        const letterToRemove = this.word[this.word.length - 1];
        // Verify that letterToRemove isn't undefined
        if (letterToRemove) {
            this.word = this.word.slice(0, LAST_INDEX);
            this.placeLetterService.removePlacedLetter(this.currentCase, letterToRemove, PLAYER_ONE_INDEX);
        }
        // If there's still at least one letter to remove
        if (this.word.length) {
            this.goToPreviousCase();
            this.updateCaseDisplay();
        }
        // All the letters placed were removed
        else {
            // We can now select a new starting case
            this.isFirstCaseLocked = false;
            this.placedLetters = [];
            this.updateCaseDisplay();
        }
    }

    private selectStartingCase(caseClicked: Vec2): void {
        this.currentCase = { x: caseClicked.x, y: caseClicked.y };
        this.firstCase = { x: caseClicked.x, y: caseClicked.y };
        this.isFirstCasePicked = true;
        this.orientation = Orientation.Horizontal;
        this.updateCaseDisplay();
    }

    private switchOrientation(): void {
        this.orientation = this.orientation === Orientation.Horizontal ? Orientation.Vertical : Orientation.Horizontal;
        this.updateCaseDisplay();
    }

    private calculateFirstCasePosition(event: MouseEvent): Vec2 {
        const currentCase: Vec2 = { x: 0, y: 0 };
        currentCase.x = Math.floor((event.offsetX - GRID_CASE_SIZE) / GRID_CASE_SIZE);
        currentCase.y = Math.floor((event.offsetY - GRID_CASE_SIZE) / GRID_CASE_SIZE);
        return currentCase;
    }

    private areCasePositionsEqual(case1: Vec2, case2: Vec2): boolean {
        return case1.x === case2.x && case1.y === case2.y;
    }

    private isCasePositionValid(caseSelected: Vec2): boolean {
        return caseSelected.x >= 0 && caseSelected.y >= 0 ? this.placeLetterService.scrabbleBoard[caseSelected.y][caseSelected.x] === '' : false;
    }

    private goToNextCase(orientation: Orientation): void {
        this.placementsService.goToNextPosition(this.currentCase, orientation);
        if (this.currentCase.x + 1 > BOARD_COLUMNS || this.currentCase.y + 1 > BOARD_COLUMNS) return;
        while (this.placeLetterService.scrabbleBoard[this.currentCase.y][this.currentCase.x] !== '') {
            this.placedLetters[this.word.length] = false;
            this.word += this.placeLetterService.scrabbleBoard[this.currentCase.y][this.currentCase.x];
            this.placementsService.goToNextPosition(this.currentCase, orientation);
            if (this.currentCase.x + 1 > BOARD_COLUMNS || this.currentCase.y + 1 > BOARD_COLUMNS) return;
        }
    }

    private goToPreviousCase(): void {
        if (this.orientation === Orientation.Horizontal) {
            this.currentCase.x--;
            while (!this.placedLetters[this.currentCase.x - this.firstCase.x]) {
                this.word = this.word.slice(0, LAST_INDEX);
                this.currentCase.x--;
            }
        } else {
            this.currentCase.y--;
            while (!this.placedLetters[this.currentCase.y - this.firstCase.y]) {
                this.word = this.word.slice(0, LAST_INDEX);
                this.currentCase.y--;
            }
        }
    }

    private updateCaseDisplay(): void {
        this.gridService.eraseLayer(this.gridService.gridContextPlacementLayer);
        this.gridService.drawBorder(this.gridService.gridContextPlacementLayer, this.currentCase);
        // Drawing the arrow on the starting case when no letters are placed
        if (!this.isFirstCaseLocked) {
            this.gridService.drawArrow(this.gridService.gridContextPlacementLayer, this.currentCase, this.orientation);
            return;
        }
        this.drawPlacementBorder();
        // Only display the arrow on the next empty tile if there is an empty tile in the direction of the orientation
        this.drawArrowOnNextEmpty();
    }

    private drawPlacementBorder(): void {
        for (let i = 0; i < this.word.length; i++) {
            if (this.orientation === Orientation.Horizontal) {
                this.gridService.drawBorder(this.gridService.gridContextPlacementLayer, { x: this.currentCase.x - i, y: this.currentCase.y });
            } else {
                this.gridService.drawBorder(this.gridService.gridContextPlacementLayer, { x: this.currentCase.x, y: this.currentCase.y - i });
            }
        }
    }

    private drawArrowOnNextEmpty(): void {
        const currentArrowIndex: Vec2 = { x: this.currentCase.x, y: this.currentCase.y };
        if (this.orientation === Orientation.Horizontal) {
            do {
                currentArrowIndex.x++;
                if (currentArrowIndex.x + 1 > BOARD_COLUMNS) return;
            } while (this.placeLetterService.scrabbleBoard[currentArrowIndex.y][currentArrowIndex.x] !== '');
        } else {
            do {
                currentArrowIndex.y++;
                if (currentArrowIndex.y + 1 > BOARD_ROWS) return;
            } while (this.placeLetterService.scrabbleBoard[currentArrowIndex.y][currentArrowIndex.x] !== '');
        }
        this.gridService.drawArrow(this.gridService.gridContextPlacementLayer, currentArrowIndex, this.orientation);
    }
}
