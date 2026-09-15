export interface StorageFile {
  id: string;
  name: string;
  size: number;
  url: string;
  type: string;
  createdAt: string;
}
export interface PresignedUrl {
  url: string;
  fields: Record<string, string>;
}
