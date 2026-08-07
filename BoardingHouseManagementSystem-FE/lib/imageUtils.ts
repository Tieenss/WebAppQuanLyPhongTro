import heic2any from "heic2any";
import imageCompression from "browser-image-compression";

/**
 * Xử lý file ảnh trước khi upload:
 * 1. Chuyển đổi HEIC/HEIF sang JPEG
 * 2. Nén giảm dung lượng (Tối đa 1MB, 1920px)
 */
export async function processImageBeforeUpload(file: File): Promise<File> {
  let imageFile = file;

  // 1. Kiểm tra và chuyển đổi HEIC
  if (
    imageFile.type === "image/heic" || 
    imageFile.type === "image/heif" ||
    imageFile.name.toLowerCase().endsWith(".heic") ||
    imageFile.name.toLowerCase().endsWith(".heif")
  ) {
    try {
      const convertedBlob = await heic2any({
        blob: imageFile,
        toType: "image/jpeg",
        quality: 0.8 // Chất lượng chuyển đổi ban đầu
      });

      // heic2any có thể trả về mảng Blob hoặc Blob đơn
      const resultBlob = Array.isArray(convertedBlob) ? convertedBlob[0] : convertedBlob;
      
      // Tạo file mới với đuôi .jpg
      const newName = imageFile.name.replace(/\.heic$|\.heif$/i, ".jpg");
      imageFile = new File([resultBlob], newName, { type: "image/jpeg" });
    } catch (error) {
      console.error("Lỗi khi chuyển đổi HEIC:", error);
      throw new Error("Không thể xử lý định dạng ảnh HEIC này.");
    }
  }

  // 2. Nén ảnh bằng browser-image-compression
  const options = {
    maxSizeMB: 1, // Kích thước tối đa 1MB
    maxWidthOrHeight: 1920, // Kích thước chiều dài/rộng tối đa
    useWebWorker: true,
    fileType: "image/jpeg" as string // Ép kiểu về JPEG cho nhẹ
  };

  try {
    const compressedBlob = await imageCompression(imageFile, options);
    return new File([compressedBlob], imageFile.name, {
      type: compressedBlob.type,
      lastModified: Date.now(),
    });
  } catch (error) {
    console.error("Lỗi khi nén ảnh:", error);
    // Nếu nén lỗi, trả về file gốc (hoặc file đã convert HEIC)
    return imageFile;
  }
}
