import { ChangeDetectionStrategy, Component, computed, OnInit, signal } from '@angular/core';
import { KeyValuePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { Router } from '@angular/router';

interface AnalysisResult {
  name: string;
  fullName: string,
  description: string | null,
  private: boolean,
  isRemote: boolean,
  defaultBranch: string | null,
  visibility: string;
  principalLanguage: string;
  principalLanguagePercentage: number;
  languages: Record<string, number>,
  structure: {
    directories: string[];
    sourcePaths: string[];
    files: string[];
    frameworks: string[]
  };
  analysis: {
    summary: string;
    detectedArchitecture: string;
    risks: string[];
    recommendations: string[];
    detectedPatterns: string[];
  };
}

@Component({
  selector: 'app-analyses-results',
  imports: [MatButtonModule, MatCardModule, MatChipsModule, MatDividerModule, MatIconModule, MatProgressBarModule, MatTabsModule, MatToolbarModule, KeyValuePipe],
  templateUrl: './analyses-results.html',
  styleUrl: './analyses-results.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnalysesResults implements OnInit {
  analysisResults = signal<AnalysisResult>({
    name: '',
    fullName: '',
    description: null,
    private: false,
    isRemote: false,
    defaultBranch: null,
    visibility: '',
    principalLanguage: '',
    principalLanguagePercentage: 0,
    languages: {},
    structure: {
      directories: [],
      sourcePaths: [],
      files: [],
      frameworks: []
    },
    analysis: {
      summary: '',
      detectedArchitecture: '',
      risks: [],
      recommendations: [],
      detectedPatterns: []
    }
  })

  constructor(private router: Router) { }

  async ngOnInit() {
    const analysis = localStorage.getItem('analysis');
    if (analysis) {
      this.analysisResults.set(JSON.parse(analysis));
    } else {
      await this.router.navigate(['home']);
    }
  }

  async onNewReport() {
    await this.router.navigate(['home']);
  }

  generateReport(): void {
    const report = this.buildReport();
    const blob = new Blob([report], { type: 'text/markdown;charset=utf-8' });
    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = downloadUrl;
    link.download = `${this.analysisResults().name || 'analysis'}-README.md`;
    link.click();
    URL.revokeObjectURL(downloadUrl);
  }

  buildReport(): string {
    const analysis = this.analysisResults();
    const languages = Object.entries(analysis.languages)
      .map(([language, percentage]) => `- ${language}: ${percentage}%`)
      .join('\n');

    return `# ${analysis.name}
${analysis.description ?? 'No se encontro descripcion'}
## Repositorio
- **Nombre Completo:** ${analysis.fullName}
- **Visibilidad:** ${analysis.visibility}
- **Fuente:** ${analysis.isRemote ? 'Remote repository' : 'Local upload'}
- **Rama por defecto:** ${analysis.defaultBranch ?? 'Not specified'}
## Resumen de analisis
${analysis.analysis.summary}
### Arquitectura detectada
${analysis.analysis.detectedArchitecture}
## Lenguages y tecnologias
${languages || '- No languages detected'}
## Riesgos
${this.toMarkdownList(analysis.analysis.risks)}
## Recomendaciones
${this.toMarkdownList(analysis.analysis.recommendations)}
## Patrones
${this.toMarkdownList(analysis.analysis.detectedPatterns)}
## Estructura
### Directorios
${this.toMarkdownList(analysis.structure.directories)}
### Archivos fuente
${this.toMarkdownList(analysis.structure.sourcePaths)}
### Archivos
${this.toMarkdownList(analysis.structure.files)}
### Marcos de trabajo
${this.toMarkdownList(analysis.structure.frameworks)}
`;
  }

  private toMarkdownList(items: string[]): string {
    return items.length ? items.map((item) => `- ${item}`).join('\n') : '- None detected';
  }

  protected readonly riskCount = computed(() => this.analysisResults().analysis.risks.length);
  protected readonly fileCount = computed(() => this.analysisResults().structure.files.length);
  protected readonly patternCount = computed(() => this.analysisResults().analysis.detectedPatterns.length);
  protected readonly frameworkCount = computed(() => this.analysisResults().structure.frameworks.length);
  protected readonly directoriesCount = computed(() => this.analysisResults().structure.directories.length);
  protected readonly sourcePathCount = computed(() => this.analysisResults().structure.sourcePaths.length);
}
