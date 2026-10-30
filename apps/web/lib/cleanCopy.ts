// Clean copy rule (#185, JSB 19 Oct 2026): the final affidavit delivered to a customer must be
// saved with browser headers and footers off. Reject files that still carry LagosCoMiS page
// addresses or session details. This reads the raw bytes, so it catches text printed into the
// file by the browser; compressed PDF text may not be visible, so staff still check by eye.

const BLOCKED = ["lagoscomis", "sessionid", "session_id"];

export async function cleanCopyProblem(file: File): Promise<string | null> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let text = "";
  const chunk = 0x8000;
  for (let i = 0; i < bytes.length; i += chunk) {
    text += String.fromCharCode(...Array.from(bytes.subarray(i, i + chunk)));
  }
  const lower = text.toLowerCase();
  const hit = BLOCKED.find((word) => lower.includes(word));
  return hit
    ? `This file still contains "${hit}". Save the affidavit again with headers and footers turned off, then upload that copy.`
    : null;
}
