# Boarding House Management System - Backend

Dự án Backend cho hệ thống **Quản lý nhà trọ và Căn hộ dịch vụ (SaaS)**, được xây dựng bằng kiến trúc RESTful API.

---

## 💻 Giải thích Công nghệ sử dụng (Tech Stack)

Để các thành viên trong nhóm dễ dàng nắm bắt, dưới đây là danh sách các công nghệ cốt lõi được sử dụng trong dự án và vai trò của chúng:

1. **Java 21**: Ngôn ngữ lập trình chính. Phiên bản 21 (LTS) là phiên bản ổn định mới nhất, hỗ trợ nhiều tính năng ưu việt.
2. **Spring Boot 3.3.1**: Framework lõi giúp xây dựng các API nhanh chóng, cấu hình tự động (auto-configuration) và tích hợp sẵn server Tomcat.
3. **Spring Data JPA & Hibernate**: Công cụ ORM (Object-Relational Mapping). Giúp thao tác với Database (Thêm, Sửa, Xóa, Lấy dữ liệu) thông qua các Class Java (Entity) thay vì phải viết các câu lệnh SQL truyền thống.
4. **PostgreSQL**: Hệ quản trị Cơ sở dữ liệu quan hệ mạnh mẽ, được dùng để lưu trữ toàn bộ dữ liệu của hệ thống.
5. **Spring Security & JWT (JSON Web Token)**: Hệ thống bảo mật và phân quyền (RBAC). 
   - Spring Security đóng vai trò như một "người gác cổng" chặn các yêu cầu không hợp lệ.
   - JWT là "thẻ thông hành" mã hóa các thông tin (ID, Role) để cấp quyền truy cập sau khi người dùng đăng nhập.
6. **Springdoc OpenAPI (Swagger UI)**: Công cụ tự động quét code và tạo ra một trang web Tài liệu API cực kỳ trực quan, giúp Frontend biết có những API nào và cách gọi ra sao.
7. **Lombok (v1.18.36)**: Thư viện tự động sinh ra các đoạn code lặp đi lặp lại như `Getter`, `Setter`, `Constructor`, giúp class Java ngắn gọn và sạch sẽ hơn.
8. **Cloudinary**: Dịch vụ lưu trữ đám mây bên thứ ba được tích hợp để upload và lưu trữ hình ảnh phòng trọ.

---

## 🎯 Mục tiêu dự án
Dự án nhằm số hóa hoàn toàn quy trình vận hành và quản lý nhà trọ/căn hộ cho thuê. Hệ thống giúp giải quyết các "nỗi đau" thường gặp của chủ nhà (quên tính tiền điện nước, thất lạc giấy tờ hợp đồng, khó kiểm soát lịch hẹn) và mang lại trải nghiệm tiện lợi cho khách thuê (dễ dàng báo cáo sự cố, xem hóa đơn minh bạch, nhắn tin trực tiếp với chủ nhà). 

Với mô hình SaaS (Software as a Service), dự án cho phép nền tảng kinh doanh cung cấp các "Gói dịch vụ" (Subscriptions) cho nhiều chủ trọ khác nhau sử dụng chung một hệ thống nhưng dữ liệu được phân tách rõ ràng.

---

## 📖 Tổng quan & Luồng hoạt động (System Flow)

Hệ thống được thiết kế xoay quanh 3 nhóm người dùng (Roles) chính, với các luồng nghiệp vụ như sau:

### 1. Luồng của System Admin (Quản trị viên hệ thống)
- Quản lý các tài khoản trên toàn hệ thống.
- Thiết lập các **Gói dịch vụ (Subscription Packages)** (ví dụ: Gói dùng thử 5 phòng, Gói Pro không giới hạn).

### 2. Luồng của Landlord (Chủ nhà)
- **Đăng ký & Chọn gói:** Chủ nhà tạo tài khoản và mua/đăng ký một Gói dịch vụ.
- **Quản lý cơ sở vật chất:** Chủ nhà tạo danh sách Tòa nhà (Buildings) và các Phòng trọ (Rooms). Có thể upload hình ảnh thực tế của phòng lên hệ thống.
- **Quản lý Khách thuê & Hợp đồng:** Khi có khách chốt phòng, chủ nhà tạo Hợp đồng (Contract) và gán Khách thuê (Tenant) vào phòng.
- **Vận hành hàng tháng:** Ghi chép chỉ số điện nước (Utility Records) định kỳ. Dựa vào đó hệ thống sẽ tự động xuất Hóa đơn (Invoices).
- **Tương tác:** Tiếp nhận và xử lý các Báo cáo sự cố (Issues) từ khách thuê, xác nhận Lịch hẹn xem phòng (Appointments) từ khách vãng lai, và nhắn tin (Chat) với khách.

### 3. Luồng của Tenant (Khách thuê)
- **Truy cập:** Khách thuê đăng nhập vào tài khoản (thường do chủ nhà cấp hoặc tự đăng ký rồi được gán vào phòng).
- **Xem thông tin:** Theo dõi chi tiết Hợp đồng hiện tại, xem các Hóa đơn tiền phòng & điện nước hàng tháng.
- **Tương tác:** Gửi Báo cáo sự cố (Hỏng bóng đèn, vỡ ống nước...) cho chủ nhà. Chat trực tiếp với chủ nhà qua hệ thống tin nhắn.

---

## 🚀 Chi tiết các chức năng đã hoàn thiện

Dự án đã phát triển hoàn thiện các Module Backend cốt lõi:

1. **Authentication & Authorization (`user` module)**
   - Bảo mật và phân quyền bằng **JWT**.
   - Các Role: `admin`, `landlord`, `tenant`.

2. **Quản lý Cơ sở vật chất (`building`, `room` module)**
   - CRUD Tòa nhà (Địa chỉ, số lượng tầng).
   - CRUD Phòng trọ (Giá thuê, diện tích, trạng thái, tiện ích).
   - Tích hợp **Cloudinary API** để upload và quản lý nhiều hình ảnh cho mỗi phòng (`RoomImage`).

3. **Quản lý Gói dịch vụ - SaaS (`subscription` module)**
   - Quản lý tên gói, giá tiền, số lượng phòng tối đa và thời hạn (Tháng).

4. **Khách thuê & Hợp đồng (`tenant`, `contracts` module)**
   - Quản lý hồ sơ Khách thuê (Căn cước công dân, quê quán...).
   - Tạo và quản lý vòng đời Hợp đồng thuê nhà.

5. **Dịch vụ & Tính tiền (`utility`, `invoices` module)**
   - Chốt số điện/nước hàng tháng (`utility_records`).
   - Tạo Hóa đơn tính tổng tiền.

6. **Tương tác & CSKH (`appointment`, `issue`, `chat` module)**
   - Đặt lịch hẹn, Báo cáo sự cố và Chat.

---

## 🛠 Hướng dẫn cài đặt & Chạy dự án

### 1. Yêu cầu hệ thống
- **Java 21** (Project SDK bắt buộc phải là bản 21 để tương thích với Lombok mới nhất).
- Maven 3.x
- PostgreSQL (hoặc Neon PostgreSQL)

### 2. Cấu hình biến môi trường
Mở file `src/main/resources/application.properties` và cấu hình các thông số sau:

```properties
# Database Configuration
spring.datasource.url=jdbc:postgresql://<host>/<dbname>
spring.datasource.username=<username>
spring.datasource.password=<password>

# Cloudinary Configuration (Upload ảnh)
cloudinary.cloud-name=<your-cloud-name>
cloudinary.api-key=<your-api-key>
cloudinary.api-secret=<your-api-secret>
```

### 3. Khởi chạy dự án
Chạy lệnh sau tại thư mục gốc:
```bash
mvn clean install
mvn spring-boot:run
```
> **Data Seeder (Dữ liệu mẫu):** Trong quá trình Backend khởi chạy, hệ thống sẽ tự động chèn dữ liệu mẫu vào Database bao gồm: 
> - 3 Tài khoản mẫu: `admin` (Role admin), `chutro` (Role landlord), `khachthue` (Role tenant). (Mật khẩu chung: `123456`)
> - 1 Khu trọ mẫu: "Chung cư mini Hoa Hồng".
> - 3 Phòng trọ mẫu (P101, P102, P201).
> - 2 Gói dịch vụ mẫu.

### 4. Xem tài liệu API (Swagger UI) & Cách Test Bảo mật
Hệ thống đã tích hợp sẵn Springdoc OpenAPI. Sau khi ứng dụng chạy, bạn truy cập:
- **URL**: `http://localhost:8080/swagger-ui/index.html`

> [!NOTE] 
> **Lưu ý xác thực (Authorization):**
> Hiện tại dự án đang hoãn phần Login thực tế. Để vượt qua lớp bảo mật khi test trên Swagger hoặc Postman, bạn làm như sau:
> 1. Gọi API `GET /api/test/token/{userId}`. Truyền ID của user bạn muốn đóng vai (Ví dụ `2` là `chutro`).
> 2. API sẽ trả về cho bạn một chuỗi **Token**.
> 3. Bấm vào nút hình ổ khóa **Authorize** ở đầu trang Swagger, dán chuỗi Token đó vào để hệ thống xác nhận bạn là `chutro`.
> 4. Bây giờ bạn có thể gọi các API khác một cách bình thường!
