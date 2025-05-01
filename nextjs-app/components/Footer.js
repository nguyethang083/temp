import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Facebook,
  Twitter,
  Instagram,
  Youtube,
  Mail,
} from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-white border-t mt-auto">
      <div className="container mx-auto px-12 py-14">
        {" "}
        {/* Increased padding */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 text-center lg:text-left">
          {/* Logo and Description */}
          <div>
            <div className="flex items-center justify-center lg:justify-start gap-2 mb-6">
              <div className="bg-[#1A21BC] text-white p-1 rounded">
                <BookOpen className="h-5 w-5" />
              </div>
              <Link href="/dashboard" className="text-2xl font-bold">
                E-learning<span className="text-indigo-600">•</span>
              </Link>
            </div>
            <p className="text-gray-500 text-sm leading-relaxed">
              Empowering grade 9 students with interactive math learning tools
              and assessments.
            </p>
            <div className="flex justify-center lg:justify-start gap-4 mt-6">
              <Button variant="ghost" size="icon">
                <Facebook className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Twitter className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Instagram className="h-5 w-5" />
              </Button>
              <Button variant="ghost" size="icon">
                <Youtube className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-medium mb-6 text-lg">Resources</h3>
            <ul className="space-y-4 text-sm">
              <li>
                <Button variant="link" className="p-0 h-auto">
                  Practice Tests
                </Button>
              </li>
              <li>
                <Button variant="link" className="p-0 h-auto">
                  Video Tutorials
                </Button>
              </li>
              <li>
                <Button variant="link" className="p-0 h-auto">
                  Worksheets
                </Button>
              </li>
              <li>
                <Button variant="link" className="p-0 h-auto">
                  Formula Sheets
                </Button>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="font-medium mb-6 text-lg">Support</h3>
            <ul className="space-y-4 text-sm">
              <li>
                <Button variant="link" className="p-0 h-auto">
                  Help Center
                </Button>
              </li>
              <li>
                <Button variant="link" className="p-0 h-auto">
                  Contact Us
                </Button>
              </li>
              <li>
                <Button variant="link" className="p-0 h-auto">
                  FAQs
                </Button>
              </li>
              <li>
                <Button variant="link" className="p-0 h-auto">
                  Accessibility
                </Button>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-medium mb-6 text-lg">
              Subscribe to our newsletter
            </h3>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Mail className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  placeholder="Your email"
                  className="pl-10 pr-4 py-2 rounded-md border focus:outline-none focus:ring-2 focus:ring-purple-500 w-full"
                />
              </div>
              <Button>Subscribe</Button>
            </div>
            <p className="text-xs text-gray-500 mt-4">
              Get weekly updates on new resources and features.
            </p>
          </div>
        </div>
        {/* Footer Bottom */}
        <div className="border-t mt-12 pt-8 flex flex-col md:flex-row justify-center md:justify-between items-center">
          <p className="text-sm text-gray-500 text-center md:text-left">
            © 2025 Elearning. All rights reserved.
          </p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <Button variant="link" className="p-0 h-auto text-sm">
              Privacy Policy
            </Button>
            <Button variant="link" className="p-0 h-auto text-sm">
              Terms of Service
            </Button>
            <Button variant="link" className="p-0 h-auto text-sm">
              Cookie Policy
            </Button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
