/**
 * Replaces placeholders in a template string with actual values.
 * 
 * @param {string} template - The string (or JSON string) to process.
 * @param {Object} values - A map of placeholder keys and their replacements.
 * @returns {string}
 */
export function parsePlaceholders(template, values) {
  let result = template;

  for (const [key, value] of Object.entries(values)) {
    const regex = new RegExp(key.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'g');
    result = result.replace(regex, value);
  }

  return result;
}
