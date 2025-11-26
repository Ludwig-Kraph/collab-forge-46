import { useState, useEffect } from 'react';
import Layout from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Save, Eye, Layout as LayoutIcon, Type, Image, 
  Palette, Monitor, Smartphone, ArrowUp, ArrowDown, 
  Trash2, Plus, GripVertical 
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { FormField } from '@/components/ui/form-field';

interface LandingPageSection {
  id: string;
  type: 'hero' | 'features' | 'pricing' | 'cta' | 'testimonials';
  order: number;
  visible: boolean;
  content: {
    title?: string;
    subtitle?: string;
    description?: string;
    buttonText?: string;
    buttonLink?: string;
    imageUrl?: string;
  };
}

export default function LandingPageBuilder() {
  const { toast } = useToast();
  const [sections, setSections] = useState<LandingPageSection[]>([
    {
      id: '1',
      type: 'hero',
      order: 1,
      visible: true,
      content: {
        title: 'Streamline Your M-PESA Payments',
        subtitle: 'M-Leja - Professional Payment Management',
        description: 'Trigger STK Push payments, manage transactions, and track your business finances all in one place.',
        buttonText: 'Get Started Free',
        buttonLink: '/auth'
      }
    },
    {
      id: '2',
      type: 'features',
      order: 2,
      visible: true,
      content: {
        title: 'Powerful Features',
        description: 'Everything you need to manage M-PESA payments efficiently'
      }
    },
    {
      id: '3',
      type: 'pricing',
      order: 3,
      visible: true,
      content: {
        title: 'Choose Your Plan',
        description: 'Flexible pricing for businesses of all sizes'
      }
    },
    {
      id: '4',
      type: 'cta',
      order: 4,
      visible: true,
      content: {
        title: 'Ready to Get Started?',
        description: 'Join thousands of businesses managing payments with M-Leja',
        buttonText: 'Start Free Trial',
        buttonLink: '/auth'
      }
    }
  ]);

  const [selectedSection, setSelectedSection] = useState<LandingPageSection | null>(null);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop');

  const handleUpdateSection = (field: string, value: any) => {
    if (!selectedSection) return;
    
    const updatedSection = {
      ...selectedSection,
      content: {
        ...selectedSection.content,
        [field]: value
      }
    };
    
    setSelectedSection(updatedSection);
    setSections(sections.map(s => s.id === updatedSection.id ? updatedSection : s));
  };

  const handleMoveSection = (id: string, direction: 'up' | 'down') => {
    const index = sections.findIndex(s => s.id === id);
    if (index === -1) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= sections.length) return;
    
    const newSections = [...sections];
    [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];
    
    // Update order values
    newSections.forEach((section, i) => {
      section.order = i + 1;
    });
    
    setSections(newSections);
  };

  const handleToggleVisibility = (id: string) => {
    setSections(sections.map(s => 
      s.id === id ? { ...s, visible: !s.visible } : s
    ));
  };

  const handleAddSection = (type: LandingPageSection['type']) => {
    const newSection: LandingPageSection = {
      id: Date.now().toString(),
      type,
      order: sections.length + 1,
      visible: true,
      content: {
        title: `New ${type} Section`,
        description: 'Edit this section content'
      }
    };
    
    setSections([...sections, newSection]);
    toast({
      title: 'Section Added',
      description: `New ${type} section added to landing page`
    });
  };

  const handleDeleteSection = (id: string) => {
    setSections(sections.filter(s => s.id !== id));
    if (selectedSection?.id === id) {
      setSelectedSection(null);
    }
    toast({
      title: 'Section Deleted',
      description: 'Section removed from landing page'
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // In production, this would save to a landing_page_sections table
      // For now, we'll save to system_settings
      const { error } = await supabase
        .from('system_settings')
        .upsert({
          setting_key: 'landing_page_config',
          setting_value: JSON.stringify(sections),
          updated_by: (await supabase.auth.getUser()).data.user?.id
        });

      if (error) throw error;

      toast({
        title: 'Landing Page Updated',
        description: 'Your changes have been published successfully'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const getSectionIcon = (type: string) => {
    switch (type) {
      case 'hero': return Type;
      case 'features': return LayoutIcon;
      case 'pricing': return Palette;
      case 'cta': return Image;
      case 'testimonials': return Monitor;
      default: return LayoutIcon;
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Landing Page Builder</h1>
            <p className="text-muted-foreground">
              Drag, drop, and customize your landing page sections
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setPreviewMode(previewMode === 'desktop' ? 'mobile' : 'desktop')}>
              {previewMode === 'desktop' ? <Smartphone className="h-4 w-4 mr-2" /> : <Monitor className="h-4 w-4 mr-2" />}
              {previewMode === 'desktop' ? 'Mobile' : 'Desktop'} Preview
            </Button>
            <Button onClick={() => window.open('/', '_blank')}>
              <Eye className="h-4 w-4 mr-2" />
              Preview Live
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              Save & Publish
            </Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          {/* Section List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Page Sections</CardTitle>
              <CardDescription>Drag to reorder sections</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {sections.map((section, index) => {
                const Icon = getSectionIcon(section.type);
                return (
                  <div
                    key={section.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-all ${
                      selectedSection?.id === section.id ? 'border-primary bg-primary/5' : 'hover:border-primary/50'
                    } ${!section.visible ? 'opacity-50' : ''}`}
                    onClick={() => setSelectedSection(section)}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium capitalize flex-1">{section.type}</span>
                      <Badge variant={section.visible ? 'default' : 'secondary'} className="text-xs">
                        {section.visible ? 'Visible' : 'Hidden'}
                      </Badge>
                    </div>
                    <div className="flex gap-1 ml-6">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveSection(section.id, 'up');
                        }}
                        disabled={index === 0}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveSection(section.id, 'down');
                        }}
                        disabled={index === sections.length - 1}
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleVisibility(section.id);
                        }}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSection(section.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
              
              <div className="pt-3 border-t">
                <p className="text-xs font-medium mb-2">Add New Section</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button size="sm" variant="outline" onClick={() => handleAddSection('hero')}>
                    <Plus className="h-3 w-3 mr-1" /> Hero
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleAddSection('features')}>
                    <Plus className="h-3 w-3 mr-1" /> Features
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleAddSection('cta')}>
                    <Plus className="h-3 w-3 mr-1" /> CTA
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleAddSection('testimonials')}>
                    <Plus className="h-3 w-3 mr-1" /> Reviews
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section Editor */}
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedSection ? `Edit ${selectedSection.type} Section` : 'Select a Section'}
              </CardTitle>
              <CardDescription>
                {selectedSection ? 'Customize the content and appearance' : 'Click a section to edit'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedSection ? (
                <div className="space-y-4">
                  <FormField label="Title" required>
                    <Input
                      value={selectedSection.content.title || ''}
                      onChange={(e) => handleUpdateSection('title', e.target.value)}
                      placeholder="Section title"
                    />
                  </FormField>

                  {selectedSection.type === 'hero' && (
                    <FormField label="Subtitle">
                      <Input
                        value={selectedSection.content.subtitle || ''}
                        onChange={(e) => handleUpdateSection('subtitle', e.target.value)}
                        placeholder="Catchy subtitle"
                      />
                    </FormField>
                  )}

                  <FormField label="Description">
                    <Textarea
                      value={selectedSection.content.description || ''}
                      onChange={(e) => handleUpdateSection('description', e.target.value)}
                      placeholder="Section description"
                      rows={4}
                    />
                  </FormField>

                  {(selectedSection.type === 'hero' || selectedSection.type === 'cta') && (
                    <>
                      <FormField label="Button Text">
                        <Input
                          value={selectedSection.content.buttonText || ''}
                          onChange={(e) => handleUpdateSection('buttonText', e.target.value)}
                          placeholder="e.g., Get Started"
                        />
                      </FormField>

                      <FormField label="Button Link">
                        <Input
                          value={selectedSection.content.buttonLink || ''}
                          onChange={(e) => handleUpdateSection('buttonLink', e.target.value)}
                          placeholder="/auth"
                        />
                      </FormField>
                    </>
                  )}

                  <FormField label="Background Image URL" hint="Optional">
                    <Input
                      value={selectedSection.content.imageUrl || ''}
                      onChange={(e) => handleUpdateSection('imageUrl', e.target.value)}
                      placeholder="https://..."
                    />
                  </FormField>

                  <div className="pt-4 border-t">
                    <Button onClick={handleSave} disabled={saving} className="w-full">
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  <LayoutIcon className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>Select a section from the left to start editing</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
