"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export interface AddressResult {
  display_name: string;
  lat: number;
  lng: number;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (result: AddressResult) => void;
  placeholder?: string;
  className?: string;
  /** Neighborhood name auto-detected from the address */
  detectedNeighborhood?: string | null;
}

/**
 * Address autocomplete using OpenStreetMap Nominatim.
 * Searches are scoped to Tel Aviv-Yafo for relevant results.
 */
export default function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = "Type your address in Tel Aviv...",
  className = "",
  detectedNeighborhood,
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<AddressResult[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlightIdx, setHighlightIdx] = useState(-1);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const fetchSuggestions = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const searchQuery = `${query}, Tel Aviv`;
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&countrycodes=il&viewbox=34.73,32.13,34.82,32.03&bounded=1&limit=5&addressdetails=1`;
      const res = await fetch(url, {
        headers: { "Accept-Language": "en,he" },
      });
      if (!res.ok) throw new Error("Geocoding failed");

      const data = await res.json();
      const results: AddressResult[] = data.map(
        (item: { display_name: string; lat: string; lon: string }) => ({
          display_name: item.display_name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon),
        })
      );
      setSuggestions(results);
      setShowDropdown(results.length > 0);
      setHighlightIdx(-1);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    onChange(val);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchSuggestions(val), 300);
  }

  function handleSelect(result: AddressResult) {
    // Show a shorter version of the address in the input
    const short = result.display_name.split(",").slice(0, 2).join(",").trim();
    onChange(short);
    setShowDropdown(false);
    setSuggestions([]);
    onSelect(result);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (!showDropdown || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIdx((prev) => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIdx((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter" && highlightIdx >= 0) {
      e.preventDefault();
      handleSelect(suggestions[highlightIdx]);
    } else if (e.key === "Escape") {
      setShowDropdown(false);
    }
  }

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
        placeholder={placeholder}
        className={className}
        autoComplete="off"
      />
      {loading && (
        <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-brand-teal" />
        </div>
      )}

      {/* Detected neighborhood badge */}
      {detectedNeighborhood && (
        <div className="mt-1 text-xs text-brand-teal">
          Detected: <span className="font-medium">{detectedNeighborhood}</span>
        </div>
      )}

      {/* Suggestions dropdown */}
      {showDropdown && suggestions.length > 0 && (
        <ul className="absolute left-0 right-0 top-full z-50 mt-1 max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
          {suggestions.map((s, i) => (
            <li
              key={i}
              onMouseDown={() => handleSelect(s)}
              onMouseEnter={() => setHighlightIdx(i)}
              className={`cursor-pointer px-3 py-2 text-sm ${
                i === highlightIdx
                  ? "bg-brand-teal/10 text-brand-teal"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {s.display_name.split(",").slice(0, 3).join(",")}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
