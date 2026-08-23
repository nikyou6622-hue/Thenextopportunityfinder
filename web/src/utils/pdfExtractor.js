/**
 * pdfExtractor.js - Client-Side PDF & Document Text Extractor
 * Extracts readable text streams from PDF files without heavy node dependencies.
 */

export async function extractPdfTextClient(arrayBuffer) {
  try {
    const bytes = new Uint8Array(arrayBuffer);
    const textDecoder = new TextDecoder('latin1');
    const rawString = textDecoder.decode(bytes);

    const extractedItems = [];
    
    // 1. Extract text from PDF /BT ... /ET text objects
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
      return extractedItems.join('\n');
    }

    // 2. Fallback: Parse clean printable text lines excluding PDF syntax tokens & binary metadata timestamps
    const cleanLines = rawString
      .split(/[\r\n]+/)
      .map(line => line.replace(/[^\x20-\x7E]/g, ' ').trim())
      .filter(line => {
        if (line.length < 3) return false;
        if (line.startsWith('%PDF') || line.startsWith('<<') || line.startsWith('>>')) return false;
        if (/^(obj|endobj|stream|endstream|xref|trailer|startxref|Font|MediaBox|Catalog|Page)/i.test(line)) return false;
        if (/^\d+\s+\d+\s+obj/i.test(line)) return false;
        if (/^\d{10,}/.test(line)) return false; // Ignore creation timestamps like 20260821203735
        if (line.includes('/Type') || line.includes('/Subtype') || line.includes('/Filter')) return false;
        return true;
      });

    return cleanLines.join('\n');
  } catch (err) {
    console.warn("Client PDF extraction error:", err);
    return "";
  }
}
