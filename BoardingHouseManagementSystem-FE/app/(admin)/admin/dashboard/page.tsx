export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-slate-900">Tổng quan Quản trị viên</h2>
      <p className="text-slate-600">Trang này dành cho Admin để quản lý toàn bộ hệ thống, kiểm duyệt tài khoản chủ trọ và thiết lập cấu hình.</p>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="font-semibold text-slate-700">Tổng số Chủ trọ</h3>
          <p className="text-3xl font-bold mt-2 text-primary">--</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="font-semibold text-slate-700">Tổng số Khách thuê</h3>
          <p className="text-3xl font-bold mt-2 text-primary">--</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="font-semibold text-slate-700">Doanh thu nền tảng</h3>
          <p className="text-3xl font-bold mt-2 text-primary">--</p>
        </div>
      </div>
    </div>
  );
}
