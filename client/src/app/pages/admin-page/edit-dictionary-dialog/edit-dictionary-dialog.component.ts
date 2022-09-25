import { Component, Inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NAME_SIZE, SPECIAL_CHAR } from '@app/classes/constants';
import { CustomRange } from '@app/classes/range';

@Component({
    selector: 'app-edit-dictionary-dialog',
    templateUrl: './edit-dictionary-dialog.component.html',
    styleUrls: ['./edit-dictionary-dialog.component.scss'],
})
export class EditDictionaryDialogComponent implements OnInit {
    form: FormGroup;
    nameSize: CustomRange;
    descriptionSize: CustomRange;
    specialChar: string;

    constructor(
        public dialogRef: MatDialogRef<EditDictionaryDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { title: string; description: string },
    ) {
        this.nameSize = NAME_SIZE;
        this.specialChar = SPECIAL_CHAR;

        this.descriptionSize = { min: 8, max: 30 };
        this.form = new FormGroup({
            titleInput: new FormControl(data.title),
            descriptionInput: new FormControl(data.description),
        });
    }

    ngOnInit(): void {
        const validationPattern = '^([A-Za-z][A-Za-z][A-Za-z][A-Za-z])[A-Za-z0-9' + this.specialChar + ' ]*';

        this.form.controls.titleInput.setValidators([
            Validators.required,
            Validators.pattern(validationPattern),
            Validators.minLength(NAME_SIZE.min),
            Validators.maxLength(NAME_SIZE.max),
        ]);

        this.form.controls.descriptionInput.setValidators([
            Validators.required,
            Validators.pattern(validationPattern),
            Validators.minLength(this.descriptionSize.min),
            Validators.maxLength(this.descriptionSize.max),
        ]);
    }
}
