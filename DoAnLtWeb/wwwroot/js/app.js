const API_URL = '/api';
let isLoginMode = true;
let canvas;
let currentProjectId = null;
let slideDataArray = [];
let currentSlideIndex = 0;
let clipboard = null;
let activeDrawer = null;

const DEFAULT_FONT = 'Times New Roman';

// Initialization
window.onload = () => {
    initTheme();
    initCanvas();
    initDragAndDrop();
    initContextMenu();
    
    const token = localStorage.getItem('jwt_token');
    if (token) {
        showSection('dashboard-section');
        loadProjects();
        document.getElementById('user-info-header').innerHTML = `<i class="fa-solid fa-user"></i> Đang đăng nhập`;
    } else {
        showSection('auth-section');
    }

    document.getElementById('new-project-name').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') submitCreateProject();
    });

    initKeyboardShortcuts();
};

/* --- THEME --- */
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'dark-mode';
    document.body.className = savedTheme;
    updateThemeIcon();
}
function toggleTheme() {
    const isDark = document.body.classList.contains('dark-mode');
    document.body.className = isDark ? 'light-mode' : 'dark-mode';
    localStorage.setItem('theme', document.body.className);
    updateThemeIcon();
}
function updateThemeIcon() {
    const icon = document.getElementById('theme-icon');
    icon.className = document.body.classList.contains('dark-mode') ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
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
    
    // Auto layer sync
    canvas.on('object:added', () => { saveCurrentSlideState(); });
    canvas.on('object:removed', () => { saveCurrentSlideState(); });
    canvas.on('object:modified', () => { showPropertiesPanel(); saveCurrentSlideState(); });
    canvas.on('path:created', (e) => { 
        e.path.set({ id: _generateId(), name: 'Nét vẽ', selectable: true });
        canvas.requestRenderAll();
        saveCurrentSlideState(); 
    });
}

/* --- SMART TOOLS --- */
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

    // Scale objects
    canvas.getObjects().forEach(obj => {
        obj.scaleX = obj.scaleX * scaleX;
        obj.scaleY = obj.scaleY * scaleY;
        obj.left = obj.left * scaleX;
        obj.top = obj.top * scaleY;
        obj.setCoords();
    });
    canvas.renderAll();
    saveCurrentSlideState();
    showToast(`Đã resize thành ${newW}x${newH}`);
}

function exportToPDF() {
    if (!window.jspdf) { showToast('Thư viện PDF chưa tải xong', 'error'); return; }
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? 'l' : 'p',
        unit: 'px',
        format: [canvas.width, canvas.height]
    });
    const dataURL = canvas.toDataURL({ format: 'png', multiplier: 2 });
    pdf.addImage(dataURL, 'PNG', 0, 0, canvas.width, canvas.height);
    pdf.save(`Slide-${currentSlideIndex + 1}.pdf`);
    showToast('Đã tải xuống PDF', 'success');
}

/* --- DRAG & DROP LOGIC --- */
function initDragAndDrop() {
    const container = document.getElementById('canvas-container');
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
    });
}
function dragStart(e, type) { e.dataTransfer.setData('type', type); e.dataTransfer.effectAllowed = 'copy'; }

/* --- DRAWER LOGIC --- */
function toggleDrawer(type) {
    const panel = document.getElementById('drawer-panel');
    const tabs = ['design', 'elements', 'text', 'brand', 'draw', 'projects', 'apps'];
    
    // Remove active from all tabs
    tabs.forEach(t => {
        const el = document.getElementById(`tab-${t}`);
        if(el) el.classList.remove('active');
    });

    if (activeDrawer === type) {
        panel.classList.remove('active');
        activeDrawer = null;
        return;
    }
    
    activeDrawer = type;
    panel.classList.add('active');
    const activeTab = document.getElementById(`tab-${type}`);
    if (activeTab) activeTab.classList.add('active');
    
    if (type === 'text') {
        panel.innerHTML = `
            <div class="drawer-title">Văn bản</div>
            <div class="draggable-item" draggable="true" ondragstart="dragStart(event, 'title')" onclick="addText('Thêm tiêu đề', 60, true)">
                <span style="font-size: 24px; font-weight: bold; font-family: '${DEFAULT_FONT}'">Thêm tiêu đề</span>
            </div>
            <div class="draggable-item" draggable="true" ondragstart="dragStart(event, 'subtitle')" onclick="addText('Thêm tiêu đề phụ', 40, false)">
                <span style="font-size: 18px; font-weight: 600; font-family: '${DEFAULT_FONT}'">Thêm tiêu đề phụ</span>
            </div>
            <div class="draggable-item" draggable="true" ondragstart="dragStart(event, 'body')" onclick="addText('Thêm nội dung văn bản', 24, false)">
                <span style="font-size: 14px; font-family: '${DEFAULT_FONT}'">Thêm nội dung văn bản</span>
            </div>
        `;
    } else if (type === 'elements') {
        panel.innerHTML = `
            <div class="drawer-title">Thành phần</div>
            <input type="text" placeholder="Tìm kiếm hình khối, biểu tượng..." style="margin-bottom:15px; width: 100%;" onkeyup="if(event.key==='Enter') showToast('Tìm kiếm đang cập nhật!', 'success')">
            
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <h5 style="color:var(--text-main); margin:0;">Hình dạng</h5>
                <span style="font-size:0.75rem; color:var(--text-muted); cursor:pointer;">Xem tất cả</span>
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
                <h5 style="color:var(--text-main); margin:0;">Biểu tượng (Đồ họa)</h5>
                <span style="font-size:0.75rem; color:var(--text-muted); cursor:pointer;">Xem tất cả</span>
            </div>
            <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:8px; margin-bottom: 20px;">
                <div class="draggable-item" style="padding:10px" draggable="true" ondragstart="dragStart(event, 'star')" onclick="addIcon('\uf005')">
                    <i class="fa-solid fa-star" style="font-size: 30px; color: #fbbf24;"></i>
                </div>
                <div class="draggable-item" style="padding:10px" draggable="true" ondragstart="dragStart(event, 'heart')" onclick="addIcon('\uf004')">
                    <i class="fa-solid fa-heart" style="font-size: 30px; color: #ef4444;"></i>
                </div>
                <div class="draggable-item" style="padding:10px" draggable="true" ondragstart="dragStart(event, 'bolt')" onclick="addIcon('\uf0e7')">
                    <i class="fa-solid fa-bolt" style="font-size: 30px; color: #3b82f6;"></i>
                </div>
                <div class="draggable-item" style="padding:10px" draggable="true" ondragstart="dragStart(event, 'cloud')" onclick="addIcon('\uf0c2')">
                    <i class="fa-solid fa-cloud" style="font-size: 30px; color: #94a3b8;"></i>
                </div>
                <div class="draggable-item" style="padding:10px" draggable="true" ondragstart="dragStart(event, 'bell')" onclick="addIcon('\uf0f3')">
                    <i class="fa-solid fa-bell" style="font-size: 30px; color: #f59e0b;"></i>
                </div>
                <div class="draggable-item" style="padding:10px" draggable="true" ondragstart="dragStart(event, 'camera')" onclick="addIcon('\uf030')">
                    <i class="fa-solid fa-camera" style="font-size: 30px; color: #10b981;"></i>
                </div>
            </div>
            
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <h5 style="color:var(--text-main); margin:0;">Biểu mẫu (Forms)</h5>
                <span style="font-size:0.75rem; color:var(--text-muted); cursor:pointer;">Mới</span>
            </div>
            <div style="background:var(--input-bg); border-radius:8px; padding:15px; text-align:center; cursor:pointer;" onclick="showToast('Chức năng thêm biểu mẫu đang hoàn thiện')">
                <i class="fa-solid fa-file-lines" style="font-size:24px; color:var(--primary); margin-bottom:10px;"></i>
                <p style="font-size:0.8rem;">Thêm khối Đăng ký / Liên hệ</p>
            </div>
        `;
    } else if (type === 'draw') {
        panel.innerHTML = `
            <div class="drawer-title">Công cụ Vẽ</div>
            <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:10px; margin-bottom: 20px;">
                <button class="btn-format" onclick="enableDrawMode('pencil')" title="Bút chì" style="padding:15px;"><i class="fa-solid fa-pencil" style="font-size:20px;"></i></button>
                <button class="btn-format" onclick="enableDrawMode('marker')" title="Bút dạ" style="padding:15px;"><i class="fa-solid fa-marker" style="font-size:20px;"></i></button>
                <button class="btn-format" onclick="disableDrawMode()" title="Con trỏ chuột (Tắt vẽ)" style="padding:15px; color:var(--success);"><i class="fa-solid fa-arrow-pointer" style="font-size:20px;"></i></button>
            </div>
            <div class="form-group" style="margin-bottom:15px;">
                <label style="display:block; margin-bottom:5px; font-weight:600;">Màu vẽ:</label>
                <input type="color" id="draw-color" value="#6366f1" onchange="updateDrawStyle()" style="width:100%; height:40px;">
            </div>
            <div class="form-group" style="margin-bottom:20px;">
                <label style="display:block; margin-bottom:5px; font-weight:600;">Độ dày nét vẽ (<span id="draw-size-label">5</span>px):</label>
                <input type="range" id="draw-size" min="1" max="50" value="5" oninput="document.getElementById('draw-size-label').innerText=this.value; updateDrawStyle()" style="width:100%;">
            </div>
            <button class="btn-danger" style="width:100%;" onclick="clearDrawings()"><i class="fa-solid fa-eraser"></i> Xoá tất cả nét vẽ</button>
        `;
    } else {
        // Placeholders for Design, Brand, Projects, Apps
        const titles = {
            'design': 'Thiết kế (Template)', 'brand': 'Thương hiệu', 
            'draw': 'Vẽ tự do', 'projects': 'Dự án khác', 'apps': 'Ứng dụng tích hợp'
        };
        panel.innerHTML = `
            <div class="drawer-title">${titles[type] || 'Tính năng'}</div>
            <div style="padding: 20px; text-align: center; color: var(--text-muted);">
                <i class="fa-solid fa-person-digging" style="font-size: 40px; margin-bottom: 10px;"></i>
                <p>Tính năng này đang được phát triển trong phiên bản tiếp theo!</p>
            </div>
        `;
    }
}

/* --- TOAST & SECTION UTILS --- */
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.innerText = message; toast.className = `toast show ${type}`;
    setTimeout(() => { toast.className = 'toast'; }, 3000);
}
function showSection(sectionId) {
    ['auth-section', 'dashboard-section', 'editor-section'].forEach(id => {
        document.getElementById(id).classList.add('hidden');
    });
    document.getElementById(sectionId).classList.remove('hidden');
}

/* --- AUTH & PROJECT LOGIC --- */
function toggleAuthMode() {
    isLoginMode = !isLoginMode;
    document.getElementById('auth-title').innerText = isLoginMode ? 'Đăng Nhập' : 'Đăng Ký';
    document.getElementById('btn-submit-auth').innerHTML = isLoginMode ? '<i class="fa-solid fa-right-to-bracket"></i> Đăng nhập' : '<i class="fa-solid fa-user-plus"></i> Đăng ký';
    document.getElementById('auth-switch-text').innerText = isLoginMode ? 'Chưa có tài khoản?' : 'Đã có tài khoản?';
    document.getElementById('auth-switch-link').innerText = isLoginMode ? 'Đăng ký ngay' : 'Đăng nhập ngay';
    document.getElementById('register-username-group').classList.toggle('hidden', isLoginMode);
}
async function handleAuth() {
    const email = document.getElementById('auth-email').value;
    const password = document.getElementById('auth-password').value;
    if (!email || !password) { showToast('Vui lòng điền thông tin', 'error'); return; }
    
    if (isLoginMode) {
        try {
            const res = await fetch(`${API_URL}/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password }) });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('jwt_token', data.token); showToast('Đăng nhập thành công!');
                document.getElementById('user-info-header').innerHTML = `<i class="fa-solid fa-user"></i> Đang đăng nhập`;
                showSection('dashboard-section'); loadProjects();
            } else showToast(data.message || 'Sai thông tin', 'error');
        } catch (e) { showToast('Lỗi máy chủ', 'error'); }
    } else {
        const username = document.getElementById('auth-username').value;
        if (!username) return showToast('Vui lòng nhập tên', 'error');
        try {
            const res = await fetch(`${API_URL}/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username, email, password }) });
            const data = await res.json();
            if (res.ok) { showToast('Đăng ký thành công', 'success'); toggleAuthMode(); }
            else showToast(data.message || 'Đăng ký thất bại', 'error');
        } catch (e) { showToast('Lỗi kết nối', 'error'); }
    }
}
function logout() { localStorage.removeItem('jwt_token'); document.getElementById('user-info-header').innerHTML = ''; showSection('auth-section'); }
async function fetchWithToken(url, options = {}) {
    options.headers = { ...options.headers, 'Authorization': `Bearer ${localStorage.getItem('jwt_token')}` };
    return fetch(url, options);
}
async function loadProjects() {
    try {
        const res = await fetchWithToken(`${API_URL}/project`);
        if (res.ok) { renderProjects(await res.json()); } else if (res.status === 401) logout();
    } catch (e) { showToast('Không thể tải dự án', 'error'); }
}
function renderProjects(projects) {
    const list = document.getElementById('project-list'); list.innerHTML = '';
    if (projects.length === 0) { list.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">Chưa có dự án nào</p>'; return; }
    projects.forEach(p => {
        const card = document.createElement('div'); card.className = 'project-card';
        card.onclick = () => openProject(p);
        card.innerHTML = `<h3><i class="fa-solid fa-file-powerpoint"></i> ${p.name}</h3><p>Tạo lúc: ${new Date(p.createdAt).toLocaleString()}</p>
            <button class="btn-delete-project" onclick="deleteProject(event, ${p.id})"><i class="fa-solid fa-trash"></i></button>`;
        list.appendChild(card);
    });
}
function promptCreateProject() { document.getElementById('new-project-name').value = ''; document.getElementById('create-project-modal').classList.remove('hidden'); document.getElementById('new-project-name').focus(); }
function closeCreateModal() { document.getElementById('create-project-modal').classList.add('hidden'); }
async function submitCreateProject() {
    const name = document.getElementById('new-project-name').value; if (!name.trim()) return;
    closeCreateModal();
    const res = await fetchWithToken(`${API_URL}/project`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name }) });
    if (res.ok) { showToast('Tạo dự án thành công'); loadProjects(); }
}
async function deleteProject(event, id) {
    event.stopPropagation(); if (!confirm('Bạn có chắc?')) return;
    const res = await fetchWithToken(`${API_URL}/project/${id}`, { method: 'DELETE' });
    if (res.ok) { showToast('Đã xóa'); loadProjects(); }
}
function openProject(project) {
    currentProjectId = project.id; document.getElementById('current-project-name').innerText = project.name;
    slideDataArray = []; currentSlideIndex = 0;
    if (project.slideDataJson && project.slideDataJson !== '{}') {
        try { const parsed = JSON.parse(project.slideDataJson); slideDataArray = Array.isArray(parsed) ? parsed : [{ json: parsed, thumbnail: '' }]; }
        catch { slideDataArray = [{ json: {}, thumbnail: '' }]; }
    } else slideDataArray = [{ json: {}, thumbnail: '' }];
    
    // Hide drawer on open
    document.getElementById('drawer-panel').classList.remove('active');
    activeDrawer = null;
    
    showSection('editor-section'); loadSlide(0);
}

/* --- MULTI-SLIDE LOGIC --- */
function loadSlide(index) {
    saveCurrentSlideState(true); currentSlideIndex = index;
    const slide = slideDataArray[index];
    canvas.clear(); canvas.setBackgroundColor('#ffffff', canvas.renderAll.bind(canvas));
    if (slide && slide.json && Object.keys(slide.json).length > 0) {
        canvas.loadFromJSON(slide.json, () => { canvas.renderAll(); renderSlideThumbnails(); hidePropertiesPanel(); updatePageIndicator(); });
    } else { renderSlideThumbnails(); hidePropertiesPanel(); updatePageIndicator(); }
}

let saveTimeout = null;
function saveCurrentSlideState(immediate = false) {
    const performSave = () => {
        if (slideDataArray[currentSlideIndex] && canvas) {
            slideDataArray[currentSlideIndex].json = canvas.toJSON(['id', 'name', 'lockMovementX', 'lockMovementY', 'lockRotation', 'lockScalingX', 'lockScalingY', 'hasControls', 'selectable']);
            const dataUrl = canvas.toDataURL({ format: 'png', multiplier: 0.2 });
            slideDataArray[currentSlideIndex].thumbnail = dataUrl;
            
            // Real-time update thumbnail image in the DOM without fully re-rendering the list
            const thumbImg = document.getElementById(`thumb-img-${currentSlideIndex}`);
            if (thumbImg) thumbImg.src = dataUrl;
        }
    };
    
    if (immediate) {
        if (saveTimeout) clearTimeout(saveTimeout);
        performSave();
    } else {
        if (saveTimeout) clearTimeout(saveTimeout);
        saveTimeout = setTimeout(performSave, 200);
    }
}

function addNewSlide() { saveCurrentSlideState(true); slideDataArray.push({ json: {}, thumbnail: '' }); loadSlide(slideDataArray.length - 1); }
function deleteSlide(event, index) {
    event.stopPropagation(); if (slideDataArray.length <= 1) return showToast('Không thể xóa slide duy nhất!', 'error');
    if (confirm('Xóa trang này?')) {
        slideDataArray.splice(index, 1);
        loadSlide(Math.min(currentSlideIndex, slideDataArray.length - 1));
    }
}
function renderSlideThumbnails() {
    const list = document.getElementById('slides-list'); list.innerHTML = '';
    slideDataArray.forEach((slide, index) => {
        const div = document.createElement('div');
        div.className = `slide-thumb-h ${index === currentSlideIndex ? 'active' : ''}`;
        div.onclick = () => loadSlide(index);
        div.innerHTML = `<span class="thumb-num">${index + 1}</span>
            <button class="thumb-del" onclick="deleteSlide(event, ${index})"><i class="fa-solid fa-xmark"></i></button>
            <img id="thumb-img-${index}" src="${slide.thumbnail || ''}" onerror="this.src='data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs='}">`;
        list.appendChild(div);
    });
    updatePageIndicator();
    
    // Auto scroll to active slide
    const activeThumb = list.querySelector('.slide-thumb-h.active');
    if (activeThumb) activeThumb.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
}
function updatePageIndicator() {
    const el = document.getElementById('page-indicator');
    if (el) el.innerText = `Trang ${currentSlideIndex + 1} / ${slideDataArray.length || 1}`;
}
async function saveSlide() {
    if (!currentProjectId) return; saveCurrentSlideState(true);
    const res = await fetchWithToken(`${API_URL}/project/${currentProjectId}`, {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slideDataJson: JSON.stringify(slideDataArray) })
    });
    if (res.ok) { showToast('Lưu thành công'); renderSlideThumbnails(); }
}
function exportToImage() {
    const a = document.createElement('a'); a.download = `slide-${currentSlideIndex + 1}.png`;
    a.href = canvas.toDataURL({ format: 'png', multiplier: 2 }); a.click();
}
function backToDashboard() { currentProjectId = null; showSection('dashboard-section'); loadProjects(); }

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
function addIcon(unicodeStr, x = null, y = null) {
    const icon = new fabric.Text(unicodeStr, {
        fontFamily: '"Font Awesome 6 Free"', fontWeight: 900,
        left: x ?? canvas.width/2 - 20, top: y ?? canvas.height/2 - 20,
        fontSize: 50, fill: '#64748b', id: _generateId(), name: 'Icon'
    });
    canvas.add(icon); canvas.setActiveObject(icon);
}

function uploadImage(e) {
    const file = e.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = function(f) {
        fabric.Image.fromURL(f.target.result, function(img) {
            if(img.width > canvas.width || img.height > canvas.height) img.scaleToWidth(canvas.width / 2);
            img.set({ left: 50, top: 50, id: _generateId(), name: 'Hình ảnh' });
            canvas.add(img); canvas.setActiveObject(img);
        });
    };
    reader.readAsDataURL(file); e.target.value = '';
}

/* --- DRAWING TOOLS LOGIC --- */
function enableDrawMode(type) {
    if(!canvas) return;
    canvas.isDrawingMode = true;
    updateDrawStyle();
    showToast('Đã bật chế độ vẽ tự do', 'success');
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
    canvas.freeDrawingBrush = new fabric.PencilBrush(canvas);
    canvas.freeDrawingBrush.color = color;
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
        saveCurrentSlideState();
        renderLayers();
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
    
    document.getElementById('prop-shadow').checked = !!activeObj.shadow;
    document.getElementById('prop-opacity').value = activeObj.opacity !== undefined ? activeObj.opacity : 1;
    
    const isText = activeObj.type === 'i-text' || activeObj.type === 'text';
    const fontGroup = document.getElementById('prop-font-group');
    if (isText) {
        fontGroup.classList.remove('hidden');
        document.getElementById('prop-font-size').value = activeObj.fontSize;
        document.getElementById('prop-font-family').value = activeObj.fontFamily || DEFAULT_FONT;
        document.getElementById('prop-bg-color').value = activeObj.textBackgroundColor || '#ffffff';
        document.getElementById('prop-line-height').value = activeObj.lineHeight || 1.16;
        
        document.getElementById('btn-bold').classList.toggle('active', activeObj.fontWeight === 'bold');
        document.getElementById('btn-italic').classList.toggle('active', activeObj.fontStyle === 'italic');
        document.getElementById('btn-underline').classList.toggle('active', activeObj.underline);
        document.getElementById('btn-strikethrough').classList.toggle('active', activeObj.linethrough);
    } else {
        fontGroup.classList.add('hidden');
    }
}
function hidePropertiesPanel() { document.getElementById('sub-toolbar').style.visibility = 'hidden'; }

function updateObjectProperty(property, value) {
    const activeObj = canvas.getActiveObject();
    if (!activeObj) return;
    if (property === 'fontSize') value = parseInt(value, 10);
    if (property === 'lineHeight') value = parseFloat(value);
    activeObj.set(property, value);
    canvas.renderAll();
}

function toggleFormat(property, truthyValue, falsyValue) {
    const activeObj = canvas.getActiveObject(); if (!activeObj) return;
    const isCurrentlyTruthy = activeObj[property] === truthyValue;
    activeObj.set(property, isCurrentlyTruthy ? falsyValue : truthyValue);
    canvas.renderAll(); showPropertiesPanel();
}

function toggleShadow(isEnabled) {
    const activeObj = canvas.getActiveObject(); if (!activeObj) return;
    if (isEnabled) {
        activeObj.set('shadow', new fabric.Shadow({ color: 'rgba(0,0,0,0.5)', blur: 10, offsetX: 5, offsetY: 5 }));
    } else {
        activeObj.set('shadow', null);
    }
    canvas.renderAll();
}

function toggleUppercase() {
    const activeObj = canvas.getActiveObject();
    if (!activeObj || !activeObj.text) return;
    const isUpper = activeObj.text === activeObj.text.toUpperCase();
    activeObj.set('text', isUpper ? activeObj.text.toLowerCase() : activeObj.text.toUpperCase());
    canvas.renderAll();
}

function bringForward() { const obj = canvas.getActiveObject(); if(obj) { canvas.bringForward(obj); canvas.renderAll(); saveCurrentSlideState(); } }
function sendBackward() { const obj = canvas.getActiveObject(); if(obj) { canvas.sendBackwards(obj); canvas.renderAll(); saveCurrentSlideState(); } }

function bringToFront() { const obj = canvas.getActiveObject(); if(obj) { canvas.bringToFront(obj); canvas.renderAll(); saveCurrentSlideState(); } }
function sendToBack() { const obj = canvas.getActiveObject(); if(obj) { canvas.sendToBack(obj); canvas.renderAll(); saveCurrentSlideState(); } }

function deleteSelected() {
    const activeObjects = canvas.getActiveObjects();
    if (activeObjects.length) {
        canvas.discardActiveObject();
        activeObjects.forEach(obj => canvas.remove(obj));
        hidePropertiesPanel();
        saveCurrentSlideState();
    }
}

/* --- CONTEXT MENU LOGIC --- */
function initContextMenu() {
    const container = document.getElementById('canvas-container');
    const menu = document.getElementById('context-menu');
    if(!menu) return;

    container.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        const activeObj = canvas.getActiveObject();
        
        // Update Lock button text
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
    menu.classList.remove('active');
    
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
                saveCurrentSlideState();
            });
        }
    } else if (action === 'duplicate') {
        const obj = canvas.getActiveObject();
        if (obj) {
            obj.clone((clonedObj) => {
                canvas.discardActiveObject();
                clonedObj.set({
                    left: clonedObj.left + 20,
                    top: clonedObj.top + 20,
                    id: _generateId(),
                    evented: true
                });
                canvas.add(clonedObj);
                canvas.setActiveObject(clonedObj);
                canvas.requestRenderAll();
                saveCurrentSlideState();
                showToast('Đã nhân bản');
            });
        }
    } else if (action === 'bringForward') {
        bringForward();
    } else if (action === 'sendBackward') {
        sendBackward();
    } else if (action === 'delete') {
        deleteSelected();
    } else if (action === 'addPage') {
        addNewSlide();
    }
}

/* --- KEYBOARD SHORTCUTS --- */
function initKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        const activeObj = canvas?.getActiveObject();
        if (activeObj && activeObj.isEditing) return;

        if (e.key === 'Delete' || e.key === 'Backspace') { if (currentProjectId) deleteSelected(); }
        if (e.ctrlKey && e.key === 'c' && activeObj) { activeObj.clone(function(cloned) { clipboard = cloned; showToast('Đã copy', 'success'); }); }
        if (e.ctrlKey && e.key === 'v' && clipboard && currentProjectId) {
            clipboard.clone(function(clonedObj) {
                canvas.discardActiveObject();
                clonedObj.set({ left: clonedObj.left + 20, top: clonedObj.top + 20, evented: true, id: _generateId(), name: clipboard.name + ' copy' });
                if (clonedObj.type === 'activeSelection') {
                    clonedObj.canvas = canvas; clonedObj.forEachObject(function(obj) { canvas.add(obj); }); clonedObj.setCoords();
                } else canvas.add(clonedObj);
                clipboard.top += 20; clipboard.left += 20;
                canvas.setActiveObject(clonedObj); canvas.requestRenderAll();
            });
        }
        if (e.ctrlKey && e.key === 'b') { e.preventDefault(); toggleFormat('fontWeight', 'bold', 'normal'); }
        if (e.ctrlKey && e.key === 'i') { e.preventDefault(); toggleFormat('fontStyle', 'italic', 'normal'); }
        if (e.ctrlKey && e.key === 'u') { e.preventDefault(); toggleFormat('underline', true, false); }
    });

    // Global Paste Event (External Text & Images)
    window.addEventListener('paste', (e) => {
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
        
        if (!currentProjectId) return; // Only allow paste if in editor

        const items = (e.clipboardData || e.originalEvent.clipboardData).items;
        let pastedImage = false;

        for (let index in items) {
            const item = items[index];
            if (item.kind === 'file' && item.type.startsWith('image/')) {
                const blob = item.getAsFile();
                const reader = new FileReader();
                reader.onload = function(event){
                    fabric.Image.fromURL(event.target.result, function(img) {
                        if(img.width > canvas.width || img.height > canvas.height) {
                            img.scaleToWidth(canvas.width / 2);
                        }
                        img.set({ left: 50, top: 50, id: _generateId(), name: 'Ảnh dán' });
                        canvas.add(img);
                        canvas.setActiveObject(img);
                        canvas.renderAll(); // Request explicit re-render to show instantly
                        saveCurrentSlideState();
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
                    // Check if the canvas didn't just paste an active selection from internal
                    const active = canvas.getActiveObject();
                    if (active && active.type === 'i-text' && active.text === text && active.isEditing) {
                        // User is pasting inside an actively editing text box, let browser handle it
                        return; 
                    }
                    if (!active || !active.isEditing) {
                        addText(text, 24, false, 50, 50);
                        canvas.renderAll();
                    }
                }, 10); // Reduced delay to 10ms for snappy feel
            }
        }
    });
}
