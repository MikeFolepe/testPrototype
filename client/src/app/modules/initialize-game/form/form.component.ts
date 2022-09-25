import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { BONUS_POSITIONS, DEFAULT_DICTIONARY_INDEX, INVALID_INDEX, PLAYER_ONE_INDEX } from '@app/classes/constants';
import { NUMBER_OF_OBJECTIVES, NUMBER_OF_PUBLIC_OBJECTIVES, OBJECTIVES } from '@app/classes/objectives';
import { AdministratorService } from '@app/services/administrator.service';
import { CommunicationService } from '@app/services/communication.service';
import { GameSettingsService } from '@app/services/game-settings.service';
import { RandomBonusesService } from '@app/services/random-bonuses.service';
import { AiType } from '@common/ai-name';
import { Dictionary } from '@common/dictionary';
import { GameSettings, StartingPlayer } from '@common/game-settings';
import { ObjectiveTypes } from '@common/objectives-type';

@Component({
    selector: 'app-form',
    templateUrl: './form.component.html',
    styleUrls: ['./form.component.scss'],
})
export class FormComponent implements OnInit, OnDestroy {
    form: FormGroup;
    dictionaries: Dictionary[];
    selectedDictionary: Dictionary;
    isDictionaryDeleted: boolean;
    fileName: string;

    constructor(
        public gameSettingsService: GameSettingsService,
        private router: Router,
        private randomBonusService: RandomBonusesService,
        private communicationService: CommunicationService,
        public adminService: AdministratorService,
    ) {
        this.gameSettingsService.ngOnDestroy();
    }

    async ngOnInit(): Promise<void> {
        await this.initializeDictionaries();
        await this.selectGameDictionary(this.dictionaries[DEFAULT_DICTIONARY_INDEX]);
        this.form = new FormGroup({
            playerName: new FormControl(this.gameSettingsService.gameSettings.playersNames[PLAYER_ONE_INDEX]),
            minuteInput: new FormControl(this.gameSettingsService.gameSettings.timeMinute),
            secondInput: new FormControl(this.gameSettingsService.gameSettings.timeSecond),
            levelInput: new FormControl('Débutant'),
            dictionaryInput: new FormControl(this.selectedDictionary.title, [Validators.required]),
            randomBonus: new FormControl(this.gameSettingsService.gameSettings.randomBonus),
        });
        this.adminService.initializeAiPlayers();
    }

    async initializeGame(): Promise<void> {
        await this.selectGameDictionary(this.selectedDictionary);
        if (this.isDictionaryDeleted) return;
        this.snapshotSettings();
        const nextUrl = this.gameSettingsService.isSoloMode ? 'game' : 'waiting-room';
        this.router.navigate([nextUrl]);
    }

    // Checks if dictionary is not deleted and update the attributes
    async selectGameDictionary(dictionary: Dictionary): Promise<void> {
        const dictionaries = await this.communicationService.getDictionaries().toPromise();
        if (!dictionaries.find((dictionaryInArray: Dictionary) => dictionary.title === dictionaryInArray.title)) {
            this.isDictionaryDeleted = true;
            this.form.controls.dictionaryInput.setErrors({ incorrect: true });
            return;
        }
        this.isDictionaryDeleted = false;
        if (this.form) this.form.controls.dictionaryInput.setErrors(null);
        this.selectedDictionary = dictionary;
        this.fileName = this.selectedDictionary.fileName;
    }

    keyPressSubmit(event: KeyboardEvent): void {
        if (event.key === 'Enter' && this.form.valid) this.initializeGame();
    }

    ngOnDestroy(): void {
        this.gameSettingsService.isRedirectedFromMultiplayerGame = false;
    }

    private async initializeDictionaries(): Promise<void> {
        this.dictionaries = await this.communicationService.getDictionaries().toPromise();
    }

    private getRightBonusPositions(): string {
        const bonusPositions = this.form.controls.randomBonus.value === 'Activer' ? this.randomBonusService.shuffleBonusPositions() : BONUS_POSITIONS;
        return JSON.stringify(Array.from(bonusPositions));
    }

    private chooseStartingPlayer(): StartingPlayer {
        return Math.floor((Math.random() * Object.keys(StartingPlayer).length) / 2);
    }

    private chooseRandomAIName(levelInput: AiType): string {
        let randomName = '';
        do {
            // Random value [0, AI_NAME_DATABASE.length[
            const randomNumber = Math.floor(Math.random() * this.adminService.aiBeginner.length);
            randomName =
                levelInput === AiType.beginner ? this.adminService.aiBeginner[randomNumber].aiName : this.adminService.aiExpert[randomNumber].aiName;
        } while (randomName === this.form.controls.playerName.value);
        return randomName;
    }

    private snapshotSettings(): void {
        const playersNames: string[] = [this.form.controls.playerName.value, this.chooseRandomAIName(this.form.controls.levelInput.value)];
        this.gameSettingsService.gameSettings = new GameSettings(
            playersNames,
            this.chooseStartingPlayer(),
            this.form.controls.minuteInput.value,
            this.form.controls.secondInput.value,
            this.getLevel(),
            this.form.controls.randomBonus.value,
            this.getRightBonusPositions(),
            this.fileName,
            this.initializeObjective(),
        );
    }

    private getLevel(): AiType {
        return this.form.controls.levelInput.value === AiType.beginner ? AiType.beginner : AiType.expert;
    }

    private initializeObjective(): number[][] {
        const objectiveIds: number[] = [];

        while (objectiveIds.length < NUMBER_OF_OBJECTIVES) {
            const candidate = Math.floor(Number(Math.random()) * OBJECTIVES.length);
            if (objectiveIds.indexOf(candidate) === INVALID_INDEX) objectiveIds.push(candidate);
        }

        const objectiveByType: number[][] = [[], []];

        objectiveByType[ObjectiveTypes.Public] = objectiveIds.slice(0, NUMBER_OF_PUBLIC_OBJECTIVES);
        objectiveByType[ObjectiveTypes.Private] = objectiveIds.slice(NUMBER_OF_PUBLIC_OBJECTIVES, objectiveIds.length);

        return objectiveByType;
    }
}
