import Image from 'next/image';

export default function OptimizedImage({ src, alt, width, height, ...props }) {
  // For now, we'll use unoptimized for the logo since we don't have blur data
  // In production, you'd generate blur data URL
  return (
    <Image 
      src={src}
      alt={alt}
      width={width}
      height={height}
      style={{ objectFit: 'contain' }}
      {...props}
    />
  );
}