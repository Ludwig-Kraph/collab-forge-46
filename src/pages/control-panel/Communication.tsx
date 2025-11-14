import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Plus, Hash, Lock, Send, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const supabaseAny = supabase as any;

interface Channel {
  id: string;
  name: string;
  description: string;
  channel_type: string;
  is_private: boolean;
  created_at: string;
}

interface Message {
  id: string;
  channel_id: string;
  user_id: string;
  message: string;
  created_at: string;
  profiles?: {
    full_name: string;
  };
}

export default function Communication() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [channels, setChannels] = useState<Channel[]>([]);
  const [selectedChannel, setSelectedChannel] = useState<Channel | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [newChannel, setNewChannel] = useState({
    name: "",
    description: "",
    channel_type: "team",
    is_private: false
  });

  useEffect(() => {
    fetchChannels();
  }, []);

  useEffect(() => {
    if (selectedChannel) {
      fetchMessages(selectedChannel.id);

      // Subscribe to real-time messages
      const channel = supabaseAny
        .channel(`channel_${selectedChannel.id}_messages`)
        .on('postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'channel_messages',
            filter: `channel_id=eq.${selectedChannel.id}`
          },
          (payload) => {
            fetchMessages(selectedChannel.id);
          }
        )
        .subscribe();

      return () => {
        supabaseAny.removeChannel(channel);
      };
    }
  }, [selectedChannel]);

  const fetchChannels = async () => {
    try {
      const { data, error } = await supabaseAny
        .from('communication_channels')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setChannels((data || []) as Channel[]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const fetchMessages = async (channelId: string) => {
    try {
      const { data, error } = await supabaseAny
        .from('channel_messages')
        .select(`
          *,
          profiles:user_id (
            full_name
          )
        `)
        .eq('channel_id', channelId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages((data || []) as Message[]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleCreateChannel = async () => {
    try {
      const { data, error } = await supabaseAny
        .from('communication_channels')
        .insert({
          ...newChannel,
          created_by: user?.id
        })
        .select()
        .single();

      if (error) throw error;

      // Add creator as channel member
      if (data) {
        await supabaseAny
          .from('channel_members')
          .insert({
            channel_id: data.id,
            user_id: user?.id,
            is_moderator: true
          });
      }

      toast({
        title: "Channel Created",
        description: "Communication channel has been created successfully."
      });

      setCreateDialogOpen(false);
      setNewChannel({
        name: "",
        description: "",
        channel_type: "team",
        is_private: false
      });
      fetchChannels();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChannel) return;

    try {
      const { error } = await supabaseAny
        .from('channel_messages')
        .insert({
          channel_id: selectedChannel.id,
          user_id: user?.id,
          message: newMessage
        });

      if (error) throw error;

      setNewMessage("");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleJoinChannel = async (channelId: string) => {
    try {
      const { error } = await supabaseAny
        .from('channel_members')
        .insert({
          channel_id: channelId,
          user_id: user?.id,
          is_moderator: false
        });

      if (error) throw error;

      toast({
        title: "Joined Channel",
        description: "You have successfully joined the channel."
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-6 h-[calc(100vh-100px)]">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Inter-Team Communication</h1>
            <p className="text-muted-foreground">Collaborate with your team in real-time</p>
          </div>
          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Channel
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Communication Channel</DialogTitle>
                <DialogDescription>
                  Create a new channel for team communication
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Channel Name</label>
                  <Input
                    value={newChannel.name}
                    onChange={(e) => setNewChannel({ ...newChannel, name: e.target.value })}
                    placeholder="general, support, engineering"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={newChannel.description}
                    onChange={(e) => setNewChannel({ ...newChannel, description: e.target.value })}
                    placeholder="What is this channel about?"
                    rows={3}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={newChannel.is_private}
                    onChange={(e) => setNewChannel({ ...newChannel, is_private: e.target.checked })}
                    className="rounded"
                  />
                  <label className="text-sm font-medium">Private Channel</label>
                </div>
                <Button onClick={handleCreateChannel} className="w-full">
                  Create Channel
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-4 gap-6 h-full">
          {/* Channels Sidebar */}
          <Card className="col-span-1">
            <CardHeader>
              <CardTitle className="text-sm">Channels</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <div className="space-y-2">
                  {channels.map((channel) => (
                    <button
                      key={channel.id}
                      onClick={() => setSelectedChannel(channel)}
                      className={`w-full text-left p-2 rounded-lg hover:bg-accent transition-colors ${
                        selectedChannel?.id === channel.id ? 'bg-accent' : ''
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {channel.is_private ? (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <Hash className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span className="text-sm font-medium">{channel.name}</span>
                      </div>
                      {channel.description && (
                        <p className="text-xs text-muted-foreground mt-1 pl-6">
                          {channel.description}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Messages Area */}
          <Card className="col-span-3 flex flex-col">
            {selectedChannel ? (
              <>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {selectedChannel.is_private ? <Lock className="h-5 w-5" /> : <Hash className="h-5 w-5" />}
                        {selectedChannel.name}
                      </CardTitle>
                      <CardDescription>{selectedChannel.description}</CardDescription>
                    </div>
                    <Badge variant="outline">
                      <Users className="mr-1 h-3 w-3" />
                      {messages.length} messages
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  {/* Messages */}
                  <ScrollArea className="flex-1 pr-4 mb-4">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div key={message.id} className="flex gap-3">
                          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-medium">
                              {message.profiles?.full_name?.charAt(0) || 'U'}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium">
                                {message.profiles?.full_name || 'Unknown User'}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                              </span>
                            </div>
                            <p className="text-sm text-muted-foreground">{message.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder={`Message #${selectedChannel.name}`}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <Button onClick={handleSendMessage}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <Hash className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Select a channel to start messaging</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
}
