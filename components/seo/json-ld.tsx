/**
 * Emits JSON-LD into the document.
 *
 * Rendered from a server component so the structured data is present in the
 * initial HTML. A crawler that does not execute JavaScript must still see it.
 */
export function JsonLd({ schema }: { schema: Record<string, unknown>[] }) {
  return (
    <>
      {schema.map((s, i) => (
        <script
          key={i}
          type="application/ld+json"
          // Content is authored by us in lib/schema.ts, never user input.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }}
        />
      ))}
    </>
  );
}
