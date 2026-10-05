import { formatDate } from "@/lib/utils";

/**
 * Inscriptions par jour (une seule série) : barres fines aux extrémités arrondies,
 * écart de 2 px, valeur au survol, et tableau accessible équivalent.
 */
export function SignupsChart({ data }: { data: { day: Date; count: number }[] }) {
  const days: { day: Date; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    d.setUTCDate(d.getUTCDate() - i);
    days.push({ day: d, count: data.find((r) => new Date(r.day).toISOString().slice(0, 10) === d.toISOString().slice(0, 10))?.count ?? 0 });
  }
  const max = Math.max(1, ...days.map((d) => d.count));
  const total = days.reduce((s, d) => s + d.count, 0);
  return (
    <figure>
      <figcaption className="flex items-baseline justify-between">
        <span className="text-sm font-semibold text-ink">Inscriptions — 14 derniers jours</span>
        <span className="text-sm text-gray-500">{total} au total</span>
      </figcaption>
      <div className="mt-4 flex h-36 items-end gap-[2px] border-b border-gray-200" aria-hidden>
        {days.map((d) => (
          <div key={d.day.toISOString()} className="group relative flex h-full flex-1 items-end">
            <div className="w-full rounded-t-[4px] bg-primary transition group-hover:bg-primary-light" style={{ height: `${(d.count / max) * 100}%`, minHeight: d.count ? 2 : 0 }} />
            <span className="pointer-events-none absolute -top-7 left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-ink px-2 py-1 text-xs text-cream group-hover:block">
              {formatDate(d.day, { day: "numeric", month: "short" })} : {d.count}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[11px] text-gray-500" aria-hidden>
        <span>{formatDate(days[0]!.day, { day: "numeric", month: "short" })}</span>
        <span>{formatDate(days[13]!.day, { day: "numeric", month: "short" })}</span>
      </div>
      <table className="sr-only">
        <caption>Inscriptions par jour</caption>
        <tbody>
          {days.map((d) => (
            <tr key={d.day.toISOString()}>
              <th scope="row">{formatDate(d.day)}</th>
              <td>{d.count}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}
