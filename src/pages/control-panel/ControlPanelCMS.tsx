import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Image, 
  Settings, 
  Globe, 
  Palette,
  Layout as LayoutIcon,
  Upload,
  Eye,
  Edit3
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function ControlPanelCMS() {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">M-Leja CMS</h1>
          <p className="text-muted-foreground">
            Content Management System for M-Leja corporate administration
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Preview
          </Button>
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Publish Changes
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="design">Design</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Pages</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">
                  +2 from last month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Media Assets</CardTitle>
                <Image className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">248</div>
                <p className="text-xs text-muted-foreground">
                  45 MB total size
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Site Visitors</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12.5K</div>
                <p className="text-xs text-muted-foreground">
                  +18% from last week
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Last Updated</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2h</div>
                <p className="text-xs text-muted-foreground">
                  ago
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Recent Changes</CardTitle>
              <CardDescription>Latest updates to M-Leja content</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { page: 'Landing Page', action: 'Updated hero section', time: '2 hours ago', status: 'published' },
                  { page: 'About Us', action: 'Added team photos', time: '1 day ago', status: 'published' },
                  { page: 'Pricing', action: 'Modified tier descriptions', time: '2 days ago', status: 'draft' },
                  { page: 'Blog', action: 'Published new article', time: '3 days ago', status: 'published' },
                ].map((change, index) => (
                  <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">{change.page}</p>
                      <p className="text-sm text-muted-foreground">{change.action}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={change.status === 'published' ? 'default' : 'secondary'}>
                        {change.status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">{change.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Management</CardTitle>
              <CardDescription>Manage pages, posts, and content sections</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[
                  { title: 'Landing Page', icon: LayoutIcon, status: 'published', lastEdit: '2h ago' },
                  { title: 'About Us', icon: FileText, status: 'published', lastEdit: '1d ago' },
                  { title: 'Services', icon: FileText, status: 'published', lastEdit: '3d ago' },
                  { title: 'Blog Posts', icon: FileText, status: 'draft', lastEdit: '5d ago' },
                  { title: 'FAQ', icon: FileText, status: 'published', lastEdit: '1w ago' },
                  { title: 'Contact', icon: FileText, status: 'published', lastEdit: '2w ago' },
                ].map((page, index) => {
                  const Icon = page.icon;
                  return (
                    <Card key={index} className="hover:border-primary/50 transition-colors cursor-pointer">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <Icon className="h-8 w-8 text-primary" />
                          <Badge variant={page.status === 'published' ? 'default' : 'secondary'}>
                            {page.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-2">
                        <h3 className="font-semibold">{page.title}</h3>
                        <p className="text-xs text-muted-foreground">Last edited {page.lastEdit}</p>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" className="w-full">
                            <Edit3 className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button size="sm" variant="ghost" className="w-full">
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Media Tab */}
        <TabsContent value="media" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Media Library</CardTitle>
              <CardDescription>Manage images, videos, and documents</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 border-2 border-dashed rounded-lg">
                <Image className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Upload Media</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Drag and drop files here or click to browse
                </p>
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  Choose Files
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Design Tab */}
        <TabsContent value="design" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Theme & Design</CardTitle>
              <CardDescription>Customize the look and feel of M-Leja</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <Card className="border-2 border-primary">
                    <CardHeader>
                      <Palette className="h-8 w-8 text-primary mb-2" />
                      <CardTitle className="text-base">Current Theme</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">Professional Green</p>
                      <Button size="sm" variant="outline" className="w-full mt-3">
                        Customize
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <Palette className="h-8 w-8 text-muted-foreground mb-2" />
                      <CardTitle className="text-base">Alternative Theme</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">Modern Blue</p>
                      <Button size="sm" variant="outline" className="w-full mt-3">
                        Apply
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <Palette className="h-8 w-8 text-muted-foreground mb-2" />
                      <CardTitle className="text-base">Custom Theme</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">Create Your Own</p>
                      <Button size="sm" variant="outline" className="w-full mt-3">
                        Create
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>CMS Settings</CardTitle>
              <CardDescription>Configure content management preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <h4 className="font-medium">Auto-Save</h4>
                    <p className="text-sm text-muted-foreground">Automatically save changes every 30 seconds</p>
                  </div>
                  <Button variant="outline" size="sm">Enable</Button>
                </div>

                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <h4 className="font-medium">Version Control</h4>
                    <p className="text-sm text-muted-foreground">Keep history of content changes</p>
                  </div>
                  <Button variant="outline" size="sm">Enabled</Button>
                </div>

                <div className="flex items-center justify-between border-b pb-4">
                  <div>
                    <h4 className="font-medium">Collaborative Editing</h4>
                    <p className="text-sm text-muted-foreground">Allow multiple editors simultaneously</p>
                  </div>
                  <Button variant="outline" size="sm">Enable</Button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">SEO Optimization</h4>
                    <p className="text-sm text-muted-foreground">Automatic meta tags and optimization</p>
                  </div>
                  <Button variant="outline" size="sm">Enabled</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
