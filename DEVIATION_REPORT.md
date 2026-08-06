# DEVIATION REPORT (BÁO CÁO SAI LỆCH) - HỆ THỐNG QUẢN LÝ PHÒNG TRỌ SAAS

## BẢNG TỔNG HỢP

| STT | Hạng mục / File bị lỗi | Mức độ | Mô tả sự sai lệch / Chệch hướng so với Blueprint | Hướng khắc phục cụ thể |
|---|---|---|---|---|
| **1** | **Vi phạm Kiến trúc (Upload)**<br/>`RoomController.java`, `RoomService.java` | **Major** | Blueprint yêu cầu Frontend upload ảnh lên Cloudinary lấy URL rồi mới truyền dạng String sang BE. Hiện tại BE đang mở endpoint `/{id}/images` nhận `MultipartFile` và tự xử lý upload. | Xóa endpoint upload file tại BE. Sửa Request DTO để nhận trực tiếp `List<String> imageUrls` từ FE gửi lên. FE tích hợp thư viện upload (ví dụ: next-cloudinary). |
| **2** | **Vi phạm Kiến trúc (API Routes)**<br/>`app/api/*` | **Pass** | Tốt. Không phát hiện Next.js API Routes nào tự mở kết nối Database hay dùng Mongoose/Prisma. Frontend hoạt động chuẩn vai trò Client. | Tiếp tục duy trì nguyên tắc "Next.js gọi REST API sang Spring Boot". |
| **3** | **Database & Entity**<br/>`Contract.java` | **Critical** | Bảng `Contract` (Hợp đồng) **hoàn toàn thiếu** trường `accessCode`. Điều này làm sập toàn bộ luồng nghiệp vụ cốt lõi "Khách nhập mã để đổi Role thành Tenant". | Thêm field `accessCode` vào entity `Contract`. Viết bổ sung logic sinh mã ngẫu nhiên khi tạo Hợp đồng. |
| **4** | **Database & Entity**<br/>`Issue.java` | **Minor** | Trường `issueType` đang là `String` tự do. Blueprint yêu cầu phải là Combobox/Enum (DIEN, NUOC, NOI_THAT, VE_SINH) để dễ thống kê. | Đổi kiểu dữ liệu `issueType` sang `@Enumerated(EnumType.STRING)` kèm class `Enum IssueType`. |
| **5** | **Phân quyền Frontend**<br/>`middleware.ts` | **Major** | Middleware chỉ mới cấu hình bảo vệ route cho `/landlord/:path*` và `/tenant/:path*`. Bỏ sót hoàn toàn việc bảo vệ các route dành cho `/admin/*`. | Sửa `matcher` trong `middleware.ts`, bổ sung thêm `"/admin/:path*"`. |
| **6** | **Bảo mật Backend (RBAC)**<br/>`SecurityConfig.java`, Các Controllers | **Critical** | `SecurityConfig` cấu hình cực kỳ lỏng lẻo, chỉ dùng `.anyRequest().authenticated()`. Hầu hết các Controller không dùng `@PreAuthorize`. Dẫn đến lỗ hổng: Tenant/Guest có token hợp lệ vẫn có thể gọi API tạo Room (`POST /api/rooms`). | Bổ sung `@PreAuthorize("hasRole('LANDLORD')")` hoặc config trực tiếp `requestMatchers().hasRole()` trong SecurityConfig cho các API nhạy cảm. |
| **7** | **Thiếu Logic Nghiệp vụ**<br/>(Access Code Flow) | **Critical** | Thiếu API để khách vãng lai (Guest) nhập `accessCode`, xác nhận hợp đồng và tự động đổi role thành `TENANT`. | Tạo endpoint `POST /api/contracts/verify-access-code`. Trong Service, cập nhật Role User và trạng thái hợp đồng. |
| **8** | **Thiếu Logic Nghiệp vụ**<br/>(Hóa đơn tự động) | **Major** | Khi Chủ trọ chốt điện/nước (`UtilityRecordService`), hệ thống chỉ lưu chỉ số mới, **không có** logic trigger tự động tính tiền & sinh ra Hóa đơn (Invoice) cho tháng đó. | Gọi `InvoiceService.createInvoice()` ngay sau khi save thành công `UtilityRecord`, tính toán dựa trên đơn giá phòng. |
| **9** | **Thiếu Logic Nghiệp vụ**<br/>(SaaS Subscription) | **Major** | Đã có Entity `SubscriptionPackage` nhưng Backend **chưa hề** có logic kiểm tra gói cước. Chủ trọ hết hạn gói vẫn có thể tạo hóa đơn bình thường. | Bổ sung middleware/interceptor hoặc logic check hạn mức Subscription trong `InvoiceService` và `RoomService`. |
| **10** | **Business Logic Gaps**<br/>`IssueService.java` | **Pass** | Logic cập nhật trạng thái sự cố `HOAN_THANH` đã tự động gán `resolvedAt = LocalDateTime.now()`. Làm đúng Blueprint. | Tiếp tục duy trì. |
| **11** | **Code Style & Response**<br/>Các Controller API | **Major** | Xử lý Response Wrapper không đồng nhất. `TenantController`, `InvoiceController` dùng `ApiResponse.success()`, trong khi `RoomController`, `IssueController` trả thẳng DTO qua `ResponseEntity.ok()`. Vỡ format JSON trả về cho FE. | Refactor toàn bộ Controller phải bọc kết quả vào `ApiResponse<T>` để FE có chung interface xử lý (data, message, status). |

## CHECKLIST HÀNH ĐỘNG KHẨN CẤP

**Giai đoạn 1: Vá lổ hổng bảo mật & Đồng bộ cấu trúc nền tảng (Backend & Frontend)**
- [ ] Sửa lại Response Wrapper (BE)
- [ ] Khóa chặn Security (BE)
- [ ] Update Middleware (FE)
- [ ] Sửa luồng Upload Ảnh (FE/BE)

**Giai đoạn 2: Bổ sung Entity & Trụ cột nghiệp vụ (Database)**
- [ ] Thêm `accessCode` vào Contract
- [ ] Sửa `Issue Type` thành Enum

**Giai đoạn 3: Code các luồng Logic Cốt lõi đang thiếu**
- [ ] Logic Access Code
- [ ] Logic Auto-Invoice
- [ ] Logic SaaS Gatekeeper
