/**
 * Image embeddings that run INSIDE this backend (no external server).
 * Uses a pretrained CLIP model (Xenova/clip-vit-base-patch32) through
 * @huggingface/transformers, which is already in package.json.
 * Output: a normalised 512-number vector per image.
 *
 * The model is downloaded once on first use (about 100 MB) and cached.
 */
const MODEL_ID = 'Xenova/clip-vit-base-patch32';

let modelPromise = null;

const loadModel = () => {
  if (!modelPromise) {
    modelPromise = (async () => {
      const { AutoProcessor, CLIPVisionModelWithProjection } = await import('@huggingface/transformers');
      console.log('[Embedding] Loading CLIP model (first time may download ~100 MB)...');
      const processor = await AutoProcessor.from_pretrained(MODEL_ID);
      const model = await CLIPVisionModelWithProjection.from_pretrained(MODEL_ID, { dtype: 'q8' });
      console.log('[Embedding] CLIP model ready.');
      return { processor, model };
    })().catch((err) => {
      modelPromise = null; // allow a retry on the next request
      throw err;
    });
  }
  return modelPromise;
};

/**
 * @param {Buffer} imageBuffer - The image data (JPEG/PNG/WebP)
 * @returns {Promise<number[]>} - The 512-dimension feature vector
 */
const generateImageEmbedding = async (imageBuffer) => {
  try {
    const { RawImage } = await import('@huggingface/transformers');
    const { processor, model } = await loadModel();

    const image = await RawImage.fromBlob(new Blob([imageBuffer]));
    const inputs = await processor(image);
    const { image_embeds } = await model(inputs);

    const vector = Array.from(image_embeds.data);
    const norm = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0)) || 1;
    return vector.map((v) => v / norm);
  } catch (error) {
    console.error('Image Embedding Error:', error.message);
    throw new Error(`Failed to generate image embedding: ${error.message}`);
  }
};

module.exports = {
  generateImageEmbedding,
};
