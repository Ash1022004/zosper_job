import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="absolute top-20 left-4 z-50">
        <Link to="/">
          <Button variant="outline" size="sm">
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
        </Link>
      </div>
      
      <div className="max-w-4xl mx-auto px-4 py-12">
        <Card className="p-8">
          <CardContent className="space-y-8">
            <div>
              <h1 className="text-3xl font-bold mb-2">PRIVACY POLICY</h1>
              <p className="text-muted-foreground">Effective Date: November 2025</p>
            </div>

            <p className="text-muted-foreground">
              This Privacy Policy describes how Career Folks Private Limited ("Zosper") collects, 
              processes, and protects personal information of its users in compliance with the Information 
              Technology Act, 2000 and applicable data protection standards.
            </p>

            <div className="border-t pt-6 space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mb-4">1. Data We Collect</h2>
                
                <div className="mb-4">
                  <h3 className="text-lg font-medium mb-2">a) Job Seekers</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li>Name, contact details, email, city, and resume content.</li>
                    <li>Profile preferences, job alerts, and communication logs.</li>
                  </ul>
                </div>

                <div className="mb-4">
                  <h3 className="text-lg font-medium mb-2">b) Employers</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li>Company name, representative details, and contact information.</li>
                    <li>Job postings and recruitment preferences.</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">c) Technical Data</h3>
                  <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                    <li>IP address, device info, browser cookies, and analytics metrics.</li>
                    <li>
                      Third-party tracking (Google Analytics, Meta Pixel, etc.) for improving user experience.
                    </li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">2. Purpose of Data Processing</h2>
                <p className="text-muted-foreground mb-2">We use collected data to:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Facilitate job posting, search, and matching.</li>
                  <li>Deliver alerts, recommendations, and communication between parties.</li>
                  <li>Detect fraud, improve platform security, and analyze usage.</li>
                  <li>Enable marketing or promotional communication (opt-out available).</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">3. Data Storage & Security</h2>
                <p className="text-muted-foreground mb-4">
                  All personal data is stored on secure, encrypted servers located in India.
                </p>
                <p className="text-muted-foreground mb-4">
                  We implement firewalls, SSL certificates, and access control measures to prevent 
                  unauthorized access.
                </p>
                <p className="text-muted-foreground">
                  However, you acknowledge that no system is 100% secure, and data transmission involves 
                  inherent risks.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">4. Data Sharing</h2>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>With employers and recruiters when you apply or opt to share your profile.</li>
                  <li>With analytics and marketing service providers for optimization.</li>
                  <li>We do not sell or rent your personal data.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">5. Cookies and Tracking</h2>
                <p className="text-muted-foreground mb-4">Our site uses cookies to:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Maintain login sessions.</li>
                  <li>Personalize user recommendations.</li>
                  <li>Collect analytics to improve performance.</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  You can disable cookies, but certain features may not function properly.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">6. User Rights</h2>
                <p className="text-muted-foreground mb-2">Users can:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Access or modify their personal data.</li>
                  <li>
                    Request data deletion or account deactivation by contacting jobvault25@gmail.com.
                  </li>
                  <li>Opt-out of non-essential communications.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">7. Data Retention</h2>
                <p className="text-muted-foreground mb-4">
                  Data is retained only for the duration necessary to fulfill service obligations or 
                  comply with legal requirements.
                </p>
                <p className="text-muted-foreground">
                  Inactive accounts may be archived after 12 months.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">8. Changes to Policy</h2>
                <p className="text-muted-foreground">
                  We may revise this Policy from time to time. Updates will be reflected on the website, 
                  and continued use constitutes acceptance.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">9. Contact Information</h2>
                <p className="text-muted-foreground mb-4">
                  For privacy or legal concerns, please contact:
                </p>
                <div className="bg-muted/50 p-4 rounded-lg space-y-2 text-muted-foreground">
                  <p className="font-medium">Career Folks Private Limited (Zosper)</p>
                  <p>Lower Parel, Mumbai, Maharashtra, India</p>
                  <p>
                    <a href="mailto:jobvault25@gmail.com" className="text-primary hover:underline">
                      jobvault25@gmail.com
                    </a>
                  </p>
                </div>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PrivacyPolicy;

