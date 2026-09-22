"use client";

import Image from "next/image";
import { ALL_CATEGORY_ITEMS, type CategoryInfo } from "./category-data";
import styles from "./category-sidebar.module.css";

interface CategorySidebarProps {
  selectedCategory: string;
  onSelectCategory: (categoryName: string) => void;
}

export function CategorySidebar({
  selectedCategory,
  onSelectCategory,
}: CategorySidebarProps) {
  return (
    <aside className={styles.filterContainer} aria-label="Categories" data-node-id="836:3699">
      <nav className={styles.categoryList} role="tablist" aria-orientation="vertical">
        {ALL_CATEGORY_ITEMS.map((item: CategoryInfo) => {
          const isSelected = selectedCategory === item.name;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              className={`${styles.shopCard} ${isSelected ? styles.shopCardActive : ""}`}
              onClick={() => onSelectCategory(item.name)}
              data-node-id="862:77851"
            >
              <div className={styles.imageContainer} data-node-id="862:77852">
                <div className={styles.thumbWrapper} data-node-id="862:77853">
                  <Image
                    src={item.image}
                    alt=""
                    width={40}
                    height={40}
                    className={styles.thumb}
                  />
                </div>
              </div>
              <span className={styles.label} data-node-id="862:77854">
                {item.name}
              </span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
