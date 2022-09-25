import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AdminPageComponent } from '@app/pages/admin-page/admin-page.component';
import { AuthPageComponent } from '@app/pages/auth-page/auth-page.component';
import { JoinRoomComponent } from '@app/pages/join-room/join-room.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { PageNotFoundComponent } from '@app/pages/page-not-found/page-not-found.component';
import { PrototypeChatBoxComponent } from '@app/pages/prototype-chat-box/prototype-chat-box.component';
import { WaitingRoomComponent } from '@app/pages/waiting-room/waiting-room.component';
import { AuthGuard } from '@app/services/auth.guard';
import { GameViewComponent } from './game-view/game-view/game-view.component';
import { FormComponent } from './initialize-game/form/form.component';

const routes: Routes = [
    // { path: '', redirectTo: '/home', pathMatch: 'full' },

    { path: '', component: AuthPageComponent },
    { path: 'auth', component: AuthPageComponent },
    { path: 'home', component: MainPageComponent, canActivate: [AuthGuard] },
    { path: 'chat', component: PrototypeChatBoxComponent, canActivate: [AuthGuard] },
    { path: 'solo-game-ai', component: FormComponent },
    { path: 'multiplayer-mode', component: FormComponent },
    { path: 'waiting-room', component: WaitingRoomComponent },
    { path: 'join-room', component: JoinRoomComponent },
    { path: 'game', component: GameViewComponent },
    { path: 'page-not-found', component: PageNotFoundComponent },
    { path: 'admin', component: AdminPageComponent },
    { path: '**', redirectTo: '/page-not-found', pathMatch: 'full' },
];

@NgModule({
    imports: [RouterModule.forRoot(routes, { useHash: true })],
    exports: [RouterModule],
})
export class AppRoutingModule {}
