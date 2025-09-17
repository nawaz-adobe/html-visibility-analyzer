/**
 * HTML Visibility Analyzer - Main Entry Point
 * Analyze HTML content visibility for AI crawlers and citations
 */

// Re-export all functions
export { 
  filterHtmlContent, 
  stripTagsToText, 
  extractWordCount 
} from './html-filter.js';

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
  analyzeContentDifference, 
  calculateCitationReadability, 
  analyzeBothScenarios, 
  generateVisibilityScore 
} from './analyzer.js';

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

// Import functions for internal use
import { stripTagsToText } from './html-filter.js';
import { countWords } from './tokenizer.js';
import { calculateSimilarity } from './diff-engine.js';
import { formatNumberToK } from './utils.js';

/**
 * Quick analysis function for common use cases
 * @param {string} initialHtml - HTML as seen by crawlers/AI
 * @param {string} renderedHtml - HTML as seen by users (fully loaded)
 * @param {Object} [options={}] - Analysis options
 * @param {boolean} [options.ignoreNavFooter=true] - Ignore navigation/footer elements
 * @param {boolean} [options.includeScore=true] - Include visibility score
 * @returns {Object} Analysis results
 */
export function analyzeVisibility(initialHtml, renderedHtml, options = {}) {
  const { ignoreNavFooter = true, includeScore = true } = options;
  
  // Import the functions from analyzer module to avoid circular imports
  import('./analyzer.js').then(({ analyzeContentDifference, generateVisibilityScore }) => {
    const analysis = analyzeContentDifference(initialHtml, renderedHtml, { ignoreNavFooter });
    
    if (includeScore) {
      const score = generateVisibilityScore(analysis);
      return {
        ...analysis,
        visibilityScore: score
      };
    }
    
    return analysis;
  });
  
  // For synchronous usage, provide a simpler analysis
  const text1 = stripTagsToText(initialHtml, ignoreNavFooter);
  const text2 = stripTagsToText(renderedHtml, ignoreNavFooter);
  
  const words1 = countWords(text1);
  const words2 = countWords(text2);
  
  const similarity = calculateSimilarity(text1, text2);
  const contentGain = words1 > 0 ? words2 / words1 : (words2 > 0 ? words2 : 1);
  const missingWords = Math.abs(words2 - words1);
  const citationReadability = words1 === 0 ? 100 : (words2 > 0 ? Math.min(100, (words1 / words2) * 100) : 0);
  
  const metrics = {
    contentGain: Math.round(contentGain * 10) / 10,
    contentGainFormatted: `${Math.round(contentGain * 10) / 10}x`,
    missingWords,
    missingWordsFormatted: formatNumberToK(missingWords),
    citationReadability: Math.round(citationReadability),
    similarity: Math.round(similarity * 10) / 10,
    wordCount: {
      initial: words1,
      final: words2,
      difference: words2 - words1
    }
  };
  
  let visibilityScore = null;
  if (includeScore) {
    const score = Math.round(
      citationReadability * 0.5 + 
      similarity * 0.3 + 
      Math.min(100, Math.max(0, 100 - ((contentGain - 1) * 50))) * 0.2
    );
    
    let category, description;
    if (score >= 90) {
      category = "excellent";
      description = "Excellent - AI models can easily read and cite your content";
    } else if (score >= 70) {
      category = "good";
      description = "Good - Most of your content is visible to AI models";
    } else if (score >= 50) {
      category = "fair";
      description = "Fair - Some content may be missed by AI crawlers";
    } else {
      category = "poor";
      description = "Poor - Significant content is hidden from AI models";
    }
    
    visibilityScore = { score, category, description };
  }
  
  return {
    initialText: text1,
    finalText: text2,
    metrics,
    ...(visibilityScore && { visibilityScore })
  };
}

/**
 * Compare two HTML contents and get quick metrics
 * @param {string} html1 - First HTML content
 * @param {string} html2 - Second HTML content
 * @param {Object} [options={}] - Comparison options
 * @returns {Object} Quick comparison metrics
 */
export function quickCompare(html1, html2, options = {}) {
  const { ignoreNavFooter = true } = options;
  
  const text1 = stripTagsToText(html1, ignoreNavFooter);
  const text2 = stripTagsToText(html2, ignoreNavFooter);
  
  const words1 = countWords(text1);
  const words2 = countWords(text2);
  
  const similarity = calculateSimilarity(text1, text2);
  const contentGain = words1 > 0 ? words2 / words1 : 1;
  const missingWords = Math.abs(words2 - words1);
  
  return {
    wordCount: {
      first: words1,
      second: words2,
      difference: words2 - words1
    },
    contentGain: Math.round(contentGain * 10) / 10,
    missingWords,
    similarity: Math.round(similarity * 10) / 10
  };
}

/**
 * Get citation readiness score for a webpage
 * @param {string} initialHtml - HTML as crawlers see it
 * @param {string} renderedHtml - HTML as users see it
 * @param {Object} [options={}] - Options
 * @returns {Object} Citation readiness results
 */
export function getCitationReadiness(initialHtml, renderedHtml, options = {}) {
  const analysis = analyzeVisibility(initialHtml, renderedHtml, options);
  
  return {
    score: analysis.visibilityScore?.score || 0,
    category: analysis.visibilityScore?.category || 'unknown',
    description: analysis.visibilityScore?.description || 'Analysis completed',
    metrics: {
      citationReadability: analysis.metrics.citationReadability,
      contentGain: analysis.metrics.contentGain,
      missingWords: analysis.metrics.missingWords,
      similarity: analysis.metrics.similarity
    },
    recommendations: generateRecommendations(analysis.metrics)
  };
}

/**
 * Generate recommendations based on analysis results
 * @param {Object} metrics - Analysis metrics
 * @returns {Array} Array of recommendation strings
 */
function generateRecommendations(metrics) {
  const recommendations = [];
  const { citationReadability, contentGain, missingWords } = metrics;
  
  if (citationReadability < 50) {
    recommendations.push("Consider implementing server-side rendering (SSR) to improve content visibility for AI crawlers");
  }
  
  if (contentGain > 3) {
    recommendations.push("Significant content is loaded via JavaScript - ensure critical content is present in initial HTML");
  }
  
  if (missingWords > 1000) {
    recommendations.push("Large amount of content is missing from initial HTML - review your content loading strategy");
  }
  
  if (citationReadability >= 80 && contentGain < 1.5) {
    recommendations.push("Great job! Your content is well-optimized for AI visibility and citations");
  }
  
  return recommendations;
}
