/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable dot-notation */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { DELAY_BEFORE_PLAYING, ONE_SECOND_DELAY, THREE_SECONDS_DELAY } from '@app/classes/constants';
import { PlayerAI } from '@app/models/player-ai.model';
import { Player } from '@app/models/player.model';
import { Letter } from '@common/letter';
import { Socket } from 'socket.io-client';
import { GameSettingsService } from './game-settings.service';
import { PlayerAIService } from './player-ai.service';
import { SkipTurnService } from './skip-turn.service';

describe('SkipTurnService', () => {
    let service: SkipTurnService;
    let gameSettingsService: jasmine.SpyObj<GameSettingsService>;
    let playerService: PlayerAIService;
    let letterA: Letter;

    beforeEach(() => {
        const settingsSpy = jasmine.createSpyObj('GameSettingsService', ['gameSettings']);
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterTestingModule],
            providers: [SkipTurnService, { provide: GameSettingsService, useValue: settingsSpy }],
        });
        playerService = TestBed.inject(PlayerAIService);
        service = TestBed.inject(SkipTurnService);
        gameSettingsService = TestBed.inject(GameSettingsService) as jasmine.SpyObj<GameSettingsService>;
    });

    beforeEach(() => {
        jasmine.clock().install();
    });

    afterEach(() => {
        jasmine.clock().uninstall();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should get the newTurn from the server', () => {
        spyOn(service['endGameService'], 'checkEndGame');
        service['clientSocket'].socket = {
            on: (eventName: string, callback: (turn: boolean) => void) => {
                if (eventName === 'turnSwitched') {
                    callback(true);
                }
            },
        } as unknown as Socket;

        service.receiveNewTurn();
        expect(service.isTurn).toEqual(true);
    });

    it('should restart the timer when receiving event from server', () => {
        spyOn(service['endGameService'], 'checkEndGame');
        service['clientSocket'].socket = {
            on: (eventName: string, callback: () => void) => {
                if (eventName === 'startTimer') {
                    callback();
                }
            },
        } as unknown as Socket;
        spyOn(service, 'stopTimer');
        spyOn(service, 'startTimer');
        service.receiveStartFromServer();
        expect(service.stopTimer).toHaveBeenCalled();
        expect(service.startTimer).toHaveBeenCalled();
    });

    it('should stop', () => {
        spyOn(service['endGameService'], 'checkEndGame');
        service['clientSocket'].socket = {
            on: (eventName: string, callback: () => void) => {
                if (eventName === 'stopTimer') {
                    callback();
                }
            },
        } as unknown as Socket;
        spyOn(service, 'stopTimer');
        service.receiveStopFromServer();
        expect(service.stopTimer).toHaveBeenCalled();
    });

    it('should get the newTurn from the server', () => {
        spyOn(service['endGameService'], 'checkEndGame');
        service['clientSocket'].socket = {
            on: (eventName: string, callback: (turn: boolean) => void) => {
                if (eventName === 'turnSwitched') {
                    callback(true);
                }
            },
        } as unknown as Socket;

        service.receiveNewTurn();
        expect(service.isTurn).toEqual(true);
    });

    it('should get the newTurn from the server', () => {
        spyOn(service['endGameService'], 'checkEndGame');
        service['clientSocket'].socket = {
            on: (eventName: string, callback: () => void) => {
                if (eventName === 'startTimer') {
                    callback();
                }
            },
        } as unknown as Socket;
        spyOn(service, 'stopTimer');
        spyOn(service, 'startTimer');
        service.receiveStartFromServer();
        expect(service.stopTimer).toHaveBeenCalled();
        expect(service.startTimer).toHaveBeenCalled();
    });

    it('should get the newTurn from the server', () => {
        spyOn(service['endGameService'], 'checkEndGame');
        service['clientSocket'].socket = {
            on: (eventName: string, callback: () => void) => {
                if (eventName === 'startTimer') {
                    callback();
                }
            },
        } as unknown as Socket;
        spyOn(service, 'stopTimer');
        spyOn(service, 'startTimer');
        service.receiveStartFromServer();
        expect(service.stopTimer).toHaveBeenCalled();
        expect(service.startTimer).toHaveBeenCalled();
    });

    it('should stopTimer when switching turn', () => {
        spyOn(service['endGameService'], 'checkEndGame');
        spyOn(service, 'checkEndGame');
        service['endGameService'].isEndGame = false;
        const spy = spyOn(service, 'stopTimer');
        service.switchTurn();
        expect(spy).toHaveBeenCalled();
    });

    it('should startTimer when switching turns', () => {
        spyOn(service['endGameService'], 'checkEndGame');
        spyOn(service, 'checkEndGame');
        gameSettingsService.isSoloMode = true;
        service.isTurn = false;
        const newTurn = true;
        service['endGameService'].isEndGame = false;
        const spyStart = spyOn(service, 'startTimer');
        service.switchTurn();
        jasmine.clock().tick(THREE_SECONDS_DELAY + 1);
        jasmine.clock().tick(ONE_SECOND_DELAY);
        expect(service.isTurn).toEqual(newTurn);
        expect(spyStart).toHaveBeenCalled();
    });

    it('should startTimer when switching when in multiplayer mode', () => {
        spyOn(service['endGameService'], 'checkEndGame');
        spyOn(service, 'checkEndGame');
        gameSettingsService.isSoloMode = false;
        service.isTurn = true;
        const newTurn = false;
        service['endGameService'].isEndGame = false;
        service.switchTurn();
        jasmine.clock().tick(THREE_SECONDS_DELAY + 1);
        expect(service.isTurn).toEqual(newTurn);
    });

    it('should startTimer when switching turns 2', () => {
        spyOn(service, 'checkEndGame');
        spyOn(service['endGameService'], 'checkEndGame');
        const player1 = new Player(1, 'mike', [letterA]);
        const player2 = new PlayerAI(2, 'agha', [letterA], playerService);
        service['playerService'].players.push(player1);
        service['playerService'].players.push(player2);
        gameSettingsService.isSoloMode = true;
        service.isTurn = true;
        const newTurn = false;
        const spyPlay = spyOn(player2, 'play');
        service['endGameService'].isEndGame = false;
        const spyStart = spyOn(service, 'startTimer');
        service.switchTurn();
        jasmine.clock().tick(THREE_SECONDS_DELAY + 1);
        jasmine.clock().tick(DELAY_BEFORE_PLAYING + 1);
        expect(service.isTurn).toEqual(newTurn);
        expect(spyStart).toHaveBeenCalled();
        expect(spyPlay).toHaveBeenCalledTimes(1);
    });

    it('should decrease the countdown', () => {
        spyOn(service['endGameService'], 'checkEndGame');
        gameSettingsService.gameSettings.timeMinute = '00';
        gameSettingsService.gameSettings.timeSecond = '59';
        service['endGameService'].isEndGame = false;
        service.startTimer();
        jasmine.clock().tick(ONE_SECOND_DELAY + 1);
        expect(service['minutes']).toEqual(0);
        expect(service['seconds']).toEqual(58);
    });

    it('should clearInterval when stopping timer', () => {
        spyOn(service['endGameService'], 'checkEndGame');
        service.stopTimer();
        expect(service['minutes']).toEqual(0);
        expect(service['seconds']).toEqual(0);
    });

    it('adapt time output to correct value when when only seconds input is 0', () => {
        spyOn(service['endGameService'], 'checkEndGame');
        gameSettingsService.gameSettings.timeMinute = '05';
        gameSettingsService.gameSettings.timeSecond = '00';
        service['endGameService'].isEndGame = false;
        service.startTimer();
        jasmine.clock().tick(ONE_SECOND_DELAY + 1);
        expect(service['seconds']).toEqual(59);
        expect(service['minutes']).toEqual(4);
    });

    it('should do nothing when it is an endgame', () => {
        spyOn(service['endGameService'], 'checkEndGame');
        service['endGameService'].isEndGame = true;
        service.isTurn = false;
        const newTurn = false;
        service.switchTurn();
        expect(service.isTurn).toEqual(newTurn);
    });

    it('should stop the timer and then switch turn when the countdown is done ', () => {
        spyOn(service['endGameService'], 'checkEndGame');
        spyOn(service, 'checkEndGame');
        spyOn(service, 'updateActiveTime');
        service['endGameService'].actionsLog = [];
        service.gameSettingsService.gameSettings.timeMinute = '00';
        service.gameSettingsService.gameSettings.timeSecond = '00';
        service['endGameService'].isEndGame = false;
        service.isTurn = true;
        const spyOnStop = spyOn(service, 'stopTimer');
        const spyOnSwitch = spyOn(service, 'switchTurn').and.callThrough();
        service.startTimer();
        jasmine.clock().tick(ONE_SECOND_DELAY + 1);
        expect(spyOnStop).toHaveBeenCalled();
        expect(spyOnSwitch).toHaveBeenCalled();
    });

    it('should not switch the turn if it is not my turn when the countdown is done ', () => {
        spyOn(service['endGameService'], 'checkEndGame');
        service.gameSettingsService.gameSettings.timeMinute = '00';
        service.gameSettingsService.gameSettings.timeSecond = '00';
        service['endGameService'].isEndGame = false;
        service.isTurn = false;
        const spyOnStop = spyOn(service, 'stopTimer');
        const spyOnSwitch = spyOn(service, 'switchTurn').and.callThrough();
        service.startTimer();
        jasmine.clock().tick(ONE_SECOND_DELAY + 1);
        expect(spyOnStop).toHaveBeenCalledTimes(0);
        expect(spyOnSwitch).toHaveBeenCalledTimes(0);
    });

    it('should not update the active time if the turn is false', () => {
        spyOn(service['endGameService'], 'checkEndGame');
        service['objectivesService'].activeTimeRemaining[0] = 60;
        service.isTurn = false;
        service.updateActiveTime();
        expect(service['objectivesService'].activeTimeRemaining[0]).toEqual(60);
    });

    it('should update the active time if the turn is true', () => {
        spyOn(service['endGameService'], 'checkEndGame');
        service['objectivesService'].activeTimeRemaining[0] = 60;
        service.isTurn = true;
        service.updateActiveTime();
        expect(service['objectivesService'].activeTimeRemaining[0]).not.toEqual(60);
    });

    it('isEndGame while we are in end game should call stopTimer', () => {
        const player1 = new Player(1, 'mike', [letterA]);
        service['playerService'].players.push(player1);
        spyOn(service['endGameService'], 'getFinalScore');
        spyOn(service, 'stopTimer');
        spyOn(service['sendMessageService'], 'displayFinalMessage');
        service['endGameService'].isEndGameByGiveUp = true;
        service.checkEndGame();
        expect(service.stopTimer).toHaveBeenCalled();
    });
});
