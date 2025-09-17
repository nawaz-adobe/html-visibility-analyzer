/**
 * Basic usage examples for HTML Visibility Analyzer
 */

import { 
  analyzeVisibility, 
  quickCompare, 
  getCitationReadiness 
} from '../src/index.js';

// Example HTML content
const initialHtml = `
<html>
  <head><title>Example Page</title></head>
  <body>
    <header>
      <nav>Navigation menu</nav>
    </header>
    <main>
      <h1>Welcome to Our Site</h1>
      <p>This content is visible to crawlers.</p>
    </main>
    <footer>Footer content</footer>
  </body>
</html>
`;

const renderedHtml = `
<html>
  <head><title>Example Page</title></head>
  <body>
    <header>
      <nav>Navigation menu</nav>
    </header>
    <main>
      <h1>Welcome to Our Site</h1>
      <p>This content is visible to crawlers.</p>
      <div class="dynamic-content">
        <h2>Dynamic Content</h2>
        <p>This content was loaded by JavaScript and is only visible to users, not AI crawlers.</p>
        <ul>
          <li>Feature 1: JavaScript-powered interactivity</li>
          <li>Feature 2: Dynamic data loading</li>
          <li>Feature 3: Real-time updates</li>
        </ul>
      </div>
      <section class="user-generated">
        <h3>User Comments</h3>
        <div class="comment">This is a user comment loaded via AJAX</div>
        <div class="comment">Another comment with valuable content</div>
      </section>
    </main>
    <footer>Footer content</footer>
  </body>
</html>
`;

console.log('=== HTML Visibility Analyzer Examples ===\n');

// Example 1: Full Analysis
console.log('1. Full Visibility Analysis:');
const analysis = analyzeVisibility(initialHtml, renderedHtml);
console.log('Visibility Score:', analysis.visibilityScore.score, analysis.visibilityScore.category);
console.log('Citation Readability:', analysis.metrics.citationReadability + '%');
console.log('Content Gain:', analysis.metrics.contentGainFormatted);
console.log('Missing Words:', analysis.metrics.missingWords);
console.log('Description:', analysis.visibilityScore.description);
console.log();

// Example 2: Quick Comparison
console.log('2. Quick Comparison:');
const quickResult = quickCompare(initialHtml, renderedHtml);
console.log('Word Count - Initial:', quickResult.wordCount.first);
console.log('Word Count - Final:', quickResult.wordCount.second);
console.log('Content Gain:', quickResult.contentGain + 'x');
console.log('Similarity:', quickResult.similarity + '%');
console.log();

// Example 3: Citation Readiness
console.log('3. Citation Readiness Analysis:');
const citationResult = getCitationReadiness(initialHtml, renderedHtml);
console.log('Readiness Score:', citationResult.score + '%');
console.log('Category:', citationResult.category);
console.log('Recommendations:');
citationResult.recommendations.forEach((rec, i) => {
  console.log(`  ${i + 1}. ${rec}`);
});
console.log();

// Example 4: Comparing with and without navigation filtering
console.log('4. Navigation Filtering Comparison:');
const withNav = analyzeVisibility(initialHtml, renderedHtml, { ignoreNavFooter: false });
const withoutNav = analyzeVisibility(initialHtml, renderedHtml, { ignoreNavFooter: true });

console.log('Including Navigation/Footer:');
console.log('  Citation Readability:', withNav.metrics.citationReadability + '%');
console.log('  Word Count (initial):', withNav.metrics.wordCount.initial);

console.log('Excluding Navigation/Footer:');
console.log('  Citation Readability:', withoutNav.metrics.citationReadability + '%');
console.log('  Word Count (initial):', withoutNav.metrics.wordCount.initial);
console.log();

// Example 5: Real-world scenario - SPA vs SSR
console.log('5. SPA vs SSR Comparison:');

const spaHtml = `
<html>
  <head><title>SPA App</title></head>
  <body>
    <div id="root">Loading...</div>
    <script src="app.js"></script>
  </body>
</html>
`;

const ssrHtml = `
<html>
  <head><title>SSR App</title></head>
  <body>
    <div id="root">
      <header>
        <h1>My Application</h1>
        <nav>
          <a href="/about">About</a>
          <a href="/products">Products</a>
          <a href="/contact">Contact</a>
        </nav>
      </header>
      <main>
        <h2>Welcome to Our Store</h2>
        <p>Discover our amazing products and services.</p>
        <div class="product-grid">
          <div class="product">
            <h3>Product 1</h3>
            <p>High-quality product description here.</p>
          </div>
          <div class="product">
            <h3>Product 2</h3>
            <p>Another excellent product with features.</p>
          </div>
        </div>
      </main>
    </div>
    <script src="app.js"></script>
  </body>
</html>
`;

const spaAnalysis = analyzeVisibility(spaHtml, ssrHtml);
console.log('SPA to SSR Content Analysis:');
console.log('Visibility Score:', spaAnalysis.visibilityScore.score + '%', '(' + spaAnalysis.visibilityScore.category + ')');
console.log('Content Gain:', spaAnalysis.metrics.contentGainFormatted);
console.log('Words missing from SPA:', spaAnalysis.metrics.missingWords);

console.log('\n=== Analysis Complete ===');

