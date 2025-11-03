'use client';

import * as React from "react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Check, X, Wand2, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * AI-enhanced Input component with beautiful UX
 * Shows AI button for generation with multiple suggestions
 */
function AIInput({
  value,
  onChange,
  onGenerate,
  placeholder,
  disabled = false,
  showAIButton = true,
  className,
  ...props
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showBadge, setShowBadge] = useState(!value);

  const handleGenerate = async () => {
    if (!onGenerate) return;

    setIsGenerating(true);
    setShowBadge(false);
    try {
      const result = await onGenerate();
      if (Array.isArray(result) && result.length > 0) {
        // If onGenerate returns an array, show suggestions
        setSuggestions(result);
        setShowSuggestions(true);
      } else if (typeof result === 'string') {
        // If onGenerate returns a single string, use it directly
        onChange({ target: { value: result } });
      }
    } catch (error) {
      console.error('Error generating content:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectSuggestion = (suggestion) => {
    onChange({ target: { value: suggestion } });
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleCloseSuggestions = () => {
    setSuggestions([]);
    setShowSuggestions(false);
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
        <Input
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled || isGenerating}
          className={cn(
            "transition-all duration-200 pr-32",
            showSuggestions && "border-purple-300 border-2",
            isGenerating && "border-purple-300 bg-purple-50/30",
            className
          )}
          {...props}
        />

        {/* AI Badge - shows when field is empty */}
        {showAIButton && showBadge && !value && (
          <div className="absolute top-1/2 -translate-y-1/2 right-28 pointer-events-none z-10">
            <div className="flex items-center gap-1.5 px-2 py-1 bg-gradient-to-r from-purple-100 to-blue-100 rounded-md text-xs font-medium text-purple-700 shadow-sm animate-pulse">
              <Wand2 className="h-3 w-3" />
              <span>Let AI help</span>
            </div>
          </div>
        )}

        {/* AI Generate Button - positioned at right of input */}
        {showAIButton && onGenerate && !value && (
          <div className="absolute top-1/2 -translate-y-1/2 right-1 z-10">
            <Button
              type="button"
              size="sm"
              onClick={handleGenerate}
              disabled={disabled || isGenerating}
              className={cn(
                "h-7 px-3 gap-1.5 transition-all duration-200",
                "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700",
                "text-white shadow-md hover:shadow-lg",
                "border-0",
                "transform hover:scale-105",
                isGenerating && "from-purple-500 to-blue-500 scale-100"
              )}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  <span className="text-xs font-medium">Generating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  <span className="text-xs font-semibold">Generate</span>
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Suggestions View - shows generated suggestions */}
      {showSuggestions && suggestions.length > 0 && (
        <div className="rounded-xl border-2 border-purple-200 bg-gradient-to-br from-purple-50 via-white to-blue-50 p-4 shadow-xl animate-in slide-in-from-top-2 duration-300">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg shadow-md">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">AI Suggestions</p>
                  <p className="text-xs text-gray-600">Choose one or generate new suggestions</p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleCloseSuggestions}
                className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Suggestions List */}
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelectSuggestion(suggestion)}
                  className="w-full text-left rounded-lg border-2 border-purple-200 bg-white p-3 shadow-sm hover:border-purple-400 hover:shadow-md transition-all duration-200 group"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-900 font-medium group-hover:text-purple-700 transition-colors">
                      {suggestion}
                    </p>
                    <Check className="h-4 w-4 text-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </button>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleGenerate}
                disabled={isGenerating}
                className="flex-1 h-9 gap-2 border-2 hover:bg-purple-50 hover:border-purple-300"
              >
                <RefreshCw className={cn("h-4 w-4", isGenerating && "animate-spin")} />
                <span className="font-medium">Generate New Suggestions</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseSuggestions}
                className="h-9 px-4 gap-2 border-2 hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
                <span className="font-medium">Close</span>
              </Button>
            </div>

            {/* Tip */}
            <div className="flex items-center gap-2 p-2 bg-blue-50 rounded-lg border border-blue-200">
              <div className="text-blue-600 text-lg">💡</div>
              <p className="text-xs text-blue-700">
                <span className="font-semibold">Tip:</span> Click any suggestion to use it, or generate new ones until you find the perfect match.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export { AIInput };
