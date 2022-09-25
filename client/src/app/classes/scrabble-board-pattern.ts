export interface BoardPattern {
    horizontal: PatternInfo[];
    vertical: PatternInfo[];
}

export interface PatternInfo {
    line: number;
    pattern: string;
}

export enum Orientation {
    Horizontal,
    Vertical,
}

export interface PossibleWords {
    word: string;
    orientation: Orientation;
    line: number;
    startIndex: number;
    point: number;
}
