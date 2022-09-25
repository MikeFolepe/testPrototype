/* eslint-disable dot-notation */
// JUSTIFICATION : Because the files are added in runtime with npm express-fileupload on the 'request' (req),
//                 the Typescript compiler does not recognize them and it fails. So, they are referenced with dot notation
import { AdministratorService } from '@app/services/administrator.service';
import { AiType } from '@common/ai-name';
import { GameType } from '@common/game-type';
import { Request, Response, Router } from 'express';
import * as fileSystem from 'fs';
import { StatusCodes } from 'http-status-codes';
import { Service } from 'typedi';

@Service()
export class AdministratorController {
    router: Router;
    constructor(private administratorService: AdministratorService) {
        this.configureRouter();
    }

    private configureRouter(): void {
        this.router = Router();
        /**
         * @swagger
         *
         * /api/game/validateWords:
         *   post:
         *     description: return the validation result of a placed word
         *     tags:
         *       - Multiplayer
         *     produces:
         *       - a boolean that describe the result
         *     responses:
         *       200
         *
         */
        this.router.get('/aiBeginners', async (req: Request, res: Response) => {
            await this.administratorService
                .getAllAiPlayers(AiType.beginner)
                .then((aiBeginners) => {
                    res.status(StatusCodes.OK).send(aiBeginners);
                })
                .catch((error: Error) => {
                    res.status(StatusCodes.NOT_FOUND).send('An error occurred while trying to get ai beginners ' + error.message);
                });
        });

        this.router.get('/aiExperts', async (req: Request, res: Response) => {
            await this.administratorService
                .getAllAiPlayers(AiType.expert)
                .then((aiExperts) => {
                    res.status(StatusCodes.OK).send(aiExperts);
                })
                .catch((error: Error) => {
                    res.status(StatusCodes.NOT_FOUND).send('An error occurred while trying to get ai experts ' + error.message);
                });
        });

        this.router.delete('/aiBeginners/:id', async (req: Request, res: Response) => {
            await this.administratorService
                .deleteAiPlayer(req.params.id, AiType.beginner)
                .then((aiBeginners) => {
                    res.status(StatusCodes.OK).send(aiBeginners);
                })
                .catch((error) => {
                    res.status(StatusCodes.NOT_MODIFIED).send('An error occurred while trying to delete then ai beginner ' + error.message);
                });
        });

        this.router.delete('/aiExperts/:id', async (req: Request, res: Response) => {
            await this.administratorService
                .deleteAiPlayer(req.params.id, AiType.expert)
                .then((aiExperts) => {
                    res.status(StatusCodes.OK).send(aiExperts);
                })
                .catch((error) => {
                    res.status(StatusCodes.NOT_MODIFIED).send('An error occurred while trying to delete then ai expert ' + error.message);
                });
        });

        this.router.delete('/scores', async (req: Request, res: Response) => {
            await this.administratorService.resetScores(GameType.Classic).catch((error) => {
                res.status(StatusCodes.NOT_MODIFIED).send('An error occurred while trying to delete classic scores ' + error.message);
            });
            await this.administratorService.resetScores(GameType.Log2990).catch((error) => {
                res.status(StatusCodes.NOT_MODIFIED).send('An error occurred while trying to delete classic scores ' + error.message);
            });
            res.sendStatus(StatusCodes.OK);
        });

        this.router.post('/aiPlayers', async (req: Request, res: Response) => {
            await this.administratorService
                .addAiPlayer(req.body.aiPlayer, req.body.aiType)
                .then((aiPlayer) => {
                    res.status(StatusCodes.OK).send(aiPlayer);
                })
                .catch((error: Error) => {
                    res.status(StatusCodes.NOT_ACCEPTABLE).send('An error occurred while saving the ai beginner ' + error.message);
                });
        });

        this.router.put('/aiPlayers/:id', async (req: Request, res: Response) => {
            await this.administratorService
                .updateAiPlayer(req.params.id, req.body)
                .then((aiPlayers) => {
                    res.status(StatusCodes.OK).send(aiPlayers);
                })
                .catch((error) => {
                    res.status(StatusCodes.NOT_MODIFIED).send('An error occurred while modifying the ai beginner ' + error.message);
                });
        });

        this.router.get('/dictionaries', (req: Request, res: Response) => {
            res.status(StatusCodes.OK).send(this.administratorService.getDictionaries());
        });

        this.router.put('/dictionaries', (req: Request, res: Response) => {
            res.status(StatusCodes.OK).send(this.administratorService.updateDictionary(req.body));
        });

        this.router.delete('/dictionaries/:fileName', (req: Request, res: Response) => {
            res.status(StatusCodes.OK).send(this.administratorService.deleteDictionary(req.params.fileName));
        });

        this.router.get('/download/:fileName', (req: Request, res: Response) => {
            res.send(JSON.parse(fileSystem.readFileSync(`./dictionaries/${req.params.fileName}`, 'utf8')));
        });

        this.router.post('/uploadDictionary', (req: Request, res: Response) => {
            let uploadedFile;
            if (!req['files']) {
                return res.status(StatusCodes.NOT_FOUND).send('Fichier introuvable');
            }
            if (Array.isArray(req['files'].file)) {
                // It must be an array of UploadedFile objects
                for (const fic of req['files'].file) {
                    fic.mv('./dictionaries' + fic.name);
                }
            } else {
                // It must be a single UploadedFile object
                uploadedFile = req['files'].file;
                uploadedFile.mv('./dictionaries/' + uploadedFile.name);
            }
            return res.status(StatusCodes.OK).send(JSON.stringify('Le dictionnaire a été téléversé.'));
        });
    }
}
