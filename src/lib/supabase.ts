/**
 * Supabase stub for offline mode.
 * The Supabase SDK has been removed. This stub exports a no-op object
 * so that any remaining pages/components that import it don't crash.
 * These pages (AuthPage, OnboardingModal, etc.) are effectively inert in offline mode.
 */

const noop = () => Promise.resolve({ data: null, error: null });
const noopObj = () => ({ data: null, error: null });

export const supabase = {
  auth: {
    getUser: noop,
    signInWithPassword: noop,
    signUp: noop,
    signOut: noop,
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
  },
  from: (_table: string) => ({
    select: () => ({ eq: () => ({ single: noop, then: noop }) }),
    insert: () => ({ select: () => ({ single: noop }) }),
    update: (_vals: any) => ({ eq: () => noop() }),
    upsert: noop,
    delete: () => ({ eq: () => noop() }),
  }),
  channel: (_name: string) => ({
    on: function() { return this; },
    subscribe: function() { return this; },
    unsubscribe: noop,
  }),
  removeChannel: noop,
};
