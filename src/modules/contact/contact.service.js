import { ContactModel } from './contact.model.js';

export const ContactService = {
  async submitContactForm({ name, email, subject, message }) {
    try {
      await ContactModel.create({
        name,
        email,
        subject,
        message
      });
    } catch (error) {
      throw error;
    }
  }
};

