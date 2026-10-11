// src/utils/katexRenderer.spec.js
import { describe, it, expect } from 'vitest';
import { renderMath } from './katexRenderer';

describe('KaTeX Math Renderer', () => {
  it('should return empty string when input is null, undefined, or empty', () => {
    expect(renderMath(null)).toBe('');
    expect(renderMath(undefined)).toBe('');
    expect(renderMath('')).toBe('');
  });

  it('should return normal text untouched when no math delimiters are present', () => {
    const text = 'Bu oddiy savol matni: O\'zbekiston poytaxti qaysi shahar?';
    expect(renderMath(text)).toBe(text);
  });

  it('should correctly render inline math with $ ... $', () => {
    const text = 'Tenglamaning ildizini toping: $x^2 + 5x + 6 = 0$';
    const rendered = renderMath(text);
    expect(rendered).toContain('katex');
    expect(rendered).toContain('class="katex"');
    expect(rendered).toContain('Tenglamaning ildizini toping:');
  });

  it('should correctly render block math with $$ ... $$', () => {
    const text = 'Hisoblang: $$\\int_{0}^{1} x dx$$';
    const rendered = renderMath(text);
    expect(rendered).toContain('class="katex-display"');
    expect(rendered).toContain('katex');
  });

  it('should handle complex formulas like fractions and square roots', () => {
    const text = 'Formula: $\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$';
    const rendered = renderMath(text);
    expect(rendered).toContain('katex');
    expect(rendered).toContain('sqrt');
  });

  it('should gracefully handle malformed math without crashing', () => {
    const malformed = 'Xato formula: $\\unknownCommand{123}$';
    expect(() => renderMath(malformed)).not.toThrow();
    const rendered = renderMath(malformed);
    expect(typeof rendered).toBe('string');
  });
});
