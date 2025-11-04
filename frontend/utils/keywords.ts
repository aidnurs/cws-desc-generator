import { Keyword } from '@/types';

export function getKDColor(kd: string): string {
  const kdValue = parseFloat(kd);
  if (isNaN(kdValue)) return 'bg-gray-50 border-gray-200';
  
  if (kdValue <= 14) return 'bg-green-900 text-white border-green-900';
  if (kdValue <= 29) return 'bg-green-600 text-white border-green-600';
  if (kdValue <= 49) return 'bg-yellow-400 text-gray-900 border-yellow-400';
  if (kdValue <= 69) return 'bg-orange-500 text-white border-orange-500';
  if (kdValue <= 84) return 'bg-red-600 text-white border-red-600';
  return 'bg-red-900 text-white border-red-900';
}

export function countKeywordOccurrences(text: string, keyword: string): number {
  if (!keyword || !text) return 0;
  const regex = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
  const matches = text.match(regex);
  return matches ? matches.length : 0;
}

export function calculateStats(text: string) {
  const withoutSpaces = text.replace(/\s/g, '').length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  return { withoutSpaces, words, total: text.length };
}

export function exportToJSON(data: unknown, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function parseCSV(csv: string): Partial<Keyword>[] {
  const lines = csv.trim().split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];
  
  const parseLine = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.trim());
    return result;
  };
  
  const headers = parseLine(lines[0]);
  
  const keyIndex = headers.findIndex(h => h === 'Keyword');
  const volumeIndex = headers.findIndex(h => h === 'Volume');
  const kdIndex = headers.findIndex(h => h === 'Keyword Difficulty');
  
  const keywords: Partial<Keyword>[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const values = parseLine(line);
    
    const keyValue = keyIndex >= 0 && values[keyIndex] ? values[keyIndex] : '';
    const volumeValue = volumeIndex >= 0 && values[volumeIndex] ? values[volumeIndex] : '';
    const kdValue = kdIndex >= 0 && values[kdIndex] ? values[kdIndex] : '';
    
    if (!keyValue) continue;
    
    const keyword: Partial<Keyword> = {
      key: keyValue,
      volume: volumeValue,
      kd: kdValue,
    };
    
    keywords.push(keyword);
  }
  
  return keywords;
}

