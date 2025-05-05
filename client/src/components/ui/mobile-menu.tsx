import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  const { user, isAuthenticated, logout } = useAuth();

  const onNavigate = () => {
    setOpen(false);
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" className="p-2 md:hidden">
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex flex-col">
        <div className="space-y-4 py-4">
          <div className="px-4">
            <h2 className="text-lg font-semibold flex items-center">
              <span className="text-primary">HackMap</span>
            </h2>
          </div>
          
          {isAuthenticated && user && (
            <div className="px-4">
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={user.avatarUrl || ""} alt={user.username} />
                  <AvatarFallback>{user.username[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{user.username}</div>
                  <div className="text-sm text-muted-foreground">{user.email}</div>
                </div>
              </div>
            </div>
          )}
          
          <Separator />
          
          <div className="space-y-1 px-2">
            <Link href="/" onClick={onNavigate}>
              <a className={`block px-3 py-2 rounded-md ${location === '/' ? 'bg-primary-100 text-primary-900' : 'hover:bg-gray-100'}`}>
                Discover
              </a>
            </Link>
            <Link href="/teams" onClick={onNavigate}>
              <a className={`block px-3 py-2 rounded-md ${location === '/teams' ? 'bg-primary-100 text-primary-900' : 'hover:bg-gray-100'}`}>
                My Teams
              </a>
            </Link>
            <Link href="/ideas" onClick={onNavigate}>
              <a className={`block px-3 py-2 rounded-md ${location === '/ideas' ? 'bg-primary-100 text-primary-900' : 'hover:bg-gray-100'}`}>
                Ideas Board
              </a>
            </Link>
            <Link href="/dashboard" onClick={onNavigate}>
              <a className={`block px-3 py-2 rounded-md ${location === '/dashboard' ? 'bg-primary-100 text-primary-900' : 'hover:bg-gray-100'}`}>
                Dashboard
              </a>
            </Link>
          </div>
          
          <Separator />
          
          <div className="space-y-1 px-2">
            {isAuthenticated ? (
              <>
                <Link href="/profile" onClick={onNavigate}>
                  <a className="block px-3 py-2 rounded-md hover:bg-gray-100">Profile</a>
                </Link>
                <button
                  onClick={() => {
                    logout();
                    onNavigate();
                  }}
                  className="block w-full text-left px-3 py-2 rounded-md hover:bg-gray-100"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={onNavigate}>
                  <a className="block px-3 py-2 rounded-md hover:bg-gray-100">Login</a>
                </Link>
                <Link href="/register" onClick={onNavigate}>
                  <a className="block px-3 py-2 rounded-md hover:bg-gray-100">Register</a>
                </Link>
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

export default MobileMenu;
