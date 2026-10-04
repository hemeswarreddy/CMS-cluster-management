/**
 * File Utilities & Helper Functions
 */

/**
 * Format bytes into human-readable string (KB, MB, GB, etc.)
 * @param {number} bytes 
 * @param {number} decimals 
 * @returns {string}
 */
export function formatFileSize(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return '0 Bytes';
  if (typeof bytes !== 'number') {
    const parsed = parseFloat(bytes);
    if (isNaN(parsed)) return '0 Bytes';
    bytes = parsed;
  }

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const idx = Math.min(i, sizes.length - 1);
  return `${parseFloat((bytes / Math.pow(k, idx)).toFixed(dm))} ${sizes[idx]}`;
}

/**
 * Format a date timestamp into a user-friendly date string
 * @param {string|number|Date} dateVal 
 * @returns {string}
 */
export function formatDate(dateVal) {
  if (!dateVal) return 'Unknown';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return String(dateVal);
  }
}

/**
 * Format date in short format e.g. "Oct 4, 2026"
 * @param {string|number|Date} dateVal 
 * @returns {string}
 */
export function formatShortDate(dateVal) {
  if (!dateVal) return '—';
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return String(dateVal);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

/**
 * Get file extension in uppercase
 * @param {string} filename 
 * @returns {string}
 */
export function getFileExtension(filename = '') {
  if (!filename || typeof filename !== 'string') return '';
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1 || lastDot === 0) return '';
  return filename.substring(lastDot + 1).toLowerCase();
}

/**
 * Get simplified File Type Label e.g. "PDF", "PNG", "TXT"
 * @param {string} filename 
 * @param {string} mimeType 
 * @returns {string}
 */
export function getFileTypeLabel(filename = '', mimeType = '') {
  const ext = getFileExtension(filename).toUpperCase();
  if (ext) return ext;

  if (mimeType) {
    if (mimeType.includes('pdf')) return 'PDF';
    if (mimeType.includes('image')) return 'IMAGE';
    if (mimeType.includes('video')) return 'VIDEO';
    if (mimeType.includes('text')) return 'TEXT';
    if (mimeType.includes('zip') || mimeType.includes('compressed')) return 'ZIP';
  }

  return 'FILE';
}

/**
 * Categorize a file into standard dashboard filters:
 * 'documents' | 'images' | 'videos' | 'audio' | 'archives' | 'code' | 'other'
 * @param {string} filename 
 * @param {string} mimeType 
 * @returns {string}
 */
export function getFileCategory(filename = '', mimeType = '') {
  const ext = getFileExtension(filename).toLowerCase();
  const mime = (mimeType || '').toLowerCase();

  const docExts = ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt', 'xls', 'xlsx', 'csv', 'ppt', 'pptx', 'pages', 'key'];
  if (docExts.includes(ext) || mime.includes('pdf') || mime.includes('text/plain') || mime.includes('word') || mime.includes('excel')) {
    return 'documents';
  }

  const imgExts = ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp', 'ico', 'tiff'];
  if (imgExts.includes(ext) || mime.startsWith('image/')) {
    return 'images';
  }

  const videoExts = ['mp4', 'mov', 'avi', 'mkv', 'webm', 'wmv', 'flv'];
  if (videoExts.includes(ext) || mime.startsWith('video/')) {
    return 'videos';
  }

  const audioExts = ['mp3', 'wav', 'ogg', 'aac', 'flac', 'm4a'];
  if (audioExts.includes(ext) || mime.startsWith('audio/')) {
    return 'audio';
  }

  const archiveExts = ['zip', 'tar', 'gz', 'rar', '7z', 'bz2', 'xz'];
  if (archiveExts.includes(ext) || mime.includes('zip') || mime.includes('compressed') || mime.includes('tar')) {
    return 'archives';
  }

  const codeExts = ['js', 'jsx', 'ts', 'tsx', 'html', 'css', 'json', 'py', 'sh', 'sql', 'yaml', 'yml', 'md', 'xml'];
  if (codeExts.includes(ext) || mime.includes('javascript') || mime.includes('json') || mime.includes('html')) {
    return 'code';
  }

  return 'other';
}

/**
 * Get visual theme color for file category
 * @param {string} category 
 * @returns {{ bg: string, text: string, border: string, badge: string }}
 */
export function getCategoryStyles(category) {
  switch (category) {
    case 'documents':
      return { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe', badge: 'bg-blue-50 text-blue-700' };
    case 'images':
      return { bg: '#fdf2f8', text: '#be185d', border: '#fbcfe8', badge: 'bg-pink-50 text-pink-700' };
    case 'videos':
      return { bg: '#faf5ff', text: '#7e22ce', border: '#e9d5ff', badge: 'bg-purple-50 text-purple-700' };
    case 'audio':
      return { bg: '#ecfdf5', text: '#047857', border: '#a7f3d0', badge: 'bg-emerald-50 text-emerald-700' };
    case 'archives':
      return { bg: '#fffbeb', text: '#b45309', border: '#fde68a', badge: 'bg-amber-50 text-amber-700' };
    case 'code':
      return { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0', badge: 'bg-green-50 text-green-700' };
    default:
      return { bg: '#f8fafc', text: '#475569', border: '#e2e8f0', badge: 'bg-slate-50 text-slate-700' };
  }
}

/**
 * Clean & sanitize filename for display
 * @param {string} filename 
 * @returns {string}
 */
export function sanitizeFilename(filename = '') {
  if (!filename) return 'unnamed-file';
  return filename.replace(/[/\\?%*:|"<>]/g, '-');
}
