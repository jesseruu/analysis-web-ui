import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class S3Service {

  async uploadFile(presignUrl: string, zipFile: any) {
    try {
      const response = await fetch(presignUrl, {
        method: "PUT",
        headers: {
          "Content-Type": "application/zip"
        },
        body: zipFile
      });

      if (!response.ok) {
        throw new Error('Error occurred uploading file');
      }
    } catch (error) {
      throw error;
    }
  }
}
