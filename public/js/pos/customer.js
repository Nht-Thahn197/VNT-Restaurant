document.addEventListener("DOMContentLoaded", function () {
    // ELEMENTS
    const inputCode = document.getElementById('searchCode');
    const inputName = document.getElementById('searchName');
    const inputPhone = document.getElementById('searchPhone');
    const rows = Array.from(document.querySelectorAll('.customer-info'));
    const storeRoleUrl = document.querySelector('meta[name="csrf-token"]').dataset.storeUrl;

    let currentPage = 1;
    const rowsPerPage = 10;
        
    const filters = {
        code: '',
        name: '',
        phone: ''
    };

    function applyCustomerFilters() {
        rows.forEach(row => {
            // Lấy dữ liệu từ dataset (ép về chữ thường để so sánh không phân biệt hoa thường)
            const rowCode = (row.dataset.code || '').toLowerCase();
            const rowName = (row.dataset.name || '').toLowerCase();
            const rowPhone = (row.dataset.phone || '').toLowerCase();

            // Logic: Khớp tất cả các ô (AND logic)
            const matchCode = rowCode.includes(filters.code);
            const matchName = rowName.includes(filters.name);
            const matchPhone = rowPhone.includes(filters.phone);

            const isMatch = matchCode && matchName && matchPhone;

            // Đánh dấu và ẩn/hiện
            row.dataset.filtered = isMatch ? '1' : '0';
            
            // Ẩn ngay lập tức những row không khớp để dành chỗ cho phân trang
            if (!isMatch) {
                row.style.display = 'none';
                const detail = document.getElementById(`detail-${row.dataset.id}`);
                if (detail) detail.style.display = 'none';
            }
        });

        currentPage = 1;
        renderPagination(); // Gọi hàm phân trang của bạn
    }

    [inputCode, inputName, inputPhone].forEach(input => {
        if (!input) return;
        
        input.addEventListener('input', function() {
            // Cập nhật giá trị vào object filters dựa trên id của input
            if (this.id === 'searchCode') filters.code = this.value.trim().toLowerCase();
            if (this.id === 'searchName') filters.name = this.value.trim().toLowerCase();
            if (this.id === 'searchPhone') filters.phone = this.value.trim().toLowerCase();
            
            applyCustomerFilters();
        });
    });

    // ================= GET ROWS =================
    function getRows() {
        return rows.filter(r => r.dataset.filtered !== '0');
    }
    // ================= PAGINATION =================
    function renderPagination() {
            const filteredRows = rows.filter(r => r.dataset.filtered === '1');
            const totalPages = Math.ceil(filteredRows.length / rowsPerPage) || 1;

            if (currentPage > totalPages) currentPage = totalPages;

            // Ẩn tất cả trước
            rows.forEach(r => r.style.display = 'none');

            // Hiển thị đúng các bản ghi thuộc trang hiện tại
            const start = (currentPage - 1) * rowsPerPage;
            const end = start + rowsPerPage;

            filteredRows.forEach((row, index) => {
                if (index >= start && index < end) {
                    row.style.display = ''; 
                }
            });

            // Cập nhật UI (nút bấm, số trang...)
            const pageInfo = document.getElementById('pageInfo');
            if (pageInfo) pageInfo.innerText = `Trang ${currentPage} / ${totalPages}`;
            const paginationContainer = document.getElementById('pagination');
            if (totalPages <= 1) {
            paginationContainer.classList.add('d-none');
            } else {
            paginationContainer.classList.remove('d-none');
            }
        }
        
        // Khởi tạo lần đầu
        applyCustomerFilters();


    // ================= EVENTS =================

    // search
    document.querySelector('.search-input').addEventListener('input', e => {
        filters.keyword = e.target.value.trim().toLowerCase();
        applyCustomerFilters();
    });

    // pagination buttons
    document.getElementById('prevPage').onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            renderPagination();
        }
    };

    document.getElementById('nextPage').onclick = () => {
        const totalPages = Math.ceil(getRows().length / rowsPerPage) || 1;
        if (currentPage < totalPages) {
            currentPage++;
            renderPagination();
        }
    };

    // ================= INIT =================
    rows.forEach(r => r.dataset.filtered = '1');
    renderPagination();
});

// JS CUSTOMER
document.addEventListener('DOMContentLoaded', () => {

    // ====== CẤU HÌNH CHUNG ======
    const BASE_URL = window.location.origin + "/VNT-Restaurant/public/pos";

    // ====== ELEMENTS ======
    const overlay = document.getElementById('customerFormOverlay'); // ID overlay từ HTML của bạn
    const btnOpen = document.querySelector('.btn-create');
    const btnCloseHeader = document.getElementById('btnCloseHeader');
    const cancelBtns = document.querySelectorAll('.cus-cancel');
    const firstFocusable = document.querySelector('#customerInfoForm [name="name"]');

    let editingCustomerId = null;

    function formatDateForInput(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0'); // tháng từ 0-11
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
    }

    // ====== MỞ / ĐÓNG FORM ======
    function openCustomerForm() {
        overlay.style.display = "flex";
        setTimeout(() => { if (firstFocusable) firstFocusable.focus(); }, 120);
        document.addEventListener('keydown', escHandler);
    }
    function closeCustomerForm() {
        overlay.style.display = "none";
        document.removeEventListener('keydown', escHandler);
        resetForm();
    }
    function escHandler(e) { if (e.key === 'Escape') closeCustomerForm(); }

    if (btnOpen) btnOpen.addEventListener('click', e => { e.preventDefault(); openCustomerForm(); });
    if (btnCloseHeader) btnCloseHeader.addEventListener('click', e => { e.preventDefault(); closeCustomerForm(); });
    cancelBtns.forEach(b => b.addEventListener('click', e => { e.preventDefault(); closeCustomerForm(); }));

    // ====== SAVE CUSTOMER ======
    document.getElementById('cus-save').addEventListener('click', async () => {
        const form = document.getElementById('customerInfoForm');
        const formData = new FormData(form);

        const url = editingCustomerId
            ? `${BASE_URL}/customer/${editingCustomerId}/update`
            : `${BASE_URL}/customer/store`;

        try {
            const res = await fetch(url, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                },
                body: formData
            });

            const data = await res.json();

            if (data.success) {
                showToast('Lưu thành công!', 'success');
                setTimeout(() => {
                    location.reload();
                }, 800);
            } else {
            showToast(data.message || 'Lưu thất bại!', 'error');
        }
        } catch (err) {
            console.error('SAVE CUSTOMER ERROR:', err);
            showToast('Lỗi server!', 'error');
        }
    });

    // ====== EDIT CUSTOMER ======
    document.querySelectorAll('.btn-update').forEach(btn => {
        btn.addEventListener('click', async e => {
            e.preventDefault(); e.stopPropagation();
            const detailRow = btn.closest('.detail-row');
            const id = detailRow.id.replace('detail-', '');
            editingCustomerId = id;

            try {
                const res = await fetch(`${BASE_URL}/customer/${id}`);
                const data = await res.json();
                if (data.success) {
                    const cus = data.customer;
                    document.querySelector('#customerInfoForm [name="name"]').value = cus.name;
                    document.querySelector('#customerInfoForm [name="phone"]').value = cus.phone;
                    document.querySelector('#customerInfoForm [name="email"]').value = cus.email;
                    document.querySelector('#customerInfoForm [name="gender"]').value = cus.gender;
                    document.getElementById('dob').value = formatDateForInput(cus.dob);
                    openCustomerForm();
                    showToast('Đã tải thông tin khách hàng!', 'info');
                }
            } catch(err) { console.error(err);
                showToast('Lỗi tải khách hàng!', 'error');
            }
        });
    });

    // ====== DROPDOWN DETAIL CUSTOMER ======
    document.querySelectorAll(".customer-info").forEach(row => {
        row.addEventListener("click", () => {
            const id = row.dataset.id;
            const detailRow = document.getElementById("detail-" + id);
            document.querySelectorAll(".detail-row").forEach(r => { if(r!==detailRow) r.style.display="none"; });
            document.querySelectorAll(".customer-info").forEach(r => { if(r!==row) r.classList.remove("active"); });
            if(!detailRow.style.display || detailRow.style.display==="none") {
                detailRow.style.display="table-row"; row.classList.add("active");
            } else {
                detailRow.style.display="none"; row.classList.remove("active");
            }
        });
    });

});
