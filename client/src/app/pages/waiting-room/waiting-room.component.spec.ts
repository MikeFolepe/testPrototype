/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { AiType } from '@common/ai-name';
import { GameSettings } from '@common/game-settings';
import { WaitingRoomComponent } from './waiting-room.component';

describe('WaitingRoomComponent', () => {
    let component: WaitingRoomComponent;
    let fixture: ComponentFixture<WaitingRoomComponent>;
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [WaitingRoomComponent],
            imports: [RouterTestingModule, HttpClientTestingModule],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(WaitingRoomComponent);
        component = fixture.componentInstance;
        spyOn(component['router'], 'navigate');
        spyOn(component['clientSocket'].socket, 'connect');
        spyOn(component['clientSocket'].socket, 'on');
        spyOn(component['clientSocket'].socket, 'disconnect');
        fixture.detectChanges();
    });

    it('should redirect to home page if the Owner name is empty', () => {
        jasmine.clock().install();

        component['gameSettingsService'].gameSettings = new GameSettings(['', ''], 1, '01', '00', AiType.beginner, 'Activer', 'francais', '');
        component.handleReloadErrors();
        jasmine.clock().tick(6000);
        expect(component.status).toEqual('Une erreur est survenue');
        expect(component['router'].navigate).toHaveBeenCalledWith(['home']);
        jasmine.clock().uninstall();
    });

    it('should not redirect to home page if the Owner name is not empty', () => {
        jasmine.clock().install();
        component.status = 'test';
        component['gameSettingsService'].gameSettings = new GameSettings(['Mike', ''], 1, '01', '00', AiType.beginner, 'Activer', 'francais', '');
        component.handleReloadErrors();
        jasmine.clock().tick(4000);
        expect(component.status).toEqual('test');
        jasmine.clock().uninstall();
    });

    it('should set the message after the time out', () => {
        jasmine.clock().install();
        component.waitBeforeChangeStatus(1000, '');
        jasmine.clock().tick(4000);
        expect(component.status).toEqual('');
        jasmine.clock().uninstall();
    });

    it('should route the user a the view on init', () => {
        jasmine.clock().install();
        component['gameSettingsService'].gameSettings = new GameSettings(['Mike', ''], 1, '01', '00', AiType.beginner, 'Activer', 'null', '');
        component['gameSettingsService'].isRedirectedFromMultiplayerGame = false;
        component['gameSettingsService'].isSoloMode = false;
        component.routeToGameView();
        jasmine.clock().tick(4000);
        expect(component['gameSettingsService'].isRedirectedFromMultiplayerGame).toEqual(true);
        expect(component['gameSettingsService'].isSoloMode).toEqual(true);
        expect(component['router'].navigate).toHaveBeenCalledWith(['solo-game-ai']);
        jasmine.clock().uninstall();
    });

    it('should play the animation on waiting page ', () => {
        jasmine.clock().install();
        const spy1 = spyOn(component, 'waitBeforeChangeStatus');
        const spy2 = spyOn(component, 'handleReloadErrors');
        component['clientSocket'].socket.connected = true;
        component.playAnimation();
        jasmine.clock().tick(5000);
        expect(spy1).toHaveBeenCalled();
        expect(spy2).toHaveBeenCalled();
        jasmine.clock().uninstall();
    });

    it('should not play the animation on waiting page if the connection fails ', () => {
        jasmine.clock().install();
        spyOn(component, 'waitBeforeChangeStatus');
        spyOn(component, 'handleReloadErrors');
        component['clientSocket'].socket.connected = false;

        component.playAnimation();
        jasmine.clock().tick(5000);
        expect(component.status).toEqual('Erreur de connexion... Veuillez réessayer');
        jasmine.clock().uninstall();
    });
});
