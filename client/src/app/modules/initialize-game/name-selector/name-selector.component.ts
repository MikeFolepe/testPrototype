import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { NAME_SIZE, SPECIAL_CHAR, VALIDATION_PATTERN } from '@app/classes/constants';
import { CustomRange } from '@app/classes/range';

@Component({
    selector: 'app-dialog',
    templateUrl: './name-selector.component.html',
    styleUrls: ['./name-selector.component.scss'],
})
export class NameSelectorComponent implements OnInit {
    form: FormControl;
    nameSize: CustomRange;
    specialChar: string;
    constructor(public dialogRef: MatDialogRef<NameSelectorComponent>) {
        this.form = new FormControl();
        this.nameSize = NAME_SIZE;
        this.specialChar = SPECIAL_CHAR;
    }

    ngOnInit(): void {
        this.form.setValidators([
            Validators.required,
            Validators.pattern(VALIDATION_PATTERN),
            Validators.minLength(NAME_SIZE.min),
            Validators.maxLength(NAME_SIZE.max),
        ]);
    }
}
