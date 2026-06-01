import { NextResponse } from "next/server";
import { readFileSync } from "fs";
import { join } from "path";

export async function GET() {
  try {
    const filePath = join(
      process.cwd(),
      "public",
      ".well-known",
      "apple-developer-merchantid-domain-association"
    );
    const fileContent = readFileSync(filePath);

    return new NextResponse(fileContent, {
      status: 200,
      headers: {
        "Content-Type":  "application/octet-stream",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("[apple-pay-domain] file read error:", error);
    return new NextResponse("Not found", { status: 404 });
  }
}
