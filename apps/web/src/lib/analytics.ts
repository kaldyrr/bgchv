import { API_ORIGIN } from './config';

export async function track(type: string, path?: string, meta?: any) {
  try {
    await fetch(`${API_ORIGIN}/api/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, path, meta })
    });
  } catch (e) {
    // ignore errors in analytics
  }
}
