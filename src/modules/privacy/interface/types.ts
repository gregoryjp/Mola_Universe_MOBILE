export interface ConsentStatus {
  marketing: boolean;
  analytics: boolean;
  thirdParty: boolean;
  lastUpdated: string;
}

export interface PrivacyPolicy {
  version: string;
  effectiveDate: string;
  content: string;
  url: string;
}

export interface DataExportRequest {
  format: 'json' | 'csv';
  includeMedia: boolean;
}

export interface DataExportStatus {
  requestId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  downloadUrl?: string;
  createdAt: string;
  expiresAt: string;
}

export interface DeleteAccountRequest {
  password: string;
  reason?: string;
}

export interface UpdateConsentRequest {
  marketing?: boolean;
  analytics?: boolean;
  thirdParty?: boolean;
}

export interface UpdateConsentResponse {
  consent: ConsentStatus;
}

export interface FetchConsentResponse {
  consent: ConsentStatus;
}

export interface FetchPolicyResponse {
  policy: PrivacyPolicy;
}

export interface RequestDataExportResponse {
  request: DataExportStatus;
}

export interface RequestDeleteResponse {
  message: string;
  scheduledFor: string;
}
