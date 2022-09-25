/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialogRef } from '@angular/material/dialog';
import { of } from 'rxjs';
import { BestScoresComponent } from './best-scores.component';
import { PlayerScore } from '@common/player';

describe('BestScoresComponent', () => {
    let component: BestScoresComponent;
    let fixture: ComponentFixture<BestScoresComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [BestScoresComponent],
            providers: [
                {
                    provide: MatDialogRef,
                    useValue: {},
                },
            ],
            imports: [HttpClientTestingModule],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(BestScoresComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load scores', () => {
        const score1: PlayerScore = { score: 10, playerName: 'test1', isDefault: false };
        const score2: PlayerScore = { score: 20, playerName: 'test2', isDefault: false };
        const score3: PlayerScore = { score: 30, playerName: 'test3', isDefault: false };
        const score4: PlayerScore = { score: 40, playerName: 'test4', isDefault: false };
        const getPlayers = spyOn<any>(component['communicationService'], 'getBestPlayers').and.returnValues(
            of([score1, score2]),
            of([score3, score4]),
        );

        component.ngOnInit();

        expect(component.bestPlayersInClassicMode).toEqual([score1, score2]);
        expect(component.bestPlayersInLog2990Mode).toEqual([score3, score4]);
        expect(getPlayers).toHaveBeenCalledTimes(2);
    });
});
