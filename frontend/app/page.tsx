"use client";

import { useState, useEffect } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { getDensityColor } from "@/utils/keywords";
import { AppState, AnalysisResult } from "@/types";
import { API_ENDPOINTS } from "@/config/api";
import { HighlightedTextArea } from "@/components/HighlightedTextArea";
import { ShareModal } from "@/components/ShareModal";

const INITIAL_STATE: AppState = {
  text: "",
  analysisResult: null,
  spamRiskResult: null,
};

const MAX_TEXT_LENGTH = 50000;

export default function Home() {
  const [state, setState, isLoaded] = useLocalStorage<AppState>(
    "app-state",
    INITIAL_STATE
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCheckingSpam, setIsCheckingSpam] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [spamError, setSpamError] = useState("");
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [hoveredKeyword, setHoveredKeyword] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"keywords" | "phrases">(
    "keywords"
  );

  const safeState = {
    text: state?.text ?? "",
    analysisResult: state?.analysisResult ?? null,
    spamRiskResult: state?.spamRiskResult ?? null,
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && isLoaded) {
      const params = new URLSearchParams(window.location.search);
      const id = params.get('id');
      
      if (id) {
        fetch(`${API_ENDPOINTS.getAnalysis}?id=${id}`)
          .then(res => res.json())
          .then(data => {
            if (data.error) {
              setError(data.error);
            } else {
              setState({
                text: data.text || "",
                analysisResult: data.analysisResult || null,
                spamRiskResult: data.spamRiskResult || null,
              });
              if (data.analysisResult) {
                setIsViewMode(true);
              }
            }
          })
          .catch(err => {
            setError("Failed to load shared analysis");
            console.error("Load error:", err);
          });
      }
    }
  }, [isLoaded, setState]);

  const handleShare = async () => {
    if (!safeState.text?.trim()) {
      setError("Please enter text to share");
      return;
    }

    if (safeState.text.length > MAX_TEXT_LENGTH) {
      setError(`Text exceeds maximum length of ${MAX_TEXT_LENGTH} characters`);
      return;
    }

    setIsSaving(true);
    setError("");

    try {
      const response = await fetch(API_ENDPOINTS.saveAnalysis, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: safeState.text,
          analysisResult: safeState.analysisResult,
          spamRiskResult: safeState.spamRiskResult,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to save analysis");
      }

      const data = await response.json();
      const url = `${window.location.origin}${window.location.pathname}?id=${data.id}`;
      setShareUrl(url);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to save analysis";
      setError(errorMessage);
      console.error("Share error:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAnalyze = async () => {
    const textValue = safeState.text?.trim() ?? "";
    if (!textValue) {
      setError("Please enter text to analyze");
      return;
    }

    if (safeState.text.length > MAX_TEXT_LENGTH) {
      setError(`Text exceeds maximum length of ${MAX_TEXT_LENGTH} characters`);
      return;
    }

    setIsAnalyzing(true);
    setError("");

    try {
      const response = await fetch(API_ENDPOINTS.analyzeText, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: textValue,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to analyze text");
      }

      const data: AnalysisResult = await response.json();
      setState({ text: safeState.text, analysisResult: data, spamRiskResult: safeState.spamRiskResult });
      setIsViewMode(true);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to analyze text";
      setError(errorMessage);
      console.error("Analysis error:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCheckSpam = async () => {
    const textValue = safeState.text?.trim() ?? "";
    if (!textValue) {
      setSpamError("Please enter text to check");
      return;
    }

    if (safeState.text.length > MAX_TEXT_LENGTH) {
      setSpamError(`Text exceeds maximum length of ${MAX_TEXT_LENGTH} characters`);
      return;
    }

    setIsCheckingSpam(true);
    setSpamError("");

    try {
      const response = await fetch(API_ENDPOINTS.checkSpamRisk, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: textValue,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to check spam risk");
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || "Spam detection API returned an error");
      }

      setState({ 
        text: safeState.text, 
        analysisResult: safeState.analysisResult,
        spamRiskResult: data 
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to check spam risk";
      setSpamError(errorMessage);
      console.error("Spam check error:", err);
    } finally {
      setIsCheckingSpam(false);
    }
  };

  const handleClear = () => {
    setState(INITIAL_STATE);
    setError("");
    setSpamError("");
    setShareUrl(null);
    setIsViewMode(false);
  };

  const translateRiskLevel = (level: string): string => {
    const translations: { [key: string]: string } = {
      "незначительный": "Low",
      "средний": "Medium",
      "высокий": "High",
      "критический": "Critical",
    };
    return translations[level.toLowerCase()] || level;
  };

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900">
            Text Analysis Tool
          </h1>
          <p className="text-sm text-gray-500 mt-1">Analyze keyword density and spam risk</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Side - Text Area */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700">
                Text to Analyze
              </label>
              <div className="flex items-center gap-3">
                {safeState.analysisResult && (
                  <div className="flex gap-1 border border-gray-300 rounded">
                    <button
                      onClick={() => setIsViewMode(false)}
                      className={`px-3 py-1 text-xs font-medium rounded-l transition-colors ${
                        !isViewMode
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                      title="Edit mode"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 inline mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      onClick={() => setIsViewMode(true)}
                      className={`px-3 py-1 text-xs font-medium rounded-r transition-colors ${
                        isViewMode
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                      title="View mode"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 inline mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                      </svg>
                      View
                    </button>
                  </div>
                )}
                <span className={`text-xs ${
                  safeState.text.length > MAX_TEXT_LENGTH 
                    ? 'text-red-600 font-medium' 
                    : 'text-gray-500'
                }`}>
                  {safeState.text.length} / {MAX_TEXT_LENGTH}
                </span>
              </div>
            </div>
            <HighlightedTextArea
              value={safeState.text}
              onChange={(value) =>
                setState({
                  text: value,
                  analysisResult: safeState.analysisResult,
                  spamRiskResult: safeState.spamRiskResult,
                })
              }
              keywords={[
                ...(safeState.analysisResult?.singleKeywords ?? []),
                ...(safeState.analysisResult?.stopwords ?? [])
              ]}
              placeholder="Paste your text here..."
              rows={22}
              isViewMode={isViewMode}
              hoveredKeyword={hoveredKeyword}
              onHoverChange={setHoveredKeyword}
            />

            <div className="flex gap-2 mt-3">
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !safeState.text?.trim() || safeState.text.length > MAX_TEXT_LENGTH || isViewMode}
                className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isAnalyzing ? "Analyzing..." : "Analyze Keywords"}
              </button>
              <button
                onClick={handleCheckSpam}
                disabled={isCheckingSpam || !safeState.text?.trim() || safeState.text.length > MAX_TEXT_LENGTH || isViewMode}
                className="flex-1 px-4 py-2 bg-orange-600 text-white text-sm font-medium rounded hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isCheckingSpam ? "Checking..." : "Check Spam Risk"}
              </button>
              <button
                onClick={handleShare}
                disabled={isSaving || !safeState.text?.trim() || safeState.text.length > MAX_TEXT_LENGTH}
                className="px-4 py-2 bg-green-600 text-white text-sm font-medium rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isSaving ? "Saving..." : "Share"}
              </button>
              <button
                onClick={handleClear}
                className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded hover:bg-gray-700 transition-colors"
              >
                Clear
              </button>
            </div>

            {error && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-xs">
                {error}
                </div>
            )}

            {spamError && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-xs">
                {spamError}
              </div>
            )}

            {safeState.analysisResult && (
              <div className="mt-3 p-3 bg-gray-50 border border-gray-200 rounded">
                <h3 className="text-xs font-medium text-gray-700 mb-2 uppercase tracking-wide">Text Statistics</h3>
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div>
                    <div className="text-lg font-semibold text-gray-900">
                      {safeState.text.length}
                    </div>
                    <div className="text-gray-600 mt-0.5">Chars</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-gray-900">
                      {safeState.text.replace(/\s/g, '').length}
                    </div>
                    <div className="text-gray-600 mt-0.5">No Space</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-gray-900">
                      {safeState.analysisResult?.totalWords ?? 0}
                    </div>
                    <div className="text-gray-600 mt-0.5">Words</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-gray-900">
                      {safeState.analysisResult?.uniqueWords ?? 0}
                    </div>
                    <div className="text-gray-600 mt-0.5">Unique</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Side - Analysis Results */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h2 className="text-sm font-medium text-gray-700 mb-4 uppercase tracking-wide">Results</h2>

            {safeState.analysisResult ? (
              <>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 mb-3">
                  <button
                    onClick={() => setActiveTab("keywords")}
                    className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
                      activeTab === "keywords"
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Keywords
                  </button>
                  <button
                    onClick={() => setActiveTab("phrases")}
                    className={`px-4 py-2 text-xs font-medium border-b-2 transition-colors ${
                      activeTab === "phrases"
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    Phrases
                  </button>
                </div>

                {/* Table Content */}
                <div className="overflow-auto" style={{ maxHeight: "520px" }}>
                  {activeTab === "keywords" ? (
                    <table className="w-full border-collapse text-xs">
                      <thead className="sticky top-0 bg-gray-50 border-b border-gray-300">
                        <tr>
                          <th className="text-left p-2 font-medium text-gray-700">
                            Keyword
                          </th>
                          <th className="text-left p-2 font-medium text-gray-700 w-20">
                            Density
                          </th>
                          <th className="text-left p-2 font-medium text-gray-700 w-20">
                            Count
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {(() => {
                          const allKeywords = [
                            ...(safeState.analysisResult?.singleKeywords ?? []),
                            ...(safeState.analysisResult?.stopwords ?? [])
                          ].sort((a, b) => b.density - a.density);
                          
                          return allKeywords.length === 0 ? (
                            <tr>
                              <td
                                colSpan={3}
                                className="text-center p-6 text-gray-400 text-xs"
                              >
                                No keywords found
                              </td>
                            </tr>
                          ) : (
                            allKeywords.map((item, index) => {
                              const isHovered = hoveredKeyword === item.keyword.toLowerCase();
                              const bgColor = isHovered && !item.isStopword
                                ? (() => {
                                    if (item.density < 1.8) return 'bg-blue-100';
                                    if (item.density < 2.8) return 'bg-yellow-100';
                                    if (item.density < 3.8) return 'bg-orange-100';
                                    return 'bg-red-100';
                                  })()
                                : '';
                              
                              return (
                                <tr
                                  key={index}
                                  className={`border-b border-gray-100 transition-colors cursor-pointer ${
                                    item.isStopword ? 'text-gray-400' : ''
                                  } ${bgColor}`}
                                  onMouseEnter={() => !item.isStopword && setHoveredKeyword(item.keyword.toLowerCase())}
                                  onMouseLeave={() => setHoveredKeyword(null)}
                                >
                                  <td className={`p-2 font-medium ${
                                    item.isStopword ? '' : getDensityColor(item.density)
                                  }`}>
                                    {item.keyword}
                                  </td>
                                  <td className={`p-2 ${
                                    item.isStopword ? '' : getDensityColor(item.density)
                                  }`}>
                                    {item.density}%
                                  </td>
                                  <td className={`p-2`}>
                                    <span className={`inline-block px-2 py-0.5 rounded font-medium ${
                                      item.isStopword 
                                        ? 'bg-gray-100 text-gray-500' 
                                        : 'bg-blue-100 text-blue-800'
                                    }`}>
                                      {item.timesUsed}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })
                          );
                        })()}
                      </tbody>
                    </table>
                  ) : (
                    <table className="w-full border-collapse text-xs">
                      <thead className="sticky top-0 bg-gray-50 border-b border-gray-300">
                        <tr>
                          <th className="text-left p-2 font-medium text-gray-700">
                            Phrase
                          </th>
                          <th className="text-left p-2 font-medium text-gray-700 w-20">
                            Count
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {(safeState.analysisResult?.phrases ?? []).length ===
                        0 ? (
                          <tr>
                            <td
                              colSpan={2}
                              className="text-center p-6 text-gray-400 text-xs"
                            >
                              No repeated phrases found
                            </td>
                          </tr>
                        ) : (
                          (safeState.analysisResult?.phrases ?? []).map(
                            (item, index) => (
                              <tr
                                key={index}
                                className="border-b border-gray-100"
                              >
                                <td className="p-2 font-medium text-gray-700">
                                  {item.phrase}
                                </td>
                                <td className="p-2">
                                  <span className="inline-block px-2 py-0.5 bg-blue-100 rounded text-blue-800 font-medium">
                                    {item.timesUsed}
                                  </span>
                                </td>
                              </tr>
                            )
                          )
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              </>
            ) : (
              <div className="text-center py-20 text-gray-400">
                <p className="text-xs">Enter text and click analyze to see results</p>
              </div>
            )}

            {safeState.spamRiskResult && (
              <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded">
                <h3 className="text-xs font-semibold text-gray-700 mb-3 uppercase tracking-wide">Spam Risk Analysis</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-gray-200">
                    <span className="text-gray-600">Risk Score</span>
                    <span className="font-semibold text-gray-900">{safeState.spamRiskResult.risk} pts</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-gray-200">
                    <span className="text-gray-600">Risk Level</span>
                    <span className="font-semibold text-gray-900">{translateRiskLevel(safeState.spamRiskResult.level)}</span>
                  </div>
                  {safeState.spamRiskResult.details?.map((detail, idx) => (
                    detail.params.map((param, paramIdx) => (
                      <div key={`${idx}-${paramIdx}`} className="flex justify-between py-1">
                        <span className="text-gray-600">{param.name}</span>
                        <div className="flex gap-2 items-center">
                          <span className="text-gray-800">{param.value}</span>
                          {param.score > 0 && (
                            <span className="px-1.5 py-0.5 bg-orange-100 text-orange-800 rounded text-xs font-medium">
                              {param.score}
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {shareUrl && (
        <ShareModal 
          url={shareUrl} 
          onClose={() => setShareUrl(null)} 
        />
      )}
    </div>
  );
}

