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
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
      </head>
      <body className="bg-gradient-to-br from-indigo-100 via-purple-50 to-teal-100 min-h-screen text-slate-800 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
