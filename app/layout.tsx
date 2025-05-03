import type { Metadata } from "next";
import "./globals.css";
import ConditionalSessionProvider from './components/ConditionalSessionProvider'


export const metadata: Metadata = {
  title: "Toy Shop",
  description: "Cửa hàng đồ chơi Đà Nẵng",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="vi">
      <body>
        <ConditionalSessionProvider>
          {children}
        </ConditionalSessionProvider>
      </body>
    </html>
  )
}
