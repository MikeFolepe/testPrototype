import { AiType } from '@common/ai-name';
import { Body, Controller, Get, HttpStatus, Post, Res } from '@nestjs/common';
import { ApiCreatedResponse, ApiNotFoundResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { AdminService } from '@app/admin/service/admin.service';

@Controller('admin')
export class AdminController {
    constructor(private readonly adminService: AdminService) {}

    @ApiCreatedResponse({
        description: 'Returns all beginners ais',
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Get('/aiBeginners')
    async getAiBeginners(@Res() response: Response) {
        await this.adminService
            .getAllAiPlayers(AiType.beginner)
            .then((aiBeginners) => {
                response.status(HttpStatus.OK).send(aiBeginners);
            })
            .catch((error: Error) => {
                response.status(HttpStatus.NOT_FOUND).send('An error occurred while trying to get ai beginners ' + error.message);
            });
    }

    @ApiCreatedResponse({
        description: 'Returns all experts ais',
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Get('/aiExperts')
    async getAiExperts(@Res() response: Response) {
        await this.adminService
            .getAllAiPlayers(AiType.expert)
            .then((aiExperts) => {
                response.status(HttpStatus.OK).send(aiExperts);
            })
            .catch((error: Error) => {
                response.status(HttpStatus.NOT_FOUND).send('An error occurred while trying to get ai experts ' + error.message);
            });
    }

    @ApiCreatedResponse({
        description: 'Add new course',
    })
    @ApiNotFoundResponse({
        description: 'Return NOT_FOUND http status when request fails',
    })
    @Post('/aiPlayers')
    async addCourse(@Body() ai, @Res() response: Response) {
        try {
            const aiPlayer = await this.adminService.addAiPlayer(ai.aiPlayer, ai.aiType);
            response.status(HttpStatus.CREATED).send(aiPlayer);
        } catch (error) {
            response.status(HttpStatus.NOT_FOUND).send(error.message);
        }
    }
}
