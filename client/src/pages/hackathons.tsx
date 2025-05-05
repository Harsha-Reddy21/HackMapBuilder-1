import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Hackathon } from "@shared/schema";
import HackathonCard from "@/components/hackathons/hackathon-card";
import HackathonFilter from "@/components/hackathons/hackathon-filter";
import { Loader2 } from "lucide-react";

export default function Hackathons() {
  const [searchParams, setSearchParams] = useState({
    query: "",
    category: "",
    date: "",
    tags: [] as string[],
  });

  const buildQueryString = () => {
    const params = new URLSearchParams();
    if (searchParams.query) params.append("query", searchParams.query);
    if (searchParams.category) params.append("category", searchParams.category);
    if (searchParams.date) params.append("date", searchParams.date);
    searchParams.tags.forEach(tag => params.append("tags", tag));
    return params.toString();
  };

  const { data: hackathons, isLoading } = useQuery<Hackathon[]>({
    queryKey: [`/api/hackathons?${buildQueryString()}`],
  });

  const handleSearch = (params: typeof searchParams) => {
    setSearchParams(params);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="bg-gray-50 pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Discover Hackathons
            </h1>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              Find the perfect hackathon that matches your interests and skills
            </p>
          </div>

          {/* Search and Filter Section */}
          <div className="mt-8">
            <HackathonFilter onSearch={handleSearch} />
          </div>
        </div>
      </div>

      {/* Hackathon Listings */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {searchParams.query || searchParams.category || searchParams.date || searchParams.tags.length > 0
                ? "Search Results"
                : "All Hackathons"}
            </h2>
            
            <div className="mt-4 sm:mt-0">
              <div className="flex items-center">
                <span className="mr-3 text-sm font-medium text-gray-700 hidden sm:block">Sort by:</span>
                <select className="block w-full sm:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md">
                  <option>Date: Newest</option>
                  <option>Date: Oldest</option>
                  <option>Registration: Closing Soon</option>
                  <option>Most Popular</option>
                </select>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-lg">Loading hackathons...</span>
            </div>
          ) : hackathons && hackathons.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {hackathons.map((hackathon) => (
                <HackathonCard 
                  key={hackathon.id} 
                  hackathon={hackathon} 
                  isRegistrationOpen={new Date(hackathon.registrationDeadline) > new Date()}
                  isClosingSoon={
                    new Date(hackathon.registrationDeadline) > new Date() && 
                    new Date(hackathon.registrationDeadline).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000
                  }
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="mt-2 text-lg font-medium text-gray-900">No hackathons found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try adjusting your search filters or check back later for new hackathons.
              </p>
            </div>
          )}

          {hackathons && hackathons.length > 0 && (
            <div className="mt-10 text-center">
              <Button>Load more hackathons</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
