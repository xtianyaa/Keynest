import type { Category, CategoryId } from "../domain";
import { BrandMark } from "./BrandMark";

type SidebarProps = {
  categories: Category[];
  activeCategory: CategoryId;
  counts: Record<CategoryId, number>;
  onSelectCategory: (category: CategoryId) => void;
};

export function Sidebar({ categories, activeCategory, counts, onSelectCategory }: SidebarProps) {
  return (
    <aside className="sidebar" aria-label="保险库分类">
      <div className="vault-brand">
        <BrandMark />
        <div>
          <strong>Keynest</strong>
          <span>钥巢 · 本地保险库</span>
        </div>
      </div>

      <nav className="category-nav">
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            aria-label={category.label}
            className={category.id === activeCategory ? "active" : ""}
            onClick={() => onSelectCategory(category.id)}
          >
            <span>{category.label}</span>
            <small>{counts[category.id]}</small>
          </button>
        ))}
      </nav>
    </aside>
  );
}
