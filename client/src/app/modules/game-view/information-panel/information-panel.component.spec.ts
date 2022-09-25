/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable dot-notation */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { PLAYER_AI_INDEX, PLAYER_TWO_INDEX, RESERVE } from '@app/classes/constants';
import { PlayerAI } from '@app/models/player-ai.model';
import { Player } from '@app/models/player.model';
import { SkipTurnService } from '@app/services/skip-turn.service';
import { AiType } from '@common/ai-name';
import { GameSettings } from '@common/game-settings';
import { Letter } from '@common/letter';
import { Socket } from 'socket.io-client';
import { InformationPanelComponent } from './information-panel.component';
describe('InformationPanelComponent', () => {
    let component: InformationPanelComponent;
    let fixture: ComponentFixture<InformationPanelComponent>;
    let skipTurnSpy: jasmine.SpyObj<SkipTurnService>;

    beforeEach(() => {
        skipTurnSpy = jasmine.createSpyObj('SkipTurnService', ['startTimer', 'stopTimer']);
    });

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [InformationPanelComponent],
            providers: [{ provide: SkipTurnService, useValue: skipTurnSpy }],
            imports: [HttpClientTestingModule, RouterTestingModule],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(InformationPanelComponent);
        component = fixture.componentInstance;
        component['gameSettingsService'].gameSettings = new GameSettings(
            ['Paul', 'Mike'],
            1,
            '00',
            '30',
            AiType.beginner,
            'Désactiver',
            "[['A1', 'doubleLetter'], ['A4', 'tripleLetter']]",
            '',
        );
        fixture.detectChanges();
        component['playerService'].players = [];
        jasmine.clock().install();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    afterEach(() => {
        jasmine.clock().uninstall();
    });

    it('should call clearPlayers on Destroy', () => {
        spyOn(component.playerService, 'clearPlayers');
        component.ngOnDestroy();
        expect(component.playerService.clearPlayers).toHaveBeenCalled();
        expect(skipTurnSpy.stopTimer).toHaveBeenCalled();
    });

    it('the emit receiveRoomMessage should call sendOpponentMessage', () => {
        const lettersReceived = [RESERVE[0], RESERVE[1], RESERVE[2]];
        const letterA = RESERVE[0];
        const letterB = RESERVE[1];
        const player1 = new Player(1, 'Player 1', [letterA]);
        const player2 = new Player(1, 'Player 1', [letterA, letterB, RESERVE[2]]);
        component['playerService'].players.push(player1);
        component['playerService'].players.push(player2);
        component['clientSocketService'].socket = {
            // eslint-disable-next-line no-unused-vars
            on: (eventName: string, callback: (letterTable: Letter[]) => void) => {
                if (eventName === 'receivePlayerTwo') {
                    callback(lettersReceived);
                }
            },
        } as unknown as Socket;
        spyOn(component['letterService'], 'removeLettersFromReserve');
        spyOn(component['playerService'], 'addPlayer');
        component.receivePlayerTwo();
        expect(component['playerService'].players[PLAYER_TWO_INDEX].letterTable).toEqual(lettersReceived);
        expect(component['playerService'].addPlayer).not.toHaveBeenCalled();
        expect(component['letterService'].removeLettersFromReserve).toHaveBeenCalledTimes(0);
    });

    it('the emit receiveRoomMessage should call sendOpponentMessage and no add Player', () => {
        const lettersReceived = [RESERVE[0], RESERVE[1], RESERVE[2]];
        const letterA = RESERVE[0];
        const letterB = RESERVE[1];
        const player1 = new Player(1, 'Player 1', [letterA]);
        const player2 = new Player(1, 'Player 1', [letterA, letterB, RESERVE[2]]);
        component['playerService'].players.push(player1);
        component['playerService'].players.push(player2);
        component['playerService'].players.push(player2);

        component['clientSocketService'].socket = {
            // eslint-disable-next-line no-unused-vars
            on: (eventName: string, callback: (letterTable: Letter[]) => void) => {
                if (eventName === 'receivePlayerTwo') {
                    callback(lettersReceived);
                }
            },
        } as unknown as Socket;
        spyOn(component['letterService'], 'removeLettersFromReserve');
        spyOn(component['playerService'], 'addPlayer');
        component.receivePlayerTwo();
        expect(component['playerService'].players[PLAYER_TWO_INDEX].letterTable).toEqual(lettersReceived);
        expect(component['playerService'].addPlayer).not.toHaveBeenCalled();
        expect(component['letterService'].removeLettersFromReserve).toHaveBeenCalledTimes(0);
    });
    it('the emit receiveRoomMessage should call sendOpponentMessage and add Player if the size is under 2', () => {
        const lettersReceived = [RESERVE[0], RESERVE[1], RESERVE[2]];
        const letterA = RESERVE[0];
        const player1 = new Player(1, 'Player 1', [letterA]);
        component['playerService'].players.push(player1);

        component['clientSocketService'].socket = {
            // eslint-disable-next-line no-unused-vars
            on: (eventName: string, callback: (letterTable: Letter[]) => void) => {
                if (eventName === 'receivePlayerTwo') {
                    callback(lettersReceived);
                }
            },
        } as unknown as Socket;
        spyOn(component['letterService'], 'removeLettersFromReserve');
        spyOn(component['playerService'], 'addPlayer');
        component.receivePlayerTwo();
        expect(component['playerService'].addPlayer).toHaveBeenCalled();
        expect(component['letterService'].removeLettersFromReserve).toHaveBeenCalled();
    });

    it('initializing players while on solo mode should add the AI player', () => {
        component['gameSettingsService'].isSoloMode = true;
        component['playerService'].players = [];
        component.initializePlayers();
        expect(component['playerService'].players[PLAYER_AI_INDEX].name).toEqual('Mike');
    });

    it('initializing players while on solo mode should add the AI player and add it if the size is under 2', () => {
        const letterA = RESERVE[0];
        component['gameSettingsService'].isSoloMode = true;
        component['playerService'].players = [];
        const player1 = new Player(1, 'Player 1', [letterA]);
        component['playerService'].players.push(player1);
        spyOn(component['playerService'], 'addPlayer');
        component.initializePlayers();
        expect(component['playerService'].addPlayer).toHaveBeenCalledTimes(2);
    });
    it('should not call the AI player if the turn is true', () => {
        component.skipTurnService.isTurn = true;
        component.gameSettingsService.isSoloMode = true;

        const letterA = RESERVE[0];
        const letterB = RESERVE[1];
        const player = new Player(1, 'Player 1', [letterA]);
        const playerAI = new PlayerAI(2, 'Player AI', [letterB], component.playerAiService);
        component['playerService'].players.push(player);
        component['playerService'].players.push(playerAI);

        const spyPlay = spyOn(playerAI, 'play');
        component.callThePlayerAiOnItsTurn();
        jasmine.clock().tick(4000);
        expect(spyPlay).not.toHaveBeenCalled();
    });
    it('should  call the AI player if the turn is false', () => {
        component.skipTurnService.isTurn = false;
        component.gameSettingsService.isSoloMode = true;

        const letterA = RESERVE[0];
        const letterB = RESERVE[1];
        const player = new Player(1, 'Player 1', [letterA]);
        const playerAI = new PlayerAI(2, 'Player AI', [letterB], component.playerAiService);
        const spyPlay = spyOn(playerAI, 'play');
        component['playerService'].players.push(player);
        component['playerService'].players.push(playerAI);

        component.callThePlayerAiOnItsTurn();
        jasmine.clock().tick(4000);
        expect(spyPlay).toHaveBeenCalled();
    });

    it('should  display the seconds if the variable is higher than BIGGER_NUMBER_ONE_DIGIT', () => {
        component['skipTurnService'].seconds = 10;
        const time: string = component['skipTurnService'].seconds.toString();
        expect(component.displaySeconds()).toEqual(time);
    });

    it('should  display the formatted seconds if the variable is lower than BIGGER_NUMBER_ONE_DIGIT', () => {
        component['skipTurnService'].seconds = 8;
        const time: string = component['skipTurnService'].seconds.toString();
        expect(component.displaySeconds()).toEqual('0' + time);
    });
});
