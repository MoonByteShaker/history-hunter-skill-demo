/* eslint-disable */ 

/*
Brief introduction about the purpose of this service:
  In my application's dashboard, the user should graphically,
  have an overview of both the won and lost
  Games, as well as the status of his point level. This
  graphically overview is implemented with PieCharts.
*/

/*
  The functions are arranged according to their degree
  of abstraction and are structured according to the
  single-responsiblity principle.
*/

import {ElementRef, Injectable} from '@angular/core';
import {Chart} from 'chart.js';

/*
make it tree shakable. better to not bloat the bundles.
*/
@Injectable({
  providedIn: 'root',
})

export class ChartService {
  constructor() {
    this.registerInnerChartText();
  };

  registerInnerChartText(): void {
    Chart.pluginService.register({
      beforeDraw: this.setInnerChartText.bind(this),
    });
  };

  private setInnerChartText(
      this: ChartService,
      chart: Chart,
  ): void {
    const canvas = chart.ctx;

    /*
      Prefer early returns. This makes
      functions easier to read and more
      predictable as they only do their
      assigned task at the end of their
      body.
    */
    if (ChartServiceHelper.isNotCanvas(canvas)) {
      return;
    }

    this.setChartFont(canvas);

    /*
      In order to follow the principle of
      single-responsibility, the case distinction
      in which context the functional core is to
      be executed was outsourced to another function.

      If there were a higher number of case distinctions,
      I would have used the strategy pattern instead.
    */
    this.passThroughToLines(chart, (text, posX, posY) => {
      canvas.restore();
      canvas.fillText(text, posX, posY);
      canvas.save();
    });
  };

  private passThroughToLines:ServiceTypes.PassThrough = function(
      chart,
      drawSingleLineText,
  ) {
    /* eslint-disable no-invalid-this */
    const text = chart.options.title?.text;

    if (typeof text === 'string') {
      this.handleSingleLine(chart, drawSingleLineText);
    }

    if (Array.isArray(text)) {
      this.handleMultipleLines(chart, drawSingleLineText);
    }
  };

  /*
    The functions "handleSingleLine" and "handleMultipleLines"
    are outsourced from "passThroughToLines" to keep the
    principle of single-responsibility.
  */
  private handleSingleLine: ServiceTypes.PassThrough = (
      chart,
      drawSingleLineText,
  ) => {
    const text = chart.options.title?.text;
    if (typeof text !== 'string') {
      return;
    }
    const posX = ChartServiceHelper.getTextCenterX(text, chart);
    const posY = ChartServiceHelper.getTextCenterY(chart);
    drawSingleLineText(text, posX, posY);
  };

  private handleMultipleLines: ServiceTypes.PassThrough = (
      chart,
      drawSingleLineText,
  ) => {
    const text = chart.options.title?.text;

    if (ChartServiceHelper.isNotArray(text)) {
      return;
    }

    const singleRowHeight = parseInt(ChartServiceHelper.getFontSize(chart));
    const totalRowHeight = singleRowHeight * text.length;

    let posX = 0;
    let posY = ChartServiceHelper.getTextCenterY(chart) - totalRowHeight / 2;

    text.forEach((textItem) => {
      posX = ChartServiceHelper.getTextCenterX(textItem, chart);
      posY += singleRowHeight;
      drawSingleLineText(textItem, posX, posY);
    });
  };

  private setChartFont(
      canvas: CanvasRenderingContext2D,
  ): void {
    /*
      Always prefer readability before the tempting one-liner.
    */
    const pageDomStyle: CSSStyleDeclaration = getComputedStyle(document.body);
    canvas.font = pageDomStyle.getPropertyValue('font');
  };

  createDoughnutChart(
      chartRef: ElementRef<HTMLCanvasElement> | undefined,
      conf: {
        circleParts: number[];
        innerText: string | string[];
        label?: string;
      },
  ): Chart | false {
    const pageDomStyle: CSSStyleDeclaration = getComputedStyle(document.body);
    const primCol = pageDomStyle.getPropertyValue('--ion-color-primary');
    const primColContrast = pageDomStyle.getPropertyValue('--ion-color-primary-second-contrast');
    const htmlCanvasElement = chartRef?.nativeElement;

    if (
      htmlCanvasElement === undefined ||
      htmlCanvasElement instanceof(HTMLCanvasElement) === false
    ) {
      return false;
    }

    return new Chart(htmlCanvasElement, {
      type: 'doughnut',
      data: {
        datasets: [
          {
            label: conf.label,
            data: conf.circleParts,
            backgroundColor: [primCol, primColContrast],
            borderWidth: 0,
          },
        ],
      },
      options: {
        title: {
          text: conf.innerText,
          fontSize: 40,
        },
        cutoutPercentage: 90,
        scales: {
          xAxes: [
            {
              gridLines: {
                display: false,
              },
              ticks: {
                display: false,
              },
            },
          ],
          yAxes: [
            {
              gridLines: {
                display: false,
              },
              ticks: {
                display: false,
              },
            },
          ],
        },
      },
    });
  };
};

/*
  The file has got too many lines in the meantime.
  It would be better to store the
  'ChartServiceHelper' module in a separate file.
*/
module ChartServiceHelper {
  export function isNotCanvas(
      canvas: CanvasRenderingContext2D | null,
  ): canvas is null {
    return (
      canvas === null ||
      canvas instanceof CanvasRenderingContext2D === false
    );
  };

  export function isNotArray(
      text: string | string[] | undefined,
  ): text is string | undefined {
    return (
      Array.isArray(text) === false
    );
  };

  export function getTextCenterX(
      text: string,
      chart: Chart,
  ): number {
    const canvas = chart.ctx;
    if (isNotCanvas(canvas)) {
      return 0;
    }
    const chartWidth = chart.width ?? 0;
    const textWidth = canvas.measureText(text).width;
    const xPos = Math.round((chartWidth - textWidth) / 2);

    return xPos;
  };

  export function getTextCenterY(
      chart: Chart,
  ): number {
    const canvas = chart.ctx;
    if (isNotCanvas(canvas)) {
      return 0;
    }

    const chartHeight = chart.height ?? 0;
    const yPos: number = chartHeight / 2;

    return yPos;
  };

  export function getFontSize(
      chart: Chart,
  ): string {
    const fontSize = getFontSizeFromDom() ??
                     getFontSizeFromChart(chart) ??
                     calculateFontSizeFromChart(chart);

    return fontSize as string;
  };

  export function getFontSizeFromDom(): string | false {
    const pageDomStyle: CSSStyleDeclaration = getComputedStyle(document.body);
    const fontSize: string = pageDomStyle.getPropertyValue('font-size');

    return fontSize ?? false;
  };

  export function getFontSizeFromChart(
      chart: Chart,
  ): string | false {
    const canvas = chart.ctx;

    if (isNotCanvas(canvas)) {
      return false;
    }

    const fontSize = canvas.font.split(' ').find(
        (fontDeclaration) => fontDeclaration.includes('px'),
    );

    return fontSize ?? false;
  };

  export function calculateFontSizeFromChart(
      chart: Chart,
  ): string | false {
    const GRID_ROWS = 12;
    if (chart.height === null) {
      return false;
    }

    const fontSize = Number(chart.height / GRID_ROWS);

    return `${fontSize}px`;
  };
};

module ServiceTypes {
  export type PassThrough = (
    this: ChartService,
    chart: Chart,
    drawSingleLineText: (
      text: string,
      posX: number,
      posY: number,
    ) => void,
  ) => void;
};
