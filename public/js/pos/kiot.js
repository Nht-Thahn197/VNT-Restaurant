function timeAgo(dateString) {
    const now  = new Date();
    const past = new Date(dateString);
    const diff = Math.floor((now - past) / 1000); // giây

    if (diff < 60) {
        return diff + ' giây trước';
    }

    const minutes = Math.floor(diff / 60);
    if (minutes < 60) {
        return minutes + ' phút trước';
    }

    const hours = Math.floor(minutes / 60);
    if (hours < 24) {
        return hours + ' giờ trước';
    }

    const days = Math.floor(hours / 24);
    if (days < 30) {
        return days + ' ngày trước';
    }

    const months = Math.floor(days / 30);
    if (months < 12) {
        return months + ' tháng trước';
    }

    const years = Math.floor(months / 12);
    return years + ' năm trước';
}

document.addEventListener('DOMContentLoaded', () => {

    document.querySelectorAll('section').forEach(section => {

        const canvas = section.querySelector('canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');

        let currentMode    = 'hour';
        let currentRange   = 'today';
        let currentMetric  = 'quantity';
        let chart = null;

        const baseUrl =
            document.querySelector('meta[name="base-url"]')
            ?.getAttribute('content') || '';

        /* ================= API ================= */
        function getApi() {
            if (section.classList.contains('revenue-section')) return 'revenue';
            if (section.classList.contains('order-section'))   return 'orders';
            if (section.classList.contains('product-section')) return 'products';
            return '';
        }

        /* ================= FETCH ================= */
        async function loadData() {

            const api = getApi();
            if (!api) return;

            let url = `${baseUrl}/pos/${api}?range=${currentRange}`;

            if (api === 'products') {
                url += `&metric=${currentMetric}`;
            } else {
                url += `&mode=${currentMode}`;
            }

            const res  = await fetch(url);
            const data = await res.json();
            renderChart(data);
        }

        /* ================= LABEL ================= */
        function formatLabel(label) {

            if (section.classList.contains('product-section')) {
                return label;
            }

            if (currentMode === 'hour') {
                return `${label}h`;
            }

            if (currentMode === 'day') {
                return new Date(label).toLocaleDateString('vi-VN');
            }

            if (currentMode === 'weekday') {
                const map = { 1:'CN',2:'T2',3:'T3',4:'T4',5:'T5',6:'T6',7:'T7' };
                return map[label];
            }
        }

        /* ================= CHART ================= */
        function renderChart(data) {

            const isProduct = section.classList.contains('product-section');

            const labels = isProduct
                ? data.map(i => i.label)
                : data.map(i => formatLabel(i.label));

            const values = data.map(i => i.total);

            if (chart) chart.destroy();

            chart = new Chart(ctx, {
                type: 'bar',
                data: {
                    labels,
                    datasets: [{
                        data: values,
                        backgroundColor: '#0A8BD6',
                        borderRadius: 6,
                        barThickness: 36
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    indexAxis: isProduct ? 'y' : 'x',
                    plugins: { legend: { display: false } },
                    scales: {

                        // ===== TRỤC X =====
                        x: {
                            grid: { display: false },

                            // 👉 CHỈ FORMAT KHI X LÀ VALUE
                            ticks: isProduct ? {
                                callback: v =>
                                    currentMetric === 'revenue'
                                        ? v.toLocaleString('vi-VN') + ' ₫'
                                        : v.toLocaleString('vi-VN')
                            } : {}
                        },

                        // ===== TRỤC Y =====
                        y: {
                            ticks: !isProduct ? {
                                callback: v => v.toLocaleString('vi-VN')
                            } : {
                                autoSkip: false // giữ đủ tên món
                            }
                        }
                    }
                }
            });
        }

        /* ================= TABS (chỉ revenue & order) ================= */
        if (!section.classList.contains('product-section')) {
            section.querySelectorAll('.tab').forEach(tab => {
                tab.addEventListener('click', () => {
                    section.querySelectorAll('.tab')
                        .forEach(t => t.classList.remove('active'));

                    tab.classList.add('active');
                    currentMode = tab.dataset.mode;
                    loadData();
                });
            });
        }

    /* ================= DROPDOWN (range + metric) ================= */
    section.querySelectorAll('.range-dropdown').forEach(dropdown => {

        const btn  = dropdown.querySelector('.range-btn');
        const menu = dropdown.querySelector('.range-menu');

        btn.addEventListener('click', e => {
            e.stopPropagation(); // ⛔ chặn click lan ra document
            menu.classList.toggle('show');
        });

        menu.querySelectorAll('div').forEach(item => {
            item.addEventListener('click', () => {

                if (item.dataset.range) {
                    currentRange = item.dataset.range;
                }

                if (item.dataset.metric) {
                    currentMetric = item.dataset.metric;
                }

                btn.innerText = item.innerText + ' ▾';
                menu.classList.remove('show');
                loadData();
            });
        });
    });

    /* đóng menu khi click ra ngoài */
    document.addEventListener('click', () => {
        section.querySelectorAll('.range-menu')
            .forEach(m => m.classList.remove('show'));
    });


        /* ================= INIT ================= */
        loadData();
    });

    fetch('/VNT-Restaurant/public/pos/dashboard/activity')
    .then(r => r.json())
    .then(data => {

        const ul = document.getElementById('activityList');
        ul.innerHTML = '';

        data.forEach(i => {

            ul.innerHTML += `
            <li class="activity-item activity-${i.action}">
                <div class="activity-icon">
                    ${getActivityIcon(i.action)}
                </div>

                <div class="activity-content">
                    <strong>${i.staff_name ?? 'Ốc Năm Tư'}</strong>
                    ${i.description}
                    <div class="activity-time">
                        ${timeAgo(i.created_at)}
                    </div>
                </div>
            </li>
            `;
        });
    });

    function getActivityIcon(action) {
        switch (action) {
            case 'checkout':       return '🛒';
            case 'import':         return '📥';
            case 'export':         return '📤';
            case 'cancel_import':  return '❌';
            case 'cancel_export':  return '❌';
            case 'cancel_invoice': return '⚠️';
            default:               return '📌';
        }
    }

});
