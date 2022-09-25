import { ObjectivesService } from '@app/services/objectives.service';
export interface Objective {
    name: string;
    isCompleted: boolean;
    score: number;
    id: number;
    validate: (objectiveService: ObjectivesService) => void;
}

export const OBJECTIVES: Objective[] = [
    {
        name: "Former un mot d'au moins 4 lettres sur 3 tours consécutifs",
        isCompleted: false,
        score: 20,
        id: 0,
        validate(objectiveService: ObjectivesService) {
            objectiveService.validateObjectiveOne(this.id);
        },
    },
    {
        name: "Former un mot identique à un mot déjà placé d'au moins 4 lettres",
        isCompleted: false,
        score: 20,
        id: 1,
        validate(objectiveService: ObjectivesService) {
            objectiveService.validateObjectiveTwo(this.id);
        },
    },
    {
        name: 'Former un mot qui coupe au moins deux mots déjà placés',
        isCompleted: false,
        score: 15,
        id: 2,
        validate(objectiveService: ObjectivesService) {
            objectiveService.validateObjectiveThree(this.id);
        },
    },
    {
        name: 'Obtenir 60 points en une minute de jeu actif (incluant les bonus)',
        isCompleted: false,
        score: 30,
        id: 3,
        validate(objectiveService: ObjectivesService) {
            objectiveService.validateObjectiveFour(this.id);
        },
    },
    {
        name: 'Placer un mot avec au moins 2 lettres parmi J, K, Q, W, X, Y, Z',
        isCompleted: false,
        score: 30,
        id: 4,
        validate(objectiveService: ObjectivesService) {
            objectiveService.validateObjectiveFive(this.id);
        },
    },
    {
        name: 'Prolonger un mot en touchant à une case bonus',
        isCompleted: false,
        score: 20,
        id: 5,
        validate(objectiveService: ObjectivesService) {
            objectiveService.validateObjectiveSix(this.id);
        },
    },
    {
        name: 'Former un mot de plus de 7 lettres',
        isCompleted: false,
        score: 20,
        id: 6,
        validate(objectiveService: ObjectivesService) {
            objectiveService.validateObjectiveSeven(this.id);
        },
    },
    {
        name: "Toucher l'un des 4 coins du board",
        isCompleted: false,
        score: 15,
        id: 7,
        validate(objectiveService: ObjectivesService) {
            objectiveService.validateObjectiveEight(this.id);
        },
    },
];

export const NUMBER_OF_OBJECTIVES = 4;
export const NUMBER_OF_PUBLIC_OBJECTIVES = 2;
export const LETTERS_FOR_OBJ5: string[] = ['j', 'k', 'q', 'w', 'x', 'y', 'z'];
export const CORNER_POSITIONS: string[] = ['A1', 'A15', 'O1', 'O15'];
export const MIN_SIZE_FOR_OBJ7 = 8;
export const MIN_SIZE_FOR_OBJ2 = 4;
export const MIN_SCORE_FOR_OBJ4 = 60;
