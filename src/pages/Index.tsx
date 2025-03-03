
import React, { useState, useRef } from 'react';
import DragDropZone from '../components/DragDropZone';
import ImagePreview from '../components/ImagePreview';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { FileText, Image as ImageIcon, Lock, Download } from 'lucide-react';
import { Textarea } from '../components/ui/textarea';
import { encryptMessage, decryptMessage } from '../utils/encryption';
import { hideData, extractData } from '../utils/steganography';
import { useToast } from '../components/ui/use-toast';

const Index = () => {
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [secretKey, setSecretKey] = useState('');
  const [secretMessage, setSecretMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [mode, setMode] = useState<'hide' | 'extract'>('hide');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const handleFileSelected = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverImage(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const processImage = async () => {
    if (!coverImage || !secretKey) return;

    try {
      setIsProcessing(true);
      const img = new Image();
      img.src = coverImage;
      
      await new Promise((resolve) => {
        img.onload = resolve;
      });

      const canvas = canvasRef.current!;
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);

      if (mode === 'hide') {
        if (!secretMessage) return;
        
        // Encrypt the message
        const encrypted = await encryptMessage(secretMessage, secretKey);
        
        // Hide the encrypted message in the image
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const modifiedImageData = hideData(imageData, encrypted);
        ctx.putImageData(modifiedImageData, 0, 0);

        // Create download link
        const link = document.createElement('a');
        link.download = 'stego-image.png';
        link.href = canvas.toDataURL();
        link.click();

        toast({
          title: "Success!",
          description: "Your message has been hidden in the image.",
        });
      } else {
        // Extract and decrypt the message
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const extractedData = extractData(imageData);
        const decrypted = await decryptMessage(extractedData, secretKey);
        setSecretMessage(decrypted);

        toast({
          title: "Success!",
          description: "Message extracted successfully!",
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to process the image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen w-full max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="space-y-8 animate-fadeIn">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-cyan-500">
            Secure Steganography
          </h1>
          <p className="text-lg text-white/60 max-w-2xl mx-auto">
            Hide your sensitive data securely within images using advanced encryption and steganography techniques.
          </p>
        </div>

        <div className="flex justify-center gap-4 mb-8">
          <Button
            variant={mode === 'hide' ? 'default' : 'outline'}
            onClick={() => setMode('hide')}
          >
            Hide Data
          </Button>
          <Button
            variant={mode === 'extract' ? 'default' : 'outline'}
            onClick={() => setMode('extract')}
          >
            Extract Data
          </Button>
        </div>

        <div className="mt-8 space-y-6">
          {!coverImage ? (
            <DragDropZone onFileSelected={handleFileSelected} />
          ) : (
            <ImagePreview
              imageUrl={coverImage}
              onRemove={() => setCoverImage(null)}
            />
          )}

          <div className="space-y-4 neo-glass p-6 rounded-lg">
            <div className="space-y-2">
              <label htmlFor="secretMessage" className="block text-sm font-medium">
                {mode === 'hide' ? 'Secret Message' : 'Extracted Message'}
              </label>
              <Textarea
                id="secretMessage"
                value={secretMessage}
                onChange={(e) => setSecretMessage(e.target.value)}
                placeholder={mode === 'hide' ? "Enter your secret message" : "Extracted message will appear here"}
                className="neo-glass min-h-[100px]"
                readOnly={mode === 'extract'}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="secretKey" className="block text-sm font-medium">
                Encryption Key
              </label>
              <Input
                id="secretKey"
                type="password"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder="Enter your secret key"
                className="neo-glass"
              />
            </div>

            <div className="pt-4">
              <Button
                className="w-full neo-glass hover:bg-white/10"
                disabled={!coverImage || !secretKey || (mode === 'hide' && !secretMessage) || isProcessing}
                onClick={processImage}
              >
                {isProcessing ? 'Processing...' : mode === 'hide' ? 'Hide Data' : 'Extract Data'}
              </Button>
            </div>
          </div>
        </div>

        <canvas ref={canvasRef} style={{ display: 'none' }} />
      </div>
    </div>
  );
};

export default Index;
