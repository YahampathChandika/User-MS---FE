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
