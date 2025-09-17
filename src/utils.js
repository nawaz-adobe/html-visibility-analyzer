/**
 * Utility functions for the HTML visibility analyzer
 */

/**
 * Generate DJB2 hash for content comparison
 * @param {string} str - String to hash
 * @returns {string} Hex hash string
 */
export function hashDJB2(str) {
  if (!str) return "";
  let h = 5381;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) + h) + str.charCodeAt(i);
  }
  return (h >>> 0).toString(16);
}

/**
 * Format percentage with 1 decimal place
 * @param {number} n - Number to format as percentage
 * @returns {string} Formatted percentage string
 */
export function pct(n) {
  return (Number.isFinite(n) ? (n * 100).toFixed(1) + "%" : "–");
}

/**
 * Format number to K/M format for readability
 * @param {number} num - Number to format
 * @returns {string} Formatted number string
 */
export function formatNumberToK(num) {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  } else if (num >= 10000) {
    return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  }
  return num.toString();
}

/**
 * Check if code is running in browser environment
 * @returns {boolean} True if in browser
 */
export function isBrowser() {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/**
 * Check if code is running in Node.js environment
 * @returns {boolean} True if in Node.js
 */
export function isNode() {
  return typeof process !== 'undefined' && process.versions && process.versions.node;
}

/**
 * Safe JSON parse with fallback
 * @param {string} str - JSON string to parse
 * @param {*} fallback - Fallback value if parsing fails
 * @returns {*} Parsed object or fallback
 */
export function safeJsonParse(str, fallback = null) {
  try {
    return JSON.parse(str);
  } catch (e) {
    return fallback;
  }
}

/**
 * Debounce function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function calls
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
export function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

