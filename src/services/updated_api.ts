// mobile/src/services/api.ts
import axios, { AxiosInstance } from 'axios';
import { readAsStringAsync, EncodingType } from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';

export interface DiagnosisResult {
  plant_health_score: number;
  primary_diagnosis: {
    condition_name: string;
    confidence: number;
    category: string;
    symptoms: string[];
    treatment: string[];
    severity: 'mild' | 'moderate' | 'severe';
  };
  all_diagnoses: any[];
  ai_sources_used: string[];
  inference_time_ms: number;
  model_version: string;
}

export interface PlantIdentificationResult {
  plant_name: string;
  confidence: number;
  family: string;
  plant_info: {
    common_names: string[];
    care_tips: string[];
    ideal_conditions: string;
  };
}

class JivaAPI {
  private client: AxiosInstance;
  private baseURL: string;
  private authToken: string | null = null;

  constructor(baseURL: string = 'https://api.jivapl ants.app') {
    this.baseURL = baseURL;
    this.client = axios.create({
      baseURL: this.baseURL,
      timeout: 60000, // 60s for model loading
    });
  }

  setAuthToken(token: string) {
    this.authToken = token;
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  /**
   * Diagnose plant disease/deficiency
   * COSTS: 1 scan credit (free: 5, premium: unlimited)
   */
  async diagnosePlant(imageUri: string): Promise<DiagnosisResult> {
    try {
      // Read image file
      const imageBase64 = await readAsStringAsync(
        imageUri,
        { encoding: EncodingType.Base64 }
      );

      // Send to backend
      const response = await this.client.post('/api/v1/diagnose/', 
        {
          image: `data:image/jpeg;base64,${imageBase64}`,
          timestamp: new Date().toISOString(),
        },
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );

      return response.data as DiagnosisResult;
    } catch (error) {
      throw new Error(`Diagnosis failed: ${error}`);
    }
  }

  /**
   * Identify plant species
   * FREE - Does not consume scans
   */
  async identifyPlant(imageUri: string): Promise<PlantIdentificationResult> {
    try {
      const imageBase64 = await readAsStringAsync(
        imageUri,
        { encoding: EncodingType.Base64 }
      );

      const response = await this.client.post('/api/v1/identify/',
        {
          image: `data:image/jpeg;base64,${imageBase64}`,
        }
      );

      return response.data as PlantIdentificationResult;
    } catch (error) {
      throw new Error(`Identification failed: ${error}`);
    }
  }

  /**
   * Save scan to history
   */
  async saveScan(
    mode: 'diagnosis' | 'identification',
    result: DiagnosisResult | PlantIdentificationResult,
    imageUri: string,
    notes?: string
  ) {
    try {
      const response = await this.client.post('/api/v1/scans',{
        mode,
        result,
        image_uri: imageUri,
        notes,
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to save scan: ${error}`);
    }
  }

  /**
   * Get scan history
   */
  async getScanHistory(
    mode?: 'diagnosis' | 'identification',
    limit: number = 20
  ) {
    try {
      const response = await this.client.get('/api/v1/scans', {
        params: { mode, limit },
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch history: ${error}`);
    }
  }

  /**
   * Get user scan quota
   */
  async getUserQuota() {
    try {
      const response = await this.client.get('/api/v1/user/quota');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch quota: ${error}`);
    }
  }
}

export const jivaAPI = new JivaAPI();