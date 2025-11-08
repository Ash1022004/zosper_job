import { useMemo, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Job } from '@/types/job';
import { getSettings, JobsSettings, loadJobs, saveJobs, saveSettings, upsertJobs } from '@/store/jobsStore';
import { getCurrentUser } from '@/store/authStore';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { refreshFromCsvSource } from '@/lib/sources';
import { useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';
import { apiLogout, analyticsApi } from '@/lib/api';

function parseCsv(text: string): Job[] {
  // Minimal CSV parser for simple admin use: expects header names matching Job keys
  // Required: id,title,company,location,experience,datePosted,jobType,description
  // Optional: salary,benefits (| separated),requirements (|),responsibilities (|),applyUrl,contactEmail,contactWhatsApp,companyLogo
  const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
  if (lines.length < 2) return [];
  const header = lines[0].split(',').map(h => h.trim());
  const idx = (name: string) => header.findIndex(h => h.toLowerCase() === name.toLowerCase());
  const get = (arr: string[], name: string) => {
    const i = idx(name);
    return i >= 0 ? arr[i]?.trim() ?? '' : '';
  };
  const jobs: Job[] = [];
  for (let li = 1; li < lines.length; li++) {
    const parts = lines[li].split(',');
    const id = get(parts, 'id') || `${Date.now()}-${li}`;
    const title = get(parts, 'title');
    const company = get(parts, 'company');
    const location = get(parts, 'location');
    const experience = get(parts, 'experience');
    const dateStr = get(parts, 'datePosted');
    const jobType = get(parts, 'jobType') as Job['jobType'];
    const description = get(parts, 'description');
    if (!title || !company || !location || !experience || !dateStr || !jobType || !description) continue;
    const salary = get(parts, 'salary');
    const benefits = get(parts, 'benefits') ? get(parts, 'benefits').split('|').map(s => s.trim()).filter(Boolean) : undefined;
    const requirements = get(parts, 'requirements') ? get(parts, 'requirements').split('|').map(s => s.trim()).filter(Boolean) : [];
    const responsibilities = get(parts, 'responsibilities') ? get(parts, 'responsibilities').split('|').map(s => s.trim()).filter(Boolean) : [];
    const applyUrl = get(parts, 'applyUrl') || undefined;
    const contactEmail = get(parts, 'contactEmail') || undefined;
    const contactWhatsApp = get(parts, 'contactWhatsApp') || undefined;
    const companyLogo = get(parts, 'companyLogo') || undefined;
    const datePosted = new Date(dateStr);
    if (isNaN(datePosted.getTime())) continue;
    jobs.push({ id, title, company, location, experience, salary: salary || undefined, datePosted, jobType, description, requirements, responsibilities, benefits, applyUrl, contactEmail, contactWhatsApp, companyLogo });
  }
  return jobs;
}

const Admin = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [csvText, setCsvText] = useState('');
  const [csvFileName, setCsvFileName] = useState('');
  const [settings, setSettings] = useState<JobsSettings>(() => getSettings());
  const [jobsVersion, setJobsVersion] = useState(0);
  const existingJobs = useMemo(() => loadJobs(), [jobsVersion]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const [manual, setManual] = useState({
    title: '',
    company: '',
    location: '',
    experience: '',
    salary: '',
    jobType: 'Full-time' as Job['jobType'],
    description: '',
    requirements: '',
    responsibilities: '',
    applyUrl: '',
    contactEmail: '',
    contactWhatsApp: ''
  });

  const [editingJob, setEditingJob] = useState<Job | null>(null);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const data = await analyticsApi.getSummary();
      setAnalytics(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      toast({ title: 'Failed to load analytics', variant: 'destructive' });
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const handleCsvImport = () => {
    const parsed = parseCsv(csvText);
    if (!parsed.length) {
      toast({ title: 'CSV Import', description: 'No valid rows found', variant: 'destructive' });
      return;
    }
    const merged = upsertJobs(existingJobs, parsed);
    saveJobs(merged);
    toast({ title: 'Jobs updated', description: `${parsed.length} rows processed.` });
  };

  const handleSettingsSave = () => {
    saveSettings(settings);
    toast({ title: 'Settings saved' });
  };

  const handleCsvFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const text = String(reader.result || '');
      setCsvText(text);
      setCsvFileName(file.name);
    };
    reader.readAsText(file);
  };

  const handleManualAdd = () => {
    if (!manual.title || !manual.company || !manual.location || !manual.experience || !manual.description) {
      toast({ title: 'Missing fields', description: 'Please fill required fields', variant: 'destructive' });
      return;
    }
    const requirementsArray = manual.requirements ? manual.requirements.split('\n').map(r => r.trim()).filter(Boolean) : [];
    const responsibilitiesArray = manual.responsibilities ? manual.responsibilities.split('\n').map(r => r.trim()).filter(Boolean) : [];
    
    const newJob: Job = {
      id: editingJob?.id || `${Date.now()}`,
      title: manual.title,
      company: manual.company,
      location: manual.location,
      experience: manual.experience,
      salary: manual.salary || undefined,
      datePosted: editingJob?.datePosted || new Date(),
      jobType: manual.jobType,
      description: manual.description,
      requirements: requirementsArray,
      responsibilities: responsibilitiesArray,
      applyUrl: manual.applyUrl || undefined,
      contactEmail: manual.contactEmail || undefined,
      contactWhatsApp: manual.contactWhatsApp || undefined
    };
    const merged = upsertJobs(loadJobs(), [newJob]);
    saveJobs(merged);
    toast({ title: editingJob ? 'Job updated' : 'Job added' });
    setManual({
      title: '', company: '', location: '', experience: '', salary: '', jobType: 'Full-time', description: '', requirements: '', responsibilities: '', applyUrl: '', contactEmail: '', contactWhatsApp: ''
    });
    setEditingJob(null);
    setJobsVersion(v => v + 1);
  };

  const handleEditJob = (job: Job) => {
    setEditingJob(job);
    setManual({
      title: job.title,
      company: job.company,
      location: job.location,
      experience: job.experience,
      salary: job.salary || '',
      jobType: job.jobType,
      description: job.description,
      requirements: job.requirements.join('\n'),
      responsibilities: job.responsibilities.join('\n'),
      applyUrl: job.applyUrl || '',
      contactEmail: job.contactEmail || '',
      contactWhatsApp: job.contactWhatsApp || ''
    });
    // Scroll to the "Add Job Manually" section
    const addJobSection = document.getElementById('add-job-manually');
    if (addJobSection) {
      addJobSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleDeleteJob = (jobId: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return;
    const jobs = loadJobs();
    const filtered = jobs.filter(j => j.id !== jobId);
    saveJobs(filtered);
    toast({ title: 'Job deleted' });
    setJobsVersion(v => v + 1);
  };

  const handleCancelEdit = () => {
    setEditingJob(null);
    setManual({
      title: '', company: '', location: '', experience: '', salary: '', jobType: 'Full-time', description: '', requirements: '', responsibilities: '', applyUrl: '', contactEmail: '', contactWhatsApp: ''
    });
  };

  const handleRefreshNow = async () => {
    const count = await refreshFromCsvSource(getSettings());
    toast({ title: 'Refreshed from source', description: `${count} records processed` });
  };

  const user = getCurrentUser();

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            size="sm"
            onClick={async () => {
              await apiLogout();
              navigate('/', { replace: true });
            }}
          >
            <Home className="w-4 h-4 mr-2" />
            Home
          </Button>
          <div className="text-sm text-muted-foreground">Signed in as {user?.email}</div>
        </div>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Upload CSV File</CardTitle>
          <CardDescription>Upload a CSV file with job listings. Expected columns:</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="list-disc list-inside text-sm text-muted-foreground">
            <li>Title, Company, Location, Experience, Salary (optional), Date Posted</li>
            <li>Description, Job Type (Full-time/Internship/Contract)</li>
            <li>Email (optional), WhatsApp (optional)</li>
          </ul>
          <div className="space-y-2">
            <Input type="file" accept=".csv" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCsvFile(f); }} />
            {csvFileName ? <div className="text-xs text-muted-foreground">Loaded: {csvFileName}</div> : null}
          </div>
          <Label htmlFor="csv">Or paste CSV</Label>
          <Textarea id="csv" value={csvText} onChange={(e) => setCsvText(e.target.value)} rows={8} placeholder="id,title,company,location,experience,datePosted,jobType,description,requirements,benefits,salary,contactEmail,contactWhatsApp,companyLogo\n1,Senior Frontend,TechCorp,Bangalore,3-5 years,2025-10-26,Full-time,Description,React|TS,Health Insurance,₹15-25 LPA,hr@x.com,+91-..." />
          <div className="flex gap-2">
            <Button onClick={handleCsvImport}>Import CSV</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>External Source</CardTitle>
          <CardDescription>Configure a published Google Sheet CSV link or Airtable CSV view.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="csvUrl">CSV Source URL</Label>
            <Input id="csvUrl" value={settings.csvSourceUrl || ''} onChange={(e) => setSettings(s => ({ ...s, csvSourceUrl: e.target.value }))} placeholder="https://docs.google.com/spreadsheets/d/.../pub?output=csv" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="refresh">Auto-refresh interval (ms)</Label>
            <Input id="refresh" type="number" value={settings.autoRefreshMs ?? ''} onChange={(e) => setSettings(s => ({ ...s, autoRefreshMs: e.target.value ? Number(e.target.value) : undefined }))} placeholder="e.g., 3600000 for 1 hour" />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSettingsSave}>Save Settings</Button>
            <Button variant="outline" onClick={handleRefreshNow}>Refresh now</Button>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Section */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>User Analytics</CardTitle>
              <CardDescription>View user activity, logins, and job applications</CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={loadAnalytics} disabled={loadingAnalytics}>
              {loadingAnalytics ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loadingAnalytics ? (
            <div className="text-center py-8 text-muted-foreground">Loading analytics...</div>
          ) : analytics ? (
            <div className="space-y-6">
              {/* Summary Stats */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="border rounded-lg p-4">
                  <div className="text-2xl font-bold">{analytics.totalUsers}</div>
                  <div className="text-sm text-muted-foreground">Total Users</div>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="text-2xl font-bold">{analytics.uniqueLoggedInUsers}</div>
                  <div className="text-sm text-muted-foreground">Logged In Users</div>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="text-2xl font-bold">{analytics.totalLogins}</div>
                  <div className="text-sm text-muted-foreground">Total Logins</div>
                  <div className="text-xs text-muted-foreground mt-1">{analytics.recentLogins} in last 30 days</div>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="text-2xl font-bold">{analytics.totalApplications}</div>
                  <div className="text-sm text-muted-foreground">Total Applications</div>
                  <div className="text-xs text-muted-foreground mt-1">{analytics.recentApplications} in last 30 days</div>
                </div>
              </div>

              {/* Most Applied Jobs */}
              {analytics.applicationsByJob.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">Most Applied Jobs</h3>
                  <div className="space-y-2">
                    {analytics.applicationsByJob.slice(0, 10).map((job: any, index: number) => (
                      <div key={job.jobId} className="border rounded-lg p-3 flex justify-between items-center">
                        <div>
                          <div className="font-medium">{job.jobTitle}</div>
                          <div className="text-sm text-muted-foreground">{job.company}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold">{job.count}</div>
                          <div className="text-xs text-muted-foreground">applications</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* User Application History */}
              {analytics.userApplications.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">User Application History</h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto">
                    {analytics.userApplications.map((userApp: any) => (
                      <div key={userApp.userId} className="border rounded-lg p-3">
                        <div className="font-medium mb-2">{userApp.email}</div>
                        <div className="text-sm text-muted-foreground">
                          Applied to {userApp.applications.length} job(s):
                        </div>
                        <ul className="mt-2 space-y-1">
                          {userApp.applications.map((app: any, idx: number) => (
                            <li key={idx} className="text-sm">
                              • {app.jobTitle} at {app.company}
                              <span className="text-xs text-muted-foreground ml-2">
                                ({new Date(app.timestamp).toLocaleDateString()})
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Activity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-3">Recent Logins</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {analytics.loginHistory.slice(0, 20).map((login: any, index: number) => (
                      <div key={index} className="text-sm border-b pb-2">
                        <div className="font-medium">{login.email}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(login.timestamp).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-3">Recent Applications</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {analytics.applicationHistory.slice(0, 20).map((app: any, index: number) => (
                      <div key={index} className="text-sm border-b pb-2">
                        <div className="font-medium">{app.email}</div>
                        <div className="text-muted-foreground">{app.jobTitle} at {app.company}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(app.timestamp).toLocaleString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <Button onClick={loadAnalytics} variant="outline" className="w-full">
                Refresh Analytics
              </Button>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">No analytics data available</div>
          )}
        </CardContent>
      </Card>

      <Card id="add-job-manually">
        <CardHeader>
          <CardTitle>{editingJob ? 'Edit Job' : 'Add Job Manually'}</CardTitle>
          <CardDescription>{editingJob ? 'Update the job details below.' : 'Use this form to add a single job posting.'}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Job Title *</Label>
              <Input value={manual.title} onChange={(e) => setManual(s => ({ ...s, title: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Company *</Label>
              <Input value={manual.company} onChange={(e) => setManual(s => ({ ...s, company: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Location *</Label>
              <Input value={manual.location} onChange={(e) => setManual(s => ({ ...s, location: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Experience *</Label>
              <Input placeholder="e.g., 2+ years" value={manual.experience} onChange={(e) => setManual(s => ({ ...s, experience: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Salary</Label>
              <Input placeholder="e.g., ₹10-15 LPA" value={manual.salary} onChange={(e) => setManual(s => ({ ...s, salary: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Job Type</Label>
              <Select value={manual.jobType} onValueChange={(v) => setManual(s => ({ ...s, jobType: v as Job['jobType'] }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Full-time">Full-time</SelectItem>
                  <SelectItem value="Internship">Internship</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                  <SelectItem value="Part-time">Part-time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-4 space-y-2">
              <Label>Description *</Label>
              <Textarea rows={5} value={manual.description} onChange={(e) => setManual(s => ({ ...s, description: e.target.value }))} />
            </div>
          <div className="md:col-span-4 space-y-2">
            <Label>Application Link</Label>
            <Input
              placeholder="Paste external apply link or Google Form URL"
              value={manual.applyUrl}
              onChange={(e) => setManual(s => ({ ...s, applyUrl: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground">If provided, clicking Apply will open this link.</p>
          </div>
            <div className="md:col-span-4 space-y-2">
              <Label>Requirements</Label>
              <Textarea 
                rows={4} 
                value={manual.requirements} 
                onChange={(e) => setManual(s => ({ ...s, requirements: e.target.value }))}
                placeholder="Enter each requirement on a new line&#10;e.g.,&#10;Bachelor's degree in Computer Science&#10;3+ years of experience&#10;Knowledge of React"
              />
            </div>
            <div className="md:col-span-4 space-y-2">
              <Label>Responsibilities</Label>
              <Textarea 
                rows={4} 
                value={manual.responsibilities} 
                onChange={(e) => setManual(s => ({ ...s, responsibilities: e.target.value }))}
                placeholder="Enter each responsibility on a new line&#10;e.g.,&#10;Develop and maintain web applications&#10;Collaborate with cross-functional teams&#10;Write clean and efficient code"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={manual.contactEmail} onChange={(e) => setManual(s => ({ ...s, contactEmail: e.target.value }))} placeholder="hr@company.com" />
            </div>
            <div className="space-y-2">
              <Label>WhatsApp</Label>
              <Input value={manual.contactWhatsApp} onChange={(e) => setManual(s => ({ ...s, contactWhatsApp: e.target.value }))} placeholder="+1234567890" />
            </div>
          </div>
          <div className="pt-2 flex gap-2">
            {editingJob && (
              <Button variant="outline" className="w-full" onClick={handleCancelEdit}>Cancel</Button>
            )}
            <Button className="w-full" onClick={handleManualAdd}>{editingJob ? 'Update Job' : 'Add Job'}</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Jobs ({existingJobs.length})</CardTitle>
          <CardDescription>View and edit jobs listed on the website.</CardDescription>
        </CardHeader>
        <CardContent>
          {existingJobs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No jobs found. Add jobs using the form above or import CSV.</p>
          ) : (
            <div className="space-y-4">
              {existingJobs.map((job) => (
                <div key={job.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{job.title}</h3>
                      <p className="text-sm text-muted-foreground">{job.company} • {job.location}</p>
                      <p className="text-xs text-muted-foreground mt-1">{job.jobType} • {job.experience}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEditJob(job)}>Edit</Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteJob(job.id)}>Delete</Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Admin;


