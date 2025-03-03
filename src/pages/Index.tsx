
import React, { useState } from 'react';
import DragDropZone from '../components/DragDropZone';
import ImagePreview from '../components/ImagePreview';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { FileText, Image as ImageIcon, Lock } from 'lucide-react';
import { Textarea } from '../components/ui/textarea';

const Index = () => {
  const [coverImage, setCoverImage] = useState<string | null>(null);
  const [secretKey, setSecretKey] = useState('');
  const [secretMessage, setSecretMessage] = useState('');

  const handleFileSelected = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setCoverImage(reader.result as string);
    };
    reader.readAsDataURL(file);
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

        <Tabs defaultValue="text" className="w-full">
          <TabsList className="grid w-full grid-cols-3 neo-glass">
            <TabsTrigger value="text" className="space-x-2">
              <FileText className="w-4 h-4" />
              <span>Text</span>
            </TabsTrigger>
            <TabsTrigger value="image" className="space-x-2">
              <ImageIcon className="w-4 h-4" />
              <span>Image</span>
            </TabsTrigger>
            <TabsTrigger value="document" className="space-x-2">
              <Lock className="w-4 h-4" />
              <span>Document</span>
            </TabsTrigger>
          </TabsList>

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
                  disabled={!coverImage || !secretKey || !secretMessage}
                >
                  Hide Data
                </Button>
              </div>
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
