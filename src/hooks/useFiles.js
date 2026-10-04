import { useState, useEffect, useCallback, useMemo } from 'react';
import { getFiles, deleteFile as apiDeleteFile } from '../services/api';
import { getFileCategory } from '../utils/fileUtils';
import { APP_CONFIG } from '../config/api';

export function useFiles(initialAutoRefresh = true) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('lastModified'); // 'name' | 'size' | 'lastModified' | 'type'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'
  const [autoRefresh, setAutoRefresh] = useState(initialAutoRefresh);
  const [lastFetchedAt, setLastFetchedAt] = useState(null);

  // Fetch files from backend REST API
  const fetchFiles = useCallback(async (isSilent = false) => {
    if (!isSilent) {
      if (files.length === 0) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }
    }
    setError(null);

    try {
      const data = await getFiles();
      setFiles(data);
      setLastFetchedAt(new Date());
    } catch (err) {
      console.warn('[useFiles] Fetch error:', err.message);
      setError(err.message || 'Unable to connect to the content management server.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [files.length]);

  // Initial load
  useEffect(() => {
    fetchFiles(false);
  }, []);

  // Auto-refresh interval polling (every 15s)
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchFiles(true);
    }, APP_CONFIG.defaultPollingInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, fetchFiles]);

  // Delete file action wrapper
  const deleteFile = useCallback(async (filename) => {
    await apiDeleteFile(filename);
    // Optimistically update or fetch latest list
    setFiles((prev) => prev.filter((f) => f.name !== filename));
    fetchFiles(true);
  }, [fetchFiles]);

  // Compute stats across all files
  const stats = useMemo(() => {
    let totalBytes = 0;
    const categoryCounts = {
      all: files.length,
      documents: 0,
      images: 0,
      videos: 0,
      audio: 0,
      archives: 0,
      code: 0,
      other: 0,
    };

    files.forEach((f) => {
      totalBytes += Number(f.size) || 0;
      const cat = getFileCategory(f.name, f.type);
      if (categoryCounts[cat] !== undefined) {
        categoryCounts[cat] += 1;
      } else {
        categoryCounts.other += 1;
      }
    });

    return {
      totalFiles: files.length,
      totalStorageBytes: totalBytes,
      categoryCounts,
    };
  }, [files]);

  // Filter and Sort files
  const filteredFiles = useMemo(() => {
    let result = [...files];

    // Filter by category
    if (selectedCategory && selectedCategory !== 'all') {
      result = result.filter((file) => getFileCategory(file.name, file.type) === selectedCategory);
    }

    // Filter by search query
    if (searchTerm && searchTerm.trim()) {
      const query = searchTerm.toLowerCase().trim();
      result = result.filter(
        (file) =>
          file.name.toLowerCase().includes(query) ||
          (file.type && file.type.toLowerCase().includes(query))
      );
    }

    // Sort
    result.sort((a, b) => {
      let comparison = 0;

      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
      } else if (sortBy === 'size') {
        comparison = (a.size || 0) - (b.size || 0);
      } else if (sortBy === 'lastModified') {
        const timeA = new Date(a.lastModified).getTime() || 0;
        const timeB = new Date(b.lastModified).getTime() || 0;
        comparison = timeA - timeB;
      } else if (sortBy === 'type') {
        const extA = a.name.split('.').pop() || '';
        const extB = b.name.split('.').pop() || '';
        comparison = extA.localeCompare(extB);
      }

      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [files, selectedCategory, searchTerm, sortBy, sortOrder]);

  const toggleSort = useCallback((column) => {
    setSortBy((prevSort) => {
      if (prevSort === column) {
        setSortOrder((prevOrder) => (prevOrder === 'asc' ? 'desc' : 'asc'));
        return column;
      } else {
        setSortOrder(column === 'lastModified' || column === 'size' ? 'desc' : 'asc');
        return column;
      }
    });
  }, []);

  return {
    files,
    filteredFiles,
    loading,
    refreshing,
    error,
    stats,
    searchTerm,
    setSearchTerm,
    selectedCategory,
    setSelectedCategory,
    sortBy,
    sortOrder,
    setSortBy,
    setSortOrder,
    toggleSort,
    autoRefresh,
    setAutoRefresh,
    lastFetchedAt,
    fetchFiles,
    deleteFile,
  };
}
