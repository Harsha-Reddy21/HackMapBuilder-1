import { useState } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';
import { Team, Hackathon } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import TeamCard from '@/components/teams/team-card';
import TeamForm from '@/components/teams/team-form';
import { Search, Users, UserPlus, Filter, Plus, Loader2 } from 'lucide-react';

export default function Teams() {
  const { user, isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHackathon, setSelectedHackathon] = useState<string>('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [createTeamOpen, setCreateTeamOpen] = useState(false);

  // Fetch user teams
  const { data: userTeams, isLoading: isLoadingUserTeams } = useQuery<Team[]>({
    queryKey: ['/api/teams/my-teams'],
    enabled: isAuthenticated,
  });

  // Fetch all teams
  const { data: allTeams, isLoading: isLoadingAllTeams } = useQuery<Team[]>({
    queryKey: ['/api/teams'],
  });

  // Fetch recommended teams based on user skills
  const { data: recommendedTeams, isLoading: isLoadingRecommendedTeams } = useQuery<Team[]>({
    queryKey: ['/api/teams/recommended'],
    enabled: isAuthenticated && (user?.skills?.length || 0) > 0,
  });

  // Fetch hackathons for filter
  const { data: hackathons } = useQuery<Hackathon[]>({
    queryKey: ['/api/hackathons'],
  });

  // Filter teams based on search and hackathon filter
  const filteredAllTeams = allTeams?.filter(team => {
    const matchesSearch = searchQuery 
      ? team.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        team.description.toLowerCase().includes(searchQuery.toLowerCase())
      : true;
      
    const matchesHackathon = selectedHackathon 
      ? team.hackathonId === parseInt(selectedHackathon)
      : true;
      
    return matchesSearch && matchesHackathon;
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
              <h1 className="text-3xl font-bold text-gray-900">Teams</h1>
              <p className="mt-2 text-gray-600">
                Create or join teams for upcoming hackathons
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Dialog open={createTeamOpen} onOpenChange={setCreateTeamOpen}>
                <DialogTrigger asChild>
                  <Button disabled={!isAuthenticated}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Team
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Create a New Team</DialogTitle>
                    <DialogDescription>
                      Form a team for a hackathon. Define what skills you're looking for.
                    </DialogDescription>
                  </DialogHeader>
                  <TeamForm />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isAuthenticated ? (
          <Tabs defaultValue="all-teams">
            <TabsList className="mb-6">
              <TabsTrigger value="all-teams">All Teams</TabsTrigger>
              <TabsTrigger value="recommended">Recommended</TabsTrigger>
              <TabsTrigger value="my-teams">My Teams</TabsTrigger>
            </TabsList>

            {/* Search and filters */}
            <div className="mb-6">
              <form onSubmit={handleSearchSubmit}>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <Input
                      type="text"
                      placeholder="Search teams..."
                      className="pl-10"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  
                  <Select value={selectedHackathon} onValueChange={setSelectedHackathon}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                      <SelectValue placeholder="All Hackathons" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Hackathons</SelectItem>
                      {hackathons?.map((hackathon) => (
                        <SelectItem key={hackathon.id} value={hackathon.id.toString()}>
                          {hackathon.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setShowFilters(!showFilters)}
                    className="sm:w-auto"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </div>
              </form>
              
              {showFilters && (
                <Card className="mt-3">
                  <CardContent className="pt-6">
                    <Label className="mb-2 block">Filter by Skills Needed</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {['JavaScript', 'React', 'Node.js', 'UI Design', 'Python', 'Machine Learning'].map(skill => (
                        <Button
                          key={skill}
                          variant={selectedSkills.includes(skill) ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            if (selectedSkills.includes(skill)) {
                              setSelectedSkills(selectedSkills.filter(s => s !== skill));
                            } else {
                              setSelectedSkills([...selectedSkills, skill]);
                            }
                          }}
                        >
                          {skill}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            <TabsContent value="all-teams" className="mt-0">
              {isLoadingAllTeams ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : filteredAllTeams && filteredAllTeams.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAllTeams.map(team => (
                    <TeamCard
                      key={team.id}
                      team={team}
                      hackathonId={team.hackathonId}
                      userSkills={user?.skills || []}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 flex flex-col items-center justify-center">
                    <Users className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No teams found</h3>
                    <p className="text-muted-foreground mb-6 text-center max-w-md">
                      {searchQuery || selectedHackathon 
                        ? "Try adjusting your search filters."
                        : "There are no teams available at the moment."}
                    </p>
                    <Button onClick={() => setCreateTeamOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create a Team
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="recommended" className="mt-0">
              {isLoadingRecommendedTeams ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : recommendedTeams && recommendedTeams.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {recommendedTeams.map(team => (
                    <TeamCard
                      key={team.id}
                      team={team}
                      hackathonId={team.hackathonId}
                      userSkills={user?.skills || []}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 flex flex-col items-center justify-center">
                    <UserPlus className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">No recommendations</h3>
                    <p className="text-muted-foreground mb-6 text-center max-w-md">
                      Update your skills in your profile to get team recommendations.
                    </p>
                    <Link href="/profile">
                      <Button>
                        Update Profile
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="my-teams" className="mt-0">
              {isLoadingUserTeams ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : userTeams && userTeams.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {userTeams.map(team => (
                    <TeamCard
                      key={team.id}
                      team={team}
                      hackathonId={team.hackathonId}
                      userSkills={user?.skills || []}
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 flex flex-col items-center justify-center">
                    <Users className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-1">You're not in any teams</h3>
                    <p className="text-muted-foreground mb-6 text-center max-w-md">
                      Create a new team or join an existing one to get started.
                    </p>
                    <Button onClick={() => setCreateTeamOpen(true)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Create a Team
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        ) : (
          <Card>
            <CardContent className="p-8 flex flex-col items-center">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-bold mb-2">Login to View Teams</h3>
              <p className="text-center text-muted-foreground mb-6 max-w-md">
                Create your own team or join existing teams with members looking for your skills.
              </p>
              <div className="flex gap-4">
                <Link href="/login">
                  <Button>
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="outline">
                    Register
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
