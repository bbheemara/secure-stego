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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

const Index = () => {
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [secretKey, setSecretKey] = useState('');
  const [secretMessage, setSecretMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [mode, setMode] = useState<'hide' | 'extract'>('hide');
  const [dataType, setDataType] = useState<'text' | 'image' | 'document'>('text');
  const [secretFile, setSecretFile] = useState<File | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const handleFileSelected = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverImage(reader.result as string);
      setSecretMessage('');
    };
    reader.readAsDataURL(file);
  };

  const handleSecretFileSelected = (file: File) => {
    setSecretFile(file);
  };

  const validateSecretFile = (file: File): boolean => {
    if (dataType === 'image' && !file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please select an image file",
        variant: "destructive",
      });
      return false;
    }
    if (dataType === 'document' && !['application/pdf', 'text/plain'].includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please select a PDF or TXT file",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  const resetForm = () => {
    setCoverImage(null);
    setSecretKey('');
    setSecretMessage('');
    setSecretFile(null);
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
        let dataToHide = '';
        
        if (dataType === 'text') {
          if (!secretMessage) return;
          dataToHide = secretMessage;
        } else if (secretFile) {
          if (!validateSecretFile(secretFile)) return;
          
          const reader = new FileReader();
          dataToHide = await new Promise((resolve) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(secretFile);
          });
        }
        
        const encrypted = await encryptMessage(dataToHide, secretKey);
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const modifiedImageData = hideData(imageData, encrypted);
        ctx.putImageData(modifiedImageData, 0, 0);

        const link = document.createElement('a');
        link.download = 'stego-image.png';
        link.href = canvas.toDataURL();
        link.click();

        toast({
          title: "Success!",
          description: "Your data has been hidden in the image.",
        });

        resetForm();
      } else {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        let extractedData;
        
        try {
          extractedData = extractData(imageData);
        } catch (error) {
          toast({
            title: "Invalid Image",
            description: "Please upload a valid stego image containing hidden data.",
            variant: "destructive",
          });
          return;
        }

        try {
          const decrypted = await decryptMessage(extractedData, secretKey);
          
          if (decrypted.startsWith('data:')) {
            const link = document.createElement('a');
            link.href = decrypted;
            link.download = 'extracted-file' + (decrypted.includes('image') ? '.png' : '.txt');
            link.click();
            toast({
              title: "Success!",
              description: "File extracted successfully!",
            });
          } else {
            setSecretMessage(decrypted);
            toast({
              title: "Success!",
              description: "Message extracted successfully!",
            });
          }
        } catch (error) {
          setSecretMessage('');
          toast({
            title: "Incorrect Password",
            description: "Please check your encryption key and try again.",
            variant: "destructive",
          });
        }
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
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">
            Krishna's Secure Data Hiding
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
            {mode === 'hide' && (
              <div className="space-y-2">
                <label className="block text-sm font-medium">Data Type</label>
                <Select value={dataType} onValueChange={(value: 'text' | 'image' | 'document') => setDataType(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select data type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text Message</SelectItem>
                    <SelectItem value="image">Image File</SelectItem>
                    <SelectItem value="document">Document (PDF/TXT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            {mode === 'hide' && dataType === 'text' && (
              <div className="space-y-2">
                <label htmlFor="secretMessage" className="block text-sm font-medium">
                  Secret Message
                </label>
                <Textarea
                  id="secretMessage"
                  value={secretMessage}
                  onChange={(e) => setSecretMessage(e.target.value)}
                  placeholder="Enter your secret message"
                  className="neo-glass min-h-[100px]"
                />
              </div>
            )}

            {mode === 'hide' && (dataType === 'image' || dataType === 'document') && (
              <div className="space-y-2">
                <label className="block text-sm font-medium">
                  Secret File
                </label>
                <DragDropZone
                  onFileSelected={handleSecretFileSelected}
                  acceptedFileTypes={dataType === 'image' ? ['image/*'] : ['.pdf', '.txt']}
                />
              </div>
            )}

            {mode === 'extract' && (
              <div className="space-y-2">
                <label htmlFor="secretMessage" className="block text-sm font-medium">
                  Extracted Message
                </label>
                <Textarea
                  id="secretMessage"
                  value={secretMessage}
                  readOnly
                  placeholder="Extracted message will appear here"
                  className="neo-glass min-h-[100px]"
                />
              </div>
            )}

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
                disabled={!coverImage || !secretKey || (mode === 'hide' && !secretMessage && !secretFile) || isProcessing}
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
