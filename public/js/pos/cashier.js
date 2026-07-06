document.addEventListener('DOMContentLoaded', () => {
    updateServicingCount();
    const appBaseUrl = document
        .querySelector('meta[name="base-url"]')
        ?.getAttribute('content') || window.location.origin;
    const csrfToken = document
    .querySelector('meta[name="csrf-token"]')
    ?.getAttribute('content');
    const vnpayCreateUrl = document
        .querySelector('meta[name="vnpay-create-url"]')
        ?.getAttribute('content');
    
    /* ================= ELEMENT ================= */
    const tabLinks = document.querySelectorAll('.nav-tabs li a');
    const tabContents = document.querySelectorAll('.tab-content');
    const tableItems = document.querySelectorAll('.table-item');
    const menuItems = document.querySelectorAll('.menu-item');
    const selectedTableBtn = document.getElementById('selectedTableBtn');
    const transferModal = document.getElementById('transferTableModal');
    const targetTableSelect = document.getElementById('targetTableSelect');
    const orderList = document.getElementById('orderList');
    const totalPriceEl = document.getElementById('totalPrice');
    const notifyBtn = document.getElementById('notifyBtn');
    const searchInput  = document.querySelector('.search-input');
    const searchResult = document.getElementById('searchResult');
    const searchUrl    = document.querySelector('meta[name="search-product-url"]').getAttribute('content');
    const payOverlay = document.getElementById('payOverlay');
    const payDrawer = document.getElementById('payDrawer');
    const openPayBtn = document.getElementById('openPay');
    const closePayBtn = document.getElementById('closePay');
    const discountBtn = document.getElementById('discountBtn');
    const discountPopup = document.getElementById('discountPopup');
    const discountCancel = document.getElementById('discountCancel');
    const discountSave = document.getElementById('discountSave');
    const discountValue = document.getElementById('discountValue');
    const discountInput = document.getElementById('discountInput');
    const promotionBtn = document.getElementById('promotionBtn');
    const promotionPopup = document.getElementById('promotionPopup');
    const promotionList = document.getElementById('promotionList');
    const promotionIdInput = document.getElementById('promotionId');
    const payTableInfo = document.getElementById('payTableInfo');
    const payTime = document.getElementById('payTime');
    const areaLinks = document.querySelectorAll('.area-filter a');
    const categoryLinks = document.querySelectorAll('.category-bar a');
    const categoryScroll = document.getElementById('categoryScroll');
    const catPrevBtn = document.querySelector('.cat-scroll-btn.left');
    const catNextBtn = document.querySelector('.cat-scroll-btn.right');
    const menuBtn = document.getElementById('menuBtn');
    const dropdownMenu = document.getElementById('dropdownMenu');
    const logoutLink = document.getElementById('logoutLink');
    
    const CONFIG = {
    tablePerPage: 36,
    menuPerPage: 15
    };

    let orderItems = {};
    let searchTimeout = null;
    let discountType = 'vnd';
    let discountAmount = 0;
    let promotionDiscount = 0;
    let selectedPromotion = null;
    let currentTablePage = 1;
    let currentMenuPage = 1;
    
    const confirmAction = (message, options = {}) => {
        if (typeof window.openConfirmDialog === 'function') {
            return window.openConfirmDialog(message, options);
        }
        return Promise.resolve(window.confirm(message || 'Xác nhận?'));
    };
    const openConfirmDialog = confirmAction;

    (function initAppConfirmDialog() {
        if (typeof window.openConfirmDialog === 'function') {
            return;
        }

        const overlay = document.getElementById('appConfirmOverlay');
        if (!overlay) {
            return;
        }

        const dialog = document.getElementById('appConfirmDialog');
        const titleEl = document.getElementById('appConfirmTitle');
        const messageEl = document.getElementById('appConfirmMessage');
        const confirmBtn = document.getElementById('appConfirmOk');
        const cancelBtn = document.getElementById('appConfirmCancel');
        const closeBtn = document.getElementById('appConfirmClose');
        const iconEl = overlay.querySelector('.app-confirm-icon i');
        let resolveConfirm = null;
        let keyHandler = null;

        const closeConfirm = (result) => {
            overlay.classList.remove('active');
            overlay.setAttribute('aria-hidden', 'true');

            if (resolveConfirm) {
                resolveConfirm(Boolean(result));
                resolveConfirm = null;
            }

            if (keyHandler) {
                document.removeEventListener('keydown', keyHandler);
                keyHandler = null;
            }
        };

        window.openConfirmDialog = (message, options = {}) => {
            const opts = options || {};
            const msg = message || '';

            if (titleEl) titleEl.textContent = opts.title || 'Xác nhận';
            if (messageEl) messageEl.textContent = msg;
            if (confirmBtn) confirmBtn.textContent = opts.confirmText || 'Đồng ý';
            if (cancelBtn) cancelBtn.textContent = opts.cancelText || 'Hủy';
            if (dialog) dialog.dataset.variant = opts.variant || '';
            if (iconEl) iconEl.className = `fas ${opts.icon || 'fa-triangle-exclamation'}`;

            overlay.classList.add('active');
            overlay.setAttribute('aria-hidden', 'false');

            if (confirmBtn && typeof confirmBtn.focus === 'function') {
                confirmBtn.focus();
            }

            keyHandler = (event) => {
                if (event.key === 'Escape') {
                    closeConfirm(false);
                }
            };
            document.addEventListener('keydown', keyHandler);

            return new Promise((resolve) => {
                resolveConfirm = resolve;
            });
        };

        overlay.addEventListener('click', (event) => {
            if (event.target === overlay) {
                closeConfirm(false);
            }
        });

        if (confirmBtn) confirmBtn.addEventListener('click', () => closeConfirm(true));
        if (cancelBtn) cancelBtn.addEventListener('click', () => closeConfirm(false));
        if (closeBtn) closeBtn.addEventListener('click', () => closeConfirm(false));
    })();
    
    const typeMap = {
    Food: 'Đồ ăn',
    Drink: 'Đồ uống',
    Other: 'Khác'
    };

    function generateVietQR(amount, description = '') {
        const bankId = 'MB';
        const accountNo = '8410113801888';
        const accountName = 'NGUYEN PHUC NHAT THANH';

        const encodedDesc = encodeURIComponent(description);

        return `https://img.vietqr.io/image/${bankId}-${accountNo}-compact2.png`
            + `?amount=${amount}`
            + `&addInfo=${encodedDesc}`
            + `&accountName=${encodeURIComponent(accountName)}`;
    }

    const qrTransferBox = document.getElementById('qrTransferBox');
    const vietqrImg = document.getElementById('vietqrImg');
    const payMethodRadios = document.querySelectorAll('input[name="pay_method"]');

    let paymentPollInterval = null;

    function startPaymentPolling(tableId, amount) {
        if (paymentPollInterval) clearInterval(paymentPollInterval);
        
        console.log(`Starting payment polling for Table: ${tableId}, Amount: ${amount}`);
        
        paymentPollInterval = setInterval(async () => {
            try {
                const response = await fetch(`${BASE_URL}/pos/cashier/check-payment?table_id=${tableId}&amount=${amount}`, {
                    credentials: 'same-origin'
                });
                const data = await response.json();
                
                if (data.success) {
                    clearInterval(paymentPollInterval);
                    paymentPollInterval = null;
                    
                    showToast('Đã nhận được tiền chuyển khoản thành công!', 'success');
                    
                    const confirmPayBtn = document.querySelector('.btn-confirm-pay');
                    if (confirmPayBtn) {
                        confirmPayBtn.click();
                    }
                }
            } catch (err) {
                console.error('Lỗi khi check trạng thái chuyển khoản:', err);
            }
        }, 3000);
    }

    function stopPaymentPolling() {
        if (paymentPollInterval) {
            console.log('Stopping payment polling');
            clearInterval(paymentPollInterval);
            paymentPollInterval = null;
        }
    }

payMethodRadios.forEach(radio => {
    radio.addEventListener('change', () => {
        if (radio.value === 'transfer' && radio.checked) {

            const needPayText = document.getElementById('needPay').innerText;
            const amount = Number(needPayText.replace(/[^\d]/g, ''));

            const table = getSelectedTable();
            const desc = table
                ? `ToiBenQuan-${table.name}`
                : 'ToiBenQuan';

            vietqrImg.src = generateVietQR(amount, desc);
            qrTransferBox.style.display = 'block';

            if (table) {
                startPaymentPolling(table.id, amount);
            }

        } else {
            qrTransferBox.style.display = 'none';
            stopPaymentPolling();
        }
    });
});

    /* ================= DROPDOWN ================= */
    menuBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdownMenu.classList.toggle('show');
    });

    document.addEventListener('click', function() {
        dropdownMenu.classList.remove('show');
    });

    if (logoutLink) {
        logoutLink.addEventListener('click', async function(e) {
            e.preventDefault();
            if (await openConfirmDialog('Bạn có chắc chắn muốn đăng xuất?')) {
                document.getElementById('logout-form').submit();
            }
        });
    }

    /* ================= STT ORDER ================= */
    function nextOrderNo() {
        let orderNo = parseInt(localStorage.getItem('pos_order_no') || 0);
        orderNo++;
        localStorage.setItem('pos_order_no', orderNo);
        return `#${orderNo}`;
    }

    function updatePaginationUI(containerId, totalItems, itemsPerPage, currentPage, onPageChange) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
        const prevBtn = container.querySelector('.prev-btn');
        const nextBtn = container.querySelector('.next-btn');
        const pageInfo = container.querySelector('.page-info');

        if (pageInfo) {
            pageInfo.innerText = `Trang ${currentPage} / ${totalPages}`;
        }

        prevBtn.disabled = (currentPage === 1);
        nextBtn.disabled = (currentPage === totalPages);

        prevBtn.onclick = () => {
            if (currentPage > 1) onPageChange(currentPage - 1);
        };
        nextBtn.onclick = () => {
            if (currentPage < totalPages) onPageChange(currentPage + 1);
        };

        container.style.display = totalPages <= 1 ? 'none' : 'flex';
    }

    function getMenuItemsPerPage(viewportWidth) {
        if (viewportWidth <= 520) return 6;
        if (viewportWidth <= 768) return 8;
        if (viewportWidth <= 1024) return 10;
        if (viewportWidth <= 1440) return 12;
        return 15;
    }

    function getTableLayoutByViewport(viewportWidth) {
        if (viewportWidth <= 520) {
            return { maxColumns: 1, minCellWidth: 130, minCellHeight: 58, gap: 10 };
        }

        if (viewportWidth <= 768) {
            return { maxColumns: 2, minCellWidth: 140, minCellHeight: 60, gap: 10 };
        }

        if (viewportWidth <= 1024) {
            return { maxColumns: 4, minCellWidth: 145, minCellHeight: 62, gap: 12 };
        }

        if (viewportWidth <= 1440) {
            return { maxColumns: 5, minCellWidth: 145, minCellHeight: 68, gap: 14 };
        }

        return { maxColumns: 6, minCellWidth: 165, minCellHeight: 76, gap: 20 };
    }

    function getResponsivePaginationConfig() {
        const viewportWidth = window.innerWidth;
        const tableGrid = document.getElementById('tableGrid');
        const menuGrid = document.querySelector('.menu-grid');
        const layout = getTableLayoutByViewport(viewportWidth);
        const gridWidth = tableGrid?.clientWidth || 0;
        const gridHeight = tableGrid?.clientHeight || 0;
        const columns = gridWidth > 0
            ? Math.max(1, Math.min(
                layout.maxColumns,
                Math.floor((gridWidth + layout.gap) / (layout.minCellWidth + layout.gap))
            ))
            : layout.maxColumns;
        const fallbackRows = viewportWidth <= 1440 ? 4 : 6;
        const rows = gridHeight > 0
            ? Math.max(1, Math.floor((gridHeight + layout.gap) / (layout.minCellHeight + layout.gap)))
            : fallbackRows;

        if (tableGrid) {
            tableGrid.style.setProperty('--table-columns', columns);
            tableGrid.style.setProperty('--table-gap', `${layout.gap}px`);
            tableGrid.style.setProperty('--table-row-height', `${layout.minCellHeight}px`);
        }

        const menuGridWidth = menuGrid?.clientWidth || 0;
        const menuGridHeight = menuGrid?.clientHeight || 0;
        let menuPerPage = getMenuItemsPerPage(viewportWidth);

        if (menuGridWidth > 0 && menuGridHeight > 0) {
            const menuGap = viewportWidth <= 1024 ? 12 : 14;
            const menuItemMinWidth = viewportWidth <= 1024 ? 150 : 170;

            const firstItem = document.querySelector('.menu-item');
            let menuItemHeight = 190;
            if (firstItem) {
                const visibleItem = Array.from(document.querySelectorAll('.menu-item')).find(item => item.offsetHeight > 0);
                if (visibleItem) {
                    menuItemHeight = visibleItem.offsetHeight;
                } else {
                    menuItemHeight = firstItem.offsetHeight || 190;
                }
            }

            const style = window.getComputedStyle(menuGrid);
            const paddingTop = parseFloat(style.paddingTop || '0') || 0;
            const paddingBottom = parseFloat(style.paddingBottom || '0') || 0;
            const paddingLeft = parseFloat(style.paddingLeft || '0') || 0;
            const paddingRight = parseFloat(style.paddingRight || '0') || 0;

            const availableWidth = Math.max(0, menuGridWidth - paddingLeft - paddingRight);
            const availableHeight = Math.max(0, menuGridHeight - paddingTop - paddingBottom);

            const gridTemplateColumns = style.gridTemplateColumns;
            let menuColumns = 0;
            if (gridTemplateColumns && gridTemplateColumns !== 'none' && gridTemplateColumns !== '') {
                menuColumns = gridTemplateColumns.trim().split(/\s+/).length;
            }
            if (menuColumns <= 0) {
                menuColumns = Math.max(1, Math.floor((availableWidth + menuGap) / (menuItemMinWidth + menuGap)));
            }

            const menuRows = Math.max(1, Math.floor((availableHeight + menuGap) / (menuItemHeight + menuGap)));

            if (menuColumns > 0 && menuRows > 0) {
                menuPerPage = menuColumns * menuRows;
            }
        }

        return {
            tablePerPage: Math.max(columns, columns * rows),
            menuPerPage: menuPerPage
        };
    }

    function applyResponsivePaginationConfig() {
        const nextConfig = getResponsivePaginationConfig();
        const hasChanged = CONFIG.tablePerPage !== nextConfig.tablePerPage
            || CONFIG.menuPerPage !== nextConfig.menuPerPage;

        CONFIG.tablePerPage = nextConfig.tablePerPage;
        CONFIG.menuPerPage = nextConfig.menuPerPage;

        return hasChanged;
    }

    function paginateTables() {
        const allTables = Array.from(tableItems);
        const filtered = allTables.filter(t => t.getAttribute('data-filtered') !== 'hidden');
        const totalPages = Math.max(1, Math.ceil(filtered.length / CONFIG.tablePerPage));

        currentTablePage = Math.min(currentTablePage, totalPages);
        
        const start = (currentTablePage - 1) * CONFIG.tablePerPage;
        const end = start + CONFIG.tablePerPage;

        allTables.forEach(t => t.style.setProperty('display', 'none', 'important'));

        filtered.forEach((table, index) => {
            if (index >= start && index < end) {
                table.style.setProperty('display', 'flex', 'important');
            }
        });

        updatePaginationUI('pagination-tables', filtered.length, CONFIG.tablePerPage, currentTablePage, (newPage) => {
            currentTablePage = newPage;
            paginateTables();
        });
    }

    function paginateMenu() {
        const allMenus = Array.from(menuItems);
        const filtered = allMenus.filter(m => m.getAttribute('data-filtered') !== 'hidden');
        const totalPages = Math.max(1, Math.ceil(filtered.length / CONFIG.menuPerPage));

        currentMenuPage = Math.min(currentMenuPage, totalPages);
        
        const start = (currentMenuPage - 1) * CONFIG.menuPerPage;
        const end = start + CONFIG.menuPerPage;

        allMenus.forEach(m => m.style.setProperty('display', 'none', 'important'));

        filtered.forEach((item, index) => {
            if (index >= start && index < end) {
                item.style.setProperty('display', 'block', 'important');
            }
        });

        updatePaginationUI('pagination-menu', filtered.length, CONFIG.menuPerPage, currentMenuPage, (newPage) => {
            currentMenuPage = newPage;
            paginateMenu();
        });
    }

    /* ================= FILTER AREA ================= */
    areaLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const areaId = link.getAttribute('data-area');
            areaLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            tableItems.forEach(table => {
                if (areaId === 'all' || table.dataset.areaId === areaId) {
                    table.setAttribute('data-filtered', 'visible');
                } else {
                    table.setAttribute('data-filtered', 'hidden');
                }
            });
            currentTablePage = 1;
            paginateTables();
        });
    });

    /* ================= FILTER CATEGORY ================= */
    categoryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const catId = link.getAttribute('data-category');
            categoryLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            menuItems.forEach(item => {
                if (catId === 'all' || item.dataset.category === catId) {
                    item.setAttribute('data-filtered', 'visible');
                } else {
                    item.setAttribute('data-filtered', 'hidden');
                }
            });
            currentMenuPage = 1;
            paginateMenu();
        });
    });

    /* ================= CATEGORY SCROLL ================= */
    const CAT_VISIBLE_COUNT = 10;

    function updateCategoryScrollButtons() {
        if (!categoryScroll || !catPrevBtn || !catNextBtn) return;
        const maxScroll = categoryScroll.scrollWidth - categoryScroll.clientWidth;
        const atStart = categoryScroll.scrollLeft <= 2;
        const atEnd = categoryScroll.scrollLeft >= maxScroll - 2;
        catPrevBtn.classList.toggle('is-hidden', atStart);
        catNextBtn.classList.toggle('is-hidden', atEnd);
    }

    function scrollCategoryBy(delta) {
        if (!categoryScroll) return;
        categoryScroll.scrollBy({ left: delta, behavior: 'smooth' });
    }

    function applyCategoryItemWidth() {
        if (!categoryScroll) return;
        const list = categoryScroll.querySelector('.nav-category');
        if (!list) return;
        const items = list.querySelectorAll('li');
        if (!items.length) return;
        items.forEach(item => {
            item.style.flex = '';
            item.style.maxWidth = '';
            item.style.minWidth = '';
        });
        updateCategoryScrollButtons();
    }

    function refreshCategoryScroll() {
        if (!categoryScroll || !catPrevBtn || !catNextBtn) return;
        requestAnimationFrame(() => applyCategoryItemWidth());
    }

    if (categoryScroll && catPrevBtn && catNextBtn) {
        catPrevBtn.addEventListener('click', () => scrollCategoryBy(-220));
        catNextBtn.addEventListener('click', () => scrollCategoryBy(220));
        categoryScroll.addEventListener('scroll', updateCategoryScrollButtons);
        setTimeout(applyCategoryItemWidth, 0);
    }

    /* ================= DEFAULT TAB ================= */
    function showTab(tabName) {
        tabLinks.forEach(link => {
            link.parentElement.classList.remove('active');
        });

        tabContents.forEach(tab => {
            tab.classList.remove('active');
        });
        const activeLink = document.querySelector(`.nav-tabs li a[data-tab="${tabName}"]`);
        if (activeLink) {
            activeLink.parentElement.classList.add('active');
        }

        const activeContent = document.getElementById(`tab-${tabName}`);
        if (activeContent) {
            activeContent.classList.add('active');
        }

        applyResponsivePaginationConfig();

        if (tabName === 'menu') {
            refreshCategoryScroll();
            paginateMenu();
        } else if (tabName === 'tables') {
            paginateTables();
        }
    }
    showTab('tables');

    /* ================= CLICK TAB ================= */
    tabLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tabName = link.dataset.tab;
            showTab(tabName);
        });
    });

    /* ================= SELECT TABLE ================= */
    function setSelectedTable(table) {
        tableItems.forEach(t => t.classList.remove('active'));
        table.classList.add('active');

        const name = table.dataset.name;
        const areaName = table.dataset.areaName;
        const tableId = table.dataset.id;
        const startKey = `order_start_${tableId}`;
        if (!localStorage.getItem(startKey)) {
            localStorage.setItem(startKey, new Date().toISOString());
        }
        
        selectedTableBtn.textContent = `${name} / ${areaName}`;
        selectedTableBtn.disabled = false;
        selectedTableBtn.classList.add('active');

        localStorage.setItem('selectedTable', JSON.stringify({
            id: tableId,
            name,
            areaName
        }));

        loadOrder();   
        updateTableStatus();
        renderOrderList();
        
    }

    function restoreSelectedTable() {
        const saved = localStorage.getItem('selectedTable');
        if (!saved) return;
        const data = JSON.parse(saved);

        tableItems.forEach(table => {
            if (table.dataset.id === data.id) {
                table.classList.add('active');
                selectedTableBtn.textContent = `${data.name} / ${data.areaName}`;
                selectedTableBtn.disabled = false;
                selectedTableBtn.classList.add('active');
            }
        });
    }

    /* ================= CLICK TABLE ================= */
    tableItems.forEach(table => {
        table.addEventListener('click', () => {
            setSelectedTable(table);
        });
    });

    /* ================= CLICK BUTTON ĐỂ MỞ FORM ĐỔI BÀN ================= */
        selectedTableBtn.addEventListener('click', () => {
            if (!selectedTableBtn.classList.contains('active')) return;
            if (Object.keys(orderItems).length === 0) {
                showToast('Bàn chưa có món, bạn phải chọn bàn có món để đổi bàn.', 'warning');
                return;
            }

            const saved = JSON.parse(localStorage.getItem('selectedTable'));
            document.getElementById('currentTableName').textContent = `${saved.name} / ${saved.areaName}`;
            
            transferModal.style.display = 'block';
        });

        // Đóng modal
        document.querySelector('.close-modal').onclick = () => transferModal.style.display = 'none';
        document.getElementById('cancelTransfer').onclick = () => transferModal.style.display = 'none';

        /* ================= XỬ LÝ CẬP NHẬT (ĐỔI BÀN) ================= */
        document.getElementById('confirmTransfer').addEventListener('click', () => {
            const targetOption = targetTableSelect.options[targetTableSelect.selectedIndex];
            const targetTableId = targetTableSelect.value;

            if (!targetTableId) {
                showToast('Vui lòng chọn bàn muốn chuyển đến!', 'warning');
                return;
            }

            const currentData = JSON.parse(localStorage.getItem('selectedTable'));
            const currentTableId = currentData.id;

            if (currentTableId == targetTableId) {
                showToast('Bạn đang chọn trùng bàn hiện tại!', 'warning');
                return;
            }

            const oldKey = `order_${currentTableId}`;
            const currentItems = JSON.parse(localStorage.getItem(oldKey)) || {};

            const newKey = `order_${targetTableId}`;
            let targetItems = JSON.parse(localStorage.getItem(newKey)) || {};

            Object.keys(currentItems).forEach(id => {
                if (targetItems[id]) {
                    targetItems[id].qty += currentItems[id].qty;
                } else {
                    targetItems[id] = currentItems[id];
                }
            });

            localStorage.setItem(newKey, JSON.stringify(targetItems));
            localStorage.removeItem(oldKey);
            localStorage.removeItem(`order_start_${currentTableId}`);

            const newTableElement = document.querySelector(`.table-item[data-id="${targetTableId}"]`);
            if (newTableElement) {
                setSelectedTable(newTableElement);
            }

            transferModal.style.display = 'none';
            showToast('Đổi bàn thành công!', 'success');
        });

    /* ================= RESTORE ON LOAD ================= */
    restoreSelectedTable();

    function restoreSelectedTableBtn() {
        const saved = localStorage.getItem('selectedTable');
        if (!saved) return;
        const data = JSON.parse(saved);

        selectedTableBtn.textContent = `${data.name} / ${data.areaName}`;
        selectedTableBtn.disabled = false;
        selectedTableBtn.classList.add('active');
    }
    restoreSelectedTableBtn();

    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab') || 'tables';

    document.querySelectorAll('.nav-tabs li').forEach(li => li.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));

    const activeTab = document.querySelector(`.nav-tabs a[data-tab="${tab}"]`);
    if (activeTab) activeTab.parentElement.classList.add('active');

    const activeContent = document.getElementById(`tab-${tab}`);
    if (activeContent) activeContent.classList.add('active');
    if (tab === 'menu') {
        refreshCategoryScroll();
    }

    /* ================= RENDER ORDER LIST ================= */
    function formatPrice(num) {
        return Number(num || 0).toLocaleString('vi-VN');
    }

    function parseMoneyValue(value) {
        const numeric = String(value ?? '').replace(/[^\d]/g, '');
        return numeric ? Number(numeric) : NaN;
    }

    function calculateDiscountedPrice(basePrice, discountValue = 0, discountType = 'vnd') {
        const base = Math.max(0, Number(basePrice || 0));
        const discount = Math.max(0, Number(discountValue || 0));
        let price = base;

        if (discountType === 'percent') {
            price = base * (1 - Math.min(discount, 100) / 100);
        } else {
            price = base - discount;
        }

        return Math.max(0, Math.round(price));
    }

    function applyBasePriceToOrderItem(item, newBasePrice) {
        if (!item) return;

        item.basePrice = newBasePrice;
        item.price = calculateDiscountedPrice(
            newBasePrice,
            item.discountValue || 0,
            item.discountType || 'vnd'
        );
    }

    function getSelectedTable() {
        return JSON.parse(localStorage.getItem('selectedTable'));
    }

    function getOrderKey() {
        const table = JSON.parse(localStorage.getItem('selectedTable'));
        return table ? `order_${table.id}` : null;
    }

    function saveOrder() {
        const key = getOrderKey();
        if (key) {
            localStorage.setItem(key, JSON.stringify(orderItems));
        }
    }

    function loadOrder() {
        const table = getSelectedTable();
        if (!table) return;

        const key = `order_${table.id}`;
        const startKey = `order_start_${table.id}`;
        if (localStorage.getItem(key)) {
            orderItems = JSON.parse(localStorage.getItem(key));
            if (
                Object.keys(orderItems).length > 0 &&
                !localStorage.getItem(startKey)
            ) {
                localStorage.setItem(startKey, new Date().toISOString());
            }
        } else {
            orderItems = {};
        }
    }

    function clearOrderState(tableId) {
        if (!tableId) return;

        localStorage.removeItem(`order_${tableId}`);
        localStorage.removeItem(`order_start_${tableId}`);

        const selectedTable = getSelectedTable();
        if (selectedTable && String(selectedTable.id) === String(tableId)) {
            localStorage.removeItem('selectedTable');
        }
    }

    function clearSelectedTableUI(tableId) {
        tableItems.forEach(t => {
            if (!tableId || String(t.dataset.id) === String(tableId)) {
                t.classList.remove('active', 'using');
            }
        });
        selectedTableBtn.textContent = 'Chưa chọn bàn';
        selectedTableBtn.disabled = true;
        selectedTableBtn.classList.remove('active');
    }

    function handleVnpayReturnResult() {
        const params = new URLSearchParams(window.location.search);
        const status = params.get('vnpay_status');

        if (!status) return;

        const tableId = params.get('table_id');

        if (status === 'success') {
            clearOrderState(tableId);
            clearSelectedTableUI(tableId);
            orderItems = {};
            showToast('Thanh toán VNPAY thành công', 'success', 5000);
        } else if (status === 'invalid_signature') {
            showToast('VNPAY trả về sai chữ ký. Vui lòng kiểm tra cấu hình.', 'error', 6000);
        } else if (status === 'error') {
            showToast(params.get('message') || 'Không thể cập nhật hóa đơn VNPAY', 'error', 6000);
        } else {
            showToast('Giao dịch VNPAY chưa thành công', 'warning', 5000);
        }

        const cleanUrl = window.location.origin + window.location.pathname;
        window.history.replaceState({}, document.title, cleanUrl);
    }

    /* ================= SEARCH PRODUCT ================= */
    searchInput.addEventListener('input', () => {
        const keyword = searchInput.value.trim();
        if (!keyword) {
            searchResult.style.display = 'none';
            searchResult.innerHTML = '';
            return;
        }

        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            fetch(`${searchUrl}?q=${encodeURIComponent(keyword)}`)
                .then(res => res.json())
                .then(data => {
                    if (!Array.isArray(data) || !data.length) {
                        searchResult.innerHTML = `
                            <div class="search-item">
                                <span>Không tìm thấy món</span>
                            </div>
                        `;
                        searchResult.style.display = 'block';
                        return;
                    }
                    searchResult.innerHTML = data.map(p => {
                        const available = p.available_qty !== null ? parseFloat(p.available_qty) : null;
                        const isOutOfStock = available !== null && available <= 0;
                        const availableVal = available !== null ? available : 'null';
                        return `
                            <div class="search-item ${isOutOfStock ? 'out-of-stock' : ''}"
                                data-id="${p.id}"
                                data-code="${p.code || ''}"
                                data-name="${p.name}"
                                data-unit="${p.unit}"
                                data-price="${p.price}"
                                data-available="${availableVal}"
                                ${isOutOfStock ? 'style="opacity: 0.6; cursor: not-allowed;"' : ''}>
                                <strong>${p.name} ${isOutOfStock ? '(Hết hàng)' : ''}</strong>
                                <span>${p.unit} • ${formatPrice(p.price)}</span>
                            </div>
                        `;
                    }).join('');
                    searchResult.style.display = 'block';
                });
        }, 300);
     });
 
     searchResult.addEventListener('click', (e) => {
         const item = e.target.closest('.search-item');
         if (!item) return;
         const availableStr = item.dataset.available;
         if (availableStr !== 'null') {
             const available = parseFloat(availableStr || '0');
             if (available <= 0) {
                 showToast('Món này không đủ tồn kho', 'error');
                 return;
             }
         }
         addProduct({
             id: item.dataset.id,
             name: item.dataset.name,
             unit: item.dataset.unit,
             price: Number(item.dataset.price),
             code: item.dataset.code,
         });
 
         searchInput.value = '';
         searchResult.style.display = 'none';
    });

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-box')) {
            searchResult.style.display = 'none';
        }
    });

    /* ================= NOTIFY BUTTON ================= */
    function updateNotifyBtn(hasOrder) {
        if (!notifyBtn) return;
        if (hasOrder) {
            notifyBtn.classList.add('has-order');
        } else {
            notifyBtn.classList.remove('has-order');
        }
    }

    /* ================= RENDER ================= */
    let hadItemsBefore = false;

    function renderOrderList() {

        orderList.innerHTML = '';
        const items = Object.values(orderItems);
        if (items.length === 0) {
            if (hadItemsBefore) {
                removeServing(getSelectedTable().id);
                updateServicingCount();
            }
            hadItemsBefore = false;
            orderList.innerHTML = `
                <p class="empty">
                    Chưa có món trong đơn<br>
                    Vui lòng chọn món trong thực đơn bên trái màn hình
                </p>
            `;
            updateNotifyBtn(false);
            updateTotal();
            return;
        }
        hadItemsBefore = true;

        items.forEach((item, index) => {
            // Safeguards
            if (item.basePrice === undefined) item.basePrice = item.price;
            if (item.discountValue === undefined) item.discountValue = 0;
            if (item.discountType === undefined) item.discountType = 'vnd';

            // Check if item is running out (stock <= 3)
            const menuItem = document.querySelector(`.menu-item[data-id="${item.id}"]`);
            let isRunningOut = false;
            if (menuItem) {
                const availableStr = menuItem.dataset.available;
                if (availableStr !== 'null') {
                    const available = parseFloat(availableStr || '0');
                    if (available <= 3) {
                        isRunningOut = true;
                    }
                }
            }

            const itemTotal = item.qty * item.price;
            const div = document.createElement('div');
            div.className = 'order-item';
            div.dataset.id = item.id;
            div.innerHTML = `
                <div class="oi-info">
                    <div class="oi-title"><strong>${index + 1}. ${item.name}</strong></div>
                    <div class="oi-unit">${item.unit}</div>
                </div>
                <div class="oi-qty-wrapper">
                    <div class="oi-qty-pill">
                        <button type="button" class="btn-minus">−</button>
                        <span class="qty-val">${item.qty}</span>
                        <button type="button" class="btn-plus">+</button>
                        ${isRunningOut ? '<span class="oi-warning-badge" title="Món sắp hết tồn kho (còn dưới 3)">!</span>' : ''}
                    </div>
                </div>
                <div class="oi-price-wrapper">
                    <div class="oi-price-text">${formatPrice(item.price)}</div>
                    <div class="oi-price-pill" title="Nhấn để sửa/giảm giá">${formatPrice(item.price)}</div>
                </div>
                <div class="oi-total-wrapper">
                    <div class="oi-total-text">${formatPrice(itemTotal)}</div>
                    <button type="button" class="btn-action-remove" title="Xóa món"><i class="fa-solid fa-trash-can"></i></button>
                </div>
            `;

            div.querySelector('.btn-plus').onclick = () => {
                const menuItem = document.querySelector(`.menu-item[data-id="${item.id}"]`);
                if (menuItem) {
                    const availableStr = menuItem.dataset.available;
                    if (availableStr !== 'null') {
                        const available = parseFloat(availableStr || '0');
                        if (item.qty >= available) {
                            showToast('Món này không đủ tồn kho', 'error');
                            return;
                        }
                    }
                }
                item.qty++;
                saveOrder();
                updateTableStatus();
                renderOrderList();
            };

            div.querySelector('.btn-minus').onclick = () => {
                if (item.qty > 1) {
                    item.qty--;
                } else {
                    delete orderItems[item.id];
                }
                saveOrder();
                updateTableStatus();
                renderOrderList();
            };

            div.querySelector('.btn-action-remove').onclick = () => {
                delete orderItems[item.id];
                saveOrder();
                updateTableStatus();
                renderOrderList();
            };

            div.querySelector('.oi-price-wrapper').onclick = () => {
                openPriceEditModal(item);
            };

            orderList.appendChild(div);
        });
        updateNotifyBtn(true);
        updateTotal();
    }

    /* ================= PRICE EDIT MODAL LOGIC ================= */
    const priceEditModal = document.getElementById('priceEditModal');
    const closePriceEditModal = document.getElementById('closePriceEditModal');
    const pemProductTitle = document.getElementById('pemProductTitle');
    const pemProductId = document.getElementById('pemProductId');
    const pemBasePriceText = document.getElementById('pemBasePriceText');
    const pemEditBasePriceBtn = document.getElementById('pemEditBasePriceBtn');
    const pemDiscountTypeVND = document.getElementById('pemDiscountTypeVND');
    const pemDiscountTypePercent = document.getElementById('pemDiscountTypePercent');
    const pemDiscountValue = document.getElementById('pemDiscountValue');
    const pemNewPriceInput = document.getElementById('pemNewPriceInput');
    const pemCancelBtn = document.getElementById('pemCancelBtn');
    const pemSaveBtn = document.getElementById('pemSaveBtn');
    const basePriceModal = document.getElementById('basePriceModal');
    const closeBasePriceModal = document.getElementById('closeBasePriceModal');
    const bpmProductName = document.getElementById('bpmProductName');
    const bpmCurrentPrice = document.getElementById('bpmCurrentPrice');
    const bpmNewPriceInput = document.getElementById('bpmNewPriceInput');
    const bpmCancelBtn = document.getElementById('bpmCancelBtn');
    const bpmSaveBtn = document.getElementById('bpmSaveBtn');

    let currentEditingItem = null;
    let currentDiscountType = 'vnd';

    function openPriceEditModal(item) {
        currentEditingItem = item;
        
        if (item.basePrice === undefined) item.basePrice = item.price;
        if (item.discountValue === undefined) item.discountValue = 0;
        if (item.discountType === undefined) item.discountType = 'vnd';

        pemProductId.value = item.id;
        pemProductTitle.textContent = `${item.code || 'SP'} - ${item.name} (${item.unit})`;
        pemBasePriceText.textContent = formatPrice(item.basePrice);
        pemDiscountValue.value = item.discountValue;
        
        setDiscountType(item.discountType);
        calculateNewPrice();

        priceEditModal.classList.add('active');
    }

    function setDiscountType(type) {
        currentDiscountType = type;
        if (type === 'vnd') {
            pemDiscountTypeVND.classList.add('active');
            pemDiscountTypeVND.style.background = '#0066ff';
            pemDiscountTypeVND.style.color = '#fff';
            
            pemDiscountTypePercent.classList.remove('active');
            pemDiscountTypePercent.style.background = 'transparent';
            pemDiscountTypePercent.style.color = '#4b5563';
        } else {
            pemDiscountTypePercent.classList.add('active');
            pemDiscountTypePercent.style.background = '#0066ff';
            pemDiscountTypePercent.style.color = '#fff';
            
            pemDiscountTypeVND.classList.remove('active');
            pemDiscountTypeVND.style.background = 'transparent';
            pemDiscountTypeVND.style.color = '#4b5563';
        }
        calculateNewPrice();
    }

    function calculateNewPrice() {
        if (!currentEditingItem) return;
        const newPrice = calculateDiscountedPrice(
            currentEditingItem.basePrice,
            pemDiscountValue.value || 0,
            currentDiscountType
        );
        pemNewPriceInput.value = formatPrice(newPrice);
    }

    pemDiscountValue.addEventListener('input', calculateNewPrice);
    pemDiscountTypeVND.addEventListener('click', () => setDiscountType('vnd'));
    pemDiscountTypePercent.addEventListener('click', () => setDiscountType('percent'));

    function closePEM() {
        priceEditModal.classList.remove('active');
        closeBasePriceEditor();
        currentEditingItem = null;
    }
    closePriceEditModal.addEventListener('click', closePEM);
    pemCancelBtn.addEventListener('click', closePEM);

    pemSaveBtn.addEventListener('click', () => {
        if (!currentEditingItem) return;
        
        const discountVal = Math.max(0, Number(pemDiscountValue.value || 0));
        const newPrice = calculateDiscountedPrice(
            currentEditingItem.basePrice,
            discountVal,
            currentDiscountType
        );

        currentEditingItem.discountValue = discountVal;
        currentEditingItem.discountType = currentDiscountType;
        currentEditingItem.price = newPrice;

        saveOrder();
        renderOrderList();
        closePEM();
        showToast('Đã áp dụng giảm giá/sửa giá cho món', 'success');
    });

    function openBasePriceModal() {
        if (!currentEditingItem || !basePriceModal) return;

        const currentBase = Number(currentEditingItem.basePrice || currentEditingItem.price || 0);
        bpmProductName.textContent = `${currentEditingItem.code || 'SP'} - ${currentEditingItem.name} (${currentEditingItem.unit})`;
        bpmCurrentPrice.textContent = formatPrice(currentBase);
        bpmNewPriceInput.value = formatPrice(currentBase);
        basePriceModal.classList.add('active');
        basePriceModal.setAttribute('aria-hidden', 'false');

        setTimeout(() => {
            bpmNewPriceInput.focus();
            bpmNewPriceInput.select();
        }, 0);
    }

    function closeBasePriceEditor() {
        if (!basePriceModal) return;

        basePriceModal.classList.remove('active');
        basePriceModal.setAttribute('aria-hidden', 'true');
    }

    function updateMenuProductPrice(productId, newBasePrice) {
        document.querySelectorAll(`.menu-item[data-id="${productId}"]`).forEach(menuItem => {
            menuItem.dataset.price = newBasePrice;
            const pTag = menuItem.querySelector('p');
            if (pTag) {
                pTag.textContent = `${menuItem.dataset.unit} - ${formatPrice(newBasePrice)}`;
            }
        });
    }

    function updateUnpaidOrdersProductPrice(productId, newBasePrice) {
        let updatedOrders = 0;
        const keys = [];

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('order_') && !key.startsWith('order_start_')) {
                keys.push(key);
            }
        }

        keys.forEach(key => {
            try {
                const savedOrder = JSON.parse(localStorage.getItem(key));
                if (!savedOrder || !savedOrder[productId]) return;

                applyBasePriceToOrderItem(savedOrder[productId], newBasePrice);
                localStorage.setItem(key, JSON.stringify(savedOrder));
                updatedOrders++;
            } catch (e) {
                console.error('Error updating localStorage key:', key, e);
            }
        });

        if (orderItems[productId]) {
            applyBasePriceToOrderItem(orderItems[productId], newBasePrice);
            saveOrder();
        }

        return updatedOrders;
    }

    pemEditBasePriceBtn.addEventListener('click', openBasePriceModal);
    closeBasePriceModal?.addEventListener('click', closeBasePriceEditor);
    bpmCancelBtn?.addEventListener('click', closeBasePriceEditor);
    basePriceModal?.addEventListener('click', (event) => {
        if (event.target === basePriceModal) closeBasePriceEditor();
    });

    bpmNewPriceInput?.addEventListener('input', () => {
        const value = parseMoneyValue(bpmNewPriceInput.value);
        bpmNewPriceInput.value = Number.isFinite(value) ? formatPrice(value) : '';
    });

    bpmSaveBtn?.addEventListener('click', async () => {
        if (!currentEditingItem) return;

        const newBase = parseMoneyValue(bpmNewPriceInput.value);
        if (!Number.isFinite(newBase) || newBase < 0) {
            showToast('Giá bán không hợp lệ', 'error');
            return;
        }

        const originalText = bpmSaveBtn.textContent;
        bpmSaveBtn.disabled = true;
        bpmSaveBtn.textContent = 'Đang lưu...';

        try {
            const response = await fetch(`${BASE_URL}/pos/cashier/update-product-price`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                },
                body: JSON.stringify({
                    product_id: currentEditingItem.id,
                    new_price: newBase
                })
            });

            const result = await response.json();
            if (!response.ok || !result.success) {
                showToast(result.message || 'Cập nhật giá bán thất bại', 'error');
                return;
            }

            const savedBase = Number(result.new_price ?? newBase);
            const updatedOrders = updateUnpaidOrdersProductPrice(String(currentEditingItem.id), savedBase);

            updateMenuProductPrice(currentEditingItem.id, savedBase);
            pemBasePriceText.textContent = formatPrice(savedBase);
            bpmCurrentPrice.textContent = formatPrice(savedBase);
            calculateNewPrice();
            renderOrderList();
            renderPayOrder();
            closeBasePriceEditor();

            const tableText = updatedOrders > 0 ? ` và ${updatedOrders} đơn chưa thanh toán` : '';
            showToast(`Đã cập nhật giá bán mới${tableText}`, 'success');
        } catch (error) {
            console.error('Error updating base price:', error);
            showToast('Lỗi kết nối máy chủ', 'error');
        } finally {
            bpmSaveBtn.disabled = false;
            bpmSaveBtn.textContent = originalText;
        }
    });

    function updateTableStatus() {
        tableItems.forEach(table => {
            const key = `order_${table.dataset.id}`;
            const hasOrder =
                localStorage.getItem(key) &&
                Object.keys(JSON.parse(localStorage.getItem(key))).length > 0;
            table.classList.toggle('using', hasOrder);
        });
    }

    function updateTotal() {
        let sum = 0;
        Object.values(orderItems).forEach(item => {
            sum += item.qty * item.price;
        });
        totalPriceEl.textContent = formatPrice(sum);
    }

    async function startServingIfNeeded(tableId) {
        try {
            const res = await fetch(`${APP_URL}/pos/cashier/start-serving`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.content,
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ table_id: tableId })
            });

            const data = await res.json();

            if (data.ok) {
                updateServicingCount();
            }
        } catch (e) {
            console.error('Error starting service:', e);
        }
    }

    async function removeServing(tableId) {
        await fetch(`${BASE_URL}/pos/cashier/remove-serving`, {
            method: 'POST',
            credentials: 'same-origin',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': csrfToken
            },
            body: JSON.stringify({ table_id: tableId })
        });
    }

    async function updateServicingCount() {
        try {
            const res = await fetch(`${BASE_URL}/pos/cashier/servicing-count`, {
                credentials: 'same-origin'
            });
            const data = await res.json();
            const el = document.getElementById('servicing');
            if (el) el.textContent = data.count;
        } catch (e) {
            console.error('Không lấy được số bàn đang phục vụ', e);
        }
    }

    /* ================= ADD PRODUCT ================= */
    function addProduct(product) {
        const table = getSelectedTable();
        if (!table) {
            showToast('Vui lòng chọn bàn trước khi chọn món', 'warning');
            return;
        }

        const menuItem = document.querySelector(`.menu-item[data-id="${product.id}"]`);
        if (menuItem) {
            const availableStr = menuItem.dataset.available;
            if (availableStr !== 'null') {
                const available = parseFloat(availableStr || '0');
                const currentQty = orderItems[product.id] ? orderItems[product.id].qty : 0;
                if (currentQty >= available) {
                    showToast('Món này không đủ tồn kho', 'error');
                    return;
                }
            }
        }

        startServingIfNeeded(table.id);
        if (orderItems[product.id]) {
            orderItems[product.id].qty++;
        } else {
            orderItems[product.id] = {
                id: product.id,
                name: product.name,
                unit: product.unit,
                basePrice: product.price,
                price: product.price,
                qty: 1,
                type: product.type_menu,
                code: product.code || '',
                discountValue: 0,
                discountType: 'vnd'
            };
        }
        saveOrder();
        updateTableStatus();
        renderOrderList();
    }

    /* ================= CLICK MENU ITEM ================= */
    document.querySelectorAll('.menu-item').forEach(item => {
        item.addEventListener('click', () => {
            const availableStr = item.dataset.available;
            if (availableStr !== 'null') {
                const available = parseFloat(availableStr || '0');
                if (available <= 0) {
                    showToast('Món này không đủ tồn kho', 'error');
                    return;
                }
            }
            addProduct({
                id: item.dataset.id,
                name: item.querySelector('h4').textContent,
                unit: item.dataset.unit,
                price: Number(item.dataset.price),
                type_menu: item.dataset.type,
                code: item.dataset.code || ''
            });
        });
    });

    function getUrlParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    async function checkBookingFromUrl() {
        const bookingId = getUrlParam('booking_id');
        const tableId = getUrlParam('table_id');

        // 1. Tự động chọn bàn
        if (tableId) {
            const tableElement = document.querySelector(`.table-item[data-id="${tableId}"]`);
            if (tableElement) {
                setSelectedTable(tableElement);
                console.log("Hệ thống đã chọn bàn:", tableId);
            }
        }
        if (bookingId) {
            try {
                const apiUrl = typeof BASE_URL !== 'undefined' ? `${BASE_URL}/pos/api/booking-items/${bookingId}` : `/pos/api/booking-items/${bookingId}`;
                
                const res = await fetch(apiUrl);
                const data = await res.json();

                if (data.success && data.items.length > 0) {
                    orderItems = {}; 

                    data.items.forEach(item => {
                        const pId = item.product_id || item.id; 
                        orderItems[pId] = {
                            id: pId,
                            name: item.product_name || item.name,
                            qty: parseInt(item.qty) || 1,
                            basePrice: parseFloat(item.price) || 0,
                            price: parseFloat(item.price) || 0,
                            unit: item.unit || 'Món',
                            type: item.type_menu || 'Food',
                            code: item.code || '',
                            discountValue: 0,
                            discountType: 'vnd'
                        };
                    });
                    saveOrder();
                    renderOrderList(); 
                    updateTotal();
                    updateTableStatus();
                    
                    console.log("Đã nạp món thành công từ booking:", bookingId);
                    const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
                    window.history.replaceState({path: cleanUrl}, '', cleanUrl);
                }
            } catch (err) {
                console.error("Lỗi khi fetch booking items:", err);
            }
        }
    }

    /* ================= BOOKING TAB HIGHLIGHT ================= */
    function updateBookingHighlight() {
        const cards = document.querySelectorAll('.booking-card[data-booking-time]');
        if (!cards.length) return;
        const now = new Date();
        cards.forEach(card => {
            const timeValue = card.dataset.bookingTime;
            if (!timeValue) return;
            const bookingTime = new Date(timeValue);
            if (Number.isNaN(bookingTime.getTime())) return;
            const diff = bookingTime.getTime() - now.getTime();
            if (diff >= 0 && diff <= 30 * 60 * 1000) {
                card.classList.add('soon');
            } else {
                card.classList.remove('soon');
            }
        });
    }

    /* ================= INIT ================= */
    handleVnpayReturnResult();
    loadOrder();
    updateTableStatus();
    renderOrderList();
    updateServicingCount();
    checkBookingFromUrl();
    updateBookingHighlight();
    setInterval(updateBookingHighlight, 60000);
    applyResponsivePaginationConfig();
    paginateTables();
    paginateMenu();

    window.addEventListener('resize', () => {
        applyResponsivePaginationConfig();

        const activeTabLink = document.querySelector('.nav-tabs li.active a');
        const activeTabName = activeTabLink ? activeTabLink.dataset.tab : 'tables';
        if (activeTabName === 'menu') {
            paginateMenu();
        } else if (activeTabName === 'tables') {
            paginateTables();
        }

        applyCategoryItemWidth();
    });

    /* ================= PAY ================= */
    openPayBtn.addEventListener('click', openPayDrawer);
    closePayBtn.addEventListener('click', closePayDrawer);
    payOverlay.addEventListener('click', closePayDrawer);
    function openPayDrawer() {
        const table = getSelectedTable();
        if (!table) {
            showToast('Vui lòng chọn bàn trước khi thanh toán', 'warning');
            return;
        }
        payTableInfo.textContent = `${table.name} / ${table.areaName}`;
        const now = new Date();
        payTime.textContent = now.toLocaleDateString('vi-VN') + ' ' + now.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        });
        payOverlay.style.display = 'block';
        payDrawer.classList.add('show');
        renderPayOrder();
        document.getElementById('orderNo').innerText =
        `#${parseInt(localStorage.getItem('pos_order_no') || 0) + 1}`;
        document.querySelector('input[name="pay_method"][value="cash"]').checked = true;
        qrTransferBox.style.display = 'none';
    }

    function closePayDrawer() {
        payDrawer.classList.remove('show');
        stopPaymentPolling();
        setTimeout(() => {
            payOverlay.style.display = 'none';
        }, 300);
    }

    function updatePayAmount() {
        const total = Object.values(orderItems)
            .reduce((s, i) => s + i.qty * i.price, 0);

        let discount = 0;

        if (promotionDiscount > 0) {
            discount = promotionDiscount;
        } else {
            discount = Number(discountInput.value || 0);
        }

        discount = Math.min(discount, total);

        document.getElementById('sumPrice').textContent = formatPrice(total);
        document.getElementById('needPay').textContent = formatPrice(total - discount);
        const transferRadio = document.querySelector('input[name="pay_method"][value="transfer"]');
        if (transferRadio.checked) {
            const amount = Math.max(total - discount, 0);
            const table = getSelectedTable();
            const desc = table ? `ToiBenQuan-${table.name}` : 'ToiBenQuan';
            vietqrImg.src = generateVietQR(amount, desc);
            if (table) {
                startPaymentPolling(table.id, amount);
            }
        }
    }

    function renderPayOrder() {
        const payOrderList = document.getElementById('payOrderList');
        const sumPriceEl = document.getElementById('sumPrice');
        const needPayEl = document.getElementById('needPay');
        const discountInput = document.getElementById('discountInput');
        payOrderList.innerHTML = '';

        let sum = 0;
        const groups = {};
        Object.values(orderItems).forEach(item => {
            const type = typeMap[item.type] || 'Khác';

            if (!groups[type]) {
                groups[type] = [];
            }
            groups[type].push(item);
        });
        Object.keys(groups).forEach(type => {
            const groupDiv = document.createElement('div');
            groupDiv.className = 'pay-group';
            // title
            groupDiv.innerHTML = `
                <div class="group-title">${type}</div>
            `;
            groups[type].forEach(item => {
                const total = item.qty * item.price;
                sum += total;
                groupDiv.innerHTML += `
                    <div class="pay-item">
                        <div class="name">
                            <strong>${item.name}</strong>
                            <small>${item.unit}</small>
                        </div>
                        <div class="qty">${item.qty}</div>
                        <div class="price">${formatPrice(item.price)}</div>
                        <div class="total">${formatPrice(total)}</div>
                    </div>
                `;
            });
            payOrderList.appendChild(groupDiv);
        });
        sumPriceEl.textContent = formatPrice(sum);
        needPayEl.textContent = formatPrice(sum);
        updatePayAmount();

        discountInput.oninput = () => {
            const discount = Number(discountInput.value || 0);
            const needPay = Math.max(sum - discount, 0);
            needPayEl.textContent = formatPrice(needPay);
        };
    }
    discountBtn.addEventListener('click', () => {
        discountPopup.style.display = 'flex';
    });
    discountPopup.querySelectorAll('.discount-type button').forEach(btn => {
        btn.addEventListener('click', () => {
            discountPopup.querySelectorAll('.discount-type button').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            discountType = btn.dataset.type;
            discountValue.value = '';
        });
    });

    discountCancel.addEventListener('click', () => {
        discountPopup.style.display = 'none';
    });

    discountSave.addEventListener('click', () => {
        const totalSum = Object.values(orderItems)
            .reduce((s, i) => s + i.qty * i.price, 0);
        let val = Number(discountValue.value || 0);
        if (discountType === 'percent') {
            if (val > 100) val = 100;
            discountAmount = Math.round(totalSum * val / 100);
            discountBtn.textContent = `${discountAmount.toLocaleString()}₫`;
        } else {
            discountAmount = Math.min(val, totalSum);
            discountBtn.textContent = `${discountAmount.toLocaleString()}₫`;
        }
        discountInput.value = discountAmount;
        const needPayEl = document.getElementById('needPay');
        needPayEl.textContent = formatPrice(totalSum - discountAmount);
        discountPopup.style.display = 'none';

        promotionDiscount = 0;
        selectedPromotion = null;
        promotionIdInput.value = '';
        promotionBtn.textContent = 'Chọn KM';

        discountInput.value = discountAmount;
        updatePayAmount();
    });

    promotionBtn.addEventListener('click', async () => {
        promotionPopup.style.display = 'flex';

        if (promotionList.children.length) return;

        try {
            const res = await fetch(`${appBaseUrl}/pos/promotions/available`, {
                headers: { 'Accept': 'application/json' }
            });

            const resData = await res.json();

            if (!resData.success || !Array.isArray(resData.data)) {
                showToast('Không có chương trình khuyến mãi', 'warning');
                return;
            }

            renderPromotions(resData.data);

        } catch (e) {
            console.error(e);
            showToast(res.message || 'Không tải được chương trình', 'error');
        }
    });


    function renderPromotions(promotions) {
        promotionList.innerHTML = '';

        promotions.forEach(p => {
            let label = '';

            if (p.type === 'percent') {
                label = `Giảm ${p.discount}%`;
            } 
            else if (p.type === 'amount') {
                label = `Giảm ${Number(p.discount).toLocaleString()}₫`;
            } 
            else if (p.type_code === 'gift') {
                label = '🎁 Tặng món';
            }

            const div = document.createElement('div');
            div.className = 'promotion-item';
            div.innerHTML = `
                <strong>${p.name}</strong>
                <div>${label}</div>
                <small>${p.description || ''}</small>
            `;

            div.onclick = () => applyPromotion(p);
            promotionList.appendChild(div);
        });
    }

    function applyPromotion(promo) {
        selectedPromotion = promo;

        const total = Object.values(orderItems)
            .reduce((s, i) => s + i.qty * i.price, 0);

        let discount = 0;

        if (promo.type === 'percent') {
            discount = Math.round(total * promo.discount / 100);
        } 
        else if (promo.type === 'amount') {
            discount = Math.min(promo.discount, total);
        }

        promotionDiscount = discount;
        discountAmount = 0;

        discountInput.value = discount;
        promotionBtn.textContent = promo.name;
        promotionIdInput.value = promo.id;

        updatePayAmount();
        promotionPopup.style.display = 'none';
    }

    document.getElementById('promotionCancel').addEventListener('click', () => {
        promotionPopup.style.display = 'none';
    });

    function startVnpayPayment(payload, button) {
        if (!vnpayCreateUrl) {
            showToast('Chưa cấu hình URL tạo thanh toán VNPAY', 'error');
            return;
        }

        const originalText = button.textContent;
        button.disabled = true;
        button.textContent = 'Đang kết nối VNPAY...';

        fetch(vnpayCreateUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
            },
            body: JSON.stringify(payload)
        })
        .then(async res => {
            const text = await res.text();
            let data = {};

            try {
                data = text ? JSON.parse(text) : {};
            } catch (error) {
                throw new Error('Máy chủ không trả về JSON hợp lệ.');
            }

            if (!res.ok) {
                throw new Error(data.message || 'Không tạo được thanh toán VNPAY.');
            }

            return data;
        })
        .then(res => {
            if (res.success && res.redirect_url) {
                window.location.href = res.redirect_url;
                return;
            }

            button.disabled = false;
            button.textContent = originalText;
            showToast(res.message || 'Không tạo được thanh toán VNPAY', 'error');
        })
        .catch(err => {
            console.error(err);
            button.disabled = false;
            button.textContent = originalText;
            showToast('Lỗi kết nối VNPAY', 'error');
        });
    }

    document.querySelector('.btn-confirm-pay').addEventListener('click', (event) => {
        const table = getSelectedTable();
        if (!table) {
            showToast('Chưa chọn bàn', 'warning');
            return;
        }
        const currentTableId = table.id;
        const startTime = localStorage.getItem(`order_start_${currentTableId}`);
        if (!startTime) {
            showToast('Không tìm thấy thời gian bắt đầu', 'warning');
            return;
        }
        const items = Object.values(orderItems).map(item => ({
            product_id: item.id,
            qty: item.qty,
            price: item.price
        }));
        if (!items.length) {
            showToast('Chưa có món', 'warning');
            return;
        }
        function clearTableUI(tableId) {
            tableItems.forEach(t => {
                if (t.dataset.id == tableId) {
                    t.classList.remove('active', 'using');
                }
            });
            selectedTableBtn.textContent = 'Chưa chọn bàn';
            selectedTableBtn.disabled = true;
            selectedTableBtn.classList.remove('active');
            localStorage.removeItem('selectedTable');
        }
        function getPayMethod() {
            const radio = document.querySelector('input[name="pay_method"]:checked');
            return radio ? radio.value : null;
        }
        function showStockError(items) {
            items.forEach(item => {
                showToast(`${item.name} không đủ tồn kho, hiện còn ${item.current_qty}`, 'error');
            });
        }
        const total = Object.values(orderItems).reduce((sum, item) => sum + item.qty * item.price, 0);
        const discount = promotionDiscount > 0
            ? promotionDiscount
            : discountAmount;
        const payAmount = Math.max(total - discount, 0);
        const paymentMethod = getPayMethod();
            if (!paymentMethod) {
                showToast('Vui lòng chọn phương thức thanh toán', 'warning');
                return;
            }

        if (false && paymentMethod === 'card') {
            showToast('Đang chuyển hướng sang cổng thanh toán VNPAY...', 'info');
            const vnpayUrl = document.querySelector('meta[name="vnpay-create-url"]').getAttribute('content');
            fetch(vnpayUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                },
                body: JSON.stringify({
                    table_id: currentTableId,
                    time_start: startTime,
                    items: items,
                    total: total,
                    discount: discount,
                    pay_amount: payAmount,
                    payment_method: 'card',
                    promotion_id: selectedPromotion ? selectedPromotion.id : null
                })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success && data.redirect_url) {
                    window.location.href = data.redirect_url;
                } else {
                    showToast(data.message || 'Lỗi tạo liên kết thanh toán', 'error');
                }
            })
            .catch(err => {
                console.error(err);
                showToast('Lỗi kết nối máy chủ', 'error');
            });
            return;
        }

        const checkoutUrl = document
        .querySelector('meta[name="checkout-url"]')
        .getAttribute('content');
        const checkoutPayload = {
            table_id: currentTableId,
            time_start: startTime,
            items: items,
            total: total,
            discount: discount,
            pay_amount: payAmount,
            payment_method: paymentMethod,
            promotion_id: selectedPromotion ? selectedPromotion.id : null
        };

        if (paymentMethod === 'card') {
            startVnpayPayment(checkoutPayload, event.currentTarget);
            return;
        }

        fetch(checkoutUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
            },
            body: JSON.stringify(checkoutPayload)
        })
        .then(res => res.json())
        .then(res => {
            if (res.success) {
                showToast('Thanh toán thành công', 'success');
                window.cardPaymentApproved = false;

                if (res.updated_products && Array.isArray(res.updated_products)) {
                    res.updated_products.forEach(p => {
                        const menuItem = document.querySelector(`.menu-item[data-id="${p.product_id}"]`);
                        if (menuItem) {
                            const availableVal = p.available_qty !== null ? p.available_qty : 'null';
                            menuItem.dataset.available = availableVal;

                            const isOutOfStock = p.available_qty !== null && p.available_qty <= 0;
                            menuItem.classList.toggle('out-of-stock', isOutOfStock);
                        }
                    });
                }

                const orderCode = nextOrderNo();
                document.getElementById('orderNo').innerText = orderCode;

                localStorage.removeItem(`order_${currentTableId}`);
                localStorage.removeItem(`order_start_${currentTableId}`);
                orderItems = {};
                discountInput.value = 0;
                discountAmount = 0;
                discountBtn.textContent = 'Chọn giảm giá';
                promotionDiscount = 0;
                selectedPromotion = null;
                promotionIdInput.value = '';
                promotionBtn.textContent = 'Chọn KM';

                renderOrderList();
                updateTableStatus();
                removeServing(currentTableId)
                    .then(() => updateServicingCount())
                    .catch(err => console.error('Không thể cập nhật số lượng bàn đang phục vụ', err));
                closePayDrawer();
                clearTableUI(currentTableId);
            } else {
                if (res.insufficient_stock) {
                    showStockError(res.insufficient_stock);
                } else {
                    showToast(res.message || 'Lỗi thanh toán', 'error');
                }
            }
        })
        .catch(err => {
            console.error(err);
            showToast('Lỗi server', 'error');
        });
    });
    document.querySelectorAll('input[name="status"]').forEach(radio => {
        radio.addEventListener('change', () => {
            filterTablesByStatus(radio.value);
        });
    });
    function filterTablesByStatus(status) {
        tableItems.forEach(table => {
            const isUsing = table.classList.contains('using');

            if (status === 'all') {
                table.setAttribute('data-filtered', 'visible');
            }
            else if (status === 'active') {
                table.setAttribute('data-filtered', isUsing ? 'visible' : 'hidden');
            }
            else if (status === 'inactive') {
                table.setAttribute('data-filtered', !isUsing ? 'visible' : 'hidden');
            }
        });

        currentTablePage = 1;
        paginateTables();
    }

    // Check URL parameters for VNPAY callback results
    const urlParams = new URLSearchParams(window.location.search);
    const checkoutSuccess = urlParams.get('checkout_success');
    const checkoutError = urlParams.get('checkout_error');
    const callbackTableId = urlParams.get('table_id');

    if (checkoutSuccess === '1' && callbackTableId) {
        showToast('Thanh toán qua VNPAY thành công!', 'success');
        
        // Dọn dẹp giỏ hàng cục bộ của bàn
        localStorage.removeItem(`order_${callbackTableId}`);
        localStorage.removeItem(`order_start_${callbackTableId}`);
        
        // Reset giao diện bàn
        tableItems.forEach(t => {
            if (t.dataset.id == callbackTableId) {
                t.classList.remove('active', 'using');
            }
        });
        
        selectedTableBtn.textContent = 'Chưa chọn bàn';
        selectedTableBtn.disabled = true;
        selectedTableBtn.classList.remove('active');
        localStorage.removeItem('selectedTable');

        // Cập nhật số lượng bàn đang phục vụ
        updateServicingCount();
        
        // Làm sạch URL để tránh lặp lại hành động khi load lại trang
        const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.replaceState({path: cleanUrl}, '', cleanUrl);
    } else if (checkoutError === '1' && callbackTableId) {
        showToast('Thanh toán qua VNPAY thất bại hoặc bị hủy!', 'error');
        
        // Chọn lại bàn đó để thu ngân thấy tiếp
        const tableElement = document.querySelector(`.table-item[data-id="${callbackTableId}"]`);
        if (tableElement) {
            setSelectedTable(tableElement);
        }
        
        // Làm sạch URL
        const cleanUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
        window.history.replaceState({path: cleanUrl}, '', cleanUrl);
    }
});

