/**
 * Browser-native client-side document text extractor for PDF, DOCX, and Text files.
 * Provides a 100% resilient fallback when remote backend upload/parsing is slow or unavailable.
 */

/**
 * Extract text from a PDF ArrayBuffer directly in the browser
 */
export async function extractTextFromPdf(arrayBuffer: ArrayBuffer): Promise<string> {
  const latin1 = new TextDecoder('latin1').decode(new Uint8Array(arrayBuffer));
  const extractedLines: string[] = [];

  // Match streams: stream\r?\n ... \r?\nendstream
  const streamRegex = /stream\r?\n([\s\S]*?)\r?\nendstream/g;
  let match: RegExpExecArray | null;

  while ((match = streamRegex.exec(latin1)) !== null) {
    const rawStream = match[1];
    const streamBytes = new Uint8Array(rawStream.length);
    for (let i = 0; i < rawStream.length; i++) {
      streamBytes[i] = rawStream.charCodeAt(i) & 0xff;
    }

    let decoded = '';

    // 1. Try standard zlib/deflate decompression
    try {
      const ds = new DecompressionStream('deflate');
      const writer = ds.writable.getWriter();
      writer.write(streamBytes);
      writer.close();
      const ab = await new Response(ds.readable).arrayBuffer();
      decoded = new TextDecoder('latin1').decode(ab);
    } catch {
      // 2. Try deflate-raw (headerless)
      try {
        const dsRaw = new DecompressionStream('deflate-raw');
        const writerRaw = dsRaw.writable.getWriter();
        writerRaw.write(streamBytes);
        writerRaw.close();
        const abRaw = await new Response(dsRaw.readable).arrayBuffer();
        decoded = new TextDecoder('latin1').decode(abRaw);
      } catch {
        // 3. Fallback: stream might already be plain text
        decoded = rawStream;
      }
    }

    if (!decoded) continue;

    // 2. Extract text from BT ... ET blocks
    const btRegex = /BT([\s\S]*?)ET/g;
    let btMatch: RegExpExecArray | null;

    while ((btMatch = btRegex.exec(decoded)) !== null) {
      const block = btMatch[1];

      // Match TJ arrays: [ ... ] TJ
      const tjRegex = /\[([\s\S]*?)\]\s*TJ/g;
      let tjMatch: RegExpExecArray | null;

      while ((tjMatch = tjRegex.exec(block)) !== null) {
        const inner = tjMatch[1];
        let line = '';
        const itemRegex = /\((.*?)\)|<([0-9a-fA-F]+)>/g;
        let item: RegExpExecArray | null;

        while ((item = itemRegex.exec(inner)) !== null) {
          if (item[1] !== undefined) {
            line += decodePdfString(item[1]);
          } else if (item[2] !== undefined) {
            line += decodeHexPdfString(item[2]);
          }
        }
        if (line.trim()) extractedLines.push(line.trim());
      }

      // Match single Tj: (...) Tj or <hex> Tj
      const singleTjRegex = /(?:\((.*?)\)|<([0-9a-fA-F]+)>)\s*Tj/g;
      let sMatch: RegExpExecArray | null;

      while ((sMatch = singleTjRegex.exec(block)) !== null) {
        let line = '';
        if (sMatch[1] !== undefined) {
          line = decodePdfString(sMatch[1]);
        } else if (sMatch[2] !== undefined) {
          line = decodeHexPdfString(sMatch[2]);
        }
        if (line.trim()) extractedLines.push(line.trim());
      }
    }
  }

  // 3. Fallback: if stream extraction didn't find lines, check for uncompressed readable text
  if (extractedLines.length === 0) {
    const rawMatches = latin1.match(/\(([^()]{3,})\)\s*Tj/g);
    if (rawMatches) {
      for (const m of rawMatches) {
        const cleaned = m.replace(/\)\s*Tj$/, '').replace(/^\(/, '').trim();
        if (cleaned.length > 2) extractedLines.push(decodePdfString(cleaned));
      }
    }
  }

  return extractedLines.join('\n');
}

/**
 * Decode escaped PDF parenthesized string literals (e.g. \(, \), \\, \r, \n)
 */
function decodePdfString(str: string): string {
  return str
    .replace(/\\([()\\])/g, '$1')
    .replace(/\\r/g, '\r')
    .replace(/\\n/g, '\n')
    .replace(/\\t/g, '\t');
}

/**
 * Decode hex encoded PDF text string (e.g. <4f66666572>)
 */
function decodeHexPdfString(hex: string): string {
  let chars = '';
  for (let i = 0; i < hex.length; i += 2) {
    const code = parseInt(hex.substr(i, 2), 16);
    if (code >= 32 && code <= 126) {
      chars += String.fromCharCode(code);
    } else if (code === 10 || code === 13) {
      chars += '\n';
    }
  }
  return chars;
}

/**
 * Extract text from a DOCX ArrayBuffer directly in the browser
 */
export async function extractTextFromDocx(arrayBuffer: ArrayBuffer): Promise<string> {
  const view = new DataView(arrayBuffer);
  let offset = 0;

  while (offset < arrayBuffer.byteLength - 4) {
    const sig = view.getUint32(offset, true);
    if (sig === 0x04034b50) {
      // Local file header found
      const compMethod = view.getUint16(offset + 8, true);
      const compSize = view.getUint32(offset + 18, true);
      const fnLen = view.getUint16(offset + 26, true);
      const extraLen = view.getUint16(offset + 28, true);

      const fnBytes = new Uint8Array(arrayBuffer, offset + 30, fnLen);
      const fileName = new TextDecoder().decode(fnBytes);
      const dataOffset = offset + 30 + fnLen + extraLen;

      if (fileName === 'word/document.xml') {
        const compData = new Uint8Array(arrayBuffer, dataOffset, compSize);
        let xmlStr = '';

        if (compMethod === 8) {
          // Deflate-raw
          const ds = new DecompressionStream('deflate-raw');
          const writer = ds.writable.getWriter();
          writer.write(compData);
          writer.close();
          const decomp = await new Response(ds.readable).arrayBuffer();
          xmlStr = new TextDecoder().decode(decomp);
        } else if (compMethod === 0) {
          xmlStr = new TextDecoder().decode(compData);
        }

        // Parse paragraphs and text runs
        const paras = xmlStr.match(/<w:p[\s>][\s\S]*?<\/w:p>/g) || [];
        const lines = paras
          .map((p) => {
            const texts = p.match(/<w:t[\s>][\s\S]*?<\/w:t>/g) || [];
            return texts.map((t) => t.replace(/<[^>]+>/g, '')).join('');
          })
          .filter((l) => l.trim().length > 0);

        return lines.join('\n\n');
      }

      offset = dataOffset + compSize;
    } else {
      offset++;
    }
  }

  return '';
}

/**
 * Main client-side document parser entry point.
 * Reads File (.pdf, .docx, .txt, .html, .md) and returns extracted text content.
 */
export async function parseDocumentClientSide(file: File): Promise<{
  extractedContent: string;
  detectedFormat: string;
}> {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';

  if (ext === 'pdf' || file.type === 'application/pdf') {
    const ab = await file.arrayBuffer();
    const text = await extractTextFromPdf(ab);
    if (!text || text.trim().length === 0) {
      throw new Error('PDF file contains no extractable text (it might be a scanned image or protected).');
    }
    return {
      extractedContent: text,
      detectedFormat: 'PDF',
    };
  }

  if (ext === 'docx' || ext === 'doc' || file.type.includes('wordprocessingml')) {
    const ab = await file.arrayBuffer();
    const text = await extractTextFromDocx(ab);
    if (!text || text.trim().length === 0) {
      throw new Error('Word document contains no extractable text in body.');
    }
    return {
      extractedContent: text,
      detectedFormat: 'DOCX',
    };
  }

  // Plain text / Markdown / HTML
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const raw = (e.target?.result as string) || '';
      resolve({
        extractedContent: raw,
        detectedFormat: ext.toUpperCase() || 'TXT',
      });
    };
    reader.onerror = () => reject(new Error('Failed to read file as text.'));
    reader.readAsText(file);
  });
}
