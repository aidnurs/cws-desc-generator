"use client";

import { useState } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { getDensityColor } from "@/utils/keywords";
import { AppState, AnalysisResult } from "@/types";
import { API_ENDPOINTS } from "@/config/api";

const INITIAL_STATE: AppState = {
  text: "",
  analysisResult: null,
  turgenevResult: null,
};

export default function Home() {
  const [state, setState, isLoaded] = useLocalStorage<AppState>(
    "app-state",
    INITIAL_STATE
  );
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isCheckingSpam, setIsCheckingSpam] = useState(false);
  const [error, setError] = useState("");
  const [spamError, setSpamError] = useState("");
  const [activeTab, setActiveTab] = useState<"keywords" | "phrases">(
    "keywords"
  );

  const safeState = {
    text: state?.text ?? "",
    analysisResult: state?.analysisResult ?? null,
    turgenevResult: state?.turgenevResult ?? null,
  };

  const handleAnalyze = async () => {
    const textValue = safeState.text?.trim() ?? "";
    if (!textValue) {
      setError("Please enter text to analyze");
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
      setState({ text: safeState.text, analysisResult: data, turgenevResult: safeState.turgenevResult });
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
          api_key: "720ce7af57236a9415a15b72a55efe62",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to check spam risk");
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || "Turgenev API returned an error");
      }

      setState({ 
        text: safeState.text, 
        analysisResult: safeState.analysisResult,
        turgenevResult: data 
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-3xl font-bold text-gray-900">
            Keyword Density Analysis Tool
          </h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Left Side - Text Area */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow">
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Text to Analyze
            </label>
            <textarea
              value={safeState.text}
              onChange={(e) =>
                setState({
                  text: e.target.value,
                  analysisResult: safeState.analysisResult,
                  turgenevResult: safeState.turgenevResult,
                })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none font-mono text-sm"
              placeholder="Enter your text here for keyword density analysis..."
              rows={20}
            />

            <div className="flex gap-3 mt-4">
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing || !safeState.text?.trim()}
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow"
              >
                {isAnalyzing && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                {isAnalyzing ? "Analyzing..." : "Analyze"}
              </button>
              <button
                onClick={handleCheckSpam}
                disabled={isCheckingSpam || !safeState.text?.trim()}
                className="px-6 py-3 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow"
              >
                {isCheckingSpam && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                {isCheckingSpam ? "Checking..." : "Check Spam Risk"}
              </button>
              <button
                onClick={handleClear}
                className="px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 shadow"
              >
                Clear
              </button>
            </div>

            {error && (
              <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg text-red-700 text-sm shadow-sm">
                <div className="flex items-start gap-2">
                  <span className="text-red-500 font-bold text-lg">×</span>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {spamError && (
              <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg text-red-700 text-sm shadow-sm">
                <div className="flex items-start gap-2">
                  <span className="text-red-500 font-bold text-lg">×</span>
                  <span>{spamError}</span>
                </div>
              </div>
            )}

            {safeState.turgenevResult && (
              <div className="mt-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Spam Risk Analysis (Turgenev)</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Overall Risk</span>
                    <span className="font-bold text-gray-900">{safeState.turgenevResult.risk} points</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">Risk Level</span>
                    <span className="font-bold text-gray-900">{translateRiskLevel(safeState.turgenevResult.level)}</span>
                  </div>
                  {safeState.turgenevResult.details?.map((detail, idx) => (
                    detail.params.map((param, paramIdx) => (
                      <div key={`${idx}-${paramIdx}`} className="flex justify-between py-1.5 text-xs">
                        <span className="text-gray-600">{param.name}</span>
                        <div className="flex gap-2 items-center">
                          <span className="text-gray-700">{param.value}</span>
                          {param.score > 0 && (
                            <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded text-xs font-medium">
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

          {/* Right Side - Analysis Results */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Analysis Results</h2>

            {safeState.analysisResult ? (
              <>
                <div className="mb-4 p-4 bg-gray-100 rounded-lg">
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div>
                      <div className="text-xl font-bold text-gray-900">
                        {safeState.text.length}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">Characters</div>
            </div>
                    <div>
                      <div className="text-xl font-bold text-gray-900">
                        {safeState.text.replace(/\s/g, '').length}
          </div>
                      <div className="text-xs text-gray-600 mt-1">No Spaces</div>
          </div>
                    <div>
                      <div className="text-xl font-bold text-gray-900">
                        {safeState.analysisResult?.totalWords ?? 0}
                </div>
                      <div className="text-xs text-gray-600 mt-1">Word Count</div>
                </div>
              </div>
                  <div className="mt-3 pt-3 border-t border-gray-300 text-center">
                    <div className="text-xl font-bold text-gray-900">
                      {safeState.analysisResult?.uniqueWords ?? 0}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">Unique Words</div>
                </div>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 mb-4">
                  <button
                    onClick={() => setActiveTab("keywords")}
                    className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                      activeTab === "keywords"
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Single Keywords
                  </button>
                  <button
                    onClick={() => setActiveTab("phrases")}
                    className={`px-6 py-3 font-medium text-sm border-b-2 transition-colors ${
                      activeTab === "phrases"
                        ? "border-blue-600 text-blue-600"
                        : "border-transparent text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    Keyword Phrases
                  </button>
                </div>

                {/* Table Content */}
                <div className="overflow-auto" style={{ maxHeight: "500px" }}>
                  {activeTab === "keywords" ? (
                    <table className="w-full border-collapse text-sm">
                      <thead className="sticky top-0 bg-gray-100 border-b-2 border-gray-200">
                        <tr>
                          <th className="text-left p-3 font-semibold text-gray-700">
                            Keyword
                          </th>
                          <th className="text-left p-3 font-semibold text-gray-700 w-24">
                            Density
                          </th>
                          <th className="text-left p-3 font-semibold text-gray-700 w-24">
                            Times Used
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
                                className="text-center p-8 text-gray-500"
                              >
                                No keywords found
                              </td>
                            </tr>
                          ) : (
                            allKeywords.map((item, index) => (
                              <tr
                                key={index}
                                className={`border-b border-gray-100 hover:bg-gray-50 ${
                                  item.isStopword ? 'text-gray-400' : ''
                                }`}
                              >
                                <td className={`p-3 font-medium ${
                                  item.isStopword ? '' : getDensityColor(item.density) + ' rounded-l-lg'
                                }`}>
                                  {item.keyword}
                                </td>
                                <td className={`p-3 ${
                                  item.isStopword ? '' : getDensityColor(item.density)
                                }`}>
                                  {item.density}%
                                </td>
                                <td className={`p-3 ${
                                  item.isStopword ? '' : getDensityColor(item.density) + ' rounded-r-lg'
                                }`}>
                                  <span className={`inline-block px-3 py-1 rounded-lg font-bold ${
                                    item.isStopword 
                                      ? 'bg-gray-100 text-gray-500' 
                                      : 'bg-blue-100 text-gray-700'
                                  }`}>
                                    {item.timesUsed}
                                  </span>
                                </td>
                              </tr>
                            ))
                          );
                        })()}
                      </tbody>
                    </table>
                  ) : (
                    <table className="w-full border-collapse text-sm">
                      <thead className="sticky top-0 bg-gray-100 border-b-2 border-gray-200">
                        <tr>
                          <th className="text-left p-3 font-semibold text-gray-700">
                            Phrase
                          </th>
                          <th className="text-left p-3 font-semibold text-gray-700 w-24">
                            Times Used
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {(safeState.analysisResult?.phrases ?? []).length ===
                        0 ? (
                          <tr>
                            <td
                              colSpan={2}
                              className="text-center p-8 text-gray-500"
                            >
                              No repeated phrases found
                            </td>
                          </tr>
                        ) : (
                          (safeState.analysisResult?.phrases ?? []).map(
                            (item, index) => (
                              <tr
                                key={index}
                                className="border-b border-gray-100 hover:bg-gray-50"
                              >
                                <td className="p-3 font-medium">
                                  {item.phrase}
                                </td>
                                <td className="p-3">
                                  <span className="inline-block px-3 py-1 bg-blue-100 rounded-lg text-gray-700 font-bold">
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
              <div className="text-center py-16 text-gray-500">
                <div className="text-4xl mb-4">📊</div>
                <p className="font-medium">No analysis yet</p>
                <p className="text-sm mt-2">
                  Enter text and click Analyze to see results
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

