// src/utils/katexRenderer.js
import katex from 'katex';
import 'katex/dist/katex.min.css';

/**
 * ⚡ Sovereign KaTeX Math Renderer
 * Matematika, fizika, kimyo va boshqa fanlar formulalarini ($...$ va $$...$$)
 * avtomatik aniqlab, yuqori sifatli HTML ga o'giruvchi xavfsiz yordamchi funksiya.
 * 
 * @param {string} text - Test savoli yoki variant matni
 * @returns {string} - Render qilingan HTML matn
 */
export function renderMath(text) {
  if (!text || typeof text !== 'string') return '';

  // 1. Agar matnda formula belgilari ($ yoki \) umuman bo'lmasa, o'zini qaytaradi
  if (!text.includes('$') && !text.includes('\\(') && !text.includes('\\[') && !text.includes('\\frac')) {
    return text;
  }

  try {
    let result = text;

    // 2. Block math: $$ ... $$ yoki \[ ... \]
    result = result.replace(/\$\$([\s\S]+?)\$\$/g, (match, formula) => {
      try {
        return katex.renderToString(formula.trim(), {
          displayMode: true,
          throwOnError: false,
        });
      } catch (err) {
        return match;
      }
    });

    result = result.replace(/\\\[([\s\S]+?)\\\]/g, (match, formula) => {
      try {
        return katex.renderToString(formula.trim(), {
          displayMode: true,
          throwOnError: false,
        });
      } catch (err) {
        return match;
      }
    });

    // 3. Inline math: $ ... $ yoki \( ... \)
    result = result.replace(/(^|[^\\])\$([^\$]+?)\$/g, (match, prefix, formula) => {
      try {
        const rendered = katex.renderToString(formula.trim(), {
          displayMode: false,
          throwOnError: false,
        });
        return prefix + rendered;
      } catch (err) {
        return match;
      }
    });

    result = result.replace(/\\\(([\s\S]+?)\\\)/g, (match, formula) => {
      try {
        return katex.renderToString(formula.trim(), {
          displayMode: false,
          throwOnError: false,
        });
      } catch (err) {
        return match;
      }
    });

    return result;
  } catch (e) {
    console.warn('KaTeX rendering ogohlantirish:', e);
    return text;
  }
}
