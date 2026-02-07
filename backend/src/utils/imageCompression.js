const sharp = require('sharp');
const path = require('path');
const fs = require('fs').promises;

const compressImage = async (filePath) => {
  try {
    const ext = path.extname(filePath).toLowerCase();
    const basePath = filePath.replace(ext, '');
    const compressedPath = `${basePath}-compressed${ext}`;

    if (ext === '.png') {
      await sharp(filePath)
        .png({ compressionLevel: 9 })
        .toFile(compressedPath);
    } else if (['.jpg', '.jpeg'].includes(ext)) {
      await sharp(filePath)
        .jpeg({ quality: 80 })
        .toFile(compressedPath);
    } else if (ext === '.gif') {
      // Para GIF, apenas copiar (Sharp não comprime bem GIF)
      return filePath;
    } else {
      // Para outros, converter para JPEG com qualidade
      await sharp(filePath)
        .jpeg({ quality: 80 })
        .toFile(compressedPath);
    }

    // Delete original
    await fs.unlink(filePath);

    // Rename compressed to original
    await fs.rename(compressedPath, filePath);

    return filePath;
  } catch (error) {
    console.error('Image compression error:', error);
    // Retornar caminho original mesmo se falhar a compressão
    return filePath;
  }
};

module.exports = { compressImage };
