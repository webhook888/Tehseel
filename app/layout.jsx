import Providers from "./providers";
import AppHeader from "@/components/AppHeader";

export const metadata = {
  title: "Invoice Management System",
  description: "Billing / invoicing system with dynamic QR codes",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" dir="ltr">
      <body>
        <Providers>
          <AppHeader />
          {children}
        </Providers>
      </body>
    </html>
  );
}
