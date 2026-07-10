export function downloadJson(data: any, filename: string) {
  const dataStr = JSON.stringify(data, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  downloadBlob(blob, filename);
}

export function downloadText(text: string, filename: string) {
  const blob = new Blob([text], { type: "text/plain" });
  downloadBlob(blob, filename);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const linkElement = document.createElement('a');
  linkElement.href = url;
  linkElement.download = filename;
  document.body.appendChild(linkElement);
  linkElement.click();
  document.body.removeChild(linkElement);
  URL.revokeObjectURL(url);
}
