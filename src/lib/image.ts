/**
 * Resizes an image file using the HTML5 Canvas API.
 * Converts the image to WebP format to save space.
 */
export async function resizeImage(
  file: File,
  maxWidth = 800
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      
      img.onload = () => {
        // Calculate new dimensions
        const scale = maxWidth / img.width;
        // Only scale down, don't scale up small images
        const finalScale = Math.min(scale, 1);
        const newWidth = img.width * finalScale;
        const newHeight = img.height * finalScale;

        // Create canvas
        const canvas = document.createElement("canvas");
        canvas.width = newWidth;
        canvas.height = newHeight;
        
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        // Draw resized image
        ctx.drawImage(img, 0, 0, newWidth, newHeight);

        // Convert back to File (WebP format for better compression)
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Failed to create image blob"));
              return;
            }
            // Create a new File object with the original name but .webp extension
            const newFileName = file.name.replace(/\.[^/.]+$/, ".webp");
            const resizedFile = new File([blob], newFileName, {
              type: "image/webp",
              lastModified: Date.now(),
            });
            resolve(resizedFile);
          },
          "image/webp",
          0.8 // 80% quality is a good balance for LLMs and Storage
        );
      };
      
      img.onerror = (error) => reject(error);
    };
    
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Converts a File object to a Base64 string.
 * This is required for sending the image to the LLM (OpenRouter/Gemini).
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}
