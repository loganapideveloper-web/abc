import Banner from '../models/banner.model';
import { NotFoundError } from '../errors/app-error';

class BannerService {
  async getAll() {
    return Banner.find({ isActive: true }).sort({ order: 1 }).lean();
  }

  async getAllAdmin() {
    return Banner.find().sort({ order: 1 }).lean();
  }

  async create(data: { title: string; subtitle?: string; image: string; link?: string; order?: number }) {
    return Banner.create(data);
  }

  async update(id: string, data: Partial<{ title: string; subtitle: string; image: string; link: string; isActive: boolean; order: number }>) {
    const banner = await Banner.findByIdAndUpdate(id, { $set: data }, { new: true, runValidators: true });
    if (!banner) throw new NotFoundError('Banner');
    return banner;
  }

  async toggleActive(id: string, isActive: boolean) {
    const banner = await Banner.findByIdAndUpdate(id, { $set: { isActive } }, { new: true });
    if (!banner) throw new NotFoundError('Banner');
    return banner;
  }

  async delete(id: string) {
    const banner = await Banner.findByIdAndDelete(id);
    if (!banner) throw new NotFoundError('Banner');
    return banner;
  }
}

export default new BannerService();
