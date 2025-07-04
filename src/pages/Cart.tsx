
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useToast } from '@/hooks/use-toast';

const Cart = () => {
  const { items, updateQuantity, removeFromCart, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('mpesa');
  const [mpesaMessage, setMpesaMessage] = useState('');
  const [voucherCode, setVoucherCode] = useState('');

  // Calculate shipping fee as 15% of total price
  const shippingFee = Math.round(totalPrice * 0.15);
  const taxAmount = Math.round(totalPrice * 0.16);
  const finalTotal = totalPrice + shippingFee + taxAmount;

  const handleCheckout = async () => {
    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to proceed with checkout",
      });
      navigate('/auth');
      return;
    }

    if (paymentMethod === 'mpesa' && !mpesaMessage.trim()) {
      toast({
        title: "M-Pesa message required",
        description: "Please paste your M-Pesa confirmation message",
        variant: "destructive",
      });
      return;
    }

    setIsCheckingOut(true);
    
    // Simulate checkout process
    setTimeout(() => {
      toast({
        title: "Order placed successfully!",
        description: paymentMethod === 'mpesa' 
          ? "Your M-Pesa payment is being verified. You'll receive confirmation shortly."
          : "Thank you for your purchase. You'll receive a confirmation email shortly.",
      });
      clearCart();
      navigate('/');
      setIsCheckingOut(false);
    }, 2000);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <ShoppingBag className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-2xl font-bold mb-2">Your cart is empty</h1>
            <p className="text-muted-foreground mb-8">
              Looks like you haven't added any items to your cart yet.
            </p>
            <Button onClick={() => navigate('/products')} size="lg">
              Continue Shopping
            </Button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Shopping Cart</h1>
          <p className="text-muted-foreground">
            {items.length} {items.length === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=200&h=200&fit=crop&crop=center'}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                      <p className="text-muted-foreground text-sm mb-2">
                        KES {item.price.toLocaleString()} each
                      </p>
                      
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value) || 1)}
                            className="w-16 text-center"
                            min="1"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFromCart(item.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <p className="font-bold text-lg">
                        KES {(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>KES {totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Shipping (15%)</span>
                    <span>KES {shippingFee.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (16%)</span>
                    <span>KES {taxAmount.toLocaleString()}</span>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>KES {finalTotal.toLocaleString()}</span>
                </div>

                {/* Voucher Code */}
                <div className="space-y-2">
                  <Label htmlFor="voucher">Voucher Code</Label>
                  <Input
                    id="voucher"
                    placeholder="Enter voucher code"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                  />
                </div>

                {/* Payment Method */}
                <div className="space-y-3">
                  <Label>Payment Method</Label>
                  <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="mpesa" id="mpesa" />
                      <Label htmlFor="mpesa">M-Pesa (0704144239)</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="cash" id="cash" />
                      <Label htmlFor="cash">Cash on Delivery</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* M-Pesa Message Input */}
                {paymentMethod === 'mpesa' && (
                  <div className="space-y-2">
                    <Label htmlFor="mpesa-message">M-Pesa Confirmation Message</Label>
                    <textarea
                      id="mpesa-message"
                      placeholder="Paste your M-Pesa confirmation message here..."
                      value={mpesaMessage}
                      onChange={(e) => setMpesaMessage(e.target.value)}
                      className="w-full p-2 border rounded-md resize-none h-20 text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      Send money to 0704144239 and paste the confirmation message here
                    </p>
                  </div>
                )}
                
                <div className="space-y-3">
                  <Button 
                    className="w-full" 
                    size="lg"
                    onClick={handleCheckout}
                    disabled={isCheckingOut}
                  >
                    {isCheckingOut ? 'Processing...' : 'Proceed to Checkout'}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate('/products')}
                  >
                    Continue Shopping
                  </Button>
                </div>
                
                <div className="text-center">
                  <Badge variant="secondary" className="text-xs">
                    Free delivery on orders over KES 50,000
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
};

export default Cart;
