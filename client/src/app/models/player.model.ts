import { Letter } from '@common/letter';

export class Player {
    score: number;
    constructor(public id: number, public name: string, public letterTable: Letter[], score: number = 0) {
        this.score = score;
    }
}
