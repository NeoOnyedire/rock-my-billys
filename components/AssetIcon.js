export default function AssetIcon({ src, alt, size = 32, className = "" }) {
  return (
    <img
      src={`/assets/${src}`}
      alt={alt}
      width={size}
      height={size}
      className={`object-contain ${className}`}
    />
  );
}