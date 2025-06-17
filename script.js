/**
 * 法規顯示 - 主要 JavaScript 檔案
 * 
 * 功能：
 * - 從 URL 提取 ID 並載入對應的文字檔案
 * - 與 formatter.js 整合，格式化
 * 
 * 作者：國立臺北大學學生自治會（使用 Claude.ai ）
 */

// 主要的文件載入和顯示功能類別
class FileDisplaySystem {
    constructor() {
        // 取得 DOM 元素的參考
        this.loadingElement = document.getElementById('loading');
        this.errorElement = document.getElementById('error');
        this.contentElement = document.getElementById('content');
        this.manifestData = null;
        
        // 檢查必要的 DOM 元素是否存在
        this.validateDOMElements();
    }

    /**
     * 驗證必要的 DOM 元素是否存在
     * 確保頁面結構正確
     */
    validateDOMElements() {
        const requiredElements = [
            { element: this.loadingElement, id: 'loading' },
            { element: this.errorElement, id: 'error' },
            { element: this.contentElement, id: 'content' }
        ];

        for (const { element, id } of requiredElements) {
            if (!element) {
                console.error(`錯誤：找不到必要的 DOM 元素 #${id}`);
                // 如果找不到元素，嘗試建立基本的錯誤顯示
                this.createFallbackErrorDisplay(`系統初始化失敗：找不到元素 #${id}`);
                return false;
            }
        }
        return true;
    }

    /**
     * 建立備用的錯誤顯示元素（當原始元素不存在時）
     * @param {string} message - 錯誤訊息
     */
    createFallbackErrorDisplay(message) {
        const errorDiv = document.createElement('div');
        errorDiv.style.cssText = `
            color: #d32f2f;
            background-color: #ffebee;
            border: 1px solid #f8bbd9;
            padding: 10px;
            border-radius: 4px;
            margin: 10px;
            font-family: Arial, sans-serif;
        `;
        errorDiv.textContent = message;
        document.body.appendChild(errorDiv);
    }

    /**
     * 從網址中提取 ID 並補零到三位數
     * @returns {string|null} 補零後的 ID 或 null（如果無效）
     */
    extractAndPadId() {
        try {
            // 取得網址中的 hash 部分（去除 # 符號）
            const hash = window.location.hash.substring(1);
            
            // 檢查是否有提供 hash
            if (!hash) {
                throw new Error('請在網址中提供有效的 ID（例如：#7）');
            }
            
            // 檢查是否為純數字
            if (!/^\d+$/.test(hash)) {
                throw new Error('網址中的 ID 必須為純數字');
            }
            
            // 轉換為數字再補零到三位數
            const id = parseInt(hash, 10);
            if (id < 0 || id > 9999) {
                throw new Error('ID 必須在 0-9999 範圍內');
            }
            
            const paddedId = id.toString().padStart(4, '0');
            console.log(`成功提取 ID：${hash} → ${paddedId}`);
            return paddedId;
            
        } catch (error) {
            console.error('ID 提取失敗:', error);
            this.showError(`ID 解析錯誤: ${error.message}`);
            return null;
        }
    }

    /**
     * 載入 manifest.json 檔案
     * @returns {Promise<Array>} manifest 資料陣列
     */
    async loadManifest() {
        try {
            console.log('開始載入 manifest.json...');
            const response = await fetch('file/manifest.json');
            
            if (!response.ok) {
                throw new Error(`無法載入 manifest.json (HTTP ${response.status}: ${response.statusText})`);
            }
            
            const data = await response.json();
            
            // 驗證 manifest 格式
            if (!Array.isArray(data)) {
                throw new Error('manifest.json 格式錯誤：應為陣列格式');
            }
            
            if (data.length === 0) {
                throw new Error('manifest.json 是空的，請確認 file 目錄中有 .txt 檔案');
            }
            
            console.log(`成功載入 manifest，包含 ${data.length} 個檔案`);
            this.manifestData = data;
            return data;
            
        } catch (error) {
            console.error('載入 manifest 失敗:', error);
            throw new Error(`載入 manifest 失敗: ${error.message}`);
        }
    }

    /**
     * 根據 ID 前綴找到對應的檔案名稱
     * @param {string} paddedId - 補零後的 ID
     * @returns {string|null} 找到的檔案名稱或 null
     */
    findFileByIdPrefix(paddedId) {
        if (!this.manifestData) {
            console.error('manifest 資料未載入');
            return null;
        }
        
        console.log(`尋找 ID ${paddedId} 對應的檔案...`);
        
        // 尋找以指定 ID 開頭的檔案
        const targetFile = this.manifestData.find(filename => {
            const isMatch = filename.startsWith(`${paddedId}_`) && filename.endsWith('.txt');
            if (isMatch) {
                console.log(`找到匹配檔案：${filename}`);
            }
            return isMatch;
        });
        
        if (!targetFile) {
            console.warn(`未找到 ID ${paddedId} 對應的檔案`);
            console.log('可用的檔案列表：', this.manifestData);
        }
        
        return targetFile || null;
    }

    /**
     * 載入指定的文本檔案
     * @param {string} filename - 檔案名稱
     * @returns {Promise<string>} 檔案內容
     */
    async loadTextFile(filename) {
        try {
            console.log(`開始載入文本檔案：${filename}`);
            const response = await fetch(`file/${filename}`);
            
            if (!response.ok) {
                throw new Error(`無法載入檔案 ${filename} (HTTP ${response.status}: ${response.statusText})`);
            }
            
            const content = await response.text();
            console.log(`成功載入檔案，內容長度：${content.length} 字元`);
            return content;
            
        } catch (error) {
            console.error('載入文本檔案失敗:', error);
            throw new Error(`載入文本檔案失敗: ${error.message}`);
        }
    }

    /**
     * 使用外部 formatter.js 的 formatter() 函式處理文本內容
     * @param {string} text - 原始文本內容
     * @returns {string} 格式化後的 HTML 內容
     */
    formatTextContent(text) {
        try {
            // 檢查是否有載入 formatter.js 且 formatter 函式存在
            if (typeof formatter === 'undefined') {
                console.warn('警告：formatter.js 未載入或 formatter() 函式不存在，使用預設格式化');
                return this.defaultTextFormatter(text);
            }
            
            // 檢查 formatter 是否為函式
            if (typeof formatter !== 'function') {
                console.warn('警告：formatter 不是函式，使用預設格式化');
                return this.defaultTextFormatter(text);
            }
            
            console.log('使用自訂 formatter() 函式處理文本內容');
            const formattedContent = formatter(text);
            
            // 驗證回傳值
            if (typeof formattedContent !== 'string') {
                console.warn('警告：formatter() 函式回傳值不是字串，使用預設格式化');
                return this.defaultTextFormatter(text);
            }
            
            return formattedContent;
            
        } catch (error) {
            console.error('使用 formatter() 函式時發生錯誤:', error);
            console.log('回退到預設格式化方式');
            return this.defaultTextFormatter(text);
        }
    }

    /**
     * 預設的文本格式化函式（備用方案）
     * @param {string} text - 原始文本
     * @returns {string} 格式化後的 HTML
     */
    defaultTextFormatter(text) {
        console.log('使用預設文本格式化函式');
        
        // HTML 實體轉義函式
        const escapeHtml = (str) => {
            const div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        };
        
        // 轉義 HTML 特殊字符並將換行符轉換為 <br>
        return escapeHtml(text).replace(/\n/g, '<br>');
    }

    /**
     * 顯示錯誤訊息
     * @param {string} message - 錯誤訊息
     */
    showError(message) {
        console.error('顯示錯誤:', message);
        this.hideLoading();
        
        if (this.errorElement) {
            this.errorElement.textContent = message;
            this.errorElement.style.display = 'block';
        }
        
        if (this.contentElement) {
            this.contentElement.style.display = 'none';
        }
    }

    /**
     * 顯示文件內容
     * @param {string} content - 格式化後的文件內容
     * @param {string} filename - 檔案名稱
     */
    showContent(content, filename) {
        console.log(`顯示內容，檔案：${filename}`);
        this.hideLoading();
        
        if (this.errorElement) {
            this.errorElement.style.display = 'none';
        }
        
        if (this.contentElement) {
            // 設定內容和檔案資訊
            this.contentElement.innerHTML = `
                <div style="color: #666; font-size: 0.9em; margin-bottom: 10px; font-family: Arial, sans-serif;">
                    📄 檔案: ${filename}
                </div>
                <div>${content}</div>
            `;
            this.contentElement.style.display = 'block';
        }
    }

    /**
     * 隱藏載入狀態
     */
    hideLoading() {
        if (this.loadingElement) {
            this.loadingElement.style.display = 'none';
        }
    }

    /**
     * 顯示載入狀態
     * @param {string} message - 載入訊息
     */
    showLoading(message = '正在載入文件...') {
        if (this.loadingElement) {
            this.loadingElement.textContent = message;
            this.loadingElement.style.display = 'block';
        }
        
        if (this.errorElement) {
            this.errorElement.style.display = 'none';
        }
        
        if (this.contentElement) {
            this.contentElement.style.display = 'none';
        }
    }

    /**
     * 主要執行流程
     * 整合所有步驟：提取 ID → 載入 manifest → 找檔案 → 載入內容 → 格式化 → 顯示
     */
    async initialize() {
        try {
            console.log('=== 開始文件載入流程 ===');
            this.showLoading('正在載入文件...');

            // 步驟 1: 提取和驗證 ID
            const paddedId = this.extractAndPadId();
            if (!paddedId) {
                return; // 錯誤已在 extractAndPadId 中處理
            }

            // 步驟 2: 載入 manifest
            this.showLoading('正在載入檔案清單...');
            await this.loadManifest();

            // 步驟 3: 尋找對應的檔案
            this.showLoading('正在尋找對應檔案...');
            const filename = this.findFileByIdPrefix(paddedId);
            if (!filename) {
                throw new Error(`找不到 ID ${paddedId} 對應的檔案。請確認：
1. 檔案命名格式為 ${paddedId}_檔案名稱.txt
2. 檔案存在於 file/ 目錄中
3. manifest.json 已正確更新`);
            }

            // 步驟 4: 載入文本檔案
            this.showLoading('正在載入文件內容...');
            const rawContent = await this.loadTextFile(filename);

            // 步驟 5: 使用 formatter.js 格式化內容
            this.showLoading('正在格式化內容...');
            const formattedContent = this.formatTextContent(rawContent);

            // 步驟 6: 顯示最終內容
            this.showContent(formattedContent, filename);
            
            console.log('=== 文件載入流程完成 ===');

        } catch (error) {
            console.error('文件載入流程失敗:', error);
            this.showError(error.message);
        }
    }

    /**
     * 重新載入當前文件（用於 hash 變化時）
     */
    reload() {
        console.log('重新載入文件...');
        this.initialize();
    }
}

// 全域變數：系統實例
let fileDisplaySystem = null;

/**
 * 初始化系統
 * 在 DOM 載入完成後執行
 */
function initializeSystem() {
    console.log('初始化文件顯示系統...');
    
    try {
        fileDisplaySystem = new FileDisplaySystem();
        fileDisplaySystem.initialize();
    } catch (error) {
        console.error('系統初始化失敗:', error);
        
        // 嘗試顯示基本錯誤訊息
        const errorMessage = `系統初始化失敗: ${error.message}`;
        const errorElement = document.getElementById('error');
        if (errorElement) {
            errorElement.textContent = errorMessage;
            errorElement.style.display = 'block';
        } else {
            alert(errorMessage);
        }
    }
}

/**
 * 處理 URL hash 變化
 * 支援無刷新頁面跳轉
 */
function handleHashChange() {
    console.log('偵測到 URL hash 變化:', window.location.hash);
    
    if (fileDisplaySystem) {
        fileDisplaySystem.reload();
    } else {
        console.warn('系統尚未初始化，重新初始化...');
        initializeSystem();
    }
}

// 事件監聽器設定
// 當頁面載入完成時自動執行
document.addEventListener('DOMContentLoaded', initializeSystem);

// 監聽 hash 變化，支援無刷新頁面跳轉
window.addEventListener('hashchange', handleHashChange);

// 監聽頁面顯示事件（處理瀏覽器前進/後退）
window.addEventListener('pageshow', function(event) {
    if (event.persisted) {
        console.log('頁面從快取中恢復，重新載入...');
        handleHashChange();
    }
});

// 全域錯誤處理
window.addEventListener('error', function(event) {
    console.error('全域錯誤:', event.error);
    if (fileDisplaySystem) {
        fileDisplaySystem.showError(`發生未預期錯誤: ${event.error.message}`);
    }
});

// 未處理的 Promise 拒絕
window.addEventListener('unhandledrejection', function(event) {
    console.error('未處理的 Promise 拒絕:', event.reason);
    if (fileDisplaySystem) {
        fileDisplaySystem.showError(`系統錯誤: ${event.reason}`);
    }
});

// 匯出主要類別（供其他腳本使用）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { FileDisplaySystem };
}