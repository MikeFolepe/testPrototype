import { HttpException } from './http.exception';
import { describe } from 'mocha';
import { expect } from 'chai';

describe('HttpException', () => {
    it('should create a simple HTTPException', () => {
        const createdMessage = 'Course created successfully';
        const httpException: HttpException = new HttpException(createdMessage);
        expect(httpException.message).to.equals(createdMessage);
    });
});
