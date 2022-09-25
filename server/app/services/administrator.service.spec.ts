/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
import { AI_BEGINNERS } from '@app/classes/constants';
import { AI_MODELS, SCORES_MODEL } from '@app/classes/database.schema';
import { DatabaseServiceMock } from '@app/classes/database.service.mock';
import { AiPlayer, AiPlayerDB, AiType } from '@common/ai-name';
import { Dictionary } from '@common/dictionary';
import { GameType } from '@common/game-type';
import { PlayerScore } from '@common/player';
import * as chai from 'chai';
import { expect } from 'chai';
import * as spies from 'chai-spies';
import * as fileSystem from 'fs';
import * as mongoose from 'mongoose';
import * as sinon from 'sinon';
import { AdministratorService } from './administrator.service';

describe('Admin service', () => {
    let databaseService: DatabaseServiceMock;
    let adminService: AdministratorService;

    chai.use(spies);
    beforeEach(async () => {
        adminService = new AdministratorService();
        databaseService = new DatabaseServiceMock();
    });

    afterEach(async () => {
        await databaseService.closeConnection();
    });

    it('should return the aiPlayers asked', (done) => {
        databaseService.start();
        const aiModel = AI_MODELS.get(AiType.beginner) as mongoose.Model<AiPlayer>;

        const spy = chai.spy.on(aiModel, 'find', () => {
            const player = new aiModel({
                aiName: 'Mike',
                isDefault: true,
            });
            player.save();

            // eslint-disable-next-line no-underscore-dangle
            return aiModel.findById(player._id);
        });
        adminService.getAllAiPlayers(AiType.beginner).then(() => {
            chai.expect(spy).to.have.been.called();
            chai.spy.restore(aiModel);
            done();
        });
    });

    it('should add the aiPlayers to the database', async () => {
        await databaseService.start();
        const player: AiPlayer = {
            aiName: 'Mike',
            isDefault: true,
        };
        const result = await adminService.addAiPlayer(player, AiType.beginner);
        expect(result.aiName).to.equal(player.aiName);
        expect(result.isDefault).to.equal(player.isDefault);
    });

    it('should update the aiPlayer from the database', async () => {
        await databaseService.start();
        const aiModel = AI_MODELS.get(AiType.beginner) as mongoose.Model<AiPlayer>;
        const players: AiPlayerDB[] = [];

        for (const aiPlayer of AI_BEGINNERS) {
            const player = new aiModel({
                aiName: aiPlayer.aiName,
                isDefault: aiPlayer.isDefault,
            });
            await player.save().then((results: AiPlayerDB) => {
                players.push(results);
            });
        }
        const beginner: AiPlayer = {
            aiName: 'Mike',
            isDefault: false,
        };
        const spy = sinon.spy(adminService, 'getAllAiPlayers');

        const result = await adminService.updateAiPlayer(players[0]._id, {
            aiBeginner: beginner,
            aiType: AiType.beginner,
        });
        expect(result[0].aiName).to.equal(beginner.aiName);
        expect(spy.calledWith(AiType.beginner)).to.equal(true);
        spy.restore();
    });

    it('should delete the aiPlayer from the database', async () => {
        await databaseService.start();
        const aiModel = AI_MODELS.get(AiType.beginner) as mongoose.Model<AiPlayer>;
        const players: AiPlayerDB[] = [];

        for (const aiPlayer of AI_BEGINNERS) {
            const player = new aiModel({
                aiName: aiPlayer.aiName,
                isDefault: aiPlayer.isDefault,
            });
            await player.save().then((results: AiPlayerDB) => {
                players.push(results);
            });
        }

        const spy = sinon.spy(adminService, 'getAllAiPlayers');
        const result = await adminService.deleteAiPlayer(players[0]._id, AiType.beginner);
        expect(result[0].aiName).to.equal(players[1].aiName);
        expect(result[0].isDefault).to.equal(players[1].isDefault);
        expect(spy.calledWith(AiType.beginner)).to.equal(true);
        spy.restore();
    });

    it('should return the dictionaries in the server ', () => {
        const jsonDictionary = `{
            "title": "Mon dictionnaire",
            "description": "Description de base",
            "words": [
                "aa",
                "aalenien",
                "aalenienne",
                "aaleniennes",
                "aaleniens"
            ]
        }`;
        const expectedResult = JSON.parse(jsonDictionary);
        const stubOnReadFile = sinon.stub(fileSystem, 'readFileSync').returns(jsonDictionary);
        const result = adminService.getDictionaries();
        expect(stubOnReadFile.called).to.equal(true);

        for (const item of result) {
            expect(item.title).to.equal(expectedResult.title);
            expect(item.description).to.equal(expectedResult.description);
        }

        stubOnReadFile.restore();
    });

    it('should update the dictionaries in the server file system', () => {
        const jsonDictionary = `{
            "title": "Mon dictionnaire",
            "description": "Description de base",
            "words": [
                "aa",
                "aalenien",
                "aalenienne",
                "aaleniennes",
                "aaleniens"
            ]
        }`;

        const dictionary: Dictionary = {
            fileName: 'test.txt',
            title: 'test',
            description: 'Mon test',
            isDefault: false,
        };
        const spyOnReturn = sinon.spy(adminService, 'getDictionaries');
        const stubOnReadFile = sinon.stub(fileSystem, 'readFileSync').returns(jsonDictionary);
        const stubOnWrite = sinon.stub(fileSystem, 'writeFileSync');

        adminService.updateDictionary(dictionary);
        expect(spyOnReturn.called).to.equal(true);
        expect(stubOnReadFile.called).to.equal(true);
        expect(stubOnWrite.called).to.equal(true);
        spyOnReturn.restore();
        stubOnReadFile.restore();
        stubOnWrite.restore();
    });

    it('should delete the specified dictionary', () => {
        const dictionary: Dictionary = {
            fileName: 'test.txt',
            title: 'test',
            description: 'Mon test',
            isDefault: false,
        };
        const stubOnUnSync = sinon.stub(fileSystem, 'unlinkSync').returns();
        const spyOnReturn = sinon.spy(adminService, 'getDictionaries');
        adminService.deleteDictionary(dictionary.fileName);
        expect(stubOnUnSync.called).to.equal(true);
        expect(spyOnReturn.called).to.equal(true);
    });

    it('should reset the scores', async () => {
        await databaseService.start();
        const scoresModel = SCORES_MODEL.get(GameType.Classic) as mongoose.Model<PlayerScore>;
        const spyOn = sinon.spy(scoresModel, 'deleteMany');
        await adminService.resetScores(GameType.Classic);
        expect(spyOn.called).to.equal(true);
    });
});
