/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable no-empty */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable dot-notation */

import { SCORES_MODEL } from '@app/classes/database.schema';
import { DatabaseServiceMock } from '@app/classes/database.service.mock';
import { GameType } from '@common/game-type';
import { PlayerScore } from '@common/player';
import * as chai from 'chai';
import { expect } from 'chai';
import * as spies from 'chai-spies';
import * as mongoose from 'mongoose';
import { BestScoresService } from './best-scores.service';

describe('BestScoresService', () => {
    let databaseService: DatabaseServiceMock;
    let bestScoresService: BestScoresService;

    chai.use(spies);
    const playersScoresStub: PlayerScore[] = [
        {
            score: 15,
            playerName: 'JoelleTest2',
            isDefault: false,
        },
        {
            score: 20,
            playerName: 'JojoTest2',
            isDefault: false,
        },
    ];

    beforeEach(async () => {
        bestScoresService = new BestScoresService();
        databaseService = new DatabaseServiceMock();
        await databaseService.start();
        const scoresModel = SCORES_MODEL.get(GameType.Classic) as mongoose.Model<PlayerScore>;
        for (const player of playersScoresStub) {
            const playerScore = new scoresModel(player);
            await playerScore.save();
        }
    });

    afterEach(async () => {
        await databaseService.closeConnection();
    });

    it('should not add if the ', async () => {
        const scoresModel = SCORES_MODEL.get(GameType.Classic) as mongoose.Model<PlayerScore>;
        await bestScoresService.addPlayers(playersScoresStub, GameType.Classic);
        const results: PlayerScore[] = await scoresModel.find({}).exec();
        expect(results[0].score).to.equal(playersScoresStub[0].score);
        expect(results[0].playerName).to.equal(playersScoresStub[0].playerName);
    });

    it('should add the players to the database', async () => {
        const scoresModel = SCORES_MODEL.get(GameType.Classic) as mongoose.Model<PlayerScore>;
        const player: PlayerScore[] = [
            {
                score: 10,
                playerName: 'mike',
                isDefault: false,
            },
        ];
        await bestScoresService.addPlayers(player, GameType.Classic);
        const results: PlayerScore[] = await scoresModel.find({}).exec();
        expect(results[2].score).to.equal(player[0].score);
        scoresModel.findOneAndDelete({ playerName: 'mike' });
    });

    it('should return the best players in  the correct order', async () => {
        const results: PlayerScore[] = await bestScoresService.getBestPlayers(GameType.Classic);
        expect(results[0].score).to.equal(playersScoresStub[1].score);
        expect(results[0].playerName).to.equal(playersScoresStub[1].playerName);
        expect(results[0].isDefault).to.equal(playersScoresStub[1].isDefault);
    });
});
