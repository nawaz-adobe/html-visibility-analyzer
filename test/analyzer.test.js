import { describe, it, expect } from 'vitest';
import { 
  analyzeVisibility, 
  quickCompare, 
  getCitationReadiness,
  stripTagsToText,
  calculateSimilarity
} from '../src/index.js';

describe('HTML Visibility Analyzer', () => {
  const simpleHtml = '<html><body><h1>Title</h1><p>Content here</p></body></html>';
  const richHtml = '<html><body><h1>Title</h1><p>Content here</p><script>console.log("loaded")</script><div class="dynamic">Dynamic content</div></body></html>';
  
  describe('analyzeVisibility', () => {
    it('should analyze content differences', () => {
      const result = analyzeVisibility(simpleHtml, richHtml);
      
      expect(result).toHaveProperty('metrics');
      expect(result.metrics).toHaveProperty('contentGain');
      expect(result.metrics).toHaveProperty('citationReadability');
      expect(result.metrics).toHaveProperty('missingWords');
      expect(result.metrics).toHaveProperty('similarity');
      expect(result).toHaveProperty('visibilityScore');
    });
    
    it('should handle identical content', () => {
      const result = analyzeVisibility(simpleHtml, simpleHtml);
      
      expect(result.metrics.contentGain).toBe(1);
      expect(result.metrics.missingWords).toBe(0);
      expect(result.metrics.citationReadability).toBe(100);
      expect(result.visibilityScore.score).toBeGreaterThan(90);
    });
    
    it('should handle empty content', () => {
      const result = analyzeVisibility('', richHtml);
      
      expect(result.metrics.contentGain).toBeGreaterThanOrEqual(1);
      expect(result.metrics.citationReadability).toBe(100);
    });
  });
  
  describe('quickCompare', () => {
    it('should provide quick comparison metrics', () => {
      const result = quickCompare(simpleHtml, richHtml);
      
      expect(result).toHaveProperty('wordCount');
      expect(result).toHaveProperty('contentGain');
      expect(result).toHaveProperty('missingWords');
      expect(result).toHaveProperty('similarity');
      
      expect(result.wordCount).toHaveProperty('first');
      expect(result.wordCount).toHaveProperty('second');
      expect(result.wordCount).toHaveProperty('difference');
    });
  });
  
  describe('getCitationReadiness', () => {
    it('should provide citation readiness score', () => {
      const result = getCitationReadiness(simpleHtml, richHtml);
      
      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('category');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('metrics');
      expect(result).toHaveProperty('recommendations');
      
      expect(typeof result.score).toBe('number');
      expect(result.score).toBeGreaterThanOrEqual(0);
      expect(result.score).toBeLessThanOrEqual(100);
      expect(Array.isArray(result.recommendations)).toBe(true);
    });
  });
  
  describe('stripTagsToText', () => {
    it('should extract text content from HTML', () => {
      const html = '<div><h1>Title</h1><p>Content with <strong>bold</strong> text</p></div>';
      const text = stripTagsToText(html);
      
      expect(text).toContain('Title');
      expect(text).toContain('Content with');
      expect(text).toContain('bold');
      expect(text).toContain('text');
      expect(text).not.toContain('<');
      expect(text).not.toContain('>');
    });
    
    it('should remove navigation elements when ignoreNavFooter is true', () => {
      const html = '<html><body><nav>Navigation</nav><h1>Title</h1><p>Content</p><footer>Footer</footer></body></html>';
      const text = stripTagsToText(html, true);
      
      expect(text).toContain('Title');
      expect(text).toContain('Content');
      expect(text).not.toContain('Navigation');
      expect(text).not.toContain('Footer');
    });
    
    it('should keep navigation elements when ignoreNavFooter is false', () => {
      const html = '<html><body><nav>Navigation</nav><h1>Title</h1><p>Content</p><footer>Footer</footer></body></html>';
      const text = stripTagsToText(html, false);
      
      expect(text).toContain('Title');
      expect(text).toContain('Content');
      expect(text).toContain('Navigation');
      expect(text).toContain('Footer');
    });
  });
  
  describe('calculateSimilarity', () => {
    it('should calculate similarity between identical texts', () => {
      const text = 'This is a test text';
      const similarity = calculateSimilarity(text, text);
      
      expect(similarity).toBe(100);
    });
    
    it('should calculate similarity between different texts', () => {
      const text1 = 'This is a test';
      const text2 = 'This is another test';
      const similarity = calculateSimilarity(text1, text2);
      
      expect(similarity).toBeGreaterThan(0);
      expect(similarity).toBeLessThan(100);
    });
    
    it('should return 0 for completely different texts', () => {
      const text1 = 'Hello world';
      const text2 = 'Goodbye universe';
      const similarity = calculateSimilarity(text1, text2);
      
      expect(similarity).toBe(0);
    });
  });
});

