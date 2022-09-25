import { AiPlayer, AiType } from '@common/ai-name';
import { Dictionary } from '@common/dictionary';
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Ai, AiDocument } from '@app/model/ai.schema';
import * as fileSystem from 'fs';
@Injectable()
export class AdminService {
    aiModels: Map<AiType, Model<AiDocument>>;
    private dictionaries: Dictionary[];

    constructor(
        @InjectModel('AiBeginnerName') private aiBeginnerModel: Model<AiDocument>,
        @InjectModel('AiExpertName') private aiExpertModel: Model<AiDocument>,
    ) {
        this.aiModels = new Map<AiType, Model<AiDocument>>([
            [AiType.beginner, this.aiBeginnerModel],
            [AiType.expert, this.aiExpertModel],
        ]);
    }

    async getAllAiPlayers(aiType: AiType): Promise<Ai[]> {
        const aiModel = this.aiModels.get(aiType);
        const aiPlayers = await aiModel.find({}).exec();
        return aiPlayers;
    }

    async addAiPlayer(aiPlayer: AiPlayer, aiType: AiType): Promise<Ai> {
        const aiModel = this.aiModels.get(aiType);

        const createdAiPlayer = new aiModel(aiPlayer);
        return await createdAiPlayer.save();
    }

    // async deleteAiPlayer(id: string, aiType: AiType): Promise<AiPlayerDB[]> {
    //     const aiModel = AI_MODELS.get(aiType) as mongoose.Model<AiPlayer>;
    //     await aiModel.findByIdAndDelete(id).exec();
    //     return await this.getAllAiPlayers(aiType);
    // }

    // async updateAiPlayer(id: string, object: { aiBeginner: AiPlayer; aiType: AiType }): Promise<AiPlayerDB[]> {
    //     const aiModel = AI_MODELS.get(object.aiType) as mongoose.Model<AiPlayer>;
    //     await aiModel.findByIdAndUpdate(id, { aiName: object.aiBeginner.aiName }).exec();
    //     return await this.getAllAiPlayers(object.aiType);
    // }

    getDictionaries(): Dictionary[] {
        this.dictionaries = [];
        const files = fileSystem.readdirSync('./dictionaries/', 'utf8');
        for (const file of files) {
            const readFile = JSON.parse(fileSystem.readFileSync(`./dictionaries/${file}`, 'utf8'));
            const isDefault = file === 'dictionary.json';
            const dictionary: Dictionary = {
                fileName: file,
                title: readFile.title,
                description: readFile.description,
                isDefault,
            };
            this.dictionaries.push(dictionary);
        }
        return this.dictionaries;
    }

    updateDictionary(dictionary: Dictionary): Dictionary[] {
        const readFile = JSON.parse(fileSystem.readFileSync(`./dictionaries/${dictionary.fileName}`, 'utf8'));
        readFile.title = dictionary.title;
        readFile.description = dictionary.description;
        fileSystem.writeFileSync(`./dictionaries/${dictionary.fileName}`, JSON.stringify(readFile), 'utf8');
        return this.getDictionaries();
    }

    deleteDictionary(fileName: string): Dictionary[] {
        fileSystem.unlinkSync(`./dictionaries/${fileName}`);
        return this.getDictionaries();
    }
}
