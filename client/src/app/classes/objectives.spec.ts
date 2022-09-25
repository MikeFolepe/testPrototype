/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { OBJECTIVES } from '@app/classes/objectives';
import { ObjectivesService } from '@app/services/objectives.service';

describe('Objectives', () => {
    let objectiveService: ObjectivesService;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule, RouterTestingModule],
        });
        objectiveService = TestBed.inject(ObjectivesService);
    });

    it('should be created', () => {
        expect(objectiveService).toBeTruthy();
    });

    it('should call the function validate', () => {
        const spyOnValidate1 = spyOn<any>(objectiveService, 'validateObjectiveOne');
        const spyOnValidate2 = spyOn<any>(objectiveService, 'validateObjectiveTwo');
        const spyOnValidate3 = spyOn<any>(objectiveService, 'validateObjectiveThree');
        const spyOnValidate4 = spyOn<any>(objectiveService, 'validateObjectiveFour');
        const spyOnValidate5 = spyOn<any>(objectiveService, 'validateObjectiveFive');
        const spyOnValidate6 = spyOn<any>(objectiveService, 'validateObjectiveSix');
        const spyOnValidate7 = spyOn<any>(objectiveService, 'validateObjectiveSeven');
        const spyOnValidate8 = spyOn<any>(objectiveService, 'validateObjectiveEight');

        for (const objective of OBJECTIVES) {
            objective.validate(objectiveService);
        }

        expect(spyOnValidate1).toHaveBeenCalledTimes(1);
        expect(spyOnValidate2).toHaveBeenCalledTimes(1);
        expect(spyOnValidate3).toHaveBeenCalledTimes(1);
        expect(spyOnValidate4).toHaveBeenCalledTimes(1);
        expect(spyOnValidate5).toHaveBeenCalledTimes(1);
        expect(spyOnValidate6).toHaveBeenCalledTimes(1);
        expect(spyOnValidate7).toHaveBeenCalledTimes(1);
        expect(spyOnValidate8).toHaveBeenCalledTimes(1);
    });
});
