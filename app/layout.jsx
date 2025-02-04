import "./globals.css";

export const metadata = {
  title: "Health Influencers App",
  description: "App to search and rank health influencers with AI.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
