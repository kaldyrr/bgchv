export const API_ORIGIN = import.meta.env.VITE_API_ORIGIN || 'http://localhost:3000';
export const YJS_WS = API_ORIGIN.replace(/^http/, 'ws') + '/yjs';

