/* eslint-disable @typescript-eslint/no-magic-numbers */
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AiType } from '@common/ai-name';
import { TimerFieldComponent } from './timer-field.component';

describe('TimerFieldComponent', () => {
    let component: TimerFieldComponent;
    let fixture: ComponentFixture<TimerFieldComponent>;
    let minuteInput: string;
    let secondInput: string;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [TimerFieldComponent],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TimerFieldComponent);
        component = fixture.componentInstance;
        component.parentForm = new FormGroup({
            playerName: new FormControl('', Validators.required),
            minuteInput: new FormControl('', Validators.required),
            secondInput: new FormControl('', Validators.required),
            levelInput: new FormControl('', Validators.required),
        });
        fixture.detectChanges();
    });

    it('Should create', () => {
        expect(component).toBeTruthy();
    });

    it('Time must be invalidated if minutes input or seconds input is empty', () => {
        minuteInput = '';
        secondInput = '';
        expect(component.isValidTime(minuteInput, secondInput)).toBe(false);
    });

    it('Time must be invalidated if the input time is not in valid the range', () => {
        minuteInput = '70';
        secondInput = '00';
        expect(component.isValidTime(minuteInput, secondInput)).toBe(false);
    });

    it('Time must be validated if the input time is in valid the range', () => {
        minuteInput = '05';
        secondInput = '00';
        expect(component.isValidTime(minuteInput, secondInput)).toBe(true);
    });

    it('should have input errors when time is not validated', () => {
        component.parentForm = new FormGroup({
            playerName: new FormControl(''),
            minuteInput: new FormControl('70'),
            secondInput: new FormControl('00'),
            levelInput: new FormControl(AiType.beginner),
        });
        component.setTimeValidity();
        expect(component.parentForm.controls.minuteInput.errors).toBeTruthy();
        expect(component.parentForm.controls.secondInput.errors).toBeTruthy();
    });

    it('should not have input errors when time is validated', () => {
        component.parentForm = new FormGroup({
            playerName: new FormControl(''),
            minuteInput: new FormControl('05'),
            secondInput: new FormControl('00'),
            levelInput: new FormControl(AiType.beginner),
        });
        component.setTimeValidity();
        expect(component.parentForm.controls.minuteInput.errors).toBeNull();
        expect(component.parentForm.controls.secondInput.errors).toBeNull();
    });
});
