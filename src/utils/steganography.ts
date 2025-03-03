
export const hideData = (imageData: ImageData, message: string): ImageData => {
  const binaryMessage = message.split('').map(char => 
    char.charCodeAt(0).toString(2).padStart(8, '0')
  ).join('');

  const messageLength = binaryMessage.length;
  const data = imageData.data;

  // Store message length in first 32 pixels
  const lengthBinary = messageLength.toString(2).padStart(32, '0');
  for (let i = 0; i < 32; i++) {
    data[i * 4] = (data[i * 4] & 254) | parseInt(lengthBinary[i]);
  }

  // Hide message
  for (let i = 0; i < messageLength; i++) {
    const pixelIndex = (i + 32) * 4;
    if (pixelIndex < data.length) {
      data[pixelIndex] = (data[pixelIndex] & 254) | parseInt(binaryMessage[i]);
    }
  }

  return imageData;
};

export const extractData = (imageData: ImageData): string => {
  const data = imageData.data;
  
  // Extract message length from first 32 pixels
  let lengthBinary = '';
  for (let i = 0; i < 32; i++) {
    lengthBinary += (data[i * 4] & 1).toString();
  }
  const messageLength = parseInt(lengthBinary, 2);

  // Extract message
  let binaryMessage = '';
  for (let i = 0; i < messageLength; i++) {
    const pixelIndex = (i + 32) * 4;
    if (pixelIndex < data.length) {
      binaryMessage += (data[pixelIndex] & 1).toString();
    }
  }

  // Convert binary message to text
  const message = [];
  for (let i = 0; i < binaryMessage.length; i += 8) {
    const byte = binaryMessage.substr(i, 8);
    message.push(String.fromCharCode(parseInt(byte, 2)));
  }

  return message.join('');
};
