import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useMediaQuery, usePrefersReducedMotion } from '../hooks/useEnvironment';
import { DashboardStage, HeroStage, IntelStage, VisionStage } from './StoryStages';

gsap.registerPlugin(ScrollTrigger);

export function Story() {
  const rootRef = useRef<HTMLElement | null>(null);
  const railFillRef = useRef<HTMLDivElement | null>(null);
  const railRef = useRef<HTMLDivElement | null>(null);
  const isMobile = useMediaQuery('(max-width: 820px)');
  const reduce = usePrefersReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const timeline = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: root,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.65,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (railFillRef.current) {
              railFillRef.current.style.transform = `scaleY(${self.progress})`;
            }
            if (railRef.current) {
              railRef.current.classList.toggle('on-light', self.progress < 0.55);
            }
          },
        },
      });

      if (isMobile) {
        timeline
          .to('.hero-globe', { scale: 1.14, yPercent: 5, duration: 0.16 }, 0)
          .to('.hero-copy', { yPercent: -8, duration: 0.14 }, 0.02)
          .to('.hero-foot', { autoAlpha: 0, duration: 0.06 }, 0.08)
          .to('.stage-hero', { autoAlpha: 0, duration: 0.04 }, 0.17)

          .to('.stage-vision', { autoAlpha: 1, duration: 0.04 }, 0.2)
          .fromTo(
            '.vision-panel',
            { autoAlpha: 0, scale: 0.76, y: 26 },
            { autoAlpha: 1, scale: 1, y: 0, stagger: 0.012, duration: 0.06 },
            0.21,
          )
          .to('.vision-panel', { autoAlpha: 0, scale: 1.16, y: -50, stagger: 0.01, duration: 0.06 }, 0.29)
          .fromTo(
            '.vision-word',
            { opacity: 0.08, filter: 'blur(8px)', y: 18 },
            { opacity: 1, filter: 'blur(0px)', y: 0, stagger: 0.007, duration: 0.06 },
            0.26,
          )
          .to('.stage-vision', { autoAlpha: 0, duration: 0.04 }, 0.54)

          .to('.stage-intel', { autoAlpha: 1, duration: 0.04 }, 0.57)
          .fromTo(
            '.intel-word',
            { opacity: 0.08, filter: 'blur(5px)' },
            { opacity: 1, filter: 'blur(0px)', stagger: 0.005, duration: 0.05 },
            0.58,
          )
          .fromTo('.intel-card', { y: 34, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.07 }, 0.58)
          .to('.intel-line', { strokeDashoffset: 0, duration: 0.12 }, 0.6)
          .to('.intel-area', { opacity: 1, duration: 0.08 }, 0.62)
          .fromTo(
            '.hotspot',
            { autoAlpha: 0, y: 12, scale: 0.92 },
            { autoAlpha: 1, y: 0, scale: 1, stagger: 0.016, duration: 0.05 },
            0.63,
          );
      } else {
        timeline
          .to('.hero-globe', { scale: 1.22, yPercent: 5, duration: 0.16 }, 0)
          .to('.hero-copy', { yPercent: -10, duration: 0.12 }, 0.02)
          .to('.hero-foot', { autoAlpha: 0, duration: 0.06 }, 0.06)
          .to('.stage-hero', { autoAlpha: 0, duration: 0.04 }, 0.13)

          .to('.stage-vision', { autoAlpha: 1, duration: 0.04 }, 0.145)
          .fromTo(
            '.vision-panel',
            { autoAlpha: 0, scale: 0.72, y: 34 },
            { autoAlpha: 1, scale: 1, y: 0, stagger: 0.014, duration: 0.06 },
            0.155,
          )
          .to('.vision-panel', { autoAlpha: 0, scale: 1.2, y: -70, stagger: 0.012, duration: 0.07 }, 0.235)
          .fromTo(
            '.vision-word',
            { opacity: 0.08, filter: 'blur(9px)', y: 22 },
            { opacity: 1, filter: 'blur(0px)', y: 0, stagger: 0.008, duration: 0.06 },
            0.215,
          )
          .to('.stage-vision', { autoAlpha: 0, duration: 0.04 }, 0.34)

          .to('.stage-intel', { autoAlpha: 1, duration: 0.04 }, 0.355)
          .fromTo(
            '.intel-word',
            { opacity: 0.08, filter: 'blur(5px)' },
            { opacity: 1, filter: 'blur(0px)', stagger: 0.006, duration: 0.05 },
            0.365,
          )
          .fromTo('.intel-card', { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.07 }, 0.365)
          .to('.intel-line', { strokeDashoffset: 0, duration: 0.11 }, 0.385)
          .to('.intel-area', { opacity: 1, duration: 0.08 }, 0.4)
          .fromTo(
            '.hotspot',
            { autoAlpha: 0, y: 14, scale: 0.9 },
            { autoAlpha: 1, y: 0, scale: 1, stagger: 0.018, duration: 0.05 },
            0.4,
          )
          .to('.stage-intel', { autoAlpha: 0, duration: 0.04 }, 0.525)

          .to('.stage-dashboard', { autoAlpha: 1, duration: 0.04 }, 0.545)
          .fromTo('.dash-card', { y: 55, autoAlpha: 0, scale: 0.98 }, { y: 0, autoAlpha: 1, scale: 1, duration: 0.09 }, 0.555)
          .fromTo('.feature-row', { autoAlpha: 0, x: 22 }, { autoAlpha: 1, x: 0, stagger: 0.012, duration: 0.06 }, 0.59)
          .to('.stage-dashboard', { autoAlpha: 0, duration: 0.03 }, 0.965);
      }
    }, root);

    return () => ctx.revert();
  }, [isMobile, reduce]);

  return (
    <section
      id="story"
      ref={rootRef}
      className={`story ${reduce ? 'is-static' : ''}`}
      aria-label="GMPX market experience"
    >
      <div className="story-stage">
        <HeroStage />
        <VisionStage />
        <IntelStage />
        {!isMobile && <DashboardStage />}

        {!isMobile && (
          <div className="story-rail on-light" ref={railRef} aria-hidden="true">
            <span className="story-rail-label">Market journey</span>
            <div className="story-rail-track">
              <div className="story-rail-fill" ref={railFillRef} />
              {[0, 33, 66, 100].map((top) => (
                <span key={top} className="story-rail-dot" style={{ top: `${top}%` }} />
              ))}
            </div>
            <span className="story-rail-label">01 — 04</span>
          </div>
        )}
      </div>
    </section>
  );
}
