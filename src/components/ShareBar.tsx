import { useState } from "react";

const SHARE_TEXT =
  "Bike lanes on Bloor Street West. Ontario's files, the City's numbers, and a before/after map.";

const CANONICAL = "https://bloor-west-bike-lanes.vercel.app/";

function shareUrl(): string {
  if (typeof window === "undefined") return CANONICAL;
  const host = window.location.hostname;
  if (host === "localhost" || host === "127.0.0.1") return CANONICAL;
  return window.location.href.split("#")[0] || CANONICAL;
}

/**
 * End-of-story share: native sheet when the browser has it, else X / LinkedIn / copy.
 */
export function ShareBar() {
  const [copied, setCopied] = useState(false);

  const open = (href: string) => {
    window.open(href, "_blank", "noopener,noreferrer");
  };

  const onNative = async () => {
    const url = shareUrl();
    if (navigator.share) {
      try {
        await navigator.share({ title: document.title, text: SHARE_TEXT, url });
        return;
      } catch {
        /* dismissed */
      }
    }
  };

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const onX = () => {
    const url = shareUrl();
    open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(SHARE_TEXT)}&url=${encodeURIComponent(url)}`,
    );
  };

  const onLinkedIn = () => {
    open(
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl())}`,
    );
  };

  const canNative =
    typeof navigator !== "undefined" && typeof navigator.share === "function";

  return (
    <div className="share-bar">
      <span className="share-label">Share</span>
      {canNative ? (
        <button type="button" className="share-btn" onClick={onNative}>
          Share…
        </button>
      ) : null}
      <button type="button" className="share-btn" onClick={onX}>
        X
      </button>
      <button type="button" className="share-btn" onClick={onLinkedIn}>
        LinkedIn
      </button>
      <button type="button" className="share-btn" onClick={onCopy}>
        {copied ? "Copied" : "Copy link"}
      </button>
    </div>
  );
}
