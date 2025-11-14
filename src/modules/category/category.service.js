import { CategoryModel } from './category.model.js';

export const CategoryService = {
  async getAllCategories() {
    const categories = await CategoryModel.findAll();
    
    // Format categories according to spec
    return categories.map((category) => ({
      id: `cat_${category.id}`,
      name: category.name,
      slug: category.name.toLowerCase().replace(/\s+/g, '-'),
      image: category.image || null,
      description: category.description || '',
      productCount: category._count.products,
    }));
  },
};


