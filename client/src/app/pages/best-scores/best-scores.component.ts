import { Component, OnInit } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';
import { CommunicationService } from '@app/services/communication.service';
import { GameType } from '@common/game-type';
import { PlayerScore } from '@common/player';

@Component({
    selector: 'app-best-scores',
    templateUrl: './best-scores.component.html',
    styleUrls: ['./best-scores.component.scss'],
})
export class BestScoresComponent implements OnInit {
    bestPlayersInClassicMode: PlayerScore[];
    bestPlayersInLog2990Mode: PlayerScore[];

    constructor(public bestScoresDialogRef: MatDialogRef<BestScoresComponent>, private communicationService: CommunicationService) {}

    ngOnInit(): void {
        this.communicationService.getBestPlayers(GameType.Classic).subscribe((players: PlayerScore[]) => (this.bestPlayersInClassicMode = players));
        this.communicationService.getBestPlayers(GameType.Log2990).subscribe((players: PlayerScore[]) => (this.bestPlayersInLog2990Mode = players));
    }
}
