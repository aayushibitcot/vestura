import { ContactService } from './contact.service.js';
import { MESSAGES } from '../../config/messages.js';
import { successResponse } from '../../utils/response.util.js';

export const ContactController = {
  async submitContact(req, res, next) {
    try {
      await ContactService.submitContactForm(req.body);
      return successResponse(
        res, 
        MESSAGES.CONTACT_SUBMITTED, 
        null, 
        201
      );
    } catch (err) {
      return next(err);
    }
  }
};

