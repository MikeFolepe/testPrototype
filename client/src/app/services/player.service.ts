import { Injectable } from '@angular/core';
import {
    BOARD_COLUMNS,
    BOARD_ROWS,
    DEFAULT_FONT_SIZE,
    EASEL_SIZE,
    FONT_SIZE_MAX,
    FONT_SIZE_MIN,
    INVALID_INDEX,
    PLAYER_TWO_INDEX,
    RESERVE,
    WHITE_LETTER_INDEX,
} from '@app/classes/constants';
import { Player } from '@app/models/player.model';
import { GridService } from '@app/services/grid.service';
import { LetterService } from '@app/services/letter.service';
import { Letter } from '@common/letter';
import { ClientSocketService } from './client-socket.service';

@Injectable({
    providedIn: 'root',
})
export class PlayerService {
    fontSize: number;
    players: Player[];
    private scrabbleBoard: string[][];

    private updateEasel: () => void;

    constructor(private letterService: LetterService, private gridService: GridService, private clientSocketService: ClientSocketService) {
        this.fontSize = DEFAULT_FONT_SIZE;
        this.players = new Array<Player>();
        this.receiveScoreFromServer();
        this.receiveOpponentEasel();
    }

    bindUpdateEasel(fn: () => void) {
        this.updateEasel = fn;
    }

    receiveScoreFromServer(): void {
        this.clientSocketService.socket.on('receiveScoreInfo', (score: number, indexPlayer: number) => {
            this.players[indexPlayer].score = score;
        });
    }

    receiveOpponentEasel(): void {
        this.clientSocketService.socket.on('receiveOpponentEasel', (letterTable: Letter[]) => {
            this.players[PLAYER_TWO_INDEX].letterTable = letterTable;
        });
    }

    addPlayer(user: Player): void {
        this.players.push(user);
    }

    clearPlayers(): void {
        this.players = [];
    }

    getEasel(indexPlayer: number): Letter[] {
        return this.players[indexPlayer].letterTable;
    }

    updateScrabbleBoard(scrabbleBoard: string[][]): void {
        this.scrabbleBoard = scrabbleBoard;
    }

    updateFontSize(fontSize: number): void {
        if (fontSize < FONT_SIZE_MIN) {
            fontSize = FONT_SIZE_MIN;
        } else if (fontSize > FONT_SIZE_MAX) {
            fontSize = FONT_SIZE_MAX;
        }
        this.fontSize = fontSize;
        this.updateGridFontSize();
    }

    // Update the font size of the letters placed on the grid
    updateGridFontSize(): void {
        for (let i = 0; i < BOARD_ROWS; i++) {
            for (let j = 0; j < BOARD_COLUMNS; j++) {
                if (this.scrabbleBoard[i][j] !== '') {
                    this.gridService.eraseLetter(this.gridService.gridContextLettersLayer, { x: j, y: i });
                    this.gridService.drawLetter(this.gridService.gridContextLettersLayer, this.scrabbleBoard[i][j], { x: j, y: i }, this.fontSize);
                }
            }
        }
    }

    swap(indexToSwap: number, indexPlayer: number): void {
        const letterFromReserve = this.letterService.getRandomLetter();
        // Add a copy of the random letter from the reserve
        const letterToAdd = {
            value: letterFromReserve.value,
            quantity: letterFromReserve.quantity,
            points: letterFromReserve.points,
            isSelectedForSwap: letterFromReserve.isSelectedForSwap,
            isSelectedForManipulation: letterFromReserve.isSelectedForManipulation,
        };
        this.players[indexPlayer].letterTable.splice(indexToSwap, 1, letterToAdd);
        this.updateEasel();
    }

    // Remove one letter from easel
    removeLetter(indexToRemove: number, indexPlayer: number): void {
        this.players[indexPlayer].letterTable.splice(indexToRemove, 1);
        this.updateEasel();
    }

    addLetterToEasel(letterToAdd: string, indexPlayer: number): void {
        // If it is a white letter
        if (letterToAdd === letterToAdd.toUpperCase()) {
            this.players[indexPlayer].letterTable.push({
                value: RESERVE[WHITE_LETTER_INDEX].value,
                quantity: RESERVE[WHITE_LETTER_INDEX].quantity,
                points: RESERVE[WHITE_LETTER_INDEX].points,
                isSelectedForSwap: RESERVE[WHITE_LETTER_INDEX].isSelectedForSwap,
                isSelectedForManipulation: RESERVE[WHITE_LETTER_INDEX].isSelectedForManipulation,
            });
            return;
        }

        for (const letter of RESERVE) {
            if (letterToAdd.toUpperCase() === letter.value) {
                this.players[indexPlayer].letterTable.push({
                    value: letter.value,
                    quantity: letter.quantity,
                    points: letter.points,
                    isSelectedForSwap: letter.isSelectedForSwap,
                    isSelectedForManipulation: letter.isSelectedForManipulation,
                });
            }
        }
    }

    addEaselLetterToReserve(indexInEasel: number, indexPlayer: number): void {
        this.letterService.addLetterToReserve(this.getEasel(indexPlayer)[indexInEasel].value);
    }

    refillEasel(indexPlayer: number): void {
        let letterToAdd: Letter;
        for (let i = this.players[indexPlayer].letterTable.length; i < EASEL_SIZE; i++) {
            letterToAdd = this.letterService.getRandomLetter();
            if (letterToAdd.value === '') break;

            // Add a copy of the letter found
            this.players[indexPlayer].letterTable[i] = {
                value: letterToAdd.value,
                quantity: letterToAdd.quantity,
                points: letterToAdd.points,
                isSelectedForSwap: letterToAdd.isSelectedForSwap,
                isSelectedForManipulation: letterToAdd.isSelectedForManipulation,
            };
        }
    }

    // Return the index of the letter found in the easel
    indexLetterInEasel(letter: string, startIndex: number, indexPlayer: number): number {
        for (let i = startIndex; i < this.players[indexPlayer].letterTable.length; i++) {
            if (letter === this.players[indexPlayer].letterTable[i].value.toLowerCase()) {
                return i;
            } else if (letter === letter.toUpperCase()) {
                // White letter
                if (this.players[indexPlayer].letterTable[i].value === '*') return i;
            }
        }
        return INVALID_INDEX;
    }

    addScore(score: number, indexPlayer: number): void {
        this.players[indexPlayer].score += score;
        this.clientSocketService.socket.emit('updateScoreInfo', this.players[indexPlayer].score, 1, this.clientSocketService.roomId);
    }

    isEaselEmpty(indexPlayer: number): boolean {
        return this.players[indexPlayer].letterTable.length === 0;
    }
}
