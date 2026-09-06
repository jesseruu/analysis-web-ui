import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AnalysisService } from '../services/analysis/analysis-service';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet],
    templateUrl: './app.html',
    styleUrl: './app.scss',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App implements OnInit {
    analysisService = inject(AnalysisService);

    async ngOnInit() {
        const jwt = await this.analysisService.getAuthToken();
        localStorage.setItem('jwt', jwt);
    }
}
