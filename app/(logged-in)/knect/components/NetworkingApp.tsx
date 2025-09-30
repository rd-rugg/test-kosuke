'use client';

import { useState, useEffect } from 'react';
import NetworkingDashboard from './NetworkingDashboard';
import ContactList from './ContactList';
import ContactForm from './ContactForm';
import QRScanner from './QRScanner';
import { useToast } from '@/hooks/use-toast';

type AppView = 'dashboard' | 'contacts' | 'add-contact' | 'edit-contact' | 'qr-scanner';

interface Contact {
  id: string;
  name: string;
  company: string;
  role: string;
  email?: string;
  linkedinUrl?: string;
  tags: string[];
  priority: 1 | 2 | 3;
  notes: string;
  synced: boolean;
  createdAt: string;
  updatedAt: string;
  avatarUrl?: string;
}

export default function NetworkingApp() {
  const { toast } = useToast();
  const [currentView, setCurrentView] = useState<AppView>('dashboard');
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  useEffect(() => {
    const savedContacts = JSON.parse(localStorage.getItem('networking-contacts') || '[]');
    setContacts(savedContacts);
  }, []);

  useEffect(() => {
    localStorage.setItem('networking-contacts', JSON.stringify(contacts));
  }, [contacts]);

  const navigateTo = (view: AppView) => {
    setCurrentView(view);
    setEditingContact(null);
  };

  const handleSaveContact = (contactData: Contact) => {
    if (editingContact) {
      setContacts(prev =>
        prev.map(c => (c.id === editingContact.id ? { ...contactData, id: editingContact.id, createdAt: editingContact.createdAt } : c))
      );
      toast({ title: 'Contact Updated', description: `${contactData.name} has been updated` });
    } else {
      const newContact: Contact = {
        ...contactData,
        id: `contact-${Date.now()}`,
        synced: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      setContacts(prev => [newContact, ...prev]);
      toast({ title: 'Contact Added', description: `${contactData.name} has been added to your network` });
    }

    setEditingContact(null);
    setCurrentView('dashboard');
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setCurrentView('edit-contact');
  };

  const handleQRScanComplete = (scannedData: string) => {
    let initialData: Partial<Contact> = { linkedinUrl: scannedData };
    try {
      const url = new URL(scannedData);
      if (url.hostname.includes('linkedin.com')) {
        const pathParts = url.pathname.split('/');
        const profileIndex = pathParts.findIndex(part => part === 'in');
        if (profileIndex !== -1 && pathParts[profileIndex + 1]) {
          const username = pathParts[profileIndex + 1];
          const readableName = username.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          initialData.name = readableName;
        }
      }
    } catch {}

    setEditingContact(initialData as Contact);
    setCurrentView('add-contact');
    toast({ title: 'QR Code Scanned', description: 'LinkedIn profile detected! Fill in the details.' });
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <NetworkingDashboard
            onScanQR={() => navigateTo('qr-scanner')}
            onAddContact={() => navigateTo('add-contact')}
            onViewContacts={() => navigateTo('contacts')}
          />
        );
      case 'contacts':
        return <ContactList contacts={contacts} onContactClick={handleEditContact} onBack={() => navigateTo('dashboard')} />;
      case 'add-contact':
      case 'edit-contact':
        return <ContactForm initialData={editingContact} onSave={handleSaveContact} onCancel={() => navigateTo('dashboard')} />;
      case 'qr-scanner':
        return <QRScanner onScanComplete={handleQRScanComplete} onClose={() => navigateTo('dashboard')} />;
      default:
        return null;
    }
  };

  return <div className="min-h-screen bg-background">{renderCurrentView()}</div>;
}


