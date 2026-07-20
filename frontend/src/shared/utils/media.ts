/** Keep media URLs usable when the API returns a relative Django media path. */
export function resolveMediaUrl(value: string | null | undefined): string | null {
  if (!value) return null;
  if (/^(data:|blob:|https?:\/\/)/i.test(value)) return value;

  const apiUrl = import.meta.env.VITE_API_URL as string | undefined;
  if (apiUrl && /^https?:\/\//i.test(apiUrl)) {
    return new URL(value, apiUrl).toString();
  }
  return value;
}
