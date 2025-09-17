# HTML Visibility Analyzer

A powerful ESM package that analyzes HTML content visibility for AI crawlers and citations. Compare what humans see on websites versus what AI models (ChatGPT, Perplexity, etc.) can read when crawling pages for citations.

[![npm version](https://badge.fury.io/js/html-visibility-analyzer.svg)](https://badge.fury.io/js/html-visibility-analyzer)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

## 🚀 Quick Start

### Installation

```bash
npm install html-visibility-analyzer
```

### Basic Usage

```javascript
import { analyzeVisibility } from 'html-visibility-analyzer';

// Compare initial HTML (what crawlers see) vs rendered HTML (what users see)
const initialHtml = '<html><body><h1>Title</h1></body></html>';
const renderedHtml = '<html><body><h1>Title</h1><p>Dynamic content loaded by JS</p></body></html>';

const analysis = analyzeVisibility(initialHtml, renderedHtml);
console.log(analysis.visibilityScore); // { score: 75, category: "good", description: "..." }
console.log(analysis.metrics.citationReadability); // 50 (50% of content visible to AI)
```

## 🎯 Core Features

### 🔍 **Content Visibility Analysis**
- Compare static HTML vs fully rendered content
- Calculate citation readiness scores (0-100%)
- Identify content gaps that AI crawlers miss

### ⚡ **Advanced Diff Engine**
- LCS-based algorithms for precise text comparison
- Multiple granularity levels: word, line, block
- Intelligent tokenization with URL preservation

### 🌐 **Cross-Platform Support**
- **Node.js**: Full-featured with Cheerio for HTML parsing
- **Browser**: Lightweight version using native DOMParser
- **ESM/CommonJS**: Dual package support

### 📊 **Smart Content Filtering**
- Remove navigation, footer, and media elements
- Focus on core content for accurate analysis
- Configurable filtering options

## 📖 API Reference

### Main Functions

#### `analyzeVisibility(initialHtml, renderedHtml, options)`

Comprehensive analysis of content visibility between two HTML versions.

```javascript
import { analyzeVisibility } from 'html-visibility-analyzer';

const result = analyzeVisibility(initialHtml, renderedHtml, {
  ignoreNavFooter: true,  // Remove nav/footer elements (default: true)
  includeScore: true      // Include visibility score (default: true)
});

// Returns:
{
  metrics: {
    contentGain: 2.3,              // How much content was added (2.3x more)
    missingWords: 150,             // Number of words missing from initial
    citationReadability: 65,       // Percentage visible to AI (0-100)
    similarity: 78.5,              // Content similarity percentage
    wordCount: { initial: 100, final: 230, difference: 130 }
  },
  visibilityScore: {
    score: 75,                     // Overall visibility score (0-100)
    category: "good",              // excellent | good | fair | poor
    description: "Most content is visible to AI models",
    breakdown: { /* detailed metrics */ }
  },
  // ... additional analysis data
}
```

#### `quickCompare(html1, html2, options)`

Fast comparison for basic metrics.

```javascript
import { quickCompare } from 'html-visibility-analyzer';

const result = quickCompare(html1, html2);
// Returns: { wordCount, contentGain, missingWords, similarity }
```

#### `getCitationReadiness(initialHtml, renderedHtml, options)`

Get citation-focused analysis with recommendations.

```javascript
import { getCitationReadiness } from 'html-visibility-analyzer';

const result = getCitationReadiness(initialHtml, renderedHtml);
// Returns: { score, category, description, metrics, recommendations }
```

### Utility Functions

#### Content Processing
```javascript
import { 
  stripTagsToText,     // Extract plain text from HTML
  filterHtmlContent,   // Advanced HTML filtering
  tokenize,           // Smart text tokenization
  extractWordCount    // Get word counts
} from 'html-visibility-analyzer';
```

#### Diff Analysis
```javascript
import { 
  diffTokens,         // Generate LCS-based diff
  generateDiffReport, // Comprehensive diff statistics
  calculateSimilarity // Calculate similarity percentage
} from 'html-visibility-analyzer';
```

## 🌐 Environment-Specific Usage

### Node.js (Full Features)
```javascript
import { analyzeVisibility } from 'html-visibility-analyzer';
// Uses Cheerio for robust HTML parsing
```

### Browser (Lightweight)
```javascript
import { analyzeVisibility } from 'html-visibility-analyzer/browser';
// Uses native DOMParser, no external dependencies
```

### HTML Script Tag
```html
<script type="module">
  import { analyzeVisibility } from './node_modules/html-visibility-analyzer/dist/browser.min.js';
  // Minified browser version
</script>
```

## 🔧 Advanced Usage

### Custom Filtering Options

```javascript
const analysis = analyzeVisibility(initialHtml, renderedHtml, {
  ignoreNavFooter: false,  // Keep navigation/footer in analysis
  includeScore: true
});
```

### Detailed Diff Analysis

```javascript
import { generateDiffReport, diffTokens } from 'html-visibility-analyzer';

// Word-level diff
const wordDiff = generateDiffReport(text1, text2, "word");
console.log(wordDiff.summary); // "Added: 45 • Removed: 12 • Same: 203"

// Line-level diff
const lineDiff = generateDiffReport(text1, text2, "line");

// Raw diff operations
const operations = diffTokens(text1, text2, "word");
// Returns: [{ type: "same"|"add"|"del", text: "..." }, ...]
```

### Content Tokenization

```javascript
import { tokenize } from 'html-visibility-analyzer';

// Smart word tokenization (preserves URLs, handles punctuation)
const words = tokenize("Visit https://example.com for more info!", "word");
// → ["Visit", "https://example.com", "for", "more", "info!"]

// Line tokenization
const lines = tokenize(multilineText, "line");
```

## 📊 Use Cases

### 🤖 **AI Content Optimization**
```javascript
// Check if your content is properly crawlable by AI models
const readiness = getCitationReadiness(staticHtml, dynamicHtml);
if (readiness.score < 70) {
  console.log("Consider implementing SSR for better AI visibility");
  console.log(readiness.recommendations);
}
```

### 🔍 **SEO Analysis**
```javascript
// Analyze content differences for SEO optimization
const analysis = analyzeVisibility(initialHtml, renderedHtml);
console.log(`Content gain: ${analysis.metrics.contentGain}x`);
console.log(`Missing from crawlers: ${analysis.metrics.missingWords} words`);
```

### 📈 **Performance Monitoring**
```javascript
// Monitor how much content loads after initial page render
const metrics = quickCompare(serverHtml, clientHtml);
if (metrics.contentGain > 3) {
  console.log("High content gain - consider server-side rendering");
}
```

## 🏗️ Technical Implementation

### LCS Algorithm
Uses optimized Longest Common Subsequence with integer mapping for 3-5x faster comparisons:

```javascript
// Token-to-integer mapping for performance
const sym = new Map();
const mapTok = t => {
  if (!sym.has(t)) sym.set(t, sym.size + 1);
  return sym.get(t);
};
```

### Smart Tokenization
- **URL Preservation**: Protects URLs during normalization
- **Punctuation Handling**: Normalizes spacing while preserving meaning
- **Unicode Placeholders**: Uses private Unicode characters for safe replacements

### Performance Characteristics
- **Time Complexity**: O(mn) - optimal for LCS
- **Memory Usage**: ~40MB for 100K tokens
- **Content Limit**: Handles up to 500KB smoothly

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test -- --coverage
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## 🌟 Related Projects

- [Chrome Extension](https://github.com/adobe/tokowaka-utilities/tree/main/chrome_extension) - Browser extension using this package
- [Citation Checker](https://example.com) - Web tool for citation analysis

---

**Built with ❤️ by Adobe Research** - Helping make web content more accessible to AI models and citations.

