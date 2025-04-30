import { useState } from "react";

interface GenerateImageOptions {
  onSuccess?: (imageUrl: string, arweaveUrl?: string) => void;
  onError?: (error: string) => void;
}

interface GeneratedImageResponse {
  image: {
    base64Data: string;
    mimeType: string;
  };
  arweave?: {
    id: string;
    url: string;
  };
}

export function useGenerateImage(options?: GenerateImageOptions) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [arweaveUri, setArweaveUri] = useState<string | null>(null);

  const generateImage = async (prompt: string) => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setError(null);
    setArweaveUri(null);

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

      const { image, arweave } = data as GeneratedImageResponse;
      const imageDataUrl = `data:${image.mimeType};base64,${image.base64Data}`;

      setGeneratedImage(imageDataUrl);

      // Set Arweave URL if available
      if (arweave && arweave.url) {
        setArweaveUri(arweave.url);
      }

      // Call onSuccess callback if provided
      if (options?.onSuccess) {
        options.onSuccess(imageDataUrl, arweave?.url);
      }
    } catch (err) {
      console.error("Error details:", err);
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";

      // More specific error messages based on common issues
      let displayError = errorMessage;
      if (errorMessage.includes("API key")) {
        displayError =
          "OpenAI API key is missing or invalid. Please check your environment variables.";
      } else if (errorMessage.includes("content policy")) {
        displayError =
          "Your prompt may violate content policy. Please try a different prompt.";
      } else if (errorMessage.includes("rate limit")) {
        displayError = "Rate limit exceeded. Please try again later.";
      }

      setError(displayError);

      // Call onError callback if provided
      if (options?.onError) {
        options.onError(displayError);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const reset = () => {
    setGeneratedImage(null);
    setError(null);
    setArweaveUri(null);
  };

  return {
    generateImage,
    isGenerating,
    generatedImage,
    error,
    arweaveUri,
    reset,
  };
}
