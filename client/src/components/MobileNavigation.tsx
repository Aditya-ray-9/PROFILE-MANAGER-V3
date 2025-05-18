import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { Users, Star, Archive, Settings } from "lucide-react";

interface MobileNavigationProps {
  activePage: string;
}

export default function MobileNavigation({ activePage }: MobileNavigationProps) {
  return (
    <div className="md:hidden bg-white border-t border-gray-200 fixed bottom-0 inset-x-0">
      <div className="flex justify-around">
        <Link href="/profiles">
          <a className={cn(
            "group flex flex-col items-center p-3",
            activePage === "profiles" ? "text-primary" : "text-gray-500 hover:text-gray-900"
          )}>
            <Users className="h-5 w-5" />
            <span className="text-xs mt-1 font-medium">Profiles</span>
          </a>
        </Link>
        
        <Link href="/favorites">
          <a className={cn(
            "group flex flex-col items-center p-3",
            activePage === "favorites" ? "text-primary" : "text-gray-500 hover:text-gray-900"
          )}>
            <Star className="h-5 w-5" />
            <span className="text-xs mt-1 font-medium">Favorites</span>
          </a>
        </Link>
        
        <Link href="/archived">
          <a className={cn(
            "group flex flex-col items-center p-3",
            activePage === "archived" ? "text-primary" : "text-gray-500 hover:text-gray-900"
          )}>
            <Archive className="h-5 w-5" />
            <span className="text-xs mt-1 font-medium">Archived</span>
          </a>
        </Link>
        
        <Link href="/settings">
          <a className={cn(
            "group flex flex-col items-center p-3",
            activePage === "settings" ? "text-primary" : "text-gray-500 hover:text-gray-900"
          )}>
            <Settings className="h-5 w-5" />
            <span className="text-xs mt-1 font-medium">Settings</span>
          </a>
        </Link>
      </div>
    </div>
  );
}
