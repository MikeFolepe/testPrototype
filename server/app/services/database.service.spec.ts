/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-empty */
/* eslint-disable dot-notation */
import { AI_MODELS, SCORES_MODEL } from '@app/classes/database.schema';
import { AiPlayer, AiType } from '@common/ai-name';
import { GameType } from '@common/game-type';
import { PlayerScore } from '@common/player';
import * as chai from 'chai';
import { expect } from 'chai';
import * as spies from 'chai-spies';
import { MongoMemoryServer } from 'mongodb-memory-server';
import * as mongoose from 'mongoose';
import * as sinon from 'sinon';
import { DatabaseService } from './database.service';

describe('Database service', () => {
    let databaseService: DatabaseService;
    let mongoServer: MongoMemoryServer;
    let mongoUri: string;
    chai.use(spies);
    beforeEach(async () => {
        databaseService = new DatabaseService();
        mongoServer = await MongoMemoryServer.create();
        mongoUri = mongoServer.getUri();
    });
    afterEach(async () => {
        if (databaseService.database.connection.readyState) {
            await databaseService.closeConnection();
        }
    });

    it('start(): should not connect to the database when start is called with wrong URL', async () => {
        try {
            await databaseService.start('WRONG URL');
        } catch {}
        expect(databaseService.database.connection.readyState).to.equal(0);
    });

    it('start(): should connect to the database when start is called', async () => {
        const spy = sinon.stub(databaseService, 'setDefaultData').returns(Promise.resolve());
        const spy2 = sinon.stub(databaseService, 'setDefaultScores').returns(Promise.resolve());
        await databaseService.start();
        expect(spy.called).to.equal(true);
        expect(spy2.called).to.equal(true);
        expect(databaseService.database.connection.readyState).to.equal(1);
        spy.restore();
        spy2.restore();
    });

    it('should set default data when starting', async () => {
        const aiModel = AI_MODELS.get(AiType.beginner) as mongoose.Model<AiPlayer>;
        const player = new aiModel({
            aiName: 'Mike',
            isDefault: true,
        });
        player.save();
        const spy = chai.spy.on(aiModel, 'deleteMany');
        databaseService.start(mongoUri);
        databaseService.setDefaultData(AiType.beginner).then();
        expect(spy).to.have.been.called();
        chai.spy.restore(aiModel);
    });

    it('should set default data when starting', async () => {
        const aiModel = AI_MODELS.get(AiType.beginner) as mongoose.Model<AiPlayer>;
        const player = new aiModel({
            aiName: 'Mike',
            isDefault: true,
        });
        player.save();
        const spy = chai.spy.on(aiModel, 'deleteMany');
        await databaseService.start(mongoUri);
        await databaseService.setDefaultData(AiType.beginner);
        expect(spy).to.have.been.called();
        chai.spy.restore(aiModel);
    });

    it('should set default data when starting', async () => {
        const scoresModel = SCORES_MODEL.get(GameType.Classic) as mongoose.Model<PlayerScore>;
        const scoreToAdd = new scoresModel({
            score: 10,
            playerName: 'mike',
            isDefault: true,
        });
        scoreToAdd.save();
        const spy = chai.spy.on(scoresModel, 'deleteMany');
        await databaseService.start(mongoUri);
        await databaseService.setDefaultScores(GameType.Classic);
        expect(spy).to.have.been.called();
        chai.spy.restore(scoresModel);
    });
});
