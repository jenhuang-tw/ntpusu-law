#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
文件清單生成器
掃描 file/ 目錄中的所有 .txt 檔案，並生成 manifest.json 清單檔案

作者: 法律系學生專案
用途: 靜態網站文件管理系統
"""

import os
import json
import sys
from typing import List, Optional
import logging

# 設定日誌格式（使用繁體中文）
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(sys.stdout)
    ]
)

logger = logging.getLogger(__name__)


class ManifestGenerator:
    """文件清單生成器類別"""
    
    def __init__(self, file_directory: str = "file", manifest_filename: str = "manifest.json"):
        """
        初始化生成器
        
        Args:
            file_directory (str): 要掃描的檔案目錄路徑
            manifest_filename (str): 要生成的清單檔案名稱
        """
        self.file_directory = file_directory
        self.manifest_path = os.path.join(file_directory, manifest_filename)
        self.txt_files: List[str] = []
    
    def validate_directory(self) -> bool:
        """
        驗證目錄是否存在且可訪問
        
        Returns:
            bool: 目錄是否有效
        """
        try:
            if not os.path.exists(self.file_directory):
                logger.error(f"錯誤：目錄 '{self.file_directory}' 不存在")
                return False
            
            if not os.path.isdir(self.file_directory):
                logger.error(f"錯誤：'{self.file_directory}' 不是一個有效的目錄")
                return False
            
            if not os.access(self.file_directory, os.R_OK):
                logger.error(f"錯誤：沒有權限讀取目錄 '{self.file_directory}'")
                return False
            
            logger.info(f"目錄驗證成功：{self.file_directory}")
            return True
            
        except Exception as e:
            logger.error(f"目錄驗證時發生未預期錯誤：{str(e)}")
            return False
    
    def scan_txt_files(self) -> List[str]:
        """
        掃描目錄中的所有 .txt 檔案
        
        Returns:
            List[str]: 找到的 .txt 檔案名稱列表
        """
        try:
            all_files = os.listdir(self.file_directory)
            logger.info(f"目錄中共有 {len(all_files)} 個項目")
            
            # 篩選出 .txt 檔案並排序
            txt_files = [
                filename for filename in all_files 
                if filename.lower().endswith('.txt') and os.path.isfile(os.path.join(self.file_directory, filename))
            ]
            
            # 按檔案名稱排序，確保輸出的一致性
            txt_files.sort()
            
            logger.info(f"找到 {len(txt_files)} 個 .txt 檔案")
            
            # 記錄找到的檔案（用於除錯）
            if txt_files:
                logger.info("找到的 .txt 檔案：")
                for i, filename in enumerate(txt_files, 1):
                    logger.info(f"  {i}. {filename}")
            else:
                logger.warning("警告：未找到任何 .txt 檔案")
            
            self.txt_files = txt_files
            return txt_files
            
        except PermissionError:
            logger.error(f"錯誤：沒有權限訪問目錄 '{self.file_directory}'")
            return []
        except OSError as e:
            logger.error(f"讀取目錄時發生系統錯誤：{str(e)}")
            return []
        except Exception as e:
            logger.error(f"掃描檔案時發生未預期錯誤：{str(e)}")
            return []
    
    def validate_filename_format(self, filename: str) -> bool:
        """
        驗證檔案名稱格式是否符合預期（可選的格式檢查）
        預期格式：XXX_*.txt，其中 XXX 是三位數字
        
        Args:
            filename (str): 要驗證的檔案名稱
            
        Returns:
            bool: 檔案名稱格式是否有效
        """
        try:
            # 移除 .txt 副檔名
            name_without_ext = filename[:-4]  # 移除最後的 '.txt'
            
            # 檢查是否包含底線
            if '_' not in name_without_ext:
                return False
            
            # 取得底線前的部分（應該是三位數字）
            prefix = name_without_ext.split('_')[0]
            
            # 檢查是否為三位數字
            if len(prefix) == 3 and prefix.isdigit():
                return True
            
            return False
            
        except Exception:
            return False
    
    def generate_manifest(self) -> bool:
        """
        生成 manifest.json 檔案
        
        Returns:
            bool: 是否成功生成檔案
        """
        try:
            # 準備要寫入的資料
            manifest_data = self.txt_files
            
            # 驗證每個檔案名稱格式（警告但不阻止）
            invalid_format_files = []
            for filename in self.txt_files:
                if not self.validate_filename_format(filename):
                    invalid_format_files.append(filename)
            
            if invalid_format_files:
                logger.warning("以下檔案名稱格式可能不符合預期（XXX_*.txt）：")
                for filename in invalid_format_files:
                    logger.warning(f"  - {filename}")
                logger.warning("這些檔案仍會被包含在清單中，但可能無法正確顯示")
            
            # 寫入 JSON 檔案
            with open(self.manifest_path, 'w', encoding='utf-8') as f:
                json.dump(manifest_data, f, ensure_ascii=False, indent=2)
            
            logger.info(f"成功生成清單檔案：{self.manifest_path}")
            logger.info(f"清單中包含 {len(manifest_data)} 個檔案")
            
            return True
            
        except PermissionError:
            logger.error(f"錯誤：沒有權限寫入檔案 '{self.manifest_path}'")
            return False
        except json.JSONEncodeError as e:
            logger.error(f"JSON 編碼錯誤：{str(e)}")
            return False
        except IOError as e:
            logger.error(f"檔案寫入錯誤：{str(e)}")
            return False
        except Exception as e:
            logger.error(f"生成清單檔案時發生未預期錯誤：{str(e)}")
            return False
    
    def run(self) -> bool:
        """
        執行完整的清單生成流程
        
        Returns:
            bool: 整個流程是否成功完成
        """
        logger.info("開始執行文件清單生成流程...")
        
        # 步驟 1: 驗證目錄
        if not self.validate_directory():
            logger.error("目錄驗證失敗，程式結束")
            return False
        
        # 步驟 2: 掃描 .txt 檔案
        txt_files = self.scan_txt_files()
        if not txt_files:
            logger.warning("未找到 .txt 檔案，將生成空的清單檔案")
        
        # 步驟 3: 生成清單檔案
        if not self.generate_manifest():
            logger.error("清單檔案生成失敗")
            return False
        
        logger.info("文件清單生成流程完成！")
        return True


def main():
    """主程式進入點"""
    logger.info("=== 文件清單生成器 ===")
    logger.info("用途：掃描 file/ 目錄並生成 manifest.json")
    
    try:
        # 建立生成器實例
        generator = ManifestGenerator()
        
        # 執行生成流程
        success = generator.run()
        
        # 根據結果設定程式結束碼
        if success:
            logger.info("程式執行成功！")
            sys.exit(0)
        else:
            logger.error("程式執行失敗！")
            sys.exit(1)
            
    except KeyboardInterrupt:
        logger.info("程式被使用者中斷")
        sys.exit(130)
    except Exception as e:
        logger.error(f"程式執行時發生未預期錯誤：{str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    main()