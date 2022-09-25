import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AiPlayer, AiPlayerDB, AiType } from '@common/ai-name';
import { Dictionary } from '@common/dictionary';
import { GameType } from '@common/game-type';
import { PlayerScore } from '@common/player';
import { User } from '@common/user';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class CommunicationService {
    private readonly baseUrl: string;
    private wordsToValidate: string[];

    constructor(private readonly http: HttpClient) {
        this.baseUrl = environment.serverUrl + '/api';
        this.wordsToValidate = [];
    }

    validationPost(newPlayedWords: Map<string, string[]>, fileName: string): Observable<boolean> {
        this.wordsToValidate = [];
        for (const word of newPlayedWords.keys()) {
            this.wordsToValidate.push(word);
        }
        return this.http.post<boolean>(`${this.baseUrl}/game/validateWords/${fileName}`, this.wordsToValidate);
    }

    getGameDictionary(fileName: string): Observable<string[]> {
        return this.http.get<string[]>(`${this.baseUrl}/game/dictionary/${fileName}`);
    }

    addPlayersScores(players: PlayerScore[], gameType: GameType): Observable<void> {
        return this.http
            .post<void>(`${this.baseUrl}/game/best-scores-` + (gameType === GameType.Classic ? 'classic' : 'log2990'), players)
            .pipe(catchError(this.handleError<void>('addPlayers')));
    }

    getBestPlayers(gameType: GameType): Observable<PlayerScore[]> {
        return this.http
            .get<PlayerScore[]>(`${this.baseUrl}/game/best-scores-` + (gameType === GameType.Classic ? 'classic' : 'log2990'))
            .pipe(catchError(this.handleError<PlayerScore[]>('getBestPlayers')));
    }

    getAiPlayers(aiType: AiType): Observable<AiPlayerDB[]> {
        return this.http.get<AiPlayerDB[]>(`${this.baseUrl}/admin/` + (aiType === AiType.expert ? 'aiExperts' : 'aiBeginners'));
    }

    addAiPlayer(aiPlayer: AiPlayer, aiType: AiType): Observable<AiPlayerDB> {
        return this.http.post<AiPlayerDB>(`${this.baseUrl}/admin/aiPlayers`, { aiPlayer, aiType });
    }

    deleteAiPlayer(id: string, aiType: AiType): Observable<AiPlayerDB[]> {
        return this.http.delete<AiPlayerDB[]>(`${this.baseUrl}/admin/` + (aiType === AiType.expert ? `aiExperts/${id}` : `aiBeginners/${id}`));
    }

    deleteScores(): Observable<void> {
        return this.http.delete<void>(`${this.baseUrl}/admin/scores`);
    }

    updateAiPlayer(id: string, aiBeginner: AiPlayer, aiType: AiType): Observable<AiPlayerDB[]> {
        return this.http.put<AiPlayerDB[]>(`${this.baseUrl}/admin/aiPlayers/${id}`, { aiBeginner, aiType });
    }

    uploadFile(file: File): Observable<string> {
        const formData: FormData = new FormData();
        formData.append('file', file);
        return this.http.post<string>(`${this.baseUrl}/admin/uploadDictionary`, formData);
    }

    getDictionaries(): Observable<Dictionary[]> {
        return this.http.get<Dictionary[]>(`${this.baseUrl}/admin/dictionaries`);
    }

    updateDictionary(dictionary: Dictionary): Observable<Dictionary[]> {
        return this.http.put<Dictionary[]>(`${this.baseUrl}/admin/dictionaries`, dictionary);
    }

    deleteDictionary(fileName: string): Observable<Dictionary[]> {
        return this.http.delete<Dictionary[]>(`${this.baseUrl}/admin/dictionaries/${fileName}`);
    }

    // JUSTIFICATION : Required as the server respond with an object containing the dictionary
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    downloadDictionary(fileName: string): Observable<any> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return this.http.get<any>(`${this.baseUrl}/admin/download/${fileName}`);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    connectUser(userData: User): Observable<boolean> {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return this.http.post<boolean>(`${this.baseUrl}/auth/connect`, userData);
    }

    private handleError<T>(request: string, result?: T): (error: Error) => Observable<T> {
        return () => of(result as T);
    }
}
