import User, { IAddress } from '../models/user.model';
import { NotFoundError } from '../errors/app-error';

class UserService {
  async getAddresses(userId: string) {
    const user = await User.findById(userId);
    if (!user) throw new NotFoundError('User');
    return user.addresses;
  }

  async addAddress(userId: string, address: IAddress) {
    const user = await User.findById(userId);
    if (!user) throw new NotFoundError('User');

    // If this is the first address or marked as default, set it as default
    if (user.addresses.length === 0 || address.isDefault) {
      user.addresses.forEach((addr) => (addr.isDefault = false));
      address.isDefault = true;
    }

    user.addresses.push(address);
    await user.save();
    return user.addresses;
  }

  async updateAddress(userId: string, addressId: string, updates: Partial<IAddress>) {
    const user = await User.findById(userId);
    if (!user) throw new NotFoundError('User');

    const address = user.addresses.find((a) => a._id?.toString() === addressId);
    if (!address) throw new NotFoundError('Address');

    // If setting as default, unset all others
    if (updates.isDefault) {
      user.addresses.forEach((addr) => (addr.isDefault = false));
    }

    Object.assign(address, updates);
    await user.save();
    return user.addresses;
  }

  async deleteAddress(userId: string, addressId: string) {
    const user = await User.findById(userId);
    if (!user) throw new NotFoundError('User');

    const index = user.addresses.findIndex((a) => a._id?.toString() === addressId);
    if (index === -1) throw new NotFoundError('Address');

    const wasDefault = user.addresses[index].isDefault;
    user.addresses.splice(index, 1);

    // If deleted address was default, make the first one default
    if (wasDefault && user.addresses.length > 0) {
      user.addresses[0].isDefault = true;
    }

    await user.save();
    return user.addresses;
  }

  // Admin: get all users
  async getAllUsers(page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      User.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
      User.countDocuments(),
    ]);

    return {
      users,
      totalUsers: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  // Admin: toggle block user
  async toggleBlock(userId: string, isBlocked: boolean) {
    const user = await User.findByIdAndUpdate(
      userId,
      { $set: { isBlocked } },
      { new: true },
    );
    if (!user) throw new NotFoundError('User');
    return user;
  }

  // Admin: delete user
  async deleteUser(userId: string) {
    const user = await User.findByIdAndDelete(userId);
    if (!user) throw new NotFoundError('User');
    return user;
  }
}

export default new UserService();
