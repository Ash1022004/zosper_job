import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { MessageSquare } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { feedbackApi } from '@/lib/api';
import { getUser } from '@/store/userStore';

const FeedbackPanel = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();
  const user = getUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      toast({ title: 'Please enter your feedback', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      await feedbackApi.submit(email || user?.email || undefined, message);
      toast({ title: 'Feedback submitted', description: 'Thank you for your feedback!' });
      setMessage('');
      setEmail('');
      setOpen(false);
    } catch (error) {
      toast({ title: 'Failed to submit feedback', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          className="fixed bottom-6 right-6 rounded-full w-14 h-14 shadow-lg z-50"
          size="lg"
        >
          <MessageSquare className="w-5 h-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Feedback</SheetTitle>
          <SheetDescription>
            We'd love to hear your thoughts, suggestions, or report any issues.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="feedback-email">Email (optional)</Label>
            <Input
              id="feedback-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={user?.email || "your@email.com"}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="feedback-message">Message *</Label>
            <Textarea
              id="feedback-message"
              rows={6}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Share your feedback, suggestions, or report issues..."
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Feedback'}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
};

export default FeedbackPanel;

