import { getActiveBanner } from "@/lib/queries/banners";
import { supabaseUrl } from "@/lib/supabase/config";
import { BannerClickTracker } from "@/components/banner-click-tracker";
import type { BannerPlacement, BannerAudience } from "@/types/domain";

/**
 * Server komponenta — fetch + render aktivnog banera za datu lokaciju.
 * Ako nema banera, vraća null (nema prazan prostor u layout-u).
 *
 * Tracking impresije: trenutno NE radimo na svaki render (preskupo je za page loadove).
 * Tracking klikova: kroz <BannerClickTracker> klijent komponentu.
 *
 * `device` filter se radi kroz CSS klase (.ad-desktop, .ad-mobile) jer se SSR ne razlikuje
 * da bi server znao uređaj korisnika.
 */
export async function BannerSlot({
  placement,
  audience = "all",
  className = ""
}: {
  placement: BannerPlacement;
  audience?: BannerAudience;
  className?: string;
}) {
  const banner = await getActiveBanner(placement, audience);
  if (!banner || !banner.image_path) return null;

  const imageUrl = banner.image_path.startsWith("http")
    ? banner.image_path
    : `${supabaseUrl}/storage/v1/object/public/banners/${banner.image_path}`;

  const deviceClass = banner.device === "desktop" ? "ad-desktop" :
                      banner.device === "mobile" ? "ad-mobile" : "";

  const formatClass = banner.format ? `ad-format-${banner.format}` : "";

  // Wrapper sa svim potrebnim klasama
  const wrapperClass = ["ad-banner", deviceClass, formatClass, className].filter(Boolean).join(" ");

  const inner = (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={imageUrl}
      alt={banner.title}
      className="ad-banner-img"
      loading="lazy"
    />
  );

  return (
    <aside className={wrapperClass} aria-label="Reklamni banner">
      <span className="ad-label">Sponzorisano</span>
      {banner.target_url ? (
        <BannerClickTracker bannerId={banner.id} href={banner.target_url}>
          {inner}
        </BannerClickTracker>
      ) : (
        inner
      )}
    </aside>
  );
}
