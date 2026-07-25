import { useWishlist } from '../../contexts/WishlistContext';

interface WishlistButtonProps {
  productId: string;
  className?: string;
}

// Heart toggle — works for guests (localStorage) and syncs to the account
// when signed in. Stops propagation so it can sit on top of product links.
const WishlistButton = ({ productId, className = '' }: WishlistButtonProps) => {
  const { has, toggle } = useWishlist();
  const active = has(productId);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle(productId);
      }}
      aria-label={active ? 'Remove from wishlist' : 'Add to wishlist'}
      aria-pressed={active}
      className={`w-9 h-9 rounded-full bg-white/90 backdrop-blur-sm shadow-sm
        flex items-center justify-center transition-all duration-200
        hover:scale-110 active:scale-95 ${className}`}
    >
      <svg
        className={`w-4 h-4 transition-colors ${active ? 'text-ink' : 'text-muted'}`}
        fill={active ? 'currentColor' : 'none'}
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={1.5}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  );
};

export default WishlistButton;
