"use client";

export default function NewsletterForm() {
  return (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="flex gap-2"
    >
      <input
        type="email"
        placeholder="you@example.com"
        className="w-56 rounded-md border border-border bg-background px-3 py-2 text-sm text-white placeholder:text-white/25 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
      />
      <button
        type="submit"
        className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
      >
        Subscribe
      </button>
    </form>
  );
}
