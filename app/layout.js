import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "User Management System",
  description: "Complete user management application with CRUD operations",
};

// Add a proper header with navigation
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="border-b">
          <div className="container mx-auto px-6 py-4">
            <h1 className="text-xl font-bold">User Management System</h1>
          </div>
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
