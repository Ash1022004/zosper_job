import { Link } from 'react-router-dom';
import { Linkedin, Instagram, Send, Youtube } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t bg-background mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Follow Us Section */}
          <div>
            <h3 className="font-semibold mb-4">Follow us</h3>
            <div className="flex flex-col gap-2">
              <a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="w-4 h-4" />
                LinkedIn
              </a>
              <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="w-4 h-4" />
                Instagram
              </a>
              <a href="https://t.me" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Send className="w-4 h-4" />
                Telegram
              </a>
              <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
                <Youtube className="w-4 h-4" />
                YouTube
              </a>
            </div>
          </div>

          {/* Community Section */}
          <div>
            <h3 className="font-semibold mb-4">Community</h3>
            <div className="flex flex-col gap-2">
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Join our WhatsApp
              </a>
              <Link to="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Jobs based on CV
              </Link>
              <Link to="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Blogs
              </Link>
              <Link to="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Testimonials
              </Link>
            </div>
          </div>

          {/* Legal Section */}
          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <div className="flex flex-col gap-2">
              <Link to="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Terms of Service
              </Link>
              <Link to="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-2 pt-6  text-center text-sm text-muted-foreground">
          © Careerfolks Private Limited. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;

