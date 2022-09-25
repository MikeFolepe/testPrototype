/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-magic-numbers */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable dot-notation */
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { RouterTestingModule } from '@angular/router/testing';
import { ERROR_MESSAGE_DELAY } from '@app/classes/constants';
import { AiType } from '@common/ai-name';
import { GameSettings } from '@common/game-settings';
import { GameType } from '@common/game-type';
import { Room, State } from '@common/room';
import { of } from 'rxjs';
import { Socket } from 'socket.io-client';
import { JoinRoomComponent } from './join-room.component';

describe('JoinRoomComponent', () => {
    let component: JoinRoomComponent;
    let fixture: ComponentFixture<JoinRoomComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [JoinRoomComponent],
            imports: [RouterTestingModule],
            providers: [
                {
                    provide: MatDialog,
                    useValue: {},
                },
            ],
            schemas: [NO_ERRORS_SCHEMA],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(JoinRoomComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should return the state of room is the state is waiting', () => {
        expect(component.computeRoomState(State.Playing)).toEqual('Indisponible');
    });

    it('should return the state of room is the state is Playing', () => {
        expect(component.computeRoomState(State.Waiting)).toEqual('En attente');
    });

    it('should save rooms given in argument with their configurations', () => {
        component['clientSocketService'].gameType = GameType.Classic;
        const settings: GameSettings = new GameSettings(['mi', 'ma'], 1, '01', '00', AiType.beginner, 'Activer', 'francais', '');
        const expectedRooms = [[new Room('room', 'socket', settings, State.Waiting)], []];
        component['clientSocketService'].socket = {
            on: (eventName: string, callback: (room: Room[][]) => void) => {
                if (eventName === 'roomConfiguration') {
                    callback(expectedRooms);
                }
            },
        } as unknown as Socket;
        component['configureRooms']();
        expect(component.rooms).toEqual(expectedRooms[0]);
    });

    it('should correctly handle room unavailability', () => {
        jasmine.clock().install();
        component['clientSocketService'].socket = {
            on: (eventName: string, callback: () => void) => {
                if (eventName === 'roomAlreadyToken') {
                    callback();
                }
            },
        } as unknown as Socket;
        component['handleRoomUnavailability']();
        expect(component.shouldDisplayJoinError).toEqual(true);
        jasmine.clock().tick(ERROR_MESSAGE_DELAY);
        expect(component.shouldDisplayJoinError).toEqual(false);
        jasmine.clock().uninstall();
    });

    it('should correctly compute the room item index onPageChange', () => {
        const event: PageEvent = new PageEvent();
        event.pageIndex = 2;
        event.pageSize = 1;
        const expectedRoomItemIndex = event.pageIndex * event.pageSize;
        component.onPageChange(event);
        expect(component.roomItemIndex).toEqual(expectedRoomItemIndex);
    });

    it('should return if the name is null', () => {
        const settings: GameSettings = new GameSettings(['mi', ''], 1, '01', '00', AiType.beginner, 'Activer', 'francais', '');
        const expectedRooms = [new Room('room', 'socket', settings, State.Waiting)];
        const matDialogRefMock = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        matDialogRefMock.afterClosed.and.callFake(() => {
            return of(null);
        });
        const matDialogMock = jasmine.createSpyObj('MatDialog', ['open']);
        matDialogMock.open.and.callFake(() => {
            return matDialogRefMock;
        });
        component.dialog = matDialogMock;
        component.join(expectedRooms[0]);
        expect(expectedRooms[0].gameSettings.playersNames[1]).toEqual('');
    });

    it('should set display error message return if the customer name is equal OwnerName', () => {
        jasmine.clock().install();
        const settings: GameSettings = new GameSettings(['mi', ''], 1, '01', '00', AiType.beginner, 'Activer', 'francais', '');
        const expectedRooms = [new Room('room', 'socket', settings, State.Waiting)];
        const matDialogRefMock = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        matDialogRefMock.afterClosed.and.callFake(() => {
            return of('mi');
        });
        const matDialogMock = jasmine.createSpyObj('MatDialog', ['open']);
        matDialogMock.open.and.callFake(() => {
            return matDialogRefMock;
        });
        component.dialog = matDialogMock;
        component.join(expectedRooms[0]);
        jasmine.clock().tick(5000);
        expect(expectedRooms[0].gameSettings.playersNames[1]).toEqual('');
        expect(component.shouldDisplayJoinError).toEqual(false);
        jasmine.clock().uninstall();
    });
    it('should not emit an event to place randomly a player in the room in the name is not null', () => {
        const matDialogRefMock = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        matDialogRefMock.afterClosed.and.callFake(() => {
            return of('Mike');
        });
        const matDialogMock = jasmine.createSpyObj('MatDialog', ['open']);
        matDialogMock.open.and.callFake(() => {
            return matDialogRefMock;
        });
        component.dialog = matDialogMock;
        component.placeRandomly();
        const spyEmit = spyOn(component['clientSocketService'].socket, 'emit');
        expect(spyEmit).not.toHaveBeenCalled();
    });
    it('should emit an event to add new Customer if his name is different of the  OwnerName', () => {
        const settings: GameSettings = new GameSettings(['mi', ''], 1, '01', '00', AiType.beginner, 'Activer', 'francais', '');
        const expectedRooms = [new Room('room', 'socket', settings, State.Waiting)];
        const matDialogRefMock = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        matDialogRefMock.afterClosed.and.callFake(() => {
            return of('MIke');
        });
        const matDialogMock = jasmine.createSpyObj('MatDialog', ['open']);
        matDialogMock.open.and.callFake(() => {
            return matDialogRefMock;
        });
        component.dialog = matDialogMock;
        component.join(expectedRooms[0]);
        expect(expectedRooms[0].gameSettings.playersNames[1]).toEqual('');
        expect(expectedRooms[0].id).toEqual('room');
    });

    it('should not emit an event to place randomly a player in the room in the name is null', () => {
        const matDialogRefMock = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        matDialogRefMock.afterClosed.and.callFake(() => {
            return of(null);
        });
        const matDialogMock = jasmine.createSpyObj('MatDialog', ['open']);
        matDialogMock.open.and.callFake(() => {
            return matDialogRefMock;
        });
        component.dialog = matDialogMock;
        component.placeRandomly();
        const spyEmit = spyOn(component['clientSocketService'].socket, 'emit');
        expect(spyEmit).not.toHaveBeenCalled();
    });

    it('should on at the event ReceiveRandomPlacement form the server', () => {
        const fakeCustomerName = 'Mike';
        const myIdRoom = '1';
        component['clientSocketService'].socket = {
            on: (eventName: string, callback: (customer: string, id: string) => void) => {
                if (eventName === 'receiveCustomerOfRandomPlacement') {
                    callback(fakeCustomerName, myIdRoom);
                }
            },
            emit: (eventName: string, _args: any[] | any) => {
                return;
            },
        } as unknown as Socket;
        component['receiveRandomPlacement']();
        const spyEmit = spyOn(component['clientSocketService'].socket, 'emit');
        expect(spyEmit).not.toHaveBeenCalled();
    });

    it('should on at the event ReceiveRoomAvailable form the server and set the isRoomAvailable at false', () => {
        component['clientSocketService'].gameType = GameType.Classic;
        const numberOfMyRoom = [0, 0];
        component['clientSocketService'].socket = {
            on: (eventName: string, callback: (numberOfRooms: number[]) => void) => {
                if (eventName === 'roomAvailable') {
                    callback(numberOfMyRoom);
                }
            },
        } as unknown as Socket;
        component['receiveRoomAvailable']();

        expect(component.isRoomAvailable).toEqual(false);
    });

    it('should on at the event ReceiveRoomAvailable form the server and set the isRoomAvailable at true and buttonAvailability at false', () => {
        const numberOfMyRoom = [1, 0];
        component['clientSocketService'].gameType = GameType.Classic;
        component['clientSocketService'].socket = {
            on: (eventName: string, callback: (numberOfRooms: number[]) => void) => {
                if (eventName === 'roomAvailable') {
                    callback(numberOfMyRoom);
                }
            },
        } as unknown as Socket;
        component['receiveRoomAvailable']();
        expect(component.isRoomAvailable).toEqual(true);
        expect(component.isRandomButtonAvailable).toEqual(false);
    });
    it('should on at the event ReceiveRoomAvailable form the server and set the isRoomAvailable at true and buttonAvailability at true', () => {
        component['clientSocketService'].gameType = GameType.Classic;
        const numberOfMyRoom = [2, 0];
        component['clientSocketService'].socket = {
            on: (eventName: string, callback: (numberOfRooms: number[]) => void) => {
                if (eventName === 'roomAvailable') {
                    callback(numberOfMyRoom);
                }
            },
        } as unknown as Socket;
        component['receiveRoomAvailable']();
        expect(component.isRoomAvailable).toEqual(true);
        expect(component.isRandomButtonAvailable).toEqual(true);
    });
});
