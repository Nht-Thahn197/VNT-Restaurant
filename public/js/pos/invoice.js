window.filters = {
    code: '',
    product: '',
    status: 'all',
    from: null,
    to: null,
    payment: [],
    area: '',
    table: ''
};

document.addEventListener('DOMContentLoaded', () => {

    setupCustomDropdown('areaDropdown', 'filter-area', 'currentAreaText', 'area', {
        otherInputId: 'filter-table',
        otherTextId: 'currentTableText',
        otherFilterKey: 'table',
        otherDefaultText: 'Chọn phòng/bàn'
    });

    setupCustomDropdown('tableDropdown', 'filter-table', 'currentTableText', 'table', {
        otherInputId: 'filter-area',
        otherTextId: 'currentAreaText',
        otherFilterKey: 'area',
        otherDefaultText: 'Chọn khu vực'
    });

    document.addEventListener('click', () => {
        document.querySelectorAll('.custom-dropdown').forEach(d => d.classList.remove('active'));
        const timeBtn = document.getElementById('timeBtn');
        if (timeBtn) timeBtn.parentElement.classList.remove('open');
    });

    const btn = document.getElementById('timeBtn');
    const menu = document.getElementById('timeMenu');

    btn.addEventListener('click', () => {
        btn.parentElement.classList.toggle('open');
    });

    document.addEventListener('click', e => {
        if (!btn.parentElement.contains(e.target)) {
            btn.parentElement.classList.remove('open');
        }
    });

    document.querySelectorAll('.time-item').forEach(item => {
        item.addEventListener('click', () => {
            const preset = item.dataset.preset;
            applyPreset(preset);
            btn.innerText = item.innerText;
            btn.parentElement.classList.remove('open');
        });
    });

    function applyPreset(preset) {
        const now = new Date();
        let from = null, to = null;

        const startOfDay = d => new Date(d.setHours(0,0,0,0));
        const endOfDay   = d => new Date(d.setHours(23,59,59,999));

        switch (preset) {
            case 'today':
                from = startOfDay(new Date());
                to = endOfDay(new Date());
                break;

            case 'yesterday':
                const y = new Date();
                y.setDate(y.getDate() - 1);
                from = startOfDay(new Date(y));
                to = endOfDay(new Date(y));
                break;

            case 'this_week':
                const w1 = new Date();
                const day = w1.getDay() || 7;
                w1.setDate(w1.getDate() - day + 1);
                from = startOfDay(w1);
                to = new Date();
                break;

            case 'last_week':
                const lw = new Date();
                lw.setDate(lw.getDate() - lw.getDay() - 6);
                from = startOfDay(lw);
                const lwEnd = new Date(lw);
                lwEnd.setDate(lwEnd.getDate() + 6);
                to = endOfDay(lwEnd);
                break;

            case 'last_7_days':
                from = startOfDay(new Date(now.setDate(now.getDate() - 7)));
                to = new Date();
                break;

            case 'this_month':
                from = new Date(now.getFullYear(), now.getMonth(), 1);
                to = new Date();
                break;

            case 'last_month':
                from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                to = new Date(now.getFullYear(), now.getMonth(), 0, 23,59,59);
                break;

            case 'last_30_days':
                from = startOfDay(new Date(now.setDate(now.getDate() - 30)));
                to = new Date();
                break;

            case 'this_year':
                from = new Date(now.getFullYear(), 0, 1);
                to = new Date();
                break;

            case 'last_year':
                from = new Date(now.getFullYear() - 1, 0, 1);
                to = new Date(now.getFullYear() - 1, 11, 31, 23,59,59);
                break;

            case 'all':
                from = null;
                to = null;
                break;
        }
        window.filters.from = from ? Math.floor(from.getTime() / 1000) : null;
        window.filters.to   = to   ? Math.floor(to.getTime() / 1000) : null;

        applyFilters(); // hàm filter invoice của bạn
    }

});

const areaSelect  = document.getElementById('filter-area');
const tableSelect = document.getElementById('filter-table');

function setupCustomDropdown(dropdownId, hiddenInputId, textSpanId, filterKey, resetLogic = null) {
    const dropdown = document.getElementById(dropdownId);
    if (!dropdown) return;

    const display = dropdown.querySelector('.selected-display');
    const items = dropdown.querySelectorAll('.dropdown-list li');
    const hiddenInput = document.getElementById(hiddenInputId);
    const textSpan = document.getElementById(textSpanId);

    // --- Xử lý Mở/Đóng và Drop-up ---
    display.addEventListener('click', (e) => {
        e.stopPropagation();
        
        const isOpening = !dropdown.classList.contains('active');

        // Đóng các dropdown khác trước
        document.querySelectorAll('.custom-dropdown').forEach(d => {
            if (d !== dropdown) d.classList.remove('active');
        });

        if (isOpening) {
            // Kiểm tra khoảng cách để drop-up
            const rect = dropdown.getBoundingClientRect();
            const listHeight = 250; // Chiều cao ước tính của menu đổ xuống
            const spaceBelow = window.innerHeight - rect.bottom;

            if (spaceBelow < listHeight && rect.top > listHeight) {
                dropdown.classList.add('drop-up');
            } else {
                dropdown.classList.remove('drop-up');
            }
            dropdown.classList.add('active');
        } else {
            dropdown.classList.remove('active');
        }
    });

    // --- Xử lý Chọn Item ---
    items.forEach(item => {
        item.addEventListener('click', (e) => {
            e.stopPropagation();
            const val = item.getAttribute('data-value');
            const txt = item.innerText;

            // Cập nhật giao diện và giá trị ẩn
            textSpan.innerText = txt;
            hiddenInput.value = val;
            window.filters[filterKey] = val;

            // Logic Reset (Nếu chọn Khu vực thì xóa Bàn và ngược lại)
            if (resetLogic) {
                const otherInput = document.getElementById(resetLogic.otherInputId);
                const otherText = document.getElementById(resetLogic.otherTextId);
                
                if (otherInput) otherInput.value = '';
                if (otherText) otherText.innerText = resetLogic.otherDefaultText;
                window.filters[resetLogic.otherFilterKey] = '';
            }

            dropdown.classList.remove('active');
            
            // Gọi hàm lọc chính
            if (typeof applyFilters === 'function') applyFilters();
        });
    });
}

function applyFilters() {
    document.querySelectorAll('.invoice-row').forEach(row => {
        let match = true;

        // 🔍 mã hóa đơn
        if (filters.code) {
            match = row.dataset.code.includes(filters.code);
        }

        // 🔍 tên sản phẩm
        if (match && filters.product) {
            const detail = document.getElementById(`detail-${row.dataset.id}`);
            const text = detail?.innerText.toLowerCase() || '';
            match = text.includes(filters.product);
        }

        // ⚙️ trạng thái
        if (match && filters.status !== 'all') {
            match = row.dataset.status === filters.status;
        }

        // ⏰ thời gian
        if (match && filters.from && filters.to && row.dataset.time) {
            const t = Number(row.dataset.time);
            match = t >= filters.from && t <= filters.to;
        }

        if (match && filters.payment.length > 0) {
            match = filters.payment.includes(row.dataset.payment);
        }

        // lọc theo khu vực
        if (match && filters.area) {
            match = row.dataset.areaId === filters.area;
        }

        // lọc theo bàn
        if (match && filters.table) {
            match = row.dataset.tableId === filters.table;
        }

        row.dataset.filtered = match ? '1' : '0';
        row.style.display = match ? '' : 'none';

        const detail = document.getElementById(`detail-${row.dataset.id}`);
        if (detail) detail.style.display = 'none';
    });

    currentPage = 1;
    renderPagination();
}

document.querySelectorAll('.search-input')[0].addEventListener('input', e => {
    filters.code = e.target.value.trim().toLowerCase();
    applyFilters();
});

document.querySelectorAll('.search-input')[1].addEventListener('input', e => {
    filters.product = e.target.value.trim().toLowerCase();
    applyFilters();
});

document.querySelectorAll('input[name="status"]').forEach(radio => {
    radio.addEventListener('change', e => {
        filters.status = e.target.value;
        applyFilters();
    });
});

$(function () {
    $('#dateRange').daterangepicker({
        autoUpdateInput: false,
        locale: {
            format: 'DD/MM/YYYY',
            applyLabel: 'Áp dụng',
            cancelLabel: 'Hủy',
            fromLabel: 'Từ',
            toLabel: 'Đến',
            customRangeLabel: 'Tùy chọn',
            daysOfWeek: ['CN','T2','T3','T4','T5','T6','T7'],
            monthNames: [
                'Tháng 1','Tháng 2','Tháng 3','Tháng 4',
                'Tháng 5','Tháng 6','Tháng 7','Tháng 8',
                'Tháng 9','Tháng 10','Tháng 11','Tháng 12'
            ]
        }
    });

    // khi chọn xong
    $('#dateRange').on('apply.daterangepicker', function (ev, picker) {
        const from = picker.startDate.startOf('day');
        const to   = picker.endDate.endOf('day');

        $(this).val(
            picker.startDate.format('DD/MM/YYYY') +
            ' - ' +
            picker.endDate.format('DD/MM/YYYY')
        );

        // lưu vào filter
        filters.from = from.unix();
        filters.to   = to.unix();

        currentPage = 1;
        applyFilters();
    });

    // khi bấm hủy
    $('#dateRange').on('cancel.daterangepicker', function () {
        $(this).val('');
        filters.from = null;
        filters.to   = null;

        currentPage = 1;
        applyFilters();
    });
});

function getSelectedPayments() {
    return Array.from(document.querySelectorAll('input[name="payment"]:checked'))
        .map(cb => cb.value);
}

document.querySelectorAll('input[name="payment"]').forEach(cb => {
    cb.addEventListener('change', () => {
        filters.payment = getSelectedPayments();
        applyFilters();
    });
});

document.querySelectorAll('.box.collapsible').forEach(box => {
    const title = box.querySelector('.box-title');
    if (!title) return;

    title.addEventListener('click', (e) => {
        if (e.target.closest('.custom-dropdown') || e.target.closest('.time-dropdown')) {
            return; 
        }

        box.classList.toggle('collapsed');
    });
});

// ===== TÍNH TỔNG TIỀN =====
let sumMoney = 0;
let sumDiscount = 0;
let sumFinal = 0;

document.querySelectorAll('.invoice-row').forEach(row => {
    const money    = Number(row.querySelector('.money')?.dataset.value || 0);
    const discount = Number(row.querySelector('.discount')?.dataset.value || 0);
    const finalPay = Number(row.querySelector('.final')?.dataset.value || 0);

    sumMoney    += money;
    sumDiscount += discount;
    sumFinal    += finalPay;
});

const format = n => n.toLocaleString('vi-VN');

const sumMoneyEl    = document.getElementById('sum-money');
const sumDiscountEl = document.getElementById('sum-discount');
const sumFinalEl    = document.getElementById('sum-final');

if (sumMoneyEl)    sumMoneyEl.textContent    = format(sumMoney);
if (sumDiscountEl) sumDiscountEl.textContent = format(sumDiscount);
if (sumFinalEl)    sumFinalEl.textContent    = format(sumFinal);

document.querySelectorAll('.invoice-row').forEach(row => {
    row.addEventListener('click', () => {
        const id = row.dataset.id;
        const detailRow = document.getElementById(`detail-${id}`);
        const isActive = row.classList.contains('active');

        // 🔴 Reset tất cả
        document.querySelectorAll('.invoice-row').forEach(r => r.classList.remove('active'));
        document.querySelectorAll('.invoice-detail').forEach(tr => tr.style.display = 'none');

        // 🟢 Toggle dòng hiện tại
        if (!isActive) {
            row.classList.add('active');
            detailRow.style.display = 'table-row';
        }
    });
});

document.querySelectorAll('.btn-cancel').forEach(btn => {
    btn.addEventListener('click', e => {
        e.stopPropagation(); // không đóng detail
        const id = btn.dataset.id;

        if (!confirm('Bạn chắc chắn muốn hủy hóa đơn này?')) return;

        fetch(`/pos/invoice/${id}/cancel`, {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
            }
        })
        .then(res => res.json())
        .then(data => {
            showToast('Đã hủy hóa đơn', 'success');
            setTimeout(() => {
                location.reload();
            }, 800);
        });
    });
});

let currentPage = 1;
const rowsPerPage = 13;

function getInvoiceRows() {
    return Array.from(document.querySelectorAll('.invoice-row'))
        .filter(row => row.dataset.filtered !== '0');
}

function renderPagination() {
    const rows = getInvoiceRows();
    const totalPages = Math.ceil(rows.length / rowsPerPage) || 1;

    if (currentPage > totalPages) currentPage = totalPages;

    rows.forEach((row, index) => {
        const detail = document.getElementById(`detail-${row.dataset.id}`);
        const start = (currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;

        const show = index >= start && index < end;
        row.style.display = show ? '' : 'none';
        if (detail) detail.style.display = 'none'; // luôn ẩn chi tiết
    });

    document.getElementById('pageInfo').innerText =
        `Trang ${currentPage} / ${totalPages}`;

    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage === totalPages;

    calculateSummary(rows);

    const paginationContainer = document.getElementById('pagination');
        if (totalPages <= 1) {
        paginationContainer.classList.add('d-none');
        } else {
        paginationContainer.classList.remove('d-none');
        }
}
document.getElementById('prevPage').onclick = () => {
    if (currentPage > 1) {
        currentPage--;
        renderPagination();
    }
};

document.getElementById('nextPage').onclick = () => {
    currentPage++;
    renderPagination();
};

function calculateSummary(rows) {
    let sumMoney = 0;
    let sumDiscount = 0;
    let sumFinal = 0;

    rows.forEach(row => {
        sumMoney += Number(row.querySelector('.money')?.dataset.value || 0);
        sumDiscount += Number(row.querySelector('.discount')?.dataset.value || 0);
        sumFinal += Number(row.querySelector('.final')?.dataset.value || 0);
    });

    document.getElementById('sum-money').innerText =
        sumMoney.toLocaleString('vi-VN');
    document.getElementById('sum-discount').innerText =
        sumDiscount.toLocaleString('vi-VN');
    document.getElementById('sum-final').innerText =
        sumFinal.toLocaleString('vi-VN');
}

document.querySelectorAll('.invoice-row').forEach(row => {
    row.dataset.filtered = '1';
});
renderPagination();