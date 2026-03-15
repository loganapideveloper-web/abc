import { Request, Response, NextFunction } from 'express';
import bannerService from '../services/banner.service';
import { sendSuccess, sendCreated, sendMessage } from '../utils/response.util';

class BannerController {
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const banners = await bannerService.getAll();
      sendSuccess(res, banners, 'Banners fetched');
    } catch (error) {
      next(error);
    }
  }

  async getAllAdmin(_req: Request, res: Response, next: NextFunction) {
    try {
      const banners = await bannerService.getAllAdmin();
      sendSuccess(res, banners, 'All banners fetched');
    } catch (error) {
      next(error);
    }
  }

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const banner = await bannerService.create(req.body);
      sendCreated(res, banner, 'Banner created');
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const banner = await bannerService.update(req.params.id, req.body);
      sendSuccess(res, banner, 'Banner updated');
    } catch (error) {
      next(error);
    }
  }

  async toggleActive(req: Request, res: Response, next: NextFunction) {
    try {
      const { isActive } = req.body;
      const banner = await bannerService.toggleActive(req.params.id, isActive);
      sendSuccess(res, banner, `Banner ${isActive ? 'activated' : 'deactivated'}`);
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await bannerService.delete(req.params.id);
      sendMessage(res, 'Banner deleted');
    } catch (error) {
      next(error);
    }
  }
}

export default new BannerController();
