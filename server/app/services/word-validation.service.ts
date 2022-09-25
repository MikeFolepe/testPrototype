import * as fileSystem from 'fs';
import { Service } from 'typedi';
@Service()
export class WordValidationService {
    gameDictionaries: Map<string, string[]>;
    currentDictionary: string[];
    constructor() {
        this.initializeDictionaries();
        this.currentDictionary = [];
    }

    isValidInDictionary(words: string[], fileName: string): boolean {
        this.currentDictionary = this.gameDictionaries.get(fileName) as string[];
        if (words.length === 0) return false;
        let validWordsCount = 0;
        // JUSTIFICATION : the server console returns that words is not of type Iteratable <string>
        // eslint-disable-next-line @typescript-eslint/prefer-for-of
        for (let i = 0; i < words.length; i++) {
            for (const item of this.currentDictionary) {
                if (words[i].toLowerCase() === item) validWordsCount++;
            }
        }
        return validWordsCount === words.length;
    }

    initializeDictionaries(): void {
        this.gameDictionaries = new Map<string, string[]>();
        const files = fileSystem.readdirSync('./dictionaries/', 'utf8');
        for (const file of files) {
            const readFile = JSON.parse(fileSystem.readFileSync(`./dictionaries/${file}`, 'utf8')).words;
            this.gameDictionaries.set(file, readFile);
        }
    }
}
