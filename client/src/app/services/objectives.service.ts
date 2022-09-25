/* eslint-disable @typescript-eslint/no-magic-numbers */
import { Injectable, OnDestroy } from '@angular/core';
import { ONE_MINUTE } from '@app/classes/constants';
import {
    CORNER_POSITIONS,
    LETTERS_FOR_OBJ5,
    MIN_SCORE_FOR_OBJ4,
    MIN_SIZE_FOR_OBJ2,
    MIN_SIZE_FOR_OBJ7,
    NUMBER_OF_PUBLIC_OBJECTIVES,
    Objective,
    OBJECTIVES,
} from '@app/classes/objectives';
import { GameType } from '@common/game-type';
import { ObjectiveTypes } from '@common/objectives-type';
import { ClientSocketService } from './client-socket.service';
import { EndGameService } from './end-game.service';
import { GameSettingsService } from './game-settings.service';
import { PlacementsHandlerService } from './placements-handler.service';
import { PlayerService } from './player.service';
import { RandomBonusesService } from './random-bonuses.service';
import { WordValidationService } from './word-validation.service';

@Injectable({
    providedIn: 'root',
})
export class ObjectivesService implements OnDestroy {
    objectives: Objective[][];
    playerIndex: number;
    activeTimeRemaining: number[];
    extendedWords: string[];
    private obj1Counter: number[];
    private obj1ActionTracker: string[][];
    private obj1LastAttempt: number[];
    constructor(
        private wordValidationService: WordValidationService,
        private playerService: PlayerService,
        private clientSocketService: ClientSocketService,
        private gameSettingsService: GameSettingsService,
        private randomBonusesService: RandomBonusesService,
        private placementsService: PlacementsHandlerService,
        private endGameService: EndGameService,
    ) {
        this.objectives = [[], []];
        this.playerIndex = 0;
        this.activeTimeRemaining = [ONE_MINUTE, ONE_MINUTE];
        this.extendedWords = [];
        this.obj1Counter = [0, 0];
        this.obj1ActionTracker = [[], []];
        this.obj1LastAttempt = [0, 0];
        this.receiveObjectives();
    }

    initializeObjectives(): void {
        const arrayOfIndex = this.gameSettingsService.gameSettings.objectiveIds;
        for (let i = 0; i < NUMBER_OF_PUBLIC_OBJECTIVES; i++) {
            for (let j = 0; j < NUMBER_OF_PUBLIC_OBJECTIVES; j++) {
                const objective = OBJECTIVES[arrayOfIndex[i][j]];
                this.objectives[i].push(objective);
            }
        }
    }

    receiveObjectives(): void {
        this.clientSocketService.socket.on('receiveObjectiveCompleted', (id: number) => {
            const objective = this.findObjectiveById(id) as Objective;
            objective.isCompleted = true;
        });
    }

    updateOpponentObjectives(id: number): void {
        if (!this.gameSettingsService.isSoloMode) this.clientSocketService.socket.emit('objectiveAccomplished', id, this.clientSocketService.roomId);
    }

    checkObjectivesCompletion(): void {
        // do not check for objectives completion if game is on classic mode
        if (this.gameSettingsService.gameType === GameType.Classic) return;
        if (!this.objectives[ObjectiveTypes.Private][this.playerIndex].isCompleted) {
            this.objectives[ObjectiveTypes.Private][this.playerIndex].validate(this);
        }

        for (const objective of this.objectives[ObjectiveTypes.Public]) {
            if (!objective.isCompleted) objective.validate(this);
        }
    }

    validateObjectiveOne(id: number): void {
        const numberOfOccurrencesToValidate = 3;
        const minLengthToValidate = 4;
        let actionLog: string[] = [];
        const actionLogSize = this.endGameService.actionsLog.length - 1;
        let currentWordLength = 0;

        for (let index = actionLogSize; index >= 0; index = index - 2) {
            actionLog.push(this.endGameService.actionsLog[index]);
        }
        actionLog = actionLog.reverse();

        for (const word of this.wordValidationService.lastPlayedWords.keys()) {
            if (word.length > currentWordLength) currentWordLength = word.length;
        }
        for (let index = this.obj1LastAttempt[this.playerIndex]; index < actionLog.length; index++) {
            this.obj1ActionTracker[this.playerIndex].push(actionLog[index]);
        }

        const obj1ActionTrackerSize = this.obj1ActionTracker[this.playerIndex].length - 1;
        this.obj1ActionTracker[this.playerIndex][obj1ActionTrackerSize] += currentWordLength >= minLengthToValidate ? 'Valide' : 'Invalide';

        for (let index = obj1ActionTrackerSize; index >= this.obj1LastAttempt[this.playerIndex]; index--) {
            if (this.obj1ActionTracker[this.playerIndex][index] === 'placerSuccesValide') {
                this.obj1Counter[this.playerIndex]++;
            } else {
                this.obj1Counter[this.playerIndex] = this.obj1ActionTracker[this.playerIndex][index] === 'placerSuccesInvalide' ? 0 : 1;
                break;
            }
        }
        this.obj1LastAttempt[this.playerIndex] = actionLog.length;

        if (this.obj1Counter[this.playerIndex] === numberOfOccurrencesToValidate) this.addObjectiveScore(id);
    }

    validateObjectiveTwo(id: number): void {
        const lowerCasePlayedWords: string[] = [];
        for (const word of this.wordValidationService.priorPlayedWords.keys()) {
            lowerCasePlayedWords.push(word.toLowerCase());
        }
        for (const word of this.wordValidationService.lastPlayedWords.keys()) {
            if (word.length >= MIN_SIZE_FOR_OBJ2 && lowerCasePlayedWords.includes(word.toLowerCase())) this.addObjectiveScore(id);
        }
    }

    validateObjectiveThree(id: number): void {
        for (const positions of this.wordValidationService.lastPlayedWords.values()) {
            const playedPositionsUsed: string[][] = [];
            for (const position of positions) {
                this.findPositionInPlayedWords(position, playedPositionsUsed);
            }
            if (playedPositionsUsed.length > 1) {
                this.addObjectiveScore(id);
                return;
            }
        }
    }

    validateObjectiveFour(id: number): void {
        if (this.activeTimeRemaining[this.playerIndex] > 0 && this.playerService.players[this.playerIndex].score >= MIN_SCORE_FOR_OBJ4)
            this.addObjectiveScore(id);
    }

    validateObjectiveFive(id: number) {
        let specificLettersUsed = 0;
        for (const word of this.wordValidationService.lastPlayedWords.keys()) {
            for (const letter of word) {
                if (LETTERS_FOR_OBJ5.includes(letter) || letter.toLocaleUpperCase() === letter) specificLettersUsed++;
            }
            if (specificLettersUsed > 1) {
                this.addObjectiveScore(id);
                return;
            }
            specificLettersUsed = 0;
        }
    }

    validateObjectiveSix(id: number): void {
        if (this.extendedWords.length === 0) return;
        for (const position of this.placementsService.extendingPositions) {
            if (this.randomBonusesService.bonusPositions.has(position)) this.addObjectiveScore(id);
        }
    }

    validateObjectiveSeven(id: number): void {
        for (const word of this.wordValidationService.lastPlayedWords.keys()) {
            if (word.length >= MIN_SIZE_FOR_OBJ7) {
                this.addObjectiveScore(id);
            }
        }
    }

    validateObjectiveEight(id: number): void {
        for (const word of this.wordValidationService.lastPlayedWords.keys()) {
            for (const position of this.wordValidationService.lastPlayedWords.get(word) as string[]) {
                if (CORNER_POSITIONS.includes(position)) {
                    this.addObjectiveScore(id);
                }
            }
        }
    }

    findPositionInPlayedWords(position: string, playedPositionsUsed: string[][]): void {
        for (const word of this.wordValidationService.priorCurrentWords.keys()) {
            const playedPositions = this.wordValidationService.priorCurrentWords.get(word) as string[];
            for (let i = 0; i < playedPositions.length / word.length; i++) {
                const wordPositions = playedPositions.slice(i * word.length, i + word.length);
                if (wordPositions.includes(position) && !this.includesArray(playedPositionsUsed, wordPositions)) {
                    playedPositionsUsed.push(wordPositions);
                }
            }
        }
    }

    includesArray<T>(container: T[][], arrayToFind: T[]): boolean {
        let included = false;
        for (const array of container) {
            if (array.length === arrayToFind.length) {
                for (let i = 0; i < array.length; i++) {
                    if (array[i] === arrayToFind[i]) included = true;
                    else included = false;
                }
                if (included) return true;
            }
        }
        return false;
    }

    addObjectiveScore(id: number): void {
        const objective = this.findObjectiveById(id) as Objective;
        this.playerService.addScore(objective.score, this.playerIndex);
        objective.isCompleted = true;
        this.updateOpponentObjectives(id);
    }

    findObjectiveById(idToSearchFor: number): Objective | undefined {
        for (let i = 0; i < NUMBER_OF_PUBLIC_OBJECTIVES; i++) {
            for (let j = 0; j < NUMBER_OF_PUBLIC_OBJECTIVES; j++) {
                if (this.objectives[i][j].id === idToSearchFor) return this.objectives[i][j];
            }
        }
        return undefined;
    }

    ngOnDestroy(): void {
        this.objectives = [[], []];
        this.activeTimeRemaining = [ONE_MINUTE, ONE_MINUTE];
        this.obj1LastAttempt = [0, 0];
        this.obj1Counter = [0, 0];
        this.obj1ActionTracker = [[], []];
        for (const objective of OBJECTIVES) objective.isCompleted = false;
    }
}
