import { Job } from '@/types/job';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Briefcase, Calendar, IndianRupee } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface JobCardProps {
  job: Job;
  onViewDetails: (job: Job) => void;
}

export const JobCard = ({ job, onViewDetails }: JobCardProps) => {
  const salaryLabel = job.salary?.trim();
  const salaryDisplay = salaryLabel
    ? /₹|rs|inr/i.test(salaryLabel)
      ? salaryLabel
      : `₹${salaryLabel}`
    : '';
  return (
    <Card className="group p-6 transition-all duration-300 hover:shadow-[var(--shadow-card-hover)] bg-gradient-to-br from-card to-muted/20 border-border/50">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors mb-2">
              {job.title}
            </h3>
            <p className="text-lg font-semibold text-muted-foreground mb-3">
              {job.company}
            </p>
          </div>
          <Badge variant="secondary" className="shrink-0">
            {job.jobType}
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <MapPin className="w-4 h-4 text-primary" />
            <span>{job.location}</span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Briefcase className="w-4 h-4 text-primary" />
            <span>{job.experience}</span>
          </div>
          {salaryDisplay && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <IndianRupee className="w-4 h-4 text-secondary" />
              <span className="font-semibold text-secondary">{salaryDisplay}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="w-4 h-4 text-primary" />
            <span>{formatDistanceToNow(job.datePosted, { addSuffix: true })}</span>
          </div>
        </div>

        <p className="text-muted-foreground line-clamp-2">
          {job.description}
        </p>

        <div className="flex flex-wrap gap-2">
          {job.requirements.slice(0, 3).map((req, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {req.split(' ').slice(0, 3).join(' ')}...
            </Badge>
          ))}
        </div>

        <Button 
          onClick={() => onViewDetails(job)}
          className="w-full mt-2 bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
        >
          View Details
        </Button>
      </div>
    </Card>
  );
};
