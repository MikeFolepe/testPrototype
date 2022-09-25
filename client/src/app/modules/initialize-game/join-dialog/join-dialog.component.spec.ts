import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { JoinDialogComponent } from './join-dialog.component';

describe('DialogComponent', () => {
    let component: JoinDialogComponent;
    let fixture: ComponentFixture<JoinDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [JoinDialogComponent],
            providers: [
                {
                    provide: MatDialogRef,
                    useValue: {},
                },
            ],
            imports: [ReactiveFormsModule, FormsModule, MatFormFieldModule, MatInputModule, BrowserAnimationsModule, MatDialogModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(JoinDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
