/**
 * Embeddable support widget for client apps (WMG OS first).
 * Drop-in: mount SupportWidget with clientId + intake URL/secret.
 */
import { useState } from "react";

export type SupportWidgetProps = {
  clientId: string;
  intakeUrl: string;
  intakeSecret?: string;
  requesterName?: string;
  requesterEmail?: string;
  linkedAccount?: string;
};

export function SupportWidget(props: SupportWidgetProps) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit() {
    if (!message.trim()) return;
    setBusy(true);
    setStatus(null);
    try {
      const res = await fetch(props.intakeUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(props.intakeSecret ? { "x-intake-secret": props.intakeSecret } : {}),
        },
        body: JSON.stringify({
          client_id: props.clientId,
          source_channel: "widget",
          message: message.trim(),
          requester_name: props.requesterName,
          requester_email: props.requesterEmail,
          linked_account: props.linkedAccount,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Submit failed");
      setStatus("Request received. PRIME Support will follow up.");
      setMessage("");
    } catch (e) {
      setStatus(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ position: "fixed", right: 16, bottom: 16, zIndex: 9999, fontFamily: "system-ui" }}>
      {open && (
        <div
          style={{
            width: 320,
            marginBottom: 8,
            background: "#fff",
            border: "1px solid #cbd5e1",
            borderRadius: 12,
            padding: 12,
            boxShadow: "0 8px 24px rgba(0,0,0,.12)",
          }}
        >
          <strong style={{ fontSize: 14 }}>Contact PRIME Support</strong>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe your issue…"
            rows={5}
            style={{ width: "100%", marginTop: 8, fontSize: 13 }}
          />
          {status && <p style={{ fontSize: 12, color: "#334155" }}>{status}</p>}
          <button
            type="button"
            disabled={busy}
            onClick={() => void submit()}
            style={{
              marginTop: 8,
              background: "#0f172a",
              color: "#fff",
              border: 0,
              borderRadius: 8,
              padding: "8px 12px",
              fontSize: 13,
            }}
          >
            {busy ? "Sending…" : "Send"}
          </button>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          background: "#0f172a",
          color: "#fff",
          border: 0,
          borderRadius: 999,
          padding: "10px 14px",
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        {open ? "Close" : "Support"}
      </button>
    </div>
  );
}

export default SupportWidget;
