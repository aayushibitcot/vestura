import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const ContactModel = {
  async create({ name, email, subject, message }) {
    return await prisma.contact.create({
      data: {
        name,
        email,
        subject,
        message,
        status: 'new'
      }
    });
  }
};

