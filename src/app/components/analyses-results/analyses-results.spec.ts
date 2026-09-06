import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { AnalysesResults } from './analyses-results';

const analysisFixture = {
    name: 'analysis-mngr-main',
    fullName: 'jesseruu/analysis-mngr-main',
    description: 'A repository analysis fixture.',
    private: false,
    isRemote: true,
    defaultBranch: 'main',
    visibility: 'external',
    principalLanguage: 'TypeScript',
    principalLanguagePercentage: 100,
    languages: { TypeScript: 100 },
    structure: {
        directories: ['src', 'test'],
        sourcePaths: ['src/services'],
        files: ['app.ts', 'config.ts'],
        frameworks: ['Angular'],
    },
    analysis: {
        summary: 'The repository uses a layered architecture.',
        detectedArchitecture: 'Layered architecture',
        risks: ['Missing authentication'],
        recommendations: ['Add authentication'],
        detectedPatterns: ['Strategy Pattern'],
    },
};

describe('AnalysesResults', () => {
    let fixture: ComponentFixture<AnalysesResults>;
    let component: AnalysesResults;
    let navigations: unknown[][];

    beforeEach(async () => {
        localStorage.clear();
        navigations = [];

        await TestBed.configureTestingModule({
            imports: [AnalysesResults],
            providers: [
                {
                    provide: Router,
                    useValue: {
                        navigate: async (commands: unknown[]) => {
                            navigations.push(commands);
                            return true;
                        },
                    },
                },
            ],
        }).compileComponents();

        fixture = TestBed.createComponent(AnalysesResults);
        component = fixture.componentInstance;
    });

    afterEach(() => {
        localStorage.clear();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should load and render an analysis from localStorage', async () => {
        localStorage.setItem('analysis', JSON.stringify(analysisFixture));

        await component.ngOnInit();
        fixture.detectChanges();

        const rendered = fixture.nativeElement as HTMLElement;
        expect(rendered.querySelector('h1')?.textContent).toContain('analysis-mngr-main');
        expect(rendered.textContent).toContain('The repository uses a layered architecture.');
        expect(rendered.textContent).toContain('Missing authentication');
        expect(navigations).toEqual([]);
    });

    it('should build a Markdown README from the analysis', async () => {
        localStorage.setItem('analysis', JSON.stringify(analysisFixture));

        await component.ngOnInit();

        const report = component.buildReport();
        expect(report).toContain('# analysis-mngr-main');
        expect(report).toContain('## Analysis summary');
        expect(report).toContain('- Missing authentication');
        expect(report).toContain('- TypeScript: 100%');
        expect(report).toContain('### Files');
    });

    it('should navigate home when no analysis is stored', async () => {
        await component.ngOnInit();

        expect(navigations).toEqual([['home']]);
    });
});
