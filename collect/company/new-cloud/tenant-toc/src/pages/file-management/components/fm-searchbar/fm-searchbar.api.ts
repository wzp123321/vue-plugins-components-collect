export interface IFmFormData {
  fileName: string;
  fileType: string;
  uploadDate: [string, string];
}

export type DictDetailQueryByCodeResponse = {
  code?: string;
  name?: string;
};
