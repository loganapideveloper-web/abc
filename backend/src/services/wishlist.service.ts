import Wishlist from '../models/wishlist.model';
import Product from '../models/product.model';
import { NotFoundError, BadRequestError } from '../errors/app-error';

class WishlistService {
  async getAll(userId: string) {
    let wishlist = await Wishlist.findOne({ user: userId }).populate('items.product');
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: userId, items: [] });
    }
    return wishlist.items;
  }

  async add(userId: string, productId: string) {
    const product = await Product.findById(productId);
    if (!product) throw new NotFoundError('Product');

    let wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      wishlist = new Wishlist({ user: userId, items: [] });
    }

    const exists = wishlist.items.find(
      (item) => item.product.toString() === productId,
    );
    if (exists) {
      throw new BadRequestError('Product already in wishlist');
    }

    wishlist.items.push({ product: productId as any, addedAt: new Date() });
    await wishlist.save();

    const updated = await Wishlist.findById(wishlist._id).populate('items.product');
    const addedItem = updated!.items.find(
      (item) => item.product._id?.toString() === productId || (item.product as any)?.toString() === productId,
    );
    return addedItem;
  }

  async remove(userId: string, productId: string) {
    const wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) throw new NotFoundError('Wishlist');

    const index = wishlist.items.findIndex(
      (item) => item.product.toString() === productId,
    );
    if (index === -1) throw new NotFoundError('Wishlist item');

    wishlist.items.splice(index, 1);
    await wishlist.save();
  }

  async check(userId: string, productId: string) {
    const wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) return false;

    return wishlist.items.some(
      (item) => item.product.toString() === productId,
    );
  }
}

export default new WishlistService();
