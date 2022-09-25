import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { LevelFieldComponent } from './level-field.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('LevelFieldComponent', () => {
    let component: LevelFieldComponent;
    let fixture: ComponentFixture<LevelFieldComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [LevelFieldComponent],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(LevelFieldComponent);
        component = fixture.componentInstance;
        component.parentForm = new FormGroup({
            playerName: new FormControl('', Validators.required),
            minuteInput: new FormControl('', Validators.required),
            secondInput: new FormControl('', Validators.required),
            levelInput: new FormControl('', Validators.required),
        });
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
