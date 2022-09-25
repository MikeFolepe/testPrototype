import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ERROR_MESSAGE_DELAY } from '@app/classes/constants';

@Injectable({
    providedIn: 'root',
})
export class ErrorHandlerService {
    serverError: string;
    constructor() {
        this.serverError = '';
    }

    handleRequestError(error: HttpErrorResponse): void {
        this.displayServerError(`Nous n'avons pas pu accéder au serveur, erreur : ${error.message}`);
    }

    private displayServerError(uploadMessage: string): void {
        if (this.serverError.length) return; // There is already a message occurring
        this.serverError = uploadMessage;
        setTimeout(() => {
            this.serverError = '';
        }, ERROR_MESSAGE_DELAY);
    }
}
