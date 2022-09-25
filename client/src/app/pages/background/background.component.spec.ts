import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BackgroundComponent } from './background.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

describe('BackgroundComponent', () => {
    let component: BackgroundComponent;
    let fixture: ComponentFixture<BackgroundComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [BackgroundComponent],
            imports: [BrowserAnimationsModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(BackgroundComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should have a boolean for dark theme', () => {
        expect(component.isDark).toBeInstanceOf(Boolean);
    });
});
