import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Timer, ChevronRight } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Hackathon } from "@shared/schema";
import { format } from "date-fns";

interface HackathonCardProps {
  hackathon: Hackathon;
  isRegistrationOpen?: boolean;
  isClosingSoon?: boolean;
  participantCount?: number;
}

export function HackathonCard({ 
  hackathon, 
  isRegistrationOpen = true,
  isClosingSoon = false,
  participantCount = 0
}: HackathonCardProps) {
  // Convert string dates to Date objects
  const startDate = new Date(hackathon.startDate);
  const endDate = new Date(hackathon.endDate);
  const registrationDeadline = new Date(hackathon.registrationDeadline);
  
  // Format the dates
  const dateRange = `${format(startDate, 'MMM d')}-${format(endDate, 'MMM d, yyyy')}`;
  const deadlineText = `Registration ends: ${format(registrationDeadline, 'MMM d, yyyy')}`;
  
  // Generate random number of participants for display
  const participants = participantCount || Math.floor(Math.random() * 50) + 5;

  // Determine status badge color
  let statusBadge = null;
  if (isRegistrationOpen) {
    statusBadge = (
      <div className="absolute top-0 right-0 bg-primary-500 text-white text-xs font-bold px-3 py-1 m-2 rounded-full">
        Registration Open
      </div>
    );
  } else if (isClosingSoon) {
    statusBadge = (
      <div className="absolute top-0 right-0 bg-yellow-500 text-white text-xs font-bold px-3 py-1 m-2 rounded-full">
        Closing Soon
      </div>
    );
  }

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow duration-300 h-full">
      <div className="h-48 w-full relative">
        <img 
          className="h-full w-full object-cover" 
          src={hackathon.imageUrl || "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"} 
          alt={hackathon.title} 
        />
        {statusBadge}
      </div>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-gray-900">{hackathon.title}</h3>
          <Badge variant="outline" className="bg-primary-100 text-primary-800 hover:bg-primary-200">
            {hackathon.tags?.[0] || "Hackathon"}
          </Badge>
        </div>
        <p className="text-sm text-gray-500 mb-4 line-clamp-2">{hackathon.description}</p>
        
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <Calendar className="h-4 w-4 mr-1.5" />
          <span>{dateRange}</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-500 mb-6">
          <Timer className="h-4 w-4 mr-1.5" />
          <span>{deadlineText}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex -space-x-2 overflow-hidden">
            {Array(Math.min(3, participants > 3 ? 3 : participants)).fill(0).map((_, i) => (
              <Avatar key={i} className="h-6 w-6 border-2 border-white">
                <AvatarFallback className={cn(
                  i === 0 && "bg-blue-200",
                  i === 1 && "bg-green-200",
                  i === 2 && "bg-purple-200"
                )}>
                  {String.fromCharCode(65 + i)}
                </AvatarFallback>
              </Avatar>
            ))}
            {participants > 3 && (
              <div className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 ring-2 ring-white">
                <span className="text-xs font-medium text-gray-400">{participants - 3}+</span>
              </div>
            )}
          </div>
          <Link href={`/hackathons/${hackathon.id}`}>
            <a className="text-primary-600 hover:text-primary-800 text-sm font-medium inline-flex items-center">
              View Details
              <ChevronRight className="ml-1 h-4 w-4" />
            </a>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default HackathonCard;
