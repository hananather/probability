'use client';

import React, { useState } from 'react';
import { Button } from '../button';
import { Maximize2, X } from 'lucide-react';

/**
 * ExpandableVisual - A reusable component that allows any content to be expanded into a modal view
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - The content to display (both in normal and expanded view)
 * @param {string} props.title - Optional title for the expanded modal
 * @param {string} props.buttonText - Optional custom text for expand button (default: "Expand")
 * @param {string} props.buttonVariant - Button variant (default: "secondary")
 * @param {string} props.buttonSize - Button size (default: "sm")
 * @param {string} props.buttonClassName - Additional button classes
 * @param {string} props.modalClassName - Additional modal content classes
 * @param {boolean} props.showIcon - Whether to show the expand icon (default: true)
 * @param {string} props.expandedWidth - Max width of expanded modal (default: "max-w-6xl")
 * @param {function} props.onExpand - Optional callback when expanded
 * @param {function} props.onClose - Optional callback when closed
 * @param {boolean} props.passPropsToExpanded - Pass different props to expanded view
 * @param {Object} props.expandedProps - Props to pass to children when expanded
 */
export const ExpandableVisual = ({
  children,
  title,
  buttonText = "Expand",
  buttonVariant = "secondary",
  buttonSize = "sm",
  buttonClassName = "",
  modalClassName = "",
  showIcon = true,
  expandedWidth = "max-w-6xl",
  onExpand,
  onClose,
  passPropsToExpanded = false,
  expandedProps = {},
  ...props
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleExpand = () => {
    setIsExpanded(true);
    onExpand?.();
  };

  const handleClose = () => {
    setIsExpanded(false);
    onClose?.();
  };

  return (
    <>
      {/* Normal View with Expand Button */}
      <div className="relative" {...props}>
        {children}
        <Button
          variant={buttonVariant}
          size={buttonSize}
          onClick={handleExpand}
          className={`mt-3 ${buttonClassName}`}
        >
          {showIcon && <Maximize2 className="w-4 h-4 mr-2" />}
          {buttonText}
        </Button>
      </div>

      {/* Expanded Modal View */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className={`
              bg-gradient-to-br from-neutral-900 to-neutral-950 
              p-6 rounded-xl border border-neutral-700 shadow-2xl 
              ${expandedWidth} w-[95vw] max-h-[90vh] overflow-y-auto
              animate-in zoom-in-95 duration-200
              ${modalClassName}
            `}
          >
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-4">
              {title && (
                <h3 className="text-lg font-semibold text-white">{title}</h3>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClose}
                className="ml-auto hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="relative">
              {passPropsToExpanded 
                ? React.cloneElement(children, expandedProps)
                : children
              }
            </div>
          </div>
        </div>
      )}
    </>
  );
};

/**
 * ExpandableVisualInline - A variant that places the expand button inline (absolute positioned)
 * Useful for charts and visualizations where you want the button overlaid
 */
export const ExpandableVisualInline = ({
  children,
  buttonPosition = "top-right",
  ...props
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const positionClasses = {
    'top-right': 'top-2 right-2',
    'top-left': 'top-2 left-2',
    'bottom-right': 'bottom-2 right-2',
    'bottom-left': 'bottom-2 left-2',
  };

  return (
    <>
      {/* Normal View with Inline Expand Button */}
      <div className="relative group">
        {children}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(true)}
          className={`
            absolute ${positionClasses[buttonPosition]}
            opacity-0 group-hover:opacity-100 transition-opacity duration-200
            bg-neutral-900/80 hover:bg-neutral-800/90 backdrop-blur-sm
            border border-neutral-700
          `}
        >
          <Maximize2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Expanded Modal View */}
      {isExpanded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className={`
              bg-gradient-to-br from-neutral-900 to-neutral-950 
              p-6 rounded-xl border border-neutral-700 shadow-2xl 
              ${props.expandedWidth || 'max-w-6xl'} w-[95vw] max-h-[90vh] overflow-y-auto
              animate-in zoom-in-95 duration-200
            `}
          >
            <div className="flex justify-end mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
                className="hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            <div className="relative">
              {children}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

/**
 * ExpandButton - Standalone expand button that can trigger a modal with custom content
 * Useful when you want to show different content in expanded view
 */
export const ExpandButton = ({
  children,
  expandedContent,
  buttonText = "View Details",
  title,
  ...props
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      <Button
        variant={props.variant || "primary"}
        size={props.size || "sm"}
        onClick={() => setIsExpanded(true)}
        className={props.className}
      >
        {props.showIcon !== false && <Maximize2 className="w-4 h-4 mr-2" />}
        {buttonText}
      </Button>

      {isExpanded && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 p-6 rounded-xl border border-neutral-700 shadow-2xl max-w-6xl w-[95vw] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              {title && <h3 className="text-lg font-semibold text-white">{title}</h3>}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(false)}
                className="ml-auto hover:bg-neutral-800"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            {expandedContent || children}
          </div>
        </div>
      )}
    </>
  );
};