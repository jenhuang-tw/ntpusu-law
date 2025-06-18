/**
 * 法規文本格式化處理
 * 
 * 功能：將法規檔案的純文本內容，轉換為格式化的 HTML
 * 用途：配合學生自治會網站使用
 * 
 */

/**
 * 主要的文本格式化函式
 * 
 * @param {string} fileText - 原始文本內容
 * @returns {string} 格式化後的 HTML 內容
 * 
 * 這個函式會被 script.js 中的 FileDisplaySystem 呼叫
 * The div class name "jfpc" means "just-for-paragraph-count"
 */
function formatter(fileText) {
    // 初始化變數
    const metadata = {};
    let outputFront = '<div id="lawFront">\n';
    let outputContent = '<div class="regulation-content">\n';
    let inTiao = false;
    
    // 檢查輸入文本是否有效
    if (!fileText || fileText.trim() === '') {
        console.warn('警告：傳入 formatter() 之 fileText 為 NULL 或空值。');
        return '<div>無法處理空白或無效的文本內容</div>';
    }
    
    const lines = fileText.split(/\r?\n/);
    let isInMetadata = false;
    let isInContent = false;
    
    /**
     * 處理 metadata 欄位（支援陣列格式）
     * @param {string} line - 當前處理的行
     * @param {number} index - 當前行索引
     * @returns {number} 新的行索引位置
     */
    function handleMetadataLine(line, index) {
        const match = line.match(/^(\w+):\s*(.*)$/);
        
        if (match) {
            const key = match[1];
            const value = match[2];
            
            if (value === '') {
                // 準備擷取 YAML-style 陣列（如 history:）
                const list = [];
                let currentIndex = index + 1;
                
                while (currentIndex < lines.length && lines[currentIndex].trim().startsWith('-')) {
                    list.push(lines[currentIndex].replace(/^-/, '').trim());
                    currentIndex++;
                }
                
                metadata[key] = list;
                return currentIndex - 1; // 回傳最後處理的索引
            } else {
                metadata[key] = value;
                return index;
            }
        }
        
        return index;
    }
    
    /**
     * 處理內容行
     * @param {string} line - 當前處理的行
     * @returns {string} 格式化後的 HTML
     */
    function handleContentLine(line) {
        let toReturn = '';
        
        // 行首全形空格取代為臨時佔位符「⊕」
        if (line.startsWith('　')) {
            line = '⊕' + line.slice(1);
        }
        line = line.trim();
        
        // 空行處理
        if (line === '') {
            return '';
        }
        
        // 章節標題
        if (/^第[一二三四五六七八九十百千萬零]+[編章節款項目]/.test(line)) {
            if (inTiao) {
                toReturn += '\t</div>\n\t<!-- end 條 -->\n';
                inTiao = false;
            }
            const headingClass = {
                '編': 'law-division',
                '章': 'law-chapter',
                '節': 'law-section',
                '款': 'law-hsubsection',
                '項': 'law-hxiang',
                '目': 'law-hitem'
            };
            const headingMatch = line.match(/第[一二三四五六七八九十百千萬零]+([編章節款項目])/);
            if (headingMatch) {
                const headingType = headingMatch[1];
                toReturn += `\t<div class="zhangJie">\n\t\t<p class="${headingClass[headingType]}">${line}</p>\n\t</div>\n`;
            }
        }
        // 條號
        else if (/^第\s*\d+\s*條/.test(line) || /^第[一二三四五六七八九十百]+條/.test(line)) {
            if (inTiao) {
                toReturn += '\t</div>\n';
            }
            let [tiaoTitle, ...rest] = line.split('（');
            tiaoTitle = tiaoTitle.trim();
            let title = rest.length ? '（' + rest.join('（') : '';
            toReturn += `\t<div class="law-article">\n\t\t<div class="jfpc"><p class="law-art-num">${tiaoTitle}${title}</p></div>\n`;
            inTiao = true;
        }
        // 項（以全形空格開頭或⊕佔位符開頭）
        else if (/^⊕/.test(line)) {
            line = line.slice(1);
            toReturn += `\t\t<p class="xiang">${line}</p>\n`;
        }
        // 款
        else if (/^[一二三四五六七八九十]+、/.test(line)) {
            toReturn += `\t\t<div class="jfpc"><p class="kuan">${line}</p></div>\n`;
        }
        // 目
        else if (/^（[一二三四五六七八九十]+）/.test(line)) {
            toReturn += `\t\t<div class="jfpc"><p class="mu">${line}</p></div>\n`;
        }
        // 一般內容
        else if (line.trim() !== '') {
            toReturn += `\t\t<p class="xiang">${line}</p>\n`;
        }
        
        return toReturn;
    }
    
    // 主要處理迴圈
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        if (line.trim() === '---') {
            if (!isInMetadata && !isInContent) {
                // 開始 metadata 區塊
                isInMetadata = true;
                continue;
            } else if (isInMetadata) {
                // metadata 區塊結束，開始 content
                isInMetadata = false;
                isInContent = true;
                continue;
            }
        }
        
        if (isInMetadata) {
            i = handleMetadataLine(line, i);
        } else if (isInContent) {
            outputContent += handleContentLine(line);
			console.log("outputContent += ", outputContent);
        }
    }
    
    // 結束處理
    if (inTiao) {
        outputContent += '\t</div>\n\t<!--end single article-->\n';
    }
    
    // 建構 front matter HTML
    if (metadata.titleFull) {
        
		let isAbandonedString = '';
		let isAbandonedColor = '';
		if (metadata.status == 'abandoned') {
			isAbandonedString = ' ❌';
			isAbandonedColor = ' color: red;';
		}
		
		outputFront += `<p><span style="font-weight: bold;">法規名稱：</span>${metadata.titleFull} ${isAbandonedString}<br />`;
        
        if (metadata.modifiedType&&metadata.modifiedDate) {
            // 處理日期格式
            let dateStr = metadata.modifiedDate;
            if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
                const [year, month, day] = dateStr.split('-');
                dateStr = `${year}年${parseInt(month)}月${parseInt(day)}日`;
            }
			
            outputFront += '<span style="font-weight: bold;'+isAbandonedColor+'">' +`${metadata.modifiedType}日期：</span>${dateStr}`;
        }
        
        outputFront += '</p>\n\n';
    }
    
    outputFront += '</div>\n\n<h2 class="wp-block-heading">全文</h2>\n\n';
    
    // 建構沿革 HTML
    let historyHtml = '\n<h2 class="wp-block-heading">沿革</h2>\n';
    if (metadata.history && Array.isArray(metadata.history)) {
        metadata.history.forEach(item => {
            historyHtml += `<p>${item}</p>\n`;
        });
    }
    historyHtml += '</div>';
    
    // 組合最終 HTML
    const outputHtml = outputFront+ outputContent +  '</div> <!-- end regulation content -->' + historyHtml;
    
    return outputHtml;
}