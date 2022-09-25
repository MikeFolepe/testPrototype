/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { RouterTestingModule } from '@angular/router/testing';
import { AdminPageComponent } from './admin-page.component';

describe('AdminPageComponent', () => {
    let component: AdminPageComponent;
    let fixture: ComponentFixture<AdminPageComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [AdminPageComponent],
            imports: [HttpClientTestingModule, RouterTestingModule],
            providers: [
                {
                    provide: MatDialog,
                    useValue: {},
                },
                {
                    provide: MatSnackBar,
                    useValue: {},
                },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(AdminPageComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    beforeEach(() => {
        spyOn(component.adminService, 'initializeAiPlayers');
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should submit dictionary and reset file name field', () => {
        const submit = spyOn(component.adminService, 'onSubmit');
        component.onSubmitDictionary();
        expect(submit).toHaveBeenCalledTimes(1);
        expect(component.fileInput.nativeElement.value).toEqual('');
    });

    it('should cancel reset confirmation when cancelReset is called', () => {
        component.isResetConfirmation = true;
        component.cancelReset();
        expect(component.isResetConfirmation).toBeFalse();
    });

    it('should not change reset confirmation when cancelReset is called and reset confirmation is false', () => {
        component.isResetConfirmation = false;
        component.cancelReset();
        expect(component.isResetConfirmation).toBeFalse();
    });
});
