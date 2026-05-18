import type { BannerPlacement } from "@/types/domain";

export type MockBanner = {
  imageUrl: string;
  targetUrl: string;
  label: string;
  width: number;
  height: number;
  deviceClass: string;
};

/**
 * Centralizovani mock/placeholder baneri.
 * Prikazuju se samo kada nema aktivnog banera u bazi za datu poziciju.
 * Koristimo picsum.photos sa seed-om radi konzistentnog vizualnog izgleda.
 */
const MOCK_BANNERS: Record<BannerPlacement, MockBanner> = {
  homepage_hero: {
    imageUrl: "https://picsum.photos/seed/imaposla-hero/1200/280",
    targetUrl: "/za-firme",
    label: "1200×280",
    width: 1200,
    height: 280,
    deviceClass: "",
  },
  homepage_top: {
    imageUrl: "https://picsum.photos/seed/imaposla-home-top/970/250",
    targetUrl: "/za-firme",
    label: "970×250",
    width: 970,
    height: 250,
    deviceClass: "",
  },
  homepage_middle: {
    imageUrl: "https://picsum.photos/seed/imaposla-home-mid/728/90",
    targetUrl: "/za-firme",
    label: "728×90",
    width: 728,
    height: 90,
    deviceClass: "",
  },
  homepage_bottom: {
    imageUrl: "https://picsum.photos/seed/imaposla-home-bot/970/90",
    targetUrl: "/za-firme",
    label: "970×90",
    width: 970,
    height: 90,
    deviceClass: "",
  },
  jobs_list_top: {
    imageUrl: "https://picsum.photos/seed/imaposla-jobs-top/728/90",
    targetUrl: "/za-firme",
    label: "728×90",
    width: 728,
    height: 90,
    deviceClass: "",
  },
  jobs_list_middle: {
    imageUrl: "https://picsum.photos/seed/imaposla-jobs-mid/300/250",
    targetUrl: "/za-firme",
    label: "300×250",
    width: 300,
    height: 250,
    deviceClass: "",
  },
  jobs_list_bottom: {
    imageUrl: "https://picsum.photos/seed/imaposla-jobs-bot/728/90",
    targetUrl: "/za-firme",
    label: "728×90",
    width: 728,
    height: 90,
    deviceClass: "",
  },
  job_detail_top: {
    imageUrl: "https://picsum.photos/seed/imaposla-job-dtop/728/90",
    targetUrl: "/za-firme",
    label: "728×90",
    width: 728,
    height: 90,
    deviceClass: "",
  },
  job_detail_bottom: {
    imageUrl: "https://picsum.photos/seed/imaposla-job-dbot/300/250",
    targetUrl: "/za-firme",
    label: "300×250",
    width: 300,
    height: 250,
    deviceClass: "",
  },
  company_pages_top: {
    imageUrl: "https://picsum.photos/seed/imaposla-co-top/970/90",
    targetUrl: "/za-firme",
    label: "970×90",
    width: 970,
    height: 90,
    deviceClass: "",
  },
  company_pages_bottom: {
    imageUrl: "https://picsum.photos/seed/imaposla-co-bot/728/90",
    targetUrl: "/za-firme",
    label: "728×90",
    width: 728,
    height: 90,
    deviceClass: "",
  },
  city_page_top: {
    imageUrl: "https://picsum.photos/seed/imaposla-city-top/728/90",
    targetUrl: "/za-firme",
    label: "728×90",
    width: 728,
    height: 90,
    deviceClass: "",
  },
  category_page_top: {
    imageUrl: "https://picsum.photos/seed/imaposla-cat-top/728/90",
    targetUrl: "/za-firme",
    label: "728×90",
    width: 728,
    height: 90,
    deviceClass: "",
  },
  footer_banner: {
    imageUrl: "https://picsum.photos/seed/imaposla-footer/970/90",
    targetUrl: "/za-firme",
    label: "970×90",
    width: 970,
    height: 90,
    deviceClass: "",
  },
  jobs_left_tower: {
    imageUrl: "https://picsum.photos/seed/imaposla-tower-left/160/600",
    targetUrl: "/za-firme",
    label: "160×600",
    width: 160,
    height: 600,
    deviceClass: "ad-desktop",
  },
  jobs_right_tower: {
    imageUrl: "https://picsum.photos/seed/imaposla-tower-right/160/600",
    targetUrl: "/za-firme",
    label: "160×600",
    width: 160,
    height: 600,
    deviceClass: "ad-desktop",
  },
};

export function getMockBanner(placement: BannerPlacement): MockBanner {
  return MOCK_BANNERS[placement] ?? MOCK_BANNERS.homepage_top;
}
