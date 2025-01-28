import { useEffect, useRef, useState } from "react";

interface EmbedFormPreviewProps {
  formId: number;
  previewMode?: boolean;
}

export default function EmbedFormPreview({ formId, previewMode = false }: EmbedFormPreviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;

    // Reset iframe content
    iframe.srcdoc = `
      <html>
        <body>
          <div id="quick-form-${formId}"></div>
          <script src="/api/embed/${formId}/js" async defer onload="window.parent.postMessage('loaded', '*')"></script>
        </body>
      </html>
    `;

    // Listen for load message from iframe
    const handleMessage = (event: MessageEvent) => {
      if (event.data === 'loaded') {
        setIsLoading(false);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [formId]);

  return (
    <div className={`w-full ${previewMode ? "border-2 border-dashed border-gray-300 rounded-lg p-4" : ""}`}>
      {isLoading && (
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      )}
      <iframe
        ref={iframeRef}
        className="w-full min-h-[400px] border-0"
        title={`Form Preview ${formId}`}
      />
    </div>
  );
}
