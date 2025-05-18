import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { Users, Star, Archive, Settings } from "lucide-react";

interface MobileNavigationProps {
  activePage: string;
}

export default function MobileNavigation({ activePage }: MobileNavigationProps) {
  return (
    <div className="md:hidden bg-background border-t border-border fixed bottom-0 inset-x-0">
      <div className="flex justify-around">
        <Link href="/profiles">
          <div className={cn(
            "group flex flex-col items-center p-3 cursor-pointer",
            activePage === "profiles" ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}>
            <Users className="h-5 w-5" />
            <span className="text-xs mt-1 font-medium">Profiles</span>
          </div>
        </Link>
        
        <Link href="/favorites">
          <div className={cn(
            "group flex flex-col items-center p-3 cursor-pointer",
            activePage === "favorites" ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}>
            <Star className="h-5 w-5" />
            <span className="text-xs mt-1 font-medium">Favorites</span>
          </div>
        </Link>
        
        <Link href="/archived">
          <div className={cn(
            "group flex flex-col items-center p-3 cursor-pointer",
            activePage === "archived" ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}>
            <Archive className="h-5 w-5" />
            <span className="text-xs mt-1 font-medium">Archived</span>
          </div>
        </Link>
        
        <Link href="/settings">
          <div className={cn(
            "group flex flex-col items-center p-3 cursor-pointer",
            activePage === "settings" ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}>
            <Settings className="h-5 w-5" />
            <span className="text-xs mt-1 font-medium">Settings</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
