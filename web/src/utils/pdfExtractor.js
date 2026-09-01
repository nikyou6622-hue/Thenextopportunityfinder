/**
 * pdfExtractor.js - Client-Side PDF & Document Text Extractor
 * Powered by Mozilla PDF.js engine for pixel-perfect resume text extraction.
 */
import * as pdfjsLib from 'pdfjs-dist';

// Configure Mozilla PDF.js worker CDN for browser runtime
if (typeof window !== 'undefined' && pdfjsLib) {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js`;
  } catch {}
}

export async function extractPdfTextClient(arrayBuffer) {
  if (!arrayBuffer || arrayBuffer.byteLength === 0) return "";

  // Slice clones of ArrayBuffer so worker transfers don't detach fallback buffers
  const bufferForWorker = arrayBuffer.slice(0);
  const bufferForFallback = arrayBuffer.slice(0);

  // 1. Primary Engine: Mozilla PDF.js (Handles all font encodings & kerning arrays)
  try {
    if (pdfjsLib && pdfjsLib.getDocument) {
      const loadingTask = pdfjsLib.getDocument({ data: bufferForWorker });
      const pdf = await loadingTask.promise;
      let fullText = '';
      
      for (let pageNum = 1; pageNum <= Math.min(pdf.numPages, 10); pageNum++) {
        const page = await pdf.getPage(pageNum);
        const textContent = await page.getTextContent();
        let lastY = null;
        let lineText = '';

        for (const item of textContent.items) {
          if (!item.str) continue;
          // Group items by vertical position into lines
          if (lastY !== null && Math.abs(item.transform[5] - lastY) > 5) {
            fullText += lineText.trim() + '\n';
            lineText = '';
          }
          lineText += item.str + ' ';
          lastY = item.transform[5];
        }
        if (lineText.trim()) {
          fullText += lineText.trim() + '\n';
        }
      }

      const cleanedText = sanitizeExtractedText(fullText);
      if (cleanedText.length > 20) {
        return cleanedText;
      }
    }
  } catch (pdfErr) {
    console.warn("[PDF.js Engine Notice] Falling back to text stream decoder:", pdfErr);
  }

  // 2. Fallback Engine: Clean Stream Decoder
  try {
    const bytes = new Uint8Array(bufferForFallback);
    const textDecoder = new TextDecoder('latin1');
    const rawString = textDecoder.decode(bytes);

    const extractedItems = [];
    const btRegex = /\/BT[\s\S]*?\/ET/g;
    let match;
    while ((match = btRegex.exec(rawString)) !== null) {
      const block = match[0];
      const strRegex = /\(([^)]+)\)\s*T[jJ]|\[\s*\(([^)]+)\)/g;
      let strMatch;
      while ((strMatch = strRegex.exec(block)) !== null) {
        const txt = (strMatch[1] || strMatch[2] || '').trim();
        if (txt && txt.length > 1 && !/^[\d\s.,\/\\()\-:]+$/.test(txt)) {
          extractedItems.push(txt);
        }
      }
    }

    if (extractedItems.length >= 4) {
      const joined = extractedItems.join(' ');
      return sanitizeExtractedText(joined);
    }

    const cleanLines = rawString
      .split(/[\r\n]+/)
      .map(line => line.replace(/[^\x20-\x7E]/g, ' ').trim())
      .filter(line => {
        if (line.length < 3) return false;
        if (line.startsWith('%PDF') || line.startsWith('<<') || line.startsWith('>>')) return false;
        if (/^(obj|endobj|stream|endstream|xref|trailer|startxref|Font|MediaBox|Catalog|Page)/i.test(line)) return false;
        if (/^\d+\s+\d+\s+obj/i.test(line)) return false;
        if (/^\d{10,}/.test(line)) return false;
        if (line.includes('/Type') || line.includes('/Subtype') || line.includes('/Filter')) return false;
        return true;
      });

    return sanitizeExtractedText(cleanLines.join('\n'));
  } catch (err) {
    console.warn("Client PDF extraction error:", err);
    return "";
  }
}

function sanitizeExtractedText(text) {
  if (!text) return "";
  return text
    // Fix spaced out letters like "j  V  S" -> "j V S"
    .replace(/(?<=\b[A-Za-z])\s{2,}(?=[A-Za-z]\b)/g, ' ')
    // Remove control characters
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
