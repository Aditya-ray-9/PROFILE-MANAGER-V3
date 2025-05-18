import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { 
  Users, 
  Star, 
  Archive, 
  HelpCircle 
} from "lucide-react";

interface SidebarProps {
  active: string;
  isOpen: boolean;
}

export default function Sidebar({ active, isOpen }: SidebarProps) {
  return (
    <div className={cn(
      "md:flex md:flex-shrink-0",
      isOpen ? "block fixed inset-0 z-40 md:relative" : "hidden"
    )}>
      <div className="flex flex-col w-64 border-r border-gray-200 bg-white">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <nav className="mt-5 flex-1 px-2 space-y-1">
            <Link href="/profiles">
              <a className={cn(
                "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                active === "profiles" 
                  ? "bg-primary bg-opacity-10 text-primary" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}>
                <Users className={cn(
                  "mr-3 h-5 w-5",
                  active === "profiles" ? "text-primary" : "text-gray-400 group-hover:text-gray-500"
                )} />
                Profiles
              </a>
            </Link>
            
            <Link href="/favorites">
              <a className={cn(
                "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                active === "favorites" 
                  ? "bg-primary bg-opacity-10 text-primary" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}>
                <Star className={cn(
                  "mr-3 h-5 w-5",
                  active === "favorites" ? "text-primary" : "text-gray-400 group-hover:text-gray-500"
                )} />
                Favorites
              </a>
            </Link>
            
            <Link href="/archived">
              <a className={cn(
                "group flex items-center px-2 py-2 text-sm font-medium rounded-md",
                active === "archived" 
                  ? "bg-primary bg-opacity-10 text-primary" 
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              )}>
                <Archive className={cn(
                  "mr-3 h-5 w-5",
                  active === "archived" ? "text-primary" : "text-gray-400 group-hover:text-gray-500"
                )} />
                Archived
              </a>
            </Link>
          </nav>
        </div>
        <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
          <div className="flex items-center">
            <div>
              <HelpCircle className="text-gray-400 h-5 w-5" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">Need help?</p>
              <a href="#" className="text-xs font-medium text-primary hover:text-blue-700">
                View documentation
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
