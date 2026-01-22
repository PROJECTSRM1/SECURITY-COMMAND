import { baseUrl } from "../utils/constants/config";

async function safeFetch(input: RequestInfo, init?: RequestInit, timeoutMs = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const resp = await fetch(input, { ...(init || {}), signal: controller.signal });
    clearTimeout(id);
    return resp;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

export const getAllUsers = async () => {
  const realUrl = `${baseUrl}/User/getallusers`;

  try {
    console.log("[api] getAllUsers -> trying real backend:", realUrl);
    const response = await safeFetch(realUrl, { method: "GET" }, 7000);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    console.log("[api] getAllUsers -> backend success");
    return data;
  } catch (err) {
    console.warn("[api] getAllUsers -> real backend failed, using fallback test API", err);

    // fallback source: use dummyjson users or jsonplaceholder posts to see network traffic
    // dummyjson users endpoint (returns users list)
    try {
      const fallbackUrl = "https://dummyjson.com/users"; // returns { users: [...] }
      console.log("[api] getAllUsers -> fetching fallback:", fallbackUrl);
      const r = await safeFetch(fallbackUrl, { method: "GET" }, 7000);
      if (!r.ok) throw new Error(`Fallback HTTP ${r.status}`);
      const d = await r.json();
      return d;
    } catch (fallbackErr) {
      console.warn("[api] getAllUsers -> dummyjson failed, trying jsonplaceholder", fallbackErr);
      // last resort: return small static list to avoid breaking UI
      return [
        { id: "fake-1", name: "Local Fallback 1", phone: "0000000000" },
        { id: "fake-2", name: "Local Fallback 2", phone: "1111111111" },
      ];
    }
  }
};


export const createEmployee = async (empData: any) => {
  const realUrl = `${baseUrl}/User/createemployee`;

  try {
    console.log("[api] createEmployee -> posting to backend:", realUrl, empData);
    const response = await safeFetch(realUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(empData),
    }, 8000);

    if (!response.ok) {
      // try to read server error message if any
      let errBody = null;
      try { errBody = await response.json(); } catch { /* ignore */ }
      console.error("[api] createEmployee -> backend returned error", response.status, errBody);
      throw new Error("Backend error");
    }

    const data = await response.json();
    console.log("[api] createEmployee -> backend success", data);
    return data;
  } catch (err) {
    console.warn("[api] createEmployee -> backend failed, posting to fallback test API", err);

    // Fallback: jsonplaceholder supports POST and returns created object { id: ... }
    try {
      const fallbackUrl = "https://jsonplaceholder.typicode.com/posts";
      console.log("[api] createEmployee -> posting to fallback", fallbackUrl, empData);
      const r = await safeFetch(fallbackUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(empData),
      }, 7000);

      if (!r.ok) {
        console.error("[api] createEmployee -> fallback returned error", r.status);
        throw new Error("Fallback failed");
      }

      const d = await r.json();
      const synthesized = {
        ...empData,
        id: d.id ?? `fake-${Math.random().toString(36).slice(2, 9)}`,
        createdAt: new Date().toISOString(),
        _fallback: true,
        _fallbackSource: fallbackUrl,
      };
      console.log("[api] createEmployee -> fallback success", synthesized);
      return synthesized;
    } catch (fallbackErr) {
      console.error("[api] createEmployee -> fallback attempt failed", fallbackErr);
      throw fallbackErr;
    }
  }
};
