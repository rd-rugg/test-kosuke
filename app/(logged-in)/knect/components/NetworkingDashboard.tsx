'use client';

import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { QrCode, UserPlus, Users, Clock, Wifi, WifiOff, MapPin } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface DashboardStats {
  totalContacts: number;
  unsyncedContacts: number;
  remindersDue: number;
  isOnline: boolean;
}

interface NetworkingDashboardProps {
  onScanQR: () => void;
  onAddContact: () => void;
  onViewContacts: () => void;
}

export default function NetworkingDashboard({ onScanQR, onAddContact, onViewContacts }: NetworkingDashboardProps) {
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats>({
    totalContacts: 0,
    unsyncedContacts: 0,
    remindersDue: 0,
    isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  });

  const [location, setLocation] = useState<{ latitude: number; longitude: number; address: string } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [, setLocationError] = useState<string | null>(null);

  const getLocation = async () => {
    if (!navigator.geolocation) {
      const errorMsg = "Your browser doesn't support geolocation.";
      setLocationError(errorMsg);
      toast({ title: 'Geolocation not supported', description: errorMsg, variant: 'destructive' });
      return;
    }

    setLocationLoading(true);
    setLocationError(null);

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000,
        });
      });

      const { latitude, longitude } = position.coords;

      try {
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
        );
        const data = await response.json();
        const address = `${data.city || data.locality || 'Unknown'}, ${data.countryName || 'Unknown'}`;
        setLocation({ latitude, longitude, address });
        toast({ title: 'Location captured', description: `Current location: ${address}` });
      } catch {
        setLocation({ latitude, longitude, address: `${latitude.toFixed(4)}, ${longitude.toFixed(4)}` });
      }
    } catch (error: any) {
      let errorMsg = 'Unable to get your location.';
      if (error?.code === error?.PERMISSION_DENIED) errorMsg = 'Location access denied.';
      else if (error?.code === error?.POSITION_UNAVAILABLE) errorMsg = 'Location information unavailable.';
      else if (error?.code === error?.TIMEOUT) errorMsg = 'Location request timed out.';
      setLocationError(errorMsg);
      toast({ title: 'Location access failed', description: errorMsg, variant: 'destructive' });
    } finally {
      setLocationLoading(false);
    }
  };

  useEffect(() => {
    const contacts = JSON.parse(localStorage.getItem('networking-contacts') || '[]') as Array<{ synced?: boolean; reminder?: string | null }>;
    const unsynced = contacts.filter((c) => !c.synced).length;
    const reminders = contacts.filter((c) => c.reminder && new Date(c.reminder) <= new Date()).length;

    setStats({
      totalContacts: contacts.length,
      unsyncedContacts: unsynced,
      remindersDue: reminders,
      isOnline: navigator.onLine,
    });

    const handleOnline = () => setStats(prev => ({ ...prev, isOnline: true }));
    const handleOffline = () => setStats(prev => ({ ...prev, isOnline: false }));
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <header className="border-b border-[hsl(var(--section-border))] bg-card/80 backdrop-blur-md shadow-medium flex-shrink-0">
        <div className="container mx-auto px-3 sm:px-4 py-1.5 sm:py-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                <Image src="/logos/lets-knect-logo.png" alt="Let's Knect Logo" width={160} height={40} className="h-auto w-40" />
              </div>
            </div>
            <div>
              {stats.isOnline ? (
                <Badge variant="outline" className="bg-success/10 text-success border-success/30 text-[10px] px-2 py-0.5">
                  <Wifi className="h-2.5 w-2.5 mr-0.5" />
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/30 text-[10px] px-2 py-0.5">
                  <WifiOff className="h-2.5 w-2.5 mr-0.5" />
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto flex items-center">
        <div className="container mx-auto px-4 py-2 w-full">
          <div className="max-w-6xl mx-auto space-y-3 sm:space-y-4">
            <Card className="p-4 sm:p-5 shadow-medium border-border">
              <div className="text-center">
                <p className="text-3xl sm:text-4xl font-bold text-destructive">{stats.remindersDue}</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">Reminders Due</p>
              </div>
            </Card>

            <div className="space-y-3 sm:space-y-4">
              <Button onClick={onScanQR} size="lg" className="w-full h-auto py-12 sm:py-16 flex-col gap-3 sm:gap-4">
                <QrCode className="h-12 w-12 sm:h-16 sm:w-16" />
                <span className="text-sm sm:text-base font-bold">Scan LinkedIn QR</span>
              </Button>

              <div className="grid grid-cols-2 gap-3 sm:gap-4">
                <Button onClick={onAddContact} size="lg" variant="secondary" className="h-auto py-8 sm:py-10 flex-col gap-2 sm:gap-3">
                  <UserPlus className="h-8 w-8 sm:h-10 sm:w-10" />
                  <span className="text-xs sm:text-sm font-bold">Add Contact</span>
                </Button>

                <Button onClick={onViewContacts} size="lg" variant="outline" className="h-auto py-8 sm:py-10 flex-col gap-2 sm:gap-3">
                  <Users className="h-8 w-8 sm:h-10 sm:w-10" />
                  <span className="text-xs sm:text-sm font-bold">My Contacts</span>
                </Button>
              </div>
            </div>

            <Card className="p-4 sm:p-5 shadow-medium border-border">
              <div className="flex items-center justify-between mb-2">
                <MapPin className="w-4 h-4 text-primary" />
                <Button onClick={getLocation} disabled={locationLoading} size="sm" variant="secondary" className="h-7 text-xs px-2">
                  {locationLoading ? '...' : 'Get'}
                </Button>
              </div>
              {location ? (
                <p className="text-xs sm:text-sm text-foreground font-medium truncate">{location.address}</p>
              ) : (
                <p className="text-xs sm:text-sm text-muted-foreground truncate">Tap to get location</p>
              )}
            </Card>

            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <Clock className="w-4 h-4" />
              <p className="text-xs sm:text-sm">How to use: Scan → Add Note → Save</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


