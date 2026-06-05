import { useState, useEffect, useRef } from "react";

const FX_API = "https://api.mrhost.asia/api/v1/gpay/fx-rates";
const CACHE_TTL = 10 * 60 * 1000; // 10 min

let globalFxCache = null;
let globalFxCacheTime = 0;

export function useFxRates() {
  const [rates, setRates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    async function load() {
      const now = Date.now();
      if (globalFxCache && now - globalFxCacheTime < CACHE_TTL) {
        if (mountedRef.current) { setRates(globalFxCache); setLoading(false); }
        return;
      }

      try {
        const res = await fetch(FX_API, { credentials: "omit" });
        if (!res.ok) throw new Error(`status ${res.status}`);
        const data = await res.json();
        globalFxCache = data.rates || {};
        globalFxCacheTime = now;
        if (mountedRef.current) { setRates(globalFxCache); setError(null); }
      } catch (e) {
        if (mountedRef.current) setError(String(e?.message || e));
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    }
    load();
  }, []);

  return { rates, loading, error };
}

export function priceInCurrency(usdAmount, currencyCode, ratesObj) {
  if (!ratesObj?.[currencyCode]) return null;
  const rate = parseFloat(ratesObj[currencyCode].market_rate || "1");
  if (!Number.isFinite(rate)) return null;
  return usdAmount * rate;
}

export function formatPrice(value, currencyCode) {
  if (!Number.isFinite(value)) return "—";
  if (currencyCode === "VND") {
    return value.toLocaleString("en-US", { maximumFractionDigits: 0 });
  }
  return value.toLocaleString("en-US", { maximumFractionDigits: 2 });
}

export function gbtAmount(usdPrice) {
  return Math.ceil(usdPrice * 15 * 100 / 100); // 15% of USD × 100 GBT/USD
}
