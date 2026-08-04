import "./globals.css";

export const metadata = {
  title: "Radar Tender Pro",
  description: "Sistem Monitoring e-Procurement Pintar",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-gradient-to-br from-indigo-100 via-purple-50 to-teal-50 min-h-screen text-slate-800 antialiased">
        {children}
      </body>
    </html>
  );
}
