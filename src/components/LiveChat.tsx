
import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, X, Send, Bot, User, Maximize2, Minimize2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ChatMessage {
  id: string;
  message: string;
  sender: 'user' | 'support';
  timestamp: Date;
  name?: string;
}

const LiveChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      message: 'Hello! Welcome to SmartHub Computers. How can I help you today?',
      sender: 'support',
      timestamp: new Date(),
      name: 'Support Team'
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isOnline, setIsOnline] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const generateContextualResponse = (userMessage: string): string => {
    const message = userMessage.toLowerCase();
    
    // Product-related responses
    if (message.includes('laptop') || message.includes('notebook')) {
      return "We have a great selection of laptops including gaming laptops, business laptops, and ultrabooks. What type of laptop are you looking for? I can help you find the perfect one based on your needs and budget.";
    }
    
    if (message.includes('desktop') || message.includes('pc')) {
      return "Our desktop computers range from budget-friendly options to high-performance gaming and workstation PCs. Are you looking for a specific type of desktop? I can recommend some based on your requirements.";
    }
    
    if (message.includes('gaming')) {
      return "Great choice! Our gaming section includes high-performance laptops, desktops, and components. We have systems with the latest graphics cards and processors. What's your gaming preference and budget range?";
    }
    
    if (message.includes('price') || message.includes('cost') || message.includes('budget')) {
      return "We offer competitive pricing across all our products. Our computers start from budget-friendly options around KES 30,000 to high-end systems. What's your budget range? I can suggest the best options for you.";
    }
    
    if (message.includes('warranty') || message.includes('guarantee')) {
      return "All our products come with manufacturer warranties. Most laptops and desktops have 1-2 year warranties, and we also offer extended warranty options. We provide full support for any warranty claims.";
    }
    
    if (message.includes('delivery') || message.includes('shipping')) {
      return "We offer delivery within Nairobi and nationwide shipping across Kenya. Nairobi deliveries are usually same-day or next-day, while countrywide shipping takes 2-3 business days. Delivery is free for orders above KES 50,000.";
    }
    
    if (message.includes('payment') || message.includes('pay')) {
      return "We accept various payment methods including M-Pesa, bank transfers, cash, and card payments. We also offer installment plans for purchases above KES 50,000. Would you like to know more about our payment options?";
    }
    
    if (message.includes('location') || message.includes('address') || message.includes('visit')) {
      return "You can visit our store at Koinange Street, Uniafric House Room 208, Nairobi. We're open Monday to Saturday, 9 AM to 6 PM. You can also call us at 0704144239 or email smarthub278@gmail.com.";
    }
    
    if (message.includes('spec') || message.includes('specification')) {
      return "I'd be happy to help you with specifications! Which product are you interested in? You can browse our full catalog with detailed specs on our products page, or I can help you find something specific.";
    }
    
    // General responses
    const generalResponses = [
      "Thank you for your question! I'm here to help you find the perfect computer solution. Can you tell me more about what you're looking for?",
      "That's a great question! Our team specializes in helping customers find the right technology. What specific product or service interests you?",
      "I'd be happy to assist you with that. SmartHub Computers offers a wide range of products and services. How can I help you today?",
      "Thanks for reaching out! We're committed to providing excellent customer service. What would you like to know more about?",
      "I understand your inquiry. Let me help you find the best solution for your needs. Could you provide a bit more detail about what you're looking for?"
    ];
    
    return generalResponses[Math.floor(Math.random() * generalResponses.length)];
  };

  const handleSendMessage = async () => {
    if (!currentMessage.trim()) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      message: currentMessage,
      sender: 'user',
      timestamp: new Date(),
      name: user?.email || 'Guest'
    };

    setMessages(prev => [...prev, newMessage]);
    const messageToRespond = currentMessage;
    setCurrentMessage('');

    // Save message to database
    try {
      await supabase.from('messages').insert({
        name: user?.email || 'Guest',
        email: user?.email || 'guest@example.com',
        message: messageToRespond,
        subject: 'Live Chat Message'
      });

      // Generate contextual response
      setTimeout(() => {
        const contextualResponse = generateContextualResponse(messageToRespond);
        
        const supportMessage: ChatMessage = {
          id: (Date.now() + 1).toString(),
          message: contextualResponse,
          sender: 'support',
          timestamp: new Date(),
          name: 'Support Team'
        };
        
        setMessages(prev => [...prev, supportMessage]);
      }, 1500 + Math.random() * 2000);

    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Dynamic sizing based on expanded state
  const chatWidth = isExpanded ? 'w-[90vw] max-w-4xl' : 'w-80 md:w-96';
  const chatHeight = isExpanded ? 'h-[80vh] max-h-[700px]' : 'h-96 md:h-[500px]';

  return (
    <>
      {/* Chat Toggle Button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!isOpen && (
          <Button
            onClick={() => setIsOpen(true)}
            className="rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-300 bg-primary hover:bg-primary/90"
            size="icon"
          >
            <MessageCircle className="h-6 w-6" />
          </Button>
        )}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className={`fixed ${isExpanded ? 'inset-4' : 'bottom-6 right-6'} z-50 ${isExpanded ? 'flex items-center justify-center' : ''}`}>
          <Card className={`${chatWidth} ${chatHeight} flex flex-col shadow-2xl ${isExpanded ? 'max-w-none' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Bot className="h-6 w-6 text-primary" />
                    <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${
                      isOnline ? 'bg-green-500' : 'bg-gray-400'
                    }`}></div>
                  </div>
                  <div>
                    <CardTitle className="text-lg">Live Support</CardTitle>
                    <Badge variant={isOnline ? "default" : "secondary"} className="text-xs">
                      {isOnline ? 'Online' : 'Offline'}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleExpanded}
                    className="h-8 w-8"
                  >
                    {isExpanded ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIsOpen(false)}
                    className="h-8 w-8"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 flex flex-col p-0 min-h-0">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[85%] p-3 rounded-lg ${
                        message.sender === 'user'
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        {message.sender === 'user' ? (
                          <User className="h-3 w-3" />
                        ) : (
                          <Bot className="h-3 w-3" />
                        )}
                        <span className="text-xs font-medium">
                          {message.name || (message.sender === 'user' ? 'You' : 'Support')}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap">{message.message}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString([], { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="border-t p-4 bg-background">
                <div className="flex space-x-2">
                  <Input
                    value={currentMessage}
                    onChange={(e) => setCurrentMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Type your message..."
                    className="flex-1"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!currentMessage.trim()}
                    size="icon"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  We typically reply within a few minutes • Email: smarthub278@gmail.com
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
};

export default LiveChat;
