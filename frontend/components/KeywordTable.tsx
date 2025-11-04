'use client';

import { Keyword } from '@/types';
import { getKDColor } from '@/utils/keywords';

interface KeywordTableProps {
  title: string;
  keywords: Keyword[];
  onChange: (keywords: Keyword[]) => void;
}

export function KeywordTable({ title, keywords, onChange }: KeywordTableProps) {
  const addRow = () => {
    onChange([
      ...keywords,
      {
        id: Date.now().toString(),
        key: '',
        volume: '',
        kd: '',
        timesUsed: 0,
      },
    ]);
  };

  const clearAll = () => {
    if (confirm(`Clear all ${keywords.length} keywords from ${title}?`)) {
      onChange([]);
    }
  };

  const deleteRow = (id: string) => {
    onChange(keywords.filter((k) => k.id !== id));
  };

  const updateRow = (id: string, field: keyof Keyword, value: string | number) => {
    onChange(
      keywords.map((k) =>
        k.id === id ? { ...k, [field]: value } : k
      )
    );
  };

  const totalUsed = keywords.reduce((sum, keyword) => sum + keyword.timesUsed, 0);

  return (
    <div className="border border-gray-200 rounded-lg p-5 bg-white shadow">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
        <div className="flex gap-2">
          {keywords.length > 0 && (
            <button
              onClick={clearAll}
              className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300"
            >
              Clear All
            </button>
          )}
          <button
            onClick={addRow}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 shadow"
          >
            + Add Row
          </button>
        </div>
      </div>
      
      <div className="overflow-x-auto rounded-lg">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b-2 border-gray-200 bg-gray-100">
              <th className="text-left p-3 font-semibold text-gray-700">Keyword</th>
              <th className="text-left p-3 font-semibold text-gray-700 w-24">Volume</th>
              <th className="text-left p-3 font-semibold text-gray-700 w-20">KD</th>
              <th className="text-left p-3 font-semibold text-gray-700 w-24">Times Used</th>
              <th className="w-16"></th>
            </tr>
          </thead>
          <tbody>
            {keywords.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center p-8 text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <div className="text-4xl text-gray-300">📝</div>
                    <p className="font-medium">No keywords added yet</p>
                    <p className="text-xs">Click "Add Row" to start</p>
                  </div>
                </td>
              </tr>
            ) : (
              keywords.map((keyword) => (
                <tr key={keyword.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-3">
                    <input
                      type="text"
                      value={keyword.key}
                      onChange={(e) => updateRow(keyword.id, 'key', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter keyword"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="text"
                      value={keyword.volume}
                      onChange={(e) => updateRow(keyword.id, 'volume', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </td>
                  <td className="p-3">
                    <input
                      type="text"
                      value={keyword.kd}
                      onChange={(e) => updateRow(keyword.id, 'kd', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium ${getKDColor(keyword.kd)}`}
                      placeholder="0"
                    />
                  </td>
                  <td className="p-3 text-center">
                    <span className="inline-block px-3 py-1.5 bg-blue-100 rounded-lg text-gray-700 font-bold text-sm">
                      {keyword.timesUsed}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => deleteRow(keyword.id)}
                      className="w-8 h-8 flex items-center justify-center text-red-600 hover:bg-red-50 rounded-lg font-bold text-xl"
                      title="Delete row"
                    >
                      ×
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
          {keywords.length > 0 && (
            <tfoot>
              <tr className="border-t-2 border-gray-300 bg-gray-50">
                <td colSpan={3} className="p-3 text-right font-semibold text-gray-700">
                  Total Used:
                </td>
                <td className="p-3 text-center">
                  <span className="inline-block px-3 py-1.5 bg-blue-200 rounded-lg text-gray-900 font-bold text-sm">
                    {totalUsed}
                  </span>
                </td>
                <td></td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}

