import React from "react";

export default function OptimizedImage({ src, alt, className, width, height }) {
  return (
    <img
      src={src}
      alt={alt || "Image"}
      loading="lazy"
      decoding="async"
      className={className}
      width={width}
      height={height}
    />
  );
}
