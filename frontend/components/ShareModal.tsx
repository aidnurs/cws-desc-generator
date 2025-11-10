"use client";

import { useState } from "react";

interface ShareModalProps {
  url: string;
  onClose: () => void;
}

export function ShareModal({ url, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Share Analysis
        </h2>
        
        <p className="text-sm text-gray-600 mb-3">
          Your analysis has been saved. Share this link with others:
        </p>

        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={url}
            readOnly
            className="flex-1 px-3 py-2 border border-gray-300 rounded bg-gray-50 text-sm"
          />
          <button
            onClick={handleCopy}
            className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
          >
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>

        {copied && (
          <p className="text-xs text-green-600 mb-3">
            Link copied to clipboard!
          </p>
        )}

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

