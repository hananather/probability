"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { cn } from '../../lib/design-system';

/**
 * KeyboardSetBuilder - Enhanced keyboard input system for set notation
 * 
 * Features:
 * - Smart symbol conversion (u→∪, n/i→∩, '→complement)
 * - Auto-focus and keyboard navigation
 * - Visual feedback while typing
 * - Autocomplete suggestions
 * - Error prevention and graceful handling
 */
export function KeyboardSetBuilder({ 
  value, 
  onChange, 
  onSubmit, 
  onDelete,
  onReset,
  errorMessage,
  className 
}) {
  const [cursorPosition, setCursorPosition] = useState(value.length);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(0);
  const [recentChars, setRecentChars] = useState(''); // Track recent characters for multi-char conversion
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Symbol mappings for smart conversion
  const symbolMappings = {
    'u': '∪',
    'U': '∪',
    'n': '∩',
    'N': '∩',
    'i': '∩',  // Alternative for intersection
    'I': '∩',
    "'": "'",  // Keep apostrophe for complement
    'e': '∅',  // Empty set
    'E': '∅',
    '0': '∅',  // Zero for empty set
  };
  
  // Multi-character mappings (for word-based input)
  const multiCharMappings = {
    'union': '∪',
    'inter': '∩',
    'intersection': '∩',
    'empty': '∅',
    'null': '∅',
    'comp': "'",
    'complement': "'",
  };

  // Valid set names
  const validSets = ['A', 'B', 'C', 'U', '∅'];

  // Autocomplete suggestions based on current context
  const getSuggestions = useCallback((text, position) => {
    const beforeCursor = text.slice(0, position);
    const lastChar = beforeCursor[beforeCursor.length - 1];
    
    // After an operator, suggest sets
    if (['∪', '∩', '('].includes(lastChar)) {
      return validSets.filter(s => s !== 'U'); // Don't suggest U after operators
    }
    
    // At the beginning or after ), suggest sets
    if (beforeCursor.length === 0 || lastChar === ')') {
      return validSets;
    }
    
    // After a set name, suggest operators
    if (validSets.includes(lastChar) || lastChar === ')' || lastChar === "'") {
      return ['∪', '∩', "'", ')'];
    }
    
    return [];
  }, []);

  // Focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Handle keyboard input
  const handleKeyDown = useCallback((e) => {
    const { key, ctrlKey, metaKey } = e;
    const modifierKey = ctrlKey || metaKey;

    // Submit on Enter
    if (key === 'Enter' && !showSuggestions) {
      e.preventDefault();
      onSubmit();
      return;
    }

    // Navigate suggestions
    if (showSuggestions) {
      const suggestions = getSuggestions(value, cursorPosition);
      
      switch (key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedSuggestion(prev => 
            prev < suggestions.length - 1 ? prev + 1 : 0
          );
          return;
          
        case 'ArrowUp':
          e.preventDefault();
          setSelectedSuggestion(prev => 
            prev > 0 ? prev - 1 : suggestions.length - 1
          );
          return;
          
        case 'Enter':
        case 'Tab':
          e.preventDefault();
          if (suggestions[selectedSuggestion]) {
            insertText(suggestions[selectedSuggestion]);
            setShowSuggestions(false);
          }
          return;
          
        case 'Escape':
          e.preventDefault();
          setShowSuggestions(false);
          return;
      }
    }

    // Clear on Escape (when no suggestions)
    if (key === 'Escape' && !showSuggestions) {
      e.preventDefault();
      onReset();
      return;
    }

    // Delete last character on Backspace
    if (key === 'Backspace' && value.length > 0 && cursorPosition > 0) {
      e.preventDefault();
      const newValue = value.slice(0, cursorPosition - 1) + value.slice(cursorPosition);
      onChange(newValue);
      setCursorPosition(cursorPosition - 1);
      return;
    }

    // Delete next character on Delete
    if (key === 'Delete' && cursorPosition < value.length) {
      e.preventDefault();
      const newValue = value.slice(0, cursorPosition) + value.slice(cursorPosition + 1);
      onChange(newValue);
      return;
    }

    // Navigate with arrow keys
    if (key === 'ArrowLeft' && cursorPosition > 0) {
      e.preventDefault();
      setCursorPosition(cursorPosition - 1);
      return;
    }

    if (key === 'ArrowRight' && cursorPosition < value.length) {
      e.preventDefault();
      setCursorPosition(cursorPosition + 1);
      return;
    }

    // Home/End navigation
    if (key === 'Home') {
      e.preventDefault();
      setCursorPosition(0);
      return;
    }

    if (key === 'End') {
      e.preventDefault();
      setCursorPosition(value.length);
      return;
    }

    // Clear all with Ctrl/Cmd + A then Delete
    if (modifierKey && key === 'a') {
      // Let browser handle select all
      return;
    }

    // Show suggestions with Ctrl/Cmd + Space
    if (modifierKey && key === ' ') {
      e.preventDefault();
      setShowSuggestions(!showSuggestions);
      return;
    }
  }, [value, cursorPosition, showSuggestions, selectedSuggestion, getSuggestions, onChange, onSubmit, onReset]);

  // Handle regular character input
  const handleInput = useCallback((e) => {
    e.preventDefault();
    const char = e.data || e.key;
    
    if (!char || char.length !== 1) return;

    // Check for smart symbol conversion
    const mappedSymbol = symbolMappings[char];
    const insertChar = mappedSymbol || char;

    // Validate input
    if (isValidInput(insertChar)) {
      // Auto-close parentheses
      if (insertChar === '(') {
        const newValue = value.slice(0, cursorPosition) + '()' + value.slice(cursorPosition);
        onChange(newValue);
        setCursorPosition(cursorPosition + 1); // Position cursor between parentheses
        return;
      }
      
      insertText(insertChar);
    }
  }, [value, cursorPosition, onChange]);

  // Insert text at cursor position
  const insertText = useCallback((text) => {
    const newValue = value.slice(0, cursorPosition) + text + value.slice(cursorPosition);
    onChange(newValue);
    setCursorPosition(cursorPosition + text.length);
    
    // Show suggestions after insertion
    const suggestions = getSuggestions(newValue, cursorPosition + text.length);
    if (suggestions.length > 0) {
      setShowSuggestions(true);
      setSelectedSuggestion(0);
    }
  }, [value, cursorPosition, onChange, getSuggestions]);

  // Validate if input character is allowed
  const isValidInput = (char) => {
    const allowedChars = ['A', 'B', 'C', 'U', '∅', '∪', '∩', "'", '(', ')', ' '];
    
    // Basic character validation
    if (!allowedChars.includes(char)) return false;
    
    // Context-aware validation
    const beforeCursor = value.slice(0, cursorPosition);
    const lastChar = beforeCursor[beforeCursor.length - 1];
    
    // Prevent double operators
    if (['∪', '∩'].includes(char) && ['∪', '∩'].includes(lastChar)) {
      return false;
    }
    
    // Prevent operator at start (except complement)
    if (beforeCursor.length === 0 && ['∪', '∩'].includes(char)) {
      return false;
    }
    
    // Prevent invalid complement placement
    if (char === "'" && (!lastChar || !['A', 'B', 'C', 'U', ')', "'"].includes(lastChar))) {
      return false;
    }
    
    return true;
  };

  // Render cursor
  const renderWithCursor = () => {
    if (!value) {
      return (
        <>
          <span className="cursor-blink">|</span>
          <span className="text-neutral-500">Enter set notation...</span>
        </>
      );
    }

    const before = value.slice(0, cursorPosition);
    const after = value.slice(cursorPosition);
    
    return (
      <>
        {before}
        <span className="cursor-blink">|</span>
        {after}
      </>
    );
  };

  // Update cursor position when value changes externally
  useEffect(() => {
    setCursorPosition(value.length);
  }, [value]);

  return (
    <div className={cn("relative", className)}>
      {/* Hidden input for keyboard capture */}
      <input
        ref={inputRef}
        type="text"
        className="absolute opacity-0 pointer-events-none"
        onKeyDown={handleKeyDown}
        onInput={handleInput}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        value={value}
        onChange={() => {}} // Controlled by onInput
      />

      {/* Visual display */}
      <div 
        className="bg-neutral-900 rounded p-3 min-h-[50px] font-mono text-lg text-white cursor-text"
        onClick={() => inputRef.current?.focus()}
      >
        {renderWithCursor()}
      </div>

      {/* Error message */}
      {errorMessage && (
        <div className="text-red-400 text-sm mt-2">{errorMessage}</div>
      )}

      {/* Minimal keyboard hints */}
      <div className="text-xs text-neutral-500 mt-2">
        <div>u→∪ • n→∩ • '→complement • Enter to evaluate</div>
      </div>

      {/* Autocomplete suggestions */}
      {showSuggestions && (
        <div 
          ref={suggestionsRef}
          className="absolute top-full mt-1 bg-neutral-800 rounded shadow-lg border border-neutral-700 py-1 z-10"
        >
          {getSuggestions(value, cursorPosition).map((suggestion, index) => (
            <div
              key={suggestion}
              className={cn(
                "px-3 py-1 cursor-pointer transition-colors",
                index === selectedSuggestion 
                  ? "bg-neutral-700 text-white" 
                  : "text-neutral-300 hover:bg-neutral-700"
              )}
              onClick={() => {
                insertText(suggestion);
                setShowSuggestions(false);
                inputRef.current?.focus();
              }}
            >
              {suggestion}
            </div>
          ))}
        </div>
      )}

      <style jsx>{`
        .cursor-blink {
          animation: blink 1s step-end infinite;
          color: #fbbf24;
          font-weight: normal;
        }
        
        @keyframes blink {
          0%, 50% { opacity: 1; }
          50.01%, 100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// Keyboard shortcuts legend component
export function KeyboardLegend({ className }) {
  return (
    <details className={cn("text-xs", className)}>
      <summary className="font-medium text-neutral-400 cursor-pointer hover:text-neutral-300 transition-colors">
        Keyboard shortcuts
      </summary>
      <div className="mt-2 space-y-1 text-neutral-500">
        <div><kbd className="px-1 py-0.5 bg-neutral-800 rounded text-xs">u</kbd> → ∪ • <kbd className="px-1 py-0.5 bg-neutral-800 rounded text-xs">n</kbd> → ∩ • <kbd className="px-1 py-0.5 bg-neutral-800 rounded text-xs">'</kbd> → complement</div>
        <div><kbd className="px-1 py-0.5 bg-neutral-800 rounded text-xs">e/0</kbd> → ∅ • <kbd className="px-1 py-0.5 bg-neutral-800 rounded text-xs">Esc</kbd> → Clear</div>
        <div><kbd className="px-1 py-0.5 bg-neutral-800 rounded text-xs">Ctrl+Space</kbd> → Suggestions</div>
      </div>
    </details>
  );
}

export default KeyboardSetBuilder;