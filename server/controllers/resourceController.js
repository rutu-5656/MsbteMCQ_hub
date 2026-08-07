const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all resources
const getResources = async (req, res) => {
  try {
    const resources = await prisma.resource.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(resources);
  } catch (error) {
    console.error('getResources error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Upload a resource (admin only)
const uploadResource = async (req, res) => {
  try {
    const { title, category } = req.body;
    const file = req.file;

    if (!title || !category || !file) {
      return res.status(400).json({ message: 'Title, category, and file are required' });
    }

    // Determine file type from extension or mimetype
    let fileType = 'FILE';
    if (file.mimetype === 'application/pdf') fileType = 'PDF';
    else if (file.mimetype.includes('word')) fileType = 'DOC';
    else if (file.mimetype.includes('image')) fileType = 'IMG';

    // Format size
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    const fileSize = sizeInMB > 0.1 ? `${sizeInMB} MB` : `${Math.round(file.size / 1024)} KB`;

    const resource = await prisma.resource.create({
      data: {
        title,
        category,
        fileType,
        fileSize,
        filePath: `/uploads/${file.filename}`
      }
    });

    res.status(201).json(resource);
  } catch (error) {
    console.error('uploadResource error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getResources, uploadResource };
