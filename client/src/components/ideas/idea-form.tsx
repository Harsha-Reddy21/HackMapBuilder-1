import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertProjectIdeaSchema } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { allSkills } from "@/lib/skills";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Check, ChevronsUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";

// Extend the project idea schema for the form
const formSchema = insertProjectIdeaSchema.extend({
  teamId: z.coerce.number().min(1, "Please select a team")
});

interface IdeaFormProps {
  teamId?: number;
  defaultValues?: z.infer<typeof formSchema>;
}

export function IdeaForm({ teamId, defaultValues }: IdeaFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedTechStack, setSelectedTechStack] = useState<string[]>(
    defaultValues?.techStack || []
  );
  const [techStackOpen, setTechStackOpen] = useState(false);

  // Fetch user's teams
  const { data: teams } = useQuery({
    queryKey: ['/api/teams/my-teams'],
    enabled: !!user,
  });

  // Set up form with default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
      title: "",
      summary: "",
      teamId: teamId || 0,
      techStack: [],
    },
  });

  // Create idea mutation
  const createIdeaMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const res = await apiRequest('POST', '/api/ideas', {
        ...values,
        techStack: selectedTechStack,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/ideas'] });
      toast({
        title: "Project idea created",
        description: "Your project idea has been shared successfully!",
      });
      setLocation('/ideas');
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create project idea",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to share a project idea",
        variant: "destructive",
      });
      return;
    }

    // Add the selected tech stack to the form data
    createIdeaMutation.mutateAsync({
      ...values,
      techStack: selectedTechStack,
    });
  };

  const handleAddTech = (tech: string) => {
    if (!selectedTechStack.includes(tech)) {
      setSelectedTechStack([...selectedTechStack, tech]);
    }
    setTechStackOpen(false);
  };

  const handleRemoveTech = (tech: string) => {
    setSelectedTechStack(selectedTechStack.filter(t => t !== tech));
  };

  return (
    <Card>
      <CardContent className="p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your project title" {...field} />
                  </FormControl>
                  <FormDescription>
                    Choose a clear, descriptive title for your project.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="summary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Summary</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe what you want to build" 
                      className="min-h-[120px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    Explain your project, what problem it solves, and how it works.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!teamId && (
              <FormField
                control={form.control}
                name="teamId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Team</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value.toString()}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a team" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {teams?.map(team => (
                          <SelectItem key={team.id} value={team.id.toString()}>
                            {team.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose which team this project idea belongs to.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormItem>
              <FormLabel>Tech Stack</FormLabel>
              <div className="flex flex-wrap gap-2 mb-2">
                {selectedTechStack.map(tech => (
                  <Badge 
                    key={tech}
                    variant="secondary"
                    className="py-1.5 pl-2 pr-1 flex items-center gap-1"
                  >
                    {tech}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-5 w-5 p-0 rounded-full"
                      onClick={() => handleRemoveTech(tech)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
              
              <Popover open={techStackOpen} onOpenChange={setTechStackOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={techStackOpen}
                    className="justify-between w-full"
                  >
                    <span className="truncate">
                      {selectedTechStack.length > 0 
                        ? `${selectedTechStack.length} technologies selected` 
                        : "Select technologies for your project"}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="p-0 w-full max-w-[calc(100vw-2rem)] sm:max-w-[500px]">
                  <Command>
                    <CommandInput placeholder="Search technologies..." />
                    <CommandEmpty>No technologies found.</CommandEmpty>
                    <CommandList>
                      <ScrollArea className="h-72">
                        <CommandGroup>
                          {allSkills.map(tech => (
                            <CommandItem
                              key={tech}
                              value={tech}
                              onSelect={() => handleAddTech(tech)}
                            >
                              <Check
                                className={`mr-2 h-4 w-4 ${
                                  selectedTechStack.includes(tech) ? "opacity-100" : "opacity-0"
                                }`}
                              />
                              {tech}
                            </CommandItem>
                          ))}
                        </CommandGroup>
                      </ScrollArea>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              <FormDescription>
                Select the technologies you plan to use for this project.
              </FormDescription>
            </FormItem>

            <div className="flex justify-end gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation('/ideas')}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createIdeaMutation.isPending}
              >
                {createIdeaMutation.isPending ? "Sharing..." : "Share Idea"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

export default IdeaForm;
