// src/useAirtable.js
// Fetches all listings from your Airtable "Businesses" table.
//
// Vercel environment variables required:
//   VITE_AIRTABLE_TOKEN    — Personal Access Token (starts with "pat")
//   VITE_AIRTABLE_BASE_ID  — Base ID (starts with "app")
//   VITE_AIRTABLE_TABLE    — Businesses

import { useState, useEffect } from "react";

const TOKEN   = import.meta.env.VITE_AIRTABLE_TOKEN;
const BASE_ID = import.meta.env.VITE_AIRTABLE_BASE_ID;
const TABLE   = import.meta.env.VITE_AIRTABLE_TABLE || "Businesses";

// ─── Field mapping ────────────────────────────────────────────────
// Maps your exact Airtable field names to the internal app shape.
// Every string field is trimmed to prevent whitespace mismatch bugs.
function transform(record) {
  const f = record.fields;

  // Helper: safely trim a string field
  const str = (v) => (typeof v === "string" ? v.trim() : (v ?? ""));

  return {
    id:         record.id,
    name:       str(f["Name"])     || "Unnamed",
    tagline:    str(f["Tagline"]),
    // IMPORTANT: trim category — "Makeup " !== "Makeup"
    category:   str(f["Category"]),
    suburb:     str(f["Suburb"]),
    rating:     parseFloat(f["Rating"])  || 0,
    reviews:    parseInt(f["Reviews"])   || 0,
    price:      str(f["Price"])    || "$$",
    // Tags: Multiple Select returns an array, or may be absent
    tags:       Array.isArray(f["Tags"]) ? f["Tags"].map(str) : [],
    phone:      str(f["Phone"]),
    bookingUrl: str(f["Website"])  || "#",
    about:      str(f["About"]),
    // "Next Available" is optional — default gracefully
    wait:       str(f["Next Available"]) || "Call to book",
    // Checkbox: Airtable sends true when checked, omits field when unchecked
    featured:   f["Featured"] === true,
    active:     f["Active"]   === true,
    // Attachment: grab the first image URL if present
    photo:      Array.isArray(f["Photo"]) ? (f["Photo"][0]?.url ?? null) : null,
  };
}

export function useAirtable() {
  const [listings, setListings] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState(null);

  useEffect(() => {
    // ── Missing credentials ──────────────────────────────────────
    if (!TOKEN || !BASE_ID) {
      const missing = !TOKEN ? "VITE_AIRTABLE_TOKEN" : "VITE_AIRTABLE_BASE_ID";
      console.error(`[Aura] ${missing} is not set.`);
      setError(`${missing} is missing.\n\nVercel → Project → Settings → Environment Variables → add it → Redeploy.`);
      setLoading(false);
      return;
    }

    console.log(`[Aura] Connecting to Airtable…
  Base ID : ${BASE_ID}
  Table   : "${TABLE}"
  Token   : ${TOKEN.slice(0, 10)}…`);

    let cancelled = false;

    async function fetchAll() {
      const allRecords = [];
      let offset = null;

      try {
        do {
          // Fetch all records — we filter Active client-side so Airtable
          // formula quirks with unchecked checkboxes can't hide records.
          const params = new URLSearchParams({
            pageSize: "100",
            "sort[0][field]": "Name",
            "sort[0][direction]": "asc",
          });
          if (offset) params.append("offset", offset);

          const url =
            `https://api.airtable.com/v0/${BASE_ID}/` +
            `${encodeURIComponent(TABLE)}?${params}`;

          const res = await fetch(url, {
            headers: { Authorization: `Bearer ${TOKEN}` },
          });

          if (!res.ok) {
            let msg = `Airtable API error ${res.status}`;
            try {
              const body = await res.json();
              msg = body?.error?.message ?? msg;
              console.error("[Aura] API error body:", body);
            } catch (_) {}
            throw new Error(msg);
          }

          const data = await res.json();
          allRecords.push(...data.records);
          offset = data.offset ?? null;

          console.log(
            `[Aura] Page fetched: ${data.records.length} records` +
            (offset ? " (more pages coming)" : " (last page)")
          );
        } while (offset);

        // Transform all records first so we can log the raw data
        const transformed = allRecords.map(transform);

        // Log every record name + active status so you can see what came back
        console.log("[Aura] All records from Airtable:");
        transformed.forEach(l =>
          console.log(`  ${l.active ? "✓" : "✗"} [${l.category}] ${l.name} (suburb: "${l.suburb}")`)
        );

        // Only show Active records in the app
        const active = transformed.filter(l => l.active);
        console.log(`[Aura] Total: ${transformed.length} | Active: ${active.length}`);

        if (active.length === 0 && transformed.length > 0) {
          console.warn(
            "[Aura] Records were fetched but NONE are marked Active. " +
            "Open Airtable and tick the 'Active' checkbox on each listing you want to show."
          );
        }

        if (!cancelled) setListings(active);
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
