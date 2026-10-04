import React from 'react';
import {
  FileText,
  FileCode,
  FileSpreadsheet,
  FileImage,
  Film,
  Music,
  Archive,
  File,
  FileCheck,
} from 'lucide-react';
import { getFileExtension, getFileCategory } from '../utils/fileUtils';

export default function FileIcon({ filename, type, size = 20, className = '' }) {
  const ext = getFileExtension(filename);
  const category = getFileCategory(filename, type);

  // Return specialized icons and styling based on file extension
  if (['txt', 'md', 'rtf', 'log'].includes(ext)) {
    return <FileText size={size} className={`text-blue-600 ${className}`} />;
  }

  if (ext === 'pdf') {
    return <FileText size={size} className={`text-rose-600 ${className}`} />;
  }

  if (['doc', 'docx', 'odt'].includes(ext)) {
    return <FileText size={size} className={`text-indigo-600 ${className}`} />;
  }

  if (['xls', 'xlsx', 'csv'].includes(ext)) {
    return <FileSpreadsheet size={size} className={`text-emerald-600 ${className}`} />;
  }

  if (['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp'].includes(ext) || category === 'images') {
    return <FileImage size={size} className={`text-pink-600 ${className}`} />;
  }

  if (['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext) || category === 'videos') {
    return <Film size={size} className={`text-purple-600 ${className}`} />;
  }

  if (['mp3', 'wav', 'ogg', 'aac', 'flac'].includes(ext) || category === 'audio') {
    return <Music size={size} className={`text-teal-600 ${className}`} />;
  }

  if (['zip', 'tar', 'gz', 'rar', '7z'].includes(ext) || category === 'archives') {
    return <Archive size={size} className={`text-amber-600 ${className}`} />;
  }

  if (['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'json', 'py', 'sh', 'sql', 'yaml', 'yml'].includes(ext) || category === 'code') {
    return <FileCode size={size} className={`text-emerald-500 ${className}`} />;
  }

  return <File size={size} className={`text-slate-500 ${className}`} />;
}
