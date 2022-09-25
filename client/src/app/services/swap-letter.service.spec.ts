/* eslint-disable dot-notation */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { PLAYER_ONE_INDEX, RESERVE } from '@app/classes/constants';
import { Player } from '@app/models/player.model';
import { SwapLetterService } from '@app/services/swap-letter.service';
import { Letter } from '@common/letter';

describe('SwapLetterService', () => {
    let service: SwapLetterService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterTestingModule],
        });
        service = TestBed.inject(SwapLetterService);

        const letterA: Letter = RESERVE[0];
        const letterB: Letter = RESERVE[1];
        const letterC: Letter = RESERVE[2];
        const letterD: Letter = RESERVE[3];
        const letterE: Letter = RESERVE[4];
        const letterWhite: Letter = RESERVE[26];

        const playerEasel = [letterA, letterA, letterB, letterC, letterD, letterE, letterWhite];
        const player = new Player(1, 'Player 1', playerEasel);
        service['playerService'].addPlayer(player);
        service['letterService'].reserve = JSON.parse(JSON.stringify(RESERVE));

        spyOn(service['playerService'], 'swap');
        spyOn(service['playerService'], 'addEaselLetterToReserve');
        spyOn(service['sendMessageService'], 'displayMessageByType');
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('reserve should have enough letters to swap', () => {
        expect(service['reserveHasEnoughLetters']()).toBeTrue();
    });

    it('an empty reserve should not have enough letters to swap', () => {
        const initReserveSize: number = service['letterService'].reserveSize;
        // Emptying the reserve
        for (let i = 0; i < initReserveSize; i++) {
            service['letterService'].getRandomLetter();
        }
        expect(service['reserveHasEnoughLetters']()).toBeFalse();
    });

    it('swapping letters present in the easel should be valid', () => {
        const lettersToSwap = 'abcde';
        expect(service.swapCommand(lettersToSwap, PLAYER_ONE_INDEX)).toEqual(true);
    });

    it('swapping letters that are not present in the easel should be invalid', () => {
        const lettersToSwap = 'zzzzzzz';
        expect(service.swapCommand(lettersToSwap, PLAYER_ONE_INDEX)).toEqual(false);
    });

    it('swapping two elements of the easel that are the same letter should be valid', () => {
        const lettersToSwap = 'aa';
        expect(service.swapCommand(lettersToSwap, PLAYER_ONE_INDEX)).toEqual(true);
    });

    it('swapping the same letter more times than it is present in the easel should be invalid', () => {
        const lettersToSwap = 'aaa';
        expect(service.swapCommand(lettersToSwap, PLAYER_ONE_INDEX)).toEqual(false);
    });
});
