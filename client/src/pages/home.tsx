import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Hackathon } from "@shared/schema";
import HackathonCard from "@/components/hackathons/hackathon-card";
import { MapPin, Search, Users, Lightbulb } from "lucide-react";

export default function Home() {
  const { isAuthenticated } = useAuth();
  
  const { data: featuredHackathons } = useQuery<Hackathon[]>({
    queryKey: ['/api/hackathons?featured=true&limit=3'],
  });

  return (
    <div>
      {/* Hero Section */}
      <div className="relative bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
            <svg
              className="hidden lg:block absolute right-0 inset-y-0 h-full w-48 text-white transform translate-x-1/2"
              fill="currentColor"
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <polygon points="50,0 100,0 50,100 0,100" />
            </svg>

            <div className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
              <div className="sm:text-center lg:text-left">
                <h1 className="text-4xl tracking-tight font-bold text-gray-900 sm:text-5xl md:text-6xl">
                  <span className="block">Find your next</span>
                  <span className="block text-primary-600">hackathon team</span>
                </h1>
                <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                  Discover hackathons, form teams based on skills, and collaborate on amazing projects. HackMap connects coders, designers, and innovators.
                </p>
                <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                  <Link href="/hackathons">
                    <Button size="lg" className="w-full sm:w-auto">
                      Find a hackathon
                    </Button>
                  </Link>
                  <Link href="/teams/create">
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="mt-3 w-full sm:mt-0 sm:ml-3 sm:w-auto"
                    >
                      Create team
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
          <img
            className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
            src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80"
            alt="Team collaboration during hackathon"
          />
        </div>
      </div>

      {/* Featured Hackathons Section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Featured Hackathons
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Discover upcoming events and register to participate
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featuredHackathons ? (
              featuredHackathons.map((hackathon) => (
                <HackathonCard key={hackathon.id} hackathon={hackathon} />
              ))
            ) : (
              // Placeholder cards while loading
              Array(3).fill(0).map((_, idx) => (
                <Card key={idx} className="overflow-hidden">
                  <div className="h-48 w-full bg-gray-200 animate-pulse" />
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded mb-4 animate-pulse" />
                    <div className="h-3 bg-gray-200 rounded w-1/2 mb-3 animate-pulse" />
                    <div className="h-3 bg-gray-200 rounded w-2/3 mb-6 animate-pulse" />
                    <div className="flex justify-between">
                      <div className="flex space-x-1">
                        <div className="h-6 w-6 bg-gray-200 rounded-full animate-pulse" />
                        <div className="h-6 w-6 bg-gray-200 rounded-full animate-pulse" />
                      </div>
                      <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          <div className="mt-10 text-center">
            <Link href="/hackathons">
              <Button>View all hackathons</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Form Your Dream Team
            </h2>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Connect with the right teammates based on skills and interests
            </p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {/* Feature 1 */}
            <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary-500 text-white">
                <Search className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Find Hackathons</h3>
              <p className="mt-2 text-base text-gray-500">
                Browse upcoming hackathons filtered by date, category, or skill requirements.
              </p>
              <Link href="/hackathons">
                <a className="mt-4 text-primary-600 hover:text-primary-500">
                  Browse events →
                </a>
              </Link>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary-500 text-white">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Build Your Team</h3>
              <p className="mt-2 text-base text-gray-500">
                Create or join teams, match with people who have complementary skills to yours.
              </p>
              <Link href="/teams">
                <a className="mt-4 text-primary-600 hover:text-primary-500">
                  Find teammates →
                </a>
              </Link>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary-500 text-white">
                <Lightbulb className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Share Ideas</h3>
              <p className="mt-2 text-base text-gray-500">
                Post your project concepts, get feedback, and find collaborators who share your vision.
              </p>
              <Link href="/ideas">
                <a className="mt-4 text-primary-600 hover:text-primary-500">
                  Explore ideas →
                </a>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-700">
        <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            <span className="block">Ready to find your next hackathon team?</span>
          </h2>
          <p className="mt-4 text-lg leading-6 text-primary-200">
            Join HackMap today and connect with talented developers, designers, and innovators.
          </p>
          <div className="mt-8 flex justify-center">
            {isAuthenticated ? (
              <Button
                className="inline-flex rounded-md shadow"
                variant="secondary"
                asChild
              >
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            ) : (
              <>
                <Button
                  className="inline-flex rounded-md shadow"
                  variant="secondary"
                  asChild
                >
                  <Link href="/register">Sign up for free</Link>
                </Button>
                <Button
                  className="ml-3 inline-flex"
                  variant="outline"
                  asChild
                >
                  <Link href="/login">Login</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
