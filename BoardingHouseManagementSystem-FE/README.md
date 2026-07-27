<div align="center">
  <img src="https://img.icons8.com/color/96/000000/house-with-a-garden.png" alt="Logo" width="80" height="80">
  
  <h1 align="center">🏘️ Boarding House Management System - Frontend</h1>

  <p align="center">
    <strong>Giao diện người dùng cho Hệ Thống Quản Lý Phòng Trọ</strong>
    <br />
    <br />
    <a href="https://nextjs.org/">
      <img src="https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" alt="Next.js" />
    </a>
    <a href="https://www.typescriptlang.org/">
      <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
    </a>
    <a href="https://tailwindcss.com/">
      <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
    </a>
  </p>
</div>

---

## 🌟 Tổng Quan
Dự án **Boarding House Management System (FE)** được xây dựng dựa trên Next.js (App Router), TypeScript và Tailwind CSS. Mục tiêu là cung cấp một giao diện thân thiện, hiện đại và dễ sử dụng cho cả **Chủ trọ (Landlord)**, **Người thuê (Tenant)** và **Khách (Guest)**.

## 📁 Cấu Trúc Thư Mục

Dưới đây là kiến trúc thư mục chính của dự án và chức năng của từng thành phần:

```text
BoardingHouseManagementSystem-FE/
├── 📱 app/                  # Chứa toàn bộ các trang (routes) của ứng dụng theo chuẩn App Router
│   ├── 👤 (guest)/          # Route group cho khách chưa đăng nhập (Home, Login, Register)
│   ├── 👑 (landlord)/       # Route group dành riêng cho Chủ trọ (Quản lý phòng, hóa đơn...)
│   ├── 🧑‍🤝‍🧑 (tenant)/         # Route group dành riêng cho Người thuê (Xem thông tin, báo cáo...)
│   └── 🔌 api/              # Chứa các Next.js API Routes (Backend BFF)
│
├── 🧩 components/           # Chứa các React Components tái sử dụng
│   ├── 🔐 auth/             # Các component liên quan đến xác thực (LoginForm, RegisterForm...)
│   ├── 📊 dashboard/        # Các component dùng trong trang quản trị
│   ├── 🖼️ layout/           # Các thành phần cấu trúc trang (Header, Sidebar, Footer, Navigation)
│   ├── 📦 providers/        # Các Context Providers (vd: ThemeProvider, AuthProvider)
│   └── 🎨 ui/               # Các UI components dùng chung, thường được gen bởi shadcn/ui (Button, Input, Card...)
│
├── 🛠️ lib/                  # Chứa các hàm tiện ích và cấu hình dùng chung
│   ├── 🌐 apiClient.ts      # Cấu hình Axios/Fetch để gọi API backend
│   ├── 🛡️ auth.ts           # Cấu hình NextAuth hoặc các hàm kiểm tra quyền
│   └── 🧰 utils.ts          # Các hàm helper thông dụng (format date, currency, string...)
│
├── 🏷️ types/                # Chứa định nghĩa TypeScript (Interfaces, Types)
│   ├── 🛡️ auth.ts           # Type cho session/user authentication
│   └── 🛡️ next-auth.d.ts    # Khai báo mở rộng module cho NextAuth
│
├── ⚙️ next.config.ts        # File cấu hình Next.js
├── 💨 tailwind.config.ts    # Cấu hình giao diện và màu sắc cho Tailwind CSS 
├── 🧩 components.json       # Cấu hình của shadcn/ui 
└── 📦 package.json          # Quản lý thư viện và scripts của dự án
```

---

## 🔍 Chi Tiết Các Thư Mục Chính

### 📱 `app/` (Routing)
Thư mục quan trọng nhất của Next.js (App Router). Dự án sử dụng **Route Groups** (các thư mục có dấu ngoặc đơn `(...)`) để phân tách logic và layout mà không làm ảnh hưởng đến URL:
- **`(guest)`**: Nơi chứa các trang public như Đăng nhập, Đăng ký.
- **`(landlord)`**: Khu vực dành cho quản lý (Admin/Landlord), sử dụng layout riêng (như có Sidebar, Header bảo mật).
- **`(tenant)`**: Khu vực dành cho người dùng thuê trọ, với layout thân thiện hơn.

### 🧩 `components/` (Tái sử dụng)
Áp dụng mô hình **Atomic Design** chia nhỏ component để dễ bảo trì:
- **`ui/`**: Là các block cơ bản nhất (Nút bấm, Ô nhập liệu, Hộp thoại). Chủ yếu được xây dựng sẵn từ thư viện UI (như `shadcn-ui`).
- **`layout/`**: Chứa các phần tử khung của trang.
- Các thư mục khác nhóm theo tính năng hoặc domain logic.

### 🛠️ `lib/` (Tiện ích)
Giữ cho code component sạch sẽ bằng cách đưa các logic gọi API, xử lý chuỗi, cấu hình thư viện vào đây. 

### 🏷️ `types/` (TypeScript)
Đảm bảo tính chặt chẽ của dữ liệu xuyên suốt dự án. Nơi lưu trữ toàn bộ các Model Data nhận được từ API để Frontend có thể hiển thị chính xác.

---

## 🚀 Khởi Chạy Dự Án

> [!TIP]
> **Yêu cầu môi trường:** Đảm bảo bạn đã cài đặt **Node.js** (phiên bản 18+).

**Bước 1:** Clone dự án và cài đặt thư viện
```bash
npm install
# hoặc 
yarn install
```

**Bước 2:** Cấu hình biến môi trường
> Copy file `.env.example` thành `.env.local` và điền các thông tin cần thiết.

**Bước 3:** Chạy server dev
```bash
npm run dev
# hoặc
yarn dev
```
Truy cập ứng dụng tại địa chỉ: `http://localhost:3000`

---
<div align="center">
  <i>Được phát triển bằng sự đam mê ❤️ và rất nhiều cà phê ☕</i>
</div>
