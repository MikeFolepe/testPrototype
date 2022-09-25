/* eslint-disable @typescript-eslint/no-explicit-any */
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DEFAULT_FONT_SIZE, SIZE_VARIATION } from '@app/classes/constants';
import { FontSizeComponent } from './font-size.component';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatSliderModule } from '@angular/material/slider';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('FontSizeComponent', () => {
    let component: FontSizeComponent;
    let fixture: ComponentFixture<FontSizeComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [FontSizeComponent],
            imports: [MatSliderModule, MatIconModule, FormsModule],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(FontSizeComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
        component.fontSize = DEFAULT_FONT_SIZE;
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should decrement fontSize', () => {
        const resizeSpy = spyOn(component, 'resize').and.callThrough();
        const expectedFontSize = DEFAULT_FONT_SIZE - 1;
        component.decrement();
        expect(resizeSpy).toHaveBeenCalled();
        expect(component.fontSize).toEqual(expectedFontSize);
    });

    it('should increment fontSize', () => {
        const resizeSpy = spyOn(component, 'resize').and.callThrough();
        const expectedFontSize = DEFAULT_FONT_SIZE + 1;
        component.increment();
        expect(resizeSpy).toHaveBeenCalled();
        expect(component.fontSize).toEqual(expectedFontSize);
    });

    it('should emit fontSize', () => {
        spyOn<any>(component.sizeChange, 'emit');
        component.resize(SIZE_VARIATION);
        expect(component.sizeChange.emit).toHaveBeenCalled();
    });
});
