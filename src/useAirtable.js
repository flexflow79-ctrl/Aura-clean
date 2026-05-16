// src/useAirtable.js
// Fetches all active listings from your Airtable "Businesses" table.
//
// Required Vercel environment variables (Settings → Environment Variables):
//   VITE_AIRTABLE_TOKEN    — Personal Access Token (starts with "pat")
//   VITE_AIRTABLE_BASE_ID  — Base ID (starts with "app")
//   VITE_AIRTABLE_TABLE    — Table name, exactly: Businesses
//
// After adding/changing env vars in Vercel you MUST click Redeploy.

import { useState, useEffect } from "react";

const TOKEN   = import.meta.env.VITE_AIRTABLE_TOKEN;
const BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID;
const TABLE   = import.meta.env.VITE_AIRTABLE_TABLE || "Businesses";

// ─── Field mapping ────────────────────────────────────────────────
// Maps your exact Airtable field names → internal app shape.
// Your Active field is a Checkbox. Airtable returns true when checked,
// and omits the field entirely when unchecked (not false — omitted).
// So we filter by Active === true, not Active !== false.
function transform(record) {
  const f = record.fields;
  return {
    id:         record.id,
    name:       f["Name"]       ?? "Unnamed",
    tagline:    f["Tagline"]    ?? "",
    category:   f["Category"]   ?? "",
    suburb:     f["Suburb"]     ?? "",
    rating:     parseFloat(f["Rating"])  || 0,
    reviews:    parseInt(f["Reviews"])   || 0,
    price:      f["Price"]      ?? "$$",
    // Tags is a Multiple Select in Airtable — always comes back as an array
    tags:       Array.isArray(f["Tags"]) ? f["Tags"] : [],
    phone:      f["Phone"]      ?? "",
    bookingUrl: f["Website"]    ?? "#",
    about:      f["About"]      ?? "",
    // "Next Available" field — you may not have this; defaults gracefully
    wait:       f["Next Available"] ?? "Call to book",
    featured:   f["Featured"]  === true,
    // Photo is an Attachment field — grab the first attachment's URL
    photo:      Array.isArray(f["Photo"]) ? (f["Photo"][0]?.url ?? null) : null,
  };
}

export function useAirtable() {
  const [listings, setListings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    // ── Credential check ────────────────────────────────────────
    if (!TOKEN) {
      console.error("[Aura] VITE_AIRTABLE_TOKEN is not set.");
      setError("VITE_AIRTABLE_TOKEN is missing.\n\nGo to Vercel → Your Project → Settings → Environment Variables, add it, then Redeploy.");
      setLoading(false);
      return;
    }
    if (!BASE_ID) {
      console.error("[Aura] VITE_AIRTABLE_BASE_ID is not set.");
      setError("VITE_AIRTABLE_BASE_ID is missing.\n\nGo to Vercel → Your Project → Settings → Environment Variables, add it, then Redeploy.");
      setLoading(false);
      return;
    }

    // Log what we're about to fetch so you can check in browser DevTools → Console
    console.log(`[Aura] Fetching from Airtable:
  Base: ${BASE_ID}
  Table: "${TABLE}"
  Token: ${TOKEN.slice(0, 8)}...`);

    let cancelled = false;

    async function fetchAll() {
      const allRecords = [];
      let offset = null;

      try {
        do {
          // We fetch ALL records and filter Active client-side.
          // This avoids issues where Airtable's filterByFormula
          // treats an unchecked Checkbox as "" instead of 0.
          const params = new URLSearchParams({
            pageSize: "100",
            "sort[0][field]": "Name",
            "sort[0][direction]": "asc",
          });
          if (offset) params.append("offset", offset);

          const url = `https://api.airtable.com/v0/${BASE_ID}/${encodeURIComponent(TABLE)}?${params}`;
          console.log(`[Aura] GET ${url.split("?")[0]} (page${offset ? " +offset" : " 1"})`);

          const res = await fetch(url, {
            headers: {
              Authorization: `Bearer ${TOKEN}`,
            },
          });

          if (!res.ok) {
            let msg = `Airtable API error ${res.status}`;
            try {
              const body = await res.json();
              msg = body?.error?.message ?? msg;
              console.error("[Aura] Airtable error response:", body);
            } catch (_) {}
            throw new Error(msg);
          }

          const data = await res.json();
          console.log(`[Aura] Page returned ${data.records.length} records.`);
          allRecords.push(...data.records);
          offset = data.offset ?? null;
        } while (offset);

        // Filter to only Active records client-side (checkbox === true)
        const active = allRecords.filter(r => r.fields["Active"] === true);
        console.log(`[Aura] Total records: ${allRecords.length} | Active: ${active.length}`);

        if (!cancelled) setListings(active.map(transform));

      } catch (e) {
        console.error("[Aura] Fetch failed:", e);
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAll();
    return () => { cancelled = true; };
  }, []);

  return { listings, loading, error };
}
