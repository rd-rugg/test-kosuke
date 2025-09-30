'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { QrCode, X, Flashlight, RotateCcw } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import QrScanner from 'qr-scanner';

interface QRScannerProps {
  onScanComplete: (result: string) => void;
  onClose: () => void;
}

export default function QRScanner({ onScanComplete, onClose }: QRScannerProps) {
  const { toast } = useToast();
  const [flashlightOn, setFlashlightOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);

  useEffect(() => {
    initQRScanner();
    return () => stopScanner();
  }, []);

  const initQRScanner = async () => {
    if (!videoRef.current) return;
    try {
      setCameraError(null);
      qrScannerRef.current = new QrScanner(
        videoRef.current,
        result => {
          toast({ title: 'QR Code Detected', description: 'Processing scanned data...' });
          onScanComplete(result.data);
        },
        { preferredCamera: 'environment', highlightScanRegion: true, highlightCodeOutline: true }
      );
      await qrScannerRef.current.start();
    } catch (error) {
      console.error('QR Scanner error:', error);
      setCameraError('Camera access denied. Please enable camera permissions.');
      toast({ title: 'Camera Error', description: 'Please enable camera permissions to scan QR codes', variant: 'destructive' });
    }
  };

  const stopScanner = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.stop();
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
  };

  const retryScanner = async () => {
    stopScanner();
    await initQRScanner();
  };

  const toggleFlashlight = async () => {
    if (!qrScannerRef.current) return;
    try {
      if (await qrScannerRef.current.hasFlash()) {
        await qrScannerRef.current.toggleFlash();
        setFlashlightOn(v => !v);
      } else {
        toast({ title: 'Flashlight Not Available', description: "This device doesn't support flashlight control" });
      }
    } catch (error) {
      console.error('Flashlight error:', error);
      toast({ title: 'Flashlight Error', description: 'Could not toggle flashlight', variant: 'destructive' });
    }
  };

  const simulateQRScan = () => {
    const mockLinkedInUrl = 'https://www.linkedin.com/in/johndoe';
    toast({ title: 'QR Code Detected', description: 'LinkedIn profile found!' });
    onScanComplete(mockLinkedInUrl);
  };

  const handleManualEntry = () => {
    const url = prompt('Enter LinkedIn URL:');
    if (url) onScanComplete(url);
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 bg-black/50 text-white">
        <h1 className="text-lg font-semibold">Scan QR Code</h1>
        <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
          <X className="w-5 h-5" />
        </Button>
      </div>

      <div className="flex-1 relative">
        {cameraError ? (
          <div className="flex-1 flex items-center justify-center">
            <Card className="p-6 m-4 text-center">
              <QrCode className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">Camera Not Available</h3>
              <p className="text-sm text-muted-foreground mb-4">{cameraError}</p>
              <div className="space-y-2">
                <Button onClick={retryScanner} className="w-full">
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Retry Camera
                </Button>
                <Button variant="outline" onClick={handleManualEntry} className="w-full">
                  Enter URL Manually
                </Button>
              </div>
            </Card>
          </div>
        ) : (
          <>
            <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative">
                <div className="w-64 h-64 border-2 border-white rounded-lg relative">
                  <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary rounded-tl-lg"></div>
                  <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary rounded-tr-lg"></div>
                  <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary rounded-bl-lg"></div>
                  <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary rounded-br-lg"></div>
                  <div className="absolute inset-0 overflow-hidden rounded-lg">
                    <div className="w-full h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent animate-pulse-soft"></div>
                  </div>
                </div>
                <p className="text-white text-center mt-4 text-sm">Position QR code within the frame</p>
              </div>
            </div>
          </>
        )}
      </div>

      <div className="p-4 bg-black/50">
        <div className="flex justify-center gap-4">
          <Button variant="outline" size="lg" onClick={toggleFlashlight} className="bg-black/50 border-white text-white hover:bg-white/20">
            <Flashlight className={`w-5 h-5 ${flashlightOn ? 'text-yellow-400' : ''}`} />
          </Button>
          <Button size="lg" onClick={simulateQRScan} className="px-8">
            Demo Scan
          </Button>
          <Button variant="outline" size="lg" onClick={handleManualEntry} className="bg-black/50 border-white text-white hover:bg-white/20">
            Manual
          </Button>
        </div>
        <p className="text-white/70 text-xs text-center mt-3">Tap "Demo Scan" to simulate scanning a LinkedIn QR code</p>
      </div>
    </div>
  );
}


