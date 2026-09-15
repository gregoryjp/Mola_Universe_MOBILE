import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../shared/api/api-client';
import {
  ConsentStatus,
  PrivacyPolicy,
  DataExportStatus,
  UpdateConsentRequest,
  UpdateConsentResponse,
  FetchConsentResponse,
  FetchPolicyResponse,
  RequestDataExportResponse,
  RequestDeleteResponse,
  DataExportRequest,
  DeleteAccountRequest,
} from '../interface/types';

const PRIVACY_QUERY_KEY = 'privacy';

async function fetchConsent(): Promise<ConsentStatus> {
  const response = await apiClient.get<FetchConsentResponse>('/privacy/consent');
  return response.data.consent;
}

async function updateConsent(data: UpdateConsentRequest): Promise<ConsentStatus> {
  const response = await apiClient.patch<UpdateConsentResponse>(
    '/privacy/consent',
    data
  );
  return response.data.consent;
}

async function fetchPolicy(): Promise<PrivacyPolicy> {
  const response = await apiClient.get<FetchPolicyResponse>('/privacy/policy');
  return response.data.policy;
}

async function requestDataExport(data: DataExportRequest): Promise<DataExportStatus> {
  const response = await apiClient.post<RequestDataExportResponse>(
    '/privacy/data-export',
    data
  );
  return response.data.request;
}

async function getDataExportStatus(requestId: string): Promise<DataExportStatus> {
  const response = await apiClient.get<{ request: DataExportStatus }>(
    `/privacy/data-export/${requestId}`
  );
  return response.data.request;
}

async function requestDeleteAccount(data: DeleteAccountRequest): Promise<string> {
  const response = await apiClient.post<RequestDeleteResponse>(
    '/privacy/delete-account',
    data
  );
  return response.data.scheduledFor;
}

export function usePrivacy() {
  const queryClient = useQueryClient();

  const consentQuery = useQuery({
    queryKey: [PRIVACY_QUERY_KEY, 'consent'],
    queryFn: fetchConsent,
  });

  const policyQuery = useQuery({
    queryKey: [PRIVACY_QUERY_KEY, 'policy'],
    queryFn: fetchPolicy,
  });

  const updateConsentMutation = useMutation({
    mutationFn: updateConsent,
    onSuccess: (updatedConsent) => {
      queryClient.setQueryData([PRIVACY_QUERY_KEY, 'consent'], updatedConsent);
    },
  });

  const dataExportMutation = useMutation({
    mutationFn: requestDataExport,
  });

  const deleteAccountMutation = useMutation({
    mutationFn: requestDeleteAccount,
  });

  return {
    // Consent
    consent: consentQuery.data,
    isLoadingConsent: consentQuery.isLoading,
    consentError: consentQuery.error,
    updateConsent: updateConsentMutation,
    isUpdatingConsent: updateConsentMutation.isPending,

    // Policy
    policy: policyQuery.data,
    isLoadingPolicy: policyQuery.isLoading,
    policyError: policyQuery.error,

    // Data Export
    dataExport: dataExportMutation,
    isExportingData: dataExportMutation.isPending,

    // Account Deletion
    deleteAccount: deleteAccountMutation,
    isDeletingAccount: deleteAccountMutation.isPending,

    // Combined
    isLoading:
      consentQuery.isLoading ||
      policyQuery.isLoading ||
      updateConsentMutation.isPending ||
      dataExportMutation.isPending ||
      deleteAccountMutation.isPending,
  };
}
