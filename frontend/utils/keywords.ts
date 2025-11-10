import { AnalysisResult, SingleKeyword } from '@/types';

export function getDensityColor(density: number): string {
  if (density < 0.8) return 'bg-green-50 text-green-900';
  if (density < 1.8) return 'bg-blue-50 text-blue-900';
  if (density < 2.8) return 'bg-yellow-50 text-yellow-900';
  if (density < 3.8) return 'bg-orange-50 text-orange-900';
  return 'bg-red-50 text-red-900';
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
