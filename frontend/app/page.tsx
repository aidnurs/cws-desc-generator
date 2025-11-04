"use client";

import { useEffect, useState } from "react";
import { KeywordTable } from "@/components/KeywordTable";
import { CSVImport } from "@/components/CSVImport";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import {
  countKeywordOccurrences,
  calculateStats,
  exportToJSON,
} from "@/utils/keywords";
import {
  AppState,
  Keyword,
  EXTENSION_NAME_MIN_LENGTH,
  EXTENSION_NAME_MAX_LENGTH,
  SHORT_DESC_MIN_LENGTH,
  SHORT_DESC_MAX_LENGTH,
} from "@/types";
import { API_ENDPOINTS } from "@/config/api";

const INITIAL_STATE: AppState = {
  mainKeywords: [],
  extraKeywords: [],
  extensionName: "",
  shortDescription: "",
  userPrompt: "",
  generatedText: "",
};

export default function Home() {
  const [state, setState, isLoaded] = useLocalStorage<AppState>(
    "app-state",
    INITIAL_STATE
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [showUserPrompt, setShowUserPrompt] = useState(false);
  const [showCleanModal, setShowCleanModal] = useState(false);
  const [showKeywords, setShowKeywords] = useState(true);

  useEffect(() => {
    if (!state.generatedText) return;

    const updateKeywords = (keywords: Keyword[]) =>
      keywords.map((k) => ({
        ...k,
        timesUsed: countKeywordOccurrences(state.generatedText, k.key),
      }));

    const updatedMainKeywords = updateKeywords(state.mainKeywords);
    const updatedExtraKeywords = updateKeywords(state.extraKeywords);

    // Only update if counts have actually changed
    const hasChanged =
      updatedMainKeywords.some(
        (k, i) => k.timesUsed !== state.mainKeywords[i]?.timesUsed
      ) ||
      updatedExtraKeywords.some(
        (k, i) => k.timesUsed !== state.extraKeywords[i]?.timesUsed
      );

    if (hasChanged) {
      setState({
        ...state,
        mainKeywords: updatedMainKeywords,
        extraKeywords: updatedExtraKeywords,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.generatedText]);

  const handleGenerateDescription = async () => {
    setIsGenerating(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch(API_ENDPOINTS.generateDescription, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          extension_name: state.extensionName,
          short_description: state.shortDescription,
          main_keywords: state.mainKeywords.map((k) => k.key).filter(Boolean),
          extra_keywords: state.extraKeywords.map((k) => k.key).filter(Boolean),
          user_prompt: state.userPrompt,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate description");
      }

      const data = await response.json();
      setState({ ...state, generatedText: data.description });
      setSuccessMessage("Description generated successfully!");
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to generate description";
      setError(errorMessage);
      console.error("Generation error:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(state.generatedText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const handleClean = () => {
    setShowCleanModal(true);
  };

  const handleConfirmClean = () => {
    setState(INITIAL_STATE);
    setShowCleanModal(false);
  };

  const handleCancelClean = () => {
    setShowCleanModal(false);
  };

  const handleDownload = () => {
    const data = {
      ...state,
      stats: calculateStats(state.generatedText),
      exportDate: new Date().toISOString(),
    };
    exportToJSON(data, `description-${Date.now()}.json`);
  };

  const stats = calculateStats(state.generatedText);
  const isExtensionNameValid =
    state.extensionName.length >= EXTENSION_NAME_MIN_LENGTH &&
    state.extensionName.length <= EXTENSION_NAME_MAX_LENGTH;
  const isShortDescValid =
    state.shortDescription.length >= SHORT_DESC_MIN_LENGTH &&
    state.shortDescription.length <= SHORT_DESC_MAX_LENGTH;

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
            Chrome Extension Description Generator
          </h1>
        </header>

        <div className="space-y-6">
          {/* Keyword Tables */}
          <div className="bg-white border border-gray-200 rounded-lg shadow">
            <button
              type="button"
              onClick={() => setShowKeywords(!showKeywords)}
              className="w-full flex items-center justify-between p-4 hover:bg-gray-50 rounded-t-lg"
            >
              <h2 className="text-lg font-bold text-gray-900">Keywords</h2>
              <span
                className="text-gray-600 transform transition-transform duration-200"
                style={{
                  transform: showKeywords ? "rotate(180deg)" : "rotate(0deg)",
                }}
              >
                ▼
              </span>
            </button>
            
            {showKeywords && (
              <div className="p-6 border-t border-gray-200">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <div className="mb-2 flex gap-2">
                      <CSVImport
                        label="Import Main Keywords CSV"
                        onImport={(keywords) =>
                          setState({
                            ...state,
                            mainKeywords: [...state.mainKeywords, ...keywords],
                          })
                        }
                      />
                    </div>
                    <KeywordTable
                      title="Main Keywords"
                      keywords={state.mainKeywords}
                      onChange={(keywords) =>
                        setState({ ...state, mainKeywords: keywords })
                      }
                    />
                  </div>

                  <div>
                    <div className="mb-2 flex gap-2">
                      <CSVImport
                        label="Import Extra Keywords CSV"
                        onImport={(keywords) =>
                          setState({
                            ...state,
                            extraKeywords: [...state.extraKeywords, ...keywords],
                          })
                        }
                      />
                    </div>
                    <KeywordTable
                      title="Extra Keywords"
                      keywords={state.extraKeywords}
                      onChange={(keywords) =>
                        setState({ ...state, extraKeywords: keywords })
                      }
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Fields */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Extension Name{" "}
                <span className="text-gray-400 font-normal">
                  ({state.extensionName.length}/{EXTENSION_NAME_MAX_LENGTH})
                </span>
              </label>
              {!isExtensionNameValid && state.extensionName.length > 0 && (
                <p className="text-xs text-red-600 mb-2">
                  Must be between {EXTENSION_NAME_MIN_LENGTH} and{" "}
                  {EXTENSION_NAME_MAX_LENGTH} characters
                </p>
              )}
              <input
                type="text"
                value={state.extensionName}
                onChange={(e) =>
                  setState({ ...state, extensionName: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter extension name"
                maxLength={EXTENSION_NAME_MAX_LENGTH}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Short Description{" "}
                <span className="text-gray-400 font-normal">
                  ({state.shortDescription.length}/{SHORT_DESC_MAX_LENGTH})
                </span>
              </label>
              {!isShortDescValid && state.shortDescription.length > 0 && (
                <p className="text-xs text-red-600 mb-2">
                  Must be between {SHORT_DESC_MIN_LENGTH} and{" "}
                  {SHORT_DESC_MAX_LENGTH} characters
                </p>
              )}
              <textarea
                value={state.shortDescription}
                onChange={(e) =>
                  setState({ ...state, shortDescription: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                placeholder="Enter short description"
                rows={2}
                maxLength={SHORT_DESC_MAX_LENGTH}
              />
            </div>

            {/* <div>
              <button
                type="button"
                onClick={() => setShowUserPrompt(!showUserPrompt)}
                className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-gray-900 transition-colors"
                disabled={true}
              >
                <span
                  className="transform transition-transform duration-200"
                  style={{
                    transform: showUserPrompt
                      ? "rotate(90deg)"
                      : "rotate(0deg)",
                  }}
                >
                  ▶
                </span>
                User Prompt (Future Feature)
              </button>
              {showUserPrompt && (
                <div className="mt-3 animate-fadeIn">
                  <textarea
                    value={state.userPrompt}
                    onChange={(e) =>
                      setState({ ...state, userPrompt: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                    placeholder="User prompt for AI"
                    rows={4}
                    disabled={true}
                  />
                </div>
              )}
            </div> */}

            <div className="flex gap-3 items-center pt-2">
              <button
                onClick={handleGenerateDescription}
                disabled={
                  isGenerating || !isExtensionNameValid || !isShortDescValid
                }
                className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow"
              >
                {isGenerating && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                {isGenerating
                  ? "Generating..."
                  : "Generate Description with AI"}
              </button>
              {(!isExtensionNameValid || !isShortDescValid) && (
                <span className="text-sm text-gray-500">
                  Please fill in all required fields correctly
                </span>
              )}
            </div>

            {error && (
              <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-lg text-red-700 text-sm shadow-sm">
                <div className="flex items-start gap-2">
                  <span className="text-red-500 font-bold text-lg">×</span>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {successMessage && (
              <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-lg text-green-700 text-sm shadow-sm">
                <div className="flex items-start gap-2">
                  <span className="text-green-500 font-bold">✓</span>
                  <span>{successMessage}</span>
                </div>
              </div>
            )}
          </div>

          {/* Generated Text Editor */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow">
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-semibold text-gray-700">
                Generated Description
              </label>
              {state.generatedText && (
                <button
                  onClick={handleCopyText}
                  className="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-medium"
                >
                  {copied ? "✓ Copied!" : "Copy Text"}
                </button>
              )}
            </div>
            <textarea
              value={state.generatedText}
              onChange={(e) =>
                setState({ ...state, generatedText: e.target.value })
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm resize-none"
              placeholder="Generated description will appear here..."
              rows={24}
              maxLength={16000}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleDownload}
              className="px-5 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow"
            >
              Download JSON
            </button>
            <button
              onClick={handleClean}
              className="px-5 py-2.5 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 shadow"
            >
              Clean All
            </button>
          </div>

          {/* Stats Footer */}
          <div className="bg-gray-100 border border-gray-200 rounded-lg p-6 shadow">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">
                  {stats.total}
                </div>
                <div className="text-sm text-gray-600 font-medium mt-1">
                  Total Characters
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">
                  {stats.withoutSpaces}
                </div>
                <div className="text-sm text-gray-600 font-medium mt-1">
                  Characters (no spaces)
                </div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900">
                  {stats.words}
                </div>
                <div className="text-sm text-gray-600 font-medium mt-1">
                  Word Count
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Clean All Confirmation Modal */}
      {showCleanModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Clear All Data?
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to clear all data? This will reset
              everything including keywords, extension details, and generated
              text. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleCancelClean}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmClean}
                className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
