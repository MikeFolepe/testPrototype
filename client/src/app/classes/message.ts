export class Message {
    messageTime: string;
    constructor(public message: string, public messageUser: string) {
        this.messageTime = new Date().getHours().toString() + ':' + new Date().getMinutes().toString() + ':' + new Date().getHours().toString();
    }
}
