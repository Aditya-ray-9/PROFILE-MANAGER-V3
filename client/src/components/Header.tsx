import { Button } from "@/components/ui/button";
import { UserCircle, Menu, Settings } from "lucide-react";

interface HeaderProps {
  toggleSidebar: () => void;
}

export default function Header({ toggleSidebar }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <button 
              type="button" 
              className="text-gray-500 hover:text-gray-600 focus:outline-none focus:text-gray-600 md:hidden"
              onClick={toggleSidebar}
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center ml-2 md:ml-0">
              <UserCircle className="text-primary h-7 w-7 mr-2" />
              <h1 className="text-xl font-semibold text-gray-800">Profile Manager</h1>
            </div>
          </div>
          <div className="flex items-center">
            <Button variant="outline" size="sm" className="ml-3 flex items-center">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
