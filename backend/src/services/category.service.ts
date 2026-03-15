import Category from '../models/category.model';
import { NotFoundError, ConflictError } from '../errors/app-error';
import slugify from 'slugify';

class CategoryService {
  async getAll() {
    return Category.find({ isActive: true }).sort({ name: 1 }).lean();
  }

  async getAllAdmin() {
    return Category.find().sort({ name: 1 }).lean();
  }

  async getBySlug(slug: string) {
    const category = await Category.findOne({ slug, isActive: true }).lean();
    if (!category) throw new NotFoundError('Category');
    return category;
  }

  async create(data: { name: string; image: string; description?: string }) {
    const slug = slugify(data.name, { lower: true, strict: true });
    const existing = await Category.findOne({ slug });
    if (existing) throw new ConflictError('Category already exists');

    return Category.create({ ...data, slug });
  }

  async update(id: string, data: Partial<{ name: string; image: string; description: string; isActive: boolean }>) {
    if (data.name) {
      (data as any).slug = slugify(data.name, { lower: true, strict: true });
    }
    const category = await Category.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
    if (!category) throw new NotFoundError('Category');
    return category;
  }

  async delete(id: string) {
    const category = await Category.findByIdAndDelete(id);
    if (!category) throw new NotFoundError('Category');
    return category;
  }
}

export default new CategoryService();
