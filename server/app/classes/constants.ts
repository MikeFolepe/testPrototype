import { AiPlayer } from '@common/ai-name';
import { PlayerScore } from '@common/player';

export const OUT_BOUND_INDEX_OF_SOCKET = 5;
export const DELAY_OF_DISCONNECT = 5000;
export const NUMBER_OF_BEST_PLAYERS = 5;
export const DATABASE_URL = 'mongodb+srv://Team107:xxtyU48kHQ4ZqDW@cluster0.i7hu4.mongodb.net/database?retryWrites=true&w=majority';
export const DEFAULT_SCORES: PlayerScore[] = [
    {
        score: 5,
        playerName: 'Abba',
        isDefault: true,
    },
    {
        score: 7,
        playerName: 'Abbe',
        isDefault: true,
    },
    {
        score: 9,
        playerName: 'Abbi',
        isDefault: true,
    },
    {
        score: 11,
        playerName: 'Abbo',
        isDefault: true,
    },
    {
        score: 13,
        playerName: 'Abby',
        isDefault: true,
    },
];

export const AI_BEGINNERS: AiPlayer[] = [
    {
        aiName: 'Mister_Bucky',
        isDefault: true,
    },
    {
        aiName: 'Miss_Betty',
        isDefault: true,
    },
    {
        aiName: 'Mister_Samy',
        isDefault: true,
    },
];

export const AI_EXPERTS: AiPlayer[] = [
    {
        aiName: 'Mister_Felix',
        isDefault: true,
    },
    {
        aiName: 'Miss_Patty',
        isDefault: true,
    },
    {
        aiName: 'Miss_Judith',
        isDefault: true,
    },
];
