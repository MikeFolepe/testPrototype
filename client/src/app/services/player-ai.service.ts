import { Injectable } from '@angular/core';
import { DELAY_TO_PASS_TURN, EASEL_SIZE, INVALID_INDEX, MIN_RESERVE_SIZE_TO_SWAP, PLAYER_AI_INDEX } from '@app/classes/constants';
import { MessageType } from '@app/classes/enum';
import { CustomRange } from '@app/classes/range';
import { Orientation, PossibleWords } from '@app/classes/scrabble-board-pattern';
import { PlayerAI } from '@app/models/player-ai.model';
import { Vec2 } from '@common/vec2';
import { ChatboxService } from './chatbox.service';
import { CommunicationService } from './communication.service';
import { DebugService } from './debug.service';
import { EndGameService } from './end-game.service';
import { GameSettingsService } from './game-settings.service';
import { LetterService } from './letter.service';
import { PlaceLetterService } from './place-letter.service';
import { PlayerService } from './player.service';
import { RandomBonusesService } from './random-bonuses.service';
import { SendMessageService } from './send-message.service';
import { SkipTurnService } from './skip-turn.service';
import { WordValidationService } from './word-validation.service';

@Injectable({
    providedIn: 'root',
})
export class PlayerAIService {
    constructor(
        // All services needed for AI Player functionalities
        public placeLetterService: PlaceLetterService,
        public wordValidation: WordValidationService,
        public skipTurnService: SkipTurnService,
        public playerService: PlayerService,
        public letterService: LetterService,
        public endGameService: EndGameService,
        public chatBoxService: ChatboxService,
        public debugService: DebugService,
        public sendMessageService: SendMessageService,
        public randomBonusService: RandomBonusesService,
        public wordValidationService: WordValidationService,
        public gameSettingsService: GameSettingsService,
        public communicationService: CommunicationService,
    ) {}

    skip(shouldDisplayMessage: boolean = true): void {
        setTimeout(() => {
            if (shouldDisplayMessage) {
                this.sendMessageService.displayMessageByType(
                    this.playerService.players[PLAYER_AI_INDEX].name + ' : ' + '!passer ',
                    MessageType.Opponent,
                );
                this.endGameService.actionsLog.push('passer');
            }
            this.skipTurnService.switchTurn();
        }, DELAY_TO_PASS_TURN);
    }

    generateRandomNumber(maxValue: number): number {
        // Number [0, maxValue[
        return Math.floor(Number(Math.random()) * maxValue);
    }

    swap(isExpertLevel: boolean): boolean {
        const playerAi = this.playerService.players[PLAYER_AI_INDEX] as PlayerAI;
        const lettersToSwap: string[] = [];

        // No swap possible
        if (this.letterService.reserveSize === 0) {
            this.skip(true);
            return false;
        }
        // According to game mode some cases might not be possible according to rules
        if (!isExpertLevel && this.letterService.reserveSize < MIN_RESERVE_SIZE_TO_SWAP) {
            this.skip(true);
            return false;
        }

        // Set the number of letter to be changed
        let numberOfLetterToChange: number;
        do {
            numberOfLetterToChange = this.generateRandomNumber(Math.min(playerAi.letterTable.length + 1, this.letterService.reserveSize + 1));
        } while (numberOfLetterToChange === 0);

        if (isExpertLevel) numberOfLetterToChange = Math.min(playerAi.letterTable.length, this.letterService.reserveSize);

        // Choose the index of letters to be changed
        const indexOfLetterToBeChanged: number[] = [];
        while (indexOfLetterToBeChanged.length < numberOfLetterToChange) {
            const candidate = this.generateRandomNumber(playerAi.letterTable.length);
            if (indexOfLetterToBeChanged.indexOf(candidate) === INVALID_INDEX) indexOfLetterToBeChanged.push(candidate);
        }

        for (const index of indexOfLetterToBeChanged) {
            lettersToSwap.push(playerAi.letterTable[index].value.toLowerCase());
        }

        // For each letter chosen to be changed : 1. add it to reserve ; 2.get new letter
        for (const index of indexOfLetterToBeChanged) {
            this.letterService.addLetterToReserve(playerAi.letterTable[index].value);
            playerAi.letterTable[index] = this.letterService.getRandomLetter();
        }

        // Alert the context about the operation performed
        this.sendMessageService.displayMessageByType(
            this.playerService.players[PLAYER_AI_INDEX].name + ' : ' + '!échanger ' + lettersToSwap,
            MessageType.Opponent,
        );

        // Switch turn
        this.endGameService.actionsLog.push('echanger');
        this.skip(false);
        return true;
    }

    async place(word: PossibleWords): Promise<void> {
        const startPos = word.orientation ? { x: word.line, y: word.startIndex } : { x: word.startIndex, y: word.line };
        if (await this.placeLetterService.placeCommand(startPos, word.orientation, word.word)) return;
        this.skip(false);
    }

    placeWordOnBoard(scrabbleBoard: string[][], word: string, start: Vec2, orientation: Orientation): string[][] {
        for (let j = 0; orientation === Orientation.Horizontal && j < word.length; j++) {
            scrabbleBoard[start.x][start.y + j] = word[j];
        }

        for (let i = 0; orientation === Orientation.Vertical && i < word.length; i++) {
            scrabbleBoard[start.x + i][start.y] = word[i];
        }

        return scrabbleBoard;
    }

    sortDecreasing = (word1: PossibleWords, word2: PossibleWords) => {
        const equalSortNumbers = 0;
        const greaterSortNumber = 1;
        const lowerSortNumber = -1;

        if (word1.point === word2.point) return equalSortNumbers;
        return word1.point < word2.point ? greaterSortNumber : lowerSortNumber;
    };

    async calculatePoints(allPossibleWords: PossibleWords[]): Promise<PossibleWords[]> {
        for (const word of allPossibleWords) {
            const start: Vec2 = word.orientation ? { x: word.startIndex, y: word.line } : { x: word.line, y: word.startIndex };
            const orientation: Orientation = word.orientation;
            const currentBoard = JSON.parse(JSON.stringify(this.placeLetterService.scrabbleBoard));
            const updatedBoard = this.placeWordOnBoard(currentBoard, word.word, start, orientation);
            const scoreValidation = await this.wordValidation.validateAllWordsOnBoard(
                updatedBoard,
                word.word.length === EASEL_SIZE + 1,
                word.orientation === Orientation.Horizontal,
                false,
            );
            word.point = scoreValidation.validation ? scoreValidation.score : 0;
        }
        allPossibleWords = allPossibleWords.filter((word) => word.point > 0);
        return allPossibleWords;
    }

    sortDecreasingPoints(allPossibleWords: PossibleWords[]): void {
        allPossibleWords.sort(this.sortDecreasing);
    }

    filterByRange(allPossibleWords: PossibleWords[], pointingRange: CustomRange): PossibleWords[] {
        return allPossibleWords.filter((word) => word.point >= pointingRange.min && word.point <= pointingRange.max);
    }
}
