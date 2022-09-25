/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormControl, FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { BONUS_POSITIONS } from '@app/classes/constants';
import { AiPlayerDB, AiType } from '@common/ai-name';
import { Dictionary } from '@common/dictionary';
import { StartingPlayer } from '@common/game-settings';
import { of } from 'rxjs';
import { FormComponent } from './form.component';

describe('FormComponent', () => {
    let component: FormComponent;
    let fixture: ComponentFixture<FormComponent>;
    let router: jasmine.SpyObj<Router>;
    let emptyDictionary: Dictionary;
    let initializeAiPlayers: any;

    beforeEach(async () => {
        router = jasmine.createSpyObj('Router', ['navigate']);
        await TestBed.configureTestingModule({
            declarations: [FormComponent],
            providers: [
                {
                    provide: MatDialog,
                    useValue: {},
                },
                {
                    provide: MatSnackBar,
                    useValue: {},
                },
            ],
            imports: [HttpClientTestingModule, RouterTestingModule],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
        router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    });

    beforeEach(fakeAsync(() => {
        fixture = TestBed.createComponent(FormComponent);
        component = fixture.componentInstance;
        emptyDictionary = {
            fileName: 'empty.json',
            title: 'empty',
            description: 'empty dictionary',
            isDefault: true,
        };
        component.form = new FormGroup({
            playerName: new FormControl(''),
            minuteInput: new FormControl('70'),
            secondInput: new FormControl('00'),
            levelInput: new FormControl(AiType.beginner),
            dictionaryInput: new FormControl(emptyDictionary),
            randomBonus: new FormControl('Désactiver'),
        });

        component.gameSettingsService.gameSettings.playersNames[0] = 'player 1';
        component.gameSettingsService.isSoloMode = true;
        component.gameSettingsService.gameSettings.randomBonus = 'Désactiver';
        component.adminService.aiExpert = [
            {
                _id: '1',
                aiName: 'Mister_Felix',
                isDefault: true,
            },
            {
                _id: '2',
                aiName: 'Miss_Patty',
                isDefault: true,
            },
            {
                _id: '3',
                aiName: 'Miss_Judith',
                isDefault: true,
            },
        ];

        component.adminService.aiBeginner = [
            {
                _id: '1',
                aiName: 'Mister_Bucky',
                isDefault: true,
            },
            {
                _id: '2',
                aiName: 'Miss_Betty',
                isDefault: true,
            },
            {
                _id: '3',
                aiName: 'Mister_Samy',
                isDefault: true,
            },
        ];

        initializeAiPlayers = spyOn(component.adminService, 'initializeAiPlayers');

        spyOn(component['communicationService'], 'getDictionaries').and.returnValue(of([emptyDictionary]));
        fixture.detectChanges();
        tick();
    }));

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have a predefined name for AI', () => {
        let result = component['chooseRandomAIName'](AiType.beginner);
        expect(component.adminService.aiBeginner.find((aiPlayer: AiPlayerDB) => aiPlayer.aiName === result)).toBeDefined();
        result = component['chooseRandomAIName'](AiType.expert);
        expect(component.adminService.aiExpert.find((aiPlayer: AiPlayerDB) => aiPlayer.aiName === result)).toBeDefined();
    });

    it('should have a different name from the player', () => {
        component.form.controls.playerName.setValue(component['chooseRandomAIName'](AiType.beginner));
        // To consider randomness, we simulate three times the AI name
        const firstAiName = component['chooseRandomAIName'](AiType.beginner);
        const secondAiName = component['chooseRandomAIName'](AiType.beginner);
        const thirdAiName = component['chooseRandomAIName'](AiType.beginner);
        expect(firstAiName).not.toEqual(component.form.controls.playerName.value);
        expect(secondAiName).not.toEqual(component.form.controls.playerName.value);
        expect(thirdAiName).not.toEqual(component.form.controls.playerName.value);
    });

    it('should choose a valid starting player', () => {
        const result = component['chooseStartingPlayer']();
        const players = Object.keys(StartingPlayer);
        expect(players).toContain(result.toString());
    });

    it('should initialize all attributes in ngOnInit()', async () => {
        await component.ngOnInit();
        expect(component.dictionaries).toEqual([emptyDictionary]);
        expect(component.selectedDictionary).toEqual(emptyDictionary);
        expect(component.form).toBeDefined();
        expect(initializeAiPlayers);
    });

    it('should route to game if it is soloGame', async () => {
        spyOn(component, 'selectGameDictionary');
        component.isDictionaryDeleted = false;
        spyOn<any>(component, 'snapshotSettings');
        component.gameSettingsService.isSoloMode = true;
        const navigate = spyOn(router, 'navigate');
        await component.initializeGame();
        expect(navigate).toHaveBeenCalledWith(['game']);
    });

    it('should route to waiting-room if it is not soloGame', async () => {
        spyOn(component, 'selectGameDictionary');
        component.isDictionaryDeleted = false;
        spyOn<any>(component, 'snapshotSettings');
        const navigate = spyOn(router, 'navigate');
        component.gameSettingsService.isSoloMode = false;
        await component.initializeGame();
        expect(navigate).toHaveBeenCalledWith(['waiting-room']);
    });

    it('should call shuffleBonusPositons of randomBonusService if randomBonus are activated in the form', () => {
        const shuffleBonusPositionsSpy = spyOn(component['randomBonusService'], 'shuffleBonusPositions').and.returnValue(
            new Map<string, string>([['A1', 'doubleLetter']]),
        );
        component.form.controls.randomBonus.setValue('Activer');
        component['getRightBonusPositions']();
        expect(shuffleBonusPositionsSpy).toHaveBeenCalledOnceWith();
    });

    it('should return regular bonus positions if randomBonus are deactivated in the form', () => {
        component.form.controls.randomBonus.setValue('Désactiver');
        expect(component['getRightBonusPositions']()).toEqual(JSON.stringify(Array.from(BONUS_POSITIONS)));
    });

    it('should set an error if the dictionary selected is not a known dictionary', async () => {
        const unknownDictionary = {
            fileName: 'unknown.json',
            title: 'unknown',
            description: 'unknown dictionary',
            isDefault: false,
        };
        await component.selectGameDictionary(unknownDictionary);
        expect(component.isDictionaryDeleted).toBeTrue();
        expect(component.form.controls.dictionaryInput.invalid).toBeTrue();
    });

    it('should snapshot capture the parameters', () => {
        const nameTest = 'test';
        const nameIaTest = 'testIa';
        spyOn<any>(component, 'chooseRandomAIName').and.returnValue(nameIaTest);
        const startingPlayerTest = StartingPlayer.Player2;
        spyOn<any>(component, 'chooseStartingPlayer').and.returnValue(startingPlayerTest);
        const minuteTest = '02';
        const secondTest = '30';
        const levelTest = AiType.expert;
        const bonusTest = 'Désactiver';
        const fileName = 'test.json';
        component.fileName = fileName;
        spyOn(Math, 'floor').and.returnValues(0, 1, 2, 3);

        component.form.controls.playerName.setValue(nameTest);
        component.form.controls.minuteInput.setValue(minuteTest);
        component.form.controls.secondInput.setValue(secondTest);
        component.form.controls.levelInput.setValue(levelTest);
        component.form.controls.randomBonus.setValue('Désactiver');

        component['snapshotSettings']();

        expect(component.gameSettingsService.gameSettings.playersNames).toEqual([nameTest, nameIaTest]);
        expect(component.gameSettingsService.gameSettings.startingPlayer).toEqual(startingPlayerTest);
        expect(component.gameSettingsService.gameSettings.timeMinute).toEqual(minuteTest);
        expect(component.gameSettingsService.gameSettings.timeSecond).toEqual(secondTest);
        expect(component.gameSettingsService.gameSettings.level).toEqual(levelTest);
        expect(component.gameSettingsService.gameSettings.randomBonus).toEqual(bonusTest);
        expect(component.gameSettingsService.gameSettings.dictionary).toEqual(fileName);
        expect(component.gameSettingsService.gameSettings.objectiveIds).toEqual([
            [0, 1],
            [2, 3],
        ]);
    });

    it('should not add objective if it has been already picked', () => {
        spyOn(Math, 'floor').and.returnValues(0, 1, 1, 1, 2, 3);
        expect(component['initializeObjective']()).not.toEqual([
            [0, 1],
            [1, 1],
        ]);
    });

    it('should not initialize game if the selected dictionary has been deleted', () => {
        spyOn(component, 'selectGameDictionary');
        component.isDictionaryDeleted = true;
        const navigate = spyOn(router, 'navigate');
        component.initializeGame();
        expect(navigate).not.toHaveBeenCalled();
    });

    it('should not set an error to the form if the form is not defined', async () => {
        const setError = spyOn(component.form.controls.dictionaryInput, 'setErrors');
        component.form = undefined as unknown as FormGroup;
        await component.selectGameDictionary(emptyDictionary);
        expect(setError).not.toHaveBeenCalled();
    });

    it('should call initializeGame when Enter key is pressed and form is valid', () => {
        const spyInit = spyOn(component, 'initializeGame');
        const enterEvent = new KeyboardEvent('keydown', {
            code: 'Enter',
            key: 'Enter',
            charCode: 13,
            keyCode: 13,
            view: window,
            bubbles: true,
        });
        const notEnterEvent = new KeyboardEvent('keydown', {
            code: 'test',
            key: 'test',
            charCode: 13,
            keyCode: 13,
            view: window,
            bubbles: true,
        });
        let numberSpyCalls = 0;

        // Form is invalid
        component.keyPressSubmit(notEnterEvent);
        expect(spyInit).toHaveBeenCalledTimes(numberSpyCalls);

        component.keyPressSubmit(enterEvent);
        numberSpyCalls++;
        expect(spyInit).toHaveBeenCalledTimes(numberSpyCalls);

        // Form is valid
        component.form.controls.playerName.setValue('validName');
        component.form.controls.minuteInput.setValue('01');

        component.keyPressSubmit(notEnterEvent);
        expect(spyInit).toHaveBeenCalledTimes(numberSpyCalls);

        component.keyPressSubmit(enterEvent);
        numberSpyCalls++;
        expect(spyInit).toHaveBeenCalledTimes(numberSpyCalls);
    });
});
