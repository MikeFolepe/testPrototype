import { Injectable } from '@angular/core';
import { BONUS_POSITIONS } from '@app/classes/constants';

@Injectable({
    providedIn: 'root',
})
export class RandomBonusesService {
    bonusPositions: Map<string, string>;
    constructor() {
        this.bonusPositions = new Map<string, string>(BONUS_POSITIONS);
    }

    // Put all the values of the bonus map into an array, then randomly shuffle this array's elements
    shuffleBonuses(): string[] {
        const bonuses = Array.from(this.bonusPositions.values());
        for (let currentBonusIndex = bonuses.length - 1; currentBonusIndex > 0; currentBonusIndex--) {
            const randomIndex = Math.floor(Math.random() * (currentBonusIndex + 1));
            [bonuses[currentBonusIndex], bonuses[randomIndex]] = [bonuses[randomIndex], bonuses[currentBonusIndex]];
        }
        return bonuses;
    }

    // Put into the bonus map the shuffled values obtained from the array of bonuses made in the previous method.
    shuffleBonusPositions(): Map<string, string> {
        const bonuses = this.shuffleBonuses();
        this.bonusPositions.forEach((bonus: string, position: string) => {
            this.bonusPositions.set(position, bonuses.pop() as string);
        });
        return this.bonusPositions;
    }
}
