const { BlobServiceClient } = require('@azure/storage-blob');

const connectionString = process.env.AZURE_STORAGE_CONNECTION_STRING;
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME || 'product-images';

const blobServiceClient = BlobServiceClient.fromConnectionString(connectionString);
const containerClient = blobServiceClient.getContainerClient(containerName);

/**
 * Sube un archivo (buffer) a Azure Blob Storage y devuelve la URL pública.
 */
async function uploadImage(file) {
  const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${require('path').extname(file.originalname)}`;
  const blockBlobClient = containerClient.getBlockBlobClient(uniqueName);

  await blockBlobClient.uploadData(file.buffer, {
    blobHTTPHeaders: { blobContentType: file.mimetype },
  });

  return blockBlobClient.url; // URL pública del blob
}

module.exports = { uploadImage };