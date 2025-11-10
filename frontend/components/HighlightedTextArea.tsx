"use client";

import { useRef, useState, useEffect } from "react";
import { SingleKeyword } from "@/types";
import { getTextColorValue, getHighlightColor } from "@/utils/keywords";

interface HighlightedTextAreaProps {
  value: string;
  onChange: (value: string) => void;
  keywords: SingleKeyword[];
  placeholder?: string;
  rows?: number;
  className?: string;
}

export function HighlightedTextArea({
  value,
  onChange,
  keywords,
  placeholder,
  rows = 22,
  className = "",
}: HighlightedTextAreaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredKeyword, setHoveredKeyword] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  const handleScroll = () => {
    if (textareaRef.current && highlightRef.current) {
      const scrollTop = textareaRef.current.scrollTop;
      const scrollLeft = textareaRef.current.scrollLeft;
      highlightRef.current.style.transform = `translate(-${scrollLeft}px, -${scrollTop}px)`;
    }
  };

  const buildHighlightedText = () => {
    if (!value) {
      return "";
    }

    const keywordMap = new Map<string, SingleKeyword>();
    keywords
      .filter((k) => !k.isStopword && k.density >= 0.8)
      .forEach((k) => {
        keywordMap.set(k.keyword.toLowerCase(), k);
      });

    if (keywordMap.size === 0) {
      return value.replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }

    const words = value.split(/(\s+)/);
    return words
      .map((word) => {
        const cleanWord = word.toLowerCase().replace(/[^\w]/g, "");
        const keyword = keywordMap.get(cleanWord);

        if (keyword) {
          const color = getTextColorValue(keyword.density);
          const bgColor = hoveredKeyword === keyword.keyword.toLowerCase()
            ? getHighlightColor(keyword.density)
            : "transparent";

          const escapedWord = word.replace(/</g, "&lt;").replace(/>/g, "&gt;");
          return `<span 
            style="color: ${color}; background-color: ${bgColor}; cursor: pointer;" 
            data-keyword="${keyword.keyword.toLowerCase()}"
            class="keyword-highlight"
          >${escapedWord}</span>`;
        }
        return word.replace(/</g, "&lt;").replace(/>/g, "&gt;");
      })
      .join("");
  };

  useEffect(() => {
    const highlightElement = highlightRef.current;
    if (highlightElement) {
      const handleMouseOver = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (target.classList.contains("keyword-highlight")) {
          const keyword = target.getAttribute("data-keyword");
          setHoveredKeyword(keyword);
        }
      };

      const handleMouseOut = () => {
        setHoveredKeyword(null);
      };

      highlightElement.addEventListener("mouseover", handleMouseOver);
      highlightElement.addEventListener("mouseout", handleMouseOut);

      return () => {
        highlightElement.removeEventListener("mouseover", handleMouseOver);
        highlightElement.removeEventListener("mouseout", handleMouseOut);
      };
    }
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`relative w-full bg-white rounded transition-all ${
        isFocused 
          ? 'border border-blue-500 ring-1 ring-blue-500' 
          : 'border border-gray-300'
      }`}
    >
      <div
        className="absolute inset-0 overflow-hidden rounded pointer-events-none"
        style={{
          zIndex: 1,
        }}
      >
        <div
          ref={highlightRef}
          className="whitespace-pre-wrap wrap-break-word pointer-events-auto"
          style={{
            padding: "0.5rem 0.75rem",
            fontFamily: "inherit",
            fontSize: "0.875rem",
            lineHeight: "1.25rem",
            color: "#1f2937",
          }}
          dangerouslySetInnerHTML={{ __html: buildHighlightedText() }}
        />
      </div>
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onScroll={handleScroll}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder={placeholder}
        rows={rows}
        className={`relative w-full px-3 py-2 resize-none text-sm ${className}`}
        style={{
          zIndex: 2,
          caretColor: "black",
          background: "transparent",
          color: "transparent",
          border: "none",
          outline: "none",
        }}
      />
    </div>
  );
}

