function formatPrice(num) {
    num = Number(num) || 0;
    return num.toLocaleString('vi-VN');
}
// ===== GLOBAL STATE =====
let currentArea = 'all';
let currentAreaName = 'Tất cả';
let currentTableId = null;
let currentTable = null;
let currentTab = 'tables';
let orderItems = {};

document.addEventListener('DOMContentLoaded', () => {

    /* ================= ELEMENT ================= */
    const tableItems = document.querySelectorAll('.table-item');
    const pagination = document.getElementById('tablePagination');
    const statusRadios = document.querySelectorAll('input[name="status"]');

    /* ================= STATUS FILTER ================= */
    statusRadios.forEach(radio => {
        radio.addEventListener('change', applyTableFilters);
    });

    /* ================= APPLY FILTER (CORE LOGIC) ================= */
    function applyTableFilters() {
        const status =
            document.querySelector('input[name="status"]:checked')?.value || 'all';

        let visibleCount = 0;

        tableItems.forEach(table => {
            let show = true;

            /* ===== AREA FILTER ===== */
            if (currentArea !== 'all' && table.dataset.areaId != currentArea) {
                show = false;
            }

            /* ===== STATUS FILTER (JS RUNTIME) ===== */
            if (status === 'active' && !table.classList.contains('using')) {
                show = false;
            }

            if (status === 'inactive' && table.classList.contains('using')) {
                show = false;
            }

            table.style.display = show ? '' : 'none';
            if (show) visibleCount++;
        });

        /* ===== PAGINATION RULE ===== */
        if (!pagination) return;

        // CHỈ hiện pagination khi:
        // - area = all
        // - status = all
        if (currentArea === 'all' && status === 'all') {
            pagination.style.display = 'flex';
        } else {
            pagination.style.display = 'none';
        }
    }

    /* ================= INIT ================= */
    applyTableFilters();

    /* ================= SELECT TABLE ================= */
    const selectedTableBtn = document.getElementById('selectedTableBtn');

    tableItems.forEach(table => {
        table.addEventListener('click', () => {
            // clear active
            tableItems.forEach(t => t.classList.remove('active'));
            table.classList.add('active');

            // data
            currentTableId = table.dataset.id;
            currentTable = {
                id: table.dataset.id,
                name: table.dataset.name,
                areaId: table.dataset.areaId
            };
            currentAreaName = table.dataset.areaName || '';

            // 👉 LƯU LOCAL STORAGE (CỰC QUAN TRỌNG)
            localStorage.setItem('pos_current_table', currentTableId);
            localStorage.setItem('pos_current_table_name', currentTable.name);
            localStorage.setItem('pos_current_area_name', currentAreaName);

            // update UI
            if (selectedTableBtn) {
                selectedTableBtn.innerText =
                    `${currentTable.name} / ${currentAreaName}`;
                selectedTableBtn.disabled = false;
                selectedTableBtn.classList.add('active');
            }

            // load order
            loadOrderByTable?.(currentTableId);
        });
    });

    const categoryLinks = document.querySelectorAll('.category-link');

    function applyCategory(category) {
        categoryLinks.forEach(l =>
            l.classList.toggle('active', l.dataset.category === category)
        );

        document.querySelectorAll('.menu-item').forEach(item => {
            item.style.display =
                category === 'all' || item.dataset.category === category
                    ? 'block'
                    : 'none';
        });
    }

    categoryLinks.forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();

            const category = link.dataset.category || 'all';

            const url = new URL(window.location);
            url.searchParams.set('tab', 'menu');
            url.searchParams.set('category', category);
            history.pushState({}, '', url);

            applyCategory(category);
        });
    });
    


    /* ================= ORDER LOGIC ================= */    
    const STORAGE_KEY = 'pos_orders_by_table';
    const searchUrl = document
    .querySelector('meta[name="search-product-url"]')
    .getAttribute('content');
    const orderList = document.getElementById('orderList');
    const notifyBtn = document.getElementById('notifyBtn');
    const searchInput  = document.querySelector('.search-input');
    const searchResult = document.getElementById('searchResult');

    let ordersByTable = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {};

    function addToOrder(id, name, price, unit,type_menu) {
    if (!currentTableId) {
        alert('Vui lòng chọn bàn trước khi gọi món');
        return;
    }

    if (orderItems[id]) {
        orderItems[id].qty++;
    } else {
        orderItems[id] = {
            id,
            name,
            unit,
            price: parseInt(price),
            qty: 1,
            type_menu
        };
    }

    renderOrder();
    }

    document.addEventListener('click', e => {
    const item = e.target.closest('.menu-item');
    if (!item) return;

    addToOrder(
        item.dataset.id,
        item.querySelector('h4').innerText,
        item.dataset.price,
        item.dataset.unit,
        item.dataset.type
    );
});

    searchInput.addEventListener('input', async function () {
    const q = this.value.trim().toLowerCase();

    if (q.length < 1) {
        searchResult.innerHTML = '';
        searchResult.style.display = 'none';
        return;
    }

    const res = await fetch(`${searchUrl}?q=${encodeURIComponent(q)}`);
    const data = await res.json();

    searchResult.innerHTML = data.map(p => `
        <div class="search-item"
            data-id="${p.id}"
            data-name="${p.name}"
            data-price="${p.price}"
            data-unit="${p.unit}">
            <strong>${p.name}</strong>
            <span>${Number(p.price).toLocaleString()} / ${p.unit}</span>
        </div>
    `).join('');

    searchResult.style.display = 'block';
    });

    searchResult.addEventListener('click', e => {
        const item = e.target.closest('.search-item');
        if (!item) return;

        addToOrder(
            item.dataset.id,
            item.dataset.name,
            item.dataset.price,
            item.dataset.unit,
            item.dataset.type
        );

        searchInput.value = '';
        searchResult.innerHTML = '';
        searchResult.style.display = 'none';
    });

    window.changeQty = function (id, delta) {
        if (!orderItems[id]) return;
        orderItems[id].qty += delta;
        if (orderItems[id].qty <= 0) delete orderItems[id];
        renderOrder();
    };

    window.removeItem = function (id) {
        delete orderItems[id];
        renderOrder();
    };

    function renderOrder() {
        orderList.innerHTML = '';
        let index = 1;

        if (Object.keys(orderItems).length === 0) {
            orderList.innerHTML = `
                <p class="empty">
                    Chưa có món trong đơn<br>
                    Vui lòng chọn món trong thực đơn bên trái màn hình
                </p>`;
            // reset UI
            saveOrder();
            calculateTotal();
            updateNotifyButton();
            updateTableStatus(false);
            return;
        }

        Object.values(orderItems).forEach(item => {
            const div = document.createElement('div');
            div.className = 'order-item';

            div.innerHTML = `
                <div class="oi-stt">${index++}</div>
                <div class="oi-name">
                    <strong>${item.name}</strong>
                    <small>${item.unit}</small>
                </div>
                <div class="oi-qty">
                    <button onclick="changeQty('${item.id}',-1)">−</button>
                    <input type="text" value="${item.qty}" readonly>
                    <button onclick="changeQty('${item.id}',1)">+</button>
                </div>
                <div class="oi-price">${formatPrice(item.price)}</div>
                <div class="oi-total">${formatPrice(item.price * item.qty)}</div>
                <div class="oi-remove">
                    <button onclick="removeItem('${item.id}')">✕</button>
                </div>
            `;

            orderList.appendChild(div);
        });
        saveOrder();
        calculateTotal();
        updateNotifyButton();
        updateTableStatus(true);
    }

    // Change Status
    function updateTableStatus(isUsing) {
    if (!currentTableId) return;

    document.querySelectorAll('.table-item').forEach(t => {
        if (t.dataset.id === currentTableId) {
            t.classList.toggle('using', isUsing);
        }
    });
    }

    // Save order
    function saveOrder() {
    if (!currentTableId) return;

    ordersByTable[currentTableId] = orderItems;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ordersByTable));
    }

    // Change Button Noti
    function updateNotifyButton() {
    const hasOrder = Object.keys(orderItems).length > 0;

    if (hasOrder) {
        notifyBtn.classList.add('has-order');
    } else {
        notifyBtn.classList.remove('has-order');
    }
    }

    // Total Price
    function calculateTotal() {
    let total = 0;

    Object.values(orderItems).forEach(item => {
        total += item.price * item.qty;
    });

    document.getElementById('totalPrice').innerText =
        total.toLocaleString('vi-VN');
    }

    /* ================= LOAD TAB FROM URL ================= */
    function setActiveTab(tab) {
    // clear
        document.querySelectorAll('.nav-tabs li')
            .forEach(li => li.classList.remove('active'));

        document.querySelectorAll('.tab-content')
            .forEach(c => c.classList.remove('active'));

        // active nav
        const activeLink =
            document.querySelector(`.nav-tabs a[href*="tab=${tab}"]`)
            || document.querySelector(`.nav-tabs a[href*="tab=tables"]`);

        activeLink?.closest('li')?.classList.add('active');

        // active content
        document.getElementById(`tab-${tab}`)
            ?.classList.add('active');
    }
    const params = new URLSearchParams(window.location.search);

    // Nếu URL KHÔNG có tab → mặc định tables
    currentTab = params.get('tab') || 'tables';

    // 👉 SET ACTIVE NGAY KHI LOAD
    setActiveTab(currentTab);

    document.querySelectorAll('.nav-tabs a').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();

            const href = link.getAttribute('href');
            if (!href) return;

            const url = new URL(href, window.location.origin);
            const newTab = url.searchParams.get('tab') || 'tables';

            history.pushState({}, '', url);

            currentTab = newTab;
            setActiveTab(currentTab);
        });
    });

    const currentCategory = params.get('category') || 'all';

    if (currentTab === 'menu') {
        applyCategory(currentCategory);
    }



    function loadOrderByTable(tableId) {
        orderItems = ordersByTable[tableId] || {};
        renderOrder();
    }

    Object.keys(ordersByTable).forEach(tableId => {
    if (Object.keys(ordersByTable[tableId]).length > 0) {
        const table = document.querySelector(`.table-item[data-id="${tableId}"]`);
        table?.classList.add('using');
    }
    });
});

function renderPayOrderList() {
    const wrap = document.getElementById('payOrderList');
    wrap.innerHTML = '';

    if (Object.keys(orderItems).length === 0) {
        wrap.innerHTML = '<p class="empty">Không có món</p>';
        return;
    }

    const groups = {
        Food: [],
        Drink: [],
        Other: []
    };

    Object.values(orderItems).forEach(item => {
        if (groups[item.type_menu]) {
            groups[item.type_menu].push(item);
        }
    });

    const labels = {
        Food: 'ĐỒ ĂN',
        Drink: 'ĐỒ UỐNG',
        Other: 'KHÁC'
    };

    Object.keys(groups).forEach(type => {
        if (groups[type].length === 0) return;

        const groupDiv = document.createElement('div');
        groupDiv.className = 'pay-group';

        groupDiv.innerHTML = `
            <div class="group-title">${labels[type]}</div>
        `;

        groups[type].forEach(item => {
            const row = document.createElement('div');
            row.className = 'pay-item';

            row.innerHTML = `
                <div class="name">
                    <strong>${item.name}</strong>
                    <small>${item.unit}</small>
                </div>
                <div class="qty">${item.qty}</div>
                <div class="price">${formatPrice(item.price)}</div>
                <div class="total">${formatPrice(item.price * item.qty)}</div>
            `;

            groupDiv.appendChild(row);
        });

        wrap.appendChild(groupDiv);
    });
}

function calculatePaySummary() {
    let sum = 0;

    Object.values(orderItems).forEach(item => {
        sum += item.price * item.qty;
    });

    const discount = Number(document.getElementById('discountInput').value || 0);
    const needPay = Math.max(sum - discount, 0);

    document.getElementById('sumPrice').innerText = formatPrice(sum);
    document.getElementById('needPay').innerText = formatPrice(needPay);
}

document.getElementById('discountInput')
    .addEventListener('input', calculatePaySummary);

    function renderPayHeader(tableName, areaName) {
    document.getElementById('payTableInfo').innerText =
        `Bàn ${tableName} / ${areaName}`;

    const now = new Date();
    document.getElementById('payTime').innerText =
        now.toLocaleString('vi-VN');
}

function openPayDrawer(tableName, areaName) {
    document.getElementById('payOverlay').classList.add('show');
    document.getElementById('payDrawer').classList.add('show');

    renderPayHeader(tableName, areaName);
    renderPayOrderList();
    calculatePaySummary();
}

function closePayDrawer() {
    document.getElementById('payOverlay').classList.remove('show');
    document.getElementById('payDrawer').classList.remove('show');
}

document.getElementById('closePay').onclick = closePayDrawer;
document.getElementById('payOverlay').onclick = closePayDrawer;

document.querySelector('.btn.pay').addEventListener('click', () => {
    if (!currentTable) {
        alert('Vui lòng chọn bàn');
        return;
    }

    openPayDrawer(currentTable.name, currentAreaName);
});


function getPayMethod() {
    return document.querySelector('input[name="pay_method"]:checked').value;
}

