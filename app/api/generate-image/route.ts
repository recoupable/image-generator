import { type NextRequest, NextResponse } from "next/server";
import { experimental_generateImage as generateImage } from "ai";
import { openai } from "@ai-sdk/openai";

export const runtime = "edge"; // Use edge runtime for better performance

export async function POST(req: NextRequest) {
  try {
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          message:
            "OpenAI API key is missing. Please add it to your environment variables.",
        },
        { status: 500 }
      );
    }

    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { message: "Prompt is required" },
        { status: 400 }
      );
    }

    // Fixed: Using the correct imported function name
    const { image } = await generateImage({
      model: openai.image("gpt-image-1"),
      prompt,
      providerOptions: {
        openai: { quality: "high" },
      },
    });

    return NextResponse.json({ image });
  } catch (error) {
    console.error("Error generating image:", error);

    // Ensure we always return a proper JSON response
    return NextResponse.json(
      {
        message: `Failed to generate image: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
        error: error instanceof Error ? error.toString() : "Unknown error",
      },
      { status: 500 }
    );
  }
}
