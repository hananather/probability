"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { formatErrorForUser, shouldDisplayError } from '@/utils/errorReporting';

/**
 * Notification Context for user-facing messages
 * 
 * Provides a centralized way to show error messages, warnings, and info to users
 * without cluttering the console in production
 */

const NotificationContext = createContext();

/**
 * Notification types for styling
 */
export const NOTIFICATION_TYPES = {
  ERROR: 'error',
  WARNING: 'warning', 
  INFO: 'info',
  SUCCESS: 'success'
};

/**
 * Notification Provider Component
 */
export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([]);

  /**
   * Add a notification
   * @param {Object} notification - Notification object
   */
  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      type: NOTIFICATION_TYPES.INFO,
      autoClose: true,
      duration: 5000,
      ...notification,
      timestamp: new Date().toISOString()
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove if specified
    if (newNotification.autoClose) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  }, []);

  /**
   * Remove a notification
   * @param {string|number} id - Notification ID
   */
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  /**
   * Clear all notifications
   */
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  /**
   * Show an error notification from an Error object
   * @param {Error} error - Error object
   * @param {Object} options - Additional options
   */
  const showError = useCallback((error, options = {}) => {
    if (!shouldDisplayError(error)) {
      return null;
    }

    const formattedError = formatErrorForUser(error);
    
    return addNotification({
      type: NOTIFICATION_TYPES.ERROR,
      title: 'Error',
      message: formattedError.message,
      canRetry: formattedError.canRetry,
      technicalDetails: formattedError.technicalDetails,
      autoClose: false, // Errors should be manually dismissed
      severity: formattedError.severity,
      color: formattedError.color,
      ...options
    });
  }, [addNotification]);

  /**
   * Show a warning notification
   * @param {string} message - Warning message
   * @param {Object} options - Additional options
   */
  const showWarning = useCallback((message, options = {}) => {
    return addNotification({
      type: NOTIFICATION_TYPES.WARNING,
      title: 'Warning',
      message,
      duration: 7000,
      ...options
    });
  }, [addNotification]);

  /**
   * Show an info notification
   * @param {string} message - Info message
   * @param {Object} options - Additional options
   */
  const showInfo = useCallback((message, options = {}) => {
    return addNotification({
      type: NOTIFICATION_TYPES.INFO,
      title: 'Information',
      message,
      duration: 4000,
      ...options
    });
  }, [addNotification]);

  /**
   * Show a success notification
   * @param {string} message - Success message
   * @param {Object} options - Additional options
   */
  const showSuccess = useCallback((message, options = {}) => {
    return addNotification({
      type: NOTIFICATION_TYPES.SUCCESS,
      title: 'Success',
      message,
      duration: 3000,
      ...options
    });
  }, [addNotification]);

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    showError,
    showWarning,
    showInfo,
    showSuccess
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      <NotificationContainer />
    </NotificationContext.Provider>
  );
}

/**
 * Hook to use notifications
 */
export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

/**
 * Notification Container Component
 * Renders notifications in a fixed position
 */
function NotificationContainer() {
  const { notifications, removeNotification } = useNotifications();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-md">
      {notifications.map(notification => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          onClose={() => removeNotification(notification.id)}
        />
      ))}
    </div>
  );
}

/**
 * Individual Notification Item Component
 */
function NotificationItem({ notification, onClose }) {
  const { type, title, message, canRetry, technicalDetails } = notification;
  
  const typeStyles = {
    [NOTIFICATION_TYPES.ERROR]: 'bg-red-900/90 border-red-600/50 text-red-100',
    [NOTIFICATION_TYPES.WARNING]: 'bg-yellow-900/90 border-yellow-600/50 text-yellow-100',
    [NOTIFICATION_TYPES.INFO]: 'bg-blue-900/90 border-blue-600/50 text-blue-100',
    [NOTIFICATION_TYPES.SUCCESS]: 'bg-green-900/90 border-green-600/50 text-green-100'
  };

  const iconMap = {
    [NOTIFICATION_TYPES.ERROR]: '⚠️',
    [NOTIFICATION_TYPES.WARNING]: '⚡',
    [NOTIFICATION_TYPES.INFO]: 'ℹ️',
    [NOTIFICATION_TYPES.SUCCESS]: '✅'
  };

  return (
    <div className={`
      ${typeStyles[type]}
      p-4 rounded-lg border backdrop-blur-sm shadow-lg
      transform transition-all duration-300 ease-in-out
      animate-in slide-in-from-right-full
    `}>
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <span className="text-lg">{iconMap[type]}</span>
          <div className="flex-1">
            <h4 className="font-semibold text-sm">{title}</h4>
            <p className="text-sm mt-1 opacity-90">{message}</p>
            
            {technicalDetails && (
              <details className="mt-2">
                <summary className="text-xs opacity-70 cursor-pointer hover:opacity-100">
                  Technical Details
                </summary>
                <pre className="text-xs mt-1 p-2 bg-black/20 rounded overflow-auto max-h-32">
                  {JSON.stringify(technicalDetails, null, 2)}
                </pre>
              </details>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          {canRetry && (
            <button
              onClick={() => window.location.reload()}
              className="text-xs px-2 py-1 bg-white/20 hover:bg-white/30 rounded transition-colors"
            >
              Retry
            </button>
          )}
          <button
            onClick={onClose}
            className="text-lg opacity-70 hover:opacity-100 transition-opacity"
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  );
}

/**
 * Utility function to show error notifications from anywhere in the app
 * @param {Error} error - Error object
 * @param {Object} options - Additional options
 */
export function showErrorNotification(error, options = {}) {
  // This is a fallback for when the hook can't be used
  if (window.__notificationContext) {
    return window.__notificationContext.showError(error, options);
  }
  
  // Fallback to console in development if context not available
  if (process.env.NODE_ENV === 'development') {
  }
  
  return null;
}

// Make context available globally for error boundaries
if (typeof window !== 'undefined') {
  window.__setNotificationContext = (context) => {
    window.__notificationContext = context;
  };
}