import { BackgroundComponent } from '@app/pages/background/background.component';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

@NgModule({
    declarations: [BackgroundComponent],
    imports: [CommonModule],
    exports: [BackgroundComponent],
})
export class SharedModule {}
