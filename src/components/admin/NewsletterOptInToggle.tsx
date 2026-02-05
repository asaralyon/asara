"use client";

import { useState } from "react";

export function NewsletterOptInToggle({
  userId,
  initialValue,
}: {
  userId: string;
  initialValue: boolean;
}) {
  const [value, setValue] = useState(initialValue);
  const [loading, setLoading] = useState(false);

  const onToggle = async () => {
    const next = !value;
    setLoading(true);

    const res = await fetch(`/api/admin/users/${userId}/newsletter`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ newsletterOptIn: next }),
    });

    setLoading(false);

    if (!res.ok) return;
    setValue(next);
  };

  return (
    <button
      type="button"
      onClick={onToggle}
      disabled={loading}
      className={`px-3 py-1 rounded-full text-xs font-medium border ${
        value
          ? "bg-green-50 text-green-700 border-green-200"
          : "bg-neutral-50 text-neutral-600 border-neutral-200"
      } ${loading ? "opacity-60 cursor-not-allowed" : "hover:opacity-80"}`}
      aria-label="Recevoir la newsletter"
      title="Recevoir la newsletter"
    >
      {value ? "Oui" : "Non"}
    </button>
  );
}
