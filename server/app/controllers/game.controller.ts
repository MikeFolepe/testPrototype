// JUSTIFICATION : Because the files are added in runtime with npm express-fileupload on the 'request' (req),
//                 the Typescript compiler does not recognize them and it fails. So, they are referenced with dot notation
/* eslint-disable dot-notation */

import { BestScoresService } from '@app/services/best-scores.service';
import { WordValidationService } from '@app/services/word-validation.service';
import { GameType } from '@common/game-type';
import { Request, Response, Router } from 'express';
import * as fileSystem from 'fs';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';

@Service()
export class GameController {
    router: Router;
    constructor(private wordValidator: WordValidationService, private bestScoresService: BestScoresService) {
        this.configureRouter();
    }
    private configureRouter(): void {
        this.router = Router();
        this.router.post('/validateWords/:fileName', (req: Request, res: Response) => {
            const isValid = this.wordValidator.isValidInDictionary(req.body, req.params.fileName);
            res.status(StatusCodes.OK).send(isValid);
        });

        this.router.get('/dictionary/:fileName', (req: Request, res: Response) => {
            const readFile = JSON.parse(fileSystem.readFileSync(`./dictionaries/${req.params.fileName}`, 'utf8'));
            const words = readFile.words;
            res.status(StatusCodes.OK).send(words);
        });

        this.router.post('/best-scores-classic', async (req: Request, res: Response) => {
            await this.bestScoresService.addPlayers(req.body, GameType.Classic);
            res.sendStatus(StatusCodes.OK);
        });

        this.router.post('/best-scores-log2990', async (req: Request, res: Response) => {
            await this.bestScoresService.addPlayers(req.body, GameType.Log2990);
            res.sendStatus(StatusCodes.OK);
        });

        this.router.get('/best-scores-classic', async (req: Request, res: Response) => {
            await this.bestScoresService
                .getBestPlayers(GameType.Classic)
                .then((players) => {
                    res.status(StatusCodes.OK).send(players);
                })
                .catch((error: Error) => {
                    res.status(StatusCodes.NOT_FOUND).send('An error occurred while trying to get players scores ' + error.message);
                });
        });

        this.router.get('/best-scores-log2990', async (req: Request, res: Response) => {
            await this.bestScoresService
                .getBestPlayers(GameType.Log2990)
                .then((players) => {
                    res.status(StatusCodes.OK).send(players);
                })
                .catch((error: Error) => {
                    res.status(StatusCodes.NOT_FOUND).send('An error occurred while trying to get players scores ' + error.message);
                });
        });
    }
}
