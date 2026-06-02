import type { IncomingMessage, ServerResponse } from "http";
import formidable, { type File as FormidableFile } from "formidable";
import { readFileSync, unlinkSync } from "fs";

// Tell Vercel not to parse the request body — formidable does it
export const config = {
  api: { bodyParser: false },
};

// ─── Google OAuth token refresh ───────────────────────────────────────────────
async function getAccessToken(): Promise<string> {
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID ?? "",
      client_secret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN ?? "",
      grant_type: "refresh_token",
    }),
  });
  if (!res.ok) {
    throw new Error(`Token refresh HTTP ${res.status}`);
  }
  const data = (await res.json()) as { access_token?: string };
  if (!data.access_token) throw new Error("No access_token in token response");
  return data.access_token;
}

// ─── Upload file to Google Drive folder ───────────────────────────────────────
async function uploadToDrive(
  accessToken: string,
  buffer: Buffer,
  mimeType: string,
  filename: string,
  folderId: string,
): Promise<void> {
  const metadata = JSON.stringify({ name: filename, parents: [folderId] });
  const boundary = "drive_upload_boundary";
  const body = Buffer.concat([
    Buffer.from(
      `--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n--${boundary}\r\nContent-Type: ${mimeType}\r\n\r\n`,
    ),
    buffer,
    Buffer.from(`\r\n--${boundary}--`),
  ]);
  const res = await fetch(
    "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": `multipart/related; boundary=${boundary}`,
      },
      body,
    },
  );
  if (!res.ok) {
    console.log("[upload] Drive upload failed", await res.text());
    throw new Error(`Drive upload failed: ${res.status} ${await res.text()}`);
  }
}

// ─── Response helpers ─────────────────────────────────────────────────────────
function json(res: ServerResponse, status: number, body: unknown): void {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Content-Length": Buffer.byteLength(payload),
  });
  res.end(payload);
}

// ─── Handler ──────────────────────────────────────────────────────────────────
export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
): Promise<void> {
  // Only accept POST
  if (req.method !== "POST") {
    json(res, 405, { error: "Method not allowed" });
    return;
  }

  // Validate env vars are present
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN, GOOGLE_FOLDER_ID } =
    process.env;
  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET || !GOOGLE_REFRESH_TOKEN || !GOOGLE_FOLDER_ID) {
    json(res, 500, { error: "Server is not configured — contact the site owner" });
    return;
  }

  // Parse multipart body (max 50 MB per file)
  const form = formidable({ maxFileSize: 50 * 1024 * 1024, maxFiles: 1 });
  let files: Record<string, FormidableFile | FormidableFile[] | undefined>;

  try {
    [, files] = await form.parse(req);
  } catch {
    json(res, 400, { error: "Could not parse the uploaded file" });
    return;
  }

  const fileField = files["file"];
  const file: FormidableFile | undefined = Array.isArray(fileField)
    ? fileField[0]
    : fileField;

  if (!file) {
    json(res, 400, { error: "No file received" });
    return;
  }

  try {
    const accessToken = await getAccessToken();
    const buffer = readFileSync(file.filepath);
    const mimeType = file.mimetype ?? "image/jpeg";
    const filename = file.originalFilename ?? "photo.jpg";

    await uploadToDrive(accessToken, buffer, mimeType, filename, GOOGLE_FOLDER_ID);

    json(res, 200, { ok: true });
  } catch (err) {
    console.error("[upload]", err);
    json(res, 500, { error: err instanceof Error ? err.message : "Upload failed" });
  } finally {
    // Clean up the temp file formidable wrote to /tmp
    try {
      unlinkSync(file.filepath);
    } catch {
      // already cleaned up or never existed — ignore
    }
  }
}
