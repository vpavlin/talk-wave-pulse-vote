
import React from "react";
import { TrendingUp, Clock, Shuffle } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface TalkFiltersProps {
  sortOption: string;
  onSortChange: (value: string) => void;
  totalTalks: number;
}

const TalkFilters = ({ sortOption, onSortChange, totalTalks }: TalkFiltersProps) => {
  return (
    <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100">
        Submitted Talks 
        <span className="ml-2 text-lg font-normal text-gray-500 dark:text-gray-400">
          ({totalTalks})
        </span>
      </h2>
      
      <ToggleGroup 
        type="single" 
        value={sortOption} 
        onValueChange={(value) => value && onSortChange(value)}
        aria-label="Sort talks by"
      >
        <ToggleGroupItem 
          value="votes" 
          aria-label="Sort by votes" 
          className="text-base flex items-center gap-1 data-[state=on]:bg-purple-100 data-[state=on]:text-purple-700 dark:data-[state=on]:bg-purple-900/70 dark:data-[state=on]:text-purple-200 focus-ring"
        >
          <TrendingUp className="h-5 w-5" />
          <span className="hidden sm:inline">Votes</span>
        </ToggleGroupItem>
        <ToggleGroupItem 
          value="time" 
          aria-label="Sort by time" 
          className="text-base flex items-center gap-1 data-[state=on]:bg-purple-100 data-[state=on]:text-purple-700 dark:data-[state=on]:bg-purple-900/70 dark:data-[state=on]:text-purple-200 focus-ring"
        >
          <Clock className="h-5 w-5" />
          <span className="hidden sm:inline">Recent</span>
        </ToggleGroupItem>
        <ToggleGroupItem 
          value="random" 
          aria-label="Sort randomly" 
          className="text-base flex items-center gap-1 data-[state=on]:bg-purple-100 data-[state=on]:text-purple-700 dark:data-[state=on]:bg-purple-900/70 dark:data-[state=on]:text-purple-200 focus-ring"
        >
          <Shuffle className="h-5 w-5" />
          <span className="hidden sm:inline">Random</span>
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
};

export default TalkFilters;
