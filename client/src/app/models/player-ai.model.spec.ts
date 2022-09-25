/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-magic-numbers */
import { LocationStrategy } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { MockLocationStrategy } from '@angular/common/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { PlayerAIService } from '@app/services/player-ai.service';
import { PlayerAI } from './player-ai.model';

describe('PlayerAI', () => {
    const letterTable = [
        { value: 'A', quantity: 0, points: 0, isSelectedForSwap: false, isSelectedForManipulation: false },
        { value: 'B', quantity: 0, points: 0, isSelectedForSwap: false, isSelectedForManipulation: false },
        { value: 'C', quantity: 0, points: 0, isSelectedForSwap: false, isSelectedForManipulation: false },
        { value: 'E', quantity: 0, points: 0, isSelectedForSwap: false, isSelectedForManipulation: false },
        { value: 'E', quantity: 0, points: 0, isSelectedForSwap: false, isSelectedForManipulation: false },
        { value: 'E', quantity: 0, points: 0, isSelectedForSwap: false, isSelectedForManipulation: false },
        { value: 'G', quantity: 0, points: 0, isSelectedForSwap: false, isSelectedForManipulation: false },
    ];
    let playerAi: PlayerAI;
    let playerAiService: PlayerAIService;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterTestingModule],
            providers: [{ provide: LocationStrategy, useClass: MockLocationStrategy }],
        }).compileComponents();
    });

    beforeEach(() => {
        playerAi = new PlayerAI(0, 'name', letterTable, playerAiService);
        playerAiService = TestBed.inject(PlayerAIService);
    });

    it('should create an instance', () => {
        expect(playerAi).toBeTruthy();
        expect(playerAiService).toBeTruthy();
        expect(playerAi['strategy']).toBeTruthy();
    });

    it('should call the right functions when calling play()', () => {
        const spyOnExecute = spyOn(playerAi['strategy'], 'execute');
        playerAi.play();
        expect(spyOnExecute).toHaveBeenCalledTimes(1);
    });

    it('should return playerHand formatted', () => {
        const playerHandFormatted = '[ABCEEEG]';
        expect(playerAi.getEasel()).toEqual(playerHandFormatted);
    });

    it('should return quantity of present letter', () => {
        expect(playerAi.getLetterQuantityInEasel('A')).toEqual(1);
    });

    it('should return quantity of no present letter', () => {
        expect(playerAi.getLetterQuantityInEasel('H')).toEqual(0);
    });

    it('should return quantity of multiple letter', () => {
        expect(playerAi.getLetterQuantityInEasel('E')).toEqual(3);
    });

    it('should return quantity of letter with case insensitivity', () => {
        expect(playerAi.getLetterQuantityInEasel('e')).toEqual(3);
    });
});
