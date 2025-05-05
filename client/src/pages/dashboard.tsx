import { useState } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';
import { Hackathon, Team, Notification } from '@shared/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CalendarDays,
  Bell,
  CheckCircle,
  Timer,
  Users,
  AlertCircle,
  ChevronRight,
  MessageSquare,
  Lightbulb,
} from 'lucide-react';
import { format } from 'date-fns';

export default function Dashboard() {
  const { user, isAuthenticated } = useAuth();
  
  // Fetch user's registrations with hackathon data
  const { data: registrations, isLoading: isLoadingRegistrations } = useQuery<(Registration & { hackathon: Hackathon })[]>({
    queryKey: ['/api/registrations/user'],
    enabled: isAuthenticated,
  });

  // Fetch user's teams
  const { data: teams, isLoading: isLoadingTeams } = useQuery<Team[]>({
    queryKey: ['/api/teams/my-teams'],
    enabled: isAuthenticated,
  });

  // Fetch user's notifications
  const { data: notifications, isLoading: isLoadingNotifications } = useQuery<Notification[]>({
    queryKey: ['/api/notifications'],
    enabled: isAuthenticated,
  });

  // TypeScript interface for Registration with hackathon data
  interface Registration {
    id: number;
    userId: number;
    hackathonId: number;
    registeredAt: string;
    hackathon: Hackathon;
  }

  // Group hackathons by status
  const upcoming = registrations?.filter(
    reg => new Date(reg.hackathon.startDate) > new Date()
  ) || [];
  
  const active = registrations?.filter(
    reg => 
      new Date(reg.hackathon.startDate) <= new Date() && 
      new Date(reg.hackathon.endDate) >= new Date()
  ) || [];
  
  const past = registrations?.filter(
    reg => new Date(reg.hackathon.endDate) < new Date()
  ) || [];

  if (!isAuthenticated) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <CardContent className="p-8 flex flex-col items-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-xl font-bold mb-2">Login Required</h3>
            <p className="text-center text-muted-foreground mb-6 max-w-md">
              You need to be logged in to view your dashboard.
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
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pb-16">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
              <p className="mt-2 text-gray-600">
                Manage your hackathons, teams, and notifications
              </p>
            </div>
            <div className="mt-4 md:mt-0">
              <Link href="/hackathons">
                <Button>
                  Find More Hackathons
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Hackathons */}
          <div className="lg:col-span-2">
            {/* Registered Hackathons */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Your Hackathons</CardTitle>
                <CardDescription>
                  Hackathons you've registered for
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="upcoming">
                  <TabsList className="mb-4">
                    <TabsTrigger value="upcoming">
                      Upcoming
                      {upcoming.length > 0 && (
                        <Badge variant="outline" className="ml-2 bg-primary-100 text-primary-800">
                          {upcoming.length}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="active">
                      Active
                      {active.length > 0 && (
                        <Badge variant="outline" className="ml-2 bg-green-100 text-green-800">
                          {active.length}
                        </Badge>
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="past">Past</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="upcoming" className="mt-0">
                    {isLoadingRegistrations ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : upcoming.length > 0 ? (
                      <div className="space-y-4">
                        {upcoming.map((reg) => (
                          <HackathonCard key={reg.id} registration={reg} />
                        ))}
                      </div>
                    ) : (
                      <EmptyState
                        icon={CalendarDays}
                        title="No upcoming hackathons"
                        description="Register for hackathons to see them here"
                        action={{
                          label: "Find Hackathons",
                          href: "/hackathons",
                        }}
                      />
                    )}
                  </TabsContent>
                  
                  <TabsContent value="active" className="mt-0">
                    {isLoadingRegistrations ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : active.length > 0 ? (
                      <div className="space-y-4">
                        {active.map((reg) => (
                          <HackathonCard key={reg.id} registration={reg} isActive />
                        ))}
                      </div>
                    ) : (
                      <EmptyState
                        icon={Timer}
                        title="No active hackathons"
                        description="You don't have any hackathons in progress"
                      />
                    )}
                  </TabsContent>
                  
                  <TabsContent value="past" className="mt-0">
                    {isLoadingRegistrations ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                      </div>
                    ) : past.length > 0 ? (
                      <div className="space-y-4">
                        {past.map((reg) => (
                          <HackathonCard key={reg.id} registration={reg} />
                        ))}
                      </div>
                    ) : (
                      <EmptyState
                        icon={CheckCircle}
                        title="No past hackathons"
                        description="Your completed hackathons will appear here"
                      />
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Teams */}
            <Card>
              <CardHeader>
                <CardTitle>Your Teams</CardTitle>
                <CardDescription>
                  Teams you've created or joined
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingTeams ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : teams && teams.length > 0 ? (
                  <div className="space-y-4">
                    {teams.map((team) => (
                      <TeamItem key={team.id} team={team} />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Users}
                    title="No teams"
                    description="You haven't created or joined any teams yet"
                    action={{
                      label: "Find Teams",
                      href: "/teams",
                    }}
                  />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right column - Notifications & Activity */}
          <div className="lg:col-span-1">
            {/* Notifications */}
            <Card className="mb-8">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Notifications</CardTitle>
                  <CardDescription>
                    Recent updates and activity
                  </CardDescription>
                </div>
                {notifications && notifications.length > 0 && (
                  <Badge variant="outline" className="bg-primary-100 text-primary-800">
                    {notifications.filter(n => !n.read).length} new
                  </Badge>
                )}
              </CardHeader>
              <CardContent>
                {isLoadingNotifications ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : notifications && notifications.length > 0 ? (
                  <div className="space-y-4">
                    {notifications.map((notification) => (
                      <NotificationItem key={notification.id} notification={notification} />
                    ))}
                  </div>
                ) : (
                  <EmptyState
                    icon={Bell}
                    title="No notifications"
                    description="Your notifications will appear here"
                    compact
                  />
                )}
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Link href="/hackathons">
                    <Button variant="outline" className="w-full justify-start" size="lg">
                      <CalendarDays className="h-4 w-4 mr-2" />
                      Browse Hackathons
                    </Button>
                  </Link>
                  <Link href="/teams">
                    <Button variant="outline" className="w-full justify-start" size="lg">
                      <Users className="h-4 w-4 mr-2" />
                      Find Teams
                    </Button>
                  </Link>
                  <Link href="/ideas">
                    <Button variant="outline" className="w-full justify-start" size="lg">
                      <Lightbulb className="h-4 w-4 mr-2" />
                      Project Ideas
                    </Button>
                  </Link>
                  <Link href="/profile">
                    <Button variant="outline" className="w-full justify-start" size="lg">
                      <Avatar className="h-4 w-4 mr-2">
                        <AvatarFallback>{user?.username?.[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                      Edit Profile
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper Components

interface EmptyStateProps {
  icon: React.ElementType;
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
  };
  compact?: boolean;
}

function EmptyState({ icon: Icon, title, description, action, compact }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center text-center ${compact ? 'py-6' : 'py-12'}`}>
      <Icon className={`${compact ? 'h-8 w-8' : 'h-12 w-12'} text-muted-foreground mb-3`} />
      <h3 className={`${compact ? 'text-base' : 'text-lg'} font-medium text-gray-900 mb-1`}>{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      {action && (
        <Link href={action.href}>
          <Button variant="outline" size={compact ? "sm" : "default"}>
            {action.label}
          </Button>
        </Link>
      )}
    </div>
  );
}

interface HackathonCardProps {
  registration: {
    id: number;
    userId: number;
    hackathonId: number;
    registeredAt: string;
    hackathon: Hackathon;
  };
  isActive?: boolean;
}

function HackathonCard({ registration, isActive }: HackathonCardProps) {
  const hackathon = registration.hackathon;
  const startDate = new Date(hackathon.startDate);
  const endDate = new Date(hackathon.endDate);
  
  // Calculate days remaining until start
  const today = new Date();
  const daysUntilStart = Math.ceil((startDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  // Calculate days remaining until end for active hackathons
  const daysUntilEnd = Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  
  return (
    <div className="flex flex-col sm:flex-row border rounded-lg overflow-hidden hover:border-primary-200 transition-colors">
      <div className="sm:w-48 h-32 sm:h-auto relative">
        <img 
          src={hackathon.imageUrl || "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80"} 
          alt={hackathon.title} 
          className="w-full h-full object-cover"
        />
        {isActive && (
          <div className="absolute top-0 right-0 bg-green-500 text-white text-xs font-bold px-2 py-0.5 m-2 rounded-full">
            Active
          </div>
        )}
      </div>
      
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <h3 className="font-medium text-gray-900">{hackathon.title}</h3>
            {hackathon.tags && hackathon.tags[0] && (
              <Badge variant="outline" className="bg-primary-100 text-primary-800 border-0">
                {hackathon.tags[0]}
              </Badge>
            )}
          </div>
          
          <div className="mt-2 text-sm">
            <div className="flex items-center text-gray-600 mb-1">
              <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
              <span>{format(startDate, 'MMM d')} - {format(endDate, 'MMM d, yyyy')}</span>
            </div>
            
            {isActive ? (
              <div className="flex items-center text-green-600">
                <Timer className="h-3.5 w-3.5 mr-1.5" />
                <span>{daysUntilEnd} days remaining</span>
              </div>
            ) : startDate > today ? (
              <div className="flex items-center text-primary-600">
                <Timer className="h-3.5 w-3.5 mr-1.5" />
                <span>Starts in {daysUntilStart} days</span>
              </div>
            ) : (
              <div className="flex items-center text-gray-500">
                <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                <span>Completed on {format(endDate, 'MMMM d, yyyy')}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-3 flex justify-between items-center">
          <p className="text-xs text-gray-500">
            Registered on {format(new Date(registration.registeredAt), 'MMM d, yyyy')}
          </p>
          <Link href={`/hackathons/${hackathon.id}`}>
            <Button size="sm" variant="ghost" className="text-primary-600 flex items-center">
              View Details
              <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

interface TeamItemProps {
  team: Team;
}

function TeamItem({ team }: TeamItemProps) {
  return (
    <div className="flex items-center border rounded-lg p-3 hover:border-primary-200 transition-colors">
      <Avatar className="h-10 w-10 bg-primary-100">
        <AvatarFallback className="text-primary-600">
          {team.name.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      
      <div className="ml-4 flex-1">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium text-gray-900">{team.name}</h3>
          <Badge variant="outline" className="text-xs bg-gray-100 text-gray-800">
            <Users className="h-3 w-3 mr-1" /> 1/5
          </Badge>
        </div>
        <p className="text-xs text-gray-500 truncate max-w-[200px] sm:max-w-sm">
          {team.description}
        </p>
      </div>
      
      <Link href={`/teams/${team.id}`}>
        <Button size="sm" variant="ghost" className="ml-2">
          <MessageSquare className="h-4 w-4" />
        </Button>
      </Link>
    </div>
  );
}

interface NotificationItemProps {
  notification: Notification;
}

function NotificationItem({ notification }: NotificationItemProps) {
  const getNotificationIcon = (type: string) => {
    switch(type) {
      case 'team_invite':
        return Users;
      case 'team_join_request':
        return UserPlus;
      case 'deadline_reminder':
        return Timer;
      default:
        return Bell;
    }
  };
  
  const NotificationIcon = getNotificationIcon(notification.type);
  
  return (
    <div className={`flex p-3 rounded-lg ${!notification.read ? 'bg-primary-50' : ''}`}>
      <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
        !notification.read ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'
      }`}>
        <NotificationIcon className="h-4 w-4" />
      </div>
      
      <div className="ml-3 flex-1">
        <p className="text-sm text-gray-900">{notification.content}</p>
        <p className="text-xs text-gray-500 mt-1">
          {format(new Date(notification.createdAt), 'MMM d, h:mm a')}
        </p>
      </div>
      
      {!notification.read && (
        <div className="flex-shrink-0 self-center">
          <div className="h-2 w-2 bg-primary-500 rounded-full"></div>
        </div>
      )}
    </div>
  );
}
