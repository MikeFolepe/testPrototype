// JUSTIFICATION: The '_' are native to _MatPaginatorIntl attributes
/* eslint-disable no-underscore-dangle */
/* eslint-disable prettier/prettier */
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginatorIntl, PageEvent } from '@angular/material/paginator';
import { ERROR_MESSAGE_DELAY } from '@app/classes/constants';
import { NameSelectorComponent } from '@app/modules/initialize-game/name-selector/name-selector.component';
import { ClientSocketService } from '@app/services/client-socket.service';
import { PlayerIndex } from '@common/player-index';
import { Room, State } from '@common/room';

@Component({
    selector: 'app-join-room',
    templateUrl: './join-room.component.html',
    styleUrls: ['./join-room.component.scss'],
})
export class JoinRoomComponent implements OnInit {
    rooms: Room[];
    roomItemIndex: number;
    pageSize: number;
    shouldDisplayNameError: boolean;
    shouldDisplayJoinError: boolean;
    isRoomAvailable: boolean;
    isRandomButtonAvailable: boolean;

    // JUSTIFICATION : must name service as it is named in MatPaginatorIntl
    // eslint-disable-next-line @typescript-eslint/naming-convention
    constructor(private clientSocketService: ClientSocketService, public dialog: MatDialog, public _MatPaginatorIntl: MatPaginatorIntl) {
        this.rooms = [];
        this.roomItemIndex = 0;
        // 2 rooms per page
        this.pageSize = 2;
        this.shouldDisplayNameError = false;
        this.shouldDisplayJoinError = false;
        this.isRoomAvailable = false;
        this.isRandomButtonAvailable = false;
        this.clientSocketService.socket.connect();
        this.clientSocketService.socket.emit('getRoomsConfiguration');
        this.clientSocketService.socket.emit('getRoomAvailable');
        // Method for button and others
        this.receiveRoomAvailable();
        this.receiveRandomPlacement();
        this.clientSocketService.routeToGameView();
    }

    ngOnInit(): void {
        this.configureRooms();
        this.receiveRoomAvailable();
        this.handleRoomUnavailability();
        this.receiveRandomPlacement();

        this._MatPaginatorIntl.itemsPerPageLabel = 'Salons par page';
        this._MatPaginatorIntl.firstPageLabel = 'Première page';
        this._MatPaginatorIntl.lastPageLabel = 'Dernière page';
        this._MatPaginatorIntl.nextPageLabel = 'Page suivante';
        this._MatPaginatorIntl.previousPageLabel = 'Page précédente';

        // This function is not crucial for our application, it's important to have some texts in french
        // as we are missing, we did not cover these lines in the tests.
        const frenchRangeLabel = (page: number, pageSize: number, length: number) => {
            if (length === 0 || pageSize === 0) return `0 de ${length}`;
            length = Math.max(length, 0);
            const startIndex = page * pageSize;
            // If the start index exceeds the list length, do not try and fix the end index to the end.
            const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
            return `${startIndex + 1} - ${endIndex} de ${length}`;
        };

        this._MatPaginatorIntl.getRangeLabel = frenchRangeLabel;
    }

    onPageChange(event: PageEvent): void {
        // Set the offset for the view
        this.roomItemIndex = event.pageSize * event.pageIndex;
    }

    computeRoomState(state: State): string {
        return state === State.Waiting ? 'En attente' : 'Indisponible';
    }

    join(room: Room): void {
        this.dialog
            .open(NameSelectorComponent, { disableClose: true })
            .afterClosed()
            .subscribe((playerName: string) => {
                // if user closes the dialog box without input nothing
                if (playerName === null) return;
                // if names are equals
                if (room.gameSettings.playersNames[PlayerIndex.OWNER] === playerName) {
                    this.shouldDisplayNameError = true;
                    setTimeout(() => {
                        this.shouldDisplayNameError = false;
                    }, ERROR_MESSAGE_DELAY);
                    return;
                }
                this.clientSocketService.socket.emit('newRoomCustomer', playerName, room.id);
            });
    }

    placeRandomly(): void {
        this.dialog
            .open(NameSelectorComponent, { disableClose: true })
            .afterClosed()
            .subscribe((playerName: string) => {
                // if user closes the dialog box without input nothing
                if (playerName === null) return;
                this.clientSocketService.socket.emit('newRoomCustomerOfRandomPlacement', playerName, this.clientSocketService.gameType);
            });
    }
    receiveRandomPlacement(): void {
        this.clientSocketService.socket.on('receiveCustomerOfRandomPlacement', (customerName: string, roomId: string) => {
            this.clientSocketService.socket.emit('newRoomCustomer', customerName, roomId);
        });
    }

    receiveRoomAvailable(): void {
        this.clientSocketService.socket.on('roomAvailable', (numberOfRooms: number[]) => {
            if (numberOfRooms[this.clientSocketService.gameType] === 0) {
                this.isRoomAvailable = false;
                return;
            } else if (numberOfRooms[this.clientSocketService.gameType] === 1) {
                this.isRoomAvailable = true;
                this.isRandomButtonAvailable = false;
            } else {
                this.isRoomAvailable = true;
                this.isRandomButtonAvailable = true;
            }
        });
    }

    private handleRoomUnavailability(): void {
        this.clientSocketService.socket.on('roomAlreadyToken', () => {
            this.shouldDisplayJoinError = true;
            setTimeout(() => {
                this.shouldDisplayJoinError = false;
            }, ERROR_MESSAGE_DELAY);
            return;
        });
    }
    private configureRooms(): void {
        this.clientSocketService.socket.on('roomConfiguration', (rooms: Room[][]) => {
            this.rooms = rooms[this.clientSocketService.gameType];
        });
    }
}
