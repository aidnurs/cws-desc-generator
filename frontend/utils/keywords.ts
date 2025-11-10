import { AnalysisResult, SingleKeyword } from '@/types';

export function getDensityColor(density: number): string {
  if (density < 0.8) return 'bg-green-50 text-green-900';
  if (density < 1.8) return 'bg-blue-50 text-blue-900';
  if (density < 2.8) return 'bg-yellow-50 text-yellow-900';
  if (density < 3.8) return 'bg-orange-50 text-orange-900';
  return 'bg-red-50 text-red-900';
}

export function getTextColor(density: number): string {
  if (density < 0.8) return '';
  if (density < 1.8) return 'text-blue-600';
  if (density < 2.8) return 'text-yellow-600';
  if (density < 3.8) return 'text-orange-600';
  return 'text-red-600';
}

export function getTextColorValue(density: number): string {
  if (density < 0.8) return '';
  if (density < 1.8) return '#2563eb';
  if (density < 2.8) return '#ca8a04';
  if (density < 3.8) return '#ea580c';
  return '#dc2626';
}

export function getHighlightColor(density: number): string {
  if (density < 0.8) return '';
  if (density < 1.8) return 'rgba(37, 99, 235, 0.2)';
  if (density < 2.8) return 'rgba(202, 138, 4, 0.2)';
  if (density < 3.8) return 'rgba(234, 88, 12, 0.2)';
  return 'rgba(220, 38, 38, 0.2)';
}

export function exportToJSON(data: AnalysisResult, filename: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportToCSV(data: AnalysisResult, filename: string) {
  let csv = 'Type,Keyword/Phrase,Density,Times Used,Is Stopword\n';
  
  data.singleKeywords.forEach(item => {
    csv += `Single Keyword,"${item.keyword}",${item.density}%,${item.timesUsed},No\n`;
  });
  
  data.stopwords.forEach(item => {
    csv += `Stopword,"${item.keyword}",${item.density}%,${item.timesUsed},Yes\n`;
  });
  
  data.phrases.forEach(item => {
    csv += `Phrase,"${item.phrase}",,${item.timesUsed},N/A\n`;
  });
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
