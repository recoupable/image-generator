"use client";

import { ImageGenerator } from "@/components/image-generator";
import { useMiniKit } from "@coinbase/onchainkit/minikit";
import { useEffect } from "react";

export default function Home() {
  const { setFrameReady, isFrameReady } = useMiniKit();

  // The setFrameReady() function is called when your mini-app is ready to be shown
  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 md:p-24">
      <div className="w-full max-w-3xl space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Base Image Generator
          </h1>
          <p className="text-muted-foreground">
            Enter a prompt and generate an image using AI and auto-published
            onchain with base
          </p>
        </div>
        <ImageGenerator />
      </div>
    </main>
  );
}
