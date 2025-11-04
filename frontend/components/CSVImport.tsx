'use client';

import { parseCSV } from '@/utils/keywords';
import { Keyword } from '@/types';
import { useState } from 'react';

interface CSVImportProps {
  onImport: (keywords: Keyword[]) => void;
  label: string;
}

export function CSVImport({ onImport, label }: CSVImportProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const csv = event.target?.result as string;
      const parsed = parseCSV(csv);
      const keywords: Keyword[] = parsed.map((p, index) => ({
        id: `${Date.now()}-${index}`,
        key: p.key || '',
        volume: p.volume || '',
        kd: p.kd || '',
        timesUsed: 0,
      }));
      onImport(keywords);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="inline-block relative">
      <label className="cursor-pointer px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 inline-flex items-center gap-2 shadow">
        {label}
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="hidden"
        />
      </label>
      <button
        type="button"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={() => setShowTooltip(!showTooltip)}
        className="ml-1 inline-flex items-center justify-center w-5 h-5 text-xs bg-gray-200 hover:bg-gray-300 text-gray-600 rounded-full"
      >
        ?
      </button>
      {showTooltip && (
        <div className="absolute z-10 w-72 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg mt-2 left-0">
          <div className="font-semibold mb-1">CSV Format Expected:</div>
          <div className="mb-2">
            First row must be header with columns:
            <br />
            &quot;Keyword&quot;, &quot;Volume&quot;, &quot;Keyword Difficulty&quot;
          </div>
          <div className="text-gray-300">
            Empty column values are allowed. Rows are inserted in order and added to existing keywords.
          </div>
        </div>
      )}
    </div>
  );
}

