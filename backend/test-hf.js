require('dotenv').config();
const { HfInference } = require('@huggingface/inference');

console.log('Testing Hugging Face connection...');
console.log('Token:', process.env.HUGGINGFACE_TOKEN ? 'Present (length: ' + process.env.HUGGINGFACE_TOKEN.length + ')' : 'Missing');

const hf = new HfInference(process.env.HUGGINGFACE_TOKEN);

async function testHuggingFace() {
  try {
    console.log('Attempting to generate a test image...');
    console.log('Using model: runwayml/stable-diffusion-v1-5');
    
    // Add timeout
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Request timeout after 30 seconds')), 30000)
    );    const imagePromise = hf.textToImage({
      model: 'black-forest-labs/FLUX.1-schnell',
      inputs: 'a simple red circle on white background',
    });

    const imageBlob = await Promise.race([imagePromise, timeoutPromise]);

    console.log('✅ Successfully generated image!');
    console.log('Image blob size:', imageBlob.size, 'bytes');
    console.log('Image type:', imageBlob.type);
    
  } catch (error) {
    console.error('❌ Error generating image:', error.message);
    if (error.message.includes('quota')) {
      console.log('💡 This might be a quota limit issue. The API key may need more credits.');
    } else if (error.message.includes('loading')) {
      console.log('💡 The model might be loading. Try again in a few minutes.');
    } else if (error.message.includes('timeout')) {
      console.log('💡 Request timed out. The service might be slow or unavailable.');
    } else if (error.message.includes('401')) {
      console.log('💡 Authentication failed. Check if the API key is valid.');
    } else {
      console.log('💡 Error details:', error);
    }
  }
}

console.log('Starting test...');
testHuggingFace().then(() => {
  console.log('Test completed.');
  process.exit(0);
}).catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
