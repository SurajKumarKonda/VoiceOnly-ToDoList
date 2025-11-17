/**
 * Google Gemini integration for natural language understanding
 * Processes voice commands and extracts structured data
 */

import { ParsedCommand } from '@/types/task';
import { parseISO, addDays, addWeeks, addMonths, format } from 'date-fns';

/**
 * Process a voice command using Google Gemini to extract intent and parameters
 */
export async function processVoiceCommand(
  transcript: string,
  apiKey: string
): Promise<ParsedCommand> {
  const systemPrompt = `Parse voice commands for a to-do app. Return JSON only.

Intents: create, read, update, delete, list, filter

JSON structure:
{
  "intent": "create" | "read" | "update" | "delete" | "list" | "filter",
  "taskTitle": "task title if creating",
  "taskIndex": number if "nth task" mentioned (1-based),
  "category": "category if mentioned",
  "priority": "low" | "medium" | "high" if mentioned,
  "scheduledTime": "time description (tomorrow, next week, 3rd week, etc.)",
  "searchQuery": "keywords to find task"
}

Examples:
"Make task X" -> {"intent":"create","taskTitle":"X"}
"Show admin tasks" -> {"intent":"filter","category":"administrative"}
"Delete 4th task" -> {"intent":"delete","taskIndex":4}
"Push task of X to tomorrow" -> {"intent":"update","searchQuery":"X","scheduledTime":"tomorrow"}
"Update first task as Y" -> {"intent":"update","taskIndex":1,"taskTitle":"Y"}

For "task of X" or "task about X", extract X as searchQuery.
Return ONLY valid JSON, no other text.`;

  const prompt = `${systemPrompt}\n\nUser command: "${transcript}"\n\nReturn the parsed command as JSON:`;

  // Use only gemini-2.5-flash
  const modelName = 'gemini-2.5-flash';
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
  
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.3, // Lower temperature for more consistent parsing
          maxOutputTokens: 300, // Increased to handle longer responses
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Gemini API error: ${response.statusText} - ${JSON.stringify(errorData)}`
      );
    }

    const data = await response.json();
    
    // Debug: log the response structure
    console.log('Gemini API response:', JSON.stringify(data, null, 2));
    
    // Try multiple possible response structures
    let content = 
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      data.candidates?.[0]?.text ||
      data.text ||
      data.content?.parts?.[0]?.text ||
      data.content?.text;

    // If still no content, check if there's an error in the response
    if (!content) {
      if (data.error) {
        throw new Error(`Gemini API error: ${JSON.stringify(data.error)}`);
      }
      if (data.candidates && data.candidates.length === 0) {
        throw new Error('Gemini API returned no candidates. Response: ' + JSON.stringify(data));
      }
      
      // Check finish reason
      const finishReason = data.candidates?.[0]?.finishReason;
      if (finishReason === 'MAX_TOKENS') {
        throw new Error('Gemini API response was truncated (MAX_TOKENS). The response exceeded the token limit. This might happen with very long prompts. Please try a shorter command.');
      } else if (finishReason === 'SAFETY' || finishReason === 'RECITATION') {
        throw new Error(`Gemini API stopped due to ${finishReason}. Please rephrase your request.`);
      } else if (finishReason && finishReason !== 'STOP') {
        throw new Error(`Gemini API finished with reason: ${finishReason}. Response: ${JSON.stringify(data)}`);
      }
      
      throw new Error('No response content from Gemini API. Response structure: ' + JSON.stringify(data, null, 2));
    }
    
    // Check if response was truncated but we have partial content
    const finishReason = data.candidates?.[0]?.finishReason;
    if (finishReason === 'MAX_TOKENS' && content) {
      console.warn('Gemini response was truncated (MAX_TOKENS), but attempting to parse partial response');
    }

    // Extract JSON from response (Gemini might add explanatory text or wrap in markdown)
    let jsonContent = content.trim();
    
    // Remove markdown code blocks if present
    if (jsonContent.includes('```json')) {
      const jsonMatch = jsonContent.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonContent = jsonMatch[1].trim();
      }
    } else if (jsonContent.includes('```')) {
      const jsonMatch = jsonContent.match(/```\s*([\s\S]*?)\s*```/);
      if (jsonMatch) {
        jsonContent = jsonMatch[1].trim();
      }
    }
    
    // Try to find JSON object in the response (in case there's explanatory text)
    // Look for the first { and find the matching closing } by counting braces
    const firstBrace = jsonContent.indexOf('{');
    
    if (firstBrace !== -1) {
      // Count braces to find the proper closing brace
      let braceCount = 0;
      let lastBrace = -1;
      for (let i = firstBrace; i < jsonContent.length; i++) {
        if (jsonContent[i] === '{') braceCount++;
        if (jsonContent[i] === '}') {
          braceCount--;
          if (braceCount === 0) {
            lastBrace = i;
            break;
          }
        }
      }
      
      if (lastBrace !== -1 && lastBrace > firstBrace) {
        jsonContent = jsonContent.substring(firstBrace, lastBrace + 1);
      }
    }
    
    // Additional cleanup - remove any leading text before JSON
    jsonContent = jsonContent.trim();
    if (!jsonContent.startsWith('{')) {
      // Find the first { character
      const braceIndex = jsonContent.indexOf('{');
      if (braceIndex !== -1) {
        jsonContent = jsonContent.substring(braceIndex);
        // Find the matching closing brace by counting
        let braceCount = 0;
        for (let i = 0; i < jsonContent.length; i++) {
          if (jsonContent[i] === '{') braceCount++;
          if (jsonContent[i] === '}') {
            braceCount--;
            if (braceCount === 0) {
              jsonContent = jsonContent.substring(0, i + 1);
              break;
            }
          }
        }
      }
    }

    try {
      const parsed: ParsedCommand = JSON.parse(jsonContent);

      // Process relative time expressions
      if (
        parsed.scheduledTime &&
        !parsed.scheduledTime.match(/^\d{4}-\d{2}-\d{2}/)
      ) {
        parsed.scheduledTime = parseRelativeTime(parsed.scheduledTime);
      }

      return parsed;
    } catch (parseError: any) {
      // If JSON parsing fails, log the content for debugging
      console.error('Failed to parse JSON response:', {
        originalContent: content.substring(0, 200),
        extractedContent: jsonContent.substring(0, 200),
        error: parseError.message
      });
      // Show more of the response for debugging
      const errorMsg = `Failed to parse Gemini response as JSON. 
Original: ${content.substring(0, 300)}
Extracted: ${jsonContent.substring(0, 300)}
Error: ${parseError.message}`;
      console.error(errorMsg);
      throw new Error(errorMsg);
    }
  } catch (error) {
    console.error('Error processing voice command:', error);
    throw error;
  }
}

/**
 * Parse relative time expressions to ISO date strings
 */
function parseRelativeTime(timeExpression: string): string {
  const now = new Date();
  const lower = timeExpression.toLowerCase().trim();

  // Handle "today"
  if (lower.includes('today')) {
    return format(now, 'yyyy-MM-dd');
  }
  
  // Handle "tomorrow"
  if (lower.includes('tomorrow')) {
    return format(addDays(now, 1), 'yyyy-MM-dd');
  }
  
  // Handle "next week" or "second week"
  if (lower.includes('next week') || lower.includes('second week')) {
    return format(addWeeks(now, 1), 'yyyy-MM-dd');
  }
  
  // Handle "3rd week", "4th week", etc. (ordinal weeks)
  const ordinalWeekMatch = lower.match(/(\d+)(?:st|nd|rd|th)\s*week/);
  if (ordinalWeekMatch) {
    const weekNumber = parseInt(ordinalWeekMatch[1], 10);
    // Calculate weeks from now (1st week = next week, 2nd week = 2 weeks from now, etc.)
    const weeksToAdd = weekNumber; // 1st week = 1 week, 3rd week = 3 weeks
    return format(addWeeks(now, weeksToAdd), 'yyyy-MM-dd');
  }
  
  // Handle "in X weeks" or "X weeks from now"
  const weeksMatch = lower.match(/(\d+)\s*weeks?/);
  if (weeksMatch) {
    const weeks = parseInt(weeksMatch[1], 10);
    return format(addWeeks(now, weeks), 'yyyy-MM-dd');
  }
  
  // Handle "next month"
  if (lower.includes('next month')) {
    return format(addMonths(now, 1), 'yyyy-MM-dd');
  }
  
  // Handle "X months" or "X months from now"
  const monthsMatch = lower.match(/(\d+)\s*months?/);
  if (monthsMatch) {
    const months = parseInt(monthsMatch[1], 10);
    return format(addMonths(now, months), 'yyyy-MM-dd');
  }
  
  // Handle specific day names (e.g., "Monday", "next Monday")
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  for (let i = 0; i < dayNames.length; i++) {
    if (lower.includes(dayNames[i])) {
      const targetDay = i;
      const currentDay = now.getDay();
      let daysToAdd = targetDay - currentDay;
      
      // If "next" is mentioned, add 7 days
      if (lower.includes('next')) {
        daysToAdd += 7;
      } else if (daysToAdd <= 0) {
        // If the day has passed this week, go to next week
        daysToAdd += 7;
      }
      
      return format(addDays(now, daysToAdd), 'yyyy-MM-dd');
    }
  }
  
  // Handle "in X days" or "X days from now"
  const daysMatch = lower.match(/(\d+)\s*days?/);
  if (daysMatch) {
    const days = parseInt(daysMatch[1], 10);
    return format(addDays(now, days), 'yyyy-MM-dd');
  }
  
  // Handle date formats like "December 15", "Dec 15", "12/15", etc.
  // Try to parse as a date string
  try {
    // Check if it looks like a date (contains numbers and possibly month names)
    if (/\d/.test(timeExpression)) {
      const parsedDate = new Date(timeExpression);
      if (!isNaN(parsedDate.getTime())) {
        return format(parsedDate, 'yyyy-MM-dd');
      }
    }
  } catch (e) {
    // Ignore parsing errors
  }

  // If we can't parse it, return as-is (might be an ISO date already)
  return timeExpression;
}

