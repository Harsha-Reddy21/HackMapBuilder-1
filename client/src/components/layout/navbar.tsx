import { Link, useLocation } from "wouter";
import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import MobileMenu from "@/components/ui/mobile-menu";
import UserMenu from "@/components/ui/user-menu";

const navItems = [
  { label: "Discover", href: "/hackathons" },
  { label: "My Teams", href: "/teams" },
  { label: "Ideas Board", href: "/ideas" },
  { label: "Dashboard", href: "/dashboard" },
];

export function Navbar() {
  const [location] = useLocation();

  return (
    <nav className="sticky top-0 bg-white border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/">
                <div className="flex items-center gap-2 cursor-pointer">
                  <MapPin className="text-primary h-6 w-6" />
                  <span className="font-bold text-xl text-primary-600">HackMap</span>
                </div>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems.map((item) => (
                <Link key={item.href} href={item.href}>
                  <a
                    className={cn(
                      "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium",
                      location === item.href || (item.href === "/hackathons" && location === "/")
                        ? "border-primary-500 text-gray-900"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    )}
                  >
                    {item.label}
                  </a>
                </Link>
              ))}
            </div>
          </div>
          
          <UserMenu />
          
          <div className="-mr-2 flex items-center sm:hidden">
            <MobileMenu />
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
