/**
 * HTML content filtering and text extraction utilities
 * Supports both browser (DOMParser) and Node.js (cheerio) environments
 */

import * as cheerio from 'cheerio';

// Navigation and footer selectors for content filtering
const navigationSelectors = [
  'nav', 'header', 'footer', 
  '.nav', '.navigation', '.navbar', '.nav-bar', '.menu', '.main-menu',
  '.header', '.site-header', '.page-header', '.top-header',
  '.footer', '.site-footer', '.page-footer', '.bottom-footer',
  '.breadcrumb', '.breadcrumbs',
  '[role="navigation"]', '[role="banner"]', '[role="contentinfo"]',
  // Common class patterns
  '.navigation-wrapper', '.nav-wrapper', '.header-wrapper', '.footer-wrapper',
  '.site-navigation', '.primary-navigation', '.secondary-navigation',
  '.top-nav', '.bottom-nav', '.sidebar-nav',
  // ID selectors for common navigation/footer elements
  '#nav', '#navigation', '#navbar', '#header', '#footer', '#menu', '#main-menu',
  '#site-header', '#site-footer', '#page-header', '#page-footer'
];

/**
 * Filter HTML content by removing unwanted elements
 * @param {string} htmlContent - Raw HTML content
 * @param {boolean} ignoreNavFooter - Whether to remove navigation/footer elements
 * @param {boolean} returnText - Whether to return text only (true) or filtered HTML (false)
 * @returns {string} Filtered content
 */
export function filterHtmlContent(htmlContent, ignoreNavFooter = true, returnText = true) {
  if (!htmlContent) return "";
  
  // Browser environment (DOMParser)
  if (typeof document !== 'undefined' && typeof DOMParser !== 'undefined') {
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
  
  // Node.js environment (cheerio)
  const $ = cheerio.load(htmlContent);
  
  // Always remove script, style, noscript, template tags
  $('script, style, noscript, template').remove();
  
  // Remove all media elements (images, videos, audio, etc.) to keep only text
  $('img, video, audio, picture, svg, canvas, embed, object, iframe').remove();
  
  // Conditionally remove navigation and footer elements
  if (ignoreNavFooter) {
    filterNavigationAndFooterCheerio($);
  }
  
  if (returnText) {
    // Get text content from document element
    const textContent = $('html').text() || $('body').text() || "";
    // Clean up whitespace
    return textContent.replace(/\s+/g, ' ').trim();
  } else {
    return $.html();
  }
}

/**
 * Extract plain text from HTML content (backward compatibility wrapper)
 * @param {string} htmlContent - Raw HTML content
 * @param {boolean} ignoreNavFooter - Whether to remove navigation/footer elements
 * @returns {string} Plain text content
 */
export function stripTagsToText(htmlContent, ignoreNavFooter = true) {
  return filterHtmlContent(htmlContent, ignoreNavFooter, true);
}

/**
 * Remove navigation and footer elements (browser environment)
 * @param {Element} element - DOM element to filter
 */
function filterNavigationAndFooter(element) {
  const allSelectors = navigationSelectors.join(',');
  const elements = element.querySelectorAll(allSelectors);
  elements.forEach(el => el.remove());
}

/**
 * Remove navigation and footer elements (Node.js environment)
 * @param {CheerioAPI} $ - Cheerio instance
 */
function filterNavigationAndFooterCheerio($) {
  const allSelectors = navigationSelectors.join(',');
  $(allSelectors).remove();
}

/**
 * Extract word count from HTML content
 * @param {string} htmlContent - Raw HTML content
 * @param {boolean} ignoreNavFooter - Whether to ignore navigation/footer
 * @returns {Object} Object with word_count property
 */
export function extractWordCount(htmlContent, ignoreNavFooter = true) {
  if (!htmlContent) {
    return { word_count: 0 };
  }
  
  const textContent = stripTagsToText(htmlContent, ignoreNavFooter);
  
  // Simple word counting - split by whitespace and filter empty strings
  const words = textContent.trim().split(/\s+/).filter(word => word.length > 0);
  return { word_count: words.length };
}
