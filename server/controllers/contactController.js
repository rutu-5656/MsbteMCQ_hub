const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const submitMessage = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ message: 'All fields are required.' });
    }

    const newMessage = await prisma.contactMessage.create({
      data: {
        name,
        email,
        subject,
        message,
      }
    });

    res.status(201).json({ message: 'Your message has been sent successfully!' });
  } catch (error) {
    console.error('Contact submission error:', error);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
};

module.exports = { submitMessage };
