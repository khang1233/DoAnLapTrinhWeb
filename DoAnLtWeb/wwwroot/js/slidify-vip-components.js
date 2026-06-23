const SLIDIFY_VIP_EDITOR = (() => {
    const isVip = document.getElementById('user-is-vip')?.value === 'true';

    const components = [
        // Popular
        { category: 'Popular', title: 'Hero Banner',       vip: false, action: addComponentHeroBanner },
        { category: 'Popular', title: 'Quote Block',        vip: false, action: addComponentQuoteBlock },
        { category: 'Popular', title: 'Badge Ribbon',       vip: false, action: addComponentBadgeRibbon },
        { category: 'Popular', title: 'Icon Card',          vip: false, action: addComponentIconCard },
        // Lists & Steps
        { category: 'Lists',   title: 'Numbered List',      vip: false, action: addComponentNumberedList },
        { category: 'Lists',   title: 'Step Diagram',       vip: false, action: addComponentStepDiagram },
        // Data & Charts
        { category: 'Data',    title: 'Progress Bar',       vip: false, action: addComponentProgressBar },
        { category: 'Data',    title: 'Stat Cards',         vip: true,  action: addComponentStatCards },
        { category: 'Data',    title: 'Timeline',           vip: true,  action: addComponentTimeline },
        { category: 'Data',    title: 'Bar Chart Block',    vip: true,  action: addComponentBarChart },
        { category: 'Data',    title: 'KPI Dashboard',      vip: true,  action: addComponentKpiDashboard },
        // Marketing
        { category: 'Marketing', title: 'CTA Section',      vip: false, action: addComponentCta },
        { category: 'Marketing', title: 'Callout Box',      vip: false, action: addComponentCalloutBox },
        { category: 'Marketing', title: 'Vùng đặt video',vip: false, action: addComponentVideoPlaceholder },
        { category: 'Marketing', title: 'Pricing Table',    vip: true,  action: addComponentPricingTable },
        { category: 'Marketing', title: 'Feature Grid',     vip: true,  action: addComponentFeatureGrid },
        // Social & Brand
        { category: 'Social',  title: 'Logo Chips',         vip: false, action: addComponentLogoStrip },
        { category: 'Social',  title: 'Testimonial Card',   vip: true,  action: addComponentTestimonial },
        // Frames & Mockups
        { category: 'Frames',  title: 'Image Frames',       vip: false, action: addComponentImageFrames },
        { category: 'Frames',  title: 'Mockup Card',        vip: true,  action: addComponentMockup },
        // Tables
        { category: 'Tables',  title: 'Comparison Table',   vip: true,  action: addComponentTable },
        // Team & Awards
        { category: 'People',  title: 'Team Member Card',   vip: true,  action: addComponentTeamMember },
        { category: 'People',  title: 'Trophy Card',        vip: false, action: addComponentTrophyCard },
        // Infographic
        { category: 'Infographic', title: 'Infographic Flow', vip: true, action: addComponentInfographicFlow },
        { category: 'Infographic', title: 'Countdown Block',  vip: false, action: addComponentCountdown },
        // Decor
        { category: 'Decor',   title: 'Gradient Divider',   vip: false, action: addComponentDivider }
    ];

    function ensureVipAccess(featureName) {
        if (isVip) return true;
        if (typeof showToast === 'function') {
            showToast(`${featureName} la tinh nang VIP`, 'info');
        }
        setTimeout(() => window.location.href = '/Billing/Upgrade', 500);
        return false;
    }

    function addComponentGroup(objects) {
        // Instead of wrapping into a fabric.Group (which makes inner text uneditable),
        // we drop each object onto the canvas at the same (left, top) offset so the user can
        // still click and edit individual text/shape pieces. They can multi-select + group
        // manually with Ctrl+G if they really want a group.
        if (!window.canvas || !window.fabric) return;
        const baseLeft = 80, baseTop = 80;
        const added = [];
        objects.forEach(o => {
            o.set({
                left: baseLeft + (o.left || 0),
                top: baseTop + (o.top || 0),
                id: _generateId(),
                selectable: true,
                hasControls: true,
                editable: o.type === 'i-text' || o.type === 'text' || o.type === 'textbox' ? true : (o.editable || false)
            });
            canvas.add(o);
            added.push(o);
        });
        if (added.length) {
            // Select the first piece so the floating toolbar shows immediately.
            canvas.setActiveObject(added[0]);
        }
        canvas.requestRenderAll();
        triggerAutoSave();
    }

    // ── Popular ──────────────────────────────────────────────────────────────

    function addComponentHeroBanner() {
        addComponentGroup([
            new fabric.Rect({ width: 560, height: 180, rx: 24, ry: 24, fill: '#0f172a' }),
            new fabric.Textbox('Câu chuyện lớn của bạn bắt đầu từ đây', { left: 30, top: 28, width: 290, fontSize: 32, fill: '#f8fafc', fontWeight: '700', fontFamily: 'Inter' }),
            new fabric.Textbox('Các khối có sẵn — chỉnh sửa từng phần thoải mái.', { left: 30, top: 104, width: 280, fontSize: 18, fill: '#cbd5e1', fontFamily: 'Inter' }),
            new fabric.Rect({ left: 365, top: 24, width: 165, height: 128, rx: 20, ry: 20, fill: '#38bdf8' })
        ]);
    }

    function addComponentQuoteBlock() {
        addComponentGroup([
            new fabric.Rect({ width: 520, height: 170, rx: 22, ry: 22, fill: '#fff7ed', stroke: '#fdba74', strokeWidth: 1 }),
            new fabric.Textbox('"Design should feel effortless for the audience, even when the system behind it is powerful."', { left: 28, top: 30, width: 460, fontSize: 26, fill: '#7c2d12', fontFamily: 'Playfair Display' }),
            new fabric.Textbox('Tran Minh Khang  Slidify', { left: 30, top: 126, width: 260, fontSize: 16, fill: '#c2410c', fontWeight: '600' })
        ]);
    }

    function addComponentBadgeRibbon() {
        addComponentGroup([
            new fabric.Rect({ width: 220, height: 56, rx: 0, ry: 0, fill: '#7c3aed' }),
            new fabric.Rect({ left: -14, top: -14, width: 0, height: 0,
                clipPath: new fabric.Rect({ width: 28, height: 28, left: -14, top: -14 }),
                fill: '#4c1d95' }),
            new fabric.Textbox('NEW ARRIVAL', { left: 14, top: 16, width: 192, fontSize: 20, fill: '#ffffff', fontWeight: '800', textAlign: 'center', fontFamily: 'Inter', charSpacing: 60 })
        ]);
    }

    function addComponentIconCard() {
        addComponentGroup([
            new fabric.Rect({ width: 220, height: 190, rx: 20, ry: 20, fill: '#f0fdf4', stroke: '#86efac', strokeWidth: 1 }),
            new fabric.Circle({ left: 75, top: 22, radius: 36, fill: '#22c55e' }),
            new fabric.Textbox('★', { left: 90, top: 36, width: 40, fontSize: 34, fill: '#ffffff', textAlign: 'center' }),
            new fabric.Textbox('Feature Title', { left: 16, top: 106, width: 188, fontSize: 20, fill: '#14532d', fontWeight: '700', textAlign: 'center' }),
            new fabric.Textbox('Mô tả ngắn về tính năng này.', { left: 16, top: 138, width: 188, fontSize: 14, fill: '#4ade80', textAlign: 'center', lineHeight: 1.4 })
        ]);
    }

    // ── Lists & Steps ─────────────────────────────────────────────────────────

    function addComponentNumberedList() {
        addComponentGroup([
            new fabric.Rect({ width: 420, height: 200, rx: 20, ry: 20, fill: '#f8fafc', stroke: '#e2e8f0', strokeWidth: 1 }),
            new fabric.Circle({ left: 22, top: 22, radius: 22, fill: '#2563eb' }),
            new fabric.Textbox('1', { left: 34, top: 30, width: 20, fontSize: 22, fill: '#fff', fontWeight: '800', textAlign: 'center' }),
            new fabric.Textbox('First item — replace with your content', { left: 70, top: 30, width: 330, fontSize: 18, fill: '#0f172a' }),
            new fabric.Circle({ left: 22, top: 82, radius: 22, fill: '#7c3aed' }),
            new fabric.Textbox('2', { left: 34, top: 90, width: 20, fontSize: 22, fill: '#fff', fontWeight: '800', textAlign: 'center' }),
            new fabric.Textbox('Second item — replace with your content', { left: 70, top: 90, width: 330, fontSize: 18, fill: '#0f172a' }),
            new fabric.Circle({ left: 22, top: 142, radius: 22, fill: '#059669' }),
            new fabric.Textbox('3', { left: 34, top: 150, width: 20, fontSize: 22, fill: '#fff', fontWeight: '800', textAlign: 'center' }),
            new fabric.Textbox('Third item — replace with your content', { left: 70, top: 150, width: 330, fontSize: 18, fill: '#0f172a' })
        ]);
    }

    function addComponentStepDiagram() {
        addComponentGroup([
            new fabric.Rect({ width: 540, height: 100, rx: 18, ry: 18, fill: '#f1f5f9' }),
            new fabric.Rect({ left: 26, top: 24, width: 130, height: 52, rx: 26, ry: 26, fill: '#2563eb' }),
            new fabric.Textbox('Bước 1', { left: 38, top: 38, width: 106, fontSize: 18, fill: '#fff', fontWeight: '700', textAlign: 'center' }),
            new fabric.Textbox('→', { left: 162, top: 38, width: 36, fontSize: 24, fill: '#94a3b8', textAlign: 'center' }),
            new fabric.Rect({ left: 202, top: 24, width: 130, height: 52, rx: 26, ry: 26, fill: '#7c3aed' }),
            new fabric.Textbox('Bước 2', { left: 214, top: 38, width: 106, fontSize: 18, fill: '#fff', fontWeight: '700', textAlign: 'center' }),
            new fabric.Textbox('→', { left: 338, top: 38, width: 36, fontSize: 24, fill: '#94a3b8', textAlign: 'center' }),
            new fabric.Rect({ left: 378, top: 24, width: 130, height: 52, rx: 26, ry: 26, fill: '#059669' }),
            new fabric.Textbox('Bước 3', { left: 390, top: 38, width: 106, fontSize: 18, fill: '#fff', fontWeight: '700', textAlign: 'center' })
        ]);
    }

    // ── Data & Charts ─────────────────────────────────────────────────────────

    function addComponentProgressBar() {
        addComponentGroup([
            new fabric.Rect({ width: 480, height: 140, rx: 18, ry: 18, fill: '#f8fafc' }),
            new fabric.Textbox('Project Completion', { left: 22, top: 20, width: 280, fontSize: 18, fill: '#0f172a', fontWeight: '700' }),
            new fabric.Textbox('75%', { left: 416, top: 20, width: 52, fontSize: 18, fill: '#7c3aed', fontWeight: '800', textAlign: 'right' }),
            new fabric.Rect({ left: 22, top: 60, width: 436, height: 18, rx: 9, ry: 9, fill: '#e2e8f0' }),
            new fabric.Rect({ left: 22, top: 60, width: 327, height: 18, rx: 9, ry: 9, fill: '#7c3aed' }),
            new fabric.Textbox('Design', { left: 22, top: 90, width: 100, fontSize: 14, fill: '#94a3b8' }),
            new fabric.Rect({ left: 22, top: 110, width: 436, height: 12, rx: 6, ry: 6, fill: '#e2e8f0' }),
            new fabric.Rect({ left: 22, top: 110, width: 218, height: 12, rx: 6, ry: 6, fill: '#2563eb' })
        ]);
    }

    function addComponentStatCards() {
        if (!ensureVipAccess('Stat Cards')) return;
        addComponentGroup([
            new fabric.Rect({ width: 540, height: 170, rx: 22, ry: 22, fill: '#0f172a' }),
            new fabric.Rect({ left: 22, top: 24, width: 150, height: 122, rx: 16, ry: 16, fill: '#1d4ed8' }),
            new fabric.Rect({ left: 194, top: 24, width: 150, height: 122, rx: 16, ry: 16, fill: '#7c3aed' }),
            new fabric.Rect({ left: 366, top: 24, width: 150, height: 122, rx: 16, ry: 16, fill: '#059669' }),
            new fabric.Textbox('84%', { left: 42, top: 44, width: 110, fontSize: 34, fill: '#fff', fontWeight: '800' }),
            new fabric.Textbox('Growth', { left: 42, top: 92, width: 90, fontSize: 16, fill: '#dbeafe' }),
            new fabric.Textbox('12K', { left: 214, top: 44, width: 110, fontSize: 34, fill: '#fff', fontWeight: '800' }),
            new fabric.Textbox('Leads', { left: 214, top: 92, width: 90, fontSize: 16, fill: '#ede9fe' }),
            new fabric.Textbox('$48K', { left: 386, top: 44, width: 110, fontSize: 34, fill: '#fff', fontWeight: '800' }),
            new fabric.Textbox('Revenue', { left: 386, top: 92, width: 90, fontSize: 16, fill: '#d1fae5' })
        ]);
    }

    function addComponentTimeline() {
        if (!ensureVipAccess('Timeline')) return;
        addComponentGroup([
            new fabric.Rect({ width: 560, height: 150, rx: 20, ry: 20, fill: '#f8fafc', stroke: '#cbd5e1', strokeWidth: 1 }),
            new fabric.Rect({ left: 56, top: 72, width: 440, height: 4, fill: '#94a3b8' }),
            new fabric.Circle({ left: 70, top: 58, radius: 16, fill: '#2563eb' }),
            new fabric.Circle({ left: 220, top: 58, radius: 16, fill: '#7c3aed' }),
            new fabric.Circle({ left: 370, top: 58, radius: 16, fill: '#f97316' }),
            new fabric.Textbox('Research', { left: 44, top: 96, width: 80, fontSize: 15, textAlign: 'center' }),
            new fabric.Textbox('Build', { left: 198, top: 96, width: 60, fontSize: 15, textAlign: 'center' }),
            new fabric.Textbox('Khởi chạy', { left: 343, top: 96, width: 80, fontSize: 15, textAlign: 'center' })
        ]);
    }

    function addComponentBarChart() {
        if (!ensureVipAccess('Bar Chart Block')) return;
        addComponentGroup([
            new fabric.Rect({ width: 480, height: 200, rx: 20, ry: 20, fill: '#0f172a' }),
            new fabric.Textbox('Revenue by Quarter', { left: 22, top: 18, width: 280, fontSize: 18, fill: '#f8fafc', fontWeight: '700' }),
            new fabric.Rect({ left: 40,  top: 100, width: 60, height: 80, rx: 6, ry: 6, fill: '#3b82f6' }),
            new fabric.Rect({ left: 120, top: 70,  width: 60, height: 110, rx: 6, ry: 6, fill: '#8b5cf6' }),
            new fabric.Rect({ left: 200, top: 50,  width: 60, height: 130, rx: 6, ry: 6, fill: '#06b6d4' }),
            new fabric.Rect({ left: 280, top: 30,  width: 60, height: 150, rx: 6, ry: 6, fill: '#10b981' }),
            new fabric.Textbox('Q1', { left: 52, top: 186, width: 36, fontSize: 13, fill: '#64748b', textAlign: 'center' }),
            new fabric.Textbox('Q2', { left: 132, top: 186, width: 36, fontSize: 13, fill: '#64748b', textAlign: 'center' }),
            new fabric.Textbox('Q3', { left: 212, top: 186, width: 36, fontSize: 13, fill: '#64748b', textAlign: 'center' }),
            new fabric.Textbox('Q4', { left: 292, top: 186, width: 36, fontSize: 13, fill: '#64748b', textAlign: 'center' }),
            new fabric.Textbox('Replace data labels', { left: 370, top: 160, width: 100, fontSize: 12, fill: '#475569', lineHeight: 1.4 })
        ]);
    }

    function addComponentKpiDashboard() {
        if (!ensureVipAccess('KPI Dashboard')) return;
        addComponentGroup([
            new fabric.Rect({ width: 540, height: 200, rx: 22, ry: 22, fill: '#f8fafc', stroke: '#e2e8f0', strokeWidth: 1 }),
            new fabric.Textbox('KPI Dashboard', { left: 22, top: 16, width: 260, fontSize: 18, fill: '#0f172a', fontWeight: '700' }),
            new fabric.Rect({ left: 22, top: 54, width: 112, height: 120, rx: 14, ry: 14, fill: '#eff6ff', stroke: '#bfdbfe', strokeWidth: 1 }),
            new fabric.Textbox('$120K', { left: 30, top: 70, width: 96, fontSize: 26, fill: '#1d4ed8', fontWeight: '800' }),
            new fabric.Textbox('Revenue', { left: 30, top: 112, width: 96, fontSize: 14, fill: '#64748b' }),
            new fabric.Rect({ left: 152, top: 54, width: 112, height: 120, rx: 14, ry: 14, fill: '#fdf4ff', stroke: '#e9d5ff', strokeWidth: 1 }),
            new fabric.Textbox('8.4K', { left: 160, top: 70, width: 96, fontSize: 26, fill: '#7c3aed', fontWeight: '800' }),
            new fabric.Textbox('Users', { left: 160, top: 112, width: 96, fontSize: 14, fill: '#64748b' }),
            new fabric.Rect({ left: 282, top: 54, width: 112, height: 120, rx: 14, ry: 14, fill: '#f0fdf4', stroke: '#bbf7d0', strokeWidth: 1 }),
            new fabric.Textbox('94%', { left: 290, top: 70, width: 96, fontSize: 26, fill: '#059669', fontWeight: '800' }),
            new fabric.Textbox('Retention', { left: 290, top: 112, width: 96, fontSize: 14, fill: '#64748b' }),
            new fabric.Rect({ left: 412, top: 54, width: 112, height: 120, rx: 14, ry: 14, fill: '#fff7ed', stroke: '#fed7aa', strokeWidth: 1 }),
            new fabric.Textbox('3.2x', { left: 420, top: 70, width: 96, fontSize: 26, fill: '#c2410c', fontWeight: '800' }),
            new fabric.Textbox('ROI', { left: 420, top: 112, width: 96, fontSize: 14, fill: '#64748b' })
        ]);
    }

    // ── Marketing ─────────────────────────────────────────────────────────────

    function addComponentCta() {
        addComponentGroup([
            new fabric.Rect({ width: 530, height: 170, rx: 24, ry: 24, fill: '#111827' }),
            new fabric.Textbox('Ready to tell the next chapter?', { left: 26, top: 28, width: 290, fontSize: 30, fill: '#fff', fontWeight: '700' }),
            new fabric.Textbox('Use this section for call-to-action, signup, or product reveal.', { left: 28, top: 88, width: 280, fontSize: 17, fill: '#d1d5db' }),
            new fabric.Rect({ left: 352, top: 58, width: 144, height: 52, rx: 26, ry: 26, fill: '#8b5cf6' }),
            new fabric.Textbox('Get Started', { left: 378, top: 74, width: 100, fontSize: 18, fill: '#fff', fontWeight: '700' })
        ]);
    }

    function addComponentCalloutBox() {
        addComponentGroup([
            new fabric.Rect({ width: 500, height: 110, rx: 18, ry: 18, fill: '#eff6ff', stroke: '#60a5fa', strokeWidth: 2 }),
            new fabric.Rect({ left: 0, top: 0, width: 8, height: 110, rx: 4, ry: 4, fill: '#2563eb' }),
            new fabric.Textbox('ℹ', { left: 24, top: 28, width: 40, fontSize: 36, fill: '#2563eb', fontWeight: '700' }),
            new fabric.Textbox('Important Notice', { left: 72, top: 18, width: 380, fontSize: 18, fill: '#1d4ed8', fontWeight: '700' }),
            new fabric.Textbox('Replace this text with your key callout message. Use for tips, warnings, or highlighted notes.', { left: 72, top: 50, width: 400, fontSize: 15, fill: '#1e40af', lineHeight: 1.5 })
        ]);
    }

    function addComponentVideoPlaceholder() {
        addComponentGroup([
            new fabric.Rect({ width: 480, height: 270, rx: 20, ry: 20, fill: '#0f172a' }),
            new fabric.Circle({ left: 190, top: 95, radius: 56, fill: 'rgba(255,255,255,0.12)' }),
            new fabric.Triangle({ left: 222, top: 120, width: 52, height: 52, fill: '#ffffff', angle: 90 }),
            new fabric.Textbox('Video Title Here', { left: 22, top: 230, width: 360, fontSize: 18, fill: '#f8fafc', fontWeight: '700' }),
            new fabric.Textbox('Click to embed a video URL', { left: 22, top: 256, width: 300, fontSize: 14, fill: '#64748b' })
        ]);
    }

    function addComponentPricingTable() {
        if (!ensureVipAccess('Pricing Table')) return;
        addComponentGroup([
            new fabric.Rect({ width: 580, height: 240, rx: 24, ry: 24, fill: '#0f172a' }),
            new fabric.Rect({ left: 22, top: 22, width: 160, height: 196, rx: 16, ry: 16, fill: '#1e293b' }),
            new fabric.Textbox('Free', { left: 42, top: 38, width: 120, fontSize: 20, fill: '#94a3b8', fontWeight: '700', textAlign: 'center' }),
            new fabric.Textbox('$0', { left: 42, top: 70, width: 120, fontSize: 34, fill: '#f8fafc', fontWeight: '800', textAlign: 'center' }),
            new fabric.Textbox('per month', { left: 42, top: 112, width: 120, fontSize: 13, fill: '#64748b', textAlign: 'center' }),
            new fabric.Textbox('Basic features', { left: 42, top: 148, width: 120, fontSize: 14, fill: '#64748b', textAlign: 'center' }),
            new fabric.Rect({ left: 206, top: 22, width: 160, height: 196, rx: 16, ry: 16, fill: '#7c3aed' }),
            new fabric.Textbox('VIP', { left: 226, top: 38, width: 120, fontSize: 20, fill: '#ddd6fe', fontWeight: '700', textAlign: 'center' }),
            new fabric.Textbox('199K', { left: 226, top: 70, width: 120, fontSize: 34, fill: '#ffffff', fontWeight: '800', textAlign: 'center' }),
            new fabric.Textbox('per month', { left: 226, top: 112, width: 120, fontSize: 13, fill: '#c4b5fd', textAlign: 'center' }),
            new fabric.Textbox('All features', { left: 226, top: 148, width: 120, fontSize: 14, fill: '#c4b5fd', textAlign: 'center' }),
            new fabric.Rect({ left: 390, top: 22, width: 160, height: 196, rx: 16, ry: 16, fill: '#1e293b' }),
            new fabric.Textbox('Team', { left: 410, top: 38, width: 120, fontSize: 20, fill: '#94a3b8', fontWeight: '700', textAlign: 'center' }),
            new fabric.Textbox('Custom', { left: 410, top: 70, width: 120, fontSize: 26, fill: '#f8fafc', fontWeight: '800', textAlign: 'center' }),
            new fabric.Textbox('contact us', { left: 410, top: 112, width: 120, fontSize: 13, fill: '#64748b', textAlign: 'center' }),
            new fabric.Textbox('Everything', { left: 410, top: 148, width: 120, fontSize: 14, fill: '#64748b', textAlign: 'center' })
        ]);
    }

    function addComponentFeatureGrid() {
        if (!ensureVipAccess('Feature Grid')) return;
        addComponentGroup([
            new fabric.Rect({ width: 500, height: 260, rx: 22, ry: 22, fill: '#f8fafc', stroke: '#e2e8f0', strokeWidth: 1 }),
            new fabric.Rect({ left: 22, top: 22, width: 210, height: 100, rx: 14, ry: 14, fill: '#eff6ff' }),
            new fabric.Textbox('⚡', { left: 34, top: 34, width: 30, fontSize: 26, fill: '#2563eb' }),
            new fabric.Textbox('Fast', { left: 72, top: 36, width: 140, fontSize: 18, fill: '#0f172a', fontWeight: '700' }),
            new fabric.Textbox('Mô tả tính năng', { left: 34, top: 70, width: 190, fontSize: 13, fill: '#64748b' }),
            new fabric.Rect({ left: 268, top: 22, width: 210, height: 100, rx: 14, ry: 14, fill: '#fdf4ff' }),
            new fabric.Textbox('♥', { left: 280, top: 34, width: 30, fontSize: 26, fill: '#7c3aed' }),
            new fabric.Textbox('Loved', { left: 318, top: 36, width: 140, fontSize: 18, fill: '#0f172a', fontWeight: '700' }),
            new fabric.Textbox('Mô tả tính năng', { left: 280, top: 70, width: 190, fontSize: 13, fill: '#64748b' }),
            new fabric.Rect({ left: 22, top: 140, width: 210, height: 100, rx: 14, ry: 14, fill: '#f0fdf4' }),
            new fabric.Textbox('✓', { left: 34, top: 152, width: 30, fontSize: 26, fill: '#059669' }),
            new fabric.Textbox('Reliable', { left: 72, top: 154, width: 140, fontSize: 18, fill: '#0f172a', fontWeight: '700' }),
            new fabric.Textbox('Mô tả tính năng', { left: 34, top: 188, width: 190, fontSize: 13, fill: '#64748b' }),
            new fabric.Rect({ left: 268, top: 140, width: 210, height: 100, rx: 14, ry: 14, fill: '#fff7ed' }),
            new fabric.Textbox('★', { left: 280, top: 152, width: 30, fontSize: 26, fill: '#f97316' }),
            new fabric.Textbox('5-star', { left: 318, top: 154, width: 140, fontSize: 18, fill: '#0f172a', fontWeight: '700' }),
            new fabric.Textbox('Mô tả tính năng', { left: 280, top: 188, width: 190, fontSize: 13, fill: '#64748b' })
        ]);
    }

    // ── Social & Brand ────────────────────────────────────────────────────────

    function addComponentLogoStrip() {
        addComponentGroup([
            new fabric.Rect({ width: 560, height: 100, rx: 18, ry: 18, fill: '#f8fafc', stroke: '#e2e8f0', strokeWidth: 1 }),
            new fabric.Rect({ left: 28, top: 26, width: 110, height: 48, rx: 24, ry: 24, fill: '#0ea5e9' }),
            new fabric.Rect({ left: 158, top: 26, width: 110, height: 48, rx: 24, ry: 24, fill: '#111827' }),
            new fabric.Rect({ left: 288, top: 26, width: 110, height: 48, rx: 24, ry: 24, fill: '#22c55e' }),
            new fabric.Rect({ left: 418, top: 26, width: 110, height: 48, rx: 24, ry: 24, fill: '#f97316' })
        ]);
    }

    function addComponentTestimonial() {
        if (!ensureVipAccess('Testimonial Card')) return;
        addComponentGroup([
            new fabric.Rect({ width: 480, height: 200, rx: 22, ry: 22, fill: '#0f172a' }),
            new fabric.Textbox('★★★★★', { left: 28, top: 24, width: 160, fontSize: 22, fill: '#fbbf24' }),
            new fabric.Textbox('"This is the best product I have ever used. Completely changed how our team works."', { left: 28, top: 60, width: 420, fontSize: 18, fill: '#f8fafc', lineHeight: 1.5, fontFamily: 'Playfair Display' }),
            new fabric.Circle({ left: 28, top: 154, radius: 22, fill: '#7c3aed' }),
            new fabric.Textbox('Jane Doe', { left: 64, top: 154, width: 200, fontSize: 16, fill: '#f8fafc', fontWeight: '700' }),
            new fabric.Textbox('CEO, ExampleCo', { left: 64, top: 176, width: 200, fontSize: 14, fill: '#64748b' })
        ]);
    }

    // ── Frames & Mockups ──────────────────────────────────────────────────────

    function addComponentImageFrames() {
        addComponentGroup([
            new fabric.Rect({ width: 540, height: 180, rx: 24, ry: 24, fill: '#f8fafc' }),
            new fabric.Rect({ left: 26, top: 24, width: 146, height: 132, rx: 18, ry: 18, fill: '#dbeafe', stroke: '#60a5fa', strokeWidth: 1, name: 'Image placeholder' }),
            new fabric.Rect({ left: 196, top: 24, width: 146, height: 132, rx: 18, ry: 18, fill: '#ede9fe', stroke: '#a78bfa', strokeWidth: 1, name: 'Image placeholder' }),
            new fabric.Rect({ left: 366, top: 24, width: 146, height: 132, rx: 18, ry: 18, fill: '#fee2e2', stroke: '#fb7185', strokeWidth: 1, name: 'Image placeholder' })
        ]);
    }

    function addComponentMockup() {
        if (!ensureVipAccess('Mockup Card')) return;
        addComponentGroup([
            new fabric.Rect({ width: 520, height: 210, rx: 28, ry: 28, fill: '#0f172a' }),
            new fabric.Rect({ left: 34, top: 24, width: 210, height: 160, rx: 20, ry: 20, fill: '#1e293b' }),
            new fabric.Rect({ left: 52, top: 44, width: 174, height: 118, rx: 16, ry: 16, fill: '#dbeafe' }),
            new fabric.Textbox('App Mockup', { left: 286, top: 38, width: 180, fontSize: 30, fill: '#fff', fontWeight: '700' }),
            new fabric.Textbox('Perfect for product demo, showcase, or interface preview.', { left: 286, top: 90, width: 180, fontSize: 17, fill: '#cbd5e1' })
        ]);
    }

    // ── Tables ────────────────────────────────────────────────────────────────

    function addComponentTable() {
        if (!ensureVipAccess('Comparison Table')) return;
        addComponentGroup([
            new fabric.Rect({ width: 560, height: 200, rx: 20, ry: 20, fill: '#ffffff', stroke: '#cbd5e1', strokeWidth: 1 }),
            new fabric.Rect({ left: 20, top: 20, width: 520, height: 40, fill: '#eff6ff' }),
            new fabric.Textbox('Tính năng', { left: 36, top: 30, width: 120, fontSize: 16, fontWeight: '700' }),
            new fabric.Textbox('Free', { left: 228, top: 30, width: 80, fontSize: 16, fontWeight: '700' }),
            new fabric.Textbox('VIP', { left: 396, top: 30, width: 80, fontSize: 16, fontWeight: '700' }),
            new fabric.Textbox('Templates > 10 slides', { left: 36, top: 84, width: 170, fontSize: 15 }),
            new fabric.Textbox('No', { left: 238, top: 84, width: 40, fontSize: 15 }),
            new fabric.Textbox('Yes', { left: 400, top: 84, width: 50, fontSize: 15, fill: '#7c3aed', fontWeight: '700' })
        ]);
    }

    // ── People & Awards ───────────────────────────────────────────────────────

    function addComponentTeamMember() {
        if (!ensureVipAccess('Team Member Card')) return;
        addComponentGroup([
            new fabric.Rect({ width: 200, height: 250, rx: 22, ry: 22, fill: '#0f172a' }),
            new fabric.Circle({ left: 50, top: 22, radius: 50, fill: '#1e293b', stroke: '#7c3aed', strokeWidth: 2 }),
            new fabric.Textbox('?', { left: 82, top: 44, width: 36, fontSize: 40, fill: '#64748b', textAlign: 'center' }),
            new fabric.Textbox('Thành viên', { left: 10, top: 136, width: 180, fontSize: 18, fill: '#f8fafc', fontWeight: '700', textAlign: 'center' }),
            new fabric.Textbox('Job Title', { left: 10, top: 164, width: 180, fontSize: 15, fill: '#94a3b8', textAlign: 'center' }),
            new fabric.Textbox('Replace placeholder with\nheadshot photo', { left: 10, top: 200, width: 180, fontSize: 13, fill: '#475569', textAlign: 'center', lineHeight: 1.4 })
        ]);
    }

    function addComponentTrophyCard() {
        addComponentGroup([
            new fabric.Rect({ width: 300, height: 200, rx: 22, ry: 22, fill: '#1c1917' }),
            new fabric.Textbox('\u{1F3C6}', { left: 110, top: 20, width: 80, fontSize: 52, textAlign: 'center' }),
            new fabric.Textbox('Tên giải thưởng', { left: 20, top: 96, width: 260, fontSize: 22, fill: '#fde68a', fontWeight: '700', textAlign: 'center' }),
            new fabric.Textbox('Tên người nhận hoặc thành tích đạt được', { left: 20, top: 136, width: 260, fontSize: 15, fill: '#a8a29e', textAlign: 'center', lineHeight: 1.4 }),
            new fabric.Textbox('2026', { left: 110, top: 172, width: 80, fontSize: 16, fill: '#78716c', textAlign: 'center' })
        ]);
    }

    // ── Infographic ───────────────────────────────────────────────────────────

    function addComponentInfographicFlow() {
        if (!ensureVipAccess('Infographic Flow')) return;
        addComponentGroup([
            new fabric.Rect({ width: 560, height: 180, rx: 22, ry: 22, fill: '#f8fafc' }),
            new fabric.Circle({ left: 30, top: 50, radius: 44, fill: '#2563eb' }),
            new fabric.Textbox('01', { left: 50, top: 72, width: 48, fontSize: 24, fill: '#fff', fontWeight: '800', textAlign: 'center' }),
            new fabric.Textbox('▶', { left: 118, top: 76, width: 30, fontSize: 20, fill: '#cbd5e1', textAlign: 'center' }),
            new fabric.Circle({ left: 152, top: 50, radius: 44, fill: '#7c3aed' }),
            new fabric.Textbox('02', { left: 172, top: 72, width: 48, fontSize: 24, fill: '#fff', fontWeight: '800', textAlign: 'center' }),
            new fabric.Textbox('▶', { left: 240, top: 76, width: 30, fontSize: 20, fill: '#cbd5e1', textAlign: 'center' }),
            new fabric.Circle({ left: 274, top: 50, radius: 44, fill: '#059669' }),
            new fabric.Textbox('03', { left: 294, top: 72, width: 48, fontSize: 24, fill: '#fff', fontWeight: '800', textAlign: 'center' }),
            new fabric.Textbox('▶', { left: 362, top: 76, width: 30, fontSize: 20, fill: '#cbd5e1', textAlign: 'center' }),
            new fabric.Circle({ left: 396, top: 50, radius: 44, fill: '#f97316' }),
            new fabric.Textbox('04', { left: 416, top: 72, width: 48, fontSize: 24, fill: '#fff', fontWeight: '800', textAlign: 'center' }),
            new fabric.Textbox('Bước 1', { left: 30, top: 140, width: 90, fontSize: 14, fill: '#475569', textAlign: 'center' }),
            new fabric.Textbox('Bước 2', { left: 152, top: 140, width: 90, fontSize: 14, fill: '#475569', textAlign: 'center' }),
            new fabric.Textbox('Bước 3', { left: 274, top: 140, width: 90, fontSize: 14, fill: '#475569', textAlign: 'center' }),
            new fabric.Textbox('Bước 4', { left: 396, top: 140, width: 90, fontSize: 14, fill: '#475569', textAlign: 'center' })
        ]);
    }

    function addComponentCountdown() {
        addComponentGroup([
            new fabric.Rect({ width: 480, height: 130, rx: 20, ry: 20, fill: '#0f172a' }),
            new fabric.Rect({ left: 22, top: 22, width: 96, height: 86, rx: 14, ry: 14, fill: '#1e293b' }),
            new fabric.Textbox('00', { left: 22, top: 34, width: 96, fontSize: 36, fill: '#f8fafc', fontWeight: '800', textAlign: 'center' }),
            new fabric.Textbox('Ngày', { left: 22, top: 86, width: 96, fontSize: 14, fill: '#64748b', textAlign: 'center' }),
            new fabric.Rect({ left: 136, top: 22, width: 96, height: 86, rx: 14, ry: 14, fill: '#1e293b' }),
            new fabric.Textbox('00', { left: 136, top: 34, width: 96, fontSize: 36, fill: '#f8fafc', fontWeight: '800', textAlign: 'center' }),
            new fabric.Textbox('Giờ', { left: 136, top: 86, width: 96, fontSize: 14, fill: '#64748b', textAlign: 'center' }),
            new fabric.Rect({ left: 250, top: 22, width: 96, height: 86, rx: 14, ry: 14, fill: '#1e293b' }),
            new fabric.Textbox('00', { left: 250, top: 34, width: 96, fontSize: 36, fill: '#f8fafc', fontWeight: '800', textAlign: 'center' }),
            new fabric.Textbox('Minutes', { left: 250, top: 86, width: 96, fontSize: 14, fill: '#64748b', textAlign: 'center' }),
            new fabric.Rect({ left: 364, top: 22, width: 96, height: 86, rx: 14, ry: 14, fill: '#7c3aed' }),
            new fabric.Textbox('00', { left: 364, top: 34, width: 96, fontSize: 36, fill: '#fff', fontWeight: '800', textAlign: 'center' }),
            new fabric.Textbox('Seconds', { left: 364, top: 86, width: 96, fontSize: 14, fill: '#ddd6fe', textAlign: 'center' })
        ]);
    }

    // ── Decor ─────────────────────────────────────────────────────────────────

    function addComponentDivider() {
        addComponentGroup([
            new fabric.Rect({ width: 560, height: 18, rx: 9, ry: 9, fill: '#8b5cf6' }),
            new fabric.Rect({ left: 0, top: 0, width: 280, height: 18, rx: 9, ry: 9, fill: '#38bdf8' })
        ]);
    }

    // ── Drawer render ─────────────────────────────────────────────────────────

    function renderVipElementsDrawer() {
        const panel = document.getElementById('drawer-panel');
        if (!panel) return;

        // Don't blow away the freshly-built shapes panel. The main editor renders shapes
        // via _buildElementsPanel into #elem-categories; we just append a "VIP Components"
        // section underneath so both are accessible from the Elements drawer.
        const host = panel.querySelector('#elem-categories') || panel;

        // Remove any previous VIP block first to avoid duplicates when re-opening the drawer.
        const old = panel.querySelector('#vip-components-block');
        if (old) old.remove();

        const grouped = {};
        components.forEach(item => {
            if (!grouped[item.category]) grouped[item.category] = [];
            grouped[item.category].push(item);
        });

        const sections = Object.entries(grouped).map(([cat, items]) => {
            const cards = items.map(item => `
                <button type="button" data-component-title="${item.title}"
                    style="display:flex; align-items:center; gap:10px; padding:10px 12px; border-radius:10px;
                           border:1px solid rgba(148,163,184,0.18); background:rgba(30,41,59,0.6); cursor:pointer;
                           color:#f1f5f9; font-size:0.85rem; transition:background 0.15s; text-align:left;">
                    <span style="flex:1; font-weight:600;">${item.title}</span>
                    ${item.vip ? '<span style="padding:2px 7px; border-radius:999px; background:#4c1d95; color:#ddd6fe; font-size:0.65rem; font-weight:700;">VIP</span>' : ''}
                </button>
            `).join('');
            return `
                <div style="margin-top:14px;">
                    <div style="font-size:0.7rem; font-weight:700; color:#64748b; letter-spacing:0.06em;
                                text-transform:uppercase; padding:6px 4px 6px;">${cat}</div>
                    <div style="display:flex; flex-direction:column; gap:6px;">${cards}</div>
                </div>
            `;
        }).join('');

        const block = document.createElement('div');
        block.id = 'vip-components-block';
        block.style.cssText = 'margin-top:24px; padding-top:18px; border-top:1px solid rgba(148,163,184,0.15);';
        block.innerHTML = `
            <div style="font-size:0.95rem; font-weight:700; color:#f8fafc; padding:0 0 6px;">
                <i class="fa-solid fa-wand-magic-sparkles" style="color:#a78bfa; margin-right:6px;"></i>
                Components nâng cao
            </div>
            <div style="font-size:0.78rem; color:#64748b; padding:0 0 6px;">Bộ component được build sẵn — chèn nhanh.</div>
            ${sections}
            ${isVip ? '' : `
                <a href="/Billing/Upgrade"
                   style="display:block; margin-top:14px; text-align:center; padding:10px 14px; border-radius:12px;
                          background:linear-gradient(90deg,#7c3aed,#2563eb); color:#fff;
                          text-decoration:none; font-weight:700; font-size:0.85rem;">
                    Mở khoá Components VIP
                </a>
            `}
        `;
        host.appendChild(block);

        block.querySelectorAll('[data-component-title]').forEach(btn => {
            btn.addEventListener('click', () => {
                const item = components.find(x => x.title === btn.getAttribute('data-component-title'));
                if (!item) return;
                if (item.vip && !ensureVipAccess(item.title)) return;
                item.action();
            });
        });
    }

    function enhanceTemplateCards() {
        const originalRender = window.renderTemplateCards;
        if (typeof originalRender !== 'function') return;
        window.renderTemplateCards = function(grid, templates) {
            originalRender(grid, templates);
            if (!grid) return;
            const cards = Array.from(grid.querySelectorAll('.template-item'));
            cards.forEach((card, index) => {
                const tpl = templates[index];
                if (!tpl) return;
                const isPremium = !!tpl.isPremiumTemplate || !!tpl.IsPremiumTemplate || (tpl.slideCount && tpl.slideCount > 10) || (tpl.SlideCount && tpl.SlideCount > 10);
                const canUse = (tpl.canUse !== false) && (tpl.CanUse !== false) && (!isPremium || isVip);
                const thumb = card.querySelector('div');
                if (thumb && isPremium) {
                    // Avoid duplicating VIP badges if already present
                    if (!thumb.querySelector('.vip-badge')) {
                        const badge = document.createElement('div');
                        badge.className = 'vip-badge';
                        badge.style = 'position:absolute; top:10px; left:10px; padding:6px 10px; border-radius:999px; background:rgba(124,58,237,0.92); color:#fff; font-size:0.72rem; font-weight:700; z-index: 10;';
                        badge.textContent = 'VIP';
                        thumb.style.position = 'relative';
                        thumb.appendChild(badge);
                    }
                }
                if (!canUse) {
                    if (!card.querySelector('.vip-note')) {
                        const note = document.createElement('div');
                        note.className = 'vip-note';
                        note.style = 'padding:0 8px 10px; color:#7c3aed; font-size:0.78rem; font-weight:700;';
                        note.textContent = 'Unlock with VIP';
                        card.appendChild(note);
                    }
                }
            });
        };

        const originalApply = window.applyTemplateToPresentation;
        if (typeof originalApply === 'function') {
            window.applyTemplateToPresentation = function(tpl) {
                const isPremium = !!tpl.isPremiumTemplate || !!tpl.IsPremiumTemplate || (tpl.slideCount && tpl.slideCount > 10) || (tpl.SlideCount && tpl.SlideCount > 10);
                const canUse = (tpl.canUse !== false) && (tpl.CanUse !== false) && (!isPremium || isVip);
                if (!canUse) {
                    ensureVipAccess(tpl.title || tpl.Title || 'Mẫu Premium');
                    return;
                }
                originalApply(tpl);
            };
        }
    }

    function enhanceToggleDrawer() {
        const originalToggle = window.toggleDrawer;
        if (typeof originalToggle !== 'function') return;
        window.toggleDrawer = function(type) {
            originalToggle(type);
            if (type === 'elements') {
                renderVipElementsDrawer();
            }
        };
    }

    return {
        init() {
            enhanceTemplateCards();
            enhanceToggleDrawer();
        }
    };
})();

window.addEventListener('load', () => {
    SLIDIFY_VIP_EDITOR.init();
});
