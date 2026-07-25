interface StarRatingProps {
  value: number;
  className?: string;
}

// Read-only star display (0–5, rounded to the nearest whole star).
const StarRating = ({ value, className = 'w-3.5 h-3.5' }: StarRatingProps) => (
  <span
    className="inline-flex items-center gap-0.5"
    role="img"
    aria-label={`Rated ${value} out of 5`}
  >
    {[1, 2, 3, 4, 5].map((i) => (
      <svg
        key={i}
        className={`${className} ${i <= Math.round(value) ? 'text-ink' : 'text-border'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
        aria-hidden="true"
      >
        <path d="M10 1.5l2.6 5.3 5.9.9-4.25 4.14 1 5.86L10 14.9l-5.25 2.8 1-5.86L1.5 7.7l5.9-.9L10 1.5z" />
      </svg>
    ))}
  </span>
);

export default StarRating;
