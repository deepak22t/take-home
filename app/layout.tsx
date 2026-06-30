import type { Metadata } from "next";
import { Providers } from "@/app/providers";
import "@/app/globals.css";
export const metadata: Metadata = {
  title: "Annotation Activity Console",
  description: "Frontend take-home implementation for task activity monitoring.",
};
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
