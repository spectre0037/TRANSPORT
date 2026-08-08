import { useMemo } from 'react';

const routes = [
  {
    title: 'GIKI -> Rawalpindi (26 No.)',
    subtitle: 'Via Faisal Movers 26 No. and Daewoo Express 26 No.',
    mapsUrl: 'https://www.google.com/maps/dir/?api=1&origin=GIKI+Topi&destination=Daewoo+Express+Rawalpindi+26+No&waypoints=Faisal+Movers+Rawalpindi+26+No',
    embedUrl: 'https://maps.google.com/maps?f=d&saddr=GIKI+Topi&daddr=Faisal+Movers+Rawalpindi+26+No+to:Daewoo+Express+Rawalpindi+26+No&output=embed',
  },
  {
    title: 'GIKI -> Islamabad G-9 Peshawar Morr',
    subtitle: 'Direct route to Islamabad G-9 Peshawar Morr Market',
    mapsUrl: 'https://www.google.com/maps/dir/?api=1&origin=GIKI+Topi&destination=Peshawar+Morr+Market+G-9+Islamabad',
    embedUrl: 'https://maps.google.com/maps?f=d&saddr=GIKI+Topi&daddr=Peshawar+Morr+Market+G-9+Islamabad&output=embed',
  },
  {
    title: 'GIKI -> Rawalpindi (via Hasan Abdal, Wah Cantt, Taxila)',
    subtitle: 'Hasan Abdal -> Wah Cantt -> Taxila -> Daewoo Rawalpindi 26 No.',
    mapsUrl: 'https://maps.app.goo.gl/YUXnNKCwdSSUgbBq6',
    embedUrl: 'https://maps.google.com/maps?f=d&saddr=GIKI+Topi&daddr=Hasan+Abdal+to:Wahcant,+bahtar+mor,+main+GT+Rd,+opposite+police+station,+Phase-I+Wah,+Pakistan+to:Total+PARCO+Petrol+Pump,+GT+ROAD+NEAR+KHANPUR+MOORE+%28islamabad+bound%29,+Taxila,+Taxila,+47080,+Pakistan+to:Daewoo+Express+Rawalpindi+26+No&output=embed',
  },
  {
    title: 'GIKI -> Abbottabad -> Mansehra',
    subtitle: 'Abbottabad Daewoo Express -> Niazi Express Terminal Mansehra',
    mapsUrl: 'https://www.google.com/maps/dir/?api=1&origin=GIKI+Topi&destination=Niazi+Express+Terminal+Mansehra&waypoints=Daewoo+Express+Abbottabad',
    embedUrl: 'https://maps.google.com/maps?f=d&saddr=GIKI+Topi&daddr=Daewoo+Express+Abbottabad+to:Niazi+Express+Terminal+Mansehra&output=embed',
  },
];

export default function MapsPage() {
  const mapCards = useMemo(() => routes, []);

  return (
    <main className="min-h-screen bg-clay-bg px-6 py-16 text-clay-text">
      <div className="mx-auto max-w-7xl space-y-10">
        <section className="text-center">
          <span className="clay-badge bg-clay-accent text-clay-primary">Route Maps</span>
          <h1 className="mt-4 font-display text-4xl font-extrabold text-clay-primary md:text-6xl">See Every Route Clearly</h1>
          <p className="mx-auto mt-4 max-w-3xl text-lg text-clay-text-muted">These maps show the exact route plan for each major destination. Click any map to open the selected route directly in Google Maps.</p>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          {mapCards.map((route) => (
            <article key={route.title} className="overflow-hidden rounded-clay-lg border border-clay-border bg-clay-surface shadow-clay-lg">
              <div className="aspect-video bg-clay-bg">
                <iframe title={route.title} src={route.embedUrl} className="h-full w-full" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
              </div>
              <div className="space-y-4 p-6">
                <div>
                  <h2 className="font-display text-2xl font-bold text-clay-primary">{route.title}</h2>
                  <p className="mt-2 text-sm text-clay-text-muted">{route.subtitle}</p>
                </div>
                <a href={route.mapsUrl} target="_blank" rel="noreferrer" className="clay-btn-primary inline-flex">Open Route in Google Maps</a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}