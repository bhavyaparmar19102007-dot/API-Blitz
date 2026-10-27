import React, { useState } from 'react';

interface Props extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallbackSrc?: string;
}

export default function ImageWithFallback({ src, fallbackSrc, alt, ...rest }: Props) {
  const [error, setError] = useState(false);

  const fallback = fallbackSrc || `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='400' viewBox='0 0 300 400'%3E%3Crect fill='%231a1f35' width='300' height='400'/%3E%3Ctext fill='%236b7280' font-family='system-ui' font-size='14' text-anchor='middle' x='150' y='205'%3ENo Image%3C/text%3E%3C/svg%3E`;

  return (
    <img
      src={error || !src ? fallback : src}
      alt={alt ?? ''}
      onError={() => setError(true)}
      loading="lazy"
      {...rest}
    />
  );
}
