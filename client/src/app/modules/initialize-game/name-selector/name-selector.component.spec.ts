import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NameSelectorComponent } from './name-selector.component';

describe('DialogComponent', () => {
    let component: NameSelectorComponent;
    let fixture: ComponentFixture<NameSelectorComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [NameSelectorComponent],
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
        fixture = TestBed.createComponent(NameSelectorComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
