/* eslint-disable dot-notation */
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { GameViewComponent } from '@app/modules/game-view/game-view/game-view.component';
import { ClientSocketService } from '@app/services/client-socket.service';
import { AiType } from '@common/ai-name';
import { GameSettings } from '@common/game-settings';
import { Socket } from 'socket.io-client';

describe('ClientSocketService', () => {
    let service: ClientSocketService;
    let router: jasmine.SpyObj<Router>;
    RouterTestingModule.withRoutes([{ path: 'game', component: GameViewComponent }]);

    beforeEach(async () => {
        RouterTestingModule.withRoutes([{ path: 'game', component: GameViewComponent }]);
        router = jasmine.createSpyObj('Router', ['navigate']);
        await TestBed.configureTestingModule({
            providers: [{ provide: Router, useValue: router }],
        }).compileComponents();

        service = TestBed.inject(ClientSocketService);
        router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    });

    it('should navigate to game page on goToGameView event', () => {
        service.socket = {
            on: (eventName: string, callback: () => void) => {
                if (eventName === 'goToGameView') {
                    callback();
                }
            },
        } as unknown as Socket;
        service.routeToGameView();
        expect(router.navigate).toHaveBeenCalledWith(['game']);
    });

    it('should initialize roomId with argument', () => {
        service.socket = {
            on: (eventName: string, callback: (roomIdFromServer: string) => void) => {
                if (eventName === 'yourRoomId') {
                    callback('fakeId');
                }
            },
        } as unknown as Socket;
        service.initializeRoomId();
        expect(service.roomId).toEqual('fakeId');
    });

    it('should initialize gameSettings of gameSettingsService with argument', () => {
        const settings: GameSettings = new GameSettings(
            ['Paul', 'Mike'],
            1,
            '00',
            '30',
            AiType.beginner,
            'Désactiver',
            "[['A1', 'doubleLetter'], ['A8', 'tripleLetter']]",
            '',
        );
        service.socket = {
            on: (eventName: string, callback: (gameSettings: GameSettings) => void) => {
                if (eventName === 'yourGameSettings') {
                    callback(settings);
                }
            },
        } as unknown as Socket;
        service.initializeGameSettings();
        expect(service['gameSettingsService'].gameSettings).toEqual(settings);
    });
});
