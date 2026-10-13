# Bắt Kèo · Web demo

Bản demo tiếng Việt, ưu tiên điện thoại cho việc tìm và tham gia kèo bóng đá phủi ở Thủ Đức. Next.js App Router + TypeScript + Tailwind CSS, xuất HTML tĩnh để host trên GitHub Pages.

## Chạy thử

```sh
npm ci
npm run dev
```

Mở http://localhost:3000. Mọi dữ liệu demo lưu trong localStorage trên trình duyệt. Không cần tài khoản, SMS hay khóa API.

## Kiểm tra và build

```sh
npm run typecheck
npm test
npm run build
npm run preview
```

Thư mục build là `out/`. Khi host dưới đường dẫn repository, đặt `NEXT_PUBLIC_BASE_PATH=/Phuis57` lúc build và khi preview. Workflow `.github/workflows/deploy.yml` tự build, chạy kiểm tra và deploy mỗi lần push `main`.

## Luồng đã có

- Tìm kèo: khu vực + hôm nay / tuần này (tuần lịch, giờ Việt Nam).
- Chi tiết và tham gia một chạm, không duyệt; chặn trùng, đủ chỗ hoặc kèo đã qua giờ.
- Onboarding demo 3 bước: số giả lập → tên/khu vực → giờ rảnh. Không thu số thật, không gửi OTP.
- Tạo kèo 4 field + tùy chọn cần gấp; đội trưởng sửa giờ, sân, ghi chú.
- Chat theo kèo, tự đồng bộ tin ghim với thông tin kèo, chỉ đọc sau 24 giờ.
- Kèo của tôi, xác nhận đã đá / không tham gia sau giờ bắt đầu, hồ sơ và 2 chỉ số uy tín.
- Một trận đã qua giờ được gắn sẵn để thử xác nhận. Khôi phục dữ liệu ở Cá nhân → Bắt đầu lại bản demo.

## Giới hạn demo

Đây là prototype một người dùng, chưa dùng cho trận thật. Tên sân, vị trí khu vực, đội trưởng, hội thoại và chi phí là giả lập. Bản demo không có OTP thật, Supabase, RLS, Realtime hoặc giao dịch đồng thời phía server. Chat và kèo mới không đồng bộ giữa thiết bị. Link mẫu mở chi tiết trong demo; link kèo tự tạo chỉ hoạt động trên trình duyệt chứa kèo đó. Nút Zalo thông báo placeholder, không mở số giả. Phí do đội trưởng ghi chú, không xử lý thanh toán.

Uy tín chỉ mô phỏng phía client, không có tác dụng xác thực hoặc chống gian lận. Không có kiểm soát truy cập an toàn ở backend trong bản này. Các kiểm tra frontend và unit test không thay thế RLS/transaction của bản sản phẩm.

## Cấu trúc

- `src/app/page.tsx`: giao diện và luồng trải nghiệm.
- `src/app/globals.css`: giao diện responsive và hệ màu.
- `src/lib/demo.ts`: dữ liệu mẫu, giờ Việt Nam và logic demo độc lập giao diện.
- `tests/demo.test.ts`: kiểm tra điều kiện tham gia, thời gian, điểm danh và chat.
- `docs/REVIEW.md`: checklist review trên điện thoại.

## Sau khi chốt trải nghiệm

Giữ cấu trúc giao diện, thay kho dữ liệu local bằng Supabase Auth OTP + 5 bảng trong bản mô tả. Dùng RPC transaction để tham gia, unique membership, RLS cho chat, xác nhận sau giờ đá và tổng hợp uy tín phía server. Chỉ triển khai OTP thật khi đã có nhà cung cấp SMS, số điện thoại thật và cấu hình cần thiết. Sau đó kiểm thử với 1–2 trận thật, rồi mới tính PWA hoặc ứng dụng tải về điện thoại.

Tài liệu nền: [Next.js static export](https://nextjs.org/docs/app/guides/static-exports) · [GitHub Pages workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).
