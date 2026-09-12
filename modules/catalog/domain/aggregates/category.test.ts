import { describe, expect, it } from 'vitest';
import { Category } from './category';

describe('Category aggregate', () => {
  it('creates category with valid name and slug', () => {
    const result = Category.create('cat-1', 'Electronics', 'electronics');
    expect(result.isSuccess).toBe(true);
    expect(result.getValue().getName()).toBe('Electronics');
  });

  it('rejects empty name', () => {
    const result = Category.create('cat-1', ' ', 'electronics');
    expect(result.isFailure).toBe(true);
    expect(result.getError().code).toBe('INVALID_CATEGORY');
  });

  it('rejects category as its own parent', () => {
    const category = Category.create('cat-1', 'Electronics', 'electronics').getValue();
    const result = category.changeParent('cat-1');
    expect(result.isFailure).toBe(true);
    expect(result.getError().code).toBe('CATEGORY_HIERARCHY_ERROR');
  });

  it('renames category', () => {
    const category = Category.create('cat-1', 'Electronics', 'electronics').getValue();
    const result = category.rename('Electronics & Gadgets');
    expect(result.isSuccess).toBe(true);
    expect(category.getName()).toBe('Electronics & Gadgets');
  });
});
