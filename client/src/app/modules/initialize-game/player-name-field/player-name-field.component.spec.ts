import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { PlayerNameFieldComponent } from './player-name-field.component';

describe('PlayerNameFieldComponent', () => {
    let component: PlayerNameFieldComponent;
    let fixture: ComponentFixture<PlayerNameFieldComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PlayerNameFieldComponent],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PlayerNameFieldComponent);
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
});
