import { AppRoutingModule } from '@app/modules/app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { GameViewModule } from '@app/modules/game-view/game-view.module';
import { InitializeGameModule } from '@app/modules/initialize-game/initialize-game.module';
import { AppMaterialModule } from '@app/modules/material.module';
import { SharedModule } from '@app/modules/shared/shared.module';
import { AppComponent } from '@app/pages/app/app.component';
import { JoinRoomComponent } from '@app/pages/join-room/join-room.component';
import { MainPageComponent } from '@app/pages/main-page/main-page.component';
import { NgModule } from '@angular/core';
import { PageNotFoundComponent } from '@app/pages/page-not-found/page-not-found.component';
import { WaitingRoomComponent } from '@app/pages/waiting-room/waiting-room.component';
import { AdminPageComponent } from './pages/admin-page/admin-page.component';
import { ClickOutsideModule } from 'ng-click-outside';
import { EditDictionaryDialogComponent } from './pages/admin-page/edit-dictionary-dialog/edit-dictionary-dialog.component';
import { BestScoresComponent } from './pages/best-scores/best-scores.component';
import { AuthPageComponent } from './pages/auth-page/auth-page.component';
import { PrototypeChatBoxComponent } from './pages/prototype-chat-box/prototype-chat-box.component';

/**
 * Main module that is used in main.ts.
 * All automatically generated components will appear in this module.
 * Please do not move this module in the module folder.
 * Otherwise Angular Cli will not know in which module to put new component
 */
@NgModule({
    declarations: [
        AppComponent,
        MainPageComponent,
        PageNotFoundComponent,
        WaitingRoomComponent,
        JoinRoomComponent,
        AdminPageComponent,
        EditDictionaryDialogComponent,
        BestScoresComponent,
        AuthPageComponent,
        PrototypeChatBoxComponent,
    ],
    imports: [
        AppMaterialModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        BrowserModule,
        FormsModule,
        HttpClientModule,
        GameViewModule,
        InitializeGameModule,
        SharedModule,
        ClickOutsideModule,
        ReactiveFormsModule,
    ],
    providers: [],
    bootstrap: [AppComponent],
})
export class AppModule {}
