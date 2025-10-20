/**
 * Calculate reading time for text content
 * @param {string} text - The text content (can include markdown)
 * @param {number} wordsPerMinute - Average reading speed (default: 200 wpm)
 * @returns {string} - Formatted reading time like "5 min read"
 */
export function calculateReadingTime(text, wordsPerMinute = 200) {
  if (!text || typeof text !== 'string') {
    return '1 min read';
  }

  // Clean up the text
  let cleanText = text
    // Remove frontmatter (everything between --- blocks)
    .replace(/^---[\s\S]*?---/, '')
    // Remove HTML tags
    .replace(/<[^>]*>/g, '')
    // Remove markdown formatting
    .replace(/#{1,6}\s/g, '') // Headers
    .replace(/\*\*([^*]+)\*\*/g, '$1') // Bold
    .replace(/\*([^*]+)\*/g, '$1') // Italic
    .replace(/`([^`]+)`/g, '$1') // Inline code
    .replace(/```[\s\S]*?```/g, '') // Code blocks
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Links
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1') // Images
    // Remove numbered lists (track titles, etc.)
    .replace(/^\d+\.\s+.+$/gm, '')
    // Remove bullet points
    .replace(/^[-*+]\s+.+$/gm, '')
    // Remove extra whitespace and newlines
    .replace(/\s+/g, ' ')
    .trim();

  // Count words (split by whitespace and filter out empty strings)
  const words = cleanText.split(/\s+/).filter(word => word.length > 0);
  const wordCount = words.length;

  // Calculate reading time
  const minutes = Math.max(1, Math.ceil(wordCount / wordsPerMinute));

  // Format the result
  if (minutes === 1) {
    return '1 min read';
  } else {
    return `${minutes} min read`;
  }
}

/**
 * Calculate reading time for rendered markdown content
 * @param {Object} post - Astro content entry
 * @returns {Promise<string>} - Formatted reading time
 */
export async function calculateReadingTimeForPost(post) {
  try {
    // Get the raw content body
    const content = post.body;
    return calculateReadingTime(content);
  } catch (error) {
    console.warn('Error calculating reading time:', error);
    return '1 min read';
  }
}