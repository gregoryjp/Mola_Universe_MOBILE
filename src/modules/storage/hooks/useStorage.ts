import { useMutation, useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../shared/api/api-client';
import { StorageFile, PresignedUrl } from '../interface/types';

const STORAGE_KEY = 'storage';

async function getPresignedUrl(fileName: string, fileType: string): Promise<PresignedUrl> {
  const res = await apiClient.get<{ url: PresignedUrl }>('/storage/presigned', {
    params: { fileName, fileType },
  });
  return res.data.url;
}

async function deleteFile(fileId: string): Promise<void> {
  await apiClient.delete(`/storage/files/${fileId}`);
}

async function listFiles(): Promise<StorageFile[]> {
  const res = await apiClient.get<{ files: StorageFile[] }>('/storage/files');
  return res.data.files;
}

export function useStorage() {
  const listQuery = useQuery({
    queryKey: [STORAGE_KEY, 'files'],
    queryFn: listFiles,
  });

  const presignedMutation = useMutation({
    mutationFn: ({ fileName, fileType }: { fileName: string; fileType: string }) =>
      getPresignedUrl(fileName, fileType),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteFile,
  });

  return {
    files: listQuery.data || [],
    isLoading: listQuery.isLoading,
    getPresignedUrl: presignedMutation,
    deleteFile: deleteMutation,
  };
}
