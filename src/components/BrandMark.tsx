type BrandMarkProps = {
  size?: "small" | "large";
};

export function BrandMark({ size = "small" }: BrandMarkProps) {
  return (
    <span className={`brand-mark ${size === "large" ? "large" : ""}`} aria-hidden="true">
      <svg viewBox="0 0 64 64" role="img" focusable="false">
        <path
          className="brand-mark-shadow"
          d="M32 4.8 55.2 17.6v28.8L32 59.2 8.8 46.4V17.6L32 4.8Z"
        />
        <path
          className="brand-mark-shell"
          d="M32 7.5 52.6 18.9v26.2L32 56.5 11.4 45.1V18.9L32 7.5Z"
        />
        <path className="brand-mark-core" d="M32 17.2a10.8 10.8 0 0 0-5.3 20.2v8.2h10.6v-8.2A10.8 10.8 0 0 0 32 17.2Z" />
        <path className="brand-mark-slot" d="M32 24.2a3.7 3.7 0 0 1 2.1 6.8v4.6h-4.2V31a3.7 3.7 0 0 1 2.1-6.8Z" />
        <path className="brand-mark-api" d="M18.9 28.4 16 31.2l2.9 2.8m26.2-5.6 2.9 2.8-2.9 2.8" />
      </svg>
    </span>
  );
}
