import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PrototypeChatBoxComponent } from './prototype-chat-box.component';

describe('PrototypeChatBoxComponent', () => {
    let component: PrototypeChatBoxComponent;
    let fixture: ComponentFixture<PrototypeChatBoxComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [PrototypeChatBoxComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(PrototypeChatBoxComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
