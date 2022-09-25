import { Component } from '@angular/core';
import { Objective } from '@app/classes/objectives';
import { GameSettingsService } from '@app/services/game-settings.service';
import { ObjectivesService } from '@app/services/objectives.service';

@Component({
    selector: 'app-objectives',
    templateUrl: './objectives.component.html',
    styleUrls: ['./objectives.component.scss'],
})
export class ObjectivesComponent {
    objectives: Objective[][];

    constructor(public objectivesService: ObjectivesService, public gameSettingsService: GameSettingsService) {
        this.objectives = this.objectivesService.objectives;
    }
}
