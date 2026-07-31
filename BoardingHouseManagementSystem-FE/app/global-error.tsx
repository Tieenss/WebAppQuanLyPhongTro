"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-50 p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-red-100 text-center space-y-4">
            <h2 className="text-xl font-bold text-slate-900">Lỗi hệ thống nghiêm trọng</h2>
            <p className="text-sm text-slate-500">
              {error.message || "Đã xảy ra lỗi không mong muốn ở cấp độ gốc."}
            </p>
            <button
              onClick={() => reset()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-xl transition-colors"
            >
              Thử lại (Recover)
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
