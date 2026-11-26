import { useEffect, useRef, useState, type ReactNode } from 'react';

export function LazyMount({
  children,
  className = '',
  minHeight,
  rootMargin = '280px',
}: {
  children: ReactNode;
  className?: string;
  minHeight?: number | string;
  rootMargin?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setShow(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShow(true);
            observer.disconnect();
          }
        });
      },
      { rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div ref={ref} className={className} style={minHeight ? { minHeight } : undefined}>
      {show ? children : null}
    </div>
  );
}
