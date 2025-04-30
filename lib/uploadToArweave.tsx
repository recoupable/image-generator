export type ArweaveUploadResponse = {
  id: string;
  uri: string;
};

export const uploadFile = async (
  file: File
): Promise<ArweaveUploadResponse> => {
  try {
    const data = new FormData();
    data.set("file", file);

    const res = await fetch("/api/upload", {
      method: "POST",
      body: data,
    });

    const json = await res.json();

    if (!json.success) {
      throw new Error(json.error || "Upload failed");
    }

    return {
      id: json.id,
      uri: json.url,
    };
  } catch (error) {
    console.error("Arweave upload failed:", error);
    throw error;
  }
};

export const uploadBase64Image = async (
  base64Data: string,
  mimeType: string = "image/png"
): Promise<ArweaveUploadResponse> => {
  try {
    // Extract the actual base64 data if it's a data URL
    const base64Content = base64Data.includes("base64,")
      ? base64Data.split("base64,")[1]
      : base64Data;

    // Send to our API
    const res = await fetch("/api/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        base64: base64Content,
        mimeType,
        filename: "generated-image.png",
      }),
    });

    const json = await res.json();

    if (!json.success) {
      throw new Error(json.error || "Upload failed");
    }

    return {
      id: json.id,
      uri: json.url,
    };
  } catch (error) {
    console.error("Arweave base64 upload failed:", error);
    throw error;
  }
};
