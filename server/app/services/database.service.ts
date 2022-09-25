import { AI_BEGINNERS, AI_EXPERTS, DATABASE_URL, DEFAULT_SCORES } from '@app/classes/constants';
import { AI_MODELS, SCORES_MODEL } from '@app/classes/database.schema';
import { AiPlayer, AiType } from '@common/ai-name';
import { GameType } from '@common/game-type';
import { PlayerScore } from '@common/player';
import * as mongoose from 'mongoose';
import { Service } from 'typedi';

@Service()
export class DatabaseService {
    database: mongoose.Mongoose;
    private options = {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    } as mongoose.ConnectOptions;

    constructor() {
        this.database = mongoose;
    }
    async start(url: string = DATABASE_URL): Promise<void> {
        await this.database
            .connect(url, this.options)
            .then(() => {
                // JUSTIFICATION : required in order to display the DB connection status
                // eslint-disable-next-line no-console
                console.log('Connected successfully to Mongodb Atlas');
            })
            .catch(() => {
                throw new Error('Distant database connection error');
            });

        this.setDefaultData(AiType.beginner);
        this.setDefaultData(AiType.expert);

        this.setDefaultScores(GameType.Classic);
        this.setDefaultScores(GameType.Log2990);
    }

    async closeConnection(): Promise<void> {
        await mongoose.connection.close();
    }

    async setDefaultScores(gameType: GameType): Promise<void> {
        const scoresModel = SCORES_MODEL.get(gameType) as mongoose.Model<PlayerScore>;
        await scoresModel.deleteMany({ isDefault: true }).exec();
        for (const player of DEFAULT_SCORES) {
            const scoreToAdd = new scoresModel({
                score: player.score,
                playerName: player.playerName,
                isDefault: player.isDefault,
            });
            await scoreToAdd.save();
        }
    }

    async setDefaultData(aiType: AiType): Promise<void> {
        const aiModel = AI_MODELS.get(aiType) as mongoose.Model<AiPlayer>;
        await aiModel.deleteMany({ isDefault: true }).exec();

        const players = aiType ? AI_EXPERTS : AI_BEGINNERS;
        for (const aiPlayer of players) {
            const player = new aiModel({
                aiName: aiPlayer.aiName,
                isDefault: aiPlayer.isDefault,
            });
            await player.save();
        }
    }
}
