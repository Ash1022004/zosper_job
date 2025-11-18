import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const TermsAndConditions = () => {
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
              <h1 className="text-3xl font-bold mb-2">TERMS & CONDITIONS</h1>
              <p className="text-muted-foreground">Last updated: November 2025</p>
            </div>

            <p className="text-muted-foreground">
              These Terms & Conditions ("Terms") govern your use of the Zosper platform ("Platform"), 
              a service operated and owned by Career Folks Private Limited, having its registered office 
              at Lower Parel, Mumbai, Maharashtra, India ("Company", "we", "us", or "our").
            </p>

            <p className="text-muted-foreground">
              By accessing or using the Platform, you ("User", "Job Seeker", or "Employer") agree to these Terms. 
              If you do not agree, please do not use or access the Platform.
            </p>

            <div className="border-t pt-6 space-y-6">
              <section>
                <h2 className="text-2xl font-semibold mb-4">1. Nature of Services</h2>
                <p className="text-muted-foreground mb-4">
                  Zosper acts as a digital intermediary platform connecting job seekers with employers 
                  through curated and aggregated job postings.
                </p>
                <p className="text-muted-foreground mb-4">
                  We do not guarantee employment, job availability, or authenticity of third-party listings 
                  unless explicitly verified by the Company.
                </p>
                <p className="text-muted-foreground mb-2">The services include:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Job postings and aggregation from verified and public sources.</li>
                  <li>Candidate registration and resume upload for job search purposes.</li>
                  <li>Email alerts, recommendations, and notifications related to job opportunities.</li>
                  <li>Communication tools between employers and job seekers.</li>
                  <li>Optional premium visibility or job promotion features for employers.</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">2. Eligibility</h2>
                <p className="text-muted-foreground">
                  By using this Platform, you confirm that you are at least 18 years of age and have full 
                  legal capacity to enter into this agreement.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">3. Registration & Account Security</h2>
                <p className="text-muted-foreground mb-4">
                  Users may be required to register via email or social login. You agree to:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Provide accurate and updated information.</li>
                  <li>Maintain confidentiality of your credentials.</li>
                  <li>Immediately report unauthorized access to your account.</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  We reserve the right to suspend accounts showing suspicious or automated activity.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">4. Job Postings and Third-Party Content</h2>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>
                    Zosper aggregates and hosts listings submitted by employers, recruiters, or scraped 
                    from publicly available websites.
                  </li>
                  <li>
                    The Company does not guarantee the authenticity, accuracy, or current status of job 
                    postings unless verified.
                  </li>
                  <li>
                    Zosper shall not be responsible for:
                    <ul className="list-circle list-inside ml-6 mt-2 space-y-1">
                      <li>Hiring outcomes or rejection decisions.</li>
                      <li>Fraudulent or misleading job listings posted by external employers.</li>
                      <li>Losses or damages arising from reliance on posted content.</li>
                    </ul>
                  </li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  Employers are solely responsible for the accuracy of their listings and must comply with 
                  all applicable labour, data protection, and anti-discrimination laws.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">5. User Conduct & Obligations</h2>
                <p className="text-muted-foreground mb-4">You agree not to:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>Upload, post, or share false or misleading job listings or resumes.</li>
                  <li>Attempt to gain unauthorized access to any data or system.</li>
                  <li>Copy, modify, or resell any platform content.</li>
                  <li>Post discriminatory or unlawful material.</li>
                </ul>
                <p className="text-muted-foreground mt-4">
                  Violation of these rules may result in immediate suspension, termination, or legal action.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">6. Intellectual Property</h2>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>
                    All logos, trade names, databases, AI tools, and website designs are the exclusive 
                    property of Career Folks Private Limited.
                  </li>
                  <li>
                    Users retain ownership of their resumes and job postings but grant Zosper a 
                    non-exclusive, royalty-free license to display and process such data for operational purposes.
                  </li>
                  <li>
                    Unauthorized reproduction, scraping, or resale of platform data is strictly prohibited.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">7. Data Accuracy & Disclaimer</h2>
                <p className="text-muted-foreground mb-4">
                  Zosper is an information facilitation platform.
                </p>
                <p className="text-muted-foreground mb-4">
                  We make reasonable efforts to ensure accuracy but do not guarantee the completeness or 
                  timeliness of information.
                </p>
                <p className="text-muted-foreground">
                  The Company shall not be held liable for any business decisions made based on platform information.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">8. Subscription, Payments & Refunds</h2>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>
                    Pricing and subscription tiers (if applicable) are displayed transparently on the website.
                  </li>
                  <li>Payments must be made through authorized gateways.</li>
                  <li>
                    Refunds are not provided except in cases of duplicate payments or technical errors 
                    verified by us.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">9. Limitation of Liability</h2>
                <p className="text-muted-foreground mb-4">
                  To the fullest extent permitted by law, Career Folks Private Limited shall not be liable for:
                </p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                  <li>
                    Any direct, indirect, or consequential losses arising from job applications or 
                    recruitment decisions.
                  </li>
                  <li>
                    Any fraud, misrepresentation, or misconduct by third-party employers.
                  </li>
                  <li>
                    Service interruptions or loss of user data due to technical errors, cyber incidents, 
                    or maintenance.
                  </li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">10. Indemnity</h2>
                <p className="text-muted-foreground">
                  You agree to indemnify and hold harmless Career Folks Private Limited (Zosper), 
                  its directors, officers, and employees from all claims or damages arising out of your 
                  use of the Platform, including but not limited to violation of these Terms or misuse 
                  of third-party content.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">11. Termination</h2>
                <p className="text-muted-foreground">
                  We reserve the right to suspend or terminate your account or access without prior notice 
                  if you breach these Terms or engage in unauthorized use of the Platform.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold mb-4">12. Governing Law & Jurisdiction</h2>
                <p className="text-muted-foreground mb-4">
                  These Terms shall be governed by and construed in accordance with the laws of India.
                </p>
                <p className="text-muted-foreground">
                  Any disputes shall be subject exclusively to the jurisdiction of the courts of Mumbai, Maharashtra.
                </p>
              </section>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TermsAndConditions;

