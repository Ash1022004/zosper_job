import { useEffect, useMemo, useState } from 'react';
import { Job, JobFilters as JobFiltersType } from '@/types/job';
import { loadJobs, getSettings } from '@/store/jobsStore';
import { refreshFromCsvSource } from '@/lib/sources';
import { JobCard } from '@/components/JobCard';
import { JobFilters } from '@/components/JobFilters';
import { JobDetailModal } from '@/components/JobDetailModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Briefcase, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import heroImage from '@/assets/hero-jobs.jpg';

const Index = () => {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [filters, setFilters] = useState<JobFiltersType>({
    location: '',
    jobType: '',
    experienceLevel: '',
    datePosted: '',
    searchQuery: ''
  });
  const [heroSearch, setHeroSearch] = useState('');
  const whatsappInviteUrl = 'https://chat.whatsapp.com/KCVIy6e6yPG24EaF5BjHPx?mode=wwt';

  const handleHeroSearch = () => {
    setFilters(prev => ({ ...prev, searchQuery: heroSearch }));
    document.getElementById('jobs-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const jobs = useMemo(() => loadJobs(), []);

  useEffect(() => {
    const settings = getSettings();
    if (!settings.autoRefreshMs || !settings.csvSourceUrl) return;
    let active = true;
    const tick = async () => {
      await refreshFromCsvSource(settings);
      if (!active) return;
      setRefreshVersion(v => v + 1);
    };
    const id = setInterval(tick, settings.autoRefreshMs);
    tick();
    return () => { active = false; clearInterval(id); };
  }, []);

  const [refreshVersion, setRefreshVersion] = useState(0);

  const filteredJobs = useMemo(() => {
    void refreshVersion;
    const list = loadJobs();
    return list.filter(job => {
      const matchesLocation = !filters.location || job.location.includes(filters.location);
      const matchesJobType = !filters.jobType || job.jobType === filters.jobType;
      const matchesExperience = !filters.experienceLevel || job.experience === filters.experienceLevel;
      const matchesSearch = !filters.searchQuery || 
        job.title.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(filters.searchQuery.toLowerCase()) ||
        job.description.toLowerCase().includes(filters.searchQuery.toLowerCase());

      let matchesDate = true;
      if (filters.datePosted) {
        const now = new Date();
        const jobDate = new Date(job.datePosted);
        const diffDays = Math.floor((now.getTime() - jobDate.getTime()) / (1000 * 60 * 60 * 24));
        
        switch (filters.datePosted) {
          case 'Last 24 hours':
            matchesDate = diffDays <= 1;
            break;
          case 'Last 3 days':
            matchesDate = diffDays <= 3;
            break;
          case 'Last 7 days':
            matchesDate = diffDays <= 7;
            break;
          case 'Last 30 days':
            matchesDate = diffDays <= 30;
            break;
        }
      }

      return matchesLocation && matchesJobType && matchesExperience && matchesSearch && matchesDate;
    });
  }, [filters, refreshVersion]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section 
        className="relative bg-gradient-to-br from-background via-primary/5 to-accent/5 py-20 px-4 overflow-hidden"
      >
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url(${heroImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
        <div className="relative max-w-7xl mx-auto">
          <div className="absolute right-0 -top-8">
            <Link to="/admin" className="text-sm text-muted-foreground hover:underline">Admin</Link>
          </div>
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-4">
              <Briefcase className="w-4 h-4" />
              <span className="text-sm font-semibold">Daily Job Updates</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Find Your Dream Job
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Discover thousands of job opportunities updated daily from top companies across India
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <div className="flex gap-2 bg-card p-2 rounded-2xl shadow-[var(--shadow-card)]">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search job title, company, or keywords..."
                  value={heroSearch}
                  onChange={(e) => setHeroSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleHeroSearch()}
                  className="pl-12 h-14 border-0 focus-visible:ring-0 bg-transparent text-lg"
                />
              </div>
              <Button 
                onClick={handleHeroSearch}
                size="lg"
                className="h-14 px-8 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity text-lg font-semibold"
              >
                Search Jobs
              </Button>
            </div>
            <div className="flex items-center justify-center gap-6 mt-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
                {jobs.length} Active Jobs
              </span>
              <span>•</span>
              <span>Updated Daily</span>
              <span>•</span>
              <span>Direct Apply</span>
            </div>
            <div className="flex justify-center mt-6">
              <a
                href={whatsappInviteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full bg-secondary/10 text-secondary border border-secondary/40 hover:bg-secondary/20 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Join the Zosper WhatsApp Community
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Jobs Section */}
      <section id="jobs-section" className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <JobFilters filters={filters} onFilterChange={setFilters} />
          </div>

          {/* Jobs Grid */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-2">
                {filteredJobs.length} {filteredJobs.length === 1 ? 'Job' : 'Jobs'} Found
              </h2>
              <p className="text-muted-foreground">
                {filters.searchQuery || filters.location || filters.jobType || filters.experienceLevel || filters.datePosted
                  ? 'Matching your criteria'
                  : 'Browse all available positions'}
              </p>
            </div>

            {filteredJobs.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
                <h3 className="text-xl font-semibold text-foreground mb-2">No jobs found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters or search criteria
                </p>
                <Button 
                  onClick={() => setFilters({
                    location: '',
                    jobType: '',
                    experienceLevel: '',
                    datePosted: '',
                    searchQuery: ''
                  })}
                  variant="outline"
                >
                  Clear All Filters
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredJobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onViewDetails={setSelectedJob}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Job Detail Modal */}
      <JobDetailModal
        job={selectedJob}
        open={!!selectedJob}
        onOpenChange={(open) => !open && setSelectedJob(null)}
      />
    </div>
  );
};

export default Index;
