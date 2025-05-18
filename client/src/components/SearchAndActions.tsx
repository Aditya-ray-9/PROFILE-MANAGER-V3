import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, Filter } from "lucide-react";

interface SearchAndActionsProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  openAddProfileModal: () => void;
}

export default function SearchAndActions({ 
  searchQuery, 
  setSearchQuery, 
  openAddProfileModal 
}: SearchAndActionsProps) {
  return (
    <div className="mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <h2 className="text-2xl font-bold text-gray-800">All Profiles</h2>
        <Button onClick={openAddProfileModal} className="bg-primary hover:bg-blue-700">
          <Plus className="mr-2 h-4 w-4" />
          Add Profile
        </Button>
      </div>
      <div className="mt-4 relative">
        <div className="flex rounded-md shadow-sm">
          <div className="relative flex-grow focus-within:z-10">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="text-gray-400 h-4 w-4" />
            </div>
            <Input
              type="text"
              name="search"
              id="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full rounded-md pl-10 rounded-r-none border-r-0"
              placeholder="Search profiles by name or search-ID..."
            />
          </div>
          <Button variant="outline" className="-ml-px rounded-l-none border border-input bg-gray-50 hover:bg-gray-100 text-gray-700">
            <Filter className="h-4 w-4 mr-2" />
            <span>Filter</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
