/**
 * Utility to clean markdown, formatting, symbols, tables, technical codes,
 * prompt artifacts, and character limit mentions before sending text to
 * the browser's Text-to-Speech (TTS) engine.
 * 
 * Ensures Martín speaks naturally, fluently, and like a real human analyst.
 */

export function cleanTextForSpeech(rawText: string): string {
  if (!rawText) return "";

  let text = rawText;

  // 1. Remove code blocks, JSON, XML, and system prompt tags completely
  text = text.replace(/```[\s\S]*?```/g, "");
  text = text.replace(/<WRITE_FILE[\s\S]*?<\/WRITE_FILE>/gi, "");
  text = text.replace(/\[WRITE_FILE:[\s\S]*?\]/gi, "");
  text = text.replace(/\[REM:[\s\S]*?\]/gi, "");
  text = text.replace(/\[REM_DATA:[\s\S]*?\]/gi, "");
  text = text.replace(/<table[\s\S]*?<\/table>/gi, "");
  text = text.replace(/<[^>]*>/g, "");

  // 2. Remove internal AI instructions, character limits (e.g. "no superar 145 caracteres", "147")
  text = text.replace(/no\s+(?:se\s+)?(?:puede\s+)?superar\s+(?:los\s+)?\d+\s*(?:caracteres?)?/gi, "");
  text = text.replace(/l[íi]mite\s+de\s+\d+\s*caracteres?/gi, "");
  text = text.replace(/\b(?:configuraci[oó]n|l[íi]nea|c[oó]digo|prompt|token)\s+(?:del\s+sistema|interna|de\s+la\s+planilla|n[úu]mero\s+\d+)?\b/gi, "");
  text = text.replace(/\b(?:producto\s+gen[ée]rico|producto\s+general)\b/gi, "producto seleccionado");

  // 3. Remove URLs, file paths and API routes
  text = text.replace(/https?:\/\/\S+/gi, "enlace");
  text = text.replace(/\/api\/\S+/gi, "enlace");
  text = text.replace(/www\.\S+/gi, "sitio web");

  // 4. Remove Markdown Tables (lines starting and ending with |)
  text = text.replace(/^\s*\|.*\|\s*$/gm, "");

  // 5. Replace arrows with natural words
  text = text.replace(/-->|->|➔|→|=>|==>|➜|➤/g, " hacia ");
  text = text.replace(/<--|<-|⬅|◀/g, " desde ");

  // 6. Remove Markdown bold, italic, strikethrough, headers
  text = text.replace(/#{1,6}\s+/g, "");
  text = text.replace(/\*\*(.*?)\*\*/g, "$1");
  text = text.replace(/\*(.*?)\*/g, "$1");
  text = text.replace(/__(.*?)__/g, "$1");
  text = text.replace(/_(.*?)_/g, "$1");
  text = text.replace(/~~(.*?)~~/g, "$1");
  text = text.replace(/`([^`]+)`/g, "$1");

  // 7. Remove bullets and repetitive dashes or equal signs
  text = text.replace(/^[-*•]\s+/gm, "");
  text = text.replace(/[-=_]{3,}/g, " ");
  text = text.replace(/\|/g, " ");
  text = text.replace(/\\/g, " ");
  text = text.replace(/\/{2,}/g, " ");

  // 8. Replace file extensions naturally
  text = text.replace(/\.xlsx\b/gi, " Excel ");
  text = text.replace(/\.xls\b/gi, " Excel ");
  text = text.replace(/\.csv\b/gi, " archivo CSV ");
  text = text.replace(/\.pdf\b/gi, " PDF ");
  text = text.replace(/\.txt\b/gi, " texto ");
  text = text.replace(/\.json\b/gi, " datos ");

  // 9. Clean emojis and technical icons so browser doesn't vocalize symbol descriptions
  text = text.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F000}-\u{1F02F}\u{1F0A0}-\u{1F0FF}\u{1F100}-\u{1F64F}\u{1F680}-\u{1F6FF}]/gu, "");

  // 10. Clean mathematical or bracket symbols
  text = text.replace(/[\[\]{}()<>]/g, " ");
  text = text.replace(/[$]/g, " pesos ");
  text = text.replace(/[%]/g, " por ciento ");
  text = text.replace(/[&]/g, " y ");
  text = text.replace(/[@]/g, " ");
  text = text.replace(/~/g, " ");
  text = text.replace(/\^/g, " ");
  text = text.replace(/#/g, " ");

  // 11. Normalize punctuation and whitespace
  text = text.replace(/:\s*-\s*/g, ": ");
  text = text.replace(/:\s*;/g, ": ");
  text = text.replace(/\s+/g, " ").trim();

  // 12. Fix abbreviations for smooth natural speech
  text = text.replace(/\bu\.\b/gi, "unidades");
  text = text.replace(/\bhs\.\b|\bhs\b/gi, "horas");
  text = text.replace(/\bej\.\b|\bej:\b/gi, "por ejemplo");
  text = text.replace(/\bpág\.\b/gi, "página");
  text = text.replace(/\bN°\b|\bNro\b|\bNº\b/gi, "número");

  return text;
}

