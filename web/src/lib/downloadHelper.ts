/**
 * CodeThesis Universal Binary Downloader & Credit Sync Helper
 * Handles streaming binary downloads for DOCX, PPTX, and ZIP packages,
 * credit balance updates, and user notifications.
 */

export interface DownloadResult {
  success: boolean;
  filename?: string;
  remainingCredits?: number;
  error?: string;
}

export async function downloadAcademicFile(
  endpoint: string,
  payload: Record<string, any>,
  fallbackFilename: string
): Promise<DownloadResult> {
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (res.status === 402) {
      const errData = await res.json();
      const message = errData.error || 'Insufficient academic credits. Please upgrade or top up credits.';
      alert(`⚠️ ${message}`);
      return { success: false, error: message };
    }

    if (!res.ok) {
      let errorMessage = 'Failed to generate academic document.';
      try {
        const errData = await res.json();
        if (errData.error) errorMessage = errData.error;
      } catch {
        // Not a JSON error, keep default
      }
      alert(`❌ Error: ${errorMessage}`);
      return { success: false, error: errorMessage };
    }

    // Read remaining credits from response header and broadcast update
    const creditsHeader = res.headers.get('X-Remaining-Credits');
    let remainingCredits: number | undefined;
    if (creditsHeader) {
      remainingCredits = parseInt(creditsHeader, 10);
      if (typeof window !== 'undefined') {
        window.dispatchEvent(
          new CustomEvent('credits-updated', { detail: { credits: remainingCredits } })
        );
      }
    }

    // Extract filename from Content-Disposition header if available
    let filename = fallbackFilename;
    const disposition = res.headers.get('Content-Disposition');
    if (disposition && disposition.includes('filename=')) {
      const match = disposition.match(/filename=["']?([^"';]+)["']?/);
      if (match && match[1]) {
        filename = match[1];
      }
    }

    // Convert response to Blob and trigger immediate browser download
    const blob = await res.blob();
    const blobUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(blobUrl);

    return {
      success: true,
      filename,
      remainingCredits,
    };
  } catch (error: any) {
    console.error('Download error:', error);
    alert(`❌ Download failed: ${error.message || 'Network or server error'}`);
    return { success: false, error: error.message };
  }
}
