import { TestBed } from '@angular/core/testing';
import { RandomBonusesService } from '@app/services/random-bonuses.service';

describe('RandomBonusesService', () => {
    let service: RandomBonusesService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(RandomBonusesService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return an array of all bonuses values with right quantities and a different other from initial one', () => {
        const bonuses = service.shuffleBonuses();
        const bonusLength = bonuses.length;
        expect(bonusLength).toEqual(service.bonusPositions.size);
        expect(bonuses).not.toEqual(Array.from(service.bonusPositions.values()));
    });

    it('should return a map of all bonuses values shuffled', () => {
        const unshuffledBonuses = new Map<string, string>(service.bonusPositions);
        service.shuffleBonusPositions();
        const shuffledBonuses = new Map<string, string>(service.bonusPositions);
        expect(shuffledBonuses).not.toEqual(unshuffledBonuses);
        expect(shuffledBonuses.size).toEqual(unshuffledBonuses.size);
    });
});
