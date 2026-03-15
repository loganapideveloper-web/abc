import ContactMessage, { IContactMessage } from '../models/contact-message.model';
import { NotFoundError } from '../errors/app-error';

class ContactService {
  async create(data: Partial<IContactMessage>): Promise<IContactMessage> {
    return ContactMessage.create(data);
  }

  async getAll(query: { page?: number; limit?: number; isRead?: boolean }) {
    const { page = 1, limit = 10, isRead } = query;
    const filter: Record<string, unknown> = {};
    if (isRead !== undefined) filter.isRead = isRead;

    const [messages, total] = await Promise.all([
      ContactMessage.find(filter)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      ContactMessage.countDocuments(filter),
    ]);

    return {
      messages,
      totalMessages: total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  }

  async markRead(id: string) {
    const msg = await ContactMessage.findByIdAndUpdate(id, { isRead: true }, { new: true });
    if (!msg) throw new NotFoundError('Contact message');
    return msg;
  }

  async delete(id: string) {
    const msg = await ContactMessage.findByIdAndDelete(id);
    if (!msg) throw new NotFoundError('Contact message');
    return msg;
  }

  async getUnreadCount() {
    return ContactMessage.countDocuments({ isRead: false });
  }
}

export default new ContactService();
