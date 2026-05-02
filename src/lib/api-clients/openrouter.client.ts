import { env } from "@/lib/env";
import {
  OPENROUTER_BASE_URL,
  OPENROUTER_MODELS,
} from "@/constants/openrouter.constant";

/**
 * The API Client (Infrastructure Layer)
 * Job: Handle HTTP requests to OpenRouter.
 * Does NOT contain business logic or prompts.
 */
export async function sendChatWithImage(
  prompt: string,
  imageBase64: string,
  model = OPENROUTER_MODELS.GEMINI_FLASH,
) {
  if (!env.OPENROUTER_API_KEY) {
    throw new Error("Missing OpenRouter API Key");
  }

  const payload = {
    model,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          {
            type: "image_url",
            image_url: {
              url: imageBase64.startsWith("data:")
                ? imageBase64
                : `data:image/jpeg;base64,${imageBase64}`,
            },
          },
        ],
      },
    ],
  };

  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `OpenRouter API error: ${response.status} - ${errorText}`,
    );
  }

  const data = await response.json();
  console.log("Raw AI Response:", data);
  return data.choices[0].message.content;
}

/**
 * Send a text-only prompt to OpenRouter.
 */
export async function sendChatText(
  prompt: string,
  model = OPENROUTER_MODELS.GEMINI_FLASH,
) {
  if (!env.OPENROUTER_API_KEY) {
    throw new Error("Missing OpenRouter API Key");
  }

  const payload = {
    model,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "user",
        content: prompt,
      },
    ],
  };

  const response = await fetch(`${OPENROUTER_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.OPENROUTER_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `OpenRouter API error: ${response.status} - ${errorText}`,
    );
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
