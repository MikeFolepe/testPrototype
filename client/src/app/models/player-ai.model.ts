import { PlayerAIService } from '@app/services/player-ai.service';
import { Letter } from '@common/letter';
import { PlaceLetterStrategy } from './place-letter-strategy.model';
import { Player } from './player.model';

export class PlayerAI extends Player {
    private strategy: PlaceLetterStrategy;

    constructor(id: number, name: string, letterTable: Letter[], public playerAiService: PlayerAIService, score: number = 0) {
        super(id, name, letterTable, score);
        this.strategy = new PlaceLetterStrategy();
    }

    play(): void {
        this.strategy.execute(this.playerAiService);
    }

    getEasel(): string {
        let hand = '[';
        for (const letter of this.letterTable) {
            hand += letter.value;
        }

        return hand + ']';
    }

    getLetterQuantityInEasel(character: string): number {
        let quantity = 0;

        for (const letter of this.letterTable) if (letter.value === character.toUpperCase()) quantity++;

        return quantity;
    }
}
