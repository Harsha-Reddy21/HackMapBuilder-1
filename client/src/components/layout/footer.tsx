import { Link } from "wouter";
import { Github, Linkedin, Twitter } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const links = [
  { name: "About", href: "#" },
  { name: "Blog", href: "#" },
  { name: "Hackathons", href: "/hackathons" },
  { name: "Team Builder", href: "/teams" },
  { name: "Organizers", href: "#" },
  { name: "Contact", href: "#" },
];

const socialLinks = [
  { name: "Twitter", icon: Twitter, href: "#" },
  { name: "GitHub", icon: Github, href: "#" },
  { name: "LinkedIn", icon: Linkedin, href: "#" },
];

export function Footer() {
  return (
    <footer className="bg-white">
      <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
        <nav className="-mx-5 -my-2 flex flex-wrap justify-center" aria-label="Footer">
          {links.map((link) => (
            <div key={link.name} className="px-5 py-2">
              <Link href={link.href}>
                <a className="text-base text-gray-500 hover:text-gray-900">
                  {link.name}
                </a>
              </Link>
            </div>
          ))}
        </nav>
        
        <div className="mt-8 flex justify-center space-x-6">
          {socialLinks.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-gray-400 hover:text-gray-500"
            >
              <span className="sr-only">{item.name}</span>
              <item.icon className="h-6 w-6" aria-hidden="true" />
            </a>
          ))}
        </div>
        
        <Separator className="my-8" />
        
        <p className="text-center text-base text-gray-400">
          &copy; {new Date().getFullYear()} HackMap. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
