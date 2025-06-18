/**
 * 法規文本格式化處理
 * 
 * 功能：將法規檔案的純文本內容，轉換為格式化的 HTML
 * 用途：配合學生自治會網站使用
 * 
 */
 

// 處理 metadata 欄位（支援陣列格式）
function handleMetadataLine(line, index) {
	
			  
	const match = line.match(/^(\w+):\s*(.*)$/);
	if (match) {
		const key = match[1];
		const value = match[2];
		if (value === '') {
				  // 準備擷取 YAML-style 陣列（如 history:）
				  const list = [];
				  i++;
				  while (i < lines.length && lines[i].trim().startsWith('-')) {
					list.push(lines[i].replace(/^-/, '').trim());
					i++;
				  }
				  i--; // 修正 for loop index
				  metadata[key] = list;
		} else {
				  metadata[key] = value;
		}
	}
	
}



 

/**
 * 主要的文本格式化函式
 * 
 * @param {string} fileText - 原始文本內容
 * @returns {string} 格式化後的 HTML 內容
 * 
 * 這個函式會被 script.js 中的 FileDisplaySystem 呼叫
 * The div class name "jfpc" means "just-for-paragraph-count"
 */
 
function formatter(fileText, handleMetadataLine, handleContentLine) {
  
  let outputFront = '<div id="lawFront">\n';
  let outputContent = '<div class="regulation-content">\n';
  
  if(fileText !== null && fileText !== '') {
	  const lines = fileText.split(/\r?\n/);
	  let isInMetadata = false;
	  let isInContent = false;

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
		  handleMetadataLine(line, i);
		} else if (isInContent) {
		  handleContentLine(line, i);
		}
	  }
  }
  else {
	console.warn('警告：傳入 formatter() 之 fileText 為 NULL 或空值。');
  }
  
  const outputHtml = outputFront + '</div>\n' + outputContent + '</div>\n';
  return outputHtml;
  
}


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
    
	if(fileText !== null && fileText !== '') {
		
		const lines = fileText.split('\n');
		
		const metadata = {};
		let inMetadata = true;
		
		let outputHtml = '<div class="regulation-content">\n';
		let inTiao = false;
		
		// 逐行處理 開始
		lines.forEach(line => {
			
			/**
			 *
			 * 處理 metadata
			 *
			 */
			
			// 判斷是否結束 metadata（出現 "---"）
			if (line.trim() === '---') {
			  if (i !== 0) {
				// 第二個 ---，代表 metadata 區段結束
				inMetadata = false;
				continue;
			  } else {
				// 第一個 --- 開始 metadata
				continue;
			  }
			}

			if (inMetadata) {
			  // 處理 metadata 欄位（支援陣列格式）
			  const match = line.match(/^(\w+):\s*(.*)$/);
			  if (match) {
				const key = match[1];
				const value = match[2];
				if (value === '') {
				  // 準備擷取 YAML-style 陣列（如 history:）
				  const list = [];
				  i++;
				  while (i < lines.length && lines[i].trim().startsWith('-')) {
					list.push(lines[i].replace(/^-/, '').trim());
					i++;
				  }
				  i--; // 修正 for loop index
				  metadata[key] = list;
				} else {
				  metadata[key] = value;
				}
			  }
			} else {
			  contentLines.push(line);
			}
			
			/**
			 *
			 * 處理 metadata
			 *
			 */
		

	
	

    

	

        
		// Checking for a full-width space
		if (line.startsWith('　')) {  
            
			// Replace the first full-width space with ⊕
			line = '⊕' + line.slice(1);
		}
		
		line = line.trim();
		
		
		// 章節標題
        if (/^第[一二三四五六七八九十百千萬零]+[編章節款項目]/.test(line)) {
            if (inTiao) {
                outputHtml += '\t</div>\n\t<!-- end 條 -->\n';
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
            const headingType = line.match(/第[一二三四五六七八九十百千萬零]+([編章節款項目])/)[1];
            outputHtml += `\t<div class="zhangJie">\n\t\t<p class="${headingClass[headingType]}">${line}</p>\n\t</div>\n`;
        }
        // 條號
        else if (/^第\s*\d+\s*條/.test(line) || /^第[一二三四五六七八九十百]+條/.test(line)) {
            if (inTiao) {
                outputHtml += '\t</div>\n';
            }
            let [tiaoTitle, ...rest] = line.split('（');
            tiaoTitle = tiaoTitle.trim();
            let title = rest.length ? '（' + rest.join('（') : '';
            outputHtml += `\t<div class="law-article">\n\t\t<div class="jfpc"><p class="law-art-num">${tiaoTitle}${title}</p></div>\n`;
            inTiao = true;
        }
        // 項
		else if (/^⊕/.test(line)) {
            line = line.slice(1);
			outputHtml += `\t\t<p class="xiang">${line}</p>\n`;
        }
        // 款
        else if (/^[一二三四五六七八九十]+、/.test(line)) {
            outputHtml += `\t\t<div class="jfpc"><p class="kuan">${line}</p></div>\n`;
        }
        // 目
        else if (/^（[一二三四五六七八九十]+）/.test(line)) {
            outputHtml += `\t\t<div class="jfpc"><p class="mu">${line}</p></div>\n`;
        }
        // 條文結束
        else {
            outputHtml += `\t\t${line}\n`;
        }
    }); //逐行處理 結束

    if (inTiao) {
        outputHtml += '\t</div>\n\t<!--end single article-->\n';
    }
	
    outputHtml += '</div> <!-- end regulation content --> \n';
	// return outputHtml;
	
	
			return outputHtml;
	}
	else {
		console.warn('警告：傳入 formatter.js 之 fileText 為 NULL 或空值。');
	}
}