import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { GiveUpGameDialogComponent } from './give-up-game-dialog.component';

describe('GiveUpGameDialogComponent', () => {
    let component: GiveUpGameDialogComponent;
    let fixture: ComponentFixture<GiveUpGameDialogComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [GiveUpGameDialogComponent],
            providers: [
                {
                    provide: MatDialogRef,
                    useValue: {},
                },
            ],
            imports: [
                ReactiveFormsModule,
                FormsModule,
                MatFormFieldModule,
                MatInputModule,
                BrowserAnimationsModule,
                RouterTestingModule,
                HttpClientTestingModule,
            ],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(GiveUpGameDialogComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
