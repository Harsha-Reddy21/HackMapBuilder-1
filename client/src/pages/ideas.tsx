import { useState } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';
import { ProjectIdea, Team } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import IdeaCard from '@/components/ideas/idea-card';
import IdeaForm from '@/components/ideas/idea-form';
import { Search, Lightbulb, Plus, Filter, Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Ideas() {
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [techFilter, setTechFilter] = useState('');
  const [createIdeaOpen, setCreateIdeaOpen] = useState(false);

  // Fetch all ideas
  const { data: ideas, isLoading: isLoadingIdeas } = useQuery<(ProjectIdea & { team?: Team, endorsementCount: number, commentCount: number, isEndorsed?: boolean })[]>({
    queryKey: ['/api/ideas'],
  });

  // Filter ideas based on search and tech filter
  const filteredIdeas = ideas?.filter(idea => {
    const matchesSearch = searchQuery 
      ? idea.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        idea.summary.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
      
    const matchesTech = techFilter 
      ? idea.techStack?.includes(techFilter)
      : true;
      
    return matchesSearch && matchesTech;
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // The filtering is reactive, so no additional action needed
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Project Ideas Board</h1>
              <p className="mt-2 text-gray-600">
                Explore project ideas from teams or share your own
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Dialog open={createIdeaOpen} onOpenChange={setCreateIdeaOpen}>
                <DialogTrigger asChild>
                  <Button disabled={!isAuthenticated}>
                    <Plus className="h-4 w-4 mr-2" />
                    Share Idea
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Share a Project Idea</DialogTitle>
                    <DialogDescription>
                      Share your hackathon project idea and get feedback from the community.
                    </DialogDescription>
                  </DialogHeader>
                  <IdeaForm />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and filters */}
        <div className="mb-6">
          <form onSubmit={handleSearchSubmit}>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-grow">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search project ideas..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Select value={techFilter} onValueChange={setTechFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="All Technologies" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Technologies</SelectItem>
                  <SelectItem value="React">React</SelectItem>
                  <SelectItem value="Node.js">Node.js</SelectItem>
                  <SelectItem value="Python">Python</SelectItem>
                  <SelectItem value="Machine Learning">Machine Learning</SelectItem>
                  <SelectItem value="Blockchain">Blockchain</SelectItem>
                  <SelectItem value="AR/VR">AR/VR</SelectItem>
                </SelectContent>
              </Select>
              
              <Button 
                type="submit" 
                variant="outline"
                className="sm:w-auto"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </form>
        </div>
        
        {isLoadingIdeas ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredIdeas && filteredIdeas.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredIdeas.map(idea => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                team={idea.team}
                endorsementCount={idea.endorsementCount}
                commentCount={idea.commentCount}
                isEndorsed={idea.isEndorsed}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 flex flex-col items-center justify-center">
              <Lightbulb className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No project ideas found</h3>
              <p className="text-muted-foreground mb-6 text-center max-w-md">
                {searchQuery || techFilter 
                  ? "Try adjusting your search filters."
                  : "Be the first to share a project idea!"}
              </p>
              <Button onClick={() => setCreateIdeaOpen(true)} disabled={!isAuthenticated}>
                <Plus className="h-4 w-4 mr-2" />
                Share an Idea
              </Button>
            </CardContent>
          </Card>
        )}
        
        {filteredIdeas && filteredIdeas.length > 6 && (
          <div className="mt-8 flex justify-center">
            <Button variant="outline">Load More Ideas</Button>
          </div>
        )}
      </div>
    </div>
  );
}
