import Brand from '../models/brand.model';
import { NotFoundError, ConflictError } from '../errors/app-error';
import slugify from 'slugify';

class BrandService {
  async getAll() {
    return Brand.find({ isActive: true }).sort({ name: 1 }).lean();
  }

  async getAllAdmin() {
    return Brand.find().sort({ name: 1 }).lean();
  }

  async getBySlug(slug: string) {
    const brand = await Brand.findOne({ slug, isActive: true }).lean();
    if (!brand) throw new NotFoundError('Brand');
    return brand;
  }

  async create(data: { name: string; logo?: string; description?: string }) {
    const slug = slugify(data.name, { lower: true, strict: true });
    const existing = await Brand.findOne({ slug });
    if (existing) throw new ConflictError('Brand already exists');

    return Brand.create({ ...data, slug });
  }

  async update(id: string, data: Partial<{ name: string; logo: string; description: string; isActive: boolean }>) {
    if (data.name) {
      (data as any).slug = slugify(data.name, { lower: true, strict: true });
    }
    const brand = await Brand.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
    if (!brand) throw new NotFoundError('Brand');
    return brand;
  }

  async delete(id: string) {
    const brand = await Brand.findByIdAndDelete(id);
    if (!brand) throw new NotFoundError('Brand');
    return brand;
  }
}

export default new BrandService();
