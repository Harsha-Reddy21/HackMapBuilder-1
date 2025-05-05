import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, MessageSquare, ChevronRight } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useAuth } from "@/contexts/auth-context";
import { ProjectIdea, Team } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface IdeaCardProps {
  idea: ProjectIdea;
  team?: Team;
  endorsementCount?: number;
  commentCount?: number;
  isEndorsed?: boolean;
}

export function IdeaCard({ 
  idea, 
  team,
  endorsementCount = 0,
  commentCount = 0,
  isEndorsed = false
}: IdeaCardProps) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [endorsed, setEndorsed] = useState(isEndorsed);
  const [endorsements, setEndorsements] = useState(endorsementCount);
  const [comments, setComments] = useState(commentCount);
  
  const endorseMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("You must be logged in to endorse");
      const res = await apiRequest('POST', '/api/ideas/endorsements', {
        projectId: idea.id,
        userId: user.id
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ideas'] });
      setEndorsed(true);
      setEndorsements(prev => prev + 1);
      toast({
        title: "Idea endorsed",
        description: "You've successfully endorsed this idea!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Endorsement failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const unendorseMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("You must be logged in to remove endorsement");
      const res = await apiRequest('DELETE', `/api/ideas/endorsements?projectId=${idea.id}&userId=${user.id}`, undefined);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ideas'] });
      setEndorsed(false);
      setEndorsements(prev => prev - 1);
      toast({
        title: "Endorsement removed",
        description: "You've removed your endorsement from this idea.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to remove endorsement",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleEndorsement = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please login to endorse ideas",
        variant: "destructive",
      });
      return;
    }

    if (endorsed) {
      unendorseMutation.mutate();
    } else {
      endorseMutation.mutate();
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-sm transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{idea.title}</h3>
            {team && <p className="text-sm text-gray-500 mt-1">by {team.name}</p>}
          </div>
          
          {idea.techStack && idea.techStack.length > 0 && (
            <Badge 
              variant="outline" 
              className="bg-primary-100 text-primary-800 border-0"
            >
              {idea.techStack[0]}
            </Badge>
          )}
        </div>
        
        <p className="text-gray-600 mb-6">{idea.summary}</p>
        
        {/* Tech Stack Tags */}
        {idea.techStack && idea.techStack.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {idea.techStack.map(tech => (
              <Badge key={tech} variant="outline" className="bg-gray-100 text-gray-800 border-0">
                {tech}
              </Badge>
            ))}
          </div>
        )}
        
        <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="sm"
              className={`flex items-center text-gray-500 hover:text-primary-500 ${endorsed ? 'text-primary-500' : ''}`}
              onClick={handleEndorsement}
              disabled={endorseMutation.isPending || unendorseMutation.isPending}
            >
              <ThumbsUp className={`mr-1 h-4 w-4 ${endorsed ? 'fill-primary-500' : ''}`} />
              <span>{endorsements}</span>
            </Button>
            
            <Button 
              variant="ghost" 
              size="sm"
              className="ml-4 flex items-center text-gray-500 hover:text-primary-500"
            >
              <MessageSquare className="mr-1 h-4 w-4" />
              <span>{comments}</span>
            </Button>
          </div>
          
          <Button variant="ghost" size="sm" className="text-primary-600 hover:text-primary-700">
            View Details
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default IdeaCard;
