import { Injectable } from '@angular/core';
import { EASEL_SIZE, INVALID_INDEX, PLAYER_ONE_INDEX } from '@app/classes/constants';
import { PlayerService } from '@app/services/player.service';
import { Letter } from '@common/letter';

@Injectable({
    providedIn: 'root',
})
export class ManipulateService {
    letterEaselTab: Letter[];
    usedLetters: boolean[];

    constructor(private playerService: PlayerService) {
        this.letterEaselTab = [];
        this.usedLetters = [];
        this.usedLetters.fill(false, 0, EASEL_SIZE);
    }

    onKeyPress(event: KeyboardEvent): void {
        switch (event.key) {
            case 'ArrowUp': {
                event.preventDefault();
                this.shiftUp();
                break;
            }
            case 'ArrowDown': {
                event.preventDefault();
                this.shiftDown();
                break;
            }
            default: {
                this.selectToManipulate(event);
                break;
            }
        }
    }

    onMouseWheelTick(event: WheelEvent): void {
        if (event.deltaY < 0) this.shiftUp();
        else if (event.deltaY > 0) this.shiftDown();
    }

    selectToManipulate(event: KeyboardEvent): void {
        // Pressing Shift doesn't unselect all so we can press Shift + 8 to select a '*'
        if (event.key === 'Shift') return;
        if (/([a-zA-Z]|[*])+/g.test(event.key) && event.key.length === 1) {
            const letterPressedIndex = this.indexToSelect(event.key, PLAYER_ONE_INDEX);
            if (letterPressedIndex === INVALID_INDEX) {
                this.usedLetters.fill(false, 0, this.usedLetters.length);
                this.unselectAll();
                return;
            }
            this.handleManipulationSelection(letterPressedIndex);
            return;
        }
        this.usedLetters.fill(false, 0, this.usedLetters.length);
        this.unselectAll();
    }

    selectWithClick(indexClicked: number): void {
        for (let i = 0; i < this.letterEaselTab.length; i++) {
            if (i < indexClicked) {
                this.usedLetters[i] = this.letterEaselTab[i].value === this.letterEaselTab[indexClicked].value ? true : false;
            } else if (i > indexClicked) {
                this.usedLetters[i] = false;
            }
        }
        this.usedLetters[indexClicked] = true;
        this.handleManipulationSelection(indexClicked);
    }

    sendEasel(easel: Letter[]): void {
        this.letterEaselTab = easel;
    }

    indexToSelect(letterToSelect: string, indexPlayer: number): number {
        let indexCurrentLetter = 0;
        if (
            this.usedLetters.some((letter) => {
                return letter;
            })
        ) {
            if (this.letterEaselTab[this.usedLetters.indexOf(true)].value !== letterToSelect.toUpperCase())
                this.usedLetters.fill(false, 0, this.usedLetters.length);
        }

        indexCurrentLetter = this.playerService.indexLetterInEasel(letterToSelect, 0, indexPlayer);
        // If we select the same letter 2 times, we verify that we're not using the same index in the easel
        while (this.usedLetters[indexCurrentLetter] && indexCurrentLetter !== INVALID_INDEX) {
            indexCurrentLetter = this.playerService.indexLetterInEasel(letterToSelect, indexCurrentLetter + 1, indexPlayer);
        }

        if (indexCurrentLetter === INVALID_INDEX) {
            this.usedLetters.fill(false, 0, this.usedLetters.length);
            // We find the first occurrence of the respective letter
            indexCurrentLetter = this.playerService.indexLetterInEasel(letterToSelect, 0, indexPlayer);
        }

        if (indexCurrentLetter !== INVALID_INDEX) this.usedLetters[indexCurrentLetter] = true;

        return indexCurrentLetter;
    }

    shiftUp(): void {
        const indexSelected = this.findIndexSelected();
        if (indexSelected === INVALID_INDEX) return;
        if (indexSelected === 0) {
            // Manipulate 1st index
            if (this.letterEaselTab[indexSelected].value !== this.letterEaselTab[this.letterEaselTab.length - 1].value)
                this.usedLetters[indexSelected] = false;

            this.usedLetters[this.letterEaselTab.length - 1] = true;
            this.swapPositions(indexSelected, this.letterEaselTab.length - 1);
            // Set all letters before swap used
            for (let i = 0; i < this.letterEaselTab.length - 1; i++) {
                if (this.letterEaselTab[i].value === this.letterEaselTab[this.letterEaselTab.length - 1].value) this.usedLetters[i] = true;
            }
            return;
        }
        // The letter we shift down isn't used anymore
        this.usedLetters[indexSelected] = false;
        this.usedLetters[indexSelected - 1] = true;
        this.swapPositions(indexSelected, indexSelected - 1);
    }

    shiftDown(): void {
        const indexSelected = this.findIndexSelected();
        if (indexSelected === INVALID_INDEX) return;
        if (indexSelected === this.letterEaselTab.length - 1) {
            // Manipulate last index
            this.usedLetters[0] = true;
            this.usedLetters[this.letterEaselTab.length - 1] = false;
            this.swapPositions(indexSelected, 0);
            // All letters except first one are unused
            for (let i = 1; i < this.letterEaselTab.length; i++) {
                this.usedLetters[i] = false;
            }
            return;
        }
        if (this.letterEaselTab[indexSelected].value !== this.letterEaselTab[indexSelected + 1].value) this.usedLetters[indexSelected] = false;

        // The letter we shift down is now used
        this.usedLetters[indexSelected + 1] = true;
        this.swapPositions(indexSelected, indexSelected + 1);
    }

    swapPositions(firstIndex: number, secondIndex: number): void {
        const tempLetter = this.letterEaselTab[firstIndex];
        this.letterEaselTab[firstIndex] = this.letterEaselTab[secondIndex];
        this.letterEaselTab[secondIndex] = tempLetter;
    }

    findIndexSelected(): number {
        for (let i = 0; i < this.letterEaselTab.length; i++) {
            if (this.letterEaselTab[i].isSelectedForManipulation) return i;
        }
        return INVALID_INDEX;
    }

    handleManipulationSelection(indexLetter: number): void {
        // Unselect manipulation
        if (this.letterEaselTab[indexLetter].isSelectedForManipulation) {
            this.letterEaselTab[indexLetter].isSelectedForManipulation = false;
            this.usedLetters.fill(false, 0, this.usedLetters.length);
            this.enableScrolling();
        } // Select to manipulate if the letter isn't selected for swap or manipulation
        else if (!this.letterEaselTab[indexLetter].isSelectedForSwap) {
            this.unselectAll();
            this.letterEaselTab[indexLetter].isSelectedForManipulation = true;
            this.disableScrolling();
        }
    }

    unselectAll(): void {
        for (const letter of this.letterEaselTab) {
            letter.isSelectedForManipulation = false;
            letter.isSelectedForSwap = false;
        }
        this.enableScrolling();
    }

    unselectManipulation(): void {
        for (const letter of this.letterEaselTab) {
            letter.isSelectedForManipulation = false;
        }
    }

    disableScrolling(): void {
        const x = window.scrollX;
        const y = window.scrollY;
        window.onscroll = () => window.scrollTo(x, y);
    }

    enableScrolling(): void {
        window.onscroll = () => window.scrollTo(window.scrollX, window.scrollY);
    }
}
