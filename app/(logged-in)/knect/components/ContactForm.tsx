'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Star, Plus, X, Save, Mic, MicOff, ChevronDown, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { openLinkedInProfile } from '@/lib/knect/linkedin';
import { useSpeechToText } from '@/hooks/use-speech-to-text';

interface ContactFormProps {
  initialData?: Partial<Contact>;
  onSave: (contact: Contact) => void;
  onCancel: () => void;
}

type Contact = {
  id: string;
  name: string;
  company: string;
  role: string;
  email?: string;
  linkedinUrl?: string;
  notes: string;
  priority: 1 | 2 | 3;
  tags: string[];
  avatarUrl?: string;
  synced: boolean;
  createdAt: string;
  updatedAt: string;
};

export default function ContactForm({ initialData, onSave, onCancel }: ContactFormProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Omit<Contact, 'id' | 'synced' | 'createdAt' | 'updatedAt'>>({
    name: initialData?.name || '',
    company: initialData?.company || '',
    role: initialData?.role || '',
    email: initialData?.email || '',
    linkedinUrl: initialData?.linkedinUrl || '',
    notes: initialData?.notes || '',
    priority: initialData?.priority || 1,
    tags: initialData?.tags || [],
    avatarUrl: initialData?.avatarUrl || '',
  });

  const [newTag, setNewTag] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isExpanded, setIsExpanded] = useState(false);
  const { isRecording, toggleRecording } = useSpeechToText();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.linkedinUrl.trim()) newErrors.linkedinUrl = 'LinkedIn URL is required';
    else if (!isValidLinkedInUrl(formData.linkedinUrl)) newErrors.linkedinUrl = 'Please enter a valid LinkedIn profile URL';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidLinkedInUrl = (url: string): boolean => {
    if (!url) return false;
    const pattern = /^(https?:\/\/)?(www\.)?linkedin\.com\/(in|pub)\/[a-zA-Z0-9_-]+\/?$/;
    return pattern.test(url.trim());
  };

  const handleSaveAndOpenLinkedIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast({ title: 'Validation Error', description: 'Please fix the errors in the form', variant: 'destructive' });
      return;
    }
    const contact: Contact = {
      ...formData,
      id: initialData?.id || `contact-${Date.now()}`,
      synced: false,
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onSave(contact);
    toast({ title: 'Contact Saved', description: `${contact.name} has been saved successfully` });
    openLinkedInProfile(formData.linkedinUrl);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast({ title: 'Validation Error', description: 'Please fix the errors in the form', variant: 'destructive' });
      return;
    }
    const contact: Contact = {
      ...formData,
      id: initialData?.id || `contact-${Date.now()}`,
      synced: false,
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    onSave(contact);
    toast({ title: 'Contact Saved', description: `${contact.name} has been saved successfully` });
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  };

  const setPriority = (priority: 1 | 2 | 3) => setFormData(prev => ({ ...prev, priority }));

  const handleVoiceNote = async () => {
    const transcript = await toggleRecording();
    if (transcript) setFormData(prev => ({ ...prev, notes: prev.notes ? `${prev.notes}\n${transcript}` : transcript }));
  };

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto p-3 sm:p-4">
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-[hsl(var(--section-border))]">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">{initialData ? 'Edit Contact' : 'Add New Contact'}</h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">{initialData ? 'Update details' : 'Enter contact details'}</p>
            </div>
            <Button variant="outline" size="icon" onClick={onCancel} className="hover:bg-destructive/10 h-8 w-8">
              <X className="w-4 h-4" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-primary"></div>
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Essential Information</h3>
              </div>

              <Card className="p-6 shadow-medium border-border">
                <div className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="linkedin" className="text-base font-medium">LinkedIn URL *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="linkedin"
                        value={formData.linkedinUrl}
                        onChange={e => setFormData(prev => ({ ...prev, linkedinUrl: e.target.value }))}
                        placeholder="https://linkedin.com/in/..."
                        className={`flex-1 h-11 bg-[hsl(var(--section-bg-subtle))] border-border focus:border-primary ${errors.linkedinUrl ? 'border-destructive' : ''}`}
                      />
                      {formData.linkedinUrl && (
                        <Button type="button" variant="outline" size="icon" onClick={() => openLinkedInProfile(formData.linkedinUrl)} className="h-11 w-11">
                          <ExternalLink className="w-5 h-5" />
                        </Button>
                      )}
                    </div>
                    {errors.linkedinUrl && <p className="text-sm text-destructive">{errors.linkedinUrl}</p>}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes" className="text-base font-medium">Notes</Label>
                    <div className="relative">
                      <Textarea
                        id="notes"
                        value={formData.notes}
                        onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Quick notes about this connection..."
                        rows={5}
                        className="pr-14 bg-[hsl(var(--section-bg-subtle))] border-border focus:border-primary"
                      />
                      <Button type="button" variant="outline" size="sm" onClick={handleVoiceNote} className={`absolute right-2 top-2 ${isRecording ? 'bg-destructive text-destructive-foreground' : ''}`}>
                        {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                        {isRecording ? 'Stop' : 'Voice'}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">Add any relevant details or action items</p>
                  </div>
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-primary"></div>
                <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">Organization</h3>
              </div>

              <Card className="p-6 shadow-medium border-border">
                <div className="space-y-4">
                  <Label className="text-base font-medium">Tags</Label>
                  <div className="flex flex-wrap gap-2 min-h-[40px] p-3 rounded-md bg-[hsl(var(--section-bg-subtle))] border border-border">
                    {formData.tags.length === 0 && <span className="text-sm text-muted-foreground">No tags yet</span>}
                    {formData.tags.map(tag => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1.5 px-3 py-1.5">
                        {tag}
                        <button type="button" onClick={() => removeTag(tag)} className="hover:text-destructive transition-colors">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newTag}
                      onChange={e => setNewTag(e.target.value)}
                      placeholder="Add tag (e.g., Investor, AI, Client)"
                      onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      className="h-11 bg-[hsl(var(--section-bg-subtle))] border-border focus:border-primary"
                    />
                    <Button type="button" onClick={addTag} variant="secondary" className="px-5">
                      <Plus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </div>
              </Card>
            </div>

            <div className="space-y-6">
              <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
                <Card className="shadow-medium border-border overflow-hidden">
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" className="w-full p-5 justify-between hover:bg-accent rounded-none">
                      <div className="flex items-center gap-2">
                        <div className="h-1 w-1 rounded-full bg-muted-foreground"></div>
                        <span className="text-sm font-semibold uppercase tracking-wide">Additional Details</span>
                      </div>
                      <ChevronDown className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                    </Button>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <div className="p-6 pt-4 space-y-6 border-t border-[hsl(var(--section-border))]">
                      <div className="space-y-3">
                        <Label className="text-base font-medium">Priority Level</Label>
                        <div className="flex gap-3">
                          {[1, 2, 3].map(priority => (
                            <Button
                              key={priority}
                              type="button"
                              variant={formData.priority >= priority ? 'default' : 'outline'}
                              size="lg"
                              onClick={() => setPriority(priority as 1 | 2 | 3)}
                              className="flex-1 h-14"
                            >
                              <Star className={`w-6 h-6 ${formData.priority >= priority ? 'fill-current' : ''}`} />
                            </Button>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">Set importance level (1-3 stars)</p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="text-base font-medium">Name</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Full name"
                            className="h-11 bg-[hsl(var(--section-bg-subtle))] border-border focus:border-primary"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="company" className="text-base font-medium">Company</Label>
                          <Input
                            id="company"
                            value={formData.company}
                            onChange={e => setFormData(prev => ({ ...prev, company: e.target.value }))}
                            placeholder="Company name"
                            className="h-11 bg-[hsl(var(--section-bg-subtle))] border-border focus:border-primary"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="role" className="text-base font-medium">Role</Label>
                          <Input
                            id="role"
                            value={formData.role}
                            onChange={e => setFormData(prev => ({ ...prev, role: e.target.value }))}
                            placeholder="Job title"
                            className="h-11 bg-[hsl(var(--section-bg-subtle))] border-border focus:border-primary"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="email" className="text-base font-medium">Email</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="email@company.com"
                            className={`h-11 bg-[hsl(var(--section-bg-subtle))] border-border focus:border-primary ${errors.email ? 'border-destructive' : ''}`}
                          />
                          {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                        </div>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-6">
              <Button type="button" variant="outline" onClick={onCancel} className="sm:flex-1 order-3 sm:order-1">Cancel</Button>
              <Button type="button" onClick={handleSaveAndOpenLinkedIn} disabled={!formData.linkedinUrl} className="sm:flex-1 order-1 sm:order-2">
                <ExternalLink className="w-5 h-5 mr-2" />
                <span className="hidden sm:inline">Save & Open LinkedIn</span>
                <span className="sm:hidden">Save & Open</span>
              </Button>
              <Button type="submit" variant="secondary" className="sm:flex-1 order-2 sm:order-3">
                <Save className="w-5 h-5 mr-2" />
                Save Contact
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


