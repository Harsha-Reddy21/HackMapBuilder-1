import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Users } from "lucide-react";
import { Team, User } from "@shared/schema";
import SkillTag from "./skill-tag";

interface TeamCardProps {
  team: Team;
  hackathonTitle?: string;
  hackathonId?: number;
  creator?: User;
  memberCount?: number;
  userSkills?: string[];
  className?: string;
}

export function TeamCard({
  team,
  hackathonTitle,
  hackathonId,
  creator,
  memberCount = 1,
  userSkills = [],
  className,
}: TeamCardProps) {
  const matchingSkills = team.requiredSkills?.filter(skill => 
    userSkills.includes(skill)
  ) || [];

  return (
    <Card className={className}>
      <CardContent className="p-6">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <Avatar className="h-10 w-10 bg-primary-100">
              <AvatarFallback className="text-primary-600">
                {team.name.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 truncate">{team.name}</h3>
            {hackathonTitle && (
              <p className="text-sm text-gray-500 truncate">
                {hackathonTitle}
              </p>
            )}
          </div>
        </div>
        
        <div className="mt-3">
          <p className="text-sm text-gray-600 line-clamp-2">{team.description}</p>
        </div>
        
        {/* Required Skills */}
        {team.requiredSkills && team.requiredSkills.length > 0 && (
          <div className="mt-3">
            <p className="text-xs font-medium text-gray-500 mb-1.5">Looking for:</p>
            <div className="flex flex-wrap gap-1.5">
              {team.requiredSkills.map(skill => (
                <SkillTag
                  key={skill}
                  skill={skill}
                  size="sm"
                  type="required"
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Matching Skills */}
        {matchingSkills.length > 0 && (
          <div className="mt-3">
            <p className="text-xs font-medium text-gray-500 mb-1.5">Your matches:</p>
            <div className="flex flex-wrap gap-1.5">
              {matchingSkills.map(skill => (
                <SkillTag
                  key={skill}
                  skill={skill}
                  size="sm"
                  type="match"
                />
              ))}
            </div>
          </div>
        )}
        
        {/* Team info */}
        <div className="mt-4 flex items-center text-xs text-gray-500 justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center">
              <Users className="mr-1 h-3.5 w-3.5" />
              {memberCount}/5 members
            </span>
          </div>
          
          <Link href={`/teams/${team.id}`}>
            <Button size="sm" variant="outline">
              <MessageSquare className="mr-1.5 h-3.5 w-3.5" />
              Contact Team
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default TeamCard;
