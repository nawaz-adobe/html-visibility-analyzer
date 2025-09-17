/**
 * Browser-specific entry point for HTML Visibility Analyzer
 * Optimized for browser environments (no Node.js dependencies)
 */

// Re-export everything except Node.js specific functions
export { 
  tokenize, 
  normalizeText, 
  countWords, 
  countLines 
} from './tokenizer.js';

export { 
  diffTokens, 
  generateDiffReport, 
  calculateSimilarity, 
  generateHtmlDiff 
} from './diff-engine.js';

export { 
  hashDJB2, 
  pct, 
  formatNumberToK, 
  isBrowser, 
  isNode, 
  safeJsonParse, 
  debounce, 
  throttle 
} from './utils.js';

/**
 * Browser-specific HTML filtering (uses DOMParser)
 * @param {string} htmlContent - HTML content to filter
 * @param {boolean} [ignoreNavFooter=true] - Remove navigation/footer elements
 * @param {boolean} [returnText=true] - Return text only or filtered HTML
 * @returns {string} Filtered content
 */
export function filterHtmlContent(htmlContent, ignoreNavFooter = true, returnText = true) {
  if (!htmlContent) return "";
  
  if (typeof document === 'undefined' || typeof DOMParser === 'undefined') {
    throw new Error('Browser environment required - use main package for Node.js');
  }
  
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlContent, "text/html");
  
  // Get the body element, if it doesn't exist, use the entire document
  const bodyElement = doc.body || doc.documentElement;
  
  // Always remove script, style, noscript, template elements
  bodyElement.querySelectorAll("script,style,noscript,template").forEach(n => n.remove());
  
  // Remove all media elements (images, videos, audio, etc.) to keep only text
  bodyElement.querySelectorAll("img,video,audio,picture,svg,canvas,embed,object,iframe").forEach(n => n.remove());
  
  // Conditionally remove navigation and footer elements
  if (ignoreNavFooter) {
    filterNavigationAndFooter(bodyElement);
  }
  
  if (returnText) {
    return (bodyElement && bodyElement.textContent) ? bodyElement.textContent : "";
  } else {
    return bodyElement.outerHTML;
  }
}

/**
 * Extract plain text from HTML content (browser-only)
 * @param {string} htmlContent - HTML content
 * @param {boolean} [ignoreNavFooter=true] - Remove navigation/footer elements
 * @returns {string} Plain text content
 */
export function stripTagsToText(htmlContent, ignoreNavFooter = true) {
  return filterHtmlContent(htmlContent, ignoreNavFooter, true);
}

/**
 * Remove navigation and footer elements from DOM element
 * @param {Element} element - DOM element to filter
 */
function filterNavigationAndFooter(element) {
  const navigationSelectors = [
    'nav', 'header', 'footer', 
    '.nav', '.navigation', '.navbar', '.nav-bar', '.menu', '.main-menu',
    '.header', '.site-header', '.page-header', '.top-header',
    '.footer', '.site-footer', '.page-footer', '.bottom-footer',
    '.breadcrumb', '.breadcrumbs',
    '[role="navigation"]', '[role="banner"]', '[role="contentinfo"]',
    '.navigation-wrapper', '.nav-wrapper', '.header-wrapper', '.footer-wrapper',
    '.site-navigation', '.primary-navigation', '.secondary-navigation',
    '.top-nav', '.bottom-nav', '.sidebar-nav',
    '#nav', '#navigation', '#navbar', '#header', '#footer', '#menu', '#main-menu',
    '#site-header', '#site-footer', '#page-header', '#page-footer'
  ];
  
  const allSelectors = navigationSelectors.join(',');
  const elements = element.querySelectorAll(allSelectors);
  elements.forEach(el => el.remove());
}

// Browser-specific analyzer functions
import { calculateSimilarity } from './diff-engine.js';
import { countWords } from './tokenizer.js';

/**
 * Analyze content difference (browser version)
 * @param {string} initHtml - Initial HTML content
 * @param {string} finHtml - Final HTML content
 * @param {Object} [options={}] - Analysis options
 * @returns {Object} Analysis results
 */
export function analyzeContentDifference(initHtml, finHtml, options = {}) {
  const { ignoreNavFooter = true } = options;
  
  const initText = stripTagsToText(initHtml, ignoreNavFooter);
  const finText = stripTagsToText(finHtml, ignoreNavFooter);
  
  const initWords = countWords(initText);
  const finWords = countWords(finText);
  
  const contentGain = initWords > 0 ? finWords / initWords : 1;
  const missingWords = Math.abs(finWords - initWords);
  const citationReadability = finWords > 0 ? Math.min(100, (initWords / finWords) * 100) : 100;
  const similarity = calculateSimilarity(initText, finText);
  
  return {
    initialText: initText,
    finalText: finText,
    metrics: {
      contentGain: Math.round(contentGain * 10) / 10,
      missingWords,
      citationReadability: Math.round(citationReadability),
      similarity: Math.round(similarity * 10) / 10,
      wordCount: {
        initial: initWords,
        final: finWords,
        difference: finWords - initWords
      }
    }
  };
}

/**
 * Quick browser analysis
 * @param {string} initialHtml - Initial HTML
 * @param {string} renderedHtml - Rendered HTML
 * @param {Object} [options={}] - Options
 * @returns {Object} Quick analysis results
 */
export function analyzeVisibility(initialHtml, renderedHtml, options = {}) {
  return analyzeContentDifference(initialHtml, renderedHtml, options);
}

