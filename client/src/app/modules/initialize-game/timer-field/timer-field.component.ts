import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'app-timer-field',
    templateUrl: './timer-field.component.html',
    styleUrls: ['./timer-field.component.scss'],
})
export class TimerFieldComponent implements OnInit {
    @Input() parentForm: FormGroup;

    // Time and Second value selection list for view
    readonly minuteSelectionList: string[] = ['00', '01', '02', '03', '04', '05'];
    readonly secondSelectionList: string[] = ['00', '30'];

    ngOnInit(): void {
        // The Timer field is required for form submit
        this.parentForm.controls.minuteInput.setValidators([Validators.required]);
        this.parentForm.controls.secondInput.setValidators([Validators.required]);
    }

    isValidTime(minuteInput: string, secondInput: string): boolean {
        // If one of the timer input is not initialized the timer field input should be in error
        if (minuteInput === '' || secondInput === '') return false;

        const MIN_TIME = '0030';
        const MAX_TIME = '0500';
        // Checking if the inputs are in range
        return minuteInput + secondInput <= MAX_TIME && minuteInput + secondInput >= MIN_TIME;
    }

    setTimeValidity(): void {
        // Triggered by the click on any selection value in the view
        // Verifies the validity of the actual timer input
        const isValidTime: boolean = this.isValidTime(this.parentForm.controls.minuteInput.value, this.parentForm.controls.secondInput.value);

        // Set the form field validity
        if (!isValidTime) {
            this.parentForm.controls.minuteInput.setErrors({ incorrect: true });
            this.parentForm.controls.secondInput.setErrors({ incorrect: true });
        } else {
            this.parentForm.controls.minuteInput.setErrors(null);
            this.parentForm.controls.secondInput.setErrors(null);
        }
    }
}
