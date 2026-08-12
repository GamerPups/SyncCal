import { z } from "zod";

export const ParsedScheduleSchema = z.object({
  title: z.string().min(1),
  start: z.string().datetime(),
  end: z.string().datetime(),
  location: z.string().optional(),
  description: z.string().optional(),
});

export type ParsedSchedule = z.infer<typeof ParsedScheduleSchema>;

const SYSTEM_PROMPT = `You are DuoCal's scheduling assistant. Parse natural language scheduling requests into structured JSON.

Return ONLY valid JSON with these fields:
- title: string (event title)
- start: ISO 8601 datetime string
- end: ISO 8601 datetime string (default to 1 hour after start if not specified)
- location: string (optional, extract from phrases like "at the office", "in Room 3")
- description: string (optional)

Current datetime for reference: ${new Date().toISOString()}

Examples:
Input: "Schedule a team meeting tomorrow at 2 PM at the office"
Output: {"title":"Team Meeting","start":"...","end":"...","location":"the office"}

Input: "Lunch with Sarah Friday noon downtown"
Output: {"title":"Lunch with Sarah","start":"...","end":"...","location":"downtown"}`;

export async function parseScheduleRequest(
  userMessage: string
): Promise<ParsedSchedule> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return parseScheduleFallback(userMessage);
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userMessage },
      ],
      temperature: 0.1,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    return parseScheduleFallback(userMessage);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) return parseScheduleFallback(userMessage);

  const parsed = ParsedScheduleSchema.safeParse(JSON.parse(content));
  if (!parsed.success) return parseScheduleFallback(userMessage);
  return parsed.data;
}

function parseScheduleFallback(userMessage: string): ParsedSchedule {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(14, 0, 0, 0);

  const end = new Date(tomorrow);
  end.setHours(15, 0, 0, 0);

  const locationMatch = userMessage.match(/\bat\s+(.+?)(?:\s*$|\.)/i);

  return {
    title: userMessage.replace(/\bat\s+.+$/i, "").trim() || "New Event",
    start: tomorrow.toISOString(),
    end: end.toISOString(),
    location: locationMatch?.[1]?.trim(),
  };
}
