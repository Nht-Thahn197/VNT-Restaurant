// ===== CONFIG =====
const BASE_URL = document
    .querySelector('meta[name="base-url"]')
    .getAttribute('content');

const CSRF_TOKEN = document
    .querySelector('meta[name="csrf-token"]')
    .getAttribute('content');

// ===== ELEMENTS =====
const menuBtn = document.getElementById('menuBtn');
const dropdownMenu = document.getElementById('dropdownMenu');
const logoutLink = document.getElementById('logoutLink');
const modal = document.getElementById('bookingModal');
const btnCreate = document.querySelector('.btn-create');
const btnClose = document.getElementById('closeBookingModal');
const btnCancel = document.getElementById('cancelBooking');

const phoneInput = document.querySelector('input[name="phone"]');
const nameInput = document.querySelector('input[name="customer_name"]');
const customerIdInput = document.querySelector('input[name="customer_id"]');

const preorderModal = document.getElementById('preorderModal');
const btnAddPreorder = document.getElementById('btnAddPreorder');
const closePreorderModal = document.getElementById('closePreorderModal');
const cancelPreorder = document.getElementById('cancelPreorder');

const searchInput = document.getElementById('searchPreorderProduct');
const listEl = document.getElementById('preorderProductList');
const searchResultBox = document.getElementById('preorderSearchResult');

const savePreorderBtn = document.getElementById('savePreorder');
const cancelBookingBtn = document.getElementById('cancelBookingBtn');
const statusCheckboxes = document.querySelectorAll('.status-checkbox');

nameInput.disabled = true;
let preorderItems = {};
let phoneTimeout = null;
let searchTimeout = null;
let lastSearchKeyword = '';
let currentBookingId = null;

document.addEventListener('DOMContentLoaded', () => {
    // --- KHAI BÁO BIẾN ---
    const btnTime = document.getElementById('timeBtn');
    const menuTime = document.getElementById('timeMenu');
    const inputSearch = document.querySelectorAll('.sidebar .input-text'); // Lấy các ô search
    const rows = document.querySelectorAll('.booking-info');
    const btnTable = document.getElementById('tableBtn');
    const tableSearch = document.getElementById('tableSearch');
    
    let currentPage = 1;
    const rowsPerPage = 10;

    // Object lưu trữ trạng thái filter
    window.filters = {
        code: '',
        name: '',
        phone: '',
        from: null, // Unix timestamp
        to: null,   // Unix timestamp
        tableId: 'all',
        status: ['waiting', 'assigned', 'received']
    };

    // --- 1. XỬ LÝ DROPDOWN THỜI GIAN ---
    btnTime.addEventListener('click', (e) => {
        e.stopPropagation();
        btnTime.parentElement.classList.toggle('open');
    });

    btnTable.addEventListener('click', (e) => {
        e.stopPropagation();
        // Đóng menu thời gian nếu đang mở
        document.getElementById('timeBtn').parentElement.classList.remove('open');
        btnTable.parentElement.classList.toggle('open');
    });

    tableSearch.addEventListener('input', function() {
        const val = this.value.toLowerCase();
        document.querySelectorAll('.table-item').forEach(item => {
            const text = item.innerText.toLowerCase();
            item.style.display = text.includes(val) ? '' : 'none';
        });
    });

    document.addEventListener('click', e => {
        if (!btnTime.parentElement.contains(e.target)) {
            btnTime.parentElement.classList.remove('open');
        }

        if (btnTable && !btnTable.parentElement.contains(e.target)) {
            btnTable.parentElement.classList.remove('open');
        }
    });

    document.querySelectorAll('.time-item').forEach(item => {
        item.addEventListener('click', () => {
            const preset = item.dataset.preset;
            btnTime.innerHTML = `${item.innerText} <i class="fa fa-chevron-down"></i>`;
            applyPreset(preset);
            btnTime.parentElement.classList.remove('open');
            // Reset ô DateRangePicker nếu chọn preset nhanh
            $('#dateRange').val('');
        });
    });

    document.querySelectorAll('.table-item').forEach(item => {
        item.addEventListener('click', function() {
            // Xử lý UI
            document.querySelectorAll('.table-item').forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            
            btnTable.innerHTML = `${this.innerText} <i class="fa fa-chevron-down"></i>`;
            btnTable.parentElement.classList.remove('open');

            // Cập nhật logic filter
            window.filters.tableId = this.dataset.id;
            applyBookingFilters();
        });
    });

    // --- 2. LOGIC TÍNH TOÁN THỜI GIAN ---
    function applyPreset(preset) {
        const now = new Date();
        let from = null, to = null;

        // Helper: Tạo bản sao date để không làm thay đổi biến gốc
        const startOfDay = d => {
            const date = new Date(d);
            date.setHours(0, 0, 0, 0);
            return date;
        };
        const endOfDay = d => {
            const date = new Date(d);
            date.setHours(23, 59, 59, 999);
            return date;
        };

        switch (preset) {
            case 'today':
                from = startOfDay(now);
                to = endOfDay(now);
                break;
            case 'yesterday':
                const yesterday = new Date();
                yesterday.setDate(now.getDate() - 1);
                from = startOfDay(yesterday);
                to = endOfDay(yesterday);
                break;
            case 'this_week':
                // Tính Thứ 2 tuần này
                const first = now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1);
                const monday = new Date(now.setDate(first));
                from = startOfDay(monday);
                to = endOfDay(new Date()); // Đến hiện tại
                break;
            case 'last_week':
                const lastMon = new Date();
                lastMon.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1) - 7);
                const lastSun = new Date(lastMon);
                lastSun.setDate(lastMon.getDate() + 6);
                from = startOfDay(lastMon);
                to = endOfDay(lastSun);
                break;
            case 'this_month':
                from = new Date(now.getFullYear(), now.getMonth(), 1);
                to = endOfDay(new Date());
                break;
            case 'all':
                from = null;
                to = null;
                break;
            // ... các case khác tương tự
        }

        // Chuyển sang giây (Unix Timestamp) để so khớp với data-time đã sửa ở Blade
        window.filters.from = from ? Math.floor(from.getTime() / 1000) : null;
        window.filters.to   = to   ? Math.floor(to.getTime() / 1000) : null;

        applyBookingFilters();
    }
    // --- 3. BỘ LỌC CHÍNH ---
    function applyBookingFilters() {
        rows.forEach(row => {
            let match = true;

            // Filter Mã (Input 1)
            if (window.filters.code) {
                const codeTxt = (row.dataset.code || '').toLowerCase();
                if (!codeTxt.includes(window.filters.code)) match = false;
            }

            // Filter Tên (Input 2)
            if (match && window.filters.name) {
                const nameTxt = (row.dataset.name || '').toLowerCase();
                if (!nameTxt.includes(window.filters.name)) match = false;
            }

            // Filter SĐT (Input 3)
            if (match && window.filters.phone) {
                const phoneTxt = (row.dataset.phone || '').toLowerCase();
                if (!phoneTxt.includes(window.filters.phone)) match = false;
            }

            // Filter Thời gian (Unix timestamp)
            if (match && window.filters.from && window.filters.to) {
                const rowTime = Number(row.dataset.time);
                if (rowTime < window.filters.from || rowTime > window.filters.to) match = false;
            }

            // Filter Phòng/Bàn
            if (match && window.filters.tableId !== 'all') {
                // Đảm bảo ở thẻ <tr> bạn đã thêm data-table-id="{{ $booking->table_id }}"
                if (row.dataset.tableId !== window.filters.tableId) {
                    match = false;
                }
            }

            // Filter Trạng thái (Đa chọn)
            if (match) {
                const rowStatus = row.dataset.status;
                if (window.filters.status && window.filters.status.length > 0) {
                    if (!window.filters.status.includes(rowStatus)) {
                        match = false;
                    }
                }
            }
            row.dataset.filtered = match ? '1' : '0';
        });

        currentPage = 1;
        renderPagination();
    }

    // --- 4. PHÂN TRANG ---
    function renderPagination() {
        const filteredRows = Array.from(rows).filter(r => r.dataset.filtered !== '0');
        const totalPages = Math.ceil(filteredRows.length / rowsPerPage) || 1;

        // Ẩn tất cả trước
        rows.forEach(r => {
            r.style.display = 'none';
            const detail = document.getElementById(`detail-${r.dataset.id}`);
            if (detail) detail.style.display = 'none';
        });

        // Hiển thị theo trang
        const start = (currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;

        filteredRows.slice(start, end).forEach(r => r.style.display = '');

        // Cập nhật UI Info
        const pageInfo = document.getElementById('pageInfo');
        if (pageInfo) pageInfo.innerText = `Trang ${currentPage} / ${totalPages}`;
        
        // Disabled nút nếu cần
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');
        if(prevBtn) prevBtn.disabled = (currentPage === 1);
        if(nextBtn) nextBtn.disabled = (currentPage === totalPages);

        const paginationContainer = document.getElementById('pagination');
        if (totalPages <= 1) {
            paginationContainer.classList.add('d-none');
        } else {
            paginationContainer.classList.remove('d-none');
        }
    }

    // --- 5. SỰ KIỆN LẮNG NGHE ---

    // Gán sự kiện cho 3 ô input search theo thứ tự
    const searchInputs = document.querySelectorAll('.filter-box .input-text');
    if (searchInputs.length >= 3) {
        searchInputs[0].addEventListener('input', e => { window.filters.code = e.target.value.toLowerCase(); applyBookingFilters(); });
        searchInputs[1].addEventListener('input', e => { window.filters.name = e.target.value.toLowerCase(); applyBookingFilters(); });
        searchInputs[2].addEventListener('input', e => { window.filters.phone = e.target.value.toLowerCase(); applyBookingFilters(); });
    }

    // Nút phân trang (Xử lý sự kiện 1 lần)
    document.getElementById('prevPage')?.addEventListener('click', () => {
        if (currentPage > 1) { currentPage--; renderPagination(); }
    });
    document.getElementById('nextPage')?.addEventListener('click', () => {
        const filteredRowsCount = Array.from(rows).filter(r => r.dataset.filtered !== '0').length;
        if (currentPage < Math.ceil(filteredRowsCount / rowsPerPage)) { currentPage++; renderPagination(); }
    });

    // DateRangePicker
    $('#dateRange').daterangepicker({
        autoUpdateInput: false,
        locale: { format: 'DD/MM/YYYY', applyLabel: 'Áp dụng', cancelLabel: 'Hủy' }
    }).on('apply.daterangepicker', function(ev, picker) {
        $(this).val(picker.startDate.format('DD/MM/YYYY') + ' - ' + picker.endDate.format('DD/MM/YYYY'));
        window.filters.from = picker.startDate.startOf('day').unix();
        window.filters.to = picker.endDate.endOf('day').unix();
        btnTime.innerHTML = `Tùy chọn <i class="fa fa-chevron-down"></i>`;
        applyBookingFilters();
    }).on('cancel.daterangepicker', function() {
        $(this).val('');
        window.filters.from = null;
        window.filters.to = null;
        applyBookingFilters();
    });

    statusCheckboxes.forEach(ck => {
        ck.addEventListener('change', () => {
            // Lấy tất cả các giá trị của checkbox đang được check
            const checkedValues = Array.from(statusCheckboxes)
                .filter(c => c.checked)
                .map(c => c.value);
            
            window.filters.status = checkedValues;
            applyBookingFilters();
        });
    });

    // Khởi tạo
    applyBookingFilters();
});

menuBtn.addEventListener('click', function(e) {
    e.stopPropagation(); // Ngăn sự kiện nổi bọt
    dropdownMenu.classList.toggle('show');
});

document.addEventListener('click', function() {
    dropdownMenu.classList.remove('show');
});

if (logoutLink) {
    logoutLink.addEventListener('click', function(e) {
        e.preventDefault();
        if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
            document.getElementById('logout-form').submit();
        }
    });
}

// ===== OPEN / CLOSE MODAL =====
btnCreate.addEventListener('click', () => {
    modal.style.display = 'flex';

    phoneInput.value = '';
    nameInput.value = '';
    customerIdInput.value = '';

    nameInput.disabled = true;
    nameInput.placeholder = 'Nhập số điện thoại trước';
    nameInput.classList.remove('new-customer', 'input-readonly');
});

btnClose.addEventListener('click', closeModal);
btnCancel.addEventListener('click', closeModal);

function closeModal() {
    modal.style.display = 'none';
}

async function checkCustomerByPhone() {
    const phone = phoneInput.value.trim();

    // chỉ check khi đủ 9–10 số
    if (!/^\d{9,10}$/.test(phone)) return;

    try {
        const res = await fetch(
            `${BASE_URL}/pos/customer/check?phone=${encodeURIComponent(phone)}`,
            { headers: { 'Accept': 'application/json' } }
        );

        if (!res.ok) return;

        const data = await res.json();

        if (data.exists) {
            // ===== KHÁCH CŨ =====
            customerIdInput.value = data.customer.id;
            nameInput.value = data.customer.name;

            nameInput.disabled = true;
            nameInput.classList.remove('new-customer');
            nameInput.classList.add('input-readonly');
        } else {
            // ===== KHÁCH MỚI =====
            customerIdInput.value = '';
            nameInput.value = '';

            nameInput.disabled = false;
            nameInput.placeholder = 'Nhập tên khách mới';
            nameInput.classList.remove('input-readonly');
            nameInput.classList.add('new-customer');

            nameInput.focus();
        }

    } catch (err) {
        console.error('CHECK PHONE ERROR:', err);
    }
}

// Blur khỏi ô SĐT
phoneInput.addEventListener('blur', checkCustomerByPhone);

// Nhấn Enter trong ô SĐT
phoneInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        checkCustomerByPhone();
    }
});

btnAddPreorder.onclick = () => preorderModal.style.display = 'flex';
closePreorderModal.onclick = cancelPreorder.onclick = () => {
    preorderModal.style.display = 'none';
};

searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);

    const keyword = searchInput.value.trim();

    if (!keyword) {
        searchResultBox.innerHTML = '';
        return;
    }

    searchTimeout = setTimeout(async () => {
        lastSearchKeyword = keyword;
        searchResultBox.innerHTML = '';

        try {
            const res = await fetch(
                `${BASE_URL}/pos/booking/search-product?q=${encodeURIComponent(keyword)}`,
                { headers: { 'Accept': 'application/json' } }
            );

            if (!res.ok) return;

            const products = await res.json();

            // ⛔ nếu keyword đã đổi → bỏ response cũ
            if (keyword !== lastSearchKeyword) return;

            products.forEach(p => {
                const li = document.createElement('li');
                li.textContent = `${p.name} – ${Number(p.price).toLocaleString()}đ`;

                li.onclick = () => {
                    addPreorderItem(p);
                    searchInput.value = '';
                    searchResultBox.innerHTML = '';
                };

                searchResultBox.appendChild(li);
            });

        } catch (err) {
            console.error('SEARCH PREORDER ERROR:', err);
        }
    }, 300); // debounce 300ms
});

document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !searchResultBox.contains(e.target)) {
        searchResultBox.innerHTML = '';
    }
});

function addPreorderItem(product) {
    if (!preorderItems[product.id]) {
        preorderItems[product.id] = {
            product_id: product.id,
            product_code: product.code,
            product_name: product.name,
            price: product.price,
            qty: 1,
            note: ''
        };
    } else {
        preorderItems[product.id].qty += 1;
    }

    renderPreorderTable();
}

function renderPreorderTable() {
    listEl.innerHTML = '';

    Object.values(preorderItems).forEach(item => {
        listEl.insertAdjacentHTML('beforeend', `
            <tr>
                <td>${item.product_code}</td>
                <td>${item.product_name}</td>
                <td>${Number(item.price).toLocaleString()}</td>
                <td>
                    <button onclick="changeQty(${item.product_id}, -1)">−</button>
                    <span class="mx-2">${item.qty}</span>
                    <button onclick="changeQty(${item.product_id}, 1)">+</button>
                </td>
                <td>
                    <input
                        type="text"
                        value="${item.note}"
                        onchange="updateNote(${item.product_id}, this.value)"
                        placeholder="Ghi chú"
                    >
                </td>
                <td>
                    <button onclick="removePreorder(${item.product_id})">
                        <i class="far fa-trash-alt delete-icon"></i>
                    </button>
                </td>
            </tr>
        `);
    });
}

function changeQty(id, delta) {
    if (!preorderItems[id]) return;

    preorderItems[id].qty += delta;

    if (preorderItems[id].qty < 1) {
        preorderItems[id].qty = 1;
    }

    renderPreorderTable();
}

function updateNote(id, note) {
    if (!preorderItems[id]) return;

    preorderItems[id].note = note;
}

function removePreorder(id) {
    if (!preorderItems[id]) return;

    delete preorderItems[id];
    renderPreorderTable();
}

savePreorderBtn.addEventListener('click', () => {
    renderPreorderSummary();
    preorderModal.style.display = 'none';
});

function renderPreorderSummary() {
    const box = document.getElementById('preorderSummary');
    const items = Object.values(preorderItems);

    if (items.length === 0) {
        box.innerHTML = '<em class="text-muted">Chưa có món đặt trước</em>';
        return;
    }

    const showItems = items.slice(0, 3);
    const remain = items.length - showItems.length;

    let html = '<div class="preorder-inline">';

    showItems.forEach(item => {
        html += `
            <div class="preorder-line">
                ${item.product_name} x ${item.qty}
            </div>
        `;
    });

    if (remain > 0) {
        html += `
            <div class="preorder-more">
                <a href="javascript:void(0)" onclick="showPreorderPopup()">
                    + ${remain} món khác
                </a>
            </div>
        `;
    }

    html += `
    </div>`;

    box.innerHTML = html;
}

function showPreorderPopup() {
    let popup = document.getElementById('preorderPopup');

    if (!popup) {
        popup = document.createElement('div');
        popup.id = 'preorderPopup';
        popup.className = 'preorder-popup';
        document.body.appendChild(popup);
    }

    let html = '<strong>Món đặt trước:</strong><ul>';

    Object.values(preorderItems).forEach(item => {
        html += `
            <li>
                ${item.qty} ${item.product_name}
            </li>
        `;
    });

    html += '</ul>';

    popup.innerHTML = html;
    popup.style.display = 'block';
}

document.addEventListener('click', (e) => {
    const popup = document.getElementById('preorderPopup');
    if (!popup) return;

    if (
        !popup.contains(e.target) &&
        !e.target.closest('.preorder-more')
    ) {
        popup.style.display = 'none';
    }
});

btnAddPreorder.onclick = () => {
    preorderModal.style.display = 'flex';
    renderPreorderTable(); // load lại món cũ
};

// ===== SAVE BOOKING =====
document.getElementById('saveBooking').onclick = async () => {
    if (currentBookingId) {
        await updateBooking(currentBookingId);
    } else {
        await createBooking();
    }
};

async function createBooking() {
    const form = document.getElementById('bookingForm');

    const phone = phoneInput.value.trim();
    const name = nameInput.value.trim();

    if (!phone) {
        showToast('⚠️ Vui lòng nhập số điện thoại', 'warning');
        return;
    }

    if (!customerIdInput.value && !name) {
        showToast('⚠️ Vui lòng nhập tên khách hàng mới', 'warning');
        return;
    }

    const formData = new FormData(form);

    const promoInput = document.getElementById('promotion_id');
    if (promoInput) {
        formData.append('promotion_id', promoInput.value || '');
    }

    const arrivalTime = form.querySelector('[name="arrival_time"]')?.value;
    if (arrivalTime) formData.append('booking_time', arrivalTime);

    const adult = Number(form.querySelector('[name="adult"]').value || 0);
    const child = Number(form.querySelector('[name="child"]').value || 0);

    formData.append('guest_count', adult + child);
    formData.append(
        'preorder_items',
        JSON.stringify(Object.values(preorderItems))
    );

    try {
        const res = await fetch(`${BASE_URL}/pos/booking/store`, {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': CSRF_TOKEN,
                'Accept': 'application/json'
            },
            body: formData
        });

        const data = await res.json();

        if (!data.success) {
            showToast(data.message || 'Lỗi server', 'error');
            return;
        }

        showToast('Đặt bàn thành công', 'success');
        setTimeout(() => {
            location.reload();
        }, 800);

    } catch (err) {
        console.error(err);
        showToast('Lỗi server', 'error');
    }
}

document.querySelectorAll('.edit-icon').forEach(icon => {
    icon.addEventListener('click', async () => {
        const id = icon.dataset.id;

        try {
            const res = await fetch(`${BASE_URL}/pos/booking/${id}`, {
                headers: { 'Accept': 'application/json' }
            });

            if (!res.ok) {
                throw new Error('HTTP ' + res.status);
            }

            const data = await res.json();

            if (!data.success) {
                alert(data.message || 'Không load được booking');
                return;
            }

            openEditBookingModal(data.booking);

        } catch (err) {
            console.error(err);
            showToast('Lỗi server', 'error');
        }
    });
});

function resetSaveButton(handler) {
    const oldBtn = document.getElementById('saveBooking');
    const newBtn = oldBtn.cloneNode(true);
    oldBtn.parentNode.replaceChild(newBtn, oldBtn);
    newBtn.onclick = handler;
}

function openEditBookingModal(booking) {
    console.log('booking.table_id =', booking.table_id);

    const tableSelect = document.querySelector('[name="table_id"]');
    
    
    currentBookingId = booking.id;

    modal.style.display = 'flex';
    modal.querySelector('h3').textContent = 'Chỉnh sửa đặt bàn';

    nameInput.value = booking.customer_name;
    phoneInput.value = booking.phone;

    nameInput.disabled = true;
    phoneInput.disabled = true;

    cancelBookingBtn.style.display =
        ['received', 'cancel'].includes(booking.status)
            ? 'none'
            : 'inline-block';

    document.getElementById('customer_id').value = booking.customer_id;

    document.querySelector('[name="arrival_time"]').value =
        booking.booking_time?.replace(' ', 'T') || '';

    document.querySelector('[name="note"]').value = booking.note || '';

    tableSelect.value = booking.table_id
    ? String(booking.table_id)
    : '';

    // ===== PROMOTION =====
    document.getElementById('promotion_name').value =
        booking.promotion_name ?? 'Không có ưu đãi';

    document.getElementById('promotion_id').value =
        booking.promotion_id ?? '';

    document.querySelector('[name="adult"]').value = booking.guest_count;
    document.querySelector('[name="child"]').value = 0;

    renderStatusLine(booking.status);

    preorderItems = {};
    booking.items.forEach(i => {
        preorderItems[i.product_id] = {
            product_id: i.product_id,
            product_name: i.product_name,
            price: i.price,
            qty: i.qty,
            note: i.note || ''
        };
    });

    renderPreorderSummary();
}

async function updateBooking(id) {
    const formData = new FormData();

    formData.append('booking_time',
        document.querySelector('[name="arrival_time"]').value
    );

    const adult = Number(document.querySelector('[name="adult"]').value || 0);
    const child = Number(document.querySelector('[name="child"]').value || 0);

    formData.append('guest_count', adult + child);
    formData.append('table_id',
        document.querySelector('[name="table_id"]').value || ''
    );

    formData.append(
        'promotion_id',
        document.getElementById('promotion_id').value || ''
    );
    formData.append('note',
        document.querySelector('[name="note"]').value
    );
    formData.append(
        'preorder_items',
        JSON.stringify(Object.values(preorderItems))
    );

    const res = await fetch(`${BASE_URL}/pos/booking/${id}/update`, {
        method: 'POST',
        headers: {
            'X-CSRF-TOKEN': CSRF_TOKEN,
            'Accept': 'application/json'
        },
        body: formData
    });

    const data = await res.json();

    if (!data.success) {
        showToast(data.message || 'Lỗi server', 'error');
        return;
    }

    showToast('Xếp bàn thành công', 'success');
    setTimeout(() => {
        location.reload();
    }, 800);
}

function openCreateBookingModal() {
    currentBookingId = null;
    nameInput.disabled = false;
    phoneInput.disabled = false;
    modal.querySelector('h3').textContent = 'Thêm mới đặt bàn';
}

function renderStatusLine(status) {
    const map = {
        waiting: '⏳ Chờ xếp bàn',
        assigned: '📌 Đã xếp bàn',
        received: '✅ Đã nhận bàn',
        cancel: '❌ Đã hủy'
    };
    let el = document.getElementById('bookingStatusLine');
    if (!el) {
        el = document.createElement('div');
        el.id = 'bookingStatusLine';
        el.className = 'booking-status';
        document.querySelector('.modal-body').prepend(el);
    }
    el.textContent = map[status] || status;
}

async function cancelBooking(id) {
    if (!confirm('❌ Xác nhận hủy đặt bàn?')) return;
    try {
        const res = await fetch(`${BASE_URL}/pos/booking/${id}/cancel`, {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': CSRF_TOKEN,
                'Accept': 'application/json'
            }
        });
        const data = await res.json();
        if (!res.ok || data.success === false) {
            showToast(data.message || 'Không thể hủy bàn đã xếp', 'error');
            return;
        }
        showToast('Đã hủy bàn đặt', 'success');
        setTimeout(() => {
            location.reload();
        }, 800);
    } catch (err) {
        console.error(err);
        showToast('Lỗi server', 'error');
    }
}

document.querySelectorAll('.delete-icon').forEach(icon => {
    icon.addEventListener('click', () => {
        const id = icon.dataset.id;
        cancelBooking(id);
    });
});

cancelBookingBtn.onclick = () => {
    if (!currentBookingId) return;
    cancelBooking(currentBookingId);
};

document.querySelectorAll('.receive-icon').forEach(icon => {
    icon.addEventListener('click', async function() {
        const id = this.dataset.id;
        if (!confirm('Xác nhận khách đã đến và nhận bàn?')) return;

        try {
            const res = await fetch(`/VNT-Restaurant/public/pos/booking/${id}/receive`, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                    'Accept': 'application/json'
                }
            });
            const data = await res.json();
            if (data.success) {
                // Chuyển trang sang Cashier
                window.location.href = data.redirect;
            }
        } catch (err) {
            showToast('Lỗi server', 'error');
        }
    });
});

