import { useState, useCallback } from 'react';
import {
  uploadTvTimeImport,
  listUserImports,
  getImportStatusById,
  getImportErrors,
  downloadImportErrorsCSV,
  type DataImport,
  type ImportError,
} from '../lib/appData';

export function useImportTvTime(_userId: string) {
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingErrors, setIsLoadingErrors] = useState(false);
  const [currentImport, setCurrentImport] = useState<DataImport | null>(null);
  const [imports, setImports] = useState<DataImport[]>([]);
  const [importErrors, setImportErrors] = useState<ImportError[]>([]);

  const uploadImport = useCallback(
    async (file: File) => {
      setIsUploading(true);
      try {
        const result = await uploadTvTimeImport(file);
        setCurrentImport(result);
        return result;
      } finally {
        setIsUploading(false);
      }
    },
    []
  );

  const listImports = useCallback(async () => {
    try {
      const result = await listUserImports();
      setImports(result);
      return result;
    } catch (error) {
      console.error('Failed to list imports:', error);
      return [];
    }
  }, []);

  const getImportStatus = useCallback(async (importId: string) => {
    try {
      const result = await getImportStatusById(importId);
      setCurrentImport(result);
      return result;
    } catch (error) {
      console.error('Failed to get import status:', error);
      return null;
    }
  }, []);

  const listImportErrors = useCallback(async (importId: string) => {
    setIsLoadingErrors(true);
    try {
      const result = await getImportErrors(importId);
      setImportErrors(result);
      return result;
    } catch (error) {
      console.error('Failed to list import errors:', error);
      return [];
    } finally {
      setIsLoadingErrors(false);
    }
  }, []);

  const downloadErrorsCSV = useCallback(async (importId: string) => {
    try {
      await downloadImportErrorsCSV(importId);
    } catch (error) {
      console.error('Failed to download CSV:', error);
      throw error;
    }
  }, []);

  return {
    uploadImport,
    listImports,
    getImportStatus,
    listImportErrors,
    downloadErrorsCSV,
    isUploading,
    isLoadingErrors,
    currentImport,
    imports,
    importErrors,
  };
}
