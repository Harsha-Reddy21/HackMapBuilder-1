import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { insertTeamSchema } from "@shared/schema";
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
import { X, Check, ChevronsUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

// Extend the team schema for the form
const formSchema = insertTeamSchema.extend({
  hackathonId: z.coerce.number().min(1, "Please select a hackathon")
});

interface TeamFormProps {
  hackathonId?: number;
  defaultValues?: z.infer<typeof formSchema>;
}

export function TeamForm({ hackathonId, defaultValues }: TeamFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedSkills, setSelectedSkills] = useState<string[]>(
    defaultValues?.requiredSkills || []
  );
  const [skillSearchOpen, setSkillSearchOpen] = useState(false);

  // Set up form with default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues || {
      name: "",
      description: "",
      hackathonId: hackathonId || 0,
      creatorId: user?.id || 0,
      requiredSkills: [],
      maxMembers: 5,
    },
  });

  // Create team mutation
  const createTeamMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const res = await apiRequest('POST', '/api/teams', {
        ...values,
        requiredSkills: selectedSkills,
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/teams'] });
      toast({
        title: "Team created",
        description: "Your team has been created successfully!",
      });
      setLocation(hackathonId ? `/hackathons/${hackathonId}` : '/teams');
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to create team",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please login to create a team",
        variant: "destructive",
      });
      return;
    }

    // Add the selected skills to the form data
    createTeamMutation.mutateAsync({
      ...values,
      creatorId: user.id,
      requiredSkills: selectedSkills,
    });
  };

  const handleAddSkill = (skill: string) => {
    if (!selectedSkills.includes(skill)) {
      setSelectedSkills([...selectedSkills, skill]);
    }
    setSkillSearchOpen(false);
  };

  const handleRemoveSkill = (skill: string) => {
    setSelectedSkills(selectedSkills.filter(s => s !== skill));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Team Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter your team name" {...field} />
              </FormControl>
              <FormDescription>
                Choose a memorable and unique name for your team.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Describe your team and project idea" 
                  className="min-h-[120px]"
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Explain what your team is building and what kind of team members you're looking for.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormItem>
          <FormLabel>Required Skills</FormLabel>
          <div className="flex flex-wrap gap-2 mb-2">
            {selectedSkills.map(skill => (
              <Badge 
                key={skill}
                variant="secondary"
                className="py-1.5 pl-2 pr-1 flex items-center gap-1"
              >
                {skill}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-5 w-5 p-0 rounded-full"
                  onClick={() => handleRemoveSkill(skill)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
          
          <Popover open={skillSearchOpen} onOpenChange={setSkillSearchOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={skillSearchOpen}
                className="justify-between w-full"
              >
                <span className="truncate">
                  {selectedSkills.length > 0 
                    ? `${selectedSkills.length} skills selected` 
                    : "Select skills needed for your team"}
                </span>
                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0 w-full max-w-[calc(100vw-2rem)] sm:max-w-[500px]">
              <Command>
                <CommandInput placeholder="Search skills..." />
                <CommandEmpty>No skills found.</CommandEmpty>
                <CommandList>
                  <ScrollArea className="h-72">
                    <CommandGroup>
                      {allSkills.map(skill => (
                        <CommandItem
                          key={skill}
                          value={skill}
                          onSelect={() => handleAddSkill(skill)}
                        >
                          <Check
                            className={`mr-2 h-4 w-4 ${
                              selectedSkills.includes(skill) ? "opacity-100" : "opacity-0"
                            }`}
                          />
                          {skill}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </ScrollArea>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <FormDescription>
            Select the skills you're looking for in team members.
          </FormDescription>
        </FormItem>

        <FormField
          control={form.control}
          name="maxMembers"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Maximum Team Size</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min={2} 
                  max={10}
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 5)}
                />
              </FormControl>
              <FormDescription>
                Set the maximum number of members for your team (2-10).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setLocation(hackathonId ? `/hackathons/${hackathonId}` : '/teams')}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            disabled={createTeamMutation.isPending}
          >
            {createTeamMutation.isPending ? "Creating..." : "Create Team"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default TeamForm;
