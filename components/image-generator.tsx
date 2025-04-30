"use client";

import type React from "react";
import { useState } from "react";
import { Loader2, ImageIcon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";

export function ImageGenerator() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to generate image");
      }
      const { image } = data;
      setGeneratedImage(`data:${image.mimeType};base64,${image.base64Data}`);
    } catch (err) {
      console.error("Error details:", err);
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";

      // More specific error messages based on common issues
      if (errorMessage.includes("API key")) {
        setError(
          "OpenAI API key is missing or invalid. Please check your environment variables."
        );
      } else if (errorMessage.includes("content policy")) {
        setError(
          "Your prompt may violate content policy. Please try a different prompt."
        );
      } else if (errorMessage.includes("rate limit")) {
        setError("Rate limit exceeded. Please try again later.");
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (prompt.trim()) {
        handleSubmit(e as unknown as React.FormEvent);
      }
    }
  };

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="prompt">Prompt</Label>
          <Textarea
            id="prompt"
            placeholder="A salamander at sunrise in a forest pond in the Seychelles..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            className="min-h-24"
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isGenerating || !prompt.trim()}
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Image
            </>
          )}
        </Button>
      </form>

      {error && (
        <div className="p-4 text-sm text-red-500 bg-red-50 rounded-md">
          <p className="font-medium">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {generatedImage && (
        <Card>
          <CardContent className="p-2">
            <div className="relative aspect-square max-h-[600px] w-full overflow-hidden rounded-md">
              <Image
                src={generatedImage || "/placeholder.svg"}
                alt={prompt}
                fill
                className="object-contain"
                priority
              />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
