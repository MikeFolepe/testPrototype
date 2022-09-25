/* eslint-disable dot-notation */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { PLAYER_ONE_INDEX, RESERVE, TWO_SECOND_DELAY } from '@app/classes/constants';
import { MessageType } from '@app/classes/enum';
import { Player } from '@app/models/player.model';
import { SendMessageService } from '@app/services/send-message.service';
import { Socket } from 'socket.io-client';

describe('SendMessageService', () => {
    let service: SendMessageService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterTestingModule],
        });
        service = TestBed.inject(SendMessageService);

        const letterA = RESERVE[0];
        const letterB = RESERVE[1];
        const letterC = RESERVE[2];

        const firstPlayerEasel = [letterA, letterA, letterB, letterB, letterC, letterC, letterA];
        const firstPlayer = new Player(1, 'Player 1', firstPlayerEasel);
        service['playerService'].addPlayer(firstPlayer);

        let number = 1;
        service['displayMessage'] = () => {
            number = number *= 2;
            return;
        };
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('displaying a message should display the respective message and its type', () => {
        service.displayMessageByType('I am the player', MessageType.Player);
        expect(service.message).toEqual('I am the player');
        expect(service.messageType).toEqual(MessageType.Player);
    });

    it('displaying a message should display the respective message and its type', () => {
        service.displayMessageByType('I am the system', MessageType.System);
        expect(service.message).toEqual('I am the system');
        expect(service.messageType).toEqual(MessageType.System);
    });

    it('should sendOpponentMessage on receiveMessageFromOpponent', () => {
        const sendOpponentMessageSpy = spyOn(service, 'sendOpponentMessage');
        service['clientSocketService'].socket = {
            // eslint-disable-next-line no-unused-vars
            on: (eventName: string, callback: (message: string) => void) => {
                if (eventName === 'receiveRoomMessage') {
                    callback('fakeMessage');
                }
            },
        } as unknown as Socket;
        service.receiveMessageFromOpponent();
        expect(sendOpponentMessageSpy).toHaveBeenCalledWith('fakeMessage');
    });

    it('should send message as opponent when sendOpponentMessage() is called', () => {
        service.sendOpponentMessage('Opponent message');
        expect(service.message).toEqual('Opponent message');
        expect(service.messageType).toEqual(MessageType.Opponent);
    });

    it('the emit sendGameConversionMessage should send the parameters of message of switchMode', () => {
        const spyEmit = spyOn(service['clientSocketService'].socket, 'emit');
        service.sendConversionMessage();
        expect(spyEmit).toHaveBeenCalled();
    });

    it('should call displayMessageByType on event  receiveGameConversionMessage', () => {
        service['clientSocketService'].socket = {
            // eslint-disable-next-line no-unused-vars
            on: (eventName: string, callback: (message: string) => void) => {
                if (eventName === 'receiveGameConversionMessage') {
                    callback('message');
                }
            },
        } as unknown as Socket;
        spyOn(service, 'displayMessageByType');
        service.receiveConversionMessage();
        expect(service.displayMessageByType).toHaveBeenCalledWith('message', MessageType.System);
    });

    it('the emit sendGameConversionMessage should call sendOpponentMessage', () => {
        service['clientSocketService'].socket = {
            // eslint-disable-next-line no-unused-vars
            on: (eventName: string, callback: (message: string) => void) => {
                if (eventName === 'receiveRoomMessage') {
                    callback('test');
                }
            },
        } as unknown as Socket;
        spyOn(service, 'sendOpponentMessage');
        service.receiveMessageFromOpponent();
        expect(service.sendOpponentMessage).toHaveBeenCalledWith('test');
    });

    it('displayBound should associate a function to displayMessage', () => {
        const functionTest = () => {
            return;
        };
        service.displayBound(functionTest);
        expect(service['displayMessage']).toEqual(functionTest);
    });

    it('displaying a message should display the respective message and its type', () => {
        service.displayMessageByType('I am the system', MessageType.System);
        expect(service.message).toEqual('I am the system');
        expect(service.messageType).toEqual(MessageType.System);
    });

    it('calling displayFinalMessage should send the respective message to the chatbox', () => {
        jasmine.clock().install();
        spyOn(service, 'displayMessageByType');
        service.displayFinalMessage(PLAYER_ONE_INDEX);
        jasmine.clock().tick(TWO_SECOND_DELAY);
        expect(service.displayMessageByType).toHaveBeenCalledWith('Player 1 : AABBCCA', MessageType.System);
        jasmine.clock().uninstall();
    });
});
