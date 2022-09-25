import { AppComponent } from '@app/pages/app/app.component';
import { AppRoutingModule } from '@app/modules/app-routing.module';
import { TestBed } from '@angular/core/testing';

describe('AppComponent', () => {
    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [AppRoutingModule],
            declarations: [AppComponent],
        }).compileComponents();
    });

    it('should create the app', () => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.componentInstance;
        expect(app).toBeTruthy();
    });
});
