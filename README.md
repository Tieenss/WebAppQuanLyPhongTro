<div align="center">
  <img src="https://img.icons8.com/color/96/000000/house-with-a-garden.png" alt="Logo" width="100" height="100">
  
  <h1 align="center">🏘️ Boarding House Management System</h1>

  <p align="center">
    <strong>Hệ Thống Quản Lý Phòng Trọ & Căn Hộ Dịch Vụ (SaaS)</strong>
  </p>
</div>

---

## 🌟 Tổng Quan Dự Án

Dự án **Boarding House Management System** là một giải pháp trọn gói (SaaS) nhằm số hóa quy trình vận hành, quản lý nhà trọ và căn hộ cho thuê. Hệ thống được thiết kế để giải quyết các khó khăn của chủ nhà (Landlord) trong việc quản lý phòng, điện nước, hợp đồng, cũng như cung cấp trải nghiệm tiện lợi cho khách thuê (Tenant) khi theo dõi hóa đơn và báo cáo sự cố.

Dự án được chia thành hai phân hệ chính: **Frontend** và **Backend**, nằm trong các thư mục riêng biệt.

---

## 📁 Cấu Trúc Dự Án

| Phân hệ | Thư mục mã nguồn | Công nghệ cốt lõi | Vai trò chính |
|---------|------------------|-------------------|---------------|
| **Frontend** | [`BoardingHouseManagementSystem-FE`](./BoardingHouseManagementSystem-FE/) | Next.js (App Router), TypeScript, Tailwind CSS, shadcn/ui | Giao diện người dùng cho Chủ trọ (Landlord), Người thuê (Tenant) và Khách vãng lai (Guest). |
| **Backend**  | [`BoardingHouseManagementSystem-BE`](./BoardingHouseManagementSystem-BE/) | Java 21, Spring Boot 3.3, PostgreSQL, Spring Security, JWT | Cung cấp RESTful API, xử lý logic nghiệp vụ, quản lý Database và bảo mật. |

---

## 🚀 Tính Năng Nổi Bật

Hệ thống được thiết kế xoay quanh 3 nhóm người dùng (Roles) chính:

1. **System Admin (Quản trị viên hệ thống):**
   - Quản lý các tài khoản trên toàn hệ thống.
   - Thiết lập các **Gói dịch vụ (Subscription Packages)** cho mô hình SaaS.

2. **Landlord (Chủ nhà):**
   - Đăng ký & mua gói dịch vụ SaaS.
   - Quản lý cơ sở vật chất: Tòa nhà, Phòng trọ, upload hình ảnh (qua Cloudinary).
   - Quản lý Hợp đồng & Khách thuê.
   - Chốt điện nước hàng tháng và tự động xuất Hóa đơn.
   - Tương tác: Nhắn tin, xác nhận lịch hẹn, xử lý báo cáo sự cố.

3. **Tenant (Khách thuê):**
   - Xem thông tin phòng và hợp đồng của mình.
   - Theo dõi hóa đơn tiền phòng, điện nước minh bạch.
   - Báo cáo sự cố và nhắn tin trực tiếp với chủ nhà.

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Chạy Dự Án

### Yêu Cầu Hệ Thống
- **Java 21**
- **Node.js 18+**
- **PostgreSQL** (hoặc dùng Neon PostgreSQL)
- **Maven 3.x**

### Bước 1: Khởi chạy Backend (Spring Boot)
1. Di chuyển vào thư mục Backend:
   ```bash
   cd BoardingHouseManagementSystem-BE
   ```
2. Cấu hình biến môi trường: Cập nhật file `src/main/resources/application.properties` với thông tin kết nối Database và Cloudinary.
3. Cài đặt và khởi chạy:
   ```bash
   mvn clean install
   mvn spring-boot:run
   ```
   > **Note:** Backend server sẽ chạy ở port mặc định: `http://localhost:8080`. Có thể xem tài liệu API Swagger tại `http://localhost:8080/swagger-ui/index.html`.

### Bước 2: Khởi chạy Frontend (Next.js)
1. Mở Terminal mới, di chuyển vào thư mục Frontend:
   ```bash
   cd BoardingHouseManagementSystem-FE
   ```
2. Cài đặt các gói thư viện:
   ```bash
   npm install
   ```
3. Cấu hình biến môi trường: Sao chép nội dung file `.env.example` sang file mới tên là `.env.local` và cập nhật các thông số cần thiết.
4. Khởi chạy server giao diện:
   ```bash
   npm run dev
   ```
   > **Note:** Frontend server sẽ chạy ở địa chỉ: `http://localhost:3000`.

---

## 📖 Tài Liệu Chi Tiết (README)

Mỗi phân hệ của dự án đều có tài liệu chi tiết giải thích luồng hoạt động, cấu trúc code và hướng dẫn thao tác cụ thể. Vui lòng tham khảo các liên kết dưới đây để biết thêm chi tiết:

👉 **[Tài liệu Frontend (Next.js)](./BoardingHouseManagementSystem-FE/README.md)**

👉 **[Tài liệu Backend (Spring Boot)](./BoardingHouseManagementSystem-BE/README.md)**

---

<div align="center">
  <i>Được phát triển bằng sự đam mê ❤️ và rất nhiều cà phê ☕</i>
</div>
