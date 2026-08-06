# Báo Cáo Kết Quả Kiểm Thử và Đề Xuất Cải Tiến (WebApp Quản Lý Phòng Trọ)

**Ngày báo cáo:** 04/08/2026
**Người kiểm thử:** Đội ngũ phát triển / QC
**Đánh giá chung:** Các lỗi và đề xuất UX/UI được ghi nhận rất thực tế, phản ánh đúng các vấn đề thường gặp trong quá trình vận hành hệ thống quản lý bất động sản. Đặc biệt các đề xuất tự động điền (auto-fill) và format tiền tệ sẽ giúp tối ưu hóa thời gian thao tác cho người dùng.

---

## I. Các Lỗi Hệ Thống Cần Khắc Phục (Bugs)

### 1. Lỗi Xác Thực & Tải Dữ Liệu (Authentication & State Management)
- **Mô tả:** Tính năng "Nhớ tài khoản". Khi khởi động lại hệ thống, hệ thống chỉ nhớ role (ví dụ: TENANT) và vào đúng trang của role đó nhưng **không load được dữ liệu từ backend**. Thoát ra đăng nhập lại thì mới load được.
- **Phân tích nguyên nhân:** 
  - Token (JWT) có thể chưa được lưu đúng cách (vào LocalStorage hoặc HttpOnly Cookie).
  - Hoặc khi reload trang, logic của Frontend chưa lấy lại Token này để đính kèm vào phần `Authorization Header` của các API request gọi tới Backend.
  - Một trường hợp khác là Token đã hết hạn nhưng Frontend không tự động điều hướng người dùng ra trang đăng nhập mà vẫn giữ ở trang dashboard trống.
- **Mức độ:** Cao (Critical) - Cần ưu tiên xử lý.

### 2. Tính Năng Xem Hợp Đồng (Góc nhìn TENANT)
- **Mô tả:** Chức năng nhập mã hợp đồng để load dữ liệu hợp đồng chưa hoạt động.
- **Trạng thái:** Team đang chờ tìm phương án fix tạm thời.
- **Mức độ:** Cao - Ảnh hưởng trực tiếp đến luồng người thuê.

---

## II. Đề Xuất Cải Tiến UX/UI & Chức Năng (Enhancements)

### 1. Quản Lý Phòng (Góc nhìn LANDLORD)
- **Ảnh minh họa:** Bổ sung thêm phần upload và hiển thị ảnh minh họa cho các phòng.
- **Liên kết dữ liệu người thuê:** Phần nhập thông tin người thuê đang rời rạc, cần liên kết trực tiếp đến **Bảng quản lý người thuê** trong Database.

### 2. Quản Lý Hợp Đồng (Góc nhìn LANDLORD)
- **Chọn tòa nhà:** Bỏ tùy chọn "Tất cả" (All) trong dropdown list khi thêm mới hợp đồng, vì mỗi hợp đồng bắt buộc phải gắn với một tòa nhà cụ thể.
- **Tự động điền (Auto-fill) & Ràng buộc dữ liệu:**
  - **Địa chỉ:** Tự động điền sau khi chọn Tòa nhà.
  - **Diện tích phòng:** Tự động điền sau khi chọn Phòng (không cần nhập tay).
  - **Giá phòng:** Tự động điền theo Phòng đã chọn nhưng **vẫn cho phép sửa thủ công** (phục vụ mục đích thương lượng giá).
  - **Thông tin chủ trọ:** 
    - Hiển thị danh sách tài khoản chủ trọ có sẵn trong hệ thống. 
    - Mặc định tự động chọn tên tương ứng với tài khoản đang đăng nhập. 
    - Thêm tùy chọn "Other" để nhập thủ công nếu muốn thêm tên người khác không nằm trong danh sách.
  - **Thông tin người thuê:** 
    - Liên kết đến Bảng quản lý người thuê. Thiết kế UX ưu tiên việc nhập thông tin cho người mới.
    - **Luồng xử lý:** Sau khi lưu hợp đồng với người thuê mới -> Hệ thống tự động tạo một tài khoản người thuê và lưu thông tin vào hệ thống, đồng thời tạo một thông báo yêu cầu người thuê bổ sung thông tin còn thiếu (ảnh cá nhân, CCCD,...).
  - **CCCD & Thông tin liên quan:** Tự động điền từ database (nếu là người cũ) nhưng cho phép sửa thủ công.
  - **Thời hạn thuê:** Ngày kết thúc phải tự động thay đổi sau khi chọn/sửa thời hạn thuê (VD: 6 tháng) hoặc ngược lại, có thể sửa tay.
- **Định dạng hiển thị (Formatting):**
  - Tiền phòng & Tiền cọc: Format phân cách hàng nghìn (VD: `1.000.000`).
  - Đơn vị: Cần ghi rõ ràng hơn (VD: VNĐ, Tháng, m2).
- **Ghi chú & Phụ lục:** Ưu tiên sử dụng dạng Checklist (tích chọn) cho các điều khoản/ghi chú thường gặp, sau đó mới có phần text-area để viết thủ công các ngoại lệ.
- **Mã nhận phòng & Chữ ký:** 
  - Tự động tạo mã nhận phòng ngay sau khi điền đủ thông tin.
  - Bổ sung vùng để lưu chữ ký điện tử của hai bên.

### 3. Quản Lý Hóa Đơn (Góc nhìn LANDLORD)
- **Thanh toán bằng QR Code:** Bổ sung mã QR ngân hàng (VietQR) tự động gen ra thông tin thanh toán bao gồm: Tài khoản thụ hưởng đã chọn, Số tiền cần đóng, và Nội dung chuyển khoản chuẩn hóa (VD: Tiền phòng 101 tháng 8).
- **Fix tổng thể:** Rà soát và hoàn thiện lại các luồng logic trong hóa đơn (đang tồn đọng nhiều lỗi).

---

## III. Đánh Giá & Các Lỗi/Đề Xuất Bổ Sung (Từ Chuyên Gia)

Các đánh giá từ kết quả test tay của bạn là **rất xuất sắc và tinh tế**. Những phản hồi này đánh trúng vào những "điểm đau" (pain points) lớn nhất của người dùng khi sử dụng phần mềm quản lý: đó là việc phải gõ lại thông tin quá nhiều và hiển thị số tiền khó đọc. 

Tuy nhiên, để danh sách này hoàn hảo và dự án không gặp lỗi khi đi vào hoạt động thực tế, **tôi đề xuất bổ sung thêm các case kiểm thử/logic sau vào backlog để Dev kiểm tra thêm:**

1. **Vấn đề Logic & Toàn vẹn dữ liệu (Data Integrity):**
   - **Xóa dữ liệu:** Điều gì xảy ra nếu Chủ trọ xóa một "Phòng" hoặc "Tòa nhà" đang có Hợp đồng hoặc Hóa đơn chưa thanh toán? *(Hệ thống nên chặn xóa hoặc chuyển trạng thái sang "Lưu trữ/Ẩn" thay vì xóa cứng).*
   - **Check số âm:** Các trường nhập tiền (Giá phòng, Cọc, Hóa đơn) có chặn nhập số âm hoặc ký tự chữ cái không?
   - **Ngày tháng:** "Ngày kết thúc" hợp đồng có được validate bắt buộc phải lớn hơn "Ngày bắt đầu" không?

2. **Quản lý Vòng đời Hợp đồng:**
   - Khi hợp đồng hết hạn, trạng thái của hợp đồng (Hết hạn) và trạng thái của phòng (Đang thuê -> Trống) có được hệ thống tự động cập nhật không? *(Nên có cronjob chạy ngầm mỗi ngày hoặc kiểm tra logic lúc lấy danh sách).*

3. **Quản lý Hóa đơn & Thanh toán:**
   - Hóa đơn cần có các trạng thái rõ ràng: *Chưa thanh toán, Thanh toán 1 phần, Đã thanh toán, Quá hạn*.
   - Việc sinh mã QR rất tiện lợi, nhưng cần làm rõ: Ngân hàng thụ hưởng là tài khoản của Landlord nhập vào cấu hình hay là tài khoản của hệ thống? Nếu là của Landlord thì cần có màn hình quản lý Số tài khoản ngân hàng của Landlord.

4. **Bảo mật dữ liệu (Security - IDOR):**
   - TENANT A nếu biết mã hợp đồng hoặc mã hóa đơn của TENANT B, có thể đổi ID trên URL/API để xem trộm thông tin của TENANT B không? *(Backend bắt buộc phải check quyền sở hữu dữ liệu của user đang request).*

5. **Xử lý Token hết hạn khi đang thao tác:**
   - Liên quan đến lỗi mục I.1: Giả sử Landlord đang hì hục điền một cái Hợp đồng rất dài, mất 15 phút. Lúc bấm "Lưu", Token bất ngờ hết hạn. Hệ thống sẽ báo lỗi và làm mất trắng công sức nhập liệu hay sẽ âm thầm Refresh Token và lưu thành công? *(Cần thiết lập Refresh Token logic ở Frontend).*

---
**Kết luận:** File báo cáo này có thể được chia sẻ ngay cho các thành viên trong nhóm (Frontend, Backend, QC) để đưa vào các Sprint tiếp theo. Các task về Form (Tự động điền, format số) nên giao cho Frontend, trong khi các task về Lưu thông tin người mới, Token Auth và Validation thì Backend cần phối hợp chặt chẽ.
