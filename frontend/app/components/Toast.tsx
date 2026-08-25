"use client";

import { XIcon } from "./Icons";

export function Toast({ message, error, onClose }: { message: string | null; error?: boolean; onClose: () => void }) {
  if (!message) return null;
  return <div className={`toast ${error ? "error" : "success"}`} role={error ? "alert" : "status"}><span>{message}</span><button type="button" onClick={onClose} aria-label="Dismiss notification"><XIcon /></button></div>;
}
