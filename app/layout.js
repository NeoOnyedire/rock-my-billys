
import "./globals.css";
import { getCurrentUser } from "@/lib/auth";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Rock My Billys",
  description: "The league. The rankings. The Monkey is watching.",
};

export default async function RootLayout({ children }) {
  const user = await getCurrentUser();

  return (
    <html lang="en">
      <body>
        <Navbar user={user ? { username: user.username, displayName: user.displayName, role: user.role } : null} />
        <main className="max-w-5xl mx-auto px-4 py-6 sm:py-8 pb-16">{children}</main>
      </body>
    </html>
  );
}
