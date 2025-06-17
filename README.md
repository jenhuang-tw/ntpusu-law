# ntpusu-law
臺北大學學生會自治法規

# 📚 靜態網站文件顯示系統

這是一個基於 GitHub Pages 的靜態網站系統，可以根據網址中的 ID 自動顯示對應的文本文件。系統會自動掃描 `file/` 目錄中的檔案並生成清單，支援動態載入和顯示。

## 🎯 功能特色

- **動態文件載入**：根據網址 hash（如 `show.html#7`）自動載入對應文件
- **自動清單生成**：使用 Python 腳本掃描目錄並生成 `manifest.json`
- **GitHub Actions 自動化**：推送代碼時自動更新清單並部署網站
- **完整錯誤處理**：包含詳細的錯誤訊息和異常處理
- **繁體中文支援**：所有註解和訊息均使用繁體中文

## 📁 專案結構

```
your-repo/
├── show.html                      # 主要顯示頁面
├── generate_manifest.py           # Python 清單生成腳本
├── .github/workflows/deploy.yml   # GitHub Actions 工作流程
├── file/                          # 文本檔案目錄
│   ├── manifest.json              # 自動生成的檔案清單
│   ├── 001_教育法基礎概念.txt        # 範例文本檔案
│   ├── 007_學生權利保障法.txt        # 範例文本檔案
│   └── ...                        # 其他文本檔案
└── README.md                      # 本說明文件
```

## 🚀 快速開始

### 1. 設定 GitHub 儲存庫

1. 建立新的 GitHub 儲存庫
2. 將所有檔案上傳到儲存庫
3. 在儲存庫設定中啟用 GitHub Pages

### 2. 設定 GitHub Pages

1. 進入儲存庫的 **Settings** → **Pages**
2. 在 **Source** 中選擇 **GitHub Actions**
3. 系統會自動使用提供的工作流程進行部署

### 3. 準備文本檔案

在 `file/` 目錄中放置您的文本檔案，檔案命名格式：
```
XXX_描述性名稱.txt
```
例如：
- `001_教育法基礎概念.txt`
- `007_學生權利保障法.txt`
- `015_教師法相關條文.txt`

### 4. 自動部署

當您推送代碼到 main 分支時，GitHub Actions 會自動：
1. 執行 `generate_manifest.py` 掃描 `file/` 目錄
2. 生成或更新 `manifest.json`
3. 提交變更並部署到 GitHub Pages

## 📖 使用方法

### 訪問文件

在瀏覽器中訪問：
```
https://your-username.github.io/your-repo/show.html#7
```

系統會自動：
1. 提取 URL 中的數字 `7`
2. 補零為三位數 `007`
3. 在 `manifest.json` 中尋找以 `007_` 開頭的檔案
4. 載入並顯示該檔案內容

### 手動生成清單

如果需要在本地測試或手動更新清單：

```bash
python generate_manifest.py
```

## ⚙️ 技術說明

### JavaScript 功能

- **ID 提取和驗證**：從 URL hash 提取數字並補零
- **清單載入**：從 `manifest.json` 讀取檔案列表
- **檔案匹配**：根據 ID 前綴找到對應檔案
- **安全顯示**：HTML 實體轉義和換行符處理
- **錯誤處理**：完整的異常捕獲和用戶友好的錯誤訊息

### Python 腳本功能

- **目錄掃描**：遞迴掃描 `file/` 目錄中的 `.txt` 檔案
- **格式驗證**：檢查檔案名稱是否符合 `XXX_*.txt` 格式
- **JSON 生成**：建立排序後的檔案清單
- **錯誤處理**：包含權限、IO 和格式錯誤的處理

### GitHub Actions 工作流程

- **觸發條件**：`file/` 目錄變更或手動觸發
- **自動化流程**：清單生成 → 提交變更 → 部署網站
- **權限管理**：適當的 GitHub token 權限設定

## 🔧 自訂設定

### 修改檔案目錄

在 `generate_manifest.py` 中修改：
```python
generator = ManifestGenerator(file_directory="your_directory")
```

### 修改清單檔案名稱

在 `generate_manifest.py` 中修改：
```python
generator = ManifestGenerator(manifest_filename="your_manifest.json")
```

同時需在 `show.html` 中更新對應的路徑。

### 自訂樣式

編輯 `show.html` 中的 CSS 樣式區塊，可自訂：
- 頁面布局和字體
- 載入狀態顯示
- 錯誤訊息樣式
- 內容顯示格式

## 🐛 故障排除

### 常見問題

1. **檔案無法載入**
   - 檢查檔案名稱格式是否正確（`XXX_*.txt`）
   - 確認 `manifest.json` 是否包含該檔案
   - 檢查檔案是否確實存在於 `file/` 目錄

2. **清單不更新**
   - 確認 GitHub Actions 是否正常執行
   - 檢查是否有權限問題
   - 手動執行 `generate_manifest.py` 測試

3. **網站無法訪問**
   - 確認 GitHub Pages 已正確啟用
   - 檢查儲存庫是否為公開（免費版限制）
   - 等待部署完成（通常需要幾分鐘）

### 除錯步驟

1. 檢查 GitHub Actions 執行記錄
2. 驗證 `manifest.json` 內容
3. 使用瀏覽器開發者工具檢查網路請求
4. 查看瀏覽器控制台的錯誤訊息

## 📝 開發備註

- 所有程式碼註解使用繁體中文
- 遵循 Web 標準和最佳實務
- 支援現代瀏覽器（ES6+）
- 響應式設計，支援行動裝置

## 📄 授權資訊

本專案為教育用途，適合法律系學生學習網頁開發和自動化部署。

## 🤝 貢獻指南

歡迎提交 Issue 和 Pull Request 來改善本專案！

---

💡 **提示**：這個系統特別適合管理大量的法條、筆記或其他文本資料，透過簡單的 URL 就能快速訪問特定內容。
