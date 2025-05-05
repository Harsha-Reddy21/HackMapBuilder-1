import { useState } from "react";
import { Search, Filter, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";

const categoryOptions = [
  { label: "All Categories", value: "" },
  { label: "AI/ML", value: "ai" },
  { label: "Web3/Blockchain", value: "web3" },
  { label: "Healthcare", value: "healthcare" },
  { label: "FinTech", value: "fintech" },
  { label: "IoT", value: "iot" },
  { label: "Sustainability", value: "sustainability" },
];

const dateOptions = [
  { label: "Any Time", value: "" },
  { label: "This Month", value: "this-month" },
  { label: "Next Month", value: "next-month" },
  { label: "Upcoming", value: "upcoming" },
  { label: "Open Registration", value: "open-registration" },
];

interface HackathonFilterProps {
  onSearch: (searchParams: {
    query: string;
    category: string;
    date: string;
    tags: string[];
  }) => void;
}

export function HackathonFilter({ onSearch }: HackathonFilterProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [date, setDate] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  const handleSearch = () => {
    onSearch({ query, category, date, tags });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    handleSearch();
  };

  const handleDateChange = (value: string) => {
    setDate(value);
    handleSearch();
  };

  const handleTagToggle = (tag: string) => {
    setTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleFilterApply = () => {
    handleSearch();
    setIsFilterSheetOpen(false);
  };

  const handleFilterClear = () => {
    setTags([]);
  };

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
          {/* Search input - takes 2 columns on desktop */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex rounded-md shadow-sm">
              <div className="relative flex items-stretch flex-grow focus-within:z-10">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <Input
                  type="text"
                  placeholder="Search hackathons"
                  className="pl-10 py-6"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                />
              </div>
              
              {/* Mobile filter button */}
              <Sheet open={isFilterSheetOpen} onOpenChange={setIsFilterSheetOpen}>
                <SheetTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="md:hidden ml-2 flex items-center"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    Filter
                  </Button>
                </SheetTrigger>
                <SheetContent side="right">
                  <SheetHeader>
                    <SheetTitle>Filter Hackathons</SheetTitle>
                    <SheetDescription>
                      Apply filters to narrow down hackathons
                    </SheetDescription>
                  </SheetHeader>
                  
                  <div className="py-4 space-y-4">
                    <div>
                      <Label>Category</Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="mt-1 w-full">
                          <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                          {categoryOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Date</Label>
                      <Select value={date} onValueChange={setDate}>
                        <SelectTrigger className="mt-1 w-full">
                          <SelectValue placeholder="Any Time" />
                        </SelectTrigger>
                        <SelectContent>
                          {dateOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label>Popular Tags</Label>
                      <div className="mt-2 space-y-2">
                        {["AI", "Web3", "Healthcare", "FinTech", "Mobile", "Sustainability"].map((tag) => (
                          <div key={tag} className="flex items-center space-x-2">
                            <Checkbox 
                              id={`tag-${tag}`}
                              checked={tags.includes(tag)}
                              onCheckedChange={() => handleTagToggle(tag)}
                            />
                            <label 
                              htmlFor={`tag-${tag}`}
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              {tag}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {tags.length > 0 && (
                      <div>
                        <div className="flex justify-between items-center">
                          <Label>Selected Tags</Label>
                          <Button variant="ghost" size="sm" onClick={handleFilterClear}>
                            Clear
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {tags.map(tag => (
                            <Badge 
                              key={tag} 
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              {tag}
                              <button 
                                onClick={() => handleTagToggle(tag)}
                                className="ml-1 text-muted-foreground hover:text-foreground"
                              >
                                &times;
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <SheetFooter>
                    <SheetClose asChild>
                      <Button onClick={handleFilterApply}>Apply Filters</Button>
                    </SheetClose>
                  </SheetFooter>
                </SheetContent>
              </Sheet>
              
              {/* Desktop search button */}
              <Button onClick={handleSearch} className="rounded-l-none">
                <Search className="h-4 w-4 mr-2" />
                Search
              </Button>
            </div>
          </div>
          
          {/* Category select - desktop only */}
          <div className="col-span-1 hidden md:block">
            <Select value={category} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Date select - desktop only */}
          <div className="col-span-1 hidden md:block">
            <Select value={date} onValueChange={handleDateChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Any Time" />
              </SelectTrigger>
              <SelectContent>
                {dateOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Selected Tags - desktop only */}
        {tags.length > 0 && (
          <div className="hidden md:flex mt-4 items-center">
            <span className="text-sm mr-2">Selected Tags:</span>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <Badge 
                  key={tag} 
                  variant="secondary"
                  className="flex items-center gap-1"
                >
                  {tag}
                  <button 
                    onClick={() => handleTagToggle(tag)}
                    className="ml-1 text-muted-foreground hover:text-foreground"
                  >
                    &times;
                  </button>
                </Badge>
              ))}
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleFilterClear}
              className="ml-2"
            >
              Clear All
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default HackathonFilter;
