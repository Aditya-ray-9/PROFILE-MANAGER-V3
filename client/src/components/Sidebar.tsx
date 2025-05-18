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
      <div className="flex flex-col w-64 border-r border-border bg-background">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {/* Use div instead of <a> tags to avoid nesting warnings */}
            <Link href="/profiles">
              <div className={cn(
                "group flex items-center px-2 py-2 text-sm font-medium rounded-md cursor-pointer",
                active === "profiles" 
                  ? "bg-primary bg-opacity-10 text-primary" 
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}>
                <Users className={cn(
                  "mr-3 h-5 w-5",
                  active === "profiles" ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )} />
                Profiles
              </div>
            </Link>
            
            <Link href="/favorites">
              <div className={cn(
                "group flex items-center px-2 py-2 text-sm font-medium rounded-md cursor-pointer",
                active === "favorites" 
                  ? "bg-primary bg-opacity-10 text-primary" 
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}>
                <Star className={cn(
                  "mr-3 h-5 w-5",
                  active === "favorites" ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )} />
                Favorites
              </div>
            </Link>
            
            <Link href="/archived">
              <div className={cn(
                "group flex items-center px-2 py-2 text-sm font-medium rounded-md cursor-pointer",
                active === "archived" 
                  ? "bg-primary bg-opacity-10 text-primary" 
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}>
                <Archive className={cn(
                  "mr-3 h-5 w-5",
                  active === "archived" ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )} />
                Archived
              </div>
            </Link>
          </nav>
        </div>
        <div className="flex-shrink-0 flex border-t border-border p-4">
          <div className="flex items-center">
            <div>
              <HelpCircle className="text-muted-foreground h-5 w-5" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-foreground">Need help?</p>
              <button className="text-xs font-medium text-primary hover:text-primary/80 text-left">
                View documentation
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
