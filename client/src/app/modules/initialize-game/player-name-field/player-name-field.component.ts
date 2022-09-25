import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';
import { NAME_SIZE, SPECIAL_CHAR, VALIDATION_PATTERN } from '@app/classes/constants';
import { CustomRange } from '@app/classes/range';

@Component({
    selector: 'app-player-name-field',
    templateUrl: './player-name-field.component.html',
    styleUrls: ['./player-name-field.component.scss'],
})
export class PlayerNameFieldComponent implements OnInit {
    @Input() parentForm: FormGroup;
    nameSize: CustomRange;
    specialChar: string;

    constructor() {
        this.nameSize = NAME_SIZE;
        this.specialChar = SPECIAL_CHAR;
    }

    ngOnInit(): void {
        // The playerName field is required for form submit
        this.parentForm.controls.playerName.setValidators([
            Validators.required,
            Validators.pattern(VALIDATION_PATTERN),
            Validators.minLength(NAME_SIZE.min),
            Validators.maxLength(NAME_SIZE.max),
        ]);
    }
}
