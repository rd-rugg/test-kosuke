'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Search, Star, Building, Cloud, CloudOff } from 'lucide-react';
import { useState, useEffect } from 'react';

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
  avatarUrl?: string;
}

interface ContactListProps {
  contacts: Contact[];
  onContactClick: (contact: Contact) => void;
  onBack: () => void;
}

export default function ContactList({ contacts: initialContacts, onContactClick, onBack }: ContactListProps) {
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const sortBy: 'name' | 'priority' | 'date' = 'date';

  useEffect(() => setContacts(initialContacts), [initialContacts]);

  const filteredContacts = contacts
    .filter(contact => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        contact.name.toLowerCase().includes(q) ||
        contact.company.toLowerCase().includes(q) ||
        contact.role.toLowerCase().includes(q);
      const matchesTag = !selectedTag || contact.tags.includes(selectedTag);
      return matchesSearch && matchesTag;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'priority':
          return b.priority - a.priority;
        case 'date':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        default:
          return 0;
      }
    });

  const allTags = [...new Set(contacts.flatMap(c => c.tags))];

  const getPriorityStars = (priority: number) =>
    Array.from({ length: 3 }, (_, i) => (
      <Star key={i} className={`w-3 h-3 ${i < priority ? 'fill-warning text-warning' : 'text-muted-foreground'}`} />
    ));

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-3 sm:p-4 space-y-3">
          <div className="bg-card border border-[hsl(var(--section-border))] rounded-lg p-3 shadow-medium">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <Button variant="outline" size="icon" onClick={onBack} className="flex-shrink-0 h-8 w-8">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </Button>
                <div className="flex-1 min-w-0">
                  <h1 className="text-xl sm:text-2xl font-bold truncate">Contacts</h1>
                  <p className="text-xs text-muted-foreground truncate">
                    {filteredContacts.length} contact{filteredContacts.length !== 1 ? 's' : ''}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Card className="p-4 shadow-medium border-border">
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-foreground">{contacts.length}</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">Total Contacts</p>
              </div>
            </Card>
            <Card className="p-4 shadow-medium border-border">
              <div className="text-center">
                <p className="text-2xl sm:text-3xl font-bold text-warning">{contacts.filter(c => !c.synced).length}</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">Unsynced</p>
              </div>
            </Card>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-sm bg-card border-border"
            />
          </div>

          {allTags.length > 0 && (
            <div className="bg-card border border-[hsl(var(--section-border))] rounded-lg p-2 shadow-sm">
              <div className="flex flex-wrap gap-1.5">
                <Button variant={selectedTag === null ? 'default' : 'outline'} size="sm" onClick={() => setSelectedTag(null)} className="h-7 text-xs">
                  All
                </Button>
                {allTags.map(tag => (
                  <Button
                    key={tag}
                    variant={selectedTag === tag ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedTag(tag)}
                    className="h-7 text-xs"
                  >
                    {tag}
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="grid gap-4">
            {filteredContacts.length === 0 ? (
              <Card className="p-12 text-center shadow-medium">
                <p className="text-muted-foreground text-lg">No contacts found</p>
                <p className="text-sm text-muted-foreground mt-2">Try adjusting your search or filters</p>
              </Card>
            ) : (
              filteredContacts.map(contact => (
                <Card
                  key={contact.id}
                  className="p-5 sm:p-6 hover:shadow-large hover:border-primary/30 transition-all cursor-pointer bg-card border-border"
                  onClick={() => onContactClick(contact)}
                >
                  <div className="flex items-start gap-4">
                    <Avatar className="h-14 w-14 sm:h-16 sm:w-16 flex-shrink-0 ring-2 ring-border">
                      <AvatarImage src={contact.avatarUrl} />
                      <AvatarFallback className="text-lg sm:text-xl font-bold bg-gradient-to-br from-primary/20 to-primary/5">
                        {contact.name
                          .split(' ')
                          .map(n => n[0])
                          .join('')
                          .toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm truncate text-foreground">{contact.name}</h3>
                          <div className="flex items-center text-[10px] text-muted-foreground mt-0.5">
                            <Building className="w-2.5 h-2.5 mr-1 flex-shrink-0" />
                            <span className="truncate font-medium">
                              {contact.role} at {contact.company}
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          <div className="flex gap-0.5">{getPriorityStars(contact.priority)}</div>
                          {contact.synced ? <Cloud className="w-3 h-3 text-success" /> : <CloudOff className="w-3 h-3 text-warning" />}
                        </div>
                      </div>

                      {contact.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {contact.tags.slice(0, 3).map(tag => (
                            <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                              {tag}
                            </Badge>
                          ))}
                          {contact.tags.length > 3 && (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                              +{contact.tags.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}

                      {contact.notes && <p className="text-sm text-muted-foreground mt-3 truncate">{contact.notes}</p>}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


