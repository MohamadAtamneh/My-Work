const categories = [
  { id: 'all',         name: 'All'         },
  { id: 'men',         name: 'Men'         },
  { id: 'women',       name: 'Women'       },
  { id: 'accessories', name: 'Accessories' },
  { id: 'footwear',    name: 'Footwear'    },
];

interface CategoryFilterProps {
  selected?: string;
  onSelect?: (category: string) => void;
}

const CategoryFilter = ({ selected = 'all', onSelect }: CategoryFilterProps) => {
  return (
    <div className="flex flex-wrap gap-2 justify-center mb-10">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect?.(cat.id)}
          className="text-sm transition-all duration-200"
          style={{
            fontFamily   : 'var(--font-body)',
            padding      : '0.5rem 1.25rem',
            borderRadius : '9999px',
            border       : '1.5px solid',
            borderColor  : selected === cat.id ? '#000' : '#E5E5E5',
            background   : selected === cat.id ? '#000' : 'transparent',
            color        : selected === cat.id ? '#fff' : '#6F6F6F',
            cursor       : 'pointer',
          }}
        >
          {cat.name}
        </button>
      ))}
    </div>
  );
};

export default CategoryFilter;
