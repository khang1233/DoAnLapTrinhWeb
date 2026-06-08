// SLIDIFY MVC - CANVAS ENGINE
const API_URL = '/Slide';
let canvas;
let presentationId = null;
let slideDataArray = [];
let currentSlideIndex = 0;
let clipboard = null;
let activeDrawer = null;
let autoSaveTimeout = null;
let undoStack = [];
let redoStack = [];
let isUndoRedoAction = false;
let isLoadingSlide = false;
let currentZoom = 1;
let presentationIndex = 0;

const SLIDIFY_BUILT_IN_TEMPLATES = createBuiltInTemplateLibrary();

function createBuiltInTemplateLibrary() {
    const text = (value, options = {}) => ({
        type: 'i-text',
        version: '5.3.0',
        text: value,
        left: options.left ?? 80,
        top: options.top ?? 80,
        width: options.width ?? 520,
        fill: options.fill ?? '#111827',
        fontFamily: options.fontFamily ?? 'Inter',
        fontSize: options.fontSize ?? 36,
        fontWeight: options.fontWeight ?? '600',
        lineHeight: options.lineHeight ?? 1.1,
        textAlign: options.textAlign ?? 'left',
        id: _generateId(),
        name: options.name ?? 'Editable text'
    });
    const rect = (options = {}) => ({
        type: 'rect',
        version: '5.3.0',
        left: options.left ?? 0,
        top: options.top ?? 0,
        width: options.width ?? 160,
        height: options.height ?? 90,
        rx: options.rx ?? 0,
        ry: options.ry ?? 0,
        fill: options.fill ?? '#e5e7eb',
        stroke: options.stroke ?? null,
        strokeWidth: options.strokeWidth ?? 0,
        opacity: options.opacity ?? 1,
        id: _generateId(),
        name: options.name ?? 'Shape'
    });
    const imageBox = (options = {}) => rect({ ...options, fill: options.fill ?? '#dbeafe', stroke: options.stroke ?? '#60a5fa', strokeWidth: 1, name: 'Image placeholder' });
    const slide = (backgroundColor, elements, backgroundImage = '') => ({
        backgroundColor,
        backgroundImage,
        elementsJson: JSON.stringify({ version: '5.3.0', objects: elements, background: backgroundColor })
    });

    return [
        {
            id: 'builtin-editorial',
            title: 'Editorial Magazine',
            category: 'PPT Master',
            thumbnailUrl: '/examples/ppt169_pritzker_architecture_review/images/cover_bg.png',
            slides: [
                slide('#f8f4ec', [
                    imageBox({ left: 430, top: 0, width: 370, height: 450, fill: '#d6d3d1' }),
                    text('BIG IDEA', { left: 62, top: 54, fontSize: 18, fill: '#a16207', fontWeight: '700' }),
                    text('Your Story\nStarts Here', { left: 58, top: 112, fontSize: 58, width: 340, fontFamily: 'Playfair Display', fill: '#1c1917', fontWeight: '700' }),
                    text('Replace this subtitle with your message. Every text box stays editable.', { left: 64, top: 300, fontSize: 18, width: 285, fill: '#57534e', fontWeight: '400' })
                ]),
                slide('#fbfaf7', [
                    text('01', { left: 58, top: 42, fontSize: 22, fill: '#a16207', fontWeight: '700' }),
                    text('Section Title', { left: 58, top: 96, fontSize: 48, fontFamily: 'Playfair Display', fill: '#1c1917' }),
                    text('Use this page for context, agenda, or an opening argument.', { left: 60, top: 178, fontSize: 20, width: 330, fill: '#57534e', fontWeight: '400' }),
                    imageBox({ left: 470, top: 58, width: 248, height: 315, fill: '#e7e5e4' })
                ])
            ]
        },
        {
            id: 'builtin-dashboard',
            title: 'Data Dashboard',
            category: 'PPT Master',
            thumbnailUrl: '/examples/ppt169_global_ai_capital_2026/images/cover_bg.png',
            slides: [
                slide('#07111f', [
                    text('Q2 PERFORMANCE', { left: 56, top: 44, fontSize: 16, fill: '#38bdf8', fontWeight: '700' }),
                    text('Metrics that\nmatter', { left: 54, top: 88, fontSize: 56, width: 380, fill: '#f8fafc', fontWeight: '800' }),
                    rect({ left: 480, top: 70, width: 250, height: 120, rx: 12, ry: 12, fill: '#10233f' }),
                    text('84%', { left: 510, top: 92, fontSize: 48, fill: '#22c55e', fontWeight: '800' }),
                    text('Growth this month', { left: 514, top: 150, fontSize: 18, fill: '#cbd5e1', fontWeight: '400' }),
                    rect({ left: 480, top: 220, width: 250, height: 120, rx: 12, ry: 12, fill: '#10233f' }),
                    text('$42K', { left: 510, top: 244, fontSize: 44, fill: '#fbbf24', fontWeight: '800' }),
                    text('Projected revenue', { left: 514, top: 302, fontSize: 18, fill: '#cbd5e1', fontWeight: '400' })
                ]),
                slide('#0f172a', [
                    text('Market Snapshot', { left: 52, top: 38, fontSize: 38, fill: '#f8fafc', fontWeight: '800' }),
                    rect({ left: 60, top: 128, width: 100, height: 220, fill: '#38bdf8' }),
                    rect({ left: 190, top: 188, width: 100, height: 160, fill: '#a78bfa' }),
                    rect({ left: 320, top: 92, width: 100, height: 256, fill: '#22c55e' }),
                    text('Edit chart labels and replace these bars with your numbers.', { left: 470, top: 148, fontSize: 26, width: 250, fill: '#e2e8f0', fontWeight: '500' })
                ])
            ]
        },
        {
            id: 'builtin-swiss',
            title: 'Swiss Grid',
            category: 'PPT Master',
            thumbnailUrl: '/examples/ppt169_swiss_grid_systems/images/cover_bg.png',
            slides: [
                slide('#f8fafc', [
                    rect({ left: 50, top: 40, width: 4, height: 340, fill: '#dc2626' }),
                    text('SWISS\nGRID\nSYSTEM', { left: 84, top: 54, fontSize: 60, width: 360, fill: '#111827', fontWeight: '800', lineHeight: 0.94 }),
                    text('A clean modular layout for class reports, portfolios, and business decks.', { left: 486, top: 82, fontSize: 22, width: 220, fill: '#374151', fontWeight: '400' }),
                    text('2026', { left: 486, top: 324, fontSize: 54, fill: '#dc2626', fontWeight: '800' })
                ]),
                slide('#ffffff', [
                    text('Three Column Layout', { left: 54, top: 42, fontSize: 36, fill: '#111827', fontWeight: '800' }),
                    text('01\nReplace this body text.', { left: 60, top: 142, fontSize: 22, width: 180, fill: '#374151', fontWeight: '500' }),
                    text('02\nDrop in your second point.', { left: 310, top: 142, fontSize: 22, width: 180, fill: '#374151', fontWeight: '500' }),
                    text('03\nFinish with the result.', { left: 560, top: 142, fontSize: 22, width: 180, fill: '#374151', fontWeight: '500' }),
                    rect({ left: 60, top: 320, width: 680, height: 6, fill: '#dc2626' })
                ])
            ]
        },

        // ===== BUSINESS PITCH =====
        {
            id: 'builtin-business-pitch',
            title: 'Business Pitch',
            category: 'PPT Master',
            isPremiumTemplate: false,
            thumbnailUrl: '/examples/ppt169_kimsoong_loyalty_programme/svg_final/slide_01_cover.svg',
            slides: [
                slide('#0a1628', [
                    rect({ left: 0, top: 0, width: 800, height: 450, fill: '#0a1628' }),
                    rect({ left: 0, top: 380, width: 800, height: 3, fill: '#d4af37' }),
                    text('BUSINESS PITCH', { left: 60, top: 54, fontSize: 14, fill: '#d4af37', fontWeight: '700', name: 'Editable label' }),
                    text('Your Company\nName Here', { left: 60, top: 100, fontSize: 64, width: 460, fill: '#f8fafc', fontWeight: '800', lineHeight: 1.05, fontFamily: 'Playfair Display' }),
                    text('A compelling one-line tagline goes right here.', { left: 62, top: 280, fontSize: 20, width: 420, fill: '#94a3b8', fontWeight: '400' }),
                    imageBox({ left: 560, top: 60, width: 200, height: 260, fill: '#1e3a5f' })
                ]),
                slide('#0f172a', [
                    rect({ left: 0, top: 0, width: 800, height: 450, fill: '#0f172a' }),
                    text('THE PROBLEM', { left: 60, top: 42, fontSize: 13, fill: '#d4af37', fontWeight: '700' }),
                    text('What pain are you solving?', { left: 60, top: 82, fontSize: 40, width: 480, fill: '#f8fafc', fontWeight: '700', fontFamily: 'Playfair Display' }),
                    rect({ left: 60, top: 166, width: 200, height: 110, rx: 14, fill: '#1e3a5f' }),
                    text('Challenge\n01', { left: 76, top: 184, fontSize: 20, fill: '#f8fafc', fontWeight: '600' }),
                    rect({ left: 290, top: 166, width: 200, height: 110, rx: 14, fill: '#1e3a5f' }),
                    text('Challenge\n02', { left: 306, top: 184, fontSize: 20, fill: '#f8fafc', fontWeight: '600' }),
                    rect({ left: 520, top: 166, width: 200, height: 110, rx: 14, fill: '#1e3a5f' }),
                    text('Challenge\n03', { left: 536, top: 184, fontSize: 20, fill: '#f8fafc', fontWeight: '600' }),
                    text('Replace each box with a specific pain point your audience experiences.', { left: 60, top: 310, fontSize: 17, width: 660, fill: '#64748b', fontWeight: '400' })
                ]),
                slide('#0a1628', [
                    text('OUR SOLUTION', { left: 60, top: 42, fontSize: 13, fill: '#d4af37', fontWeight: '700' }),
                    text('How we fix it.', { left: 60, top: 82, fontSize: 42, fill: '#f8fafc', fontWeight: '700', fontFamily: 'Playfair Display' }),
                    imageBox({ left: 60, top: 158, width: 320, height: 200, fill: '#1e3a5f' }),
                    text('Feature One', { left: 420, top: 170, fontSize: 22, fill: '#d4af37', fontWeight: '700' }),
                    text('Describe the core capability that solves the problem above.', { left: 420, top: 208, fontSize: 17, width: 300, fill: '#94a3b8', fontWeight: '400' }),
                    text('Feature Two', { left: 420, top: 280, fontSize: 22, fill: '#d4af37', fontWeight: '700' }),
                    text('A second differentiating capability.', { left: 420, top: 316, fontSize: 17, width: 280, fill: '#94a3b8', fontWeight: '400' })
                ]),
                slide('#0f172a', [
                    text('TRACTION', { left: 60, top: 42, fontSize: 13, fill: '#d4af37', fontWeight: '700' }),
                    text('Numbers that prove it.', { left: 60, top: 82, fontSize: 38, fill: '#f8fafc', fontWeight: '700', fontFamily: 'Playfair Display' }),
                    rect({ left: 60, top: 160, width: 190, height: 120, rx: 16, fill: '#1e3a5f' }),
                    text('1,200+', { left: 78, top: 180, fontSize: 38, fill: '#d4af37', fontWeight: '800' }),
                    text('Users', { left: 78, top: 228, fontSize: 16, fill: '#94a3b8' }),
                    rect({ left: 305, top: 160, width: 190, height: 120, rx: 16, fill: '#1e3a5f' }),
                    text('$84K', { left: 323, top: 180, fontSize: 38, fill: '#10b981', fontWeight: '800' }),
                    text('Revenue', { left: 323, top: 228, fontSize: 16, fill: '#94a3b8' }),
                    rect({ left: 550, top: 160, width: 190, height: 120, rx: 16, fill: '#1e3a5f' }),
                    text('96%', { left: 568, top: 180, fontSize: 38, fill: '#818cf8', fontWeight: '800' }),
                    text('Retention', { left: 568, top: 228, fontSize: 16, fill: '#94a3b8' }),
                    text('Replace these numbers with your real metrics.', { left: 60, top: 320, fontSize: 17, fill: '#64748b', fontWeight: '400' })
                ]),
                slide('#0a1628', [
                    text('THE TEAM', { left: 60, top: 42, fontSize: 13, fill: '#d4af37', fontWeight: '700' }),
                    text('Who will make this happen.', { left: 60, top: 82, fontSize: 38, fill: '#f8fafc', fontWeight: '700', fontFamily: 'Playfair Display' }),
                    imageBox({ left: 60, top: 160, width: 130, height: 130, rx: 65, fill: '#1e3a5f' }),
                    text('Name 01', { left: 60, top: 306, fontSize: 18, fill: '#f8fafc', fontWeight: '700' }),
                    text('Co-Founder & CEO', { left: 60, top: 330, fontSize: 14, fill: '#64748b' }),
                    imageBox({ left: 250, top: 160, width: 130, height: 130, rx: 65, fill: '#1e3a5f' }),
                    text('Name 02', { left: 250, top: 306, fontSize: 18, fill: '#f8fafc', fontWeight: '700' }),
                    text('Co-Founder & CTO', { left: 250, top: 330, fontSize: 14, fill: '#64748b' }),
                    imageBox({ left: 440, top: 160, width: 130, height: 130, rx: 65, fill: '#1e3a5f' }),
                    text('Name 03', { left: 440, top: 306, fontSize: 18, fill: '#f8fafc', fontWeight: '700' }),
                    text('Head of Growth', { left: 440, top: 330, fontSize: 14, fill: '#64748b' }),
                    text('Replace placeholder images by selecting each circle and uploading a photo.', { left: 60, top: 390, fontSize: 14, fill: '#475569', width: 540 })
                ]),
                slide('#0f172a', [
                    text('THE ASK', { left: 60, top: 42, fontSize: 13, fill: '#d4af37', fontWeight: '700' }),
                    text('We are raising\n$500K pre-seed.', { left: 60, top: 82, fontSize: 48, width: 460, fill: '#f8fafc', fontWeight: '800', fontFamily: 'Playfair Display', lineHeight: 1.1 }),
                    text('Replace this with your actual raise amount and use of funds.', { left: 60, top: 240, fontSize: 18, width: 400, fill: '#94a3b8', fontWeight: '400' }),
                    rect({ left: 60, top: 294, width: 200, height: 60, rx: 30, fill: '#d4af37' }),
                    text('Contact Us', { left: 98, top: 310, fontSize: 20, fill: '#0a1628', fontWeight: '700' }),
                    text('your@email.com', { left: 290, top: 314, fontSize: 17, fill: '#64748b' })
                ])
            ]
        },

        // ===== PRODUCT LAUNCH =====
        {
            id: 'builtin-product-launch',
            title: 'Product Launch',
            category: 'PPT Master',
            isPremiumTemplate: false,
            thumbnailUrl: '/examples/ppt169_glassmorphism_demo/svg_final/01_cover.svg',
            slides: [
                slide('#030712', [
                    rect({ left: 0, top: 0, width: 800, height: 450, fill: '#030712' }),
                    rect({ left: 0, top: 0, width: 800, height: 450, fill: '#06b6d4', opacity: 0.07 }),
                    text('NEW PRODUCT', { left: 60, top: 48, fontSize: 13, fill: '#06b6d4', fontWeight: '700' }),
                    text('Launch\nSomething\nBig.', { left: 60, top: 96, fontSize: 68, width: 420, fill: '#f0f9ff', fontWeight: '800', lineHeight: 0.95 }),
                    text('Replace with your product tagline. Make it punchy.', { left: 62, top: 320, fontSize: 19, width: 340, fill: '#94a3b8' }),
                    rect({ left: 62, top: 374, width: 160, height: 48, rx: 24, fill: '#06b6d4' }),
                    text('Get Started', { left: 94, top: 389, fontSize: 18, fill: '#030712', fontWeight: '700' }),
                    imageBox({ left: 520, top: 40, width: 240, height: 360, rx: 24, fill: '#0c2a3a' })
                ]),
                slide('#04111f', [
                    text('THE PROBLEM', { left: 60, top: 40, fontSize: 13, fill: '#06b6d4', fontWeight: '700' }),
                    text('What are we fixing?', { left: 60, top: 80, fontSize: 40, fill: '#f0f9ff', fontWeight: '700' }),
                    rect({ left: 60, top: 152, width: 680, height: 2, fill: '#06b6d4', opacity: 0.3 }),
                    text('Pain Point A', { left: 60, top: 172, fontSize: 22, fill: '#06b6d4', fontWeight: '700' }),
                    text('Describe the issue your users face today.', { left: 60, top: 202, fontSize: 17, fill: '#94a3b8', width: 580 }),
                    rect({ left: 60, top: 244, width: 680, height: 2, fill: '#06b6d4', opacity: 0.15 }),
                    text('Pain Point B', { left: 60, top: 262, fontSize: 22, fill: '#06b6d4', fontWeight: '700' }),
                    text('A second frustration your product eliminates.', { left: 60, top: 292, fontSize: 17, fill: '#94a3b8', width: 580 }),
                    rect({ left: 60, top: 334, width: 680, height: 2, fill: '#06b6d4', opacity: 0.15 }),
                    text('Pain Point C', { left: 60, top: 352, fontSize: 22, fill: '#06b6d4', fontWeight: '700' }),
                    text('The third issue that makes existing solutions insufficient.', { left: 60, top: 382, fontSize: 17, fill: '#94a3b8', width: 580 })
                ]),
                slide('#030712', [
                    text('KEY FEATURES', { left: 60, top: 40, fontSize: 13, fill: '#06b6d4', fontWeight: '700' }),
                    text('Built for results.', { left: 60, top: 78, fontSize: 40, fill: '#f0f9ff', fontWeight: '700' }),
                    rect({ left: 60, top: 148, width: 196, height: 160, rx: 18, fill: '#0c2a3a', stroke: '#06b6d4', strokeWidth: 1 }),
                    text('Feature 01', { left: 78, top: 170, fontSize: 18, fill: '#06b6d4', fontWeight: '700' }),
                    text('Replace with a core capability.', { left: 78, top: 200, fontSize: 15, fill: '#94a3b8', width: 160 }),
                    rect({ left: 302, top: 148, width: 196, height: 160, rx: 18, fill: '#0c2a3a', stroke: '#06b6d4', strokeWidth: 1 }),
                    text('Feature 02', { left: 320, top: 170, fontSize: 18, fill: '#06b6d4', fontWeight: '700' }),
                    text('Replace with a second capability.', { left: 320, top: 200, fontSize: 15, fill: '#94a3b8', width: 160 }),
                    rect({ left: 544, top: 148, width: 196, height: 160, rx: 18, fill: '#0c2a3a', stroke: '#06b6d4', strokeWidth: 1 }),
                    text('Feature 03', { left: 562, top: 170, fontSize: 18, fill: '#06b6d4', fontWeight: '700' }),
                    text('Replace with a third capability.', { left: 562, top: 200, fontSize: 15, fill: '#94a3b8', width: 160 }),
                    text('Drag each feature card to reorder. Edit text to match your product.', { left: 60, top: 342, fontSize: 15, fill: '#475569', width: 600 })
                ]),
                slide('#04111f', [
                    text('PRICING', { left: 60, top: 40, fontSize: 13, fill: '#06b6d4', fontWeight: '700' }),
                    text('Simple. Fair.', { left: 60, top: 78, fontSize: 42, fill: '#f0f9ff', fontWeight: '700' }),
                    rect({ left: 60, top: 150, width: 200, height: 200, rx: 18, fill: '#0c2a3a' }),
                    text('Free', { left: 80, top: 172, fontSize: 24, fill: '#94a3b8', fontWeight: '700' }),
                    text('$0 / mo', { left: 80, top: 206, fontSize: 30, fill: '#f0f9ff', fontWeight: '800' }),
                    text('âœ“ Feature A\nâœ“ Feature B', { left: 80, top: 252, fontSize: 15, fill: '#64748b', width: 160 }),
                    rect({ left: 300, top: 150, width: 200, height: 200, rx: 18, fill: '#06b6d4' }),
                    text('Pro', { left: 320, top: 172, fontSize: 24, fill: '#030712', fontWeight: '700' }),
                    text('$29 / mo', { left: 320, top: 206, fontSize: 30, fill: '#030712', fontWeight: '800' }),
                    text('âœ“ Everything\nâœ“ Priority support', { left: 320, top: 252, fontSize: 15, fill: '#0c2a3a', width: 160 }),
                    rect({ left: 540, top: 150, width: 200, height: 200, rx: 18, fill: '#0c2a3a', stroke: '#06b6d4', strokeWidth: 1 }),
                    text('Enterprise', { left: 560, top: 172, fontSize: 22, fill: '#94a3b8', fontWeight: '700' }),
                    text('Custom', { left: 560, top: 206, fontSize: 30, fill: '#f0f9ff', fontWeight: '800' }),
                    text('âœ“ All Pro features\nâœ“ Dedicated CSM', { left: 560, top: 252, fontSize: 15, fill: '#64748b', width: 170 })
                ])
            ]
        },

        // ===== PORTFOLIO DARK =====
        {
            id: 'builtin-portfolio-dark',
            title: 'Portfolio Dark',
            category: 'PPT Master',
            isPremiumTemplate: false,
            thumbnailUrl: '/examples/ppt169_brutalist_ai_newspaper_2026/svg_final/01_cover.svg',
            slides: [
                slide('#0a0a0a', [
                    rect({ left: 0, top: 0, width: 800, height: 450, fill: '#0a0a0a' }),
                    text('PORTFOLIO', { left: 60, top: 50, fontSize: 12, fill: '#737373', fontWeight: '700', name: 'Label' }),
                    text('Your Name', { left: 60, top: 100, fontSize: 80, fill: '#fafafa', fontWeight: '800', lineHeight: 0.9 }),
                    rect({ left: 60, top: 244, width: 320, height: 2, fill: '#ffffff', opacity: 0.15 }),
                    text('Designer · Strategist · Storyteller', { left: 60, top: 262, fontSize: 18, fill: '#737373', fontWeight: '400' }),
                    text('2026', { left: 680, top: 400, fontSize: 18, fill: '#404040', fontWeight: '700' })
                ]),
                slide('#111111', [
                    text('ABOUT', { left: 60, top: 50, fontSize: 12, fill: '#737373', fontWeight: '700' }),
                    text('The short version.', { left: 60, top: 90, fontSize: 40, fill: '#fafafa', fontWeight: '700' }),
                    rect({ left: 60, top: 158, width: 3, height: 200, fill: '#ffffff', opacity: 0.2 }),
                    text('Replace this with a short bio. Who are you, what do you do, and what makes your work distinctive? Keep it to 2-3 sentences.', { left: 84, top: 162, fontSize: 18, width: 440, fill: '#d4d4d4', fontWeight: '400', lineHeight: 1.6 }),
                    imageBox({ left: 570, top: 100, width: 180, height: 240, rx: 16, fill: '#1c1c1c' })
                ]),
                slide('#0a0a0a', [
                    text('SELECTED WORK', { left: 60, top: 44, fontSize: 12, fill: '#737373', fontWeight: '700' }),
                    imageBox({ left: 60, top: 88, width: 340, height: 200, rx: 8, fill: '#1c1c1c' }),
                    text('Project Title', { left: 60, top: 302, fontSize: 18, fill: '#fafafa', fontWeight: '700' }),
                    text('Category · Year', { left: 60, top: 326, fontSize: 14, fill: '#737373' }),
                    imageBox({ left: 420, top: 88, width: 320, height: 200, rx: 8, fill: '#1c1c1c' }),
                    text('Project Title', { left: 420, top: 302, fontSize: 18, fill: '#fafafa', fontWeight: '700' }),
                    text('Category · Year', { left: 420, top: 326, fontSize: 14, fill: '#737373' })
                ]),
                slide('#111111', [
                    text('CONTACT', { left: 60, top: 50, fontSize: 12, fill: '#737373', fontWeight: '700' }),
                    text("Let's work\ntogether.", { left: 60, top: 96, fontSize: 56, fill: '#fafafa', fontWeight: '800', lineHeight: 1.05, fontFamily: 'Playfair Display' }),
                    text('your@email.com', { left: 62, top: 278, fontSize: 20, fill: '#a3a3a3' }),
                    text('linkedin.com/in/yourname', { left: 62, top: 316, fontSize: 20, fill: '#a3a3a3' }),
                    text('yourwebsite.com', { left: 62, top: 354, fontSize: 20, fill: '#a3a3a3' })
                ])
            ]
        },

        // ===== ACADEMIC RESEARCH =====
        {
            id: 'builtin-academic',
            title: 'Academic Research',
            category: 'PPT Master',
            isPremiumTemplate: false,
            thumbnailUrl: '/examples/ppt169_attention_is_all_you_need/svg_final/01_cover.svg',
            slides: [
                slide('#ffffff', [
                    rect({ left: 0, top: 0, width: 800, height: 8, fill: '#1d4ed8' }),
                    text('UNIVERSITY / INSTITUTE', { left: 60, top: 34, fontSize: 12, fill: '#1d4ed8', fontWeight: '700' }),
                    text('Research Paper\nTitle Goes Here', { left: 60, top: 80, fontSize: 52, width: 540, fill: '#0f172a', fontWeight: '700', lineHeight: 1.1 }),
                    rect({ left: 60, top: 224, width: 540, height: 1, fill: '#e2e8f0' }),
                    text('Author Name · Co-Author Name', { left: 60, top: 244, fontSize: 17, fill: '#475569' }),
                    text('Conference / Journal Name · 2026', { left: 60, top: 272, fontSize: 15, fill: '#94a3b8' }),
                    imageBox({ left: 640, top: 60, width: 120, height: 80, fill: '#eff6ff' })
                ]),
                slide('#f8fafc', [
                    rect({ left: 0, top: 0, width: 800, height: 8, fill: '#1d4ed8' }),
                    text('ABSTRACT', { left: 60, top: 38, fontSize: 12, fill: '#1d4ed8', fontWeight: '700' }),
                    text('Replace with your abstract. Summarize the research question, methodology, findings, and significance in 3-4 sentences. This is often the only part reviewers read first.', { left: 60, top: 86, fontSize: 19, width: 680, fill: '#1e293b', fontWeight: '400', lineHeight: 1.7 }),
                    rect({ left: 60, top: 234, width: 680, height: 1, fill: '#e2e8f0' }),
                    text('Keywords:', { left: 60, top: 258, fontSize: 15, fill: '#1d4ed8', fontWeight: '700' }),
                    text('keyword one, keyword two, keyword three, keyword four', { left: 164, top: 258, fontSize: 15, fill: '#475569', width: 500 })
                ]),
                slide('#ffffff', [
                    rect({ left: 0, top: 0, width: 800, height: 8, fill: '#1d4ed8' }),
                    text('METHODOLOGY', { left: 60, top: 38, fontSize: 12, fill: '#1d4ed8', fontWeight: '700' }),
                    text('How the research was done.', { left: 60, top: 76, fontSize: 34, fill: '#0f172a', fontWeight: '700' }),
                    rect({ left: 60, top: 148, width: 196, height: 180, rx: 10, fill: '#eff6ff', stroke: '#bfdbfe', strokeWidth: 1 }),
                    text('Step 1\nData Collection', { left: 76, top: 168, fontSize: 18, fill: '#1d4ed8', fontWeight: '600', width: 164 }),
                    text('Describe how data was gathered.', { left: 76, top: 224, fontSize: 14, fill: '#475569', width: 160 }),
                    rect({ left: 302, top: 148, width: 196, height: 180, rx: 10, fill: '#eff6ff', stroke: '#bfdbfe', strokeWidth: 1 }),
                    text('Step 2\nAnalysis', { left: 318, top: 168, fontSize: 18, fill: '#1d4ed8', fontWeight: '600', width: 164 }),
                    text('Explain your analysis approach.', { left: 318, top: 224, fontSize: 14, fill: '#475569', width: 160 }),
                    rect({ left: 544, top: 148, width: 196, height: 180, rx: 10, fill: '#eff6ff', stroke: '#bfdbfe', strokeWidth: 1 }),
                    text('Step 3\nValidation', { left: 560, top: 168, fontSize: 18, fill: '#1d4ed8', fontWeight: '600', width: 164 }),
                    text('Describe how results were validated.', { left: 560, top: 224, fontSize: 14, fill: '#475569', width: 164 })
                ]),
                slide('#f8fafc', [
                    rect({ left: 0, top: 0, width: 800, height: 8, fill: '#1d4ed8' }),
                    text('RESULTS', { left: 60, top: 38, fontSize: 12, fill: '#1d4ed8', fontWeight: '700' }),
                    text('Key findings from the study.', { left: 60, top: 76, fontSize: 34, fill: '#0f172a', fontWeight: '700' }),
                    imageBox({ left: 60, top: 146, width: 380, height: 220, rx: 8, fill: '#e8f0fe' }),
                    text('Figure 1: Caption goes here', { left: 60, top: 376, fontSize: 13, fill: '#94a3b8', fontStyle: 'italic' }),
                    text('Finding 1', { left: 480, top: 152, fontSize: 20, fill: '#1d4ed8', fontWeight: '700' }),
                    text('Describe what this finding means for your hypothesis.', { left: 480, top: 180, fontSize: 15, fill: '#475569', width: 270 }),
                    text('Finding 2', { left: 480, top: 254, fontSize: 20, fill: '#1d4ed8', fontWeight: '700' }),
                    text('Describe a second key finding from your data.', { left: 480, top: 282, fontSize: 15, fill: '#475569', width: 270 })
                ]),
                slide('#ffffff', [
                    rect({ left: 0, top: 0, width: 800, height: 8, fill: '#1d4ed8' }),
                    text('CONCLUSION', { left: 60, top: 38, fontSize: 12, fill: '#1d4ed8', fontWeight: '700' }),
                    text('What this research contributes.', { left: 60, top: 76, fontSize: 32, fill: '#0f172a', fontWeight: '700' }),
                    text('Replace with your conclusion. Summarize the contribution to the field, practical implications, and limitations. Point to future research directions.', { left: 60, top: 140, fontSize: 18, width: 660, fill: '#1e293b', fontWeight: '400', lineHeight: 1.7 }),
                    rect({ left: 60, top: 282, width: 680, height: 1, fill: '#e2e8f0' }),
                    text('REFERENCES', { left: 60, top: 308, fontSize: 12, fill: '#94a3b8', fontWeight: '700' }),
                    text('[1] Author A et al. (2024). Title of Paper. Journal Name.\n[2] Author B et al. (2023). Another Referenced Work. Conference.', { left: 60, top: 334, fontSize: 13, fill: '#94a3b8', width: 660, lineHeight: 1.5 })
                ])
            ]
        },

        // ===== MARKETING CAMPAIGN =====
        {
            id: 'builtin-marketing',
            title: 'Marketing Campaign',
            category: 'PPT Master',
            isPremiumTemplate: false,
            thumbnailUrl: '/examples/ppt169_sugar_rush_memphis/svg_final/01_cover.svg',
            slides: [
                slide('#fff1f2', [
                    rect({ left: 0, top: 0, width: 800, height: 450, fill: '#fff1f2' }),
                    rect({ left: 0, top: 0, width: 400, height: 450, fill: '#f43f5e' }),
                    text('CAMPAIGN', { left: 42, top: 56, fontSize: 12, fill: '#fda4af', fontWeight: '700' }),
                    text('Make\nNoise.', { left: 42, top: 98, fontSize: 70, fill: '#ffffff', fontWeight: '800', lineHeight: 0.92, fontFamily: 'Playfair Display' }),
                    text('Replace with your campaign tagline.', { left: 42, top: 300, fontSize: 18, fill: '#fda4af', width: 300 }),
                    text('BRIEF', { left: 470, top: 56, fontSize: 12, fill: '#f43f5e', fontWeight: '700' }),
                    text('Campaign\nOverview', { left: 470, top: 96, fontSize: 34, fill: '#0f172a', fontWeight: '700', lineHeight: 1.1 }),
                    text('Replace with a 2-sentence campaign brief. Who is the audience and what action do you want?', { left: 472, top: 200, fontSize: 16, fill: '#6b7280', width: 282, lineHeight: 1.6 })
                ]),
                slide('#ffffff', [
                    text('TARGET AUDIENCE', { left: 60, top: 44, fontSize: 12, fill: '#f43f5e', fontWeight: '700' }),
                    text('Who are we talking to?', { left: 60, top: 80, fontSize: 36, fill: '#0f172a', fontWeight: '700' }),
                    rect({ left: 60, top: 152, width: 320, height: 220, rx: 16, fill: '#fff1f2' }),
                    imageBox({ left: 80, top: 170, width: 100, height: 100, rx: 50, fill: '#fecdd3' }),
                    text('Persona Name', { left: 80, top: 286, fontSize: 18, fill: '#0f172a', fontWeight: '700' }),
                    text('Age range · Location · Interests', { left: 80, top: 314, fontSize: 14, fill: '#9f1239', width: 280 }),
                    text('GOALS', { left: 430, top: 152, fontSize: 12, fill: '#f43f5e', fontWeight: '700' }),
                    text('âœ“ Replace this with goal 1\nâœ“ Replace this with goal 2\nâœ“ Replace this with goal 3', { left: 430, top: 178, fontSize: 17, fill: '#374151', lineHeight: 2.0, width: 310 })
                ]),
                slide('#fff1f2', [
                    text('CHANNELS', { left: 60, top: 44, fontSize: 12, fill: '#f43f5e', fontWeight: '700' }),
                    text('Where we show up.', { left: 60, top: 80, fontSize: 36, fill: '#0f172a', fontWeight: '700' }),
                    rect({ left: 60, top: 152, width: 160, height: 100, rx: 14, fill: '#f43f5e' }),
                    text('Social\nMedia', { left: 80, top: 172, fontSize: 22, fill: '#fff', fontWeight: '700' }),
                    rect({ left: 244, top: 152, width: 160, height: 100, rx: 14, fill: '#fb7185' }),
                    text('Email\nCampaign', { left: 264, top: 172, fontSize: 22, fill: '#fff', fontWeight: '700' }),
                    rect({ left: 428, top: 152, width: 160, height: 100, rx: 14, fill: '#fda4af' }),
                    text('Paid\nAds', { left: 448, top: 172, fontSize: 22, fill: '#9f1239', fontWeight: '700' }),
                    rect({ left: 60, top: 276, width: 528, height: 100, rx: 14, fill: '#ffffff' }),
                    text('Add or replace channels to match your actual campaign mix.', { left: 80, top: 314, fontSize: 17, fill: '#6b7280', width: 490 })
                ]),
                slide('#ffffff', [
                    text('KPIs', { left: 60, top: 44, fontSize: 12, fill: '#f43f5e', fontWeight: '700' }),
                    text('How we measure success.', { left: 60, top: 80, fontSize: 36, fill: '#0f172a', fontWeight: '700' }),
                    rect({ left: 60, top: 152, width: 180, height: 130, rx: 16, fill: '#fff1f2' }),
                    text('10K', { left: 78, top: 172, fontSize: 38, fill: '#f43f5e', fontWeight: '800' }),
                    text('New Leads', { left: 78, top: 222, fontSize: 16, fill: '#6b7280' }),
                    rect({ left: 264, top: 152, width: 180, height: 130, rx: 16, fill: '#fff1f2' }),
                    text('5.5%', { left: 282, top: 172, fontSize: 38, fill: '#f43f5e', fontWeight: '800' }),
                    text('Conversion', { left: 282, top: 222, fontSize: 16, fill: '#6b7280' }),
                    rect({ left: 468, top: 152, width: 180, height: 130, rx: 16, fill: '#fff1f2' }),
                    text('$12', { left: 486, top: 172, fontSize: 38, fill: '#f43f5e', fontWeight: '800' }),
                    text('Cost per Lead', { left: 486, top: 222, fontSize: 16, fill: '#6b7280' }),
                    text('Replace these numbers with your actual campaign targets.', { left: 60, top: 320, fontSize: 16, fill: '#9ca3af', width: 580 })
                ])
            ]
        },

        // ===== STARTUP DECK (VIP - 12 slides) =====
        {
            id: 'builtin-startup-deck',
            title: 'Startup Deck',
            category: 'PPT Master',
            isPremiumTemplate: true,
            thumbnailUrl: '/examples/ppt169_glassmorphism_demo/svg_final/01_cover.svg',
            slides: [
                slide('#0d0d1a', [
                    rect({ left: 0, top: 0, width: 800, height: 450, fill: '#0d0d1a' }),
                    rect({ left: 200, top: -100, width: 500, height: 500, rx: 250, fill: '#7c3aed', opacity: 0.12 }),
                    text('SERIES A · 2026', { left: 60, top: 48, fontSize: 12, fill: '#a78bfa', fontWeight: '700' }),
                    text('Your\nStartup\nName.', { left: 60, top: 94, fontSize: 72, width: 430, fill: '#faf5ff', fontWeight: '800', lineHeight: 0.92 }),
                    text('One powerful sentence that captures your mission.', { left: 62, top: 334, fontSize: 18, width: 380, fill: '#c4b5fd', fontWeight: '400' }),
                    imageBox({ left: 560, top: 60, width: 200, height: 300, rx: 24, fill: '#1e1b4b' })
                ]),
                slide('#0f0f1e', [
                    text('THE PROBLEM', { left: 60, top: 42, fontSize: 12, fill: '#a78bfa', fontWeight: '700' }),
                    text('$500B problem.\nNobody solved it yet.', { left: 60, top: 82, fontSize: 44, width: 480, fill: '#faf5ff', fontWeight: '700', lineHeight: 1.1, fontFamily: 'Playfair Display' }),
                    rect({ left: 60, top: 232, width: 680, height: 1, fill: '#7c3aed', opacity: 0.3 }),
                    text('Pain A', { left: 60, top: 256, fontSize: 20, fill: '#a78bfa', fontWeight: '700' }),
                    text('Describe the first major pain point your customers face.', { left: 60, top: 282, fontSize: 16, fill: '#94a3b8', width: 640 }),
                    text('Pain B', { left: 60, top: 326, fontSize: 20, fill: '#a78bfa', fontWeight: '700' }),
                    text('Describe a second critical pain point causing real financial or productivity loss.', { left: 60, top: 352, fontSize: 16, fill: '#94a3b8', width: 640 })
                ]),
                slide('#0d0d1a', [
                    text('OUR SOLUTION', { left: 60, top: 42, fontSize: 12, fill: '#a78bfa', fontWeight: '700' }),
                    text('The only platform\nthat does this.', { left: 60, top: 82, fontSize: 44, width: 480, fill: '#faf5ff', fontWeight: '700', lineHeight: 1.1 }),
                    imageBox({ left: 60, top: 176, width: 380, height: 200, rx: 16, fill: '#1e1b4b' }),
                    text('Unique Value 1', { left: 476, top: 188, fontSize: 20, fill: '#a78bfa', fontWeight: '700' }),
                    text('Explain your first differentiator.', { left: 476, top: 218, fontSize: 15, fill: '#94a3b8', width: 264 }),
                    text('Unique Value 2', { left: 476, top: 288, fontSize: 20, fill: '#a78bfa', fontWeight: '700' }),
                    text('Explain your second differentiator.', { left: 476, top: 318, fontSize: 15, fill: '#94a3b8', width: 264 })
                ]),
                slide('#0f0f1e', [
                    text('MARKET SIZE', { left: 60, top: 42, fontSize: 12, fill: '#a78bfa', fontWeight: '700' }),
                    text('A massive, growing market.', { left: 60, top: 80, fontSize: 38, fill: '#faf5ff', fontWeight: '700' }),
                    rect({ left: 60, top: 152, width: 200, height: 200, rx: 100, fill: '#7c3aed', opacity: 0.15 }),
                    rect({ left: 100, top: 192, width: 120, height: 120, rx: 60, fill: '#7c3aed', opacity: 0.25 }),
                    rect({ left: 130, top: 222, width: 60, height: 60, rx: 30, fill: '#7c3aed' }),
                    text('TAM\n$500B', { left: 60, top: 368, fontSize: 14, fill: '#64748b', width: 200, textAlign: 'center' }),
                    text('SAM', { left: 310, top: 180, fontSize: 22, fill: '#a78bfa', fontWeight: '700' }),
                    text('$50B addressable\ntoday', { left: 310, top: 212, fontSize: 16, fill: '#94a3b8' }),
                    text('SOM', { left: 310, top: 278, fontSize: 22, fill: '#a78bfa', fontWeight: '700' }),
                    text('$2B with our\ncurrent go-to-market', { left: 310, top: 310, fontSize: 16, fill: '#94a3b8' }),
                    text('Replace all numbers with sourced market research data.', { left: 60, top: 410, fontSize: 13, fill: '#4b5563' })
                ]),
                slide('#0d0d1a', [
                    text('TRACTION', { left: 60, top: 42, fontSize: 12, fill: '#a78bfa', fontWeight: '700' }),
                    text("We're growing fast.", { left: 60, top: 80, fontSize: 38, fill: '#faf5ff', fontWeight: '700' }),
                    rect({ left: 60, top: 152, width: 180, height: 120, rx: 16, fill: '#1e1b4b' }),
                    text('500+', { left: 78, top: 172, fontSize: 36, fill: '#a78bfa', fontWeight: '800' }),
                    text('Customers', { left: 78, top: 216, fontSize: 15, fill: '#64748b' }),
                    rect({ left: 270, top: 152, width: 180, height: 120, rx: 16, fill: '#1e1b4b' }),
                    text('$120K', { left: 288, top: 172, fontSize: 36, fill: '#10b981', fontWeight: '800' }),
                    text('MRR', { left: 288, top: 216, fontSize: 15, fill: '#64748b' }),
                    rect({ left: 480, top: 152, width: 180, height: 120, rx: 16, fill: '#1e1b4b' }),
                    text('3x', { left: 498, top: 172, fontSize: 36, fill: '#f59e0b', fontWeight: '800' }),
                    text('YoY Growth', { left: 498, top: 216, fontSize: 15, fill: '#64748b' }),
                    rect({ left: 60, top: 56, width: 680, height: 70, rx: 0, fill: '#ffffff', opacity: 0 }),
                    text('Replace these with your actual metrics. Include logos of notable customers if possible.', { left: 60, top: 310, fontSize: 15, fill: '#4b5563', width: 600 })
                ]),
                slide('#0f0f1e', [
                    text('BUSINESS MODEL', { left: 60, top: 42, fontSize: 12, fill: '#a78bfa', fontWeight: '700' }),
                    text('How we make money.', { left: 60, top: 80, fontSize: 38, fill: '#faf5ff', fontWeight: '700' }),
                    rect({ left: 60, top: 152, width: 300, height: 160, rx: 16, fill: '#1e1b4b', stroke: '#7c3aed', strokeWidth: 1 }),
                    text('SaaS Subscription', { left: 80, top: 172, fontSize: 20, fill: '#a78bfa', fontWeight: '700' }),
                    text('$29 / user / month\nContract: monthly or annual', { left: 80, top: 206, fontSize: 15, fill: '#94a3b8', lineHeight: 1.7 }),
                    rect({ left: 396, top: 152, width: 300, height: 160, rx: 16, fill: '#1e1b4b' }),
                    text('Enterprise License', { left: 416, top: 172, fontSize: 20, fill: '#a78bfa', fontWeight: '700' }),
                    text('Custom pricing\nIncludes dedicated support', { left: 416, top: 206, fontSize: 15, fill: '#94a3b8', lineHeight: 1.7 }),
                    text('LTV/CAC target: 5:1 · Payback period: 8 months', { left: 60, top: 344, fontSize: 16, fill: '#64748b', width: 580 })
                ]),
                slide('#0d0d1a', [
                    text('COMPETITION', { left: 60, top: 42, fontSize: 12, fill: '#a78bfa', fontWeight: '700' }),
                    text('Why we win.', { left: 60, top: 80, fontSize: 38, fill: '#faf5ff', fontWeight: '700' }),
                    rect({ left: 60, top: 152, width: 680, height: 52, rx: 8, fill: '#1e1b4b' }),
                    text('Feature', { left: 80, top: 168, fontSize: 15, fill: '#64748b', fontWeight: '600', width: 180 }),
                    text('Us', { left: 320, top: 168, fontSize: 15, fill: '#a78bfa', fontWeight: '800', textAlign: 'center', width: 80 }),
                    text('Competitor A', { left: 460, top: 168, fontSize: 13, fill: '#64748b', width: 120, textAlign: 'center' }),
                    text('Competitor B', { left: 600, top: 168, fontSize: 13, fill: '#64748b', width: 120, textAlign: 'center' }),
                    rect({ left: 60, top: 220, width: 680, height: 40, rx: 0, fill: '#7c3aed', opacity: 0.05 }),
                    text('Feature A', { left: 80, top: 232, fontSize: 14, fill: '#c4b5fd' }),
                    text('âœ“', { left: 340, top: 232, fontSize: 16, fill: '#10b981', fontWeight: '800', width: 40, textAlign: 'center' }),
                    text('âœ“', { left: 480, top: 232, fontSize: 16, fill: '#4b5563', width: 80, textAlign: 'center' }),
                    text('â€”', { left: 620, top: 232, fontSize: 16, fill: '#4b5563', width: 80, textAlign: 'center' }),
                    text('Feature B', { left: 80, top: 278, fontSize: 14, fill: '#c4b5fd' }),
                    text('âœ“', { left: 340, top: 278, fontSize: 16, fill: '#10b981', fontWeight: '800', width: 40, textAlign: 'center' }),
                    text('â€”', { left: 480, top: 278, fontSize: 16, fill: '#4b5563', width: 80, textAlign: 'center' }),
                    text('â€”', { left: 620, top: 278, fontSize: 16, fill: '#4b5563', width: 80, textAlign: 'center' }),
                    text('Feature C', { left: 80, top: 324, fontSize: 14, fill: '#c4b5fd' }),
                    text('âœ“', { left: 340, top: 324, fontSize: 16, fill: '#10b981', fontWeight: '800', width: 40, textAlign: 'center' }),
                    text('â€”', { left: 480, top: 324, fontSize: 16, fill: '#4b5563', width: 80, textAlign: 'center' }),
                    text('âœ“', { left: 620, top: 324, fontSize: 16, fill: '#4b5563', width: 80, textAlign: 'center' }),
                    text('Edit this table to reflect your actual competitive differentiation.', { left: 60, top: 390, fontSize: 13, fill: '#4b5563' })
                ]),
                slide('#0f0f1e', [
                    text('THE TEAM', { left: 60, top: 42, fontSize: 12, fill: '#a78bfa', fontWeight: '700' }),
                    text('Built by the right people.', { left: 60, top: 80, fontSize: 38, fill: '#faf5ff', fontWeight: '700' }),
                    imageBox({ left: 60, top: 156, width: 120, height: 120, rx: 60, fill: '#1e1b4b' }),
                    text('Founder Name', { left: 60, top: 290, fontSize: 17, fill: '#faf5ff', fontWeight: '700' }),
                    text('CEO · Ex-Google', { left: 60, top: 316, fontSize: 13, fill: '#6d28d9' }),
                    imageBox({ left: 236, top: 156, width: 120, height: 120, rx: 60, fill: '#1e1b4b' }),
                    text('Co-Founder', { left: 236, top: 290, fontSize: 17, fill: '#faf5ff', fontWeight: '700' }),
                    text('CTO · Ex-Meta', { left: 236, top: 316, fontSize: 13, fill: '#6d28d9' }),
                    imageBox({ left: 412, top: 156, width: 120, height: 120, rx: 60, fill: '#1e1b4b' }),
                    text('VP Growth', { left: 412, top: 290, fontSize: 17, fill: '#faf5ff', fontWeight: '700' }),
                    text('Growth · Ex-Stripe', { left: 412, top: 316, fontSize: 13, fill: '#6d28d9' }),
                    imageBox({ left: 588, top: 156, width: 120, height: 120, rx: 60, fill: '#1e1b4b' }),
                    text('Advisor', { left: 588, top: 290, fontSize: 17, fill: '#faf5ff', fontWeight: '700' }),
                    text('Board · Partner @ VC', { left: 588, top: 316, fontSize: 13, fill: '#6d28d9' }),
                    text('Replace photos by selecting each circle and uploading a headshot.', { left: 60, top: 390, fontSize: 13, fill: '#4b5563' })
                ]),
                slide('#0d0d1a', [
                    text('ROADMAP', { left: 60, top: 42, fontSize: 12, fill: '#a78bfa', fontWeight: '700' }),
                    text('What we build next.', { left: 60, top: 80, fontSize: 38, fill: '#faf5ff', fontWeight: '700' }),
                    rect({ left: 60, top: 164, width: 680, height: 4, rx: 2, fill: '#7c3aed', opacity: 0.3 }),
                    rect({ left: 60, top: 152, width: 20, height: 20, rx: 10, fill: '#a78bfa' }),
                    text('Q1 2026', { left: 46, top: 186, fontSize: 13, fill: '#a78bfa', width: 80, textAlign: 'center' }),
                    text('MVP Launch', { left: 36, top: 210, fontSize: 14, fill: '#94a3b8', width: 100, textAlign: 'center' }),
                    rect({ left: 220, top: 152, width: 20, height: 20, rx: 10, fill: '#a78bfa' }),
                    text('Q2 2026', { left: 204, top: 186, fontSize: 13, fill: '#a78bfa', width: 80, textAlign: 'center' }),
                    text('100 Customers', { left: 194, top: 210, fontSize: 14, fill: '#94a3b8', width: 100, textAlign: 'center' }),
                    rect({ left: 380, top: 152, width: 20, height: 20, rx: 10, fill: '#7c3aed' }),
                    text('Q3 2026', { left: 364, top: 186, fontSize: 13, fill: '#7c3aed', width: 80, textAlign: 'center' }),
                    text('Series A Close', { left: 354, top: 210, fontSize: 14, fill: '#6b7280', width: 100, textAlign: 'center' }),
                    rect({ left: 540, top: 152, width: 20, height: 20, rx: 10, fill: '#4c1d95', opacity: 0.6 }),
                    text('Q4 2026', { left: 522, top: 186, fontSize: 13, fill: '#6d28d9', width: 80, textAlign: 'center' }),
                    text('Scale to 1K+', { left: 512, top: 210, fontSize: 14, fill: '#6b7280', width: 100, textAlign: 'center' }),
                    text('Edit milestones to match your real roadmap.', { left: 60, top: 310, fontSize: 15, fill: '#4b5563', width: 580 })
                ]),
                slide('#0f0f1e', [
                    text('FINANCIALS', { left: 60, top: 42, fontSize: 12, fill: '#a78bfa', fontWeight: '700' }),
                    text('3-year projection.', { left: 60, top: 80, fontSize: 38, fill: '#faf5ff', fontWeight: '700' }),
                    rect({ left: 60, top: 152, width: 100, height: 180, rx: 6, fill: '#4c1d95' }),
                    text('Y1', { left: 85, top: 344, fontSize: 13, fill: '#94a3b8', width: 60, textAlign: 'center' }),
                    text('$240K', { left: 75, top: 160, fontSize: 14, fill: '#c4b5fd', width: 70, textAlign: 'center' }),
                    rect({ left: 210, top: 102, width: 100, height: 230, rx: 6, fill: '#7c3aed' }),
                    text('Y2', { left: 235, top: 344, fontSize: 13, fill: '#94a3b8', width: 60, textAlign: 'center' }),
                    text('$1.2M', { left: 215, top: 110, fontSize: 14, fill: '#c4b5fd', width: 90, textAlign: 'center' }),
                    rect({ left: 360, top: 52, width: 100, height: 280, rx: 6, fill: '#a78bfa' }),
                    text('Y3', { left: 385, top: 344, fontSize: 13, fill: '#94a3b8', width: 60, textAlign: 'center' }),
                    text('$5M', { left: 365, top: 60, fontSize: 14, fill: '#1e1b4b', width: 90, textAlign: 'center', fontWeight: '700' }),
                    text('Revenue projections based on $29 ACV × projected customer count.\nReplace with your own model.', { left: 500, top: 180, fontSize: 15, fill: '#64748b', width: 240, lineHeight: 1.6 })
                ]),
                slide('#0d0d1a', [
                    text('THE ASK', { left: 60, top: 42, fontSize: 12, fill: '#a78bfa', fontWeight: '700' }),
                    text('Raising $2M\nSeed Round.', { left: 60, top: 82, fontSize: 54, width: 420, fill: '#faf5ff', fontWeight: '800', lineHeight: 1.05, fontFamily: 'Playfair Display' }),
                    text('Use of funds:', { left: 62, top: 264, fontSize: 16, fill: '#a78bfa', fontWeight: '700' }),
                    text('40% · Engineering\n30% · Sales & Marketing\n20% · Operations\n10% · Reserve', { left: 62, top: 294, fontSize: 16, fill: '#94a3b8', lineHeight: 1.8, width: 300 }),
                    rect({ left: 500, top: 180, width: 220, height: 200, rx: 20, fill: '#1e1b4b', stroke: '#7c3aed', strokeWidth: 1 }),
                    text('18-month\nrunway', { left: 538, top: 214, fontSize: 24, fill: '#a78bfa', fontWeight: '700', lineHeight: 1.2 }),
                    text('with this round', { left: 538, top: 284, fontSize: 15, fill: '#64748b' })
                ]),
                slide('#0f0f1e', [
                    text('CONTACT', { left: 60, top: 42, fontSize: 12, fill: '#a78bfa', fontWeight: '700' }),
                    text("Let's build\ntogether.", { left: 60, top: 82, fontSize: 60, fill: '#faf5ff', fontWeight: '800', lineHeight: 1.05, fontFamily: 'Playfair Display' }),
                    text('your@startup.com', { left: 62, top: 284, fontSize: 20, fill: '#c4b5fd' }),
                    text('calendly.com/your-name', { left: 62, top: 322, fontSize: 18, fill: '#6d28d9' }),
                    text('linkedin.com/company/startup', { left: 62, top: 360, fontSize: 18, fill: '#6d28d9' }),
                    rect({ left: 500, top: 160, width: 220, height: 230, rx: 20, fill: '#1e1b4b' }),
                    text('Thank you\nfor your\ntime.', { left: 524, top: 200, fontSize: 28, fill: '#faf5ff', fontWeight: '700', lineHeight: 1.2, fontFamily: 'Playfair Display' })
                ])
            ]
        },
        // Extra visual templates using local example artwork.
        ...createVisualTemplateGallery(text, rect, imageBox, slide)
    ];
}

function createVisualTemplateGallery(text, rect, imageBox, slide) {
    const photoSlide = (bg, photo, elements) => slide(bg, elements, photo);
    return [
        { id:'gallery-vietnam-travel', title:'Du lich Viet Nam - Anh sang xanh', category:'Du lich', thumbnailUrl:'/examples/ppt169_xanh_la_trang_gian_di_du_lich_viet_nam_trinh_bay/svg_final/01_slide_01.svg', slides:[ photoSlide('#e8f7ef','/examples/ppt169_xanh_la_trang_gian_di_du_lich_viet_nam_trinh_bay/svg_final/01_slide_01.svg',[rect({left:42,top:44,width:310,height:356,rx:28,fill:'rgba(255,255,255,.82)'}),text('TOUR MIEN BAC',{left:72,top:78,fontSize:17,fill:'#15803d',fontWeight:'800'}),text('Ha Giang\nNinh Binh\nHa Long',{left:70,top:126,fontSize:54,width:270,fill:'#064e3b',fontWeight:'900',lineHeight:.95}),text('Thay anh, gia tour va lich trinh de tao poster du lich nhu Canva.',{left:74,top:318,fontSize:18,width:245,fill:'#166534'})]) ] },
        { id:'gallery-food-menu', title:'Menu tra sua & do an nhanh', category:'Menu', thumbnailUrl:'/examples/ppt169_sugar_rush_memphis/svg_final/01_cover.svg', slides:[ photoSlide('#fff1f2','/examples/ppt169_sugar_rush_memphis/images/cover_bg.png',[text('SUGAR RUSH',{left:54,top:46,fontSize:62,fill:'#ef4444',fontWeight:'900'}),text('Menu khai truong',{left:58,top:126,fontSize:25,fill:'#f97316',fontWeight:'700'}),rect({left:54,top:210,width:310,height:150,rx:28,fill:'rgba(255,255,255,.9)'}),text('Tra dao cam sa   29K\nMatcha latte       35K\nBanh mini set      49K',{left:82,top:236,fontSize:23,fill:'#7f1d1d',lineHeight:1.45})]) ] },
        { id:'gallery-fashion-lookbook', title:'Fashion Weekly Lookbook', category:'Thoi trang', thumbnailUrl:'/examples/ppt169_fashion_weekly_digest/images/cover_hermes.jpg', slides:[ photoSlide('#111827','/examples/ppt169_fashion_weekly_digest/images/cover_hermes.jpg',[rect({left:0,top:0,width:800,height:450,fill:'rgba(0,0,0,.38)'}),text('FASHION\nWEEKLY',{left:48,top:44,fontSize:70,width:360,fill:'#fff7ed',fontWeight:'900',lineHeight:.9,fontFamily:'Playfair Display'}),text('Lookbook / Campaign / Moodboard',{left:52,top:330,fontSize:21,fill:'#fed7aa'})]) ] },
        { id:'gallery-vietnam-event', title:'Su kien le hoi Viet Nam', category:'Su kien', thumbnailUrl:'/examples/ppt169_o_va_vang_truyen_thong_kham_pha_van_hoa_viet_nam_presentation/svg_final/01_slide_01.svg', slides:[ photoSlide('#b91c1c','/examples/ppt169_o_va_vang_truyen_thong_kham_pha_van_hoa_viet_nam_presentation/svg_final/01_slide_01.svg',[rect({left:0,top:0,width:800,height:450,fill:'rgba(127,29,29,.45)'}),text('CHAO MUNG',{left:54,top:54,fontSize:36,fill:'#fde68a',fontWeight:'900'}),text('Ngay hoi\nVan hoa\nViet Nam',{left:54,top:110,fontSize:62,width:430,fill:'#fff7ed',fontWeight:'900',lineHeight:.95})]) ] },
        { id:'gallery-resume', title:'CV ca nhan hien dai', category:'Ho so', thumbnailUrl:'/examples/ppt169_lora_hu_2021/svg_final/01_cover.svg', slides:[ photoSlide('#f8fafc','/examples/ppt169_lora_hu_2021/images/cover_hero.png',[rect({left:430,top:0,width:370,height:450,fill:'rgba(15,23,42,.72)'}),text('NGUYEN\nMINH ANH',{left:52,top:62,fontSize:58,width:340,fill:'#0f172a',fontWeight:'900'}),text('Brand Designer / Marketing Executive',{left:56,top:220,fontSize:21,fill:'#475569'}),text('Portfolio 2026',{left:56,top:344,fontSize:24,fill:'#be123c',fontWeight:'800'})]) ] },
        { id:'gallery-education-kids', title:'Bai giang tre em ruc ro', category:'Giao duc', thumbnailUrl:'/examples/ppt169_brown_and_beige_simple_modern_creative_brainstorm_presentation/svg_final/01_slide_01.svg', slides:[ slide('#dff7ff',[rect({left:36,top:40,width:728,height:360,rx:40,fill:'#fff7ad'}),text('LOP HOC\nSIEU VUI',{left:74,top:74,fontSize:68,width:360,fill:'#f97316',fontWeight:'900',lineHeight:.92}),text('Keo tha hinh anh, doi bai hoc, dung cho thuyet trinh mam non/tieu hoc.',{left:78,top:260,fontSize:22,width:320,fill:'#0f766e'}),imageBox({left:500,top:82,width:190,height:245,rx:32,fill:'#93c5fd'})]) ] }
,
        ...createMoreVisualTemplates(text, rect, imageBox, slide, photoSlide)    ];
}

function createMoreVisualTemplates(text, rect, imageBox, slide, photoSlide) {
    const t = (id, title, category, thumb, bg, accent, headline, sub) => ({
        id, title, category, thumbnailUrl: thumb,
        slides: [
            photoSlide(bg, thumb, [
                rect({ left: 0, top: 0, width: 800, height: 450, fill: 'rgba(0,0,0,.22)' }),
                rect({ left: 42, top: 42, width: 330, height: 366, rx: 28, fill: 'rgba(255,255,255,.88)' }),
                rect({ left: 64, top: 68, width: 84, height: 8, rx: 4, fill: accent }),
                text(category.toUpperCase(), { left: 64, top: 92, fontSize: 14, fill: accent, fontWeight: '900' }),
                text(headline, { left: 62, top: 132, fontSize: 48, width: 280, fill: '#111827', fontWeight: '900', lineHeight: .98, fontFamily: 'Playfair Display' }),
                text(sub, { left: 66, top: 300, fontSize: 18, width: 250, fill: '#374151', lineHeight: 1.25 })
            ]),
            slide('#ffffff', [
                text('Bo cuc noi dung ro rang', { left: 54, top: 42, fontSize: 38, fill: '#111827', fontWeight: '900' }),
                rect({ left: 60, top: 122, width: 200, height: 240, rx: 24, fill: accent, opacity: .16 }),
                rect({ left: 300, top: 122, width: 200, height: 240, rx: 24, fill: accent, opacity: .28 }),
                rect({ left: 540, top: 122, width: 200, height: 240, rx: 24, fill: accent, opacity: .42 }),
                text('01\nTieu de muc', { left: 84, top: 154, fontSize: 25, width: 150, fill: '#111827', fontWeight: '800' }),
                text('02\nNoi dung chinh', { left: 324, top: 154, fontSize: 25, width: 150, fill: '#111827', fontWeight: '800' }),
                text('03\nKet qua / CTA', { left: 564, top: 154, fontSize: 25, width: 150, fill: '#111827', fontWeight: '800' }),
                text('Tat ca text deu sua duoc, anh nen co san tu kho local.', { left: 60, top: 392, fontSize: 18, fill: '#64748b' })
            ])
        ]
    });
    return [
        t('gallery-ai-agent','AI Agent Report','Cong nghe','/examples/ppt169_building_effective_agents/svg_final/01_cover.svg','#0b1020','#38bdf8','AI Agents\nPlaybook','Bao cao AI, automation, workflow va demo san pham.'),
        t('gallery-k8s-blueprint','Kubernetes Blueprint','Cong nghe','/examples/ppt169_kubernetes_blueprint_2026/svg_final/01_cover.svg','#07111f','#60a5fa','Cloud Native\nBlueprint','Deck ky thuat cho DevOps, platform va architecture.'),
        t('gallery-newspaper-ai','Brutalist AI Newspaper','Tin tuc','/examples/ppt169_brutalist_ai_newspaper_2026/svg_final/01_cover.svg','#f5f5f4','#ef4444','AI News\nSpecial','Phong cach bao giay, manh, hop trend.'),
        t('gallery-bookstore-zine','Indie Bookstore Zine','Van hoa','/examples/ppt169_indie_bookstore_zine_guide/svg_final/01_cover.svg','#f4ead7','#92400e','Bookstore\nGuide','Mau zine doc la cho review sach, culture, workshop.'),
        t('gallery-glassmorphism','Glassmorphism Product','San pham','/examples/ppt169_glassmorphism_demo/svg_final/01_cover.svg','#030712','#06b6d4','Glass UI\nLaunch','Ra mat app, SaaS, landing page va proposal.'),
        t('gallery-transformer-paper','Research Paper Modern','Hoc thuat','/examples/ppt169_attention_is_all_you_need/svg_final/01_cover.svg','#111827','#f59e0b','Research\nSummary','Tom tat paper, seminar, khoa hoc may tinh.'),
        t('gallery-architecture','Architecture Portfolio','Kien truc','/examples/ppt169_pritzker_2026/svg_final/01_cover.svg','#e7e5e4','#a16207','Architecture\nReview','Portfolio kien truc, noi that, du an nha o.'),
        t('gallery-urban-renewal','High Rise Renewal','Bat dong san','/examples/ppt169_high_rise_renewal/svg_final/01_cover.svg','#0f172a','#fbbf24','Urban\nRenewal','Thuyet trinh bat dong san, xay dung, quy hoach.'),
        t('gallery-ai-capital','Global AI Capital','Kinh doanh','/examples/ppt169_global_ai_capital_2026/svg_final/01_cover.svg','#020617','#22c55e','AI Capital\n2026','Bao cao thi truong, dau tu, data dashboard.'),
        t('gallery-plant-dye','Plant Dye Colors','Thu cong','/examples/ppt169_liziqi_plant_dye_colors/svg_final/01_cover.svg','#f7f2df','#16a34a','Natural\nColors','Mau thu cong, lifestyle, handmade va san pham xanh.'),
        t('gallery-cinema-moodboard','Cinema Moodboard','Dien anh','/examples/ppt169_bai_thuyet_trinh_moodboard_phim_truyen_hinh_va_ien_anh_xanh_la_vang_ong_trang_phong_cach_toi_gian_ien_anh/svg_final/01_slide_01.svg','#111827','#eab308','Film\nMoodboard','Pitch phim, visual direction, treatment.'),
        t('gallery-black-gold','Black Gold History','Sang trong','/examples/ppt169_black_and_gold_modern_project_history_presentation/svg_final/01_slide_01.svg','#09090b','#d4af37','Premium\nStory','Ho so cong ty, lich su du an, gala.'),
        t('gallery-simple-business','Simple Business Plan','Doanh nghiep','/examples/ppt169_bai_thuyet_trinh_ke_hoach_kinh_doanh_en_trang_on_gian/svg_final/01_slide_01.svg','#f8fafc','#2563eb','Business\nPlan','Ke hoach kinh doanh sach, ro, de trinh bay.'),
        t('gallery-creative-brainstorm','Creative Brainstorm','Sang tao','/examples/ppt169_brown_and_beige_simple_modern_creative_brainstorm_presentation/svg_final/01_slide_01.svg','#f5efe6','#ea580c','Brainstorm\nBoard','Workshop, idea mapping, team activity.'),
        t('gallery-green-report','Green Research Report','Giao duc','/examples/ppt169_xanh_la_truyen_thong_bai_tap_nhom_nghien_cuu_tac_gia_van_hoc_bai_thuyet_trinh/svg_final/01_slide_01.svg','#ecfdf5','#15803d','Group\nReport','Bai tap nhom, tac gia, lich su, van hoc.'),
        t('gallery-ad-campaign','Advertising Pitch','Marketing','/examples/ppt169_o_va_en_khoi_uong_cheo_thang_may_ban_thuyet_trinh_ban_quang_cao_chieu_hang/svg_final/01_slide_01.svg','#fff7ed','#f97316','Campaign\nPitch','De xuat chien dich quang cao, social ads.'),
        t('gallery-home-design','Home Design Trends','Noi that','/examples/ppt169_home_design_trends_2026/images/book_cover1.png','#fafaf9','#78716c','Home Design\nTrends','Moodboard noi that, catalogue, magazine.'),
        t('gallery-image-showcase','Image Text Showcase','Anh san pham','/examples/ppt169_image_text_showcase/images/p01_cover.png','#111827','#ec4899','Image\nShowcase','Trung bay san pham, anh nghe thuat, portfolio.'),
        t('gallery-linhuiyin','Lin Huiyin Architect','Tieu su','/examples/ppt169_lin_huiyin_architect/images/cover_bg.png','#f8f4ec','#b45309','Biography\nDeck','Mau tieu su, nhan vat, van hoa, lich su.'),
        t('gallery-cangzhuo','Eastern Culture Deck','Van hoa','/examples/ppt169_cangzhuo/svg_final/01_cover.svg','#fef3c7','#b91c1c','Cultural\nStory','Chu de van hoa A Dong, nghe thuat, du lich.'),
        t('gallery-modern-transition','Project Transition Plan','Du an','/examples/ppt169_anh_duong_am_xanh_la_da_quang_tim_chuyen_nghiep_mau_chuyen_tiep_ke_hoach_du_an_ban_thuyet_trinh_kinh_doanh/svg_final/01_slide_01.svg','#ecfeff','#0891b2','Project\nPlan','Ke hoach du an, timeline, milestone.'),
        t('gallery-green-minimal','Green Minimal Slides','Toi gian','/examples/ppt169_xanh_la_trang_chu_lon_in_am_ban_thuyet_trinh_on_gian/svg_final/01_slide_01.svg','#f0fdf4','#16a34a','Clean\nSlides','Mau toi gian dung cho moi chu de nhanh gon.')
    ];
}
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
    initAlignmentGuides();
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

    // Zoom with Ctrl+Mouse Wheel
    const canvasContainer = document.getElementById('canvas-container');
    if (canvasContainer) {
        canvasContainer.addEventListener('wheel', (e) => {
            if (e.ctrlKey) {
                e.preventDefault();
                const delta = e.deltaY > 0 ? -0.05 : 0.05;
                setZoom(currentZoom + delta);
            }
        }, { passive: false });
    }
}

/* --- AUTO SAVE SYSTEM (DEBOUNCED - Pure Manual Save) --- */
let saveStateDebounceTimeout = null;
function triggerAutoSave() {
    // Show 'Chưa lưu' immediately to give visual feedback
    const statusEl = document.getElementById('save-status');
    if(statusEl) statusEl.innerHTML = '<i class="fa-solid fa-circle-dot text-warning"></i> Chưa lưu';

    clearTimeout(saveStateDebounceTimeout);
    saveStateDebounceTimeout = setTimeout(() => {
        saveCurrentSlideStateToMemory();
        saveState();
    }, 300); // 300ms debounce prevents CPU-blocking serialization lags during typing or dragging!
}

function saveCurrentSlideStateToMemory() {
    try {
        if(!slideDataArray || !slideDataArray[currentSlideIndex]) return;
        
        const json = canvas.toJSON(['id', 'name', 'selectable', 'hasControls']);
        json.canvasWidth = canvas.width;
        json.canvasHeight = canvas.height;
        slideDataArray[currentSlideIndex].ElementsJson = JSON.stringify(json);
        
        // Support gradient backgrounds safe serialization
        if (canvas.backgroundColor && typeof canvas.backgroundColor === 'object') {
            slideDataArray[currentSlideIndex].BackgroundColor = canvas.backgroundColor.colorStops?.[0]?.color || '#ffffff';
        } else {
            slideDataArray[currentSlideIndex].BackgroundColor = canvas.backgroundColor || '#ffffff';
        }
        
        // Keep track of background image to save to DB
        if (canvas.backgroundImage && typeof canvas.backgroundImage.getSrc === 'function') {
            slideDataArray[currentSlideIndex].BackgroundImage = canvas.backgroundImage.getSrc();
        } else if (!canvas.backgroundImage) {
            slideDataArray[currentSlideIndex].BackgroundImage = '';
        }
    } catch (e) {
        console.error("Error in saveCurrentSlideStateToMemory:", e);
    }
}

async function savePresentationToBackend(isManual = false) {
    saveCurrentSlideStateToMemory();
    
    let thumbnailDataUrl = "";
    if (isManual) {
        // Generate Thumbnail using an off-screen StaticCanvas to prevent main canvas corruption/freezing
        try {
            const tempCanvasEl = document.createElement('canvas');
            tempCanvasEl.width = 800;
            tempCanvasEl.height = 450;
            const tempCanvas = new fabric.StaticCanvas(tempCanvasEl);
            
            const jsonData = canvas.toJSON(['id', 'name', 'selectable', 'hasControls']);
            await new Promise((resolve) => {
                tempCanvas.loadFromJSON(jsonData, () => {
                    tempCanvas.renderAll();
                    resolve();
                });
            });
            
            thumbnailDataUrl = tempCanvas.toDataURL({
                format: 'jpeg',
                quality: 0.3,
                multiplier: 0.5
            });
            
            tempCanvas.dispose();
        } catch (e) {
            console.warn("Could not generate thumbnail on temp canvas:", e);
        }
    }

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
            if(statusEl) statusEl.innerHTML = '<i class="fa-solid fa-triangle-exclamation text-danger"></i> LỀ—i lưu';
        }
    } catch(err) {
        console.error("Save error:", err);
    }
}

function savePresentationManually() {
    clearTimeout(autoSaveTimeout);
    savePresentationToBackend(true); // Pass true to generate and save the thumbnail
    showToast('Đã lưu bản thuyết trình', 'success');
}

/* --- UNDO / REDO SYSTEM --- */
function saveState() {
    if (isUndoRedoAction || isLoadingSlide) return;
    const json = JSON.stringify(canvas.toJSON(['id', 'name', 'selectable', 'hasControls']));
    undoStack.push(json);
    if (undoStack.length > 50) undoStack.shift();
    redoStack = [];
    updateUndoRedoButtons();
}

function undo() {
    if (undoStack.length <= 1) return;
    isUndoRedoAction = true;
    redoStack.push(undoStack.pop());
    const prevState = undoStack[undoStack.length - 1];
    canvas.loadFromJSON(JSON.parse(prevState), () => {
        canvas.renderAll();
        isUndoRedoAction = false;
        updateUndoRedoButtons();
        saveCurrentSlideStateToMemory();
    });
}

function redo() {
    if (redoStack.length === 0) return;
    isUndoRedoAction = true;
    const nextState = redoStack.pop();
    undoStack.push(nextState);
    canvas.loadFromJSON(JSON.parse(nextState), () => {
        canvas.renderAll();
        isUndoRedoAction = false;
        updateUndoRedoButtons();
        saveCurrentSlideStateToMemory();
    });
}

function updateUndoRedoButtons() {
    const undoBtn = document.getElementById('btn-undo');
    const redoBtn = document.getElementById('btn-redo');
    if (undoBtn) undoBtn.style.opacity = undoStack.length <= 1 ? '0.4' : '1';
    if (redoBtn) redoBtn.style.opacity = redoStack.length === 0 ? '0.4' : '1';
}

/* --- ZOOM SYSTEM --- */
function setZoom(level) {
    currentZoom = Math.max(0.25, Math.min(3, level));
    const wrapper = document.querySelector('.canvas-wrapper');
    if (wrapper) {
        wrapper.style.transform = `scale(${currentZoom})`;
        wrapper.style.transformOrigin = 'center center';
    }
    updateZoomDisplay();
}

function zoomIn() { setZoom(currentZoom + 0.1); }
function zoomOut() { setZoom(currentZoom - 0.1); }
function zoomToFit() {
    const container = document.getElementById('canvas-container');
    const wrapper = document.querySelector('.canvas-wrapper');
    if (!container || !wrapper || !canvas) return;

    const pad = 48; // padding around slide
    const containerW = container.clientWidth - pad;
    const containerH = container.clientHeight - pad;

    if (containerW <= 0 || containerH <= 0) return;

    const slideW = canvas.width || 800;
    const slideH = canvas.height || 450;

    const scaleX = containerW / slideW;
    const scaleY = containerH / slideH;
    const scale = Math.min(scaleX, scaleY);

    const optimalZoom = Math.max(0.3, Math.min(2.0, scale));
    setZoom(optimalZoom);
}

window.addEventListener('resize', () => {
    const presentationOverlay = document.getElementById('presentation-overlay');
    if (!presentationOverlay || presentationOverlay.style.display !== 'flex') {
        zoomToFit();
    }
});

function updateZoomDisplay() {
    const el = document.getElementById('zoom-level');
    if (el) el.textContent = Math.round(currentZoom * 100) + '%';
    const slider = document.getElementById('zoom-slider');
    if (slider) slider.value = currentZoom;
}

/* --- PRESENTATION MODE --- */
function startPresentation() {
    saveCurrentSlideStateToMemory();
    presentationIndex = currentSlideIndex;
    const overlay = document.getElementById('presentation-overlay');
    if (!overlay) return;
    overlay.style.display = 'flex';
    // Fullscreen on the overlay itself so the slide always fills the screen.
    (overlay.requestFullscreen || document.documentElement.requestFullscreen)?.call(overlay).catch(() => {
        document.documentElement.requestFullscreen?.().catch(() => {});
    });
    renderPresentationSlide();
    document.addEventListener('keydown', presentationKeyHandler);
    // Left-click anywhere on the overlay -> next slide. Right-click -> previous.
    overlay.addEventListener('click', presentationClickHandler);
    overlay.addEventListener('contextmenu', presentationContextHandler);
}

function exitPresentation() {
    const overlay = document.getElementById('presentation-overlay');
    if (overlay) {
        overlay.style.display = 'none';
        overlay.removeEventListener('click', presentationClickHandler);
        overlay.removeEventListener('contextmenu', presentationContextHandler);
    }
    if (document.fullscreenElement) {
        document.exitFullscreen?.().catch(() => {});
    }
    document.removeEventListener('keydown', presentationKeyHandler);
}

function presentationKeyHandler(e) {
    if (e.key === 'Escape') { e.preventDefault(); exitPresentation(); }
    else if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown' || e.key === 'Enter') {
        e.preventDefault(); nextPresentationSlide();
    }
    else if (e.key === 'ArrowLeft' || e.key === 'PageUp' || e.key === 'Backspace') {
        e.preventDefault(); prevPresentationSlide();
    }
}

function presentationClickHandler(e) {
    // Ignore clicks on the exit button / nav buttons (they have their own onclick).
    if (e.target.closest('.pres-control')) return;
    nextPresentationSlide();
}
function presentationContextHandler(e) {
    e.preventDefault();
    prevPresentationSlide();
}

function nextPresentationSlide() {
    if (presentationIndex < slideDataArray.length - 1) {
        presentationIndex++;
        renderPresentationSlide();
    }
}

function prevPresentationSlide() {
    if (presentationIndex > 0) {
        presentationIndex--;
        renderPresentationSlide();
    }
}

async function renderPresentationSlide() {
    const slide = slideDataArray[presentationIndex];
    const imgEl = document.getElementById('presentation-slide-img');
    const pageInfo = document.getElementById('pres-page-info');
    if (!imgEl) return;

    const transitionType = document.getElementById('pres-transition')?.value || 'fade';

    // Set transition styles based on transition type
    if (transitionType === 'fade') {
        imgEl.style.transition = 'opacity 0.25s ease-in-out';
        imgEl.style.transform = 'none';
        imgEl.style.opacity = '0';
    } else if (transitionType === 'slide') {
        imgEl.style.transition = 'all 0.3s cubic-bezier(0.25, 1, 0.5, 1)';
        imgEl.style.transform = 'translateX(50px)';
        imgEl.style.opacity = '0';
    } else if (transitionType === 'zoom') {
        imgEl.style.transition = 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
        imgEl.style.transform = 'scale(0.9)';
        imgEl.style.opacity = '0';
    }

    const tempCanvasEl = document.createElement('canvas');
    tempCanvasEl.width = 1280;
    tempCanvasEl.height = 720;
    const tempCanvas = new fabric.StaticCanvas(tempCanvasEl);
    
    // Support loading gradient backgrounds in presentation as well
    if (slide.ElementsJson && slide.ElementsJson !== '[]') {
        try {
            const data = JSON.parse(slide.ElementsJson);
            await new Promise((resolve) => {
                tempCanvas.loadFromJSON(data, () => {
                    tempCanvas.renderAll();
                    resolve();
                });
            });
        } catch (e) {
            tempCanvas.backgroundColor = slide.BackgroundColor || '#ffffff';
            tempCanvas.renderAll();
        }
    } else {
        tempCanvas.backgroundColor = slide.BackgroundColor || '#ffffff';
        tempCanvas.renderAll();
    }

    imgEl.src = tempCanvas.toDataURL({ format: 'png', multiplier: 2 });
    tempCanvas.dispose();

    setTimeout(() => { 
        imgEl.style.opacity = '1'; 
        imgEl.style.transform = 'none';
    }, 50);

    if (pageInfo) pageInfo.textContent = `${presentationIndex + 1} / ${slideDataArray.length}`;
}

document.addEventListener('fullscreenchange', () => {
    if (!document.fullscreenElement) {
        const overlay = document.getElementById('presentation-overlay');
        if (overlay && overlay.style.display === 'flex') {
            exitPresentation();
        }
    }
});

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

async function exportToImage() {
    saveCurrentSlideStateToMemory();
    showToast('Đang tạo ảnh tải xuống...', 'info');
    
    try {
        const tempCanvasEl = document.createElement('canvas');
        tempCanvasEl.width = 800;
        tempCanvasEl.height = 450;
        const tempCanvas = new fabric.StaticCanvas(tempCanvasEl);
        
        const jsonData = canvas.toJSON(['id', 'name', 'selectable', 'hasControls']);
        await new Promise((resolve) => {
            tempCanvas.loadFromJSON(jsonData, () => {
                tempCanvas.renderAll();
                resolve();
            });
        });
        
        const dataURL = tempCanvas.toDataURL({ format: 'png', multiplier: 2 });
        tempCanvas.dispose();
        
        const a = document.createElement('a'); 
        a.download = `slide-${currentSlideIndex + 1}.png`;
        a.href = dataURL;
        a.click();
        showToast('Tải ảnh thành công!', 'success');
    } catch (e) {
        console.error("Export image error:", e);
        showToast("Không thể tải ảnh do lỀ—i bảo mật CORS hoặc giới hạn trình duyệt", "error");
    }
}

async function exportToPDF() {
    saveCurrentSlideStateToMemory();
    showToast('Đang khởi tạo xuất file PDF...', 'info');
    const { jsPDF } = window.jspdf;
    
    // Tạo doc khỀ• chuẩn 16:9 ngang (297x167 mm)
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: [297, 167] });
    
    try {
        const tempCanvasEl = document.createElement('canvas');
        tempCanvasEl.width = 800;
        tempCanvasEl.height = 450;
        const tempCanvas = new fabric.StaticCanvas(tempCanvasEl);
        
        for (let i = 0; i < slideDataArray.length; i++) {
            const slide = slideDataArray[i];
            
            tempCanvas.clear();
            tempCanvas.backgroundColor = slide.BackgroundColor || '#ffffff';
            
            // Helper to load background image and render
            const loadAndRender = () => {
                return new Promise((resolve) => {
                    if (slide.BackgroundImage) {
                        fabric.Image.fromURL(slide.BackgroundImage, function(img) {
                            if (img) {
                                const scale = Math.max(tempCanvas.width / img.width, tempCanvas.height / img.height);
                                img.set({
                                    scaleX: scale,
                                    scaleY: scale,
                                    originX: 'left',
                                    originY: 'top'
                                });
                                tempCanvas.setBackgroundImage(img, () => {
                                    tempCanvas.renderAll();
                                    resolve();
                                });
                            } else {
                                resolve();
                            }
                        }, { crossOrigin: 'anonymous' });
                    } else {
                        resolve();
                    }
                });
            };
            
            if (slide.ElementsJson && slide.ElementsJson !== '[]') {
                try {
                    const data = JSON.parse(slide.ElementsJson);
                    await new Promise((resolve) => {
                        tempCanvas.loadFromJSON(data, async () => {
                            await loadAndRender();
                            resolve();
                        });
                    });
                } catch (e) {
                    console.error("LỀ—i parse JSON slide:", e);
                    await loadAndRender();
                }
            } else {
                await loadAndRender();
            }
            
            let imgData = "";
            try {
                imgData = tempCanvas.toDataURL({ format: 'png', multiplier: 2 });
            } catch (e) {
                console.error("Error exporting slide " + i + " to image for PDF:", e);
            }
            
            if (i > 0) pdf.addPage();
            if (imgData) {
                pdf.addImage(imgData, 'PNG', 0, 0, 297, 167);
            } else {
                pdf.setFillColor(240, 240, 240);
                pdf.rect(0, 0, 297, 167, 'F');
                pdf.setTextColor(150, 150, 150);
                pdf.setFont("helvetica", "normal");
                pdf.setFontSize(14);
                pdf.text("Slide " + (i + 1) + " (LỀ—i xuất ảnh do bảo mật CORS)", 50, 80);
            }
        }
        
        tempCanvas.dispose();
        pdf.save('Presentation.pdf');
        showToast('Tải PDF thành công!', 'success');
    } catch (e) {
        console.error("Export PDF error:", e);
        showToast("LỀ—i khi xuất PDF", "error");
    }
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
    isLoadingSlide = true;
    currentSlideIndex = index;
    const slide = slideDataArray[currentSlideIndex];
    
    // Set width and height dynamically based on saved state or defaults
    let slideWidth = 1280;
    let slideHeight = 720;
    if (slide.ElementsJson && slide.ElementsJson !== '[]') {
        try {
            const parsed = JSON.parse(slide.ElementsJson);
            if (parsed.canvasWidth) slideWidth = parsed.canvasWidth;
            else if (parsed.width) slideWidth = parsed.width;
            if (parsed.canvasHeight) slideHeight = parsed.canvasHeight;
            else if (parsed.height) slideHeight = parsed.height;
        } catch (e) {
            console.error("Error reading slide dimensions:", e);
        }
    }
    canvas.setWidth(slideWidth);
    canvas.setHeight(slideHeight);

    canvas.clear();
    canvas.backgroundColor = slide.BackgroundColor || '#ffffff';
    
    const finishLoad = () => {
        if (!canvas.backgroundColor || canvas.backgroundColor === '' || canvas.backgroundColor === 'transparent') {
            canvas.backgroundColor = slide.BackgroundColor || '#ffffff';
        }
        if (slide.BackgroundImage) {
            try {
                fabric.Image.fromURL(slide.BackgroundImage, function(img) {
                    if (img) {
                        const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
                        img.set({
                            scaleX: scale,
                            scaleY: scale,
                            originX: 'left',
                            originY: 'top'
                        });
                        canvas.setBackgroundImage(img, () => {
                            canvas.renderAll();
                            postLoad();
                        });
                    } else {
                        canvas.setBackgroundImage(null, () => {
                            canvas.renderAll();
                            postLoad();
                        });
                    }
                }, { 
                    crossOrigin: 'anonymous',
                    onerror: () => {
                        console.warn("Failed to load background image:", slide.BackgroundImage);
                        canvas.setBackgroundImage(null, () => {
                            canvas.renderAll();
                            postLoad();
                        });
                    }
                });
            } catch (err) {
                console.error("Error setting background image:", err);
                canvas.setBackgroundImage(null, () => {
                    canvas.renderAll();
                    postLoad();
                });
            }
        } else {
            canvas.setBackgroundImage(null, () => {
                canvas.renderAll();
                postLoad();
            });
        }
    };

    const postLoad = () => {
        renderSlideThumbnails();
        isLoadingSlide = false;
        undoStack = [];
        redoStack = [];
        saveState();
        updateUndoRedoButtons();
        // Zoom to fit the loaded slide!
        zoomToFit();
    };

    if (slide.ElementsJson && slide.ElementsJson !== '[]') {
        try {
            const data = JSON.parse(slide.ElementsJson);
            canvas.loadFromJSON(data, function() {
                finishLoad();
            });
        } catch(e) { 
            console.error("LỀ—i parse JSON Fabric:", e); 
            finishLoad(); 
        }
    } else {
        finishLoad();
    }
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

function duplicateSlide(e, index) {
    e.stopPropagation();
    saveCurrentSlideStateToMemory();
    const original = slideDataArray[index];
    const clone = {
        PageNumber: index + 2,
        BackgroundColor: original.BackgroundColor,
        ElementsJson: original.ElementsJson
    };
    slideDataArray.splice(index + 1, 0, clone);
    slideDataArray.forEach((s, i) => s.PageNumber = i + 1);
    currentSlideIndex = index + 1;
    loadSlide(currentSlideIndex);
    renderSlideThumbnails();
    triggerAutoSave();
    showToast('Đã nhân bản slide', 'success');
}

function renderSlideThumbnails() {
    const list = document.getElementById('slides-list');
    if(!list) return;
    list.innerHTML = '';

    slideDataArray.forEach((slide, index) => {
        const div = document.createElement('div');
        div.className = `slide-thumb-h ${index === currentSlideIndex ? 'active' : ''}`;
        div.onclick = () => loadSlide(index);

        div.draggable = true;
        div.ondragstart = (e) => { e.dataTransfer.setData('slideIndex', index); };
        div.ondragover = (e) => { e.preventDefault(); div.style.border = "2px dashed var(--primary)"; };
        div.ondragleave = () => { div.style.border = index === currentSlideIndex ? "2px solid var(--primary)" : "2px solid transparent"; };
        div.ondrop = (e) => {
            e.preventDefault();
            div.style.border = "2px solid transparent";
            const draggedIndex = parseInt(e.dataTransfer.getData('slideIndex'));
            if(draggedIndex !== index && !isNaN(draggedIndex)) {
                const draggedItem = slideDataArray.splice(draggedIndex, 1)[0];
                slideDataArray.splice(index, 0, draggedItem);
                slideDataArray.forEach((s, i) => s.PageNumber = i + 1);
                if (currentSlideIndex === draggedIndex) currentSlideIndex = index;
                else if (currentSlideIndex > draggedIndex && currentSlideIndex <= index) currentSlideIndex--;
                else if (currentSlideIndex < draggedIndex && currentSlideIndex >= index) currentSlideIndex++;
                renderSlideThumbnails();
                triggerAutoSave();
            }
        };

        // Placeholder hiện ngay với màu nền, canvas render sau
        let thumbBg = slide.BackgroundColor || '#ffffff';
        div.innerHTML = `<span class="thumb-num">${index + 1}</span>
            <button class="thumb-del" onclick="deleteSlide(event, ${index})" title="Xóa"><i class="fa-solid fa-xmark"></i></button>
            <button class="thumb-dup" onclick="duplicateSlide(event, ${index})" title="Nhân bản"><i class="fa-solid fa-copy"></i></button>
            <canvas class="thumb-canvas" width="160" height="90" style="width:100%; height:100%; display:block; border-radius:4px; background:${thumbBg};"></canvas>`;
        list.appendChild(div);

        // Render canvas preview async (không block UI)
        _renderThumbCanvas(div.querySelector('.thumb-canvas'), slide);
    });

    const activeThumb = list.querySelector('.slide-thumb-h.active');
    if (activeThumb) activeThumb.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });

    const pageInfo = document.getElementById('page-info');
    if (pageInfo) pageInfo.textContent = `${currentSlideIndex + 1} / ${slideDataArray.length}`;
}

async function _renderThumbCanvas(canvasEl, slide) {
    if (!canvasEl || !window.fabric) return;
    try {
        let slideWidth = 800;
        let slideHeight = 450;
        const jsonData = slide.ElementsJson ? JSON.parse(slide.ElementsJson) : { objects: [] };
        if (jsonData) {
            if (jsonData.canvasWidth) slideWidth = jsonData.canvasWidth;
            else if (jsonData.width) slideWidth = jsonData.width;
            if (jsonData.canvasHeight) slideHeight = jsonData.canvasHeight;
            else if (jsonData.height) slideHeight = jsonData.height;
        }

        // Render at full canvas size on an off-screen element, then scale-copy to thumb
        const offscreen = document.createElement('canvas');
        offscreen.width = slideWidth;
        offscreen.height = slideHeight;

        const fc = new fabric.StaticCanvas(offscreen, { width: slideWidth, height: slideHeight, renderOnAddRemove: false });
        fc.backgroundColor = slide.BackgroundColor || '#ffffff';

        await new Promise(resolve => {
            fc.loadFromJSON(jsonData, () => {
                if (slide.BackgroundImage) {
                    fabric.Image.fromURL(slide.BackgroundImage, img => {
                        if (img) {
                            const s = Math.max(slideWidth / img.width, slideHeight / img.height);
                            img.set({ scaleX: s, scaleY: s, originX: 'left', originY: 'top' });
                            fc.setBackgroundImage(img, () => { fc.renderAll(); resolve(); });
                        } else { fc.renderAll(); resolve(); }
                    }, { crossOrigin: 'anonymous' });
                } else {
                    fc.renderAll();
                    resolve();
                }
            });
        });

        // Scale-copy rendered result into the thumb canvas dynamically
        const w = canvasEl.width || 160;
        const h = canvasEl.height || 90;
        const ctx = canvasEl.getContext('2d');
        ctx.clearRect(0, 0, w, h);
        ctx.drawImage(fc.getElement(), 0, 0, slideWidth, slideHeight, 0, 0, w, h);

        fc.dispose();
    } catch (e) {
        // thumbnail stays as background color
    }
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

function addLine() {
    const line = new fabric.Line([80, 200, 680, 200], {
        stroke: '#334155', strokeWidth: 3, id: _generateId(), name: 'Đường thẳng', selectable: true
    });
    canvas.add(line); canvas.setActiveObject(line); triggerAutoSave();
}
function addRhombus() {
    const pts = [{x:50,y:0},{x:100,y:50},{x:50,y:100},{x:0,y:50}];
    const diamond = new fabric.Polygon(pts, {
        left: canvas.width/2-50, top: canvas.height/2-50, fill: '#ec4899', id: _generateId(), name: 'Hình thoi', selectable: true
    });
    canvas.add(diamond); canvas.setActiveObject(diamond); triggerAutoSave();
}
function addRoundedRect() {
    const r = new fabric.Rect({
        left: canvas.width/2-80, top: canvas.height/2-40, width: 160, height: 80,
        rx: 20, ry: 20, fill: '#06b6d4', id: _generateId(), name: 'Hình bo tròn', selectable: true
    });
    canvas.add(r); canvas.setActiveObject(r); triggerAutoSave();
}
function addPentagon() {
    const n = 5, cx = 50, cy = 50, r = 50;
    const pts = Array.from({length:n}, (_,i) => {
        const a = (Math.PI*2*i/n) - Math.PI/2;
        return { x: cx + r*Math.cos(a), y: cy + r*Math.sin(a) };
    });
    const p = new fabric.Polygon(pts, {
        left: canvas.width/2-50, top: canvas.height/2-50, fill: '#8b5cf6', id: _generateId(), name: 'Ngũ giác', selectable: true
    });
    canvas.add(p); canvas.setActiveObject(p); triggerAutoSave();
}
function addImageFrame(type) {
    // An "image frame" is a regular Fabric shape with a custom flag. Dropping an image
    // onto it (or pasting from the image panel while one is active) auto-clips the image
    // to the frame so the user gets a Canva-style "drop into frame" behaviour.
    const cx = canvas.width / 2, cy = canvas.height / 2;
    const w = 240, h = 180;
    const baseFill = '#E5E7EB';
    const stroke = '#94A3B8';
    let frame;
    if (type === 'circle') {
        frame = new fabric.Circle({
            left: cx - 90, top: cy - 90, radius: 90,
            fill: baseFill, stroke, strokeWidth: 2,
            id: _generateId(), name: 'Khung tròn (ảnh)'
        });
    } else if (type === 'triangle') {
        frame = new fabric.Triangle({
            left: cx - w/2, top: cy - h/2, width: w, height: h,
            fill: baseFill, stroke, strokeWidth: 2,
            id: _generateId(), name: 'Khung tam giác (ảnh)'
        });
    } else if (type === 'polaroid') {
        // Polaroid = an outer white card group + an inner rect-shaped frame for the image.
        const card = new fabric.Rect({
            left: cx - w/2 - 14, top: cy - h/2 - 14, width: w + 28, height: h + 60,
            fill: '#FFFFFF', stroke: '#E5E7EB', strokeWidth: 1, rx: 6, ry: 6,
            id: _generateId(), name: 'Khung Polaroid (nền)'
        });
        const inner = new fabric.Rect({
            left: cx - w/2, top: cy - h/2, width: w, height: h,
            fill: baseFill, stroke, strokeWidth: 2,
            id: _generateId(), name: 'Khung Polaroid (ảnh)'
        });
        inner._isImageFrame = true;
        inner._frameType = 'rect';
        canvas.add(card); canvas.add(inner);
        canvas.setActiveObject(inner);
        triggerAutoSave();
        return;
    } else if (type === 'star') {
        frame = _makeStarPolygon(cx, cy, 100, 50, 5, baseFill);
        frame.set({ stroke, strokeWidth: 2, name: 'Khung sao (ảnh)' });
    } else {
        // rounded rect (default)
        frame = new fabric.Rect({
            left: cx - w/2, top: cy - h/2, width: w, height: h,
            fill: baseFill, stroke, strokeWidth: 2,
            rx: type === 'rounded' ? 16 : 0, ry: type === 'rounded' ? 16 : 0,
            id: _generateId(), name: type === 'rounded' ? 'Khung bo tròn (ảnh)' : 'Khung chữ nhật (ảnh)'
        });
    }
    frame._isImageFrame = true;
    frame._frameType = type;
    canvas.add(frame); canvas.setActiveObject(frame); triggerAutoSave();
}

// ----- Extra shapes (Canva-style) -----
function _makeStarPolygon(cx, cy, outerR, innerR, points, fill) {
    const pts = [];
    for (let i = 0; i < points * 2; i++) {
        const r = i % 2 === 0 ? outerR : innerR;
        const a = (Math.PI / points) * i - Math.PI / 2;
        pts.push({ x: r * Math.cos(a) + outerR, y: r * Math.sin(a) + outerR });
    }
    return new fabric.Polygon(pts, {
        left: cx - outerR, top: cy - outerR,
        fill, id: _generateId(), selectable: true
    });
}
function addStar() {
    const star = _makeStarPolygon(canvas.width/2, canvas.height/2, 70, 30, 5, '#FBBF24');
    star.set({ name: 'Ngôi sao' });
    canvas.add(star); canvas.setActiveObject(star); triggerAutoSave();
}
function addStar6() {
    const star = _makeStarPolygon(canvas.width/2, canvas.height/2, 70, 36, 6, '#F59E0B');
    star.set({ name: 'Ngôi sao 6 cánh' });
    canvas.add(star); canvas.setActiveObject(star); triggerAutoSave();
}
function addHeart() {
    // Heart path SVG-style
    const path = 'M 75,40 C 75,25 60,10 45,10 C 30,10 15,25 15,40 C 15,60 45,90 75,110 C 105,90 135,60 135,40 C 135,25 120,10 105,10 C 90,10 75,25 75,40 Z';
    const heart = new fabric.Path(path, {
        left: canvas.width/2 - 75, top: canvas.height/2 - 60,
        fill: '#EF4444', id: _generateId(), name: 'Trái tim', selectable: true
    });
    canvas.add(heart); canvas.setActiveObject(heart); triggerAutoSave();
}
function addArrow(direction) {
    // Block arrow drawn with a 7-point polygon, rotated for direction.
    const pts = [
        {x:0,y:30}, {x:60,y:30}, {x:60,y:10}, {x:100,y:50}, {x:60,y:90}, {x:60,y:70}, {x:0,y:70}
    ];
    const arrow = new fabric.Polygon(pts, {
        left: canvas.width/2 - 50, top: canvas.height/2 - 50,
        fill: '#6366F1', id: _generateId(), name: 'Mũi tên', selectable: true
    });
    let angle = 0;
    if (direction === 'up') angle = -90;
    else if (direction === 'down') angle = 90;
    else if (direction === 'left') angle = 180;
    arrow.rotate(angle);
    canvas.add(arrow); canvas.setActiveObject(arrow); triggerAutoSave();
}
function addBubble() {
    // Speech bubble: rounded rect + small triangle tail
    const w = 200, h = 120;
    const cx = canvas.width/2, cy = canvas.height/2;
    const body = new fabric.Rect({
        left: cx - w/2, top: cy - h/2, width: w, height: h,
        rx: 18, ry: 18, fill: '#3B82F6',
        id: _generateId(), name: 'Bong bóng thoại (thân)'
    });
    const tail = new fabric.Triangle({
        left: cx - w/2 + 40, top: cy + h/2 - 4,
        width: 28, height: 28, fill: '#3B82F6', angle: 25,
        id: _generateId(), name: 'Bong bóng thoại (đuôi)'
    });
    canvas.add(body); canvas.add(tail);
    canvas.setActiveObject(body); triggerAutoSave();
}
function addCheck() {
    // Check mark drawn as path
    const path = 'M 10 40 L 35 65 L 80 15';
    const check = new fabric.Path(path, {
        fill: '', stroke: '#10B981', strokeWidth: 12, strokeLineCap: 'round', strokeLineJoin: 'round',
        left: canvas.width/2 - 45, top: canvas.height/2 - 40,
        id: _generateId(), name: 'Dấu tích', selectable: true
    });
    canvas.add(check); canvas.setActiveObject(check); triggerAutoSave();
}
function addCross() {
    const path = 'M 10 10 L 70 70 M 70 10 L 10 70';
    const x = new fabric.Path(path, {
        fill: '', stroke: '#EF4444', strokeWidth: 12, strokeLineCap: 'round',
        left: canvas.width/2 - 40, top: canvas.height/2 - 40,
        id: _generateId(), name: 'Dấu X', selectable: true
    });
    canvas.add(x); canvas.setActiveObject(x); triggerAutoSave();
}
function addLocationPin() {
    // Teardrop pin
    const path = 'M 50 0 C 22 0 0 22 0 50 C 0 88 50 130 50 130 C 50 130 100 88 100 50 C 100 22 78 0 50 0 Z';
    const pin = new fabric.Path(path, {
        fill: '#EC4899',
        left: canvas.width/2 - 50, top: canvas.height/2 - 65,
        id: _generateId(), name: 'Ghim địa điểm', selectable: true
    });
    const dot = new fabric.Circle({
        radius: 15, fill: '#FFFFFF',
        left: canvas.width/2 - 15, top: canvas.height/2 - 35,
        id: _generateId(), name: 'Ghim địa điểm (tâm)', selectable: true
    });
    canvas.add(pin); canvas.add(dot); canvas.setActiveObject(pin); triggerAutoSave();
}
function addBolt() {
    // Lightning bolt
    const path = 'M 50 0 L 10 70 L 40 70 L 30 130 L 80 50 L 50 50 Z';
    const bolt = new fabric.Path(path, {
        fill: '#FACC15',
        left: canvas.width/2 - 40, top: canvas.height/2 - 65,
        id: _generateId(), name: 'Tia sét', selectable: true
    });
    canvas.add(bolt); canvas.setActiveObject(bolt); triggerAutoSave();
}
function _makeRegularPolygon(n, radius) {
    const pts = [];
    for (let i = 0; i < n; i++) {
        const a = (Math.PI * 2 * i / n) - Math.PI / 2;
        pts.push({ x: radius + radius * Math.cos(a), y: radius + radius * Math.sin(a) });
    }
    return pts;
}
function addHexagon() {
    const pts = _makeRegularPolygon(6, 60);
    const hex = new fabric.Polygon(pts, {
        left: canvas.width/2 - 60, top: canvas.height/2 - 60,
        fill: '#06B6D4', id: _generateId(), name: 'Lục giác', selectable: true
    });
    canvas.add(hex); canvas.setActiveObject(hex); triggerAutoSave();
}
function addOctagon() {
    const pts = _makeRegularPolygon(8, 60);
    const oct = new fabric.Polygon(pts, {
        left: canvas.width/2 - 60, top: canvas.height/2 - 60,
        fill: '#F97316', id: _generateId(), name: 'Bát giác', selectable: true
    });
    canvas.add(oct); canvas.setActiveObject(oct); triggerAutoSave();
}
function addCloud() {
    // Cloud-ish shape with overlapping circles -> compose as group of ellipses
    const cx = canvas.width/2, cy = canvas.height/2;
    const parts = [
        new fabric.Ellipse({ left: cx-70, top: cy-20, rx: 35, ry: 30, fill: '#E0F2FE' }),
        new fabric.Ellipse({ left: cx-30, top: cy-40, rx: 45, ry: 40, fill: '#E0F2FE' }),
        new fabric.Ellipse({ left: cx+20, top: cy-30, rx: 35, ry: 32, fill: '#E0F2FE' }),
        new fabric.Ellipse({ left: cx-50, top: cy+10, rx: 80, ry: 22, fill: '#E0F2FE' }),
    ];
    parts.forEach(p => p.set({ id: _generateId(), name: 'Đám mây (phần)' }));
    parts.forEach(p => canvas.add(p));
    canvas.setActiveObject(parts[0]);
    triggerAutoSave();
}
function addParallelogram() {
    const pts = [{x:25,y:0},{x:125,y:0},{x:100,y:80},{x:0,y:80}];
    const para = new fabric.Polygon(pts, {
        left: canvas.width/2-65, top: canvas.height/2-40,
        fill: '#A78BFA', id: _generateId(), name: 'Hình bình hành', selectable: true
    });
    canvas.add(para); canvas.setActiveObject(para); triggerAutoSave();
}
function addTrapezoid() {
    const pts = [{x:30,y:0},{x:120,y:0},{x:150,y:80},{x:0,y:80}];
    const tr = new fabric.Polygon(pts, {
        left: canvas.width/2-75, top: canvas.height/2-40,
        fill: '#22D3EE', id: _generateId(), name: 'Hình thang', selectable: true
    });
    canvas.add(tr); canvas.setActiveObject(tr); triggerAutoSave();
}

// ----- Image frame: snap-fit when an image is dropped on top -----
function _imageFitsFrame(img, frame) {
    img.set({
        left: frame.left,
        top: frame.top,
        scaleX: (frame.getScaledWidth()) / img.width,
        scaleY: (frame.getScaledHeight()) / img.height,
        clipPath: _frameClipPathFor(frame, img),
        _attachedToFrame: frame.id,
        name: 'Ảnh trong khung'
    });
}
function _frameClipPathFor(frame, img) {
    // ClipPath must be in absolute coords matching the frame.
    if (frame.type === 'circle' || frame.type === 'ellipse') {
        return new fabric.Circle({
            radius: (frame.type === 'circle' ? frame.radius : frame.rx) * (frame.scaleX || 1),
            originX: 'center', originY: 'center',
            left: frame.left + frame.getScaledWidth()/2,
            top: frame.top + frame.getScaledHeight()/2,
            absolutePositioned: true
        });
    }
    if (frame.type === 'triangle') {
        return new fabric.Triangle({
            width: frame.getScaledWidth(), height: frame.getScaledHeight(),
            left: frame.left, top: frame.top,
            absolutePositioned: true
        });
    }
    // default rect / polygon -> rect bounding box
    return new fabric.Rect({
        width: frame.getScaledWidth(), height: frame.getScaledHeight(),
        left: frame.left, top: frame.top,
        rx: frame.rx || 0, ry: frame.ry || 0,
        absolutePositioned: true
    });
}
function tryDropImageIntoFrameUnder(img, pointerX, pointerY) {
    // Walk objects in reverse z-order so top-most frame wins.
    const objs = canvas.getObjects();
    for (let i = objs.length - 1; i >= 0; i--) {
        const f = objs[i];
        if (!f._isImageFrame) continue;
        if (f.containsPoint && f.containsPoint({ x: pointerX, y: pointerY })) {
            _imageFitsFrame(img, f);
            // Drop the frame's placeholder fill so the image shows through.
            f.set({ fill: 'transparent', stroke: 'transparent' });
            canvas.requestRenderAll();
            triggerAutoSave();
            return true;
        }
    }
    return false;
}

// Hook into native drag-drop of files onto canvas-container.
(function _wireFrameDropZone() {
    document.addEventListener('DOMContentLoaded', () => {
        const cc = document.getElementById('canvas-container');
        if (!cc) return;
        cc.addEventListener('dragover', e => { e.preventDefault(); });
        cc.addEventListener('drop', e => {
            const files = e.dataTransfer?.files;
            if (!files || files.length === 0) return;
            const file = files[0];
            if (!file.type.startsWith('image/')) return;
            e.preventDefault();
            const rect = canvas.upperCanvasEl.getBoundingClientRect();
            const px = (e.clientX - rect.left) / (canvas.getZoom() || 1);
            const py = (e.clientY - rect.top) / (canvas.getZoom() || 1);
            const reader = new FileReader();
            reader.onload = ev => {
                fabric.Image.fromURL(ev.target.result, img => {
                    img.set({ id: _generateId(), name: 'Ảnh kéo thả' });
                    const placed = tryDropImageIntoFrameUnder(img, px, py);
                    if (!placed) {
                        // No frame under cursor — just drop at cursor at sensible size.
                        const max = 400;
                        const s = Math.min(1, max / Math.max(img.width, img.height));
                        img.set({ left: px - (img.width * s) / 2, top: py - (img.height * s) / 2, scaleX: s, scaleY: s });
                        canvas.add(img);
                    }
                    canvas.requestRenderAll();
                    triggerAutoSave();
                }, { crossOrigin: 'anonymous' });
            };
            reader.readAsDataURL(file);
        });
    });
})();

function addGrid(cols, rows) {
    const W = 600, H = 300, cw = W/cols, ch = H/rows;
    const ox = canvas.width/2 - W/2, oy = canvas.height/2 - H/2;
    const group = [];
    for (let r=0; r<rows; r++) for (let c=0; c<cols; c++) {
        group.push(new fabric.Rect({
            left: ox + c*cw, top: oy + r*ch, width: cw-4, height: ch-4,
            fill: '#f1f5f9', stroke: '#cbd5e1', strokeWidth: 1, rx: 6,
            id: _generateId(), name: `Ô ${r*cols+c+1}`, selectable: true
        }));
    }
    group.forEach(o => canvas.add(o));
    canvas.setActiveObject(group[0]);
    triggerAutoSave();
}
function addVipComponentById(id) {
    if (window.renderVipElementsDrawer) {
        // Delegate to VIP components file if available
        const evt = new CustomEvent('addVipComponent', { detail: { id } });
        document.dispatchEvent(evt);
    } else {
        showToast('Thành phần VIP chưa được tải', 'info');
    }
}
function _buildElementsPanel() {
    const container = document.getElementById('elem-categories');
    if (!container) return;

    const isVipUser = document.getElementById('user-is-vip')?.value === 'true';

    const ELEM_CATS = [
        {
            id: 'shapes', label: 'Hình dạng', icon: 'fa-shapes', open: true, items: [
                { label: 'Chữ nhật', icon: 'fa-square', color: '#6366f1', action: () => addRect() },
                { label: 'Bo tròn', icon: 'fa-square', color: '#06b6d4', action: () => addRoundedRect() },
                { label: 'Hình tròn', icon: 'fa-circle', color: '#10b981', action: () => addCircle() },
                { label: 'Tam giác', icon: 'fa-play fa-rotate-270', color: '#f59e0b', action: () => addTriangle() },
                { label: 'Hình thoi', icon: 'fa-diamond', color: '#ec4899', action: () => addRhombus() },
                { label: 'Ngũ giác', icon: 'fa-certificate', color: '#8b5cf6', action: () => addPentagon() },
                { label: 'Lục giác', icon: 'fa-hexagon-nodes', color: '#06b6d4', action: () => addHexagon() },
                { label: 'Bát giác', icon: 'fa-stop', color: '#f97316', action: () => addOctagon() },
                { label: 'Hình bình hành', icon: 'fa-shapes', color: '#a78bfa', action: () => addParallelogram() },
                { label: 'Hình thang', icon: 'fa-shapes', color: '#22d3ee', action: () => addTrapezoid() },
                { label: 'Ngôi sao 5 cánh', icon: 'fa-star', color: '#fbbf24', action: () => addStar() },
                { label: 'Ngôi sao 6 cánh', icon: 'fa-star', color: '#f59e0b', action: () => addStar6() },
                { label: 'Trái tim', icon: 'fa-heart', color: '#ef4444', action: () => addHeart() },
                { label: 'Đám mây', icon: 'fa-cloud', color: '#0ea5e9', action: () => addCloud() },
            ]
        },
        {
            id: 'lines', label: 'Đường & Mũi tên', icon: 'fa-arrow-right', open: false, items: [
                { label: 'Đường thẳng', icon: 'fa-minus', color: '#64748b', action: () => addLine() },
                { label: 'Mũi tên phải', icon: 'fa-arrow-right', color: '#6366f1', action: () => addArrow('right') },
                { label: 'Mũi tên trái', icon: 'fa-arrow-left', color: '#6366f1', action: () => addArrow('left') },
                { label: 'Mũi tên lên', icon: 'fa-arrow-up', color: '#10b981', action: () => addArrow('up') },
                { label: 'Mũi tên xuống', icon: 'fa-arrow-down', color: '#10b981', action: () => addArrow('down') },
            ]
        },
        {
            id: 'icons', label: 'Biểu tượng', icon: 'fa-star', open: false, items: [
                { label: 'Bong bóng thoại', icon: 'fa-comment-dots', color: '#3b82f6', action: () => addBubble() },
                { label: 'Dấu tích', icon: 'fa-check', color: '#10b981', action: () => addCheck() },
                { label: 'Dấu X', icon: 'fa-xmark', color: '#ef4444', action: () => addCross() },
                { label: 'Ghim địa điểm', icon: 'fa-location-dot', color: '#ec4899', action: () => addLocationPin() },
                { label: 'Tia sét', icon: 'fa-bolt', color: '#facc15', action: () => addBolt() },
            ]
        },
        {
            id: 'frames', label: 'Khung ảnh (kéo & thả)', icon: 'fa-image', open: false, items: [
                { label: 'Khung bo tròn', icon: 'fa-image', color: '#6366f1', action: () => addImageFrame('rounded') },
                { label: 'Khung chữ nhật', icon: 'fa-square', color: '#94a3b8', action: () => addImageFrame('rect') },
                { label: 'Khung tròn', icon: 'fa-circle', color: '#10b981', action: () => addImageFrame('circle') },
                { label: 'Khung tam giác', icon: 'fa-play fa-rotate-270', color: '#f59e0b', action: () => addImageFrame('triangle') },
                { label: 'Khung ngôi sao', icon: 'fa-star', color: '#fbbf24', action: () => addImageFrame('star') },
                { label: 'Khung Polaroid', icon: 'fa-camera-retro', color: '#0ea5e9', action: () => addImageFrame('polaroid') },
                { label: 'Lưới 2×1', icon: 'fa-table-columns', color: '#a78bfa', action: () => addGrid(2,1) },
                { label: 'Lưới 2×2', icon: 'fa-border-all', color: '#8b5cf6', action: () => addGrid(2,2) },
            ]
        },
        {
            id: 'vip_components', label: 'Đồ họa (VIP)', icon: 'fa-wand-magic-sparkles', vip: true, open: false, items: [
                { label: 'Hero Banner', icon: 'fa-panorama', color: '#7c3aed', action: () => addVipComponentById('heroBanner') },
                { label: 'Quote Block', icon: 'fa-quote-left', color: '#4f46e5', action: () => addVipComponentById('quoteBlock') },
                { label: 'KPI Dashboard', icon: 'fa-gauge-high', color: '#0ea5e9', action: () => addVipComponentById('kpiDashboard') },
                { label: 'Progress Bar', icon: 'fa-bars-progress', color: '#10b981', action: () => addVipComponentById('progressBar') },
                { label: 'Timeline', icon: 'fa-timeline', color: '#f59e0b', action: () => addVipComponentById('timeline') },
                { label: 'Pricing Table', icon: 'fa-table', color: '#ec4899', action: () => addVipComponentById('pricingTable') },
                { label: 'Bar Chart', icon: 'fa-chart-bar', color: '#6366f1', action: () => addVipComponentById('barChart') },
                { label: 'Infographic', icon: 'fa-circle-nodes', color: '#22c55e', action: () => addVipComponentById('infographicFlow') },
            ]
        },
    ];

    ELEM_CATS.forEach(cat => {
        const locked = cat.vip && !isVipUser;
        const section = document.createElement('div');
        section.style.marginBottom = '4px';

        const header = document.createElement('div');
        header.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:9px 6px;cursor:pointer;border-radius:8px;user-select:none;';
        header.innerHTML = `
            <span style="font-size:0.84rem;font-weight:700;color:var(--text-main);display:flex;align-items:center;gap:8px;">
                <i class="fa-solid ${cat.icon}" style="color:var(--primary);width:15px;text-align:center;"></i>
                ${cat.label}
                ${locked ? '<span style="font-size:0.68rem;padding:1px 6px;background:linear-gradient(90deg,#7c3aed,#4f46e5);color:#fff;border-radius:999px;">VIP</span>' : ''}
            </span>
            <i class="fa-solid fa-chevron-${cat.open ? 'up' : 'down'}" style="font-size:0.7rem;color:var(--text-muted);transition:transform 0.2s;"></i>
        `;

        const grid = document.createElement('div');
        grid.style.cssText = `display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;padding:4px 0 8px;overflow:hidden;max-height:${cat.open ? '9999px' : '0'};transition:max-height 0.25s ease;`;
        grid.setAttribute('data-cat', cat.id);

        cat.items.forEach(item => {
            const btn = document.createElement('div');
            btn.className = 'draggable-item elem-card-bg' + (locked ? ' elem-card-locked' : '');
            btn.style.cssText = 'padding:12px 6px;flex-direction:column;gap:6px;font-size:0.71rem;text-align:center;cursor:pointer;border-radius:11px;display:flex;align-items:center;justify-content:center;margin-bottom:0;';
            btn.title = item.label;
            btn.innerHTML = `
                <i class="fa-solid ${item.icon}" style="font-size:22px;color:${locked ? '#475569' : item.color};"></i>
                <span style="color:${locked ? '#64748b' : '#F1F5F9'};line-height:1.25;font-weight:600;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;">${item.label}</span>
                ${locked ? '<i class="fa-solid fa-lock" style="font-size:9px;color:#7c3aed;opacity:0.7;"></i>' : ''}
            `;
            btn.onclick = locked
                ? () => showToast('Nâng cấp VIP để dùng thành phần này â€” /Billing/Upgrade', 'info')
                : () => { try { item.action(); } catch(e) { console.warn(e); } };
            grid.appendChild(btn);
        });

        let open = cat.open;
        header.onclick = () => {
            open = !open;
            grid.style.maxHeight = open ? '9999px' : '0';
            const chev = header.querySelector('i.fa-solid');
            if (chev) { chev.className = `fa-solid fa-chevron-${open ? 'up' : 'down'}`; }
        };

        section.appendChild(header);
        section.appendChild(grid);
        container.appendChild(section);
    });

    // Search
    const searchEl = document.getElementById('elem-search');
    if (searchEl) {
        searchEl.addEventListener('input', function() {
            const q = this.value.toLowerCase().trim();
            container.querySelectorAll('[data-cat]').forEach(grid => {
                let any = false;
                grid.querySelectorAll('.draggable-item').forEach(btn => {
                    const match = !q || btn.title.toLowerCase().includes(q);
                    btn.style.display = match ? '' : 'none';
                    if (match) any = true;
                });
                if (q) grid.style.maxHeight = any ? '9999px' : '0';
            });
        });
    }
}

function _showTemplatePreviewPanel(tpl) {
    const normTpl = normalizeTemplate(tpl);
    if (!normTpl) return;

    // Check VIP permission
    const isPremium = !!normTpl.isPremiumTemplate || (normTpl.slideCount && normTpl.slideCount > 10);
    const isVip = document.getElementById('user-is-vip')?.value === 'true' || (window.isVip === true);
    const canUse = normTpl.canUse !== false && (!isPremium || isVip);
    
    if (!canUse) {
        if (typeof showToast === 'function') {
            showToast(`Mẫu "${normTpl.title}" dành riêng cho thành viên VIP`, 'info');
        }
        setTimeout(() => window.location.href = '/Billing/Upgrade', 1000);
        return;
    }

    // Remove existing preview overlay if any
    const old = document.getElementById('tpl-preview-overlay');
    if (old) old.remove();

    const overlay = document.createElement('div');
    overlay.id = 'tpl-preview-overlay';
    overlay.style.cssText = `
        position:fixed; inset:0; z-index:9999;
        background:rgba(0,0,0,0.65); backdrop-filter:blur(4px);
        display:flex; align-items:center; justify-content:center;
    `;
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };

    const panel = document.createElement('div');
    panel.style.cssText = `
        background:var(--bg-secondary,#1e293b); border-radius:20px;
        width:min(92vw,740px); max-height:90vh; overflow:hidden;
        display:flex; flex-direction:column;
        box-shadow:0 32px 80px rgba(0,0,0,0.6);
        border:1px solid rgba(255,255,255,0.08);
    `;

    // Header
    const header = document.createElement('div');
    header.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:18px 22px;border-bottom:1px solid rgba(255,255,255,0.07);';
    header.innerHTML = `
        <div>
            <div style="font-size:1.1rem;font-weight:800;color:var(--text-main,#f8fafc);">${normTpl.title}</div>
            <div style="font-size:0.78rem;color:var(--text-muted,#64748b);margin-top:3px;">${normTpl.slideCount} trang · ${normTpl.category}</div>
        </div>
        <button id="tpl-preview-close" style="background:none;border:none;color:var(--text-muted,#64748b);font-size:1.3rem;cursor:pointer;padding:4px 8px;border-radius:6px;">&#10005;</button>
    `;

    // Slide strip
    const strip = document.createElement('div');
    strip.style.cssText = 'display:flex;gap:10px;padding:16px 20px;overflow-x:auto;flex-shrink:0;';

    normTpl.slides.forEach((s, i) => {
        const thumb = document.createElement('div');
        thumb.style.cssText = `flex-shrink:0;width:140px;cursor:pointer;border-radius:8px;overflow:hidden;border:2px solid ${i===0?'var(--primary,#7c3aed)':'rgba(255,255,255,0.1)'};position:relative;`;
        thumb.innerHTML = `
            <canvas width="140" height="79" style="display:block;background:${s.backgroundColor||'#fff'};"></canvas>
            <div style="position:absolute;bottom:4px;left:0;right:0;text-align:center;font-size:0.68rem;color:#fff;text-shadow:0 1px 3px rgba(0,0,0,0.8);">${i+1}</div>
        `;
        thumb.onclick = () => {
            strip.querySelectorAll('div[data-thumb]').forEach(d => d.style.borderColor='rgba(255,255,255,0.1)');
            thumb.style.borderColor = 'var(--primary,#7c3aed)';
        };
        thumb.setAttribute('data-thumb', i);

        // Async render thumbnail
        const cvEl = thumb.querySelector('canvas');
        _renderThumbCanvas(cvEl, { BackgroundColor: s.backgroundColor, BackgroundImage: s.backgroundImage, ElementsJson: s.elementsJson });

        strip.appendChild(thumb);
    });

    // Action buttons
    const actions = document.createElement('div');
    actions.style.cssText = 'display:flex;gap:10px;padding:16px 20px;border-top:1px solid rgba(255,255,255,0.07);';
    actions.innerHTML = `
        <button id="tpl-apply-all" style="flex:1;padding:14px 20px;border:none;border-radius:12px;background:linear-gradient(90deg,#7c3aed,#4f46e5);color:#fff;font-weight:800;font-size:1rem;cursor:pointer;">
            Dùng mẫu này (${normTpl.slideCount} trang)
        </button>
        <button id="tpl-cancel" style="padding:14px 20px;border:1px solid rgba(255,255,255,0.15);border-radius:12px;background:none;color:var(--text-muted,#64748b);font-weight:600;font-size:0.9rem;cursor:pointer;">
            Huỷ
        </button>
    `;

    panel.appendChild(header);
    panel.appendChild(strip);
    panel.appendChild(actions);
    overlay.appendChild(panel);
    document.body.appendChild(overlay);

    document.getElementById('tpl-preview-close').onclick = () => overlay.remove();
    document.getElementById('tpl-cancel').onclick = () => overlay.remove();

    document.getElementById('tpl-apply-all').onclick = () => {
        applyTemplateToPresentation(normTpl);
        overlay.remove();
    };
}

function replaceActiveImageOrPlaceholder(url, fallbackAdd) {
    const active = canvas.getActiveObject();
    const canReplace = active && (active.type === 'image' || active.name === 'Image placeholder');
    if (!canReplace) {
        fallbackAdd();
        return;
    }

    fabric.Image.fromURL(url, function(img) {
        const targetWidth = active.getScaledWidth();
        const targetHeight = active.getScaledHeight();
        const scale = Math.max(targetWidth / img.width, targetHeight / img.height);
        img.set({
            left: active.left,
            top: active.top,
            angle: active.angle || 0,
            scaleX: scale,
            scaleY: scale,
            cropX: Math.max(0, (img.width - targetWidth / scale) / 2),
            cropY: Math.max(0, (img.height - targetHeight / scale) / 2),
            width: Math.min(img.width, targetWidth / scale),
            height: Math.min(img.height, targetHeight / scale),
            id: active.id || _generateId(),
            name: 'Hình ảnh'
        });
        canvas.remove(active);
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.requestRenderAll();
        triggerAutoSave();
        showToast('Đã thay ảnh trong mẫu', 'success');
    }, { crossOrigin: 'anonymous' });
}

function addImage(url) {
    replaceActiveImageOrPlaceholder(url, () => {
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
    });
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
            showToast("ÄÄƒng làm mẫu thành công! Hãy kiểm tra ở trang chủ.", "success");
        } else {
            showToast("Có lỀ—i xảy ra khi đÄƒng mẫu.", "error");
        }
    } catch (e) {
        showToast("LỀ—i kết nối", "error");
    }
}

// Global list for uploads
let uploadedImages = [];

// ===== Photo library (Unsplash via /api/photos/search proxy) =====
window._photoState = { q: '', page: 1, results: [] };
async function searchPhotos(query) {
    const q = (query || '').trim() || 'business';
    window._lastPhotoQuery = q;
    window._photoState = { q, page: 1, results: [] };
    const input = document.getElementById('photo-search-input');
    if (input && input.value !== q) input.value = q;
    await _fetchPhotosPage(true);
}
async function searchPhotosMore() {
    window._photoState.page += 1;
    await _fetchPhotosPage(false);
}
async function _fetchPhotosPage(reset) {
    const grid = document.getElementById('photo-grid');
    const more = document.getElementById('photo-loadmore');
    if (!grid) return;
    if (reset) grid.innerHTML = `<div style="grid-column:span 2; text-align:center; color:var(--text-muted); padding:20px 0;"><i class="fa-solid fa-spinner fa-spin"></i> Đang tìm ảnh "${window._photoState.q}"…</div>`;
    try {
        const r = await fetch(`/api/photos/search?q=${encodeURIComponent(window._photoState.q)}&page=${window._photoState.page}&perPage=24`);
        const data = await r.json();
        const results = (data && data.results) || [];
        if (reset) grid.innerHTML = '';
        if (reset && results.length === 0) {
            grid.innerHTML = `<div style="grid-column:span 2; text-align:center; color:var(--text-muted); padding:24px 8px;"><i class="fa-regular fa-circle-question" style="font-size:1.4rem; display:block; margin-bottom:6px;"></i> Không tìm thấy ảnh phù hợp với "${window._photoState.q}".</div>`;
            if (more) more.style.display = 'none';
            return;
        }
        results.forEach(p => {
            const card = document.createElement('div');
            card.className = 'photo-card';
            card.onclick = () => addImage(p.full);
            card.oncontextmenu = (e) => setBgImage(e, p.full);
            card.title = p.author ? `Ảnh: ${p.author}` : '';
            card.innerHTML = `<img src="${p.thumb}" alt="" loading="lazy" />`;
            grid.appendChild(card);
        });
        if (more) more.style.display = results.length >= 12 ? 'block' : 'none';
    } catch (e) {
        console.error(e);
        if (reset) grid.innerHTML = '<div style="grid-column:span 2; color:#ef4444; text-align:center; padding:20px 0;">Không tải được ảnh. Thử lại.</div>';
    }
}

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
            showToast('LỀ—i tải ảnh', 'error');
        }
    } catch (err) {
        console.error(err);
        showToast('LỀ—i kết nối', 'error');
    }
}

function addImageToCanvas(url) {
    replaceActiveImageOrPlaceholder(url, () => {
    fabric.Image.fromURL(url, function(img) {
        if(img.width > canvas.width || img.height > canvas.height) img.scaleToWidth(canvas.width / 2);
        img.set({ left: 50, top: 50, id: _generateId(), name: 'Hình ảnh' });
        canvas.add(img); canvas.setActiveObject(img);
        triggerAutoSave();
    }, { crossOrigin: 'anonymous' });
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

    // Show or hide Group/Ungroup buttons based on selection
    const btnGroup = document.getElementById('btn-group-objects');
    const btnUngroup = document.getElementById('btn-ungroup-objects');
    if (btnGroup) btnGroup.style.display = (activeObj && activeObj.type === 'activeSelection') ? 'inline-flex' : 'none';
    if (btnUngroup) btnUngroup.style.display = (activeObj && activeObj.type === 'group') ? 'inline-flex' : 'none';

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

            // Determine active text effect dropdown value
            const effectProp = document.getElementById('prop-text-effect');
            if (effectProp) {
                if (activeObj.stroke && activeObj.fill === 'transparent') {
                    effectProp.value = 'hollow';
                } else if (activeObj.shadow && activeObj.shadow.blur > 10 && activeObj.shadow.offsetX === 0) {
                    effectProp.value = 'neon';
                } else if (activeObj.stroke && activeObj.strokeWidth > 0) {
                    effectProp.value = 'outline';
                } else if (activeObj.shadow && activeObj.shadow.offsetX > 0) {
                    effectProp.value = 'shadow';
                } else {
                    effectProp.value = 'none';
                }
            }
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
    hideFloatingToolbar();
}

// ===== Floating element toolbar (Canva-style) =====
function _ftBuildTextToolbar(obj) {
    const fontSize = Math.round(obj.fontSize || 24);
    const fill = obj.fill || '#000000';
    const isBold = (obj.fontWeight === 'bold' || obj.fontWeight === 700 || obj.fontWeight === '700');
    const isItalic = obj.fontStyle === 'italic';
    const isUnderline = !!obj.underline;
    const isStrike = !!obj.linethrough;
    const align = obj.textAlign || 'left';
    return `
        <select class="ft-select" onchange="ftSetFont(this.value)" title="Phông chữ" style="max-width:140px;">
            <optgroup label="Sans-serif">
                <option ${obj.fontFamily==='Inter'?'selected':''} value="Inter">Inter</option>
                <option ${(obj.fontFamily||'').includes('Plus Jakarta')?'selected':''} value="Plus Jakarta Sans">Plus Jakarta Sans</option>
                <option ${obj.fontFamily==='Poppins'?'selected':''} value="Poppins">Poppins</option>
                <option ${obj.fontFamily==='Montserrat'?'selected':''} value="Montserrat">Montserrat</option>
                <option ${obj.fontFamily==='Roboto'?'selected':''} value="Roboto">Roboto</option>
                <option ${obj.fontFamily==='Open Sans'?'selected':''} value="Open Sans">Open Sans</option>
                <option ${obj.fontFamily==='Source Sans 3'?'selected':''} value="Source Sans 3">Source Sans 3</option>
                <option ${obj.fontFamily==='Nunito'?'selected':''} value="Nunito">Nunito</option>
                <option ${obj.fontFamily==='Raleway'?'selected':''} value="Raleway">Raleway</option>
                <option ${obj.fontFamily==='Work Sans'?'selected':''} value="Work Sans">Work Sans</option>
                <option ${obj.fontFamily==='Manrope'?'selected':''} value="Manrope">Manrope</option>
                <option ${obj.fontFamily==='DM Sans'?'selected':''} value="DM Sans">DM Sans</option>
                <option ${obj.fontFamily==='Quicksand'?'selected':''} value="Quicksand">Quicksand</option>
                <option ${obj.fontFamily==='Space Grotesk'?'selected':''} value="Space Grotesk">Space Grotesk</option>
                <option ${(obj.fontFamily||'').includes('Be Vietnam')?'selected':''} value="Be Vietnam Pro">Be Vietnam Pro</option>
                <option ${obj.fontFamily==='Arial'?'selected':''} value="Arial">Arial</option>
            </optgroup>
            <optgroup label="Serif">
                <option ${obj.fontFamily==='Playfair Display'?'selected':''} value="Playfair Display">Playfair Display</option>
                <option ${(obj.fontFamily||'').includes('DM Serif')?'selected':''} value="DM Serif Display">DM Serif Display</option>
                <option ${obj.fontFamily==='Merriweather'?'selected':''} value="Merriweather">Merriweather</option>
                <option ${obj.fontFamily==='Roboto Slab'?'selected':''} value="Roboto Slab">Roboto Slab</option>
                <option ${obj.fontFamily==='Georgia'?'selected':''} value="Georgia">Georgia</option>
            </optgroup>
            <optgroup label="Display">
                <option ${obj.fontFamily==='Bebas Neue'?'selected':''} value="Bebas Neue">Bebas Neue</option>
                <option ${obj.fontFamily==='Oswald'?'selected':''} value="Oswald">Oswald</option>
                <option ${obj.fontFamily==='Lobster'?'selected':''} value="Lobster">Lobster</option>
                <option ${obj.fontFamily==='Pacifico'?'selected':''} value="Pacifico">Pacifico</option>
            </optgroup>
            <optgroup label="Mono">
                <option ${(obj.fontFamily||'').includes('Roboto Mono')?'selected':''} value="Roboto Mono">Roboto Mono</option>
                <option ${obj.fontFamily==='Courier New'?'selected':''} value="Courier New">Courier New</option>
            </optgroup>
        </select>
        <button class="ft-btn ft-iconbtn" onclick="ftAdjustSize(-2)" title="Giảm cỡ chữ"><i class="fa-solid fa-minus" style="font-size:0.7rem;"></i></button>
        <input type="number" class="ft-num" value="${fontSize}" onchange="ftSetSize(this.value)" title="Cỡ chữ">
        <button class="ft-btn ft-iconbtn" onclick="ftAdjustSize(2)" title="Tăng cỡ chữ"><i class="fa-solid fa-plus" style="font-size:0.7rem;"></i></button>
        <div class="ft-sep"></div>
        <button class="ft-btn ft-iconbtn" onclick="openColorPicker(this, '${fill}', v => ftSetColor(v))" title="Màu chữ">
            <div class="ft-color-swatch" style="background:${fill};"></div>
        </button>
        <button class="ft-btn ft-iconbtn ${isBold?'is-active':''}" onclick="ftToggle('bold')" title="Đậm"><b>B</b></button>
        <button class="ft-btn ft-iconbtn ${isItalic?'is-active':''}" onclick="ftToggle('italic')" title="Nghiêng"><i>I</i></button>
        <button class="ft-btn ft-iconbtn ${isUnderline?'is-active':''}" onclick="ftToggle('underline')" title="Gạch chân"><u>U</u></button>
        <button class="ft-btn ft-iconbtn ${isStrike?'is-active':''}" onclick="ftToggle('strike')" title="Gạch ngang"><s>S</s></button>
        <div class="ft-sep"></div>
        <button class="ft-btn ft-iconbtn ${align==='left'?'is-active':''}" onclick="ftSetAlign('left')" title="Căn trái"><i class="fa-solid fa-align-left"></i></button>
        <button class="ft-btn ft-iconbtn ${align==='center'?'is-active':''}" onclick="ftSetAlign('center')" title="Căn giữa"><i class="fa-solid fa-align-center"></i></button>
        <button class="ft-btn ft-iconbtn ${align==='right'?'is-active':''}" onclick="ftSetAlign('right')" title="Căn phải"><i class="fa-solid fa-align-right"></i></button>
        <div class="ft-sep"></div>
        ${_ftCommonControls()}
    `;
}
function _ftBuildShapeToolbar(obj) {
    const fill = (obj.fill && typeof obj.fill === 'string') ? obj.fill : '#6366f1';
    return `
        <button class="ft-btn" onclick="openColorPicker(this, '${fill}', v => ftSetFill(v))" title="Màu nền">
            <span style="font-size:0.78rem;">Màu</span>
            <div class="ft-color-swatch" style="background:${fill}; margin-left:4px;"></div>
        </button>
        <div class="ft-sep"></div>
        <button class="ft-btn" onclick="ftAdjustOpacity(-0.1)" title="Giảm trong suốt"><i class="fa-solid fa-circle-half-stroke"></i> -</button>
        <button class="ft-btn" onclick="ftAdjustOpacity(0.1)" title="Tăng độ đậm"><i class="fa-solid fa-circle"></i> +</button>
        <div class="ft-sep"></div>
        ${_ftCommonControls()}
    `;
}
function _ftBuildImageToolbar(obj) {
    return `
        <button class="ft-btn" onclick="ftFlip('x')" title="Lật ngang"><i class="fa-solid fa-left-right"></i> Lật ngang</button>
        <button class="ft-btn" onclick="ftFlip('y')" title="Lật dọc"><i class="fa-solid fa-up-down"></i> Lật dọc</button>
        <div class="ft-sep"></div>
        ${_ftCommonControls()}
    `;
}
function _ftCommonControls() {
    return `
        <button class="ft-btn ft-iconbtn" onclick="ftRotate(-90)" title="Xoay trái"><i class="fa-solid fa-rotate-left"></i></button>
        <button class="ft-btn ft-iconbtn" onclick="ftRotate(90)" title="Xoay phải"><i class="fa-solid fa-rotate-right"></i></button>
        <button class="ft-btn ft-iconbtn" onclick="ftBringForward()" title="Lên 1 lớp"><i class="fa-solid fa-arrow-up"></i></button>
        <button class="ft-btn ft-iconbtn" onclick="ftSendBackward()" title="Xuống 1 lớp"><i class="fa-solid fa-arrow-down"></i></button>
        <button class="ft-btn ft-iconbtn" onclick="ftDuplicate()" title="Nhân bản"><i class="fa-regular fa-clone"></i></button>
        <button class="ft-btn ft-iconbtn ${canvas.getActiveObject()?.lockMovementX?'is-active':''}" onclick="ftToggleLock()" title="Khoá"><i class="fa-solid fa-lock"></i></button>
        <button class="ft-btn ft-iconbtn danger" onclick="ftDelete()" title="Xoá"><i class="fa-solid fa-trash"></i></button>
    `;
}

function renderFloatingToolbar() {
    const tb = document.getElementById('floating-toolbar');
    if (!tb) return;
    const obj = canvas.getActiveObject();
    if (!obj || obj.type === 'activeSelection') { hideFloatingToolbar(); return; }
    const isText = obj.type === 'i-text' || obj.type === 'text' || obj.type === 'textbox';
    const isImage = obj.type === 'image';
    if (isText) tb.innerHTML = _ftBuildTextToolbar(obj);
    else if (isImage) tb.innerHTML = _ftBuildImageToolbar(obj);
    else tb.innerHTML = _ftBuildShapeToolbar(obj);
    positionFloatingToolbar();
    tb.classList.add('is-visible');
}
function positionFloatingToolbar() {
    const tb = document.getElementById('floating-toolbar');
    const obj = canvas.getActiveObject();
    if (!tb || !obj) return;
    // Position above the bounding box of the object, in canvas-container coords.
    const container = document.getElementById('canvas-container');
    if (!container) return;
    const canvasEl = document.getElementById('canvas');
    if (!canvasEl) return;
    const canvasRect = canvasEl.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const br = obj.getBoundingRect(true, true); // absolute coords on the lower canvas
    const zoom = canvas.getZoom() || 1;
    // br is in canvas internal coords. Convert to screen coords by adding canvas rect offset.
    const screenLeft = canvasRect.left + br.left * zoom + (br.width * zoom) / 2;
    const screenTop = canvasRect.top + br.top * zoom - 12; // a bit of padding above
    // Now place relative to viewport via fixed positioning; container has overflow:auto so fixed is simpler.
    tb.style.position = 'fixed';
    tb.style.left = `${Math.max(12, screenLeft - tb.offsetWidth / 2)}px`;
    tb.style.top = `${Math.max(70, screenTop - tb.offsetHeight)}px`;
}
function hideFloatingToolbar() {
    const tb = document.getElementById('floating-toolbar');
    if (tb) tb.classList.remove('is-visible');
}

// ----- toolbar action helpers -----
function _activeApply(fn) {
    const o = canvas.getActiveObject(); if (!o) return;
    fn(o);
    canvas.requestRenderAll();
    renderFloatingToolbar();
    triggerAutoSave();
}
function ftSetFont(family) { _activeApply(o => o.set('fontFamily', family)); }
function ftSetSize(v) { _activeApply(o => o.set('fontSize', Math.max(6, +v || 24))); }
function ftAdjustSize(delta) { _activeApply(o => o.set('fontSize', Math.max(6, (o.fontSize||24) + delta))); }
function ftSetColor(v) { _activeApply(o => o.set('fill', v)); }
function ftSetFill(v) { _activeApply(o => o.set('fill', v)); }
function ftToggle(kind) {
    _activeApply(o => {
        if (kind === 'bold') o.set('fontWeight', (o.fontWeight==='bold'||o.fontWeight===700||o.fontWeight==='700') ? 'normal' : 'bold');
        if (kind === 'italic') o.set('fontStyle', o.fontStyle==='italic' ? 'normal' : 'italic');
        if (kind === 'underline') o.set('underline', !o.underline);
        if (kind === 'strike') o.set('linethrough', !o.linethrough);
    });
}
function ftSetAlign(a) { _activeApply(o => o.set('textAlign', a)); }
function ftRotate(deg) { _activeApply(o => o.rotate(((o.angle||0) + deg) % 360)); }
function ftFlip(axis) { _activeApply(o => o.set(axis === 'x' ? 'flipX' : 'flipY', !(axis === 'x' ? o.flipX : o.flipY))); }
function ftAdjustOpacity(d) { _activeApply(o => o.set('opacity', Math.max(0, Math.min(1, (o.opacity ?? 1) + d)))); }
function ftBringForward() { const o = canvas.getActiveObject(); if (o) { canvas.bringForward(o); canvas.requestRenderAll(); triggerAutoSave(); } }
function ftSendBackward() { const o = canvas.getActiveObject(); if (o) { canvas.sendBackwards(o); canvas.requestRenderAll(); triggerAutoSave(); } }
function ftDuplicate() {
    const o = canvas.getActiveObject(); if (!o) return;
    o.clone(c => {
        c.set({ left: (o.left||0)+20, top: (o.top||0)+20, id: _generateId() });
        canvas.add(c); canvas.setActiveObject(c); canvas.requestRenderAll(); triggerAutoSave();
    });
}
function ftToggleLock() {
    _activeApply(o => {
        const locked = !!o.lockMovementX;
        o.set({ lockMovementX: !locked, lockMovementY: !locked, lockScalingX: !locked, lockScalingY: !locked, lockRotation: !locked, hasControls: locked });
    });
}
function ftDelete() {
    const o = canvas.getActiveObject(); if (!o) return;
    canvas.remove(o); canvas.discardActiveObject(); canvas.requestRenderAll(); triggerAutoSave();
    hideFloatingToolbar();
}

// ===== Custom color picker (drag-friendly) =====
// HSV-based picker: saturation/value plane on top, hue bar below, hex + RGB at the bottom.
// Drag inside the SV box and the hue bar to pick colors smoothly.
let _cpState = { h: 0, s: 1, v: 1, onChange: null, popover: null };

function openColorPicker(anchorEl, initialHex, onChange) {
    // Toggle: clicking the same swatch twice closes the popover.
    closeColorPicker();
    _cpState.onChange = onChange;
    const rgb = _hexToRgb(initialHex || '#000000');
    const hsv = _rgbToHsv(rgb.r, rgb.g, rgb.b);
    _cpState.h = hsv.h;
    _cpState.s = hsv.s;
    _cpState.v = hsv.v;

    const pop = document.createElement('div');
    pop.id = 'sd-color-picker';
    pop.style.cssText = `
        position:fixed; z-index:1000; background:#1e293b; border:1px solid rgba(255,255,255,0.1);
        border-radius:12px; padding:14px; width:260px; box-shadow:0 18px 40px rgba(0,0,0,0.45);
        font-family:'Inter', sans-serif; color:#f1f5f9; user-select:none;
    `;
    pop.innerHTML = `
        <div id="cp-sv" style="position:relative; width:100%; height:160px; border-radius:8px; cursor:crosshair; overflow:hidden;">
            <div id="cp-sv-bg" style="position:absolute; inset:0;"></div>
            <div style="position:absolute; inset:0; background:linear-gradient(to right, #fff, transparent);"></div>
            <div style="position:absolute; inset:0; background:linear-gradient(to top, #000, transparent);"></div>
            <div id="cp-sv-thumb" style="position:absolute; width:14px; height:14px; border:2px solid #fff; border-radius:50%; box-shadow:0 0 0 1px rgba(0,0,0,0.4); transform:translate(-50%,-50%); pointer-events:none;"></div>
        </div>
        <div id="cp-hue" style="position:relative; height:14px; margin-top:12px; border-radius:7px; cursor:pointer;
             background:linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%);">
            <div id="cp-hue-thumb" style="position:absolute; top:-2px; width:4px; height:18px; background:#fff; border:1px solid rgba(0,0,0,0.4); border-radius:2px; transform:translateX(-50%); pointer-events:none;"></div>
        </div>
        <div style="display:flex; align-items:center; gap:10px; margin-top:14px;">
            <div id="cp-preview" style="width:30px; height:30px; border-radius:6px; border:1px solid rgba(255,255,255,0.1);"></div>
            <input id="cp-hex" type="text" maxlength="7" style="flex:1; padding:6px 8px; border-radius:6px; border:1px solid rgba(255,255,255,0.08); background:#0f172a; color:#f1f5f9; font-family:'JetBrains Mono', monospace; font-size:0.85rem; outline:none;" />
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr 1fr; gap:6px; margin-top:8px;">
            <div><div style="font-size:0.7rem; color:#94a3b8; text-align:center; margin-bottom:2px;">R</div><input id="cp-r" type="number" min="0" max="255" style="width:100%; padding:5px 4px; border-radius:5px; border:1px solid rgba(255,255,255,0.08); background:#0f172a; color:#f1f5f9; text-align:center; font-size:0.8rem;" /></div>
            <div><div style="font-size:0.7rem; color:#94a3b8; text-align:center; margin-bottom:2px;">G</div><input id="cp-g" type="number" min="0" max="255" style="width:100%; padding:5px 4px; border-radius:5px; border:1px solid rgba(255,255,255,0.08); background:#0f172a; color:#f1f5f9; text-align:center; font-size:0.8rem;" /></div>
            <div><div style="font-size:0.7rem; color:#94a3b8; text-align:center; margin-bottom:2px;">B</div><input id="cp-b" type="number" min="0" max="255" style="width:100%; padding:5px 4px; border-radius:5px; border:1px solid rgba(255,255,255,0.08); background:#0f172a; color:#f1f5f9; text-align:center; font-size:0.8rem;" /></div>
        </div>
    `;
    document.body.appendChild(pop);
    _cpState.popover = pop;

    // Position near anchor.
    const r = anchorEl.getBoundingClientRect();
    let left = r.left;
    let top = r.bottom + 6;
    // Keep inside viewport.
    if (left + 260 > window.innerWidth) left = window.innerWidth - 270;
    if (top + 330 > window.innerHeight) top = r.top - 330 - 6;
    pop.style.left = `${Math.max(8, left)}px`;
    pop.style.top = `${Math.max(8, top)}px`;

    _cpRender();
    _cpWireDrag();
    _cpWireInputs();

    // Close on outside click (next tick so the opening click doesn't immediately close it).
    setTimeout(() => {
        document.addEventListener('mousedown', _cpDocClose);
    }, 0);
}
function closeColorPicker() {
    if (_cpState.popover) {
        _cpState.popover.remove();
        _cpState.popover = null;
    }
    document.removeEventListener('mousedown', _cpDocClose);
}
function _cpDocClose(e) {
    if (_cpState.popover && !_cpState.popover.contains(e.target)) closeColorPicker();
}
function _cpRender() {
    if (!_cpState.popover) return;
    const { h, s, v } = _cpState;
    const hex = _hsvToHex(h, s, v);
    const { r, g, b } = _hsvToRgb(h, s, v);

    const sv = _cpState.popover.querySelector('#cp-sv');
    const svBg = _cpState.popover.querySelector('#cp-sv-bg');
    const hueThumb = _cpState.popover.querySelector('#cp-hue-thumb');
    const svThumb = _cpState.popover.querySelector('#cp-sv-thumb');
    const preview = _cpState.popover.querySelector('#cp-preview');
    const hexInput = _cpState.popover.querySelector('#cp-hex');
    const rInput = _cpState.popover.querySelector('#cp-r');
    const gInput = _cpState.popover.querySelector('#cp-g');
    const bInput = _cpState.popover.querySelector('#cp-b');

    svBg.style.background = `hsl(${h * 360}, 100%, 50%)`;
    const svRect = sv.getBoundingClientRect();
    svThumb.style.left = (s * svRect.width) + 'px';
    svThumb.style.top = ((1 - v) * svRect.height) + 'px';
    const hueRect = _cpState.popover.querySelector('#cp-hue').getBoundingClientRect();
    hueThumb.style.left = (h * hueRect.width) + 'px';
    preview.style.background = hex;
    if (document.activeElement !== hexInput) hexInput.value = hex;
    if (document.activeElement !== rInput) rInput.value = r;
    if (document.activeElement !== gInput) gInput.value = g;
    if (document.activeElement !== bInput) bInput.value = b;

    if (typeof _cpState.onChange === 'function') _cpState.onChange(hex);
}
function _cpWireDrag() {
    const sv = _cpState.popover.querySelector('#cp-sv');
    const hue = _cpState.popover.querySelector('#cp-hue');
    let dragging = null; // 'sv' | 'hue'

    function svMove(e) {
        const rect = sv.getBoundingClientRect();
        const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));
        _cpState.s = x;
        _cpState.v = 1 - y;
        _cpRender();
    }
    function hueMove(e) {
        const rect = hue.getBoundingClientRect();
        _cpState.h = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        _cpRender();
    }
    function onMove(e) {
        if (dragging === 'sv') svMove(e);
        else if (dragging === 'hue') hueMove(e);
    }
    function stop() { dragging = null; }

    sv.addEventListener('mousedown', e => { dragging = 'sv'; svMove(e); e.preventDefault(); });
    hue.addEventListener('mousedown', e => { dragging = 'hue'; hueMove(e); e.preventDefault(); });
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', stop);
}
function _cpWireInputs() {
    const hexInput = _cpState.popover.querySelector('#cp-hex');
    const rInput = _cpState.popover.querySelector('#cp-r');
    const gInput = _cpState.popover.querySelector('#cp-g');
    const bInput = _cpState.popover.querySelector('#cp-b');
    hexInput.addEventListener('input', () => {
        const v = hexInput.value.trim();
        if (/^#?[0-9a-fA-F]{6}$/.test(v)) {
            const rgb = _hexToRgb(v.startsWith('#') ? v : '#' + v);
            const hsv = _rgbToHsv(rgb.r, rgb.g, rgb.b);
            _cpState.h = hsv.h; _cpState.s = hsv.s; _cpState.v = hsv.v;
            _cpRender();
        }
    });
    function syncFromRgb() {
        const r = Math.max(0, Math.min(255, +rInput.value || 0));
        const g = Math.max(0, Math.min(255, +gInput.value || 0));
        const b = Math.max(0, Math.min(255, +bInput.value || 0));
        const hsv = _rgbToHsv(r, g, b);
        _cpState.h = hsv.h; _cpState.s = hsv.s; _cpState.v = hsv.v;
        _cpRender();
    }
    rInput.addEventListener('input', syncFromRgb);
    gInput.addEventListener('input', syncFromRgb);
    bInput.addEventListener('input', syncFromRgb);
}
function _hexToRgb(hex) {
    const h = hex.replace('#', '');
    return { r: parseInt(h.substr(0,2), 16), g: parseInt(h.substr(2,2), 16), b: parseInt(h.substr(4,2), 16) };
}
function _rgbToHsv(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    const d = max - min;
    let h = 0;
    if (d !== 0) {
        if (max === r) h = ((g - b) / d) % 6;
        else if (max === g) h = (b - r) / d + 2;
        else h = (r - g) / d + 4;
        h /= 6;
        if (h < 0) h += 1;
    }
    const s = max === 0 ? 0 : d / max;
    return { h, s, v: max };
}
function _hsvToRgb(h, s, v) {
    let r, g, b;
    const i = Math.floor(h * 6);
    const f = h * 6 - i;
    const p = v * (1 - s);
    const q = v * (1 - f * s);
    const t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v; g = t; b = p; break;
        case 1: r = q; g = v; b = p; break;
        case 2: r = p; g = v; b = t; break;
        case 3: r = p; g = q; b = v; break;
        case 4: r = t; g = p; b = v; break;
        case 5: r = v; g = p; b = q; break;
    }
    return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
}
function _hsvToHex(h, s, v) {
    const { r, g, b } = _hsvToRgb(h, s, v);
    const hex = n => n.toString(16).padStart(2, '0');
    return '#' + hex(r) + hex(g) + hex(b);
}

// Wrap existing showPropertiesPanel to also render the floating toolbar.
(function _hookFloatingToolbar() {
    if (typeof showPropertiesPanel !== 'function') return;
    const orig = showPropertiesPanel;
    window.showPropertiesPanel = function () {
        orig();
        renderFloatingToolbar();
    };
})();

// Reposition while moving/scaling/rotating.
document.addEventListener('DOMContentLoaded', () => {
    if (!canvas) return;
    ['object:moving', 'object:scaling', 'object:rotating'].forEach(ev =>
        canvas.on(ev, () => positionFloatingToolbar()));
});

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

        if (e.ctrlKey && e.key === 'z') { e.preventDefault(); undo(); return; }
        if (e.ctrlKey && e.key === 'y') { e.preventDefault(); redo(); return; }
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
    const tabs = ['design', 'elements', 'text', 'draw', 'upload', 'photos', 'bg'];
    
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
                // User asked us to drop these three built-ins because they look weak compared to the
                // server-side library; keep the merged list but filter the noisy entries first.
                const SKIP_BUILTIN_TITLES = new Set(['Editorial Magazine', 'Data Dashboard', 'Swiss Grid']);
                const filteredBuiltins = SLIDIFY_BUILT_IN_TEMPLATES.filter(t =>
                    !SKIP_BUILTIN_TITLES.has((t.title || t.Title || '').trim()));
                const allTemplates = [...filteredBuiltins, ...data];
                if (allTemplates.length === 0) {
                    grid.innerHTML = '<p class="text-muted">Chưa có mẫu nào.</p>';
                    return;
                }
                renderTemplateCards(grid, allTemplates);
            })
            .catch(err => {
                console.error(err);
                document.getElementById('templates-loading').style.display = 'none';
                const SKIP_BUILTIN_TITLES = new Set(['Editorial Magazine', 'Data Dashboard', 'Swiss Grid']);
                const filteredBuiltins = SLIDIFY_BUILT_IN_TEMPLATES.filter(t =>
                    !SKIP_BUILTIN_TITLES.has((t.title || t.Title || '').trim()));
                renderTemplateCards(document.getElementById('templates-grid'), filteredBuiltins);
                showToast('Đang dùng mẫu có sẵn trong máy', 'info');
            });
    } else if (type === 'text') {
        panel.innerHTML = `
            <div class="drawer-title">Văn bản</div>
            <p style="color:#94A3B8; font-size:0.82rem; margin:0 0 14px;">Bấm để chèn — kéo thả lên canvas để đặt chính xác.</p>

            <div class="text-preset" onclick="addText('Thêm tiêu đề', 60, true)" draggable="true" ondragstart="dragStart(event, 'title')">
                <div class="text-preset-label">Tiêu đề lớn</div>
                <div class="text-preset-preview" style="font-size:1.4rem; font-weight:800; font-family:'Plus Jakarta Sans', 'Inter', sans-serif; color:#fff; letter-spacing:-0.02em;">Thêm tiêu đề</div>
            </div>

            <div class="text-preset" onclick="addText('Thêm tiêu đề phụ', 40, false)" draggable="true" ondragstart="dragStart(event, 'subtitle')">
                <div class="text-preset-label">Tiêu đề phụ</div>
                <div class="text-preset-preview" style="font-size:1.05rem; font-weight:600; font-family:'Inter', sans-serif; color:#E2E8F0;">Thêm tiêu đề phụ</div>
            </div>

            <div class="text-preset" onclick="addText('Thêm nội dung văn bản', 24, false)" draggable="true" ondragstart="dragStart(event, 'body')">
                <div class="text-preset-label">Văn bản thường</div>
                <div class="text-preset-preview" style="font-size:0.9rem; font-weight:400; font-family:'Inter', sans-serif; color:#CBD5E1; line-height:1.5;">Thêm nội dung văn bản của bạn ở đây.</div>
            </div>

            <div class="text-preset" onclick="addText('Trích dẫn nổi bật — thay đổi câu chữ tuỳ ý.', 28, false)" style="border-left:3px solid #7C5CFF;">
                <div class="text-preset-label">Trích dẫn</div>
                <div class="text-preset-preview" style="font-size:0.95rem; font-style:italic; font-family:'Georgia', serif; color:#E2E8F0; line-height:1.4;">"Trích dẫn nổi bật trên slide."</div>
            </div>

            <div class="text-preset" onclick="addText('Ghi chú nhỏ — chú thích nguồn, ngày tháng…', 16, false)">
                <div class="text-preset-label">Ghi chú</div>
                <div class="text-preset-preview" style="font-size:0.78rem; color:#94A3B8; font-family:'Inter', sans-serif;">Ghi chú nhỏ · chú thích</div>
            </div>

            <div class="text-preset" onclick="addText('LABEL · KICKER', 14, true)">
                <div class="text-preset-label">Kicker (mác đầu)</div>
                <div class="text-preset-preview" style="font-size:0.74rem; font-weight:800; letter-spacing:0.16em; color:#7C5CFF; font-family:'Inter', sans-serif;">LABEL · KICKER</div>
            </div>
        `;
    } else if (type === 'elements') {
        panel.innerHTML = `
            <div class="drawer-title">Thành phần</div>
            <input id="elem-search" placeholder="Tìm thành phần..." style="width:100%; box-sizing:border-box; padding:8px 12px; border-radius:8px; border:1px solid var(--border-color); background:var(--bg-secondary); color:var(--text-main); font-size:0.88rem; margin-bottom:14px; outline:none;">
            <div id="elem-categories"></div>
        `;
        _buildElementsPanel();
    } else if (type === 'photos') {
        panel.innerHTML = `
            <div class="drawer-title">Thư viện Ảnh</div>
            <div style="position:relative; margin-bottom:10px;">
                <i class="fa-solid fa-magnifying-glass" style="position:absolute; left:12px; top:50%; transform:translateY(-50%); color:var(--text-muted); font-size:0.85rem; pointer-events:none;"></i>
                <input id="photo-search-input" type="text" placeholder="Tìm ảnh (vd: con heo, núi, văn phòng…)"
                    onkeydown="if(event.key==='Enter') searchPhotos(this.value)"
                    style="width:100%; box-sizing:border-box; padding:9px 14px 9px 36px; border-radius:10px; border:1px solid var(--border-color); background:var(--bg-secondary); color:var(--text-main); font-size:0.85rem; outline:none;">
            </div>
            <div style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:12px;">
                <button class="photo-chip" onclick="searchPhotos('nature')">Thiên nhiên</button>
                <button class="photo-chip" onclick="searchPhotos('business')">Doanh nghiệp</button>
                <button class="photo-chip" onclick="searchPhotos('technology')">Công nghệ</button>
                <button class="photo-chip" onclick="searchPhotos('food')">Ẩm thực</button>
                <button class="photo-chip" onclick="searchPhotos('city')">Thành phố</button>
                <button class="photo-chip" onclick="searchPhotos('animal')">Động vật</button>
                <button class="photo-chip" onclick="searchPhotos('travel')">Du lịch</button>
                <button class="photo-chip" onclick="searchPhotos('education')">Giáo dục</button>
            </div>
            <p style="font-size:0.74rem; color:var(--text-muted); margin:0 0 12px;">Click để chèn · Chuột phải để đặt làm Nền</p>
            <div id="photo-grid" style="display:grid; grid-template-columns:1fr 1fr; gap:6px;">
                <div style="grid-column:span 2; text-align:center; color:var(--text-muted); padding:20px 0;">
                    <i class="fa-solid fa-spinner fa-spin"></i> Đang tải ảnh…
                </div>
            </div>
            <button id="photo-loadmore" onclick="searchPhotosMore()" style="display:none; margin:14px 0 4px; width:100%; padding:9px; border-radius:9px; background:var(--bg-secondary); color:var(--text-main); border:1px solid var(--border-color); cursor:pointer; font-family:'Inter',sans-serif; font-size:0.85rem; font-weight:600;">
                <i class="fa-solid fa-circle-down"></i> Tải thêm
            </button>
        `;
        // First open: prefill with a sensible default search.
        if (!window._lastPhotoQuery) window._lastPhotoQuery = 'business';
        searchPhotos(window._lastPhotoQuery);
    } else if (type === 'bg') {
        panel.innerHTML = `
            <div class="drawer-title">Màu Nền</div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <h5 style="color:var(--text-main); margin:0; font-size: 0.9rem;">Màu đơn sắc</h5>
            </div>
            <div style="display:grid; grid-template-columns: repeat(5, 1fr); gap:8px; margin-bottom: 20px;">
                <div style="height:40px; background:#ffffff; border:1px solid #ccc; border-radius:4px; cursor:pointer;" onclick="changeBackgroundColor('#ffffff')"></div>
                <div style="height:40px; background:#000000; border-radius:4px; cursor:pointer;" onclick="changeBackgroundColor('#000000')"></div>
                <div style="height:40px; background:#f8fafc; border:1px solid #ccc; border-radius:4px; cursor:pointer;" onclick="changeBackgroundColor('#f8fafc')"></div>
                <div style="height:40px; background:#1e293b; border-radius:4px; cursor:pointer;" onclick="changeBackgroundColor('#1e293b')"></div>
                <div style="height:40px; background:#fef08a; border-radius:4px; cursor:pointer;" onclick="changeBackgroundColor('#fef08a')"></div>
                <div style="height:40px; background:#fbcfe8; border-radius:4px; cursor:pointer;" onclick="changeBackgroundColor('#fbcfe8')"></div>
                <div style="height:40px; background:#bfdbfe; border-radius:4px; cursor:pointer;" onclick="changeBackgroundColor('#bfdbfe')"></div>
                <div style="height:40px; background:#bbf7d0; border-radius:4px; cursor:pointer;" onclick="changeBackgroundColor('#bbf7d0')"></div>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <h5 style="color:var(--text-main); margin:0; font-size: 0.9rem;">Nền Gradient đa sắc</h5>
            </div>
            <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:8px; margin-bottom: 20px;">
                <div style="height:40px; background:linear-gradient(135deg, #f97316, #facc15); border-radius:4px; cursor:pointer;" onclick="setBgGradient('#f97316', '#facc15')" title="Sunset Glow"></div>
                <div style="height:40px; background:linear-gradient(135deg, #3b82f6, #8b5cf6); border-radius:4px; cursor:pointer;" onclick="setBgGradient('#3b82f6', '#8b5cf6')" title="Ocean Breeze"></div>
                <div style="height:40px; background:linear-gradient(135deg, #ec4899, #f43f5e); border-radius:4px; cursor:pointer;" onclick="setBgGradient('#ec4899', '#f43f5e')" title="Romantic Pink"></div>
                <div style="height:40px; background:linear-gradient(135deg, #10b981, #059669); border-radius:4px; cursor:pointer;" onclick="setBgGradient('#10b981', '#059669')" title="Fresh Green"></div>
                <div style="height:40px; background:linear-gradient(135deg, #1e3a8a, #3b82f6); border-radius:4px; cursor:pointer;" onclick="setBgGradient('#1e3a8a', '#3b82f6')" title="Royal Corporate"></div>
                <div style="height:40px; background:linear-gradient(135deg, #0f172a, #1e293b); border-radius:4px; cursor:pointer;" onclick="setBgGradient('#0f172a', '#1e293b')" title="Dark Slate"></div>
                <div style="height:40px; background:linear-gradient(135deg, #c026d3, #06b6d4); border-radius:4px; cursor:pointer;" onclick="setBgGradient('#c026d3', '#06b6d4')" title="Cyberpunk"></div>
                <div style="height:40px; background:linear-gradient(135deg, #ffd700, #ff8c00); border-radius:4px; cursor:pointer;" onclick="setBgGradient('#ffd700', '#ff8c00')" title="Golden Hour"></div>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                <h5 style="color:var(--text-main); margin:0; font-size: 0.9rem;">Chọn màu tùy biến</h5>
            </div>
            <input type="color" onchange="changeBackgroundColor(this.value)" style="width:100%; height:40px; border:none; border-radius:4px; cursor:pointer;">
        `;
    } else if (type === 'upload') {
        let uploadHtml = `
            <div class="drawer-title">Tải ảnh lên</div>
            <label for="upload-img-input" class="upload-dropzone">
                <div class="upload-dropzone-icon"><i class="fa-solid fa-cloud-arrow-up"></i></div>
                <div class="upload-dropzone-title">Kéo thả ảnh vào đây</div>
                <div class="upload-dropzone-sub">hoặc <u>chọn từ máy</u></div>
                <div class="upload-dropzone-hint">JPG · PNG · WEBP · tối đa 8MB</div>
            </label>
            <div style="display:flex; align-items:center; justify-content:space-between; margin:18px 0 10px;">
                <h5 style="color:var(--text-main); margin:0; font-size:0.85rem; font-weight:700;">Ảnh đã tải lên</h5>
                <span style="font-size:0.74rem; color:var(--text-muted);">${uploadedImages.length} ảnh</span>
            </div>
        `;
        if (uploadedImages.length === 0) {
            uploadHtml += `
                <div style="text-align:center; padding:20px 12px; border:1px dashed var(--border-color); border-radius:10px; color:var(--text-muted); font-size:0.82rem;">
                    <i class="fa-regular fa-images" style="font-size:1.4rem; margin-bottom:6px; display:block;"></i>
                    Chưa có ảnh nào. Tải lên để dùng cho bài thuyết trình.
                </div>
            `;
        } else {
            uploadHtml += `<div style="display:grid; grid-template-columns: 1fr 1fr; gap:6px;">`;
            uploadedImages.forEach(url => {
                uploadHtml += `<div class="upload-thumb" onclick="addImageToCanvas('${url}')" oncontextmenu="setBgImage(event, '${url}')"><img src="${url}" alt="" /></div>`;
            });
            uploadHtml += `</div>`;
        }
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
                <label style="display:block; margin-bottom:5px; font-weight:600;">Äộ dày nét vẽ (<span id="draw-size-label">5</span>px):</label>
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

function normalizeTemplate(tpl) {
    if (!tpl) return null;
    const slides = tpl.slides || tpl.Slides || [];
    const normalizedSlides = slides.map(s => ({
        pageNumber: s.pageNumber || s.PageNumber || 1,
        backgroundColor: s.backgroundColor || s.BackgroundColor || '#ffffff',
        backgroundImage: s.backgroundImage || s.BackgroundImage || '',
        elementsJson: s.elementsJson || s.ElementsJson || '[]'
    }));
    return {
        id: tpl.id || tpl.Id || '',
        title: tpl.title || tpl.Title || 'Không tên',
        category: tpl.category || tpl.Category || 'Chung',
        thumbnailUrl: tpl.thumbnailUrl || tpl.ThumbnailUrl || '',
        isPremiumTemplate: tpl.isPremiumTemplate !== undefined ? tpl.isPremiumTemplate : (tpl.IsPremiumTemplate || false),
        premiumReason: tpl.premiumReason || tpl.PremiumReason || '',
        slides: normalizedSlides,
        slideCount: tpl.slideCount || tpl.SlideCount || normalizedSlides.length || 1,
        canUse: tpl.canUse !== undefined ? tpl.canUse : (tpl.CanUse !== undefined ? tpl.CanUse : true)
    };
}


async function buildTemplateThumbnailUrl(tpl) {
    const normTpl = normalizeTemplate(tpl);
    if (normTpl.thumbnailUrl) return normTpl.thumbnailUrl;
    if (!normTpl.slides.length) return '';
    try {
        const c = document.createElement('canvas');
        c.width = 320;
        c.height = 180;
        await _renderThumbCanvas(c, {
            BackgroundColor: normTpl.slides[0].backgroundColor,
            BackgroundImage: normTpl.slides[0].backgroundImage,
            ElementsJson: normTpl.slides[0].elementsJson
        });
        return c.toDataURL('image/jpeg', 0.72);
    } catch (e) {
        console.warn('Could not render template thumbnail:', e);
        return '';
    }
}

function renderTemplateCards(grid, templates) {
    if (!grid) return;
    grid.innerHTML = '';
    templates.forEach(tpl => {
        const normTpl = normalizeTemplate(tpl);
        const el = document.createElement('div');
        el.className = 'template-item';
        el.style = 'cursor:pointer; border-radius: 8px; overflow: hidden; border: 1px solid var(--border-color); transition: 0.2s; background:white;';

        const bgColor = getCategoryColor(normTpl.category);
        const thumbHtml = normTpl.thumbnailUrl
            ? `<img src="${normTpl.thumbnailUrl}" style="width:100%; height:100%; object-fit:cover;">`
            : `<canvas class="template-thumb-canvas" width="320" height="180" style="width:100%; height:100%; display:block; background:${bgColor};"></canvas>`;

        el.innerHTML = `
            <div style="aspect-ratio:16/9; overflow:hidden; position:relative;">
                ${thumbHtml}
                <div style="position:absolute; bottom:5px; right:5px; background:rgba(0,0,0,0.6); color:white; font-size:10px; padding:2px 6px; border-radius:10px;">${normTpl.slideCount} trang</div>
            </div>
            <div style="padding:8px;">
                <div style="font-size:0.9rem; font-weight:600; color:#1e293b; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${normTpl.title}</div>
                <div style="font-size:0.75rem; color:#64748b;">${normTpl.category}</div>
            </div>
        `;
        el.onclick = () => _showTemplatePreviewPanel(normTpl);
        grid.appendChild(el);

        if (!normTpl.thumbnailUrl) {
            const thumbCanvas = el.querySelector('.template-thumb-canvas');
            const firstSlide = normTpl.slides[0];
            if (thumbCanvas && firstSlide) {
                _renderThumbCanvas(thumbCanvas, {
                    BackgroundColor: firstSlide.backgroundColor,
                    BackgroundImage: firstSlide.backgroundImage,
                    ElementsJson: firstSlide.elementsJson
                });
            }
        }
    });
}

async function applyTemplateToPresentation(tpl) {
    const normTpl = normalizeTemplate(tpl);
    if (!normTpl || !normTpl.slides || normTpl.slides.length === 0) return;
    if (!confirm(`Áp dụng mẫu "${normTpl.title}" và thay toàn bộ slide hiện tại?`)) return;

    const templateThumbnailUrl = await buildTemplateThumbnailUrl(normTpl);
    canvas.clear();
    slideDataArray = normTpl.slides.map((s, idx) => ({
        PageNumber: idx + 1,
        BackgroundColor: s.backgroundColor,
        BackgroundImage: s.backgroundImage || '',
        ElementsJson: s.elementsJson
    }));

    renderSlideThumbnails();
    loadSlide(0, true);
    triggerAutoSave();
    showToast(`Đã áp dụng mẫu ${normTpl.title}`, 'success');
}

/* --- ULTRA CANVA UPGRADES --- */

// 1. Group & Ungroup Elements
function groupSelectedObjects() {
    if (!canvas) return;
    const activeObj = canvas.getActiveObject();
    if (!activeObj || activeObj.type !== 'activeSelection') {
        showToast('Vui lòng chọn nhiều đối tượng để nhóm!', 'error');
        return;
    }
    activeObj.toGroup();
    canvas.requestRenderAll();
    triggerAutoSave();
    showToast('Đã nhóm các đối tượng!', 'success');
    showPropertiesPanel();
}

function ungroupSelectedObjects() {
    if (!canvas) return;
    const activeObj = canvas.getActiveObject();
    if (!activeObj || activeObj.type !== 'group') {
        showToast('Vui lòng chọn một nhóm để rã!', 'error');
        return;
    }
    activeObj.toActiveSelection();
    canvas.requestRenderAll();
    triggerAutoSave();
    showToast('Đã rã nhóm đối tượng!', 'success');
    showPropertiesPanel();
}

// 2. Canva Text Effects
function applyTextEffect(effectName) {
    const activeObj = canvas.getActiveObject();
    if (!activeObj || (activeObj.type !== 'i-text' && activeObj.type !== 'text')) return;

    if (activeObj.fill && activeObj.fill !== 'transparent') {
        activeObj._prevFill = activeObj.fill;
    }

    if (effectName === 'none') {
        activeObj.set({
            fill: activeObj._prevFill || '#333333',
            stroke: null,
            strokeWidth: 0,
            shadow: null
        });
    } else if (effectName === 'hollow') {
        activeObj.set({
            fill: 'transparent',
            stroke: activeObj._prevFill || '#333333',
            strokeWidth: 2,
            shadow: null
        });
    } else if (effectName === 'neon') {
        const glowColor = activeObj._prevFill || '#6366f1';
        activeObj.set({
            fill: glowColor,
            stroke: null,
            strokeWidth: 0,
            shadow: new fabric.Shadow({
                color: glowColor,
                blur: 18,
                offsetX: 0,
                offsetY: 0
            })
        });
    } else if (effectName === 'outline') {
        activeObj.set({
            fill: activeObj._prevFill || '#333333',
            stroke: '#ffffff',
            strokeWidth: 1.5,
            shadow: null
        });
    } else if (effectName === 'shadow') {
        activeObj.set({
            fill: activeObj._prevFill || '#333333',
            stroke: null,
            strokeWidth: 0,
            shadow: new fabric.Shadow({
                color: 'rgba(0,0,0,0.5)',
                blur: 8,
                offsetX: 4,
                offsetY: 4
            })
        });
    }
    
    canvas.requestRenderAll();
    triggerAutoSave();
}

// 3. Smart Snap Guides
let aligningLineColor = 'rgba(236, 72, 153, 0.8)';
let aligningLineWidth = 1.5;
let alignSnapThreshold = 10;

function initAlignmentGuides() {
    if (!canvas) return;

    let vGuides = [];
    let hGuides = [];

    canvas.on('object:moving', function(e) {
        if (!canvas) return;
        const obj = e.target;
        if (!obj) return;

        vGuides = [];
        hGuides = [];

        const canvasWidth = canvas.width;
        const canvasHeight = canvas.height;

        const objCenter = obj.getCenterPoint();
        const objWidth = obj.getScaledWidth();
        const objHeight = obj.getScaledHeight();

        const objLeft = objCenter.x - objWidth / 2;
        const objRight = objCenter.x + objWidth / 2;
        const objTop = objCenter.y - objHeight / 2;
        const objBottom = objCenter.y + objHeight / 2;

        let snappedX = false;
        let snappedY = false;

        // Canvas Center horizontal snap
        if (Math.abs(objCenter.x - canvasWidth / 2) < alignSnapThreshold) {
            obj.set({ left: canvasWidth / 2 - objWidth / 2 * obj.scaleX + (obj.left - (objCenter.x - objWidth / 2)) });
            obj.setCoords();
            vGuides.push(canvasWidth / 2);
            snappedX = true;
        }

        // Canvas Center vertical snap
        if (Math.abs(objCenter.y - canvasHeight / 2) < alignSnapThreshold) {
            obj.set({ top: canvasHeight / 2 - objHeight / 2 * obj.scaleY + (obj.top - (objCenter.y - objHeight / 2)) });
            obj.setCoords();
            hGuides.push(canvasHeight / 2);
            snappedY = true;
        }

        // Snap to other objects
        canvas.getObjects().forEach(function(otherObj) {
            if (otherObj === obj || !otherObj.selectable) return;

            const otherCenter = otherObj.getCenterPoint();
            const otherWidth = otherObj.getScaledWidth();
            const otherHeight = otherObj.getScaledHeight();

            const otherLeft = otherCenter.x - otherWidth / 2;
            const otherRight = otherCenter.x + otherWidth / 2;
            const otherTop = otherCenter.y - otherHeight / 2;
            const otherBottom = otherCenter.y + otherHeight / 2;

            if (!snappedX) {
                if (Math.abs(objLeft - otherLeft) < alignSnapThreshold) {
                    obj.set({ left: otherLeft });
                    obj.setCoords();
                    vGuides.push(otherLeft);
                    snappedX = true;
                } else if (Math.abs(objCenter.x - otherCenter.x) < alignSnapThreshold) {
                    obj.set({ left: otherCenter.x - objWidth / 2 });
                    obj.setCoords();
                    vGuides.push(otherCenter.x);
                    snappedX = true;
                } else if (Math.abs(objRight - otherRight) < alignSnapThreshold) {
                    obj.set({ left: otherRight - objWidth });
                    obj.setCoords();
                    vGuides.push(otherRight);
                    snappedX = true;
                }
            }

            if (!snappedY) {
                if (Math.abs(objTop - otherTop) < alignSnapThreshold) {
                    obj.set({ top: otherTop });
                    obj.setCoords();
                    hGuides.push(otherTop);
                    snappedY = true;
                } else if (Math.abs(objCenter.y - otherCenter.y) < alignSnapThreshold) {
                    obj.set({ top: otherCenter.y - objHeight / 2 });
                    obj.setCoords();
                    hGuides.push(otherCenter.y);
                    snappedY = true;
                } else if (Math.abs(objBottom - otherBottom) < alignSnapThreshold) {
                    obj.set({ top: otherBottom - objHeight });
                    obj.setCoords();
                    hGuides.push(otherBottom);
                    snappedY = true;
                }
            }
        });

        canvas.requestRenderAll();
    });

    canvas.on('before:render', function() {
        if (canvas) canvas.clearContext(canvas.contextTop);
    });

    canvas.on('after:render', function() {
        if (!canvas || (!vGuides.length && !hGuides.length)) return;

        const ctx = canvas.contextTop;
        if (!ctx) return;

        ctx.save();
        ctx.strokeStyle = aligningLineColor;
        ctx.lineWidth = aligningLineWidth;
        ctx.setLineDash([5, 5]);

        const zoom = canvas.getZoom();

        vGuides.forEach(function(x) {
            ctx.beginPath();
            ctx.moveTo(x * zoom, 0);
            ctx.lineTo(x * zoom, canvas.height * zoom);
            ctx.stroke();
        });

        hGuides.forEach(function(y) {
            ctx.beginPath();
            ctx.moveTo(0, y * zoom);
            ctx.lineTo(canvas.width * zoom, y * zoom);
            ctx.stroke();
        });

        ctx.restore();
    });

    canvas.on('object:modified', function() {
        vGuides = [];
        hGuides = [];
        canvas.requestRenderAll();
    });
}

// 4. Gradient backgrounds
function setBgGradient(color1, color2) {
    if (!canvas) return;
    
    const grad = new fabric.Gradient({
        type: 'linear',
        coords: { x1: 0, y1: 0, x2: canvas.width, y2: canvas.height },
        colorStops: [
            { offset: 0, color: color1 },
            { offset: 1, color: color2 }
        ]
    });
    
    canvas.setBackgroundImage(null, () => {
        canvas.backgroundColor = grad;
        canvas.renderAll();
        if (slideDataArray[currentSlideIndex]) {
            slideDataArray[currentSlideIndex].BackgroundImage = '';
        }
        triggerAutoSave();
        showToast('Đã áp dụng nền Gradient', 'success');
    });
}

function changeBackgroundColor(color) {
    if (!canvas) return;
    canvas.setBackgroundImage(null, () => {
        canvas.backgroundColor = color;
        canvas.renderAll();
        if (slideDataArray[currentSlideIndex]) {
            slideDataArray[currentSlideIndex].BackgroundImage = '';
            slideDataArray[currentSlideIndex].BackgroundColor = color;
        }
        triggerAutoSave();
    });
}


