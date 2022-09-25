export type AiPlayer = {
    aiName: string;
    isDefault: boolean;
};

export type AiPlayerDB = {
    _id: string;
    aiName: string;
    isDefault: boolean;
};

export enum AiType {
    beginner,
    expert,
}
