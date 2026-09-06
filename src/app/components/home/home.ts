import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AnalysisService } from '../../../services/analysis/analysis-service';
import { S3Service } from '../../../services/s3/s3-service';
import { v4 } from 'uuid';

@Component({
    selector: 'app-home',
    imports: [
        MatButtonModule,
        MatCardModule,
        ReactiveFormsModule,
        MatFormField,
        MatLabel,
        MatIconModule,
        MatInputModule,
        MatProgressSpinner,
        MatToolbarModule,
    ],
    templateUrl: './home.html',
    styleUrl: './home.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home implements OnInit {
    snackBar = inject(MatSnackBar);
    githubRepositoryPattern = /^https:\/\/(?:www\.)?github\.com\/[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})\/[A-Za-z0-9_.-]+(?:\.git)?\/?$/;
    isLoading = signal(false);
    selectedFile: File | null = null;
    fileName: string | null = null;
    urlForm = new FormGroup({
        url: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.pattern(this.githubRepositoryPattern)] }),
    });

    constructor(
        private readonly analysisService: AnalysisService,
        private readonly s3Service: S3Service,
        private readonly router: Router,
    ) { }

    ngOnInit(): void {
        localStorage.removeItem('analysis');
    }

    async onFileSelected(event: Event): Promise<void> {
        this.isLoading.set(true);
        const input = event.target as HTMLInputElement;
        this.selectedFile = input.files?.[0] ?? null;
        this.fileName = this.selectedFile?.name ?? null;

        try {
            if (!this.fileName || !this.selectedFile) {
                throw new Error('No ZIP file selected');
            }
            this.fileName = `${this.fileName}-${v4()}`
            const presignUrl = await this.analysisService.getPresignUrl(this.fileName);
            await this.s3Service.uploadFile(presignUrl, this.selectedFile);
            const resultAnalysis = await this.analyzeCode(this.fileName, 'file');
            localStorage.setItem('analysis', JSON.stringify(resultAnalysis));
            await this.router.navigate(['/results']);
        } catch {
            this.openSnackBar('Un error ocurrio analizando el codigo por archivo zip, intentalo de nuevo', 'Cerrar');
        } finally {
            this.isLoading.set(false);
        }
    }

    async onUrlSelected(): Promise<void> {
        if (this.urlForm.invalid) {
            this.urlForm.markAllAsTouched();
            return;
        }

        this.isLoading.set(true);
        try {
            const resultAnalysis = await this.analyzeCode(this.urlForm.controls.url.value, 'github');
            localStorage.setItem('analysis', JSON.stringify(resultAnalysis));
            await this.router.navigate(['/results']);
        } catch {
            this.openSnackBar('Un error analizando el codigo remoto, intentalo de nuevo', 'Cerrar');
        } finally {
            this.isLoading.set(false);
        }
    }

    private async analyzeCode(requestUrl: string, type: 'file' | 'github') {
        return await this.analysisService.analyzeUrl(requestUrl, type);
    }

    private openSnackBar(message: string, action: string): void {
        this.snackBar.open(message, action);
    }
}
