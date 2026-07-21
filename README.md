# Multi-Backend Todo App (Vite & Next.js vs. Node, Next.js, NestJS, FastAPI)

Dự án này là mô hình thực tế để so sánh trực quan cấu trúc thư mục, triết lý thiết kế, hiệu năng, và cách viết mã nguồn của các framework phổ biến ở cả Frontend và Backend kết nối chung đến cơ sở dữ liệu **PostgreSQL**.

> 📐 **Xem tài liệu đặc tả kiến trúc chi tiết**: [ARCHITECTURE.md](file:///Users/aminhp93/personal/githubcoffee/todo-app/ARCHITECTURE.md)

---

## 🏗️ Kiến trúc & Cổng kết nối (Ports Allocation)

### 1. Database
- **PostgreSQL**: Port `5432` (Tên DB: `todo_db`, User/Password: `postgres`/`postgres`).

### 2. Backends (Đồng nhất Interface: `GET`, `POST`, `PATCH`, `DELETE` tại `/api/todos`)
- **be-node-express** (Node.js + Express + pg client): Port `5001`
- **be-nextjs** (Next.js Route Handlers): Port `5002`
- **be-nestjs** (NestJS): Port `5003`
- **be-fastapi** (FastAPI Python): Port `5004`

### 3. Frontends
- **fe-vite** (Vite + React SPA + TypeScript): Port `5173`
- **fe-nextjs** (Next.js App Router Client): Port `3000`

---

## 🚀 Khởi chạy dự án

### Cách 1: Sử dụng Docker Compose (Tự động & Đóng gói hoàn toàn)

Để khởi chạy tất cả các dịch vụ (Database, 4 Backends và 2 Frontends) cùng một lúc:
```bash
docker compose up --build
```

Nếu bạn chỉ muốn chạy **Database** trên Docker và tự chạy các dịch vụ Backend/Frontend cục bộ để dev/debug:
```bash
docker compose up -d db
```

---

### Cách 2: Khởi chạy thủ công từng phần (Local Development)

Trước khi chạy các Backend/Frontend thủ công, hãy chắc chắn rằng dịch vụ Database đã được khởi động thông qua Docker: `docker compose up -d db`.

#### 1. Khởi chạy các Backends (chọn một hoặc chạy tất cả cùng lúc)
- **Node-Express (`be-node-express`)**:
  ```bash
  cd be-node-express
  npm install
  npm run dev
  ```
- **Next.js API (`be-nextjs`)**:
  ```bash
  cd be-nextjs
  npm install
  npm run dev
  ```
- **NestJS (`be-nestjs`)**:
  ```bash
  cd be-nestjs
  npm install
  npm run dev
  ```
- **FastAPI Python (`be-fastapi`)**:
  ```bash
  cd be-fastapi
  pip install -r requirements.txt
  python main.py
  ```

#### 2. Khởi chạy các Frontends (chọn một hoặc chạy cả hai)
- **Vite React UI (`fe-vite`)**:
  ```bash
  cd fe-vite
  npm install
  npm run dev
  ```
- **NextJS UI (`fe-nextjs`)**:
  ```bash
  cd fe-nextjs
  npm install
  npm run dev
  ```

---

## 🎯 Cách chuyển đổi linh hoạt Backend trên UI

1. Mở trình duyệt truy cập:
   - **Vite Frontend**: [http://localhost:5173](http://localhost:5173)
   - **Next.js Frontend**: [http://localhost:3000](http://localhost:3000)
2. Ở đầu trang giao diện, có thanh **CHỌN BACKEND API** với 4 tùy chọn tương ứng với các Port `5001` đến `5004`.
3. Nhấp vào bất kỳ nút nào để chuyển đổi ngay lập tức. Hệ thống sẽ tự động gửi yêu cầu ping/fetch để kiểm tra trạng thái hoạt động của Server đó và hiển thị màu kết nối (Xanh lá - Thành công, Đỏ - Lỗi kết nối).
4. Bạn có thể thêm, cập nhật trạng thái hoàn thành (toggle), hoặc xóa Todos trên từng server để cảm nhận trực quan tính đồng nhất của dữ liệu thông qua cơ sở dữ liệu Postgres chung.
