const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// Initialize Supabase Client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

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

    // Upload to Supabase Storage
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fileName = uniqueSuffix + path.extname(file.originalname);
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('resources')
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return res.status(500).json({ message: 'Error uploading file to storage' });
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from('resources')
      .getPublicUrl(fileName);

    const publicUrl = publicUrlData.publicUrl;

    const resource = await prisma.resource.create({
      data: {
        title,
        category,
        fileType,
        fileSize,
        filePath: publicUrl
      }
    });

    res.status(201).json(resource);
  } catch (error) {
    console.error('uploadResource error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete a resource (admin only)
const deleteResource = async (req, res) => {
  try {
    const resourceId = parseInt(req.params.id);
    
    const resource = await prisma.resource.findUnique({ where: { id: resourceId } });
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found' });
    }

    // Extract filename from the Supabase public URL
    // e.g., https://.../storage/v1/object/public/resources/170000000-12345.pdf
    if (resource.filePath && resource.filePath.includes('supabase.co')) {
      const urlParts = resource.filePath.split('/');
      const fileName = urlParts[urlParts.length - 1];
      
      const { error: deleteError } = await supabase.storage
        .from('resources')
        .remove([fileName]);
        
      if (deleteError) {
        console.error('Supabase delete error:', deleteError);
      }
    }
    
    await prisma.resource.delete({ where: { id: resourceId } });
    res.json({ message: 'Resource deleted successfully' });
  } catch (error) {
    console.error('deleteResource error:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getResources, uploadResource, deleteResource };
