export class GoogleVisionService {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async extractText(file: File): Promise<string> {
    try {
      // Convert file to base64
      const base64 = await this.fileToBase64(file);
      
      const requestBody = {
        requests: [
          {
            image: {
              content: base64
            },
            features: [
              {
                type: 'TEXT_DETECTION',
                maxResults: 1
              }
            ]
          }
        ]
      };

      const response = await fetch(
        `https://vision.googleapis.com/v1/images:annotate?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody)
        }
      );

      if (!response.ok) {
        throw new Error(`Google Vision API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.responses && data.responses[0] && data.responses[0].textAnnotations) {
        return data.responses[0].textAnnotations[0].description || '';
      }
      
      return '';
    } catch (error) {
      console.error('Google Vision API error:', error);
      throw new Error('Failed to extract text using Google Vision API');
    }
  }

  private fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URL prefix to get just the base64 string
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}

export const googleVisionService = new GoogleVisionService(
  import.meta.env.VITE_GOOGLE_CLOUD_VISION_API_KEY || ''
);