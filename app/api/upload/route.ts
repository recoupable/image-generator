import { TurboFactory } from "@ardrive/turbo-sdk";
import { NextResponse } from "next/server";
import { Readable } from "node:stream";

if (!process.env.ARWEAVE_KEY) {
  throw new Error("ARWEAVE_KEY environment variable is not set");
}

const ARWEAVE_KEY = JSON.parse(
  Buffer.from(
    process.env.ARWEAVE_KEY.replace("ARWEAVE_KEY=", ""),
    "base64"
  ).toString()
);

export async function POST(request: Request) {
  try {
    // Check content type to determine if we're dealing with form data or JSON
    const contentType = request.headers.get("Content-Type") || "";

    let fileBuffer: Buffer;
    let fileName: string = "image.png";
    let fileType: string = "image/png";

    if (contentType.includes("multipart/form-data")) {
      // Handle form data with File object
      const formData = await request.formData();
      const file = formData.get("file") as File;

      if (!file) {
        throw new Error("No file provided");
      }

      fileBuffer = Buffer.from(await file.arrayBuffer());
      fileName = file.name;
      fileType = file.type || "application/octet-stream";
    } else {
      // Handle JSON with base64 data
      const { base64, mimeType, filename } = await request.json();

      if (!base64) {
        throw new Error("No base64 data provided");
      }

      fileBuffer = Buffer.from(base64, "base64");
      fileType = mimeType || "image/png";
      fileName = filename || "generated-image.png";
    }

    const fileSize = fileBuffer.length;

    const turbo = TurboFactory.authenticated({
      privateKey: ARWEAVE_KEY,
    });

    const [{ winc: fileSizeCost }] = await turbo.getUploadCosts({
      bytes: [fileSize],
    });

    const fileStreamFactory = () => Readable.from(fileBuffer);

    const { id, dataCaches } = await turbo.uploadFile({
      fileStreamFactory,
      fileSizeFactory: () => fileSize,
      dataItemOpts: {
        tags: [
          {
            name: "Content-Type",
            value: fileType,
          },
          {
            name: "File-Name",
            value: fileName,
          },
          {
            name: "App-Name",
            value: "Recoup-Chat",
          },
          {
            name: "Content-Type-Group",
            value: "image",
          },
        ],
      },
    });

    return NextResponse.json({
      success: true,
      id,
      dataCaches,
      cost: fileSizeCost,
      fileName,
      fileType,
      fileSize,
      url: `https://arweave.net/${id}`,
    });
  } catch (error) {
    console.error("Upload failed:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
