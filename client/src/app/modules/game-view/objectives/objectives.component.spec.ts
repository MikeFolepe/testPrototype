import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { ObjectivesComponent } from './objectives.component';

describe('ObjectivesComponent', () => {
    let component: ObjectivesComponent;
    let fixture: ComponentFixture<ObjectivesComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ObjectivesComponent],
            imports: [HttpClientTestingModule, RouterTestingModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ObjectivesComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
