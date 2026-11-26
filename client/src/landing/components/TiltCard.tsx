import { useRef, type PointerEvent, type ReactNode } from 'react';
import { useMediaQuery, usePrefersReducedMotion } from '../hooks/useEnvironment';

export function TiltCard({
  children,
  className = '',
  max = 5,
}: {
  children: ReactNode;
  className?: string;
  max?: number;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const frame = useRef(0);
  const coarse = useMediaQuery('(pointer: coarse)');
  const reduce = usePrefersReducedMotion();
  const enabled = !coarse && !reduce;

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;

    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      el.style.transform = `perspective(900px) rotateX(${(0.5 - y) * max * 2}deg) rotateY(${
        (x - 0.5) * max * 2
      }deg) scale3d(1.012,1.012,1)`;
      el.style.setProperty('--mx', `${x * 100}%`);
      el.style.setProperty('--my', `${y * 100}%`);
    });
  };

  const onPointerLeave = () => {
    const el = ref.current;
    if (!el) return;
    cancelAnimationFrame(frame.current);
    el.style.transition = 'transform .6s cubic-bezier(.2,.7,.2,1)';
    el.style.transform = 'perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
    window.setTimeout(() => {
      if (el) el.style.transition = '';
    }, 620);
  };

  return (
    <div
      ref={ref}
      className={className}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      style={{ willChange: 'transform' }}
    >
      {children}
    </div>
  );
}
