/**
 * SWR Fetcher Helper
 * Provides a reusable fetcher function for SWR hooks
 * Handles request setup and error responses
 */

export async function fetcher<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    const error = new Error('Failed to fetch data');
    throw error;
  }

  return response.json();
}
