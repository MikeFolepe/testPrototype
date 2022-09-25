import { GameSettingsService } from '@app/services/game-settings.service';
import { TestBed } from '@angular/core/testing';

describe('GameSettingsService', () => {
    let service: GameSettingsService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(GameSettingsService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
