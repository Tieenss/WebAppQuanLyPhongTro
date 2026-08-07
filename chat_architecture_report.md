# Báo cáo Kiến trúc & Kỹ thuật Hệ thống Chat Real-time

Hệ thống Chat Real-time mà chúng ta vừa xây dựng là một tổ hợp các công nghệ hiện đại, kết hợp chặt chẽ giữa Frontend (Next.js) và Backend (Spring Boot) để tạo ra trải nghiệm người dùng ngang ngửa các ứng dụng chat chuyên nghiệp như Messenger hay Zalo. 

Dưới đây là báo cáo tổng hợp toàn bộ các kỹ thuật và công nghệ đã sử dụng.

---

## 1. Công nghệ sử dụng (Tech Stack)

### Backend (Máy chủ)
- **Spring Boot 3.x:** Nền tảng cốt lõi xây dựng REST API.
- **Spring WebSocket & STOMP:** Giao thức nhắn tin thời gian thực. Cung cấp khả năng pub/sub (phát và theo dõi) qua các topic.
- **PostgreSQL & Hibernate (JPA):** Hệ quản trị cơ sở dữ liệu quan hệ mạnh mẽ, lưu trữ lịch sử tin nhắn, thông tin nhóm và trạng thái đã đọc.
- **Cloudinary:** Dịch vụ lưu trữ đám mây chuyên dụng để chứa hình ảnh đính kèm và ảnh đại diện nhóm.
- **HikariCP:** Bộ quản lý kết nối (Connection Pool) siêu tốc cho database.

### Frontend (Giao diện)
- **Next.js (React 18):** Framework React mạnh mẽ với khả năng Server-Side Rendering (SSR).
- **Tailwind CSS:** Framework CSS tiện ích giúp xây dựng UI linh hoạt, đẹp mắt và responsive.
- **@stomp/stompjs & sockjs-client:** Thư viện kết nối và quản lý WebSocket ở phía client.
- **browser-image-compression & heic2any:** Bộ đôi thư viện xử lý ảnh thông minh ngay trên trình duyệt trước khi upload.
- **Lucide-React:** Bộ icon đẹp mắt, sắc nét.

---

## 2. Kỹ thuật Backend (Spring Boot)

### 2.1. Cấu hình WebSocket (STOMP Broker)
- Sử dụng `@EnableWebSocketMessageBroker` để kích hoạt STOMP.
- Đăng ký endpoint `/ws-chat` cùng fallback `SockJS` để hỗ trợ các trình duyệt cũ hoặc bị chặn WebSocket thuần.
- Định tuyến tin nhắn: `/app` (nhận từ client) và `/topic` (gửi về client).

### 2.2. Xử lý logic nghiệp vụ (ChatController)
- Kết hợp cả **REST API** (để lấy danh sách chat, lịch sử tin nhắn, tạo nhóm, cập nhật avatar) và **MessageMapping** (để xử lý luồng tin nhắn real-time).
- Kỹ thuật **Lazy Loading & `@Transactional`**: Khắc phục triệt để lỗi `LazyInitializationException` khi truy xuất thông tin nhóm (Conversation) và thành viên (Participants) bằng cách đóng gói các thao tác database vào một transaction duy nhất.
- Tự động tính toán số lượng tin nhắn chưa đọc (`unreadCount`) cho từng thành viên (trừ người gửi) ngay khi có tin nhắn mới được lưu vào DB.

### 2.3. Tối ưu Connection Pool (HikariCP)
- Xử lý tình trạng PostgreSQL (Neon.tech) ngắt kết nối tĩnh bằng cách tinh chỉnh `max-lifetime = 180000ms` và bổ sung `keepalive-time` để duy trì đường truyền mạng ổn định liên tục.

---

## 3. Kỹ thuật Frontend (Next.js)

### 3.1. Hook WebSocket tùy chỉnh (`useChatWebSocket`)
- Gom toàn bộ logic kết nối, theo dõi topic (`subscribe`), và gửi tin nhắn (`publish`) vào một Custom Hook dùng chung.
- **Vượt rào Server-Side Rendering (SSR):** Áp dụng kỹ thuật **Dynamic Import** (`await import("sockjs-client")`) bên trong `useEffect` để ngăn Next.js chạy thư viện SockJS trên môi trường Server (tránh lỗi crash `window is not defined` hoặc `màn hình đen`).

### 3.2. Quản lý Ảnh siêu tối ưu (Image Processing)
- **Chuyển đổi định dạng Apple (HEIC):** Người dùng iPhone chụp ảnh HEIC thường không xem được trên web. Sử dụng `heic2any` để convert âm thầm sang JPEG ngay trên máy người dùng.
- **Nén ảnh Client-Side:** Sử dụng `browser-image-compression` để nén ảnh xuống dưới 1MB và giới hạn kích thước tối đa 1920px. Điều này giúp upload cực nhanh và tiết kiệm băng thông Cloudinary.

### 3.3. UX/UI & Real-time Sync
- **Widget Chat Nổi (Floating Widget):** Chat có thể thu nhỏ/mở rộng, kéo thả tự do trên màn hình mà không làm gián đoạn công việc hiện tại.
- **Thanh kéo thả (Resizable Splitter):** Cho phép người dùng tùy chỉnh chiều rộng danh sách chat y hệt Zalo PC.
- **Đồng bộ thời gian thực toàn cục:**
  - **Unread Badge (Chấm đỏ):** Bắt chính xác tin nhắn đến từ WebSockets để cập nhật chấm đỏ và in đậm chữ mà không cần tải lại trang.
  - **Live Preview:** Tự động hiện nhãn `[Hình ảnh]` hoặc nội dung tin nhắn mới nhất trên thanh bên trái ngay lập tức.
  - **Sync Avatar:** Đổi avatar nhóm trong cài đặt thì ngoài danh sách chat cũng thay đổi tức thì nhờ kiến trúc truyền state (Callback Functions).
- **Auto Scroll & Smart Scroll Button:** Kênh chat tự động cuộn xuống khi có tin mới. Nếu người dùng lướt lên xem tin cũ, nút cuộn thẳng xuống (ChevronDown) sẽ xuất hiện với hiệu ứng làm mờ (backdrop-blur) cực kỳ tinh tế.

---

## 4. Tổng kết
Chức năng Chat của bạn không chỉ đơn thuần là gửi và nhận text. Nó đã được thiết kế kiến trúc chuẩn mực để chịu tải tốt, xử lý truyền thông đa phương tiện mượt mà, thân thiện với SSR của Next.js và sở hữu một UX/UI cao cấp, chau chuốt đến từng pixel.
