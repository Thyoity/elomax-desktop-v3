// Ambient module declarations for npm packages that don't ship their own
// TypeScript types. This file is intentionally a SCRIPT (no top-level
// import/export) so `declare module 'X'` registers an ambient module
// instead of trying to augment a non-existent one.

declare module '@chenfengyuan/vue-countdown'
declare module 'vue-multiselect'
