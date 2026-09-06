import { Injectable } from '@angular/core';
import { v4 } from 'uuid'
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AnalysisService {

  headers = {
    'X-RqUID': v4(),
    'Content-Type': 'application/json',
  }

  async getAuthToken() {
    const uri = `${environment.apiUrl}/auth/token`;

    try {
      const response = await fetch(uri, {
        method: 'POST',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error('Error getting auth token');
      }
      return await response.text();
    } catch (error) {
      throw error;
    }
  }

  async analyzeUrl(requestUrl: string, sourceType: 'file' | 'github' ) {
    const uri = `${environment.apiUrl}/analyses`;

    try {
      const response = await fetch(uri, {
        method: 'POST',
        headers: {
          ...this.headers,
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`
        },
        body: JSON.stringify({
          requestUrl,
          sourceType
        })
      });

      if (response.status === 403) {
        const renovatedToken = await this.getAuthToken();
        localStorage.setItem('jwt', renovatedToken);
        throw new Error('Auth token was expired');
      }

      if (!response.ok) {
        throw new Error('Error analysing url code');
      }
      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  async getPresignUrl(fileName: string) {
    const uri = `${environment.apiUrl}/attachments`;

    try {
      const response = await fetch(uri, {
        method: 'POST',
        headers: {
          ...this.headers,
          'Authorization': `Bearer ${localStorage.getItem('jwt')}`
        },
        body: JSON.stringify({
          fileName,
          fileType: 'application/zip'
        })
      });

      if (response.status === 403) {
        const renovatedToken = await this.getAuthToken();
        localStorage.setItem('jwt', renovatedToken);
        throw new Error('Auth token was expired');
      }

      if (!response.ok) {
        throw new Error('Error getting presign url');
      }

      const uploadUrl = await response.text();
      return uploadUrl;
    } catch (error) {
      throw error;
    }
  }
}
