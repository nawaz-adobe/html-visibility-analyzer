/**
 * Content analysis and metrics calculation
 * Provides comprehensive analysis of HTML content differences
 */

import { stripTagsToText } from './html-filter.js';
import { tokenize, countWords } from './tokenizer.js';
import { generateDiffReport, calculateSimilarity } from './diff-engine.js';
import { hashDJB2, formatNumberToK, pct } from './utils.js';

/**
 * Comprehensive analysis between initial and final HTML content
 * @param {string} initHtml - Initial HTML content (what crawlers see)
 * @param {string} finHtml - Final HTML content (what users see)
 * @param {Object} [options={}] - Analysis options
 * @param {boolean} [options.ignoreNavFooter=true] - Whether to ignore navigation/footer elements
 * @returns {Object} Comprehensive analysis results
 */
export function analyzeContentDifference(initHtml, finHtml, options = {}) {
  const { ignoreNavFooter = true } = options;
  
  const initText = stripTagsToText(initHtml, ignoreNavFooter);
  const finText = stripTagsToText(finHtml, ignoreNavFooter);
  
  const initTextLength = initText.length;
  const finTextLength = finText.length;
  const textRetention = finTextLength > 0 ? initTextLength / finTextLength : 0;
  
  const wordDiff = generateDiffReport(initText, finText, "word");
  const lineDiff = generateDiffReport(initText, finText, "line");
  
  // Calculate additional metrics
  const initTokens = tokenize(initText, "word");
  const finTokens = tokenize(finText, "word");
  
  const contentGain = initTokens.length > 0 ? finTokens.length / initTokens.length : 1;
  const missingWords = Math.abs(finTokens.length - initTokens.length);
  const citationReadability = calculateCitationReadability(initTokens.length, finTokens.length);
  const similarity = calculateSimilarity(initText, finText, "word");
  
  return {
    initialText: initText,
    finalText: finText,
    initialTextLength: initTextLength,
    finalTextLength: finTextLength,
    textRetention,
    textRetentionPercent: pct(textRetention),
    wordDiff,
    lineDiff,
    initialTextHash: hashDJB2(initText),
    finalTextHash: hashDJB2(finText),
    metrics: {
      contentGain: Math.round(contentGain * 10) / 10,
      contentGainFormatted: `${Math.round(contentGain * 10) / 10}x`,
      missingWords,
      missingWordsFormatted: formatNumberToK(missingWords),
      citationReadability: Math.round(citationReadability),
      similarity: Math.round(similarity * 10) / 10,
      wordCount: {
        initial: initTokens.length,
        final: finTokens.length,
        difference: finTokens.length - initTokens.length
      }
    }
  };
}

/**
 * Calculate citation readability score (how well AI can cite the content)
 * @param {number} initialWordCount - Word count in initial HTML
 * @param {number} finalWordCount - Word count in final HTML
 * @returns {number} Citation readability score (0-100)
 */
export function calculateCitationReadability(initialWordCount, finalWordCount) {
  if (finalWordCount === 0) return 100; // If there's no final content, initial is fully visible
  return Math.min(100, (initialWordCount / finalWordCount) * 100);
}

/**
 * Analyze both scenarios: with and without navigation/footer filtering
 * @param {string} initHtml - Initial HTML content
 * @param {string} finHtml - Final HTML content
 * @returns {Object} Analysis results for both scenarios
 */
export function analyzeBothScenarios(initHtml, finHtml) {
  const withNavFooterIgnored = analyzeContentDifference(initHtml, finHtml, { ignoreNavFooter: true });
  const withoutNavFooterIgnored = analyzeContentDifference(initHtml, finHtml, { ignoreNavFooter: false });
  
  return {
    withNavFooterIgnored: {
      ...withNavFooterIgnored.metrics,
      fullAnalysis: withNavFooterIgnored
    },
    withoutNavFooterIgnored: {
      ...withoutNavFooterIgnored.metrics,
      fullAnalysis: withoutNavFooterIgnored
    }
  };
}

/**
 * Generate a summary score for content visibility
 * @param {Object} analysis - Analysis results from analyzeContentDifference
 * @returns {Object} Summary with score and description
 */
export function generateVisibilityScore(analysis) {
  const { citationReadability, similarity, contentGain } = analysis.metrics;
  
  // Weight the different factors
  const readabilityWeight = 0.5;
  const similarityWeight = 0.3;
  const contentGainWeight = 0.2;
  
  // Normalize content gain (higher gain = lower score for visibility)
  const normalizedContentGain = Math.min(100, Math.max(0, 100 - ((contentGain - 1) * 50)));
  
  const weightedScore = (
    citationReadability * readabilityWeight +
    similarity * similarityWeight +
    normalizedContentGain * contentGainWeight
  );
  
  const score = Math.round(weightedScore);
  
  let description;
  let category;
  
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
  
  return {
    score,
    category,
    description,
    breakdown: {
      citationReadability,
      similarity,
      contentGain: normalizedContentGain
    }
  };
}

