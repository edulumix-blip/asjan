/**
 * Shared hero for hub pages (Jobs-style): full-width image, left text scrim, optional stat card.
 */
export default function ListingPageHero({
  imageUrl,
  objectPositionClass = 'object-[center_30%] sm:object-right',
  eyebrow,
  title,
  description,
  stat,
  statLoading = false,
}) {
  const StatIcon = stat?.Icon;

  return (
    <section className="relative min-h-[200px] sm:min-h-[240px] overflow-hidden mb-6">
      <div className="absolute inset-0">
        <img
          src={imageUrl}
          alt=""
          className={`h-full w-full object-cover ${objectPositionClass}`}
          loading="eager"
          decoding="async"
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(90deg, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.72) 28%, rgba(0,0,0,0.38) 48%, rgba(0,0,0,0.08) 68%, transparent 82%)',
          }}
          aria-hidden
        />
      </div>
      <div className="relative z-10 px-6 py-6 sm:px-8 sm:py-8 lg:py-10">
        <div className="max-w-3xl">
          {eyebrow}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white font-display tracking-tight mb-2 drop-shadow-md [text-shadow:0_2px_24px_rgba(0,0,0,0.55)]">
            {title}
          </h1>
          <p className="text-white/95 text-xs sm:text-sm leading-relaxed mb-4 max-w-2xl [text-shadow:0_1px_16px_rgba(0,0,0,0.45)]">
            {description}
          </p>
          {stat && StatIcon && (
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-3 rounded-2xl bg-black/35 backdrop-blur-md border border-white/20 px-4 py-2.5 min-w-[180px] shadow-lg shadow-black/30">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/15">
                  <StatIcon className="w-4.5 h-4.5 text-white" />
                </div>
                <div>
                  <p className="text-[10px] text-white/80 uppercase tracking-wide font-medium">{stat.label}</p>
                  <p className="text-xl font-bold text-white tabular-nums">
                    {statLoading ? '—' : stat.value}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
