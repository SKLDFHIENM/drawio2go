import { createLogger } from "@/lib/logger";

const logger = createLogger("ChatFileOperations");

/**
 * 文件操作相关的工具函数
 */

interface FileDialogOptions {
  defaultPath?: string;
  filters?: Array<{ name: string; extensions: string[] }>;
  properties?: string[];
}

/**
 * 使用 Electron 文件保存对话框
 */
export const showSaveDialog = async (
  options: FileDialogOptions,
): Promise<string | null> => {
  if (window.electron?.showSaveDialog) {
    try {
      return await window.electron.showSaveDialog(options);
    } catch (error) {
      logger.error("保存对话框失败:", error);
      return null;
    }
  }
  return null;
};

/**
 * 使用 Electron 写入文件
 */
export const writeFile = async (
  filePath: string,
  content: string,
): Promise<boolean> => {
  if (window.electron?.writeFile) {
    try {
      await window.electron.writeFile(filePath, content);
      return true;
    } catch (error) {
      logger.error("写入文件失败:", error);
      return false;
    }
  }
  return false;
};

/**
 * 浏览器环境下载文件
 */
export const downloadFile = (content: string, filename: string): void => {
  const blob = new Blob([content], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
};
