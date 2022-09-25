/* eslint-disable dot-notation */
import { HttpClientModule } from '@angular/common/http';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';

describe('MainPageComponent', () => {
    let component: MainPageComponent;
    let fixture: ComponentFixture<MainPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HttpClientModule, RouterTestingModule, MatDialogModule],
            declarations: [MainPageComponent],
            providers: [
                {
                    provide: MatSnackBar,
                    useValue: {},
                },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(MainPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should route to solo-game-ia when selected mode is solo', () => {
        const spyNavigate = spyOn(component['router'], 'navigate');

        component.selectedGameMode = 'Jouer une partie en solo';
        component.routeToGameMode();
        expect(component.gameSettingsService.isSoloMode).toBeTrue();
        expect(spyNavigate).toHaveBeenCalledOnceWith(['solo-game-ai']);
    });

    it('should route to multiplayer-mode when selected mode is multiplayer', () => {
        const spyNavigate = spyOn(component['router'], 'navigate');

        component.selectedGameMode = 'Créer une partie multijoueur';
        component.routeToGameMode();
        expect(component.gameSettingsService.isSoloMode).toBeFalse();
        expect(spyNavigate).toHaveBeenCalledWith(['multiplayer-mode']);

        component.selectedGameMode = 'Joindre une partie multijoueur';
        component.routeToGameMode();
        expect(spyNavigate).toHaveBeenCalledWith(['multiplayer-mode']);
    });

    it('should route to join-room when selected mode is join multiplayer', () => {
        const spyNavigate = spyOn(component['router'], 'navigate');

        component.selectedGameMode = 'Joindre une partie multijoueur';
        component.routeToGameMode();
        expect(spyNavigate).toHaveBeenCalledWith(['join-room']);
    });

    it('should set the game type as scrabble classique', () => {
        component.selectedGameType = component.gameType[0];
        component.routeToGameMode();
        expect(component.gameSettingsService.gameType).toEqual(0);
    });

    it('should set the game type as scrabble Log2990', () => {
        component.selectedGameType = component.gameType[1];
        component.selectedGameTypeIndex = 1;
        component.routeToGameMode();
        expect(component.gameSettingsService.gameType).toEqual(1);
    });

    it('should open dialog when openBestScoresDialog is called', () => {
        const openDialog = spyOn(component.bestScoresDialog, 'open');
        component.openBestScoresDialog();
        expect(openDialog).toHaveBeenCalledTimes(1);
    });
});
