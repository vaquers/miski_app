import React, { useState, useRef, useEffect } from 'react';

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  /** When true, only set src when element is in view (Intersection Observer). */
  useIntersection?: boolean;
  /** Root margin for intersection (e.g. "200px" to load a bit before visible). */
  rootMargin?: string;
}

/**
 * Image that only loads when in viewport (for gallery grids).
 * Uses native loading="lazy" + optional Intersection Observer to set src only when visible,
 * reducing concurrent requests and speeding up first paint.
 */
export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  useIntersection = true,
  rootMargin = '200px',
  loading = 'lazy',
  decoding = 'async',
  alt = '',
  className = '',
  ...rest
}) => {
  const [inView, setInView] = useState(!useIntersection);
  const [imgSrc, setImgSrc] = useState<string | undefined>(useIntersection ? undefined : src);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!useIntersection || !src || inView) return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setInView(true);
          setImgSrc(src);
        }
      },
      { rootMargin, threshold: 0.01 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [useIntersection, src, rootMargin, inView]);

  if (useIntersection && !inView) {
    return (
      <div
        ref={ref}
        className={className}
        style={{
          width: '100%',
          height: '100%',
          background: 'rgba(255, 255, 255, 0.06)',
          display: 'block',
        }}
        aria-hidden
      />
    );
  }

  return (
    <img
      src={imgSrc}
      alt={alt}
      className={className}
      loading={loading}
      decoding={decoding}
      {...rest}
    />
  );
};
