import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'app-random-bonus',
    templateUrl: './random-bonus.component.html',
    styleUrls: ['./random-bonus.component.scss'],
})
export class RandomBonusComponent implements OnInit {
    @Input() parentForm: FormGroup;
    randomBonusSelectionList: string[];

    constructor() {
        this.randomBonusSelectionList = ['Désactiver', 'Activer'];
    }

    ngOnInit(): void {
        this.parentForm.controls.randomBonus.setValidators([Validators.required]);
    }
}
