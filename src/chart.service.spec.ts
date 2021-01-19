import {ComponentFixture, TestBed} from '@angular/core/testing';
import {NO_ERRORS_SCHEMA} from '@angular/core';
import * as Chart from 'chart.js';

import {ChartService} from './chart.service';
import {DashboardComponent} from 'src/app/shared/components/dashboard/dashboard.component';

describe('ChartService', () => {
  let service: ChartService;
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;

  const conf = {
    circleParts: [66, 33],
    innerText: ['1', '2', '3'],
  };

  const wrongHTMLRef: any = {
    nativeElement: document.createElement('button'),
  };

  beforeEach(async () => {
    TestBed.configureTestingModule({
      declarations: [DashboardComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    service = TestBed.inject(ChartService);
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it(
      'should be instanceable.',
      () => {
        expect(
            service,
        ).toBeInstanceOf(ChartService);
      },
  );

  it(
      `should only create Doughnut chart instances 
      for existing HTMLCanvasElements.`,
      () => {
        expect(
            service.createDoughnutChart(undefined, conf),
        ).toBeFalsy();

        expect(
            service.createDoughnutChart(wrongHTMLRef, conf),
        ).toBeFalsy();

        expect(
            service.createDoughnutChart(component.successRatioChart, conf),
        ).toBeInstanceOf(Chart);
      },
  );
});
