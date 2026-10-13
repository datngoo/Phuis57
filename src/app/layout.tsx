import type { Metadata, Viewport } from 'next';
import './globals.css';
export const metadata: Metadata = {
  title: 'Bắt Kèo — Có kèo là có mặt',
  description: 'Tìm kèo bóng đá phủi ở Thủ Đức. Chọn giờ, chọn sân, ra sân cùng nhau. Bản demo trải nghiệm.',
  robots: { index: false, follow: false },
};
export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#184c3d' };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="vi"><body>{children}</body></html>;
}
