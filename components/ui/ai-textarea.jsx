'use client';

import * as React from "react";
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Check, X, Wand2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * AI-enhanced Textarea component with beautiful UX
 * Shows AI buttons for generation and polishing with hover previews
 */
function AITextarea({
  value,
  onChange,
  onGenerate,
  onPolish,
  placeholder,
  disabled = false,
  showAIButtons = true,
  polishTone = 'professional',
  className,
  ...props
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPolishing, setIsPolishing] = useState(false);
  const [polishedVersion, setPolishedVersion] = useState(null);
  const [showComparison, setShowComparison] = useState(false);
  const [showBadge, setShowBadge] = useState(!value);

  const handleGenerate = async () => {
    if (!onGenerate) return;

    setIsGenerating(true);
    setShowBadge(false);
    try {
      const result = await onGenerate();
      if (typeof result === 'string') {
        onChange({ target: { value: result } });
      }
    } catch (error) {
      console.error('Error generating content:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePolish = async () => {
    if (!onPolish || !value || value.trim().length === 0) return;

    setIsPolishing(true);
    try {
      const result = await onPolish(value, polishTone);
      setPolishedVersion(result);
      setShowComparison(true);
    } catch (error) {
      console.error('Error polishing content:', error);
    } finally {
      setIsPolishing(false);
    }
  };

  const handleAcceptPolished = () => {
    if (polishedVersion) {
      onChange({ target: { value: polishedVersion } });
      setPolishedVersion(null);
      setShowComparison(false);
    }
  };

  const handleRejectPolished = () => {
    setPolishedVersion(null);
    setShowComparison(false);
  };

  // Hide badge when user starts typing
  React.useEffect(() => {
    if (value) {
      setShowBadge(false);
    }
  }, [value]);

  return (
    <div className="space-y-3">
      <div className="relative group">
        <Textarea
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled || isGenerating || isPolishing}
          className={cn(
            "min-h-[120px] transition-all duration-200 pr-4 pb-14",
            showComparison && "border-purple-300 border-2",
            (isGenerating || isPolishing) && "border-purple-300 bg-purple-50/30",
            className
          )}
          {...props}
        />

        {/* AI Badge - shows when field is empty */}
        {showAIButtons && showBadge && !value && (
          <div className="absolute top-3 right-3 pointer-events-none z-10">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg text-xs font-medium text-purple-700 shadow-sm animate-pulse">
              <Wand2 className="h-3.5 w-3.5" />
              <span>Let AI write this for you</span>
            </div>
          </div>
        )}

        {/* AI Action Buttons - positioned at bottom of textarea */}
        {showAIButtons && (
          <div className="absolute bottom-2 right-2 flex gap-2 z-10">
            {/* Generate Button - shows when empty */}
            {onGenerate && !value && (
              <Button
                type="button"
                size="sm"
                onClick={handleGenerate}
                disabled={disabled || isGenerating || isPolishing}
                className={cn(
                  "h-9 px-4 gap-2 transition-all duration-200",
                  "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700",
                  "text-white shadow-lg hover:shadow-xl",
                  "border-0",
                  "transform hover:scale-105",
                  isGenerating && "from-purple-500 to-blue-500 scale-100"
                )}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm font-medium">Generating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span className="text-sm font-semibold">Generate with AI</span>
                  </>
                )}
              </Button>
            )}

            {/* Polish Button - shows when there's content */}
            {onPolish && value && value.trim().length > 0 && !showComparison && (
              <Button
                type="button"
                size="sm"
                onClick={handlePolish}
                disabled={disabled || isGenerating || isPolishing}
                className={cn(
                  "h-9 px-4 gap-2 transition-all duration-200",
                  "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700",
                  "text-white shadow-lg hover:shadow-xl",
                  "border-0",
                  "transform hover:scale-105",
                  isPolishing && "from-emerald-500 to-teal-500 scale-100"
                )}
              >
                {isPolishing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm font-medium">Polishing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    <span className="text-sm font-semibold">Polish with AI</span>
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Comparison View - shows polished version */}
      {showComparison && polishedVersion && (
        <div className="rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-white to-blue-50 p-4 shadow-xl animate-in slide-in-from-top-2 duration-300">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg shadow-md">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">AI Polished Version</p>
                  <p className="text-xs text-gray-600">Review the improved version below</p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleRejectPolished}
                className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Polished Content */}
            <div className="relative rounded-lg border-2 border-purple-200 bg-white p-4 shadow-sm">
              <div className="absolute -top-2 -right-2 p-1.5 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full shadow-md">
                <Check className="h-3 w-3 text-white" />
              </div>
              <p className="text-sm text-gray-900 leading-relaxed whitespace-pre-wrap">
                {polishedVersion}
              </p>
            </div>

            {/* Original Content - Collapsed */}
            <details className="group">
              <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-700 font-medium flex items-center gap-1">
                <span>Compare with original</span>
                <svg className="w-4 h-4 transition-transform group-open:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="mt-2 rounded-lg border border-gray-200 bg-gray-50 p-3">
                <p className="text-xs text-gray-600 mb-1 font-medium">Original:</p>
                <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {value}
                </p>
              </div>
            </details>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                type="button"
                onClick={handleAcceptPolished}
                className={cn(
                  "flex-1 h-10 gap-2",
                  "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700",
                  "text-white shadow-md hover:shadow-lg",
                  "border-0",
                  "transform hover:scale-105 transition-all duration-200"
                )}
              >
                <Check className="h-4 w-4" />
                <span className="font-semibold">Use Polished Version</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleRejectPolished}
                className="h-10 px-4 gap-2 border-2 hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
                <span className="font-medium">Keep Original</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handlePolish}
                disabled={isPolishing}
                className="h-10 px-4 gap-2 border-2 hover:bg-purple-50 hover:border-purple-300"
              >
                <RefreshCw className={cn("h-4 w-4", isPolishing && "animate-spin")} />
                <span className="font-medium">Retry</span>
              </Button>
            </div>

            {/* Tip */}
            <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-blue-600 text-lg">💡</div>
              <p className="text-xs text-blue-700">
                <span className="font-semibold">Tip:</span> AI polishing improves grammar, clarity, and tone while keeping your message intact.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export { AITextarea };
