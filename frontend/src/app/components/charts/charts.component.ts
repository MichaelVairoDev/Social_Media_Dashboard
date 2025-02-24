import { Component, OnInit, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { SocialService } from '../../services/social.service';
import { PlatformComparison } from '../../models/social-metric.model';
import * as d3 from 'd3';
import { TestModeService } from '../../services/test-mode.service';

@Component({
  selector: 'app-charts',
  template: `
    <div class="dashboard-header d-flex justify-content-between align-items-center">
      <div>
        <h1 class="dashboard-title">Gráficos</h1>
        <p class="text-muted">Visualización de métricas de redes sociales</p>
      </div>
      <div *ngIf="testMode" class="test-mode-badge">
        <span class="badge bg-warning text-dark">
          <i class="bi bi-exclamation-triangle-fill me-1"></i>
          Modo Prueba Activo
        </span>
      </div>
    </div>

    <div class="alert alert-info mb-4" *ngIf="testMode">
      <i class="bi bi-info-circle-fill me-2"></i>
      Estás viendo gráficos basados en datos de prueba generados automáticamente. Estos datos no son reales.
    </div>

    <div class="row mb-4">
      <div class="col-md-6">
        <div class="card">
          <div class="card-header">
            <h5 class="card-title mb-0">Filtros</h5>
          </div>
          <div class="card-body">
            <div class="mb-3">
              <label class="form-label">Plataformas</label>
              <div class="d-flex flex-wrap gap-2">
                <div class="form-check form-check-inline" *ngFor="let platform of availablePlatforms">
                  <input 
                    class="form-check-input" 
                    type="checkbox" 
                    [id]="'platform-' + platform" 
                    [value]="platform"
                    [checked]="selectedPlatforms.includes(platform)"
                    (change)="togglePlatform(platform)"
                  >
                  <label class="form-check-label" [for]="'platform-' + platform">
                    <i class="bi me-1" [ngClass]="getPlatformIcon(platform)" [class]="getPlatformColor(platform)"></i>
                    {{ platform | titlecase }}
                  </label>
                </div>
              </div>
            </div>
            <div class="mb-3">
              <label class="form-label">Período</label>
              <select class="form-select" [(ngModel)]="selectedTimeframe" (change)="loadData()">
                <option value="week">Última semana</option>
                <option value="month">Último mes</option>
                <option value="year">Último año</option>
              </select>
            </div>
            <button class="btn btn-primary" (click)="loadData()">
              <i class="bi bi-arrow-repeat me-2"></i>Actualizar gráficos
            </button>
          </div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="card h-100">
          <div class="card-header">
            <h5 class="card-title mb-0">Leyenda</h5>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-6 mb-2" *ngFor="let platform of selectedPlatforms">
                <div class="d-flex align-items-center">
                  <div class="color-box me-2" [style.background-color]="getColorForPlatform(platform)"></div>
                  <span>
                    <i class="bi me-1" [ngClass]="getPlatformIcon(platform)" [class]="getPlatformColor(platform)"></i>
                    {{ platform | titlecase }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-md-12 mb-4">
        <div class="card">
          <div class="card-header">
            <h5 class="card-title mb-0">Seguidores por plataforma</h5>
          </div>
          <div class="card-body">
            <div #followersChart class="chart-container"></div>
          </div>
        </div>
      </div>
      <div class="col-md-12 mb-4">
        <div class="card">
          <div class="card-header">
            <h5 class="card-title mb-0">Engagement por plataforma</h5>
          </div>
          <div class="card-body">
            <div #engagementChart class="chart-container"></div>
          </div>
        </div>
      </div>
      <div class="col-md-12 mb-4">
        <div class="card">
          <div class="card-header">
            <h5 class="card-title mb-0">Publicaciones por plataforma</h5>
          </div>
          <div class="card-body">
            <div #postsChart class="chart-container"></div>
          </div>
        </div>
      </div>
    </div>

    <div class="text-center p-5" *ngIf="loading">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando...</span>
      </div>
      <p class="mt-2">Cargando datos para gráficos...</p>
    </div>
  `,
  styles: [`
    .chart-container {
      height: 350px;
      width: 100%;
    }
    .color-box {
      width: 20px;
      height: 20px;
      border-radius: 4px;
    }
    .test-mode-badge {
      animation: pulse 2s infinite;
    }
    
    @keyframes pulse {
      0% {
        opacity: 1;
      }
      50% {
        opacity: 0.7;
      }
      100% {
        opacity: 1;
      }
    }
  `]
})
export class ChartsComponent implements OnInit, AfterViewInit {
  @ViewChild('followersChart') private followersChartElement!: ElementRef;
  @ViewChild('engagementChart') private engagementChartElement!: ElementRef;
  @ViewChild('postsChart') private postsChartElement!: ElementRef;

  availablePlatforms: string[] = ['facebook', 'twitter', 'instagram', 'linkedin', 'youtube', 'tiktok', 'pinterest'];
  selectedPlatforms: string[] = ['facebook', 'twitter', 'instagram'];
  selectedTimeframe: string = 'month';
  
  comparisonData: PlatformComparison | null = null;
  loading = false;
  testMode = false;

  // Colores para las plataformas
  platformColors: {[key: string]: string} = {
    facebook: '#1877F2',
    twitter: '#1DA1F2',
    instagram: '#E4405F',
    linkedin: '#0A66C2',
    youtube: '#FF0000',
    tiktok: '#000000',
    pinterest: '#E60023'
  };

  constructor(
    private socialService: SocialService,
    private testModeService: TestModeService
  ) { }

  ngOnInit(): void {
    // Suscribirse a los cambios del modo de prueba
    this.testModeService.testMode$.subscribe(mode => {
      this.testMode = mode;
      this.loadData();
    });
  }

  ngAfterViewInit(): void {
    // Los gráficos se dibujarán cuando los datos estén disponibles
  }

  loadData(): void {
    this.loading = true;
    this.socialService.getAnalyticsByTimeframe(this.selectedTimeframe).subscribe({
      next: (data) => {
        // Agrupar datos por plataforma
        const groupedData: PlatformComparison = {};
        
        data.forEach(metric => {
          if (!groupedData[metric.platform]) {
            groupedData[metric.platform] = {
              followers: [],
              engagement: [],
              posts: [],
              timestamps: []
            };
          }
          
          groupedData[metric.platform].followers.push(metric.followers);
          groupedData[metric.platform].engagement.push(metric.engagement);
          groupedData[metric.platform].posts.push(metric.posts);
          groupedData[metric.platform].timestamps.push(metric.timestamp);
        });
        
        this.comparisonData = groupedData;
        this.loading = false;
        
        // Dibujar gráficos cuando los datos estén disponibles
        setTimeout(() => {
          this.drawFollowersChart();
          this.drawEngagementChart();
          this.drawPostsChart();
        }, 100);
      },
      error: (error) => {
        console.error('Error al cargar datos para gráficos:', error);
        this.loading = false;
      }
    });
  }

  togglePlatform(platform: string): void {
    const index = this.selectedPlatforms.indexOf(platform);
    if (index === -1) {
      this.selectedPlatforms.push(platform);
    } else {
      this.selectedPlatforms.splice(index, 1);
    }
    
    // Redibujar gráficos con las plataformas seleccionadas
    if (this.comparisonData) {
      this.drawFollowersChart();
      this.drawEngagementChart();
      this.drawPostsChart();
    }
  }

  drawFollowersChart(): void {
    if (!this.comparisonData || !this.followersChartElement) return;
    
    const element = this.followersChartElement.nativeElement;
    d3.select(element).selectAll('*').remove();
    
    const width = element.clientWidth;
    const height = element.clientHeight;
    const margin = { top: 20, right: 80, bottom: 30, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    const svg = d3.select(element)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Preparar datos para el gráfico
    const chartData: Array<{platform: string, followers: number, timestamp: Date}> = [];
    this.selectedPlatforms.forEach(platform => {
      if (this.comparisonData && this.comparisonData[platform]) {
        const platformData = this.comparisonData[platform];
        for (let i = 0; i < platformData.followers.length; i++) {
          chartData.push({
            platform,
            followers: platformData.followers[i],
            timestamp: platformData.timestamps[i].toDate ? 
              platformData.timestamps[i].toDate() : 
              new Date(platformData.timestamps[i])
          });
        }
      }
    });
    
    chartData.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    // Escalas
    const xScale = d3.scaleTime()
      .domain(d3.extent(chartData, d => d.timestamp) as [Date, Date])
      .range([0, innerWidth]);
    
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(chartData, d => d.followers) as number * 1.1])
      .range([innerHeight, 0]);
    
    // Ejes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);
    
    svg.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis);
    
    svg.append('g')
      .call(yAxis);
    
    // Línea
    const line = d3.line<{timestamp: Date, followers: number}>()
      .x(d => xScale(d.timestamp))
      .y(d => yScale(d.followers))
      .curve(d3.curveMonotoneX);
    
    // Agrupar por plataforma
    const platformGroups = d3.group(chartData, d => d.platform);
    
    // Dibujar líneas para cada plataforma
    platformGroups.forEach((values, platform) => {
      svg.append('path')
        .datum(values)
        .attr('fill', 'none')
        .attr('stroke', this.getColorForPlatform(platform))
        .attr('stroke-width', 2)
        .attr('d', line as any);
      
      // Añadir puntos
      svg.selectAll(`.dot-${platform}`)
        .data(values)
        .enter()
        .append('circle')
        .attr('class', `dot-${platform}`)
        .attr('cx', d => xScale(d.timestamp))
        .attr('cy', d => yScale(d.followers))
        .attr('r', 4)
        .attr('fill', this.getColorForPlatform(platform));
    });
    
    // Leyenda
    const legend = svg.append('g')
      .attr('transform', `translate(${innerWidth + 10}, 0)`);
    
    this.selectedPlatforms.forEach((platform, i) => {
      const legendItem = legend.append('g')
        .attr('transform', `translate(0, ${i * 20})`);
      
      legendItem.append('rect')
        .attr('width', 10)
        .attr('height', 10)
        .attr('fill', this.getColorForPlatform(platform));
      
      legendItem.append('text')
        .attr('x', 15)
        .attr('y', 10)
        .text(platform.charAt(0).toUpperCase() + platform.slice(1));
    });
  }

  drawEngagementChart(): void {
    if (!this.comparisonData || !this.engagementChartElement) return;
    
    const element = this.engagementChartElement.nativeElement;
    d3.select(element).selectAll('*').remove();
    
    const width = element.clientWidth;
    const height = element.clientHeight;
    const margin = { top: 20, right: 80, bottom: 30, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    const svg = d3.select(element)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Preparar datos para el gráfico
    const chartData: Array<{platform: string, engagement: number, timestamp: Date}> = [];
    this.selectedPlatforms.forEach(platform => {
      if (this.comparisonData && this.comparisonData[platform]) {
        const platformData = this.comparisonData[platform];
        for (let i = 0; i < platformData.engagement.length; i++) {
          chartData.push({
            platform,
            engagement: platformData.engagement[i],
            timestamp: platformData.timestamps[i].toDate ? 
              platformData.timestamps[i].toDate() : 
              new Date(platformData.timestamps[i])
          });
        }
      }
    });
    
    chartData.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    
    // Escalas
    const xScale = d3.scaleTime()
      .domain(d3.extent(chartData, d => d.timestamp) as [Date, Date])
      .range([0, innerWidth]);
    
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(chartData, d => d.engagement) as number * 1.1])
      .range([innerHeight, 0]);
    
    // Ejes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);
    
    svg.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis);
    
    svg.append('g')
      .call(yAxis);
    
    // Línea
    const line = d3.line<{timestamp: Date, engagement: number}>()
      .x(d => xScale(d.timestamp))
      .y(d => yScale(d.engagement))
      .curve(d3.curveMonotoneX);
    
    // Agrupar por plataforma
    const platformGroups = d3.group(chartData, d => d.platform);
    
    // Dibujar líneas para cada plataforma
    platformGroups.forEach((values, platform) => {
      svg.append('path')
        .datum(values)
        .attr('fill', 'none')
        .attr('stroke', this.getColorForPlatform(platform))
        .attr('stroke-width', 2)
        .attr('d', line as any);
      
      // Añadir puntos
      svg.selectAll(`.dot-${platform}`)
        .data(values)
        .enter()
        .append('circle')
        .attr('class', `dot-${platform}`)
        .attr('cx', d => xScale(d.timestamp))
        .attr('cy', d => yScale(d.engagement))
        .attr('r', 4)
        .attr('fill', this.getColorForPlatform(platform));
    });
    
    // Leyenda
    const legend = svg.append('g')
      .attr('transform', `translate(${innerWidth + 10}, 0)`);
    
    this.selectedPlatforms.forEach((platform, i) => {
      const legendItem = legend.append('g')
        .attr('transform', `translate(0, ${i * 20})`);
      
      legendItem.append('rect')
        .attr('width', 10)
        .attr('height', 10)
        .attr('fill', this.getColorForPlatform(platform));
      
      legendItem.append('text')
        .attr('x', 15)
        .attr('y', 10)
        .text(platform.charAt(0).toUpperCase() + platform.slice(1));
    });
  }

  drawPostsChart(): void {
    if (!this.comparisonData || !this.postsChartElement) return;
    
    const element = this.postsChartElement.nativeElement;
    d3.select(element).selectAll('*').remove();
    
    const width = element.clientWidth;
    const height = element.clientHeight;
    const margin = { top: 20, right: 80, bottom: 30, left: 50 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    const svg = d3.select(element)
      .append('svg')
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    // Preparar datos para el gráfico
    const chartData: Array<{platform: string, posts: number}> = [];
    this.selectedPlatforms.forEach(platform => {
      if (this.comparisonData && this.comparisonData[platform]) {
        const totalPosts = this.comparisonData[platform].posts.reduce((sum, val) => sum + val, 0);
        chartData.push({
          platform,
          posts: totalPosts
        });
      }
    });
    
    // Escalas
    const xScale = d3.scaleBand()
      .domain(chartData.map(d => d.platform))
      .range([0, innerWidth])
      .padding(0.2);
    
    const yScale = d3.scaleLinear()
      .domain([0, d3.max(chartData, d => d.posts) as number * 1.1])
      .range([innerHeight, 0]);
    
    // Ejes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);
    
    svg.append('g')
      .attr('transform', `translate(0,${innerHeight})`)
      .call(xAxis);
    
    svg.append('g')
      .call(yAxis);
    
    // Barras
    svg.selectAll('.bar')
      .data(chartData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.platform) as number)
      .attr('y', d => yScale(d.posts))
      .attr('width', xScale.bandwidth())
      .attr('height', d => innerHeight - yScale(d.posts))
      .attr('fill', d => this.getColorForPlatform(d.platform));
    
    // Etiquetas
    svg.selectAll('.label')
      .data(chartData)
      .enter()
      .append('text')
      .attr('class', 'label')
      .attr('x', d => (xScale(d.platform) as number) + xScale.bandwidth() / 2)
      .attr('y', d => yScale(d.posts) - 5)
      .attr('text-anchor', 'middle')
      .text(d => d.posts);
  }

  getPlatformIcon(platform: string): string {
    const icons: {[key: string]: string} = {
      facebook: 'bi-facebook',
      twitter: 'bi-twitter',
      instagram: 'bi-instagram',
      linkedin: 'bi-linkedin',
      youtube: 'bi-youtube',
      tiktok: 'bi-tiktok',
      pinterest: 'bi-pinterest'
    };
    return icons[platform] || 'bi-question-circle';
  }

  getPlatformColor(platform: string): string {
    const textColors: {[key: string]: string} = {
      facebook: 'text-primary',
      twitter: 'text-info',
      instagram: 'text-danger',
      linkedin: 'text-primary',
      youtube: 'text-danger',
      tiktok: 'text-dark',
      pinterest: 'text-danger'
    };
    return textColors[platform] || 'text-muted';
  }

  getColorForPlatform(platform: string): string {
    return this.platformColors[platform.toLowerCase()] || '#999999';
  }
} 