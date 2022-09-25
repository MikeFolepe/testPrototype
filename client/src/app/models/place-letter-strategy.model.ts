import { BEGINNER_POINTING_RANGE, BOARD_COLUMNS, BOARD_ROWS, CENTRAL_CASE_POSITION, INVALID_INDEX, PLAYER_AI_INDEX } from '@app/classes/constants';
import { CustomRange } from '@app/classes/range';
import { BoardPattern, Orientation, PatternInfo, PossibleWords } from '@app/classes/scrabble-board-pattern';
import { PlayerAIService } from '@app/services/player-ai.service';
import { AiType } from '@common/ai-name';
import { PlayerAI } from './player-ai.model';

export class PlaceLetterStrategy {
    dictionary: string[];
    pointingRange: CustomRange;
    private board: string[][][];
    private isFirstRoundAi: boolean;
    constructor() {
        this.dictionary = [];
        this.pointingRange = BEGINNER_POINTING_RANGE;
        this.board = [];
        this.isFirstRoundAi = true;
    }

    async execute(playerAiService: PlayerAIService): Promise<void> {
        const playerAi = playerAiService.playerService.players[PLAYER_AI_INDEX] as PlayerAI;
        const level = playerAiService.gameSettingsService.gameSettings.level;
        const isFirstRound = playerAiService.placeLetterService.isFirstRound;
        const scrabbleBoard = playerAiService.placeLetterService.scrabbleBoard;
        if (this.isFirstRoundAi) {
            this.dictionary = await playerAiService.communicationService
                .getGameDictionary(playerAiService.gameSettingsService.gameSettings.dictionary)
                .toPromise();
            this.isFirstRoundAi = false;
        }
        let allPossibleWords: PossibleWords[];
        let matchingPointingRangeWords: PossibleWords[] = [];

        this.initializeArray(scrabbleBoard);

        // Step1: Scan the board and retrieve all patterns
        const patterns = this.generateAllPatterns(playerAi.getEasel(), isFirstRound);
        // Step2: Generate all words in the dictionary satisfying the patterns
        allPossibleWords = this.generateAllWords(this.dictionary, patterns);
        // Step3: Clip words containing more letter than playable
        allPossibleWords = this.removeIfNotEnoughLetter(allPossibleWords, playerAi);

        if (isFirstRound) {
            allPossibleWords.forEach((word) => (word.startIndex = CENTRAL_CASE_POSITION.x));
        } else {
            // Step4: Clip words that can not be on the board
            allPossibleWords = this.removeIfNotDisposable(allPossibleWords);
        }

        // Step5: Add the earning points to all words and update the
        allPossibleWords = await playerAiService.calculatePoints(allPossibleWords);
        // Step6: Sort the words
        playerAiService.sortDecreasingPoints(allPossibleWords);
        matchingPointingRangeWords = playerAiService.filterByRange(allPossibleWords, this.pointingRange);
        // Step7: Place one word between all the words that have passed the steps
        if (level === AiType.expert) await this.computeResults(allPossibleWords, playerAiService);
        if (level === AiType.beginner) await this.computeResults(matchingPointingRangeWords, playerAiService, false);

        // Step8: Alert the debug about the alternatives
        playerAiService.debugService.receiveAIDebugPossibilities(allPossibleWords);
    }

    private async computeResults(possibilities: PossibleWords[], playerAiService: PlayerAIService, isExpertLevel = true): Promise<void> {
        if (possibilities.length === 0) {
            playerAiService.swap(isExpertLevel);
            return;
        }

        let wordIndex = 0;
        if (isExpertLevel) {
            await playerAiService.place(possibilities[wordIndex]);
            possibilities.splice(0, 1);
            return;
        }

        wordIndex = playerAiService.generateRandomNumber(possibilities.length);
        await playerAiService.place(possibilities[wordIndex]);
        possibilities.splice(wordIndex, 1);
    }

    private initializeArray(scrabbleBoard: string[][]): void {
        const array: string[][][] = new Array(Object.keys(Orientation).length / 2);
        array[Orientation.Horizontal] = new Array(BOARD_COLUMNS);
        array[Orientation.Vertical] = new Array(BOARD_ROWS);
        // Initialize the tridimensional array representing the scrabble board
        // array[horizontal or Vertical][row number][letter] <=> array[2 dimensions][15 rows/dimensions][15 tile/row]
        for (let i = 0; i < BOARD_ROWS; i++) {
            array[Orientation.Horizontal][i] = scrabbleBoard[i];
            const column: string[] = [];
            for (let j = 0; j < BOARD_COLUMNS; j++) column.push(scrabbleBoard[j][i]);

            array[Orientation.Vertical][i] = column;
        }

        this.board = array;
    }

    private removeIfNotDisposable(allPossibleWords: PossibleWords[]): PossibleWords[] {
        const filteredWords: PossibleWords[] = [];
        const regex1 = new RegExp('(?<=[A-Za-z])(,?)(?=[A-Za-z])', 'g');
        const regex2 = new RegExp('[,]', 'g');
        const regex3 = new RegExp('[a-z]{1,}', 'g');
        for (const word of allPossibleWords) {
            // Fill the blank tiles with space
            let line = this.board[word.orientation][word.line]
                .map((element: string) => {
                    return element === '' ? ' ' : element;
                })
                .toString();
            line = line.replace(regex2, '');
            const radixes = this.board[word.orientation][word.line].toString().toLowerCase().replace(regex1, '').match(regex3) as string[];
            if (this.isWordMovableOnBoard(line, word, radixes)) filteredWords.push(word);
        }

        return filteredWords;
    }

    private isWordMovableOnBoard(line: string, wordToPlace: PossibleWords, radixes: string[]): boolean {
        const isEmptyCase = new Array<boolean>(wordToPlace.word.length);
        isEmptyCase.fill(true);

        let pattern = '';

        for (const root of radixes) {
            const startIndex = wordToPlace.word.search(root);
            const endIdx = startIndex + root.length;
            for (let i = startIndex; i < endIdx; i++) {
                isEmptyCase[i] = false;
            }
        }

        for (let i = 0; i < isEmptyCase.length; i++) {
            // Construct the word skeleton by replacing empty tiles in the row by spaces
            // and the filled tiles by the letter value actually in the row
            pattern += isEmptyCase[i] ? ' ' : wordToPlace.word[i];
        }

        // Search this skeleton in the row
        const start = line.search(pattern);
        const end = start + wordToPlace.word.length - 1;

        if (start === INVALID_INDEX) return false;

        // If found set the starting positing for later placing
        wordToPlace.startIndex = start;
        // If found the word must not touch the adjacent words
        return this.isWordOverWriting(line, start, end, wordToPlace.word.length) ? false : true;
    }

    private isWordOverWriting(line: string, startIndex: number, endIdx: number, wordLength: number): boolean {
        if (wordLength !== BOARD_ROWS) {
            const touchOtherWordByRight = startIndex === 0 && line[endIdx + 1] !== ' ';
            const touchOtherWordByLeft = endIdx === BOARD_ROWS && line[startIndex - 1] !== ' ';
            const touchOtherWordByRightOrLeft = startIndex !== 0 && endIdx !== BOARD_ROWS && line[startIndex - 1] !== ' ' && line[endIdx + 1] !== ' ';

            // The beginning and the end of the word must not touch another
            if (touchOtherWordByRight || touchOtherWordByLeft || touchOtherWordByRightOrLeft) return true;
        }
        return false;
    }

    private removeIfNotEnoughLetter(allPossibleWords: PossibleWords[], player: PlayerAI): PossibleWords[] {
        const filteredWords: PossibleWords[] = [];

        for (const wordObject of allPossibleWords) {
            let isWordValid = true;
            for (const letter of wordObject.word) {
                const regex1 = new RegExp(letter, 'g');
                const regex2 = new RegExp('[,]{1,}', 'g');
                const amountOfLetterNeeded: number = (wordObject.word.match(regex1) as string[]).length;
                const amountOfLetterPresent: number = (
                    this.board[wordObject.orientation][wordObject.line].toString().replace(regex2, '').match(regex1) || []
                ).length;
                const playerAmount: number = player.getLetterQuantityInEasel(letter);

                if (amountOfLetterNeeded > playerAmount + amountOfLetterPresent) {
                    // Not add the words that need more letter than available
                    isWordValid = false;
                    break;
                }
            }

            if (isWordValid) filteredWords.push(wordObject);
        }

        return filteredWords;
    }

    private generateAllWords(dictionaryToLookAt: string[], patterns: BoardPattern): PossibleWords[] {
        // Generate all words satisfying the patterns found
        const allWords: PossibleWords[] = [];
        for (const pattern of patterns.horizontal) {
            const regex = new RegExp(pattern.pattern, 'g');
            for (const word of dictionaryToLookAt) {
                if (regex.test(word) && this.checkIfWordIsPresent(pattern.pattern, word))
                    allWords.push({ word, orientation: Orientation.Horizontal, line: pattern.line, startIndex: 0, point: 0 });
            }
        }

        for (const pattern of patterns.vertical) {
            const regex = new RegExp(pattern.pattern, 'g');
            for (const word of dictionaryToLookAt) {
                if (regex.test(word) && this.checkIfWordIsPresent(pattern.pattern, word))
                    allWords.push({ word, orientation: Orientation.Vertical, line: pattern.line, startIndex: 0, point: 0 });
            }
        }
        return allWords;
    }

    private checkIfWordIsPresent(pattern: string, word: string): boolean {
        const regex = new RegExp('(?<=[*])(([a-z]*)?)', 'g');
        const wordPresent = pattern.match(regex);

        for (let i = 0; wordPresent !== null && i < wordPresent.length; i++) {
            if (wordPresent[i] === word) return false;
        }

        return true;
    }

    private generateAllPatterns(playerHand: string, isFirstRound: boolean): BoardPattern {
        let horizontal: PatternInfo[] = [];
        let vertical: PatternInfo[] = [];

        if (isFirstRound) {
            // At first round the only pattern is the letter in the player's easel
            horizontal.push({ line: CENTRAL_CASE_POSITION.x, pattern: '^' + playerHand.toLowerCase() + '*$' });
            vertical.push({ line: CENTRAL_CASE_POSITION.y, pattern: '^' + playerHand.toLowerCase() + '*$' });
            return { horizontal, vertical };
        }

        horizontal = this.generatePattern(Orientation.Horizontal, playerHand);
        vertical = this.generatePattern(Orientation.Vertical, playerHand);

        return { horizontal, vertical };
    }

    private generatePattern(orientation: Orientation, playerHand: string): PatternInfo[] {
        const patternArray: PatternInfo[] = [];

        const regex1 = new RegExp('(?<=[A-Za-z])(,?)(?=[A-Za-z])', 'g');
        const regex2 = new RegExp('[,]{1,}', 'g');

        for (let line = 0; line < BOARD_COLUMNS; line++) {
            let pattern = this.board[orientation][line]
                .toString()
                .replace(regex1, '')
                .replace(regex2, playerHand + '*')
                .toLowerCase();
            // If it's not an empty row
            if (pattern !== playerHand.toLowerCase() + '*') {
                pattern = '^' + pattern + '$';
                patternArray.push({ line, pattern });
            }
        }
        return patternArray;
    }
}
