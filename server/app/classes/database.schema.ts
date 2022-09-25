import { AiPlayer, AiType } from '@common/ai-name';
import { GameType } from '@common/game-type';
import { PlayerScore } from '@common/player';
import * as mongoose from 'mongoose';

const scoreSchema = new mongoose.Schema({
    score: { type: Number, required: true },
    playerName: { type: String, required: true },
    isDefault: { type: Boolean, required: true },
});

const aiNameSchema = new mongoose.Schema({
    aiName: { type: String, required: true },
    isDefault: { type: Boolean, required: true },
});

const beginnerNameModel = mongoose.model('AiBeginnerName', aiNameSchema);
const expertNameModel = mongoose.model('AiExpertName', aiNameSchema);

const scoreModelClassic = mongoose.model('ScoresClassic', scoreSchema);
const scoreModelLog2990 = mongoose.model('ScoresLog2990', scoreSchema);

export const AI_MODELS: Map<AiType, mongoose.Model<AiPlayer>> = new Map<AiType, mongoose.Model<AiPlayer>>([
    [AiType.beginner, beginnerNameModel],
    [AiType.expert, expertNameModel],
]);

export const SCORES_MODEL = new Map<GameType, mongoose.Model<PlayerScore>>([
    [GameType.Classic, scoreModelClassic],
    [GameType.Log2990, scoreModelLog2990],
]);
