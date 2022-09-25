import { Component, Input } from '@angular/core';
import { trigger, style, animate, transition } from '@angular/animations';

@Component({
    selector: 'app-background',
    templateUrl: './background.component.html',
    styleUrls: ['./background.component.scss'],
    animations: [
        trigger('inOutAnimation', [
            transition(':enter', [style({ height: 0, opacity: 0 }), animate('2s ease-out', style({ height: '*', opacity: 1 }))]),
            transition(':leave', [style({ height: '*', opacity: 1 }), animate('2s ease-in', style({ height: 0, opacity: 0 }))]),
        ]),
    ],
})
export class BackgroundComponent {
    @Input() isDark: boolean;

    constructor() {
        this.isDark = false;
    }
}
