import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import * as d3 from 'd3';

@Component({
  selector: 'app-bar',
  standalone: true,
  imports: [],
  templateUrl: './bar.component.html',
  styleUrls: ['./bar.component.scss'],
})
export class BarComponent implements OnInit {
  private data: Array<any> = [];
  private margin = { top: 20, right: 30, bottom: 50, left: 40 };
  private width = 800 - this.margin.left - this.margin.right;
  private height = 400 - this.margin.top - this.margin.bottom;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Carrega o CSV apenas no navegador
      this.loadData();
    } else {
      console.log('SSR detected: Skipping CSV loading.');
    }
  }

  private loadData(): void {
    d3.csv('assets/data/serie_historica_tratada_casos.csv')
      .then((data) => {
        console.log('CSV Data:', data);
        this.data = data.map((d: any) => ({
          state: d.State_Name,
          value: +d.Value,
        }));
        this.createChart(); // Cria o gráfico após carregar os dados
      })
      .catch((error) => {
        console.error('Error loading CSV:', error);
      });
  }

  private createChart(): void {
    const svg = d3
      .select('#bar-chart')
      .append('svg')
      .attr('width', this.width + this.margin.left + this.margin.right)
      .attr('height', this.height + this.margin.top + this.margin.bottom)
      .append('g')
      .attr(
        'transform',
        `translate(${this.margin.left},${this.margin.top})`
      );

    const x = d3
      .scaleBand()
      .domain(this.data.map((d) => d.state))
      .range([0, this.width])
      .padding(0.2);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(this.data, (d) => d.value) || 0])
      .range([this.height, 0]);

    svg
      .append('g')
      .attr('transform', `translate(0, ${this.height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end');

    svg.append('g').call(d3.axisLeft(y));

    svg
      .selectAll('rect')
      .data(this.data)
      .enter()
      .append('rect')
      .attr('x', (d) => x(d.state)!)
      .attr('y', (d) => y(d.value))
      .attr('width', x.bandwidth())
      .attr('height', (d) => this.height - y(d.value))
      .attr('fill', 'steelblue');
  }
}
