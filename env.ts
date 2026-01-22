
// Credenciales del proyecto en Supabase
export const SUPABASE_URL = 'https://ajydapiorskausswbsat.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFqeWRhcGlvcnNrYXVzc3dic2F0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg5MjU0OTQsImV4cCI6MjA4NDUwMTQ5NH0.PDyBXqrhwlGxz-0JW0_L5ndc-7ye-6oK_uAm_Wf6U0E';

export const isConfigured = () => {
  return SUPABASE_URL && SUPABASE_ANON_KEY;
};
