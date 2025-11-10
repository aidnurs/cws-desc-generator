"use client";

import { useMemo } from "react";
import { SingleKeyword } from "@/types";
import { getTextColorValue, getHighlightColor } from "@/utils/keywords";

interface HighlightedTextAreaProps {
  value: string;
  onChange: (value: string) => void;
  keywords: SingleKeyword[];
  placeholder?: string;
  rows?: number;
  isViewMode?: boolean;
  hoveredKeyword?: string | null;
  onHoverChange?: (keyword: string | null) => void;
}

export function HighlightedTextArea({
  value,
  onChange,
  keywords,
  placeholder,
  rows = 22,
  isViewMode = false,
  hoveredKeyword = null,
  onHoverChange,
}: HighlightedTextAreaProps) {

  const highlightedHTML = useMemo(() => {
    if (!value || !isViewMode) {
      return "";
    }

    const keywordMap = new Map<string, SingleKeyword>();
    keywords
      .filter((k) => !k.isStopword && k.density >= 0.8)
      .forEach((k) => {
        keywordMap.set(k.keyword.toLowerCase(), k);
      });

    if (keywordMap.size === 0) {
      return value.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br>");
    }

    const words = value.split(/(\s+)/);
    return words
      .map((word) => {
        if (word === "\n") {
          return "<br>";
        }
        
        const cleanWord = word.toLowerCase().replace(/[^\w]/g, "");
        const keyword = keywordMap.get(cleanWord);

        if (keyword) {
          const color = getTextColorValue(keyword.density);
          const bgColor = hoveredKeyword === keyword.keyword.toLowerCase()
            ? getHighlightColor(keyword.density)
            : "transparent";

          const escapedWord = word.replace(/</g, "&lt;").replace(/>/g, "&gt;");
          return `<span 
            style="color: ${color}; background-color: ${bgColor}; cursor: pointer; transition: background-color 0.15s;" 
            data-keyword="${keyword.keyword.toLowerCase()}"
            class="keyword-highlight"
          >${escapedWord}</span>`;
        }
        return word.replace(/</g, "&lt;").replace(/>/g, "&gt;");
      })
      .join("");
  }, [value, keywords, hoveredKeyword, isViewMode]);

  const handleMouseOver = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains("keyword-highlight")) {
      const keyword = target.getAttribute("data-keyword");
      if (onHoverChange) {
        onHoverChange(keyword);
      }
    }
  };

  const handleMouseOut = () => {
    if (onHoverChange) {
      onHoverChange(null);
    }
  };

  if (isViewMode) {
    return (
      <div className="relative w-full bg-gray-50 rounded border-2 border-blue-200 shadow-sm">
        <div className="absolute top-2 right-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
          View Mode
        </div>
        <div
          className="w-full px-3 py-2 pt-10 text-sm overflow-auto whitespace-pre-wrap select-text"
          style={{
            minHeight: `${rows * 1.25 + 1}rem`,
            maxHeight: `${rows * 1.25 + 1}rem`,
          }}
          onMouseOver={handleMouseOver}
          onMouseOut={handleMouseOut}
          dangerouslySetInnerHTML={{ __html: highlightedHTML }}
        />
      </div>
    );
  }

  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
    />
  );
}

