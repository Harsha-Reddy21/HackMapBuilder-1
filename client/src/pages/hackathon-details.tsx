import { useState } from 'react';
import { useRoute, Link } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { Hackathon, Registration, Team } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import {
  Calendar,
  Timer,
  Award,
  Users,
  Tag,
  AlertCircle,
  ChevronLeft,
  Plus,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { format } from 'date-fns';
import TeamCard from '@/components/teams/team-card';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import TeamForm from '@/components/teams/team-form';

export default function HackathonDetails() {
  const [, params] = useRoute('/hackathons/:id');
  const hackathonId = params?.id ? parseInt(params.id) : null;
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [createTeamOpen, setCreateTeamOpen] = useState(false);

  // Fetch hackathon details
  const { data: hackathon, isLoading: isLoadingHackathon } = useQuery<Hackathon>({
    queryKey: [`/api/hackathons/${hackathonId}`],
    enabled: !!hackathonId,
  });

  // Fetch registration status for current user
  const { data: registration, isLoading: isLoadingRegistration } = useQuery<Registration | null>({
    queryKey: [`/api/registrations/status?hackathonId=${hackathonId}&userId=${user?.id}`],
    enabled: !!hackathonId && !!user,
  });

  // Fetch teams for this hackathon
  const { data: teams, isLoading: isLoadingTeams } = useQuery<Team[]>({
    queryKey: [`/api/teams?hackathonId=${hackathonId}`],
    enabled: !!hackathonId,
  });

  // Fetch user's team for this hackathon
  const { data: userTeam } = useQuery<Team | null>({
    queryKey: [`/api/teams/user-team?hackathonId=${hackathonId}&userId=${user?.id}`],
    enabled: !!hackathonId && !!user,
  });

  const registerMutation = useMutation({
    mutationFn: async () => {
      if (!user || !hackathonId) throw new Error("User must be logged in to register");
      
      const res = await apiRequest('POST', '/api/registrations', {
        userId: user.id,
        hackathonId: hackathonId,
      });
      
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: [`/api/registrations/status?hackathonId=${hackathonId}&userId=${user?.id}`] 
      });
      
      toast({
        title: "Registration successful",
        description: "You are now registered for this hackathon!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  if (isLoadingHackathon) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!hackathon) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <CardContent className="pt-6 flex flex-col items-center justify-center min-h-[300px]">
            <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-bold mb-2">Hackathon Not Found</h2>
            <p className="text-muted-foreground mb-6">The hackathon you're looking for doesn't exist or may have been removed.</p>
            <Link href="/hackathons">
              <Button>
                <ChevronLeft className="h-4 w-4 mr-2" />
                View All Hackathons
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Format dates
  const startDate = new Date(hackathon.startDate);
  const endDate = new Date(hackathon.endDate);
  const registrationDeadline = new Date(hackathon.registrationDeadline);

  const dateRange = `${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}`;
  const deadlineText = `${format(registrationDeadline, 'MMM d, yyyy')}`;
  
  // Check if registration is still open
  const isRegistrationOpen = new Date() < registrationDeadline;
  
  // Check if the hackathon has started
  const hasStarted = new Date() >= startDate;
  
  // Check if user is registered
  const isRegistered = !!registration;
  
  // Check if user has a team
  const hasTeam = !!userTeam;

  const handleRegister = () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication required",
        description: "Please login to register for this hackathon",
        variant: "destructive",
      });
      return;
    }

    registerMutation.mutate();
  };

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center mb-4">
            <Link href="/hackathons">
              <Button variant="ghost" size="sm" className="gap-1">
                <ChevronLeft className="h-4 w-4" />
                Back to hackathons
              </Button>
            </Link>
          </div>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{hackathon.title}</h1>
              <div className="mt-2 flex flex-wrap gap-2">
                {hackathon.tags && hackathon.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="bg-primary-100 text-primary-800 border-0">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="mt-4 md:mt-0">
              {isRegistered ? (
                <Badge variant="outline" className="bg-green-100 text-green-800 text-sm px-3 py-1">
                  You are registered
                </Badge>
              ) : isRegistrationOpen ? (
                <Button onClick={handleRegister} disabled={registerMutation.isPending}>
                  {registerMutation.isPending ? "Registering..." : "Register Now"}
                </Button>
              ) : (
                <Badge variant="outline" className="bg-gray-100 text-gray-800 text-sm px-3 py-1">
                  Registration closed
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Hackathon details */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-6">
                <div className="relative w-full h-64 mb-6 rounded-lg overflow-hidden">
                  <img 
                    src={hackathon.imageUrl || "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"} 
                    alt={hackathon.title} 
                    className="w-full h-full object-cover"
                  />
                </div>

                <h2 className="text-xl font-bold mb-4">About this Hackathon</h2>
                <p className="text-gray-700 mb-6">{hackathon.description}</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 text-primary-600 mt-0.5 mr-3" />
                    <div>
                      <h3 className="font-medium text-gray-900">Event Date</h3>
                      <p className="text-gray-600">{dateRange}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Timer className="h-5 w-5 text-primary-600 mt-0.5 mr-3" />
                    <div>
                      <h3 className="font-medium text-gray-900">Registration Deadline</h3>
                      <p className="text-gray-600">{deadlineText}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Award className="h-5 w-5 text-primary-600 mt-0.5 mr-3" />
                    <div>
                      <h3 className="font-medium text-gray-900">Prizes</h3>
                      <p className="text-gray-600">{hackathon.prizes || "To be announced"}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Tag className="h-5 w-5 text-primary-600 mt-0.5 mr-3" />
                    <div>
                      <h3 className="font-medium text-gray-900">Theme</h3>
                      <p className="text-gray-600">{hackathon.theme}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Teams Section */}
            <div className="mt-8">
              <Tabs defaultValue="teams">
                <div className="flex justify-between items-center mb-4">
                  <TabsList>
                    <TabsTrigger value="teams">Teams</TabsTrigger>
                    <TabsTrigger value="participants">Participants</TabsTrigger>
                  </TabsList>
                  
                  {isRegistered && !hasTeam && (
                    <Dialog open={createTeamOpen} onOpenChange={setCreateTeamOpen}>
                      <DialogTrigger asChild>
                        <Button size="sm" className="gap-1">
                          <Plus className="h-4 w-4" />
                          Create Team
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[600px]">
                        <DialogHeader>
                          <DialogTitle>Create a New Team</DialogTitle>
                          <DialogDescription>
                            Form a team for {hackathon.title}. Define what skills you're looking for.
                          </DialogDescription>
                        </DialogHeader>
                        <TeamForm 
                          hackathonId={hackathon.id} 
                          defaultValues={{ 
                            hackathonId: hackathon.id,
                            name: "",
                            description: "",
                            creatorId: user?.id || 0,
                            requiredSkills: [],
                            maxMembers: 5,
                          }} 
                        />
                      </DialogContent>
                    </Dialog>
                  )}
                </div>

                <TabsContent value="teams" className="mt-0">
                  {isLoadingTeams ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : teams && teams.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {teams.map(team => (
                        <TeamCard 
                          key={team.id}
                          team={team}
                          hackathonTitle={hackathon.title}
                          userSkills={user?.skills || []}
                        />
                      ))}
                    </div>
                  ) : (
                    <Card>
                      <CardContent className="py-12 flex flex-col items-center justify-center">
                        <Users className="h-12 w-12 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-1">No teams yet</h3>
                        <p className="text-muted-foreground mb-6 text-center max-w-md">
                          {isRegistered
                            ? "Be the first to create a team for this hackathon!"
                            : "Register for this hackathon to create or join a team."
                          }
                        </p>
                        {isRegistered && !hasTeam && (
                          <Button onClick={() => setCreateTeamOpen(true)}>
                            <Plus className="h-4 w-4 mr-2" />
                            Create a Team
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="participants">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex flex-col space-y-4">
                        {/* This would be populated with actual participants */}
                        {Array(6).fill(0).map((_, i) => (
                          <div key={i} className="flex items-center py-2">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className={`bg-primary-${100 + (i * 100)}`}>
                                {String.fromCharCode(65 + i)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="ml-3">
                              <p className="text-sm font-medium">Participant {i + 1}</p>
                              <div className="flex flex-wrap gap-1 mt-1">
                                <Badge variant="outline" className="text-xs bg-gray-100">
                                  React
                                </Badge>
                                <Badge variant="outline" className="text-xs bg-gray-100">
                                  Node.js
                                </Badge>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>

          {/* Right column - Registration status & call to action */}
          <div className="lg:col-span-1">
            <Card className="mb-6">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4">Your Status</h3>
                
                {isAuthenticated ? (
                  <>
                    <div className="mb-6">
                      <div className="flex items-center mb-2">
                        <Badge 
                          variant="outline" 
                          className={`
                            ${isRegistered 
                              ? "bg-green-100 text-green-800" 
                              : "bg-yellow-100 text-yellow-800"}
                            text-sm
                          `}
                        >
                          {isRegistered ? "Registered" : "Not Registered"}
                        </Badge>
                      </div>
                      
                      {isRegistered ? (
                        <p className="text-sm text-gray-600">
                          You registered on {registration && 
                            format(new Date(registration.registeredAt), 'MMMM d, yyyy')}
                        </p>
                      ) : isRegistrationOpen ? (
                        <p className="text-sm text-gray-600">
                          Registration is open until {deadlineText}
                        </p>
                      ) : (
                        <p className="text-sm text-gray-600">
                          Registration closed on {deadlineText}
                        </p>
                      )}
                    </div>

                    {isRegistered && (
                      <div className="mb-6">
                        <div className="flex items-center mb-2">
                          <h4 className="font-medium">Team Status</h4>
                        </div>
                        
                        {hasTeam ? (
                          <div className="p-3 bg-gray-50 rounded-md">
                            <div className="flex items-center">
                              <Avatar className="h-8 w-8 bg-primary-100">
                                <AvatarFallback className="text-primary-600">
                                  {userTeam?.name.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="ml-3">
                                <p className="text-sm font-medium">{userTeam?.name}</p>
                                <p className="text-xs text-gray-500">
                                  {/* Would show actual member count */}
                                  1/5 Members
                                </p>
                              </div>
                            </div>
                            <Link href={`/teams/${userTeam?.id}`}>
                              <Button size="sm" variant="outline" className="w-full mt-3">
                                View Team
                              </Button>
                            </Link>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            <p className="text-sm text-gray-600">
                              You haven't joined a team yet.
                            </p>
                            <div className="flex flex-col gap-2">
                              <Button 
                                onClick={() => setCreateTeamOpen(true)}
                                className="w-full"
                                size="sm"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Create a Team
                              </Button>
                              <Link href="/teams">
                                <Button 
                                  variant="outline" 
                                  className="w-full"
                                  size="sm"
                                >
                                  Find Teams to Join
                                </Button>
                              </Link>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {!isRegistered && isRegistrationOpen && (
                      <Button 
                        onClick={handleRegister} 
                        disabled={registerMutation.isPending}
                        className="w-full"
                      >
                        {registerMutation.isPending ? "Registering..." : "Register Now"}
                      </Button>
                    )}
                  </>
                ) : (
                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Log in to register for this hackathon and join teams.
                    </p>
                    <div className="flex gap-3">
                      <Link href="/login">
                        <Button>Log In</Button>
                      </Link>
                      <Link href="/register">
                        <Button variant="outline">Register</Button>
                      </Link>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4">Participating?</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="bg-primary-100 rounded-full p-1 mr-3">
                      <Users className="h-4 w-4 text-primary-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium">Team Size</h4>
                      <p className="text-sm text-gray-600">2-5 members per team</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <p className="text-sm text-gray-600">
                    {hasStarted
                      ? "This hackathon is currently in progress."
                      : `This hackathon starts in ${Math.ceil((startDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} days.`
                    }
                  </p>
                  
                  {!isRegistered && isRegistrationOpen && (
                    <Button 
                      onClick={handleRegister} 
                      disabled={registerMutation.isPending || !isAuthenticated}
                      className="w-full"
                    >
                      {registerMutation.isPending 
                        ? "Registering..." 
                        : !isAuthenticated
                          ? "Login to Register"
                          : "Register Now"
                      }
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
