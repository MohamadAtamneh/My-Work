interface PriceTagProps {
  price: number;
  salePrice?: number;
  large?: boolean;
}

// A product is on sale when 0 < salePrice < price — the same rule the backend
// uses when computing order/payment totals.
export const isOnSale = (price: number, salePrice?: number): boolean =>
  typeof salePrice === 'number' && salePrice > 0 && salePrice < price;

// Shows the effective price; strikes through the original when on sale.
const PriceTag = ({ price, salePrice, large = false }: PriceTagProps) => {
  if (!isOnSale(price, salePrice)) {
    return (
      <span
        className={large ? 'text-2xl text-ink font-medium' : 'text-lg font-medium text-ink'}
        style={{ fontFamily: 'var(--font-body)' }}
      >
        ${price}
      </span>
    );
  }

  return (
    <span className="inline-flex items-baseline gap-2" style={{ fontFamily: 'var(--font-body)' }}>
      <span className={large ? 'text-2xl text-ink font-medium' : 'text-lg font-medium text-ink'}>
        ${salePrice}
      </span>
      <span className={`${large ? 'text-base' : 'text-sm'} text-muted line-through`}>
        ${price}
      </span>
    </span>
  );
};

export default PriceTag;
