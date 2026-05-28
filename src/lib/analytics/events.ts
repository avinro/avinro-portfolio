import { getPosthog } from "./posthog";

export type CtaPosition =
  | "header"
  | "mobile_bar"
  | "mobile_overlay"
  | "hero_secondary"
  | "footer_link"
  | "next_case"
  | "next_work"
  | "prev_work";

export type WorkCardSource = "home_selected_work" | "work_listing";

export type ScrollThreshold = 25 | 50 | 75 | 100;

export type AppEvent =
  | {
      name: "cta_click";
      props: { label: string; href: string; position: CtaPosition; page: string };
    }
  | {
      name: "work_card_click";
      props: { slug: string; title: string; source: WorkCardSource };
    }
  | {
      name: "case_study_scroll";
      props: { slug: string; threshold: ScrollThreshold };
    }
  | { name: "calendly_modal_open"; props: { position: string } }
  | { name: "contact_menu_open"; props: { position: string } }
  | { name: "contact_email_click"; props: { position: string } }
  | { name: "ai_chat_open"; props: Record<string, never> }
  | { name: "ai_chat_message_sent"; props: { messageCount: number } };

export function track(event: AppEvent): void {
  try {
    const ph = getPosthog();
    if (!ph) return;
    ph.capture(event.name, event.props);
  } catch {}
}

export function trackCtaClick(props: {
  label: string;
  href: string;
  position: CtaPosition;
  page: string;
}): void {
  track({ name: "cta_click", props });
}

export function trackWorkCardClick(props: {
  slug: string;
  title: string;
  source: WorkCardSource;
}): void {
  track({ name: "work_card_click", props });
}

export function trackCaseStudyScroll(props: { slug: string; threshold: ScrollThreshold }): void {
  track({ name: "case_study_scroll", props });
}

export function trackCalendlyModalOpen(position: string): void {
  track({ name: "calendly_modal_open", props: { position } });
}

const _firedThresholds = new Map<string, Set<ScrollThreshold>>();

export function markThresholdFired(slug: string, threshold: ScrollThreshold): boolean {
  let set = _firedThresholds.get(slug);
  if (!set) {
    set = new Set<ScrollThreshold>();
    _firedThresholds.set(slug, set);
  }
  if (set.has(threshold)) return false;
  set.add(threshold);
  return true;
}

export function _resetFiredThresholds(): void {
  _firedThresholds.clear();
}
