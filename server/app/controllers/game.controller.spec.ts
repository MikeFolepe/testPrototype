/* eslint-disable @typescript-eslint/no-require-imports */
import { Application } from '@app/app';
import { BestScoresService } from '@app/services/best-scores.service';
import { WordValidationService } from '@app/services/word-validation.service';
import { PlayerScore } from '@common/player';
import * as chai from 'chai';
import { expect } from 'chai';
import * as fileSystem from 'fs';
import { StatusCodes } from 'http-status-codes';
import * as sinon from 'sinon';
import { Container } from 'typedi';
import chaiHttp = require('chai-http');

describe('GameController', () => {
    let expressApp: Express.Application;
    let wordValidationService: WordValidationService;
    let bestScoresService: BestScoresService;
    chai.use(chaiHttp);

    const playersScores: PlayerScore[] = [
        {
            score: 15,
            playerName: 'JoelleTest',
            isDefault: false,
        },
        {
            score: 20,
            playerName: 'JojoTest',
            isDefault: false,
        },
    ];

    beforeEach(() => {
        const app = Container.get(Application);
        wordValidationService = Container.get<WordValidationService>(WordValidationService);
        bestScoresService = Container.get<BestScoresService>(BestScoresService);
        expressApp = app.app;
    });

    it('should return the result of a validation from an invalid post request from the client', (done) => {
        const stubValidate = sinon.stub(wordValidationService, 'isValidInDictionary').returns(false);
        chai.request(expressApp)
            .post('/api/game/validateWords/dictionary.json')
            .send(['mdmd', 'booo'])
            .end((err, response) => {
                expect(stubValidate.called).to.equal(true);
                expect(response.status).to.equal(StatusCodes.OK);
                expect(response.body).to.equal(false);
                stubValidate.restore();
                done();
            });
    });

    it('should return the result of a validation from a valid post request from the client', (done) => {
        const stubValidate = sinon.stub(wordValidationService, 'isValidInDictionary').returns(true);
        chai.request(expressApp)
            .post('/api/game/validateWords/dictionary.json')
            .send(['sud', 'maman'])
            .end((err, response) => {
                expect(stubValidate.called).to.equal(true);
                expect(response.status).to.equal(StatusCodes.OK);
                expect(response.body).to.equal(true);
                stubValidate.restore();
                done();
            });
    });

    it('should return the dictionary asked by the client', (done) => {
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
        const dictionary = JSON.parse(jsonDictionary);
        const stubOnParse = sinon.stub(fileSystem, 'readFileSync').returns(jsonDictionary);

        chai.request(expressApp)
            .get('/api/game/dictionary/dictionary.json')
            .end((err, response) => {
                expect(stubOnParse.called).to.equal(true);
                expect(response.body).to.deep.equal(dictionary.words);
                expect(response.status).to.equal(StatusCodes.OK);
                stubOnParse.restore();
                done();
            });
    });

    it('should return the bests players of classic mode', (done) => {
        const getBestPlayersStub = sinon.stub(bestScoresService, 'getBestPlayers').returns(Promise.resolve(playersScores));
        chai.request(expressApp)
            .get('/api/game/best-scores-classic')
            .end((err, response) => {
                expect(getBestPlayersStub.called).to.equal(true);
                expect(response.status).to.equal(StatusCodes.OK);
                expect(response.body).to.deep.equal(playersScores);
                getBestPlayersStub.restore();
                done();
            });
    });

    it('should handle the error while getting bests players of classic mode', (done) => {
        const getBestPlayersStub = sinon.stub(bestScoresService, 'getBestPlayers').returns(Promise.reject(new Error('fail')));
        chai.request(expressApp)
            .get('/api/game/best-scores-classic')
            .end((err, response) => {
                expect(getBestPlayersStub.called).to.equal(true);
                expect(response.status).to.equal(StatusCodes.NOT_FOUND);
                getBestPlayersStub.restore();
                done();
            });
    });

    it('should return the bests scores of log2990 mode', (done) => {
        const getBestPlayersStub = sinon.stub(bestScoresService, 'getBestPlayers').returns(Promise.resolve(playersScores));
        chai.request(expressApp)
            .get('/api/game/best-scores-log2990')
            .end((err, response) => {
                expect(getBestPlayersStub.called).to.equal(true);
                expect(response.status).to.equal(StatusCodes.OK);
                expect(response.body).to.deep.equal(playersScores);
                getBestPlayersStub.restore();
                done();
            });
    });

    it('should handle the error while getting bests players of log2990 mode ', (done) => {
        const getBestPlayersStub = sinon.stub(bestScoresService, 'getBestPlayers').returns(Promise.reject(new Error('fail')));
        chai.request(expressApp)
            .get('/api/game/best-scores-log2990')
            .end((err, response) => {
                expect(getBestPlayersStub.called).to.equal(true);
                expect(response.status).to.equal(StatusCodes.NOT_FOUND);
                getBestPlayersStub.restore();
                done();
            });
    });

    it('should add players scores of classic mode by calling add addPlayers of bestScoresService', (done) => {
        const addPlayersStub = sinon.stub(bestScoresService, 'addPlayers').returns(Promise.resolve());
        chai.request(expressApp)
            .post('/api/game/best-scores-classic')
            .send(playersScores)
            .end((err, response) => {
                expect(addPlayersStub.called).to.equal(true);
                expect(response.status).to.equal(StatusCodes.OK);
                addPlayersStub.restore();
                done();
            });
    });

    it('should add players scores of log2990 mode by calling add addPlayers of bestScoresService', (done) => {
        const addPlayersStub = sinon.stub(bestScoresService, 'addPlayers').returns(Promise.resolve());
        chai.request(expressApp)
            .post('/api/game/best-scores-log2990')
            .send(playersScores)
            .end((err, response) => {
                expect(addPlayersStub.called).to.equal(true);
                expect(response.status).to.equal(StatusCodes.OK);
                addPlayersStub.restore();
                done();
            });
    });
});
