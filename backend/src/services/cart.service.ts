import Cart from '../models/cart.model';
import Product from '../models/product.model';
import Coupon from '../models/coupon.model';
import { NotFoundError, BadRequestError } from '../errors/app-error';

class CartService {
  async getCart(userId: string) {
    let cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart) {
      cart = await Cart.create({ user: userId, items: [] });
    }
    return cart;
  }

  async addItem(userId: string, productId: string, quantity: number = 1, color?: string) {
    const product = await Product.findById(productId);
    if (!product) throw new NotFoundError('Product');
    if (!product.inStock || product.stock < quantity) {
      throw new BadRequestError('Product is out of stock or insufficient quantity');
    }

    let cart = await Cart.findOne({ user: userId });
    if (!cart) {
      cart = new Cart({ user: userId, items: [] });
    }

    // Check if item already exists in cart
    const existingIndex = cart.items.findIndex(
      (item) => item.product.toString() === productId && item.color === (color || undefined),
    );

    if (existingIndex > -1) {
      const newQty = cart.items[existingIndex].quantity + quantity;
      if (newQty > product.stock) {
        throw new BadRequestError(`Only ${product.stock} units available`);
      }
      cart.items[existingIndex].quantity = newQty;
      cart.items[existingIndex].totalPrice = product.price * newQty;
    } else {
      cart.items.push({
        product: productId as any,
        quantity,
        color,
        price: product.price,
        totalPrice: product.price * quantity,
      });
    }

    await cart.save();
    return Cart.findById(cart._id).populate('items.product');
  }

  async updateItemQuantity(userId: string, itemId: string, quantity: number) {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) throw new NotFoundError('Cart');

    const item = cart.items.find((i) => i._id?.toString() === itemId);
    if (!item) throw new NotFoundError('Cart item');

    const product = await Product.findById(item.product);
    if (!product) throw new NotFoundError('Product');
    if (quantity > product.stock) {
      throw new BadRequestError(`Only ${product.stock} units available`);
    }

    item.quantity = quantity;
    item.totalPrice = item.price * quantity;

    await cart.save();
    return Cart.findById(cart._id).populate('items.product');
  }

  async removeItem(userId: string, itemId: string) {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) throw new NotFoundError('Cart');

    const index = cart.items.findIndex((i) => i._id?.toString() === itemId);
    if (index === -1) throw new NotFoundError('Cart item');

    cart.items.splice(index, 1);
    await cart.save();
    return Cart.findById(cart._id).populate('items.product');
  }

  async clearCart(userId: string) {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) return;

    cart.items = [];
    cart.coupon = undefined;
    await cart.save();
  }

  async applyCoupon(userId: string, code: string) {
    const cart = await Cart.findOne({ user: userId });
    if (!cart || cart.items.length === 0) {
      throw new BadRequestError('Cart is empty');
    }

    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
      expiresAt: { $gt: new Date() },
    });

    if (!coupon) {
      throw new BadRequestError('Invalid or expired coupon code');
    }

    if (coupon.usedCount >= coupon.usageLimit) {
      throw new BadRequestError('Coupon usage limit exceeded');
    }

    // Calculate subtotal to check minimum order
    const subtotal = cart.items.reduce((sum, item) => sum + item.totalPrice, 0);
    if (subtotal < coupon.minOrderAmount) {
      throw new BadRequestError(`Minimum order amount of ₹${coupon.minOrderAmount} required`);
    }

    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = Math.round((subtotal * coupon.discount) / 100);
      if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
        discountAmount = coupon.maxDiscount;
      }
    } else {
      discountAmount = coupon.discount;
    }

    cart.coupon = {
      code: coupon.code,
      discount: coupon.discount,
      discountType: coupon.discountType,
      maxDiscount: coupon.maxDiscount,
    };

    await cart.save();

    return {
      code: coupon.code,
      discount: discountAmount,
      discountType: coupon.discountType,
    };
  }

  async removeCoupon(userId: string) {
    const cart = await Cart.findOne({ user: userId });
    if (!cart) throw new NotFoundError('Cart');

    cart.coupon = undefined;
    await cart.save();
    return Cart.findById(cart._id).populate('items.product');
  }

  async getAccessories(userId: string) {
    const cart = await Cart.findOne({ user: userId }).populate('items.product');
    if (!cart || cart.items.length === 0) return [];

    const cartProductIds = cart.items.map((i) => i.product._id?.toString() || i.product.toString());

    // Collect relatedAccessories from all cart products
    const accessoryIds: string[] = [];
    for (const item of cart.items) {
      const product = item.product as any;
      if (product.relatedAccessories?.length) {
        for (const accId of product.relatedAccessories) {
          const id = accId.toString();
          if (!cartProductIds.includes(id) && !accessoryIds.includes(id)) {
            accessoryIds.push(id);
          }
        }
      }
    }

    if (accessoryIds.length === 0) {
      // Fallback: find accessories in same categories (back cases, tempered glass, etc.)
      const categories = [...new Set(cart.items.map((i) => (i.product as any).category?.toString()).filter(Boolean))];
      const products = await Product.find({
        _id: { $nin: cartProductIds },
        category: { $in: categories },
        inStock: true,
        $or: [
          { name: { $regex: /case|cover|tempered|glass|screen.?protector|charger|cable|adapter/i } },
        ],
      })
        .select('name slug images price mrp brand inStock stock')
        .limit(8)
        .lean();
      return products;
    }

    return Product.find({ _id: { $in: accessoryIds }, inStock: true })
      .select('name slug images price mrp brand inStock stock')
      .limit(8)
      .lean();
  }
}

export default new CartService();
