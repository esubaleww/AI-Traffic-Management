// Thin fetch wrapper used by the REST calls (upload, report, health).
// No auth. The live stream uses WebSocket (see useTrafficStream), not this file.

import { endpoints } from "./endpoints";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function parseError(res: Response): Promise<string> {
  try {
    const data = await res.json();
    return typeof data?.detail === "string"
      ? data.detail
      : typeof data?.message === "string"
        ? data.message
        : JSON.stringify(data);
  } catch {
    try {
      return await res.text();
    } catch {
      return res.statusText;
    }
  }
}

export async function getHealth(): Promise<{ status: string }> {
  const res = await fetch(endpoints.health, { headers: { Accept: "application/json" } });
  if (!res.ok) throw new ApiError(res.status, await parseError(res));
  return res.json();
}

export async function uploadVideo(
  file: File,
  onProgress?: (percent: number) => void,
): Promise<{ id: string; url: string }> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", endpoints.uploadVideo);
    xhr.responseType = "json";

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const body = xhr.response ?? {};
        resolve({ id: String(body.id ?? body.video_id ?? "unknown"), url: String(body.url ?? "") });
      } else {
        let msg = xhr.statusText;
        try {
          const body = xhr.response;
          msg = body?.detail ?? body?.message ?? msg;
        } catch {
          /* ignore */
        }
        reject(new ApiError(xhr.status, msg || "Upload failed"));
      }
    };

    xhr.onerror = () => reject(new ApiError(0, "Network error during upload"));
    xhr.onabort = () => reject(new ApiError(0, "Upload aborted"));

    const form = new FormData();
    form.append("file", file);
    xhr.send(form);
  });
}

export async function generateReport(state: unknown): Promise<string> {
  const res = await fetch(endpoints.report, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ state }),
  });
  if (!res.ok) throw new ApiError(res.status, await parseError(res));
  const data = await res.json();
  // Accept { report: "..." } or a bare string.
  return typeof data === "string" ? data : String(data.report ?? data.text ?? "");
}
