const DOWNLOAD_MIME_TYPE = "text/plain;charset=utf-8";

export function downloadAsTxt(filename: string, content: string): void {
  const blob = new Blob([content], { type: DOWNLOAD_MIME_TYPE });
  const url = URL.createObjectURL(blob);

  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename.endsWith(".txt") ? filename : `${filename}.txt`;
  anchor.click();

  URL.revokeObjectURL(url);
}

export async function copyToClipboard(content: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(content);
    alert("복사되었습니다");
  } catch {
    alert("클립보드 복사에 실패했습니다. 브라우저 권한을 확인해 주세요.");
  }
}
