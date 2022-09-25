/* eslint-disable max-lines */
/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
import { HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { ERROR_MESSAGE_DELAY, ONE_SECOND_DELAY } from '@app/classes/constants';
import { AiPlayerDB, AiType } from '@common/ai-name';
import { Dictionary } from '@common/dictionary';
import FileSaver from 'file-saver';
import { Observable, of, throwError } from 'rxjs';
import { AdministratorService } from './administrator.service';

interface DictionaryTest {
    title: string;
    description: string;
    words: string[];
}

describe('AdministratorService', () => {
    let service: AdministratorService;
    let player1: AiPlayerDB;
    let player2: AiPlayerDB;
    let player3: AiPlayerDB;
    let errorResponse: HttpErrorResponse;
    let emptyDictionary: Dictionary;

    let spyMatSnackBar: any;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterTestingModule, MatSnackBarModule, MatDialogModule, BrowserAnimationsModule],
        });
        service = TestBed.inject(AdministratorService);
        player1 = {
            _id: '1',
            aiName: 'Mister_Bucky',
            isDefault: true,
        };
        player2 = {
            _id: '2',
            aiName: 'Miss_Betty',
            isDefault: true,
        };
        player3 = {
            _id: '3',
            aiName: 'Mister_Samy',
            isDefault: true,
        };
        service.aiBeginner = [player1, player2, player3];
        service.aiExpert = [player1, player2, player3];
        errorResponse = new HttpErrorResponse({
            error: { code: 'some code', message: 'some message.' },
            status: 400,
            statusText: 'Bad Request',
        });
        emptyDictionary = {
            fileName: 'empty.json',
            title: 'empty',
            description: 'empty dictionary',
            isDefault: false,
        };
        spyMatSnackBar = spyOn(service.snackBar, 'open');
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should select the respective file on file input', () => {
        const file: File = new File([], 'file.json');

        const fileList: FileList = {
            0: file,
            length: 1,
            item: () => {
                return file;
            },
        };
        service.onFileInput(fileList as FileList | null);
        expect(service.file).toEqual(fileList.item(0));
    });

    it('isDictionaryValid() should return false when the file is not a .json', async () => {
        service.file = new File([], 'file');
        const isValid: boolean = await service.isDictionaryValid();
        expect(isValid).toBeFalse();
    });

    it('isDictionaryValid() should return false on an invalid dictionary', async () => {
        const blob = new Blob([], { type: 'application/json' });
        service.file = new File([blob], 'file.json', { type: 'application/json' });
        const isValid: boolean = await service.isDictionaryValid();
        expect(isValid).toBeFalse();
    });

    it('isDictionaryValid() should return true on a valid dictionary', async () => {
        const dictionary: DictionaryTest = { title: 'Un dictionnaire', description: 'Une description', words: ['a', 'b', 'c'] };
        const jsn = JSON.stringify(dictionary);
        const blob = new Blob([jsn], { type: 'application/json' });
        service.file = new File([blob], 'file.json', { type: 'application/json' });
        const isValid: boolean = await service.isDictionaryValid();
        expect(isValid).toBeTrue();
    });

    it('adding a dictionary with a new name should be added to the dictionaries', () => {
        spyOn<any>(service, 'displayMessage');
        const message: Observable<string> = of('Uploaded');
        spyOn(service['communicationService'], 'uploadFile').and.returnValue(message);
        service.currentDictionary = { fileName: 'test', title: 'Un dictionnaire', description: 'Une description', isDefault: false };
        service.file = new File([], 'test', { type: 'application/json' });
        service.addDictionary();
        expect(service.dictionaries[0].fileName).toEqual('test');
    });

    it('adding a dictionary while its name already exist should not be possible', () => {
        spyOn<any>(service, 'displayMessage');
        jasmine.clock().install();
        const message: Observable<string> = of('Uploaded');
        spyOn(service['communicationService'], 'uploadFile').and.returnValue(message);
        service.currentDictionary = { fileName: 'test', title: 'Un dictionnaire', description: 'Une description', isDefault: false };
        service.file = new File([], 'test', { type: 'application/json' });
        service.dictionaries = [service.currentDictionary];
        service.addDictionary();
        jasmine.clock().tick(3000);
        expect(service['displayMessage']).toHaveBeenCalledWith('Il existe déjà un dictionnaire portant le même nom');
        jasmine.clock().uninstall();
    });

    it('should display a message if upload dictionary encounters an error', () => {
        const displayMessage = spyOn<any>(service, 'displayMessage');
        spyOn(service['communicationService'], 'uploadFile').and.returnValue(throwError(errorResponse));
        spyOn<any>(service, 'isDictionaryNameUsed').and.returnValue(false);
        service.currentDictionary = { fileName: 'test', title: 'Un dictionnaire', description: 'Une description', isDefault: false };
        service.file = new File([], 'test2', { type: 'application/json' });
        service.addDictionary();
        expect(displayMessage).toHaveBeenCalledWith(
            "Le dictionnaire n'a pas été téléversé, erreur : Http failure response for (unknown url): 400 Bad Request",
        );
    });

    it('should not call uploadDictionary if file is undefined', () => {
        const uploadDictionary = spyOn(service['communicationService'], 'uploadFile');
        spyOn<any>(service, 'isDictionaryNameUsed').and.returnValue(false);
        service.currentDictionary = { fileName: 'test', title: 'Un dictionnaire', description: 'Une description', isDefault: false };
        service.addDictionary();
        expect(uploadDictionary).not.toHaveBeenCalled();
    });

    it('submitting a valid dictionary should call addDictionary()', async () => {
        spyOn(service, 'isDictionaryValid').and.returnValue(Promise.resolve(true));
        spyOn(service, 'addDictionary');
        await service.onSubmit();
        expect(service.addDictionary).toHaveBeenCalled();
    });

    it('submitting a invalid dictionary should display the respective message', async () => {
        spyOn(service, 'isDictionaryValid').and.returnValue(Promise.resolve(false));
        spyOn<any>(service, 'displayMessage');
        await service.onSubmit();
        expect(service['displayMessage']).toHaveBeenCalledWith("Le fichier n'est pas un dictionnaire");
    });

    it('should return a random name of beginner Ai name', () => {
        service.getAiBeginnerName();
        expect(service.getAiBeginnerName()).not.toEqual('');
    });

    it('should reset all dictionaries', () => {
        const deleteDictionary = spyOn(service, 'deleteDictionary');

        const dictionary1: Dictionary = { fileName: 'test 1 name', title: 'test 1', description: 'test 1 descr', isDefault: true };
        const dictionary2: Dictionary = { fileName: 'test 2 name', title: 'test 2', description: 'test 2 descr', isDefault: false };
        const dictionary3: Dictionary = { fileName: 'test 3 name', title: 'test 3', description: 'test 3 descr', isDefault: false };

        service.dictionaries.push(dictionary1, dictionary2, dictionary3);

        service['resetDictionaries']();

        expect(deleteDictionary).toHaveBeenCalledTimes(2);
    });

    it('should reset all AI names', () => {
        const deletePlayer = spyOn<any>(service, 'deleteAiPlayer');

        const player4: AiPlayerDB = {
            _id: '4',
            aiName: 'Mister_Test',
            isDefault: false,
        };
        const player5: AiPlayerDB = {
            _id: '5',
            aiName: 'Miss_Test',
            isDefault: false,
        };

        service.aiBeginner.push(player4, player5);
        service.aiExpert.push(player4, player5);

        service['resetAiPlayers']();

        expect(deletePlayer).toHaveBeenCalledTimes(2 + 2);
    });

    it('should reset all scores', () => {
        const resetScores = spyOn(service['communicationService'], 'deleteScores').and.returnValue(of());

        service['resetScores']();
        expect(resetScores).toHaveBeenCalledTimes(1);
    });

    it('should call the right functions when calling resetData', async () => {
        jasmine.clock().install();
        const resetPlayers = spyOn<any>(service, 'resetAiPlayers');
        const resetDictionaries = spyOn<any>(service, 'resetDictionaries');
        const resetScores = spyOn<any>(service, 'resetScores');
        const displayMessage = spyOn<any>(service, 'displayMessage');

        await service.resetData();
        jasmine.clock().tick(ONE_SECOND_DELAY);

        expect(resetPlayers).toHaveBeenCalledTimes(1);
        expect(resetDictionaries).toHaveBeenCalledTimes(1);
        expect(resetScores).toHaveBeenCalledTimes(1);
        expect(service.isResetting).toBeTrue();
        jasmine.clock().tick(2001);
        expect(service.isResetting).toBeFalse();
        expect(displayMessage).toHaveBeenCalledOnceWith('La base de données à été réinitialisée');
        jasmine.clock().uninstall();
    });

    it('should initialize AI players', () => {
        jasmine.clock().install();
        const player4: AiPlayerDB = {
            _id: '4',
            aiName: 'Mister_Test',
            isDefault: false,
        };
        const player5: AiPlayerDB = {
            _id: '5',
            aiName: 'Miss_Test',
            isDefault: false,
        };
        const getPlayers = spyOn(service['communicationService'], 'getAiPlayers').and.returnValue(of([player4, player5]));
        spyOn<any>(service, 'handleRequestError');
        service.initializeAiPlayers();
        jasmine.clock().tick(ERROR_MESSAGE_DELAY);
        expect(getPlayers).toHaveBeenCalledTimes(2);
        expect(service.aiBeginner).toEqual([player4, player5]);
        expect(service.aiExpert).toEqual([player4, player5]);
        jasmine.clock().uninstall();
    });

    it('should call handleRequestError if returned players have an error', () => {
        const getPlayers = spyOn(service['communicationService'], 'getAiPlayers').and.returnValue(throwError(errorResponse));
        spyOn<any>(service, 'displayMessage');
        service.initializeAiPlayers();
        expect(getPlayers).toHaveBeenCalledTimes(2);
    });

    it('should initialize dictionaries', () => {
        const dictionary1: Dictionary = { fileName: 'test 1 name', title: 'test 1', description: 'test 1 descr', isDefault: true };
        const dictionary2: Dictionary = { fileName: 'test 2 name', title: 'test 2', description: 'test 2 descr', isDefault: false };
        const dictionary3: Dictionary = { fileName: 'test 3 name', title: 'test 3', description: 'test 3 descr', isDefault: false };

        const getDictionaries = spyOn(service['communicationService'], 'getDictionaries').and.returnValue(
            of([dictionary1, dictionary2, dictionary3]),
        );
        service.initializeDictionaries();
        expect(getDictionaries).toHaveBeenCalledTimes(1);
        expect(service.dictionaries).toEqual([dictionary1, dictionary2, dictionary3]);
    });

    it('should not add AI to database if player added is default', () => {
        const addPlayer = spyOn<any>(service, 'addAiPlayer');
        const updatePlayer = spyOn<any>(service, 'updateAiPlayer');
        const displayMessage = spyOn<any>(service, 'displayMessage');

        service.addAiToDatabase(AiType.beginner, true, '5', true);
        expect(addPlayer).not.toHaveBeenCalled();
        expect(updatePlayer).not.toHaveBeenCalled();
        expect(displayMessage).toHaveBeenCalledOnceWith('Vous ne pouvez pas modifier un joueur par défaut!');
    });

    it('should not add AI name to database if an error occurred in the request', () => {
        const playerTest: AiPlayerDB = {
            _id: '4',
            aiName: 'Mister_Test',
            isDefault: false,
        };
        const addPlayer = spyOn<any>(service['communicationService'], 'addAiPlayer').and.returnValue(throwError(errorResponse));
        const displayMessage = spyOn<any>(service, 'displayMessage');

        service['addAiPlayer'](playerTest, AiType.beginner);
        expect(addPlayer).toHaveBeenCalledTimes(1);
        expect(displayMessage).toHaveBeenCalledOnceWith(
            "Le joueur n'a pas été ajouté, erreur : Http failure response for (unknown url): 400 Bad Request",
        );
    });

    it('should not update AI name if an error occurred in the request', () => {
        const playerTest: AiPlayerDB = {
            _id: '4',
            aiName: 'Mister_Test',
            isDefault: false,
        };
        const updatePlayer = spyOn<any>(service['communicationService'], 'updateAiPlayer').and.returnValue(throwError(errorResponse));
        const displayMessage = spyOn<any>(service, 'displayMessage');

        service['updateAiPlayer']('4', playerTest, AiType.beginner);
        expect(updatePlayer).toHaveBeenCalledTimes(1);
        expect(displayMessage).toHaveBeenCalledOnceWith(
            "Le joueur n'a pas été modifié, erreur : Http failure response for (unknown url): 400 Bad Request",
        );
    });

    it('should not add AI name to database if name is null', () => {
        const addPlayer = spyOn<any>(service, 'addAiPlayer');
        const updatePlayer = spyOn<any>(service, 'updateAiPlayer');
        const displayMessage = spyOn<any>(service, 'displayMessage');

        const matDialogRefMock = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        matDialogRefMock.afterClosed.and.returnValue(of(null));
        const matDialogMock = jasmine.createSpyObj('MatDialog', ['open']);
        matDialogMock.open.and.returnValue(matDialogRefMock);
        service.dialog = matDialogMock;

        service.addAiToDatabase(AiType.beginner, true, '5');
        expect(addPlayer).not.toHaveBeenCalled();
        expect(updatePlayer).not.toHaveBeenCalled();
        expect(displayMessage).not.toHaveBeenCalled();
    });

    it('should not add AI name to database if name is already given', () => {
        const addPlayer = spyOn<any>(service, 'addAiPlayer');
        const updatePlayer = spyOn<any>(service, 'updateAiPlayer');
        const displayMessage = spyOn<any>(service, 'displayMessage');

        const playerBeginner: AiPlayerDB = {
            _id: '4',
            aiName: 'Mister_Test',
            isDefault: false,
        };
        const playerExpert: AiPlayerDB = {
            _id: '5',
            aiName: 'Miss_Test',
            isDefault: false,
        };

        service.aiBeginner.push(playerBeginner);
        service.aiExpert.push(playerExpert);

        const matDialogRefMock = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        matDialogRefMock.afterClosed.and.returnValues(of(playerBeginner.aiName), of(playerExpert.aiName));
        const matDialogMock = jasmine.createSpyObj('MatDialog', ['open']);
        matDialogMock.open.and.returnValue(matDialogRefMock);
        service.dialog = matDialogMock;

        service.addAiToDatabase(AiType.beginner, true, playerBeginner._id);
        expect(addPlayer).not.toHaveBeenCalled();
        expect(updatePlayer).not.toHaveBeenCalled();
        expect(displayMessage).toHaveBeenCalledTimes(1);

        service.addAiToDatabase(AiType.expert, true, playerExpert._id);
        expect(addPlayer).not.toHaveBeenCalled();
        expect(updatePlayer).not.toHaveBeenCalled();
        expect(displayMessage).toHaveBeenCalledTimes(2);
    });

    it('should add player AI to database', () => {
        const addPlayer = spyOn<any>(service, 'addAiPlayer').and.callThrough();
        const updatePlayer = spyOn<any>(service, 'updateAiPlayer').and.callThrough();
        spyOn(service['communicationService'], 'addAiPlayer').and.returnValues(
            of({ _id: '4', aiName: 'test1', isDefault: false }),
            of({ _id: '5', aiName: 'test2', isDefault: false }),
        );
        spyOn(service['communicationService'], 'updateAiPlayer').and.returnValues(
            of([player1, player2, player3, { _id: '4', aiName: 'test3', isDefault: false }]),
            of([player1, player2, player3, { _id: '5', aiName: 'test4', isDefault: false }]),
        );

        const matDialogRefMock = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        matDialogRefMock.afterClosed.and.returnValues(of('test1'), of('test2'), of('test3'), of('test4'));
        const matDialogMock = jasmine.createSpyObj('MatDialog', ['open']);
        matDialogMock.open.and.returnValue(matDialogRefMock);
        service.dialog = matDialogMock;

        service.addAiToDatabase(AiType.beginner, true);
        expect(addPlayer).toHaveBeenCalledTimes(1);
        expect(updatePlayer).toHaveBeenCalledTimes(0);
        expect(service.aiBeginner).toContain({ _id: '4', aiName: 'test1', isDefault: false });

        service.addAiToDatabase(AiType.expert, true);
        expect(addPlayer).toHaveBeenCalledTimes(2);
        expect(updatePlayer).toHaveBeenCalledTimes(0);
        expect(service.aiExpert).toContain({ _id: '5', aiName: 'test2', isDefault: false });

        service.addAiToDatabase(AiType.beginner, false, '4');
        expect(addPlayer).toHaveBeenCalledTimes(2);
        expect(updatePlayer).toHaveBeenCalledTimes(1);
        expect(service.aiBeginner).toContain({ _id: '4', aiName: 'test3', isDefault: false });

        service.addAiToDatabase(AiType.expert, false, '5');
        expect(addPlayer).toHaveBeenCalledTimes(2);
        expect(updatePlayer).toHaveBeenCalledTimes(2);
        expect(service.aiExpert).toContain({ _id: '5', aiName: 'test4', isDefault: false });
    });

    it('should call handleRequestError if an error occurred while deleting players', () => {
        const testPlayer: AiPlayerDB = {
            _id: '4',
            aiName: 'Mister_Test',
            isDefault: false,
        };
        const deletePlayers = spyOn(service['communicationService'], 'deleteAiPlayer').and.returnValue(throwError(errorResponse));
        const displayMessage = spyOn<any>(service, 'displayMessage');
        service.aiBeginner.push(testPlayer);
        service.deleteAiPlayer(testPlayer, AiType.beginner);
        expect(deletePlayers).toHaveBeenCalledTimes(1);
        expect(displayMessage).toHaveBeenCalledOnceWith(
            "Le joueur n'a pas été supprimé, erreur : Http failure response for (unknown url): 400 Bad Request",
        );
    });

    it('should not add AI to database if player added is default', () => {
        const deletePlayers = spyOn(service['communicationService'], 'deleteAiPlayer').and.returnValue(throwError(errorResponse));
        const displayMessage = spyOn<any>(service, 'displayMessage');

        service.deleteAiPlayer(player1, AiType.beginner);

        expect(deletePlayers).not.toHaveBeenCalled();
        expect(displayMessage).toHaveBeenCalledOnceWith('Vous ne pouvez pas supprimer un joueur par défaut!');
    });

    it('should delete AI from database', () => {
        const testPlayer: AiPlayerDB = {
            _id: '4',
            aiName: 'Mister_Test',
            isDefault: false,
        };
        const deletePlayers = spyOn(service['communicationService'], 'deleteAiPlayer').and.returnValue(of([player1, player2, player3]));
        const displayMessage = spyOn<any>(service, 'displayMessage');
        service.aiBeginner.push(testPlayer);

        service.deleteAiPlayer(testPlayer, AiType.beginner);
        expect(service.aiBeginner).toEqual([player1, player2, player3]);
        expect(deletePlayers).toHaveBeenCalledTimes(1);
        expect(displayMessage).toHaveBeenCalledOnceWith('Joueur supprimé');

        service.aiExpert.push(testPlayer);
        service.deleteAiPlayer(testPlayer, AiType.expert);
        expect(service.aiExpert).toEqual([player1, player2, player3]);
        expect(deletePlayers).toHaveBeenCalledTimes(2);
        expect(displayMessage).toHaveBeenCalledTimes(2);
    });

    it('should not update dictionary if name chosen is already used', () => {
        const dictionary1: Dictionary = { fileName: 'test 1 name', title: 'test 1', description: 'test 1 descr', isDefault: true };
        const displayMessage = spyOn<any>(service, 'displayMessage');
        spyOn<any>(service, 'isDictionaryNameUsed').and.returnValue(true);
        service.dictionaries = [dictionary1];
        service.updateDictionary(dictionary1, { title: 'test 1 name' });
        expect(displayMessage).toHaveBeenCalledOnceWith('Ce titre de dictionnaire existe deja. Veuillez réessayer.');
    });

    it('should update dictionary if name chosen is not used', () => {
        const dictionary1: Dictionary = { fileName: 'test 1 name', title: 'test 1', description: 'test 1 descr', isDefault: true };
        const displayMessage = spyOn<any>(service, 'displayMessage');
        const updateDictionary = spyOn(service['communicationService'], 'updateDictionary').and.returnValue(of([dictionary1]));
        spyOn<any>(service, 'isDictionaryNameUsed').and.returnValue(false);
        service.dictionaries = [];

        service.updateDictionary(dictionary1, { title: 'test 1 name' });

        expect(updateDictionary).toHaveBeenCalledTimes(1);
        expect(service.dictionaries).toEqual([dictionary1]);
        expect(displayMessage).toHaveBeenCalledOnceWith('Dictionnaire modifié');
    });

    it('should not delete dictionary if dictionary is default', () => {
        const dictionary1: Dictionary = { fileName: 'test 1 name', title: 'test 1', description: 'test 1 descr', isDefault: true };
        const displayMessage = spyOn<any>(service, 'displayMessage');
        service.dictionaries = [dictionary1];
        service.deleteDictionary(dictionary1);
        expect(displayMessage).toHaveBeenCalledOnceWith('Vous ne pouvez pas supprimer le dictionnaire par défaut');
    });

    it('should delete dictionary', () => {
        const dictionary1: Dictionary = { fileName: 'test 1 name', title: 'test 1', description: 'test 1 descr', isDefault: false };
        const displayMessage = spyOn<any>(service, 'displayMessage');
        spyOn<any>(service['communicationService'], 'deleteDictionary').and.returnValue(of([]));
        service.dictionaries = [dictionary1];
        service.deleteDictionary(dictionary1);
        expect(displayMessage).toHaveBeenCalledOnceWith('Dictionnaire supprimé');
    });

    it('should not update dictionary if data fields are null', () => {
        spyOn<any>(service, 'displayMessage');
        const matDialogRefMock = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        matDialogRefMock.afterClosed.and.returnValue(of(null));
        const matDialogMock = jasmine.createSpyObj('MatDialog', ['open']);
        matDialogMock.open.and.returnValue(matDialogRefMock);
        service.dialog = matDialogMock;
        const updateDictionary = spyOn(service, 'updateDictionary');
        service.editDictionary(emptyDictionary);
        expect(updateDictionary).not.toHaveBeenCalled();
    });

    it('should not update dictionary if at least one of the data field is null', () => {
        spyOn<any>(service, 'displayMessage');
        const matDialogRefMock = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        matDialogRefMock.afterClosed.and.returnValue(
            of({
                titleInput: 'dictionary.title',
                descriptionInput: null,
            }),
        );
        const matDialogMock = jasmine.createSpyObj('MatDialog', ['open']);
        matDialogMock.open.and.returnValue(matDialogRefMock);
        service.dialog = matDialogMock;
        const updateDictionary = spyOn(service, 'updateDictionary');
        service.editDictionary(emptyDictionary);
        expect(updateDictionary).not.toHaveBeenCalled();
    });

    it('should not update dictionary if at least one of the data field not null', () => {
        spyOn<any>(service, 'displayMessage');
        const matDialogRefMock = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        matDialogRefMock.afterClosed.and.returnValue(
            of({
                titleInput: 'dictionary.title',
                descriptionInput: 'dictionary.description',
            }),
        );
        const matDialogMock = jasmine.createSpyObj('MatDialog', ['open']);
        matDialogMock.open.and.returnValue(matDialogRefMock);
        service.dialog = matDialogMock;
        const updateDictionary = spyOn(service, 'updateDictionary');
        service.editDictionary(emptyDictionary);
        expect(updateDictionary).toHaveBeenCalled();
    });

    it('should not update dictionary if dictionary is default', () => {
        spyOn<any>(service, 'displayMessage');
        const matDialogRefMock = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        matDialogRefMock.afterClosed.and.returnValue(
            of({
                title: 'dictionary.title',
                description: 'dictionary.description',
            }),
        );
        const matDialogMock = jasmine.createSpyObj('MatDialog', ['open']);
        matDialogMock.open.and.returnValue(matDialogRefMock);
        service.dialog = matDialogMock;
        const updateDictionary = spyOn(service, 'updateDictionary');
        emptyDictionary.isDefault = true;
        service.editDictionary(emptyDictionary);
        expect(updateDictionary).not.toHaveBeenCalled();
    });

    it('should call saveAs() when downloading dictionary', () => {
        spyOn<any>(service, 'displayMessage');
        // eslint-disable-next-line deprecation/deprecation
        const saveAs = spyOn(FileSaver, 'saveAs');
        spyOn(service['communicationService'], 'downloadDictionary').and.returnValue(of('test'));
        service.downloadDictionary(emptyDictionary);
        expect(saveAs).toHaveBeenCalled();
    });

    it('should not do anything in onFileInput if file is undefined', () => {
        service.onFileInput(null);
        expect(service.file).toEqual(null);
    });

    it('should not do anything in isDictionaryValid if file is undefined', () => {
        service.currentDictionary = undefined as unknown as Dictionary;
        service.isDictionaryValid();
        expect(service.currentDictionary).toBeUndefined();
    });

    it('should not be able to display message while resetting', () => {
        service.isResetting = true;
        service['displayMessage']('test');
        expect(spyMatSnackBar).not.toHaveBeenCalled();
    });

    it('displayServerError should display the error during the correct delay', () => {
        jasmine.clock().install();
        service.serverError = '';
        service['displayServerError']('ERROR');
        expect(service.serverError).toEqual('ERROR');
        jasmine.clock().tick(ERROR_MESSAGE_DELAY);
        expect(service.serverError).toEqual('');
        jasmine.clock().uninstall();
    });
});
