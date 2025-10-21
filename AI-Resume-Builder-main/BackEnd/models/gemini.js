'use strict';

// CommonJS-safe Gemini helper for strict JSON output
// - Dynamic ESM import of @google/generative-ai
// - Accepts GEMINI_API_KEY or GOOGLE_API_KEY
// - Sanitizes responseSchema to remove unsupported keys (e.g., additionalProperties)

// We'll dynamically import GoogleGenerativeAI, so no direct CommonJS require here for it.

const MODEL = 'gemini-2.5-flash'; // Corrected model name based on common availability
const TEMPERATURE = process.env.GEMINI_TEMPERATURE ? Number(process.env.GEMINI_TEMPERATURE) : 0.7;

let GoogleGenerativeAIClass = null; // Will hold the dynamically imported class

async function getGenAI() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    throw new Error('Missing Gemini API key. Set GEMINI_API_KEY or GOOGLE_API_KEY.');
  }
  if (!GoogleGenerativeAIClass) {
    // Dynamic import to work in CommonJS projects
    // Ensure you have '@google/generative-ai' installed: npm install @google/generative-ai
    const mod = await import('@google/generative-ai');
    GoogleGenerativeAIClass = mod.GoogleGenerativeAI;
  }
  return new GoogleGenerativeAIClass(apiKey);
}

// Recursively remove keys Gemini doesn't accept in responseSchema
function sanitizeSchema(schema) {
  if (!schema || typeof schema !== 'object') return schema;

  // Remove unsupported fields
  // eslint-disable-next-line no-unused-vars
  const { additionalProperties, default: _default, examples, title, ...rest } = schema;
  // If `rest` is an array, it means `schema` was an array.
  // The `...rest` spread for arrays only works in newer JS versions/transpilers
  // and might not be what you intend if `schema` is expected to be an object always
  // at the top level for a schema. Assuming `schema` is always an object here.
  const out = { ...rest };

  if (out.properties && typeof out.properties === 'object') {
    const cleanedProps = {};
    for (const [k, v] of Object.entries(out.properties)) {
      cleanedProps[k] = sanitizeSchema(v);
    }
    out.properties = cleanedProps;
  }
  if (out.items) out.items = sanitizeSchema(out.items);
  if (out.anyOf) out.anyOf = out.anyOf.map(sanitizeSchema);
  if (out.oneOf) out.oneOf = out.oneOf.map(sanitizeSchema);
  if (out.allOf) out.allOf = out.allOf.map(sanitizeSchema);

  return out;
}

/**
 * generateJson
 * Use Google Gemini with application/json output and optional responseSchema.
 * Params:
 * - system: string (system instruction)
 * - user: string|object (payload; stringified if object)
 * - schema: optional schema (subset) to shape output
 */
async function generateJson({ system, user, schema }) {
  const genAI = await getGenAI();

  // Configure model with systemInstruction
  const model = genAI.getGenerativeModel({
    model: MODEL,
    systemInstruction: system,
  });

  const userText = typeof user === 'string' ? user : JSON.stringify(user ?? {});
  const cleanedSchema = schema ? sanitizeSchema(schema) : undefined;

  try {
    const response = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: userText }] }],
      generationConfig: {
        temperature: TEMPERATURE,
        responseMimeType: 'application/json',
        ...(cleanedSchema ? { responseSchema: cleanedSchema } : {}),
      },
    });

    // Extract text from the response, handling different structures
    const text =
      (typeof response?.response?.text === 'function'
        ? response.response.text()
        : (response?.response?.candidates?.[0]?.content?.parts || [])
            .map((p) => p?.text || '')
            .join('')) || '';

    // Clean up potential markdown JSON block
    let jsonText = text.trim().replace(/^```json\s*/i, '').replace(/```$/i, '').trim();
    // Best-effort cleanup of trailing commas, which are a common cause of JSON parsing errors.
    jsonText = jsonText.replace(/,\s*([}\]])/g, '$1');

    try {
      return JSON.parse(jsonText);
    } catch (parseError) {
      // Attempt to find and parse JSON if the model wrapped it or returned extra text
      const start = jsonText.indexOf('{');
      const end = jsonText.lastIndexOf('}');
      if (start !== -1 && end !== -1 && end > start) {
        try {
          return JSON.parse(jsonText.slice(start, end + 1));
        } catch (sliceParseError) {
          console.warn('Attempted to slice and parse JSON, but failed:', sliceParseError);
        }
      }
      const excerpt = jsonText.slice(0, 200).replace(/\s+/g, ' ');
      throw new Error(
        `Failed to parse Gemini JSON response. Original parse error: ${parseError.message}. Excerpt: ${excerpt}`
      );
    }
  } catch (error) {
    console.error('Error generating content with Gemini:', error);
    // Re-throw or handle the error as appropriate for your application
    throw error;
  }
}

module.exports = { generateJson, sanitizeSchema };