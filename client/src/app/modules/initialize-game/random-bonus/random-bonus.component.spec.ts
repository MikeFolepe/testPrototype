import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AiType } from '@common/ai-name';
import { RandomBonusComponent } from './random-bonus.component';

describe('RandomBonusComponent', () => {
    let component: RandomBonusComponent;
    let fixture: ComponentFixture<RandomBonusComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [RandomBonusComponent],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(RandomBonusComponent);
        component = fixture.componentInstance;
        component.parentForm = new FormGroup({
            playerName: new FormControl('player 1'),
            minuteInput: new FormControl('01'),
            secondInput: new FormControl('00'),
            levelInput: new FormControl(AiType.beginner),
            randomBonus: new FormControl('Non'),
        });

        component.parentForm.controls.randomBonus.setValidators([Validators.required]);
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
