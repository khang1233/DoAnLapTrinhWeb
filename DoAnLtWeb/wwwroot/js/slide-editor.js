// SLIDIFY MVC - CANVAS ENGINE
const API_URL = '/Slide';
let canvas;
let presentationId = null;
let slideDataArray = [];
let currentSlideIndex = 0;
let clipboard = null;
let activeDrawer = null;
let autoSaveTimeout = null;

const DEFAULT_FONT = 'Inter'; // Sử dụng Inter thay vì Times New Roman cho hiện đại

// Initialization
window.onload = () => {
    initTheme();
    
    presentationId = document.getElementById('presentation-id').value;
    const rawData = document.getElementById('presentation-data').value;
    
    try {
        slideDataArray = JSON.parse(rawData);
        if(!slideDataArray || slideDataArray.length === 0) {
            slideDataArray = [{ PageNumber: 1, BackgroundColor: '#ffffff', ElementsJson: '[]' }];
        }
    } catch(e) {
        slideDataArray = [{ PageNumber: 1, BackgroundColor: '#ffffff', ElementsJson: '[]' }];
    }

    initCanvas();
    initDragAndDrop();
    initContextMenu();
    initKeyboardShortcuts();
    
    renderSlideThumbnails();
    
    // Nạp dữ liệu mẫu thành công ngay khi load
    loadSlide(0, true);
};

/* --- THEME --- */
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark-mode';
    document.body.className = savedTheme;
}

/* --- CANVAS INIT --- */
function initCanvas() {
    canvas = new fabric.Canvas('canvas', {
        backgroundColor: '#ffffff',
        preserveObjectStacking: true
    });
    
    canvas.on('selection:created', () => { showPropertiesPanel(); });
    canvas.on('selection:updated', () => { showPropertiesPanel(); });
    canvas.on('selection:cleared', () => { hidePropertiesPanel(); });
    
    canvas.on('object:added', () => { triggerAutoSave(); });
    canvas.on('object:removed', () => { triggerAutoSave(); });
    canvas.on('object:modified', () => { showPropertiesPanel(); triggerAutoSave(); });
    canvas.on('text:changed', () => { triggerAutoSave(); });
    canvas.on('path:created', (e) => { 
        e.path.set({ id: _generateId(), name: 'Nét vẽ', selectable: true });
        canvas.requestRenderAll();
        triggerAutoSave(); 
    });
}

/* --- AUTO SAVE SYSTEM --- */
function triggerAutoSave() {
    saveCurrentSlideStateToMemory();
    
    const statusEl = document.getElementById('save-status');
    if(statusEl) statusEl.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang lưu...';
    
    clearTimeout(autoSaveTimeout);
    autoSaveTimeout = setTimeout(() => {
        savePresentationToBackend();
    }, 2000); // 2s debounce for Auto-save
}

function saveCurrentSlideStateToMemory() {
    if(!slideDataArray[currentSlideIndex]) return;
    slideDataArray[currentSlideIndex].ElementsJson = JSON.stringify(canvas.toJSON(['id', 'name', 'selectable', 'hasControls']));
    slideDataArray[currentSlideIndex].BackgroundColor = canvas.backgroundColor;
}

async function savePresentationToBackend() {
    saveCurrentSlideStateToMemory();
    
    // Generate Thumbnail (Base64) with low quality for fast transfer
    const thumbnailDataUrl = canvas.toDataURL({
        format: 'jpeg',
        quality: 0.3,
        multiplier: 0.5
    });

    const titleEl = document.getElementById('current-project-name');
    const projectTitle = titleEl ? titleEl.innerText : "Untitled";

    try {
        const response = await fetch(`${API_URL}/SavePresentation/${presentationId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
                Title: projectTitle,
                ThumbnailUrl: thumbnailDataUrl,
                Slides: slideDataArray 
            })
        });
        
        const statusEl = document.getElementById('save-status');
        if (response.ok) {
            if(statusEl) statusEl.innerHTML = '<i class="fa-solid fa-cloud-check text-success"></i> Đã lưu';
        } else {
            if(statusEl) statusEl.innerHTML = '<i class="fa-solid fa-triangle-exclamation text-danger"></i> Lỗi lưu';
        }
    } catch(err) {
        console.error("Save error:", err);
    }
}

function savePresentationManually() {
    clearTimeout(autoSaveTimeout);
    savePresentationToBackend();
    showToast('Đã lưu bản thuyết trình', 'success');
}

/* --- EXPORT TOOLS --- */
function resizeCanvasPrompt() {
    const w = prompt('Nhập chiều rộng (Width) mới:', canvas.width);
    const h = prompt('Nhập chiều cao (Height) mới:', canvas.height);
    if (!w || !h || isNaN(w) || isNaN(h)) return;

    const newW = parseInt(w);
    const newH = parseInt(h);
    const scaleX = newW / canvas.width;
    const scaleY = newH / canvas.height;

    canvas.setWidth(newW);
    canvas.setHeight(newH);

    canvas.getObjects().forEach(obj => {
        obj.scaleX = obj.scaleX * scaleX;
        obj.scaleY = obj.scaleY * scaleY;
        obj.left = obj.left * scaleX;
        obj.top = obj.top * scaleY;
        obj.setCoords();
    });
    canvas.renderAll();
    triggerAutoSave();
    showToast(`Đã resize thành ${newW}x${newH}`);
}

function exportToImage() {
    saveCurrentSlideStateToMemory();
    const a = document.createElement('a'); 
    a.download = `slide-${currentSlideIndex + 1}.png`;
    a.href = canvas.toDataURL({ format: 'png', multiplier: 2 }); 
    a.click();
}

async function exportToPDF() {
    saveCurrentSlideStateToMemory();
    showToast('Đang tạo PDF, vui lòng chờ...', 'info');
    const { jsPDF } = window.jspdf;
    
    // Tạo doc khổ chuẩn 16:9 ngang (297x167 mm)
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [297, 167] });
    
    const originalIndex = currentSlideIndex;
    
    for (let i = 0; i < slideDataArray.length; i++) {
        loadSlide(i);
        // Chờ render xong
        await new Promise(r => setTimeout(r, 100));
        
        const imgData = canvas.toDataURL({ format: 'png', multiplier: 2 });
        
        if (i > 0) pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, 0, 297, 167);
    }
    
    loadSlide(originalIndex);
    pdf.save('Presentation.pdf');
    showToast('Tải PDF thành công!', 'success');
}

/* --- SLIDE MANAGEMENT --- */
function addNewSlide() {
    saveCurrentSlideStateToMemory();
    slideDataArray.push({
        PageNumber: slideDataArray.length + 1,
        BackgroundColor: '#ffffff',
        ElementsJson: '[]'
    });
    currentSlideIndex = slideDataArray.length - 1;
    loadSlide(currentSlideIndex);
    renderSlideThumbnails();
    triggerAutoSave();
}

function loadSlide(index, skipSave = false) {
    if (!skipSave) {
        saveCurrentSlideStateToMemory(); 
    }
    currentSlideIndex = index;
    const slide = slideDataArray[currentSlideIndex];
    canvas.clear();
    canvas.backgroundColor = slide.BackgroundColor || '#ffffff';
    
    if (slide.ElementsJson && slide.ElementsJson !== '[]') {
        try {
            const data = JSON.parse(slide.ElementsJson);
            canvas.loadFromJSON(data, function() {
                canvas.renderAll();
                console.log("Nạp dữ liệu mẫu thành công!");
            });
        } catch(e) { console.error("Lỗi parse JSON Fabric:", e); }
    }
    canvas.renderAll();
    renderSlideThumbnails();
}

function deleteSlide(e, index) {
    e.stopPropagation();
    if (slideDataArray.length <= 1) { showToast('Không thể xóa slide duy nhất!'); return; }
    slideDataArray.splice(index, 1);
    slideDataArray.forEach((s, i) => s.PageNumber = i + 1);
    if (currentSlideIndex >= index) {
        currentSlideIndex = Math.max(0, currentSlideIndex - 1);
    }
    loadSlide(currentSlideIndex);
    renderSlideThumbnails();
    triggerAutoSave();
}

function renderSlideThumbnails() {
    const list = document.getElementById('slides-list'); 
    if(!list) return;
    list.innerHTML = '';
    
    slideDataArray.forEach((slide, index) => {
        const div = document.createElement('div');
        div.className = `slide-thumb-h ${index === currentSlideIndex ? 'active' : ''}`;
        div.onclick = () => loadSlide(index);
        
        // Cấu hình kéo thả đổi vị trí
        div.draggable = true;
        div.ondragstart = (e) => { e.dataTransfer.setData('slideIndex', index); };
        div.ondragover = (e) => { e.preventDefault(); div.style.border = "2px dashed var(--primary)"; };
        div.ondragleave = () => { div.style.border = index === currentSlideIndex ? "2px solid var(--primary)" : "2px solid transparent"; };
        div.ondrop = (e) => {
            e.preventDefault();
            div.style.border = "2px solid transparent";
            const draggedIndex = parseInt(e.dataTransfer.getData('slideIndex'));
            if(draggedIndex !== index && !isNaN(draggedIndex)) {
                // Đổi vị trí trong mảng
                const draggedItem = slideDataArray.splice(draggedIndex, 1)[0];
                slideDataArray.splice(index, 0, draggedItem);
                
                // Cập nhật PageNumber
                slideDataArray.forEach((s, i) => s.PageNumber = i + 1);
                
                // Cập nhật currentIndex nếu bị ảnh hưởng
                if (currentSlideIndex === draggedIndex) currentSlideIndex = index;
                else if (currentSlideIndex > draggedIndex && currentSlideIndex <= index) currentSlideIndex--;
                else if (currentSlideIndex < draggedIndex && currentSlideIndex >= index) currentSlideIndex++;
                
                renderSlideThumbnails();
                triggerAutoSave();
            }
        };
        
        div.innerHTML = `<span class="thumb-num">${index + 1}</span>
            <button class="thumb-del" onclick="deleteSlide(event, ${index})"><i class="fa-solid fa-xmark"></i></button>
            <div class="thumb-placeholder" style="background:${slide.BackgroundColor}; width:100%; height:100%;"></div>`;
        list.appendChild(div);
    });
    
    const activeThumb = list.querySelector('.slide-thumb-h.active');
    if (activeThumb) activeThumb.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
}

/* --- DRAG & DROP LOGIC --- */
function initDragAndDrop() {
    const container = document.getElementById('canvas-container');
    if(!container) return;
    container.addEventListener('dragover', (e) => e.preventDefault());
    container.addEventListener('drop', (e) => {
        e.preventDefault();
        const type = e.dataTransfer.getData('type');
        if (!type) return;

        const rect = document.getElementById('canvas').getBoundingClientRect();
        const x = (e.clientX - rect.left);
        const y = (e.clientY - rect.top);

        if (type === 'title') addText('Thêm tiêu đề', 60, true, x, y);
        else if (type === 'subtitle') addText('Thêm tiêu đề phụ', 40, false, x, y);
        else if (type === 'body') addText('Thêm nội dung văn bản', 24, false, x, y);
        else if (type === 'square') addRect(x, y);
        else if (type === 'circle') addCircle(x, y);
        else if (type === 'triangle') addTriangle(x, y);
        else if (type === 'star') addIcon('\uf005', x, y);
        else if (type === 'heart') addIcon('\uf004', x, y);
        else if (type === 'bubble') addIcon('\uf27a', x, y); // speech bubble
        else if (type === 'arrow') addIcon('\uf061', x, y); // right arrow
    });
}
function dragStart(e, type) { e.dataTransfer.setData('type', type); e.dataTransfer.effectAllowed = 'copy'; }

/* --- FABRIC.JS TOOLS --- */
function _generateId() { return Math.random().toString(36).substr(2, 9); }

function addText(textStr = 'Văn bản...', size = 40, isBold = false, x = null, y = null) {
    const text = new fabric.IText(textStr, { 
        left: x ?? canvas.width/2 - 50, top: y ?? canvas.height/2 - 20, 
        fontFamily: DEFAULT_FONT, fontSize: size, fontWeight: isBold ? 'bold' : 'normal', fill: '#333333',
        id: _generateId(), name: textStr.substring(0, 10) + '...'
    });
    canvas.add(text); canvas.setActiveObject(text);
}
function addRect(x = null, y = null) {
    const rect = new fabric.Rect({ 
        left: x ?? canvas.width/2 - 50, top: y ?? canvas.height/2 - 50, 
        fill: '#6366f1', width: 100, height: 100, rx: 10, ry: 10,
        id: _generateId(), name: 'Hình vuông'
    });
    canvas.add(rect); canvas.setActiveObject(rect);
}
function addCircle(x = null, y = null) {
    const circle = new fabric.Circle({
        left: x ?? canvas.width/2 - 50, top: y ?? canvas.height/2 - 50,
        fill: '#10b981', radius: 50, id: _generateId(), name: 'Hình tròn'
    });
    canvas.add(circle); canvas.setActiveObject(circle);
}
function addTriangle(x = null, y = null) {
    const triangle = new fabric.Triangle({
        left: x ?? canvas.width/2 - 50, top: y ?? canvas.height/2 - 50,
        fill: '#f59e0b', width: 100, height: 100, id: _generateId(), name: 'Tam giác'
    });
    canvas.add(triangle); canvas.setActiveObject(triangle);
}
function addIcon(unicode) {
    const icon = new fabric.Text(unicode, {
        fontFamily: '"Font Awesome 6 Free"',
        fontWeight: 900,
        fontSize: 50,
        fill: '#333333',
        left: canvas.width / 2 - 25,
        top: canvas.height / 2 - 25,
        id: _generateId(),
        name: 'Biểu tượng',
        selectable: true
    });
    canvas.add(icon);
    canvas.setActiveObject(icon);
    triggerAutoSave();
}

function addImage(url) {
    fabric.Image.fromURL(url, function(img) {
        // Tự động thu nhỏ ảnh nếu quá lớn
        if (img.width > canvas.width || img.height > canvas.height) {
            const scale = Math.min(canvas.width / img.width, canvas.height / img.height) * 0.8;
            img.scale(scale);
        }
        img.set({
            left: (canvas.width - img.getScaledWidth()) / 2,
            top: (canvas.height - img.getScaledHeight()) / 2,
            id: _generateId(),
            name: 'Hình ảnh'
        });
        canvas.add(img);
        canvas.setActiveObject(img);
        triggerAutoSave();
    }, { crossOrigin: 'anonymous' });
}

function setBgImage(e, url) {
    e.preventDefault(); // Prevent context menu
    fabric.Image.fromURL(url, function(img) {
        // Scale image to cover canvas exactly
        const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
        img.scale(scale);
        canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
            originX: 'left',
            originY: 'top'
        });
        showToast('Đã đặt làm hình nền', 'success');
        triggerAutoSave();
    }, { crossOrigin: 'anonymous' });
}

async function publishAsTemplate() {
    if (!confirm("Bạn muốn biến Slide này thành Mẫu (Template) hệ thống? Các khách hàng khác sẽ có thể thấy và sử dụng Mẫu này.")) return;

    saveCurrentSlideStateToMemory();
    const dto = {
        title: document.getElementById('current-project-name').innerText,
        thumbnailUrl: slideDataArray[0].ThumbnailUrl || "",
        slides: slideDataArray
    };

    try {
        const response = await fetch(`/Slide/PublishAsTemplate?id=${presentationId}`, {
            method: 'POST'
        });
        if (response.ok) {
            showToast("Đăng làm mẫu thành công! Hãy kiểm tra ở trang chủ.", "success");
        } else {
            showToast("Có lỗi xảy ra khi đăng mẫu.", "error");
        }
    } catch (e) {
        showToast("Lỗi kết nối", "error");
    }
}

// Global list for uploads
let uploadedImages = [];

async function uploadImageReal(e) {
    const file = e.target.files[0]; if (!file) return;
    
    // Hiển thị upload progress
    showToast('Đang tải ảnh lên...', 'info');

    const formData = new FormData();
    formData.append("file", file);

    try {
        const res = await fetch(`${API_URL}/UploadImage`, {
            method: 'POST',
            body: formData
        });
        if (res.ok) {
            const data = await res.json();
            // Lưu url ảnh
            uploadedImages.push(data.url);
            showToast('Tải ảnh thành công!', 'success');
            // Cập nhật lại UI tab upload nếu đang mở
            if (activeDrawer === 'upload') toggleDrawer('upload', true);
        } else {
            showToast('Lỗi tải ảnh', 'error');
        }
    } catch (err) {
        console.error(err);
        showToast('Lỗi kết nối', 'error');
    }
}

function addImageToCanvas(url) {
    fabric.Image.fromURL(url, function(img) {
        if(img.width > canvas.width || img.height > canvas.height) img.scaleToWidth(canvas.width / 2);
        img.set({ left: 50, top: 50, id: _generateId(), name: 'Hình ảnh' });
        canvas.add(img); canvas.setActiveObject(img);
        triggerAutoSave();
    });
}

/* --- DRAWING TOOLS LOGIC --- */
let activeDrawerMode = 'pencil'; // 'pencil' or 'marker'
function enableDrawMode(type) {
    if(!canvas) return;
    activeDrawerMode = type;
    canvas.isDrawingMode = true;
    updateDrawStyle();
    showToast(`Đã bật cọ vẽ (${type})`, 'success');
}
function disableDrawMode() {
    if(!canvas) return;
    canvas.isDrawingMode = false;
    showToast('Đã tắt chế độ vẽ', 'success');
}
function updateDrawStyle() {
    if (!canvas || !canvas.isDrawingMode) return;
    const color = document.getElementById('draw-color')?.value || '#6366f1';
    const size = parseInt(document.getElementById('draw-size')?.value || 5, 10);
    
    // Nếu activeDrawer là 'marker', làm nét mờ đi (alpha = 0.5)
    let finalColor = color;
    if (activeDrawerMode === 'marker') {
        const r = parseInt(color.slice(1, 3), 16), g = parseInt(color.slice(3, 5), 16), b = parseInt(color.slice(5, 7), 16);
        finalColor = `rgba(${r},${g},${b},0.3)`;
    }

    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    canvas.freeDrawingBrush.color = finalColor;
    canvas.freeDrawingBrush.width = size;
}
function clearDrawings() {
    if(!canvas) return;
    const objects = canvas.getObjects();
    let removed = false;
    objects.forEach(obj => {
        if (obj.type === 'path') {
            canvas.remove(obj);
            removed = true;
        }
    });
    if(removed) {
        triggerAutoSave();
        showToast('Đã xoá các nét vẽ', 'success');
    } else {
        showToast('Không có nét vẽ nào để xoá', 'error');
    }
}

/* --- PROPERTIES PANEL (SUB-TOOLBAR) --- */
function showPropertiesPanel() {
    const activeObj = canvas.getActiveObject();
    if (!activeObj) { hidePropertiesPanel(); return; }
    
    document.getElementById('sub-toolbar').style.visibility = 'visible';
    
    if (activeObj.fill && typeof activeObj.fill === 'string') {
        document.getElementById('prop-color').value = activeObj.fill;
    }
    
    const shadowProp = document.getElementById('prop-shadow');
    if(shadowProp) shadowProp.checked = !!activeObj.shadow;
        const opacityProp = document.getElementById('prop-opacity');
    if(opacityProp) opacityProp.value = activeObj.opacity !== undefined ? activeObj.opacity : 1;
    
    const isText = activeObj.type === 'i-text' || activeObj.type === 'text';
    const isShape = activeObj.type === 'rect' || activeObj.type === 'circle' || activeObj.type === 'triangle';

    const fontGroup = document.getElementById('prop-font-group');
    const shapeGroup = document.getElementById('prop-shape-group');

    if(fontGroup) {
        if (isText) {
            fontGroup.classList.remove('hidden');
            fontGroup.style.display = 'flex';
            document.getElementById('prop-font-size').value = activeObj.fontSize;
            document.getElementById('prop-font-family').value = activeObj.fontFamily || DEFAULT_FONT;
            const bgProp = document.getElementById('prop-bg-color');
            if(bgProp) bgProp.value = activeObj.textBackgroundColor || '#ffffff';
            const lineProp = document.getElementById('prop-line-height');
            if(lineProp) lineProp.value = activeObj.lineHeight || 1.16;
            
            const btnB = document.getElementById('btn-bold'); if(btnB) btnB.classList.toggle('active', activeObj.fontWeight === 'bold');
            const btnI = document.getElementById('btn-italic'); if(btnI) btnI.classList.toggle('active', activeObj.fontStyle === 'italic');
            const btnU = document.getElementById('btn-underline'); if(btnU) btnU.classList.toggle('active', activeObj.underline);
            const btnS = document.getElementById('btn-strikethrough'); if(btnS) btnS.classList.toggle('active', activeObj.linethrough);
        } else {
            fontGroup.classList.add('hidden');
            fontGroup.style.display = 'none';
        }
    }

    if(shapeGroup) {
        if (isShape) {
            shapeGroup.style.display = 'flex';
            document.getElementById('prop-fill-color').value = activeObj.fill || '#6366f1';
            document.getElementById('prop-stroke-color').value = activeObj.stroke || '#000000';
            document.getElementById('prop-stroke-width').value = activeObj.strokeWidth || 0;
        } else {
            shapeGroup.style.display = 'none';
        }
    }
}
function hidePropertiesPanel() { 
    const tb = document.getElementById('sub-toolbar');
    if(tb) tb.style.visibility = 'hidden'; 
}

function updateObjectProperty(property, value) {
    const activeObj = canvas.getActiveObject();
    if (!activeObj) return;
    if (property === 'fontSize') value = parseInt(value, 10);
    if (property === 'lineHeight') value = parseFloat(value);
    activeObj.set(property, value);
    canvas.renderAll();
    triggerAutoSave();
}

function toggleFormat(property, truthyValue, falsyValue) {
    const activeObj = canvas.getActiveObject(); if (!activeObj) return;
    const isCurrentlyTruthy = activeObj[property] === truthyValue;
    activeObj.set(property, isCurrentlyTruthy ? falsyValue : truthyValue);
    canvas.renderAll(); showPropertiesPanel(); triggerAutoSave();
}

function toggleShadow(isEnabled) {
    const activeObj = canvas.getActiveObject(); if (!activeObj) return;
    if (isEnabled) {
        activeObj.set('shadow', new fabric.Shadow({ color: 'rgba(0,0,0,0.5)', blur: 10, offsetX: 5, offsetY: 5 }));
    } else {
        activeObj.set('shadow', null);
    }
    canvas.renderAll(); triggerAutoSave();
}

function toggleUppercase() {
    const activeObj = canvas.getActiveObject();
    if (!activeObj || !activeObj.text) return;
    const isUpper = activeObj.text === activeObj.text.toUpperCase();
    activeObj.set('text', isUpper ? activeObj.text.toLowerCase() : activeObj.text.toUpperCase());
    canvas.renderAll(); triggerAutoSave();
}

function bringForward() { const obj = canvas.getActiveObject(); if(obj) { canvas.bringForward(obj); canvas.renderAll(); triggerAutoSave(); } }
function sendBackward() { const obj = canvas.getActiveObject(); if(obj) { canvas.sendBackwards(obj); canvas.renderAll(); triggerAutoSave(); } }
function bringToFront() { const obj = canvas.getActiveObject(); if(obj) { canvas.bringToFront(obj); canvas.renderAll(); triggerAutoSave(); } }
function sendToBack() { const obj = canvas.getActiveObject(); if(obj) { canvas.sendToBack(obj); canvas.renderAll(); triggerAutoSave(); } }

function deleteSelected() {
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length) {
        canvas.discardActiveObject();
        activeObjects.forEach(obj => canvas.remove(obj));
        hidePropertiesPanel();
        triggerAutoSave();
    }
}

/* --- CONTEXT MENU LOGIC --- */
function initContextMenu() {
    const container = document.getElementById('canvas-container');
    const menu = document.getElementById('context-menu');
    if(!menu || !container) return;

    container.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const activeObj = canvas.getActiveObject();
        
        const lockBtn = document.getElementById('context-btn-lock');
        if(lockBtn) {
            if(activeObj && activeObj.lockMovementX) {
                lockBtn.innerHTML = '<i class="fa-solid fa-unlock"></i> Mở khóa';
            } else {
                lockBtn.innerHTML = '<i class="fa-solid fa-lock"></i> Khóa';
            }
        }
        
        menu.style.left = e.clientX + 'px';
        menu.style.top = e.clientY + 'px';
        menu.classList.add('active');
    });

    document.addEventListener('click', (e) => {
        if (!menu.contains(e.target)) {
            menu.classList.remove('active');
        }
    });
}

function contextAction(action) {
    const menu = document.getElementById('context-menu');
    if(menu) menu.classList.remove('active');
    
    if (action === 'copy') {
        const obj = canvas.getActiveObject();
        if (obj) {
            obj.clone((cloned) => { clipboard = cloned; });
            showToast('Đã sao chép');
        }
    } else if (action === 'paste') {
        if (clipboard) {
            clipboard.clone((clonedObj) => {
                canvas.discardActiveObject();
                clonedObj.set({
                    left: clonedObj.left + 20,
                    top: clonedObj.top + 20,
                    id: _generateId(),
                    evented: true
                });
                if (clonedObj.type === 'activeSelection') {
                    clonedObj.canvas = canvas;
                    clonedObj.forEachObject((obj) => { canvas.add(obj); });
                    clonedObj.setCoords();
                } else {
                    canvas.add(clonedObj);
                }
                clipboard.top += 20;
                clipboard.left += 20;
                canvas.setActiveObject(clonedObj);
                canvas.requestRenderAll();
                triggerAutoSave();
            });
        }
    } else if (action === 'duplicate') {
        const obj = canvas.getActiveObject();
        if (obj) {
            obj.clone((clonedObj) => {
                canvas.discardActiveObject();
                clonedObj.set({ left: clonedObj.left + 20, top: clonedObj.top + 20, id: _generateId(), evented: true });
                canvas.add(clonedObj); canvas.setActiveObject(clonedObj); canvas.requestRenderAll();
                triggerAutoSave(); showToast('Đã nhân bản');
            });
        }
    } else if (action === 'bringForward') { bringForward(); } 
    else if (action === 'sendBackward') { sendBackward(); } 
    else if (action === 'bringToFront') { bringToFront(); }
    else if (action === 'sendToBack') { sendToBack(); }
    else if (action === 'delete') { deleteSelected(); } 
    else if (action === 'addPage') { addNewSlide(); }
    else if (action === 'lock') {
        const obj = canvas.getActiveObject();
        if (obj) {
            const isLocked = !obj.lockMovementX;
            obj.set({ lockMovementX: isLocked, lockMovementY: isLocked, lockRotation: isLocked, lockScalingX: isLocked, lockScalingY: isLocked, hasControls: !isLocked });
            canvas.discardActiveObject(); canvas.requestRenderAll(); triggerAutoSave();
        }
    }
}

/* --- KEYBOARD SHORTCUTS --- */
function initKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        const activeObj = canvas?.getActiveObject();
        if (activeObj && activeObj.isEditing) return;

        if (e.key === 'Delete' || e.key === 'Backspace') { deleteSelected(); }
        if (e.ctrlKey && e.key === 'c' && activeObj) { activeObj.clone(function(cloned) { clipboard = cloned; showToast('Đã copy', 'success'); }); }
        if (e.ctrlKey && e.key === 'v' && clipboard) {
            clipboard.clone(function(clonedObj) {
                canvas.discardActiveObject();
                clonedObj.set({ left: clonedObj.left + 20, top: clonedObj.top + 20, evented: true, id: _generateId() });
                if (clonedObj.type === 'activeSelection') {
                    clonedObj.canvas = canvas; clonedObj.forEachObject(function(obj) { canvas.add(obj); }); clonedObj.setCoords();
                } else canvas.add(clonedObj);
                clipboard.top += 20; clipboard.left += 20;
                canvas.setActiveObject(clonedObj); canvas.requestRenderAll(); triggerAutoSave();
            });
        }
        if (e.ctrlKey && e.key === 'd' && activeObj) { e.preventDefault(); contextAction('duplicate'); }
        if (e.ctrlKey && e.key === 'b') { e.preventDefault(); toggleFormat('fontWeight', 'bold', 'normal'); }
        if (e.ctrlKey && e.key === 'i') { e.preventDefault(); toggleFormat('fontStyle', 'italic', 'normal'); }
        if (e.ctrlKey && e.key === 'u') { e.preventDefault(); toggleFormat('underline', true, false); }
    });

    window.addEventListener('paste', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        const items = (e.clipboardData || e.originalEvent.clipboardData).items;
        let pastedImage = false;

        for (let index in items) {
            const item = items[index];
            if (item.kind === 'file' && item.type.startsWith('image/')) {
                const blob = item.getAsFile();
                const reader = new FileReader();
                reader.onload = function(event){
                    fabric.Image.fromURL(event.target.result, function(img) {
                        if(img.width > canvas.width || img.height > canvas.height) { img.scaleToWidth(canvas.width / 2); }
                        img.set({ left: 50, top: 50, id: _generateId(), name: 'Ảnh dán' });
                        canvas.add(img); canvas.setActiveObject(img); canvas.renderAll(); triggerAutoSave();
                    });
                };
                reader.readAsDataURL(blob);
                pastedImage = true;
            }
        }

        if (!pastedImage) {
            const text = e.clipboardData.getData('text/plain');
            if (text) {
                setTimeout(() => {
                    const active = canvas.getActiveObject();
                    if (active && active.type === 'i-text' && active.text === text && active.isEditing) return; 
                    if (!active || !active.isEditing) { addText(text, 24, false, 50, 50); canvas.renderAll(); }
                }, 10); 
            }
        }
    });
}

/* --- UI HELPERS --- */
function showToast(msg, type = 'info') {
    const toast = document.getElementById('toast');
    if(!toast) return;
    toast.innerText = msg;
    toast.style.background = type === 'success' ? '#10b981' : (type === 'error' ? '#ef4444' : '#333');
    toast.className = "toast show";
    setTimeout(() => { toast.className = toast.className.replace("show", ""); }, 3000);
}

function toggleDrawer(type, forceOpen = false) {
    const panel = document.getElementById('drawer-panel');
    const tabs = ['design', 'elements', 'text', 'draw', 'upload'];
    
    tabs.forEach(t => {
        const el = document.getElementById(`tab-${t}`);
        if(el) el.classList.remove('active');
    });

    if (activeDrawer === type && !forceOpen) {
        panel.classList.remove('active');
        activeDrawer = null;
        return;
    }
    
    activeDrawer = type;
    panel.classList.add('active');
    const activeTab = document.getElementById(`tab-${type}`);
    if (activeTab) activeTab.classList.add('active');
    
    if (type === 'design') {
        panel.innerHTML = `
            <div class="drawer-title">Mẫu thiết kế</div>
            <div id="templates-loading" style="text-align:center; padding: 20px; color: var(--text-muted);">
                <i class="fa-solid fa-spinner fa-spin fa-2x"></i>
                <p style="margin-top:10px;">Đang tải mẫu...</p>
            </div>
            <div id="templates-grid" style="display: grid; grid-template-columns: 1fr; gap: 12px;"></div>
        `;
        fetch('/Slide/GetTemplates')
            .then(res => res.json())
            .then(data => {
                document.getElementById('templates-loading').style.display = 'none';
                const grid = document.getElementById('templates-grid');
                if (data.length === 0) {
                    grid.innerHTML = '<p class="text-muted">Chưa có mẫu nào.</p>';
                    return;
                }
                data.forEach(tpl => {
                    const el = document.createElement('div');
                    el.className = 'template-item';
                    el.style = 'cursor:pointer; border-radius: 8px; overflow: hidden; border: 1px solid var(--border-color); transition: 0.2s;';
                    el.onmouseover = () => el.style.borderColor = 'var(--primary)';
                    el.onmouseout = () => el.style.borderColor = 'var(--border-color)';
                    
                    const firstSlide = tpl.slides && tpl.slides.length > 0 ? tpl.slides[0] : { elementsJson: '[]' };
                    const safeJson = (firstSlide.elementsJson || '[]').replace(/'/g, "\\'").replace(/"/g, '&quot;');
                    
                    const bgColor = getCategoryColor(tpl.category);
                    const thumbHtml = tpl.thumbnailUrl 
                        ? `<img src="${tpl.thumbnailUrl}" style="width:100%; height:100%; object-fit:cover;">` 
                        : `<div style="width:100%; height:100%; display:flex; flex-direction:column; align-items:center; justify-content:center; background:${bgColor}; color:white; text-align:center; padding: 10px; box-sizing:border-box;">
                             <i class="fa-solid fa-palette fa-2x" style="opacity:0.8; margin-bottom: 8px;"></i>
                             <span style="font-weight:bold; font-size:14px; font-family:'Inter'; text-shadow: 1px 1px 3px rgba(0,0,0,0.3); display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${tpl.title}</span>
                           </div>`;

                    el.innerHTML = `
                        <div style="aspect-ratio: 16/9; display: flex; align-items:center; justify-content:center; overflow:hidden; position: relative;">
                            ${thumbHtml}
                            <div style="position:absolute; bottom:5px; right:5px; background:rgba(0,0,0,0.6); color:white; font-size:10px; padding:2px 6px; border-radius:10px;">${tpl.slides ? tpl.slides.length : 1} trang</div>
                        </div>
                        <div style="padding: 8px; background: white;">
                            <div style="font-size: 0.9rem; font-weight: 600; color: #1e293b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${tpl.title}</div>
                            <div style="font-size: 0.75rem; color: var(--text-muted);">${tpl.category}</div>
                        </div>
                    `;
                    el.onclick = () => {
                        if (confirm(`Bạn muốn áp dụng mẫu "${tpl.title}"?\nHành động này sẽ thay thế toàn bộ ${slideDataArray.length} trang hiện tại bằng ${tpl.slides.length} trang của mẫu này.`)) {
                            canvas.clear();
                            
                            // Replace slideDataArray completely
                            slideDataArray = tpl.slides.map((s, idx) => ({
                                PageNumber: idx + 1,
                                BackgroundColor: s.backgroundColor,
                                ElementsJson: s.elementsJson
                            }));
                            
                            // Re-render the bottom thumbnails and load the first slide
                            renderSlideThumbnails();
                            loadSlide(0, true);
                            triggerAutoSave();
                            showToast(`Đã áp dụng mẫu có ${tpl.slides.length} trang!`, 'success');
                        }
                    };
                    grid.appendChild(el);
                });
            })
            .catch(err => {
                console.error(err);
                document.getElementById('templates-loading').innerHTML = '<p class="text-danger">Lỗi kết nối</p>';
                showToast('Lỗi tải danh sách mẫu', 'error');
            });
    } else if (type === 'text') {
        panel.innerHTML = `
            <div class="drawer-title">Văn bản</div>
            <div class="draggable-item" draggable="true" ondragstart="dragStart(event, 'title')" onclick="addText('Thêm tiêu đề', 60, true)">
                <span style="font-size: 24px; font-weight: bold; font-family: 'Inter'">Thêm tiêu đề</span>
            </div>
            <div class="draggable-item" draggable="true" ondragstart="dragStart(event, 'subtitle')" onclick="addText('Thêm tiêu đề phụ', 40, false)">
                <span style="font-size: 18px; font-weight: 600; font-family: 'Inter'">Thêm tiêu đề phụ</span>
            </div>
            <div class="draggable-item" draggable="true" ondragstart="dragStart(event, 'body')" onclick="addText('Thêm nội dung văn bản', 24, false)">
                <span style="font-size: 14px; font-family: 'Inter'">Thêm nội dung văn bản</span>
            </div>
        `;
    } else if (type === 'elements') {
        panel.innerHTML = `
            <div class="drawer-title">Thành phần</div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <h5 style="color:var(--text-main); margin:0; font-size: 1rem;">Hình dạng</h5>
            </div>
            <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:8px; margin-bottom: 20px;">
                <div class="draggable-item" style="padding:10px" draggable="true" ondragstart="dragStart(event, 'square')" onclick="addRect()">
                    <i class="fa-solid fa-square" style="font-size: 30px; color: #6366f1;"></i>
                </div>
                <div class="draggable-item" style="padding:10px" draggable="true" ondragstart="dragStart(event, 'circle')" onclick="addCircle()">
                    <i class="fa-solid fa-circle" style="font-size: 30px; color: #10b981;"></i>
                </div>
                <div class="draggable-item" style="padding:10px" draggable="true" ondragstart="dragStart(event, 'triangle')" onclick="addTriangle()">
                    <i class="fa-solid fa-play fa-rotate-270" style="font-size: 30px; color: #f59e0b;"></i>
                </div>
            </div>

            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <h5 style="color:var(--text-main); margin:0; font-size: 1rem;">Biểu tượng & Icon</h5>
            </div>
            <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:8px; margin-bottom: 20px;">
                <div class="draggable-item" style="padding:10px" draggable="true" ondragstart="dragStart(event, 'star')" onclick="addIcon('\uf005')">
                    <i class="fa-solid fa-star" style="font-size: 30px; color: #fbbf24;"></i>
                </div>
                <div class="draggable-item" style="padding:10px" draggable="true" ondragstart="dragStart(event, 'heart')" onclick="addIcon('\uf004')">
                    <i class="fa-solid fa-heart" style="font-size: 30px; color: #ef4444;"></i>
                </div>
                <div class="draggable-item" style="padding:10px" draggable="true" ondragstart="dragStart(event, 'bubble')" onclick="addIcon('\uf27a')">
                    <i class="fa-solid fa-comment-dots" style="font-size: 30px; color: #3b82f6;"></i>
                </div>
                <div class="draggable-item" style="padding:10px" draggable="true" ondragstart="dragStart(event, 'arrow')" onclick="addIcon('\uf061')">
                    <i class="fa-solid fa-arrow-right" style="font-size: 30px; color: #64748b;"></i>
                </div>
            </div>
        `;
    } else if (type === 'photos') {
        panel.innerHTML = `
            <div class="drawer-title">Thư viện Ảnh</div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <h5 style="color:var(--text-main); margin:0; font-size: 0.9rem;">Kho ảnh chất lượng cao</h5>
            </div>
            <p style="font-size:0.8rem; color:var(--text-muted); margin-bottom:15px;">Kéo thả, Click để chèn, hoặc <b>Chuột phải để Đặt làm Nền</b></p>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:8px;">
                <img src="https://images.unsplash.com/photo-1556761175-4b46a572b786?q=80&w=400&auto=format&fit=crop" class="photo-item" style="width:100%; height:80px; object-fit:cover; border-radius:4px; cursor:pointer;" onclick="addImage(this.src)" oncontextmenu="setBgImage(event, this.src)">
                <img src="https://images.unsplash.com/photo-1493612276216-ee3925520721?q=80&w=400&auto=format&fit=crop" class="photo-item" style="width:100%; height:80px; object-fit:cover; border-radius:4px; cursor:pointer;" onclick="addImage(this.src)" oncontextmenu="setBgImage(event, this.src)">
                <img src="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=400&auto=format&fit=crop" class="photo-item" style="width:100%; height:80px; object-fit:cover; border-radius:4px; cursor:pointer;" onclick="addImage(this.src)" oncontextmenu="setBgImage(event, this.src)">
                <img src="https://images.unsplash.com/photo-1462331940025-496dfbfc7564?q=80&w=400&auto=format&fit=crop" class="photo-item" style="width:100%; height:80px; object-fit:cover; border-radius:4px; cursor:pointer;" onclick="addImage(this.src)" oncontextmenu="setBgImage(event, this.src)">
                <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=400&auto=format&fit=crop" class="photo-item" style="width:100%; height:80px; object-fit:cover; border-radius:4px; cursor:pointer;" onclick="addImage(this.src)" oncontextmenu="setBgImage(event, this.src)">
                <img src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=400&auto=format&fit=crop" class="photo-item" style="width:100%; height:80px; object-fit:cover; border-radius:4px; cursor:pointer;" onclick="addImage(this.src)" oncontextmenu="setBgImage(event, this.src)">
                <img src="https://images.unsplash.com/photo-1506744626753-1fa44df14d28?q=80&w=400&auto=format&fit=crop" class="photo-item" style="width:100%; height:80px; object-fit:cover; border-radius:4px; cursor:pointer;" onclick="addImage(this.src)" oncontextmenu="setBgImage(event, this.src)">
                <img src="https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=400&auto=format&fit=crop" class="photo-item" style="width:100%; height:80px; object-fit:cover; border-radius:4px; cursor:pointer;" onclick="addImage(this.src)" oncontextmenu="setBgImage(event, this.src)">
            </div>
        `;
    } else if (type === 'bg') {
        panel.innerHTML = `
            <div class="drawer-title">Màu Nền</div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <h5 style="color:var(--text-main); margin:0; font-size: 0.9rem;">Màu đơn sắc</h5>
            </div>
            <div style="display:grid; grid-template-columns: repeat(5, 1fr); gap:8px; margin-bottom: 20px;">
                <div style="height:40px; background:#ffffff; border:1px solid #ccc; border-radius:4px; cursor:pointer;" onclick="canvas.backgroundColor='#ffffff'; canvas.renderAll(); triggerAutoSave();"></div>
                <div style="height:40px; background:#000000; border-radius:4px; cursor:pointer;" onclick="canvas.backgroundColor='#000000'; canvas.renderAll(); triggerAutoSave();"></div>
                <div style="height:40px; background:#f8fafc; border:1px solid #ccc; border-radius:4px; cursor:pointer;" onclick="canvas.backgroundColor='#f8fafc'; canvas.renderAll(); triggerAutoSave();"></div>
                <div style="height:40px; background:#1e293b; border-radius:4px; cursor:pointer;" onclick="canvas.backgroundColor='#1e293b'; canvas.renderAll(); triggerAutoSave();"></div>
                <div style="height:40px; background:#fef08a; border-radius:4px; cursor:pointer;" onclick="canvas.backgroundColor='#fef08a'; canvas.renderAll(); triggerAutoSave();"></div>
                <div style="height:40px; background:#fbcfe8; border-radius:4px; cursor:pointer;" onclick="canvas.backgroundColor='#fbcfe8'; canvas.renderAll(); triggerAutoSave();"></div>
                <div style="height:40px; background:#bfdbfe; border-radius:4px; cursor:pointer;" onclick="canvas.backgroundColor='#bfdbfe'; canvas.renderAll(); triggerAutoSave();"></div>
                <div style="height:40px; background:#bbf7d0; border-radius:4px; cursor:pointer;" onclick="canvas.backgroundColor='#bbf7d0'; canvas.renderAll(); triggerAutoSave();"></div>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <h5 style="color:var(--text-main); margin:0; font-size: 0.9rem;">Chọn màu tùy biến</h5>
            </div>
            <input type="color" onchange="canvas.backgroundColor=this.value; canvas.renderAll(); triggerAutoSave();" style="width:100%; height:40px; border:none; border-radius:4px; cursor:pointer;">
        `;
    } else if (type === 'upload') {
        let uploadHtml = `
            <div class="drawer-title">Tải lên</div>
            <button class="btn-auth" style="width:100%; margin-bottom: 20px;" onclick="document.getElementById('upload-img-input').click()">
                Tải ảnh lên
            </button>
            <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
        `;
        uploadedImages.forEach(url => {
            uploadHtml += `<img src="${url}" style="width:100%; aspect-ratio:1; object-fit:cover; border-radius:8px; cursor:pointer;" onclick="addImageToCanvas('${url}')" />`;
        });
        uploadHtml += `</div>`;
        panel.innerHTML = uploadHtml;
    } else if (type === 'draw') {
        panel.innerHTML = `
            <div class="drawer-title">Công cụ Vẽ</div>
            <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:10px; margin-bottom: 20px;">
                <button class="btn-format" onclick="enableDrawMode('pencil')" title="Bút chì" style="padding:15px; width:100%;"><i class="fa-solid fa-pencil" style="font-size:20px;"></i></button>
                <button class="btn-format" onclick="enableDrawMode('marker')" title="Bút dạ" style="padding:15px; width:100%;"><i class="fa-solid fa-marker" style="font-size:20px;"></i></button>
                <button class="btn-format" onclick="disableDrawMode()" title="Tắt vẽ" style="padding:15px; width:100%; color:var(--success);"><i class="fa-solid fa-arrow-pointer" style="font-size:20px;"></i></button>
            </div>
            <div class="form-group" style="margin-bottom:15px;">
                <label style="display:block; margin-bottom:5px; font-weight:600;">Màu vẽ:</label>
                <input type="color" id="draw-color" value="#6366f1" onchange="updateDrawStyle()" style="width:100%; height:40px; border:none; padding:0;">
            </div>
            <div class="form-group" style="margin-bottom:20px;">
                <label style="display:block; margin-bottom:5px; font-weight:600;">Độ dày nét vẽ (<span id="draw-size-label">5</span>px):</label>
                <input type="range" id="draw-size" min="1" max="50" value="5" oninput="document.getElementById('draw-size-label').innerText=this.value; updateDrawStyle()" style="width:100%;">
            </div>
            <button class="btn-danger" style="width:100%;" onclick="clearDrawings()"><i class="fa-solid fa-eraser"></i> Xoá nét vẽ</button>
        `;
    }
}

/* --- AI --- */
function generateWithAI() {
    const prompt = window.prompt("Nhập mô tả để AI thiết kế (vd: Vẽ biểu đồ cột 3 thông số):");
    if(!prompt) return;
    showToast("Đang tải model AI, vui lòng chờ...", "info");
}

function getCategoryColor(category) {
    switch (category) {
        case 'Doanh nghiệp': return 'linear-gradient(135deg, #1e3a8a, #3b82f6)';
        case 'Giáo dục': return 'linear-gradient(135deg, #166534, #fcd34d)';
        case 'Công nghệ': return 'linear-gradient(135deg, #000000, #c026d3)';
        case 'Sáng tạo': return 'linear-gradient(135deg, #ec4899, #f97316)';
        default: return 'linear-gradient(135deg, #475569, #94a3b8)';
    }
}
