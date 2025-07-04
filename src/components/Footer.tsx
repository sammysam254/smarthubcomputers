import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-foreground text-background py-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">SH</span>
              </div>
              <h3 className="text-xl font-bold">SmartHub Computers</h3>
            </div>
            <p className="text-background/80 text-sm">
              Your trusted partner for premium computers, laptops, and tech solutions. 
              Quality products, expert service, competitive prices.
            </p>
            <div className="flex space-x-3">
              <Button variant="ghost" size="icon" className="text-background/80 hover:text-background hover:bg-background/10">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-background/80 hover:text-background hover:bg-background/10">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-background/80 hover:text-background hover:bg-background/10">
                <Instagram className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Quick Links</h4>
            <ul className="space-y-2">
              {["Laptops", "Desktops", "Components", "Gaming", "Accessories", "Support"].map((link) => (
                <li key={link}>
                  <a href="#" className="text-background/80 hover:text-background transition-colors text-sm">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Customer Service</h4>
            <ul className="space-y-2">
              {["Contact Us", "Shipping Info", "Returns", "Warranty", "FAQ", "Live Chat"].map((link) => (
                <li key={link}>
                  <a href="#" className="text-background/80 hover:text-background transition-colors text-sm">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div className="space-y-4">
            <h4 className="font-semibold text-lg">Stay Connected</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-2 text-sm text-background/80">
                <Phone className="h-4 w-4" />
                <span>0704144239</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-background/80">
                <Mail className="h-4 w-4" />
                <span>support@smarthub.com</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-background/80">
                <MapPin className="h-4 w-4" />
                <span>Koinange Street Uniafric House Room 208</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm text-background/80">Subscribe for deals & updates</p>
              <div className="flex space-x-2">
                <Input 
                  placeholder="Enter email" 
                  className="bg-background/10 border-background/20 text-background placeholder:text-background/60"
                />
                <Button variant="secondary" size="sm">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-background/20 mt-12 pt-8 text-center">
          <p className="text-background/60 text-sm">
            © 2024 SmartHub Computers. All rights reserved. | Privacy Policy | Terms of Service
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;