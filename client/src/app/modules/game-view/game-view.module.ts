import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { ChatboxComponent } from '@app/modules/game-view/chatbox/chatbox.component';
import { FontSizeComponent } from '@app/modules/game-view/font-size/font-size.component';
import { GameViewComponent } from '@app/modules/game-view/game-view/game-view.component';
import { InformationPanelComponent } from '@app/modules/game-view/information-panel/information-panel.component';
import { LetterEaselComponent } from '@app/modules/game-view/letter-easel/letter-easel.component';
import { ScrabbleBoardComponent } from '@app/modules/game-view/scrabble-board/scrabble-board.component';
import { AppMaterialModule } from '@app/modules/material.module';
import { SharedModule } from '@app/modules/shared/shared.module';
import { ObjectivesComponent } from './objectives/objectives.component';

@NgModule({
    declarations: [
        GameViewComponent,
        ScrabbleBoardComponent,
        InformationPanelComponent,
        LetterEaselComponent,
        FontSizeComponent,
        ChatboxComponent,
        ObjectivesComponent,
    ],
    imports: [CommonModule, AppRoutingModule, FormsModule, SharedModule, AppMaterialModule],
    exports: [GameViewComponent],
    bootstrap: [GameViewComponent],
})
export class GameViewModule {}
