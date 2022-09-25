/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable dot-notation */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { ONE_SECOND_DELAY } from '@app/classes/constants';
import { MessageType } from '@app/classes/enum';
import { ChatboxComponent } from '@app/modules/game-view//chatbox/chatbox.component';
import { GameType } from '@common/game-type';

describe('ChatBoxComponent', () => {
    let component: ChatboxComponent;
    let fixture: ComponentFixture<ChatboxComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [ChatboxComponent],
            imports: [FormsModule, HttpClientTestingModule, RouterTestingModule],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(ChatboxComponent);
        jasmine.clock().install();
        component = fixture.componentInstance;
        jasmine.clock().tick(ONE_SECOND_DELAY + 1);
        fixture.detectChanges();
    });

    afterEach(() => {
        jasmine.clock().uninstall();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should call bindDisplay on init', () => {
        const spy = spyOn<any>(component['sendMessageService'], 'displayBound').and.callThrough();
        component.ngOnInit();
        expect(spy).toHaveBeenCalled();
    });

    it('should know when Enter key is pressed', () => {
        const enterEvent = new KeyboardEvent('keydown', {
            code: 'Enter',
            key: 'Enter',
            charCode: 13,
            keyCode: 13,
            view: window,
            bubbles: true,
        });
        const notEnterEvent = new KeyboardEvent('keydown', {
            code: 'test',
            key: 'test',
            charCode: 13,
            keyCode: 13,
            view: window,
            bubbles: true,
        });
        spyOn(component['chatBoxService'], 'sendPlayerMessage');
        spyOn(component, 'scrollToBottom').and.callThrough();
        component.handleKeyEvent(notEnterEvent);
        expect(component['chatBoxService'].sendPlayerMessage).not.toHaveBeenCalledTimes(1);

        component.handleKeyEvent(enterEvent);
        expect(component['chatBoxService'].sendPlayerMessage).toHaveBeenCalledTimes(1);
        jasmine.clock().tick(2);
        expect(component.scrollToBottom).toHaveBeenCalledTimes(1);
    });

    it('should send message as System when sendSystemMessage() is called', () => {
        expect(component.listTypes).toHaveSize(2);
        expect(component.listMessages).toHaveSize(2);
        expect(component.listTypes[0]).toEqual(MessageType.System);
    });

    it('should know the type of the game', () => {
        const sendSystemMessage = spyOn(component, 'sendSystemMessage');
        component['gameSettingsService'].gameType = GameType.Log2990;
        component.ngOnInit();
        expect(sendSystemMessage).toHaveBeenCalledWith('Début de la partie, mode LOG2990.');
        component['gameSettingsService'].gameType = GameType.Classic;
        component.ngOnInit();
        expect(sendSystemMessage).toHaveBeenCalledWith('Début de la partie, mode Classique.');
    });

    it('should use the message and the type from sendMessageService when we display a message', () => {
        component['sendMessageService'].message = 'Service message';
        component['sendMessageService'].messageType = MessageType.System;
        component.displayMessageByType();
        expect(component.listMessages.pop()).toEqual(component['sendMessageService'].message);
        expect(component.listTypes.pop()).toEqual(component['sendMessageService'].messageType);
    });

    it('Clicking in the chatbox should call cancelPlacement from BoardHandlerService', () => {
        spyOn(component['boardHandlerService'], 'cancelPlacement');
        const event = new MouseEvent('mouseup');
        fixture.elementRef.nativeElement.dispatchEvent(event);
        expect(component['boardHandlerService'].cancelPlacement).toHaveBeenCalled();
    });

    it('should display the message and the error message if the command is invalid', () => {
        component['sendMessageService'].message = 'Error message';
        component['sendMessageService'].messageType = MessageType.Error;
        const invalidCommand = '!placer';
        component.message = invalidCommand;
        component.displayMessageByType();
        expect(component.listMessages.pop()).toEqual(component['sendMessageService'].message);
        expect(component.listTypes.pop()).toEqual(component['sendMessageService'].messageType);
        expect(component.listMessages.pop()).toEqual(invalidCommand);
        expect(component.listTypes.pop()).toEqual(component['sendMessageService'].messageType);
    });

    it('tests initialize chat height in log2990 mode', () => {
        const dummyElement = document.createElement('div');
        document.getElementById = jasmine.createSpy('HTML Element').and.returnValue(dummyElement);
        component['gameSettingsService'].gameType = GameType.Log2990;
        component.initializeChatHeight();
        expect(document.getElementById).toHaveBeenCalled();
    });

    it('should not initialize chat height in classic mode when not finding the element', () => {
        document.getElementById = jasmine.createSpy('HTML Element').and.returnValue(undefined);
        component['gameSettingsService'].gameType = GameType.Classic;
        component.initializeChatHeight();
        expect(document.getElementById).toHaveBeenCalled();
    });
});
