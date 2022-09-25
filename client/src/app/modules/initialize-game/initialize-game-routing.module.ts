import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GameViewComponent } from '@app/modules/game-view/game-view/game-view.component';
import { FormComponent } from './form/form.component';

const routes: Routes = [
    { path: '', component: FormComponent },
    { path: '/game', component: GameViewComponent },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class InitializeGameRoutingModule {}
