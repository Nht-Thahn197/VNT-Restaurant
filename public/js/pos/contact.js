window.filters = {
    code: '',
    name: '',
    phone: '',
    type: 'all',
    status: 'all',
    from: null,
    to: null
};

document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('contactModal');
    const closeBtn = document.querySelector('.close');
    const rows = document.querySelectorAll('.contact-info');
    const modalFooter = document.querySelector('.modal-footer');
    const btn = document.getElementById('timeBtn');
    const menu = document.getElementById('timeMenu');

    let currentPage = 1;
    const rowsPerPage = 10;

    rows.forEach(row => {
        row.addEventListener('click', function() {
            const code = this.getAttribute('data-code');
            const name = this.getAttribute('data-name');
            const phone = this.getAttribute('data-phone');
            const email = this.getAttribute('data-email');
            const subject = this.getAttribute('data-subject');
            const message = this.getAttribute('data-message');
            const id = this.getAttribute('data-id');
            const status = this.getAttribute('data-status');

            document.getElementById('detail-code').innerText = code.toUpperCase();
            document.getElementById('detail-name').innerText = name;
            document.getElementById('detail-phone').innerText = phone;
            document.getElementById('detail-email').innerText = email;
            document.getElementById('detail-subject').innerText = subject || 'N/A';
            document.getElementById('detail-message').innerText = message || 'Không có nội dung';
            document.querySelector('.btn-done').setAttribute('data-id', id);

            if (status === 'processed') {
                modalFooter.style.display = 'none';
            } else {
                modalFooter.style.display = 'block';
            }

            modal.style.display = 'flex';
        });
    });

    closeBtn.onclick = function() {
        modal.style.display = 'none';
    }

    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }

    document.querySelector('.btn-done').addEventListener('click', function() {
        const id = this.getAttribute('data-id');
        const btn = this;
        
        // Đổi trạng thái nút bấm khi đang xử lý
        btn.innerText = 'Đang xử lý...';
        btn.disabled = true;

        fetch(`/VNT-Restaurant/public/pos/contact/update-status/${id}`, {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': document.querySelector('input[name="_token"]').value,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // 1. Đóng modal
                document.getElementById('contactModal').style.display = 'none';

                // 2. Tìm dòng <tr> tương ứng trong bảng để cập nhật giao diện
                const row = document.querySelector(`tr[data-id="${id}"]`);
                if (row) {
                    // Cập nhật text ở cột Trạng thái (giả sử cột thứ 6)
                    const statusCell = row.querySelector('td:last-child');
                    statusCell.innerHTML = '<span class="status-pill processed">processed</span>';
                    
                    // Hiệu ứng highlight dòng vừa sửa
                    row.style.backgroundColor = '#d4edda';
                    setTimeout(() => { row.style.backgroundColor = ''; }, 2000);
                }
                
                alert(data.message);
            } else {
                alert('Lỗi: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Không thể kết nối máy chủ!');
        })
        .finally(() => {
            btn.innerText = 'Đánh dấu đã xử lý';
            btn.disabled = false;
        });
    });

    btn.addEventListener('click', (e) => {
        e.stopPropagation();
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
            btn.innerHTML = `${item.innerText} <i class="fa fa-chevron-down"></i>`;
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
                from = startOfDay(y);
                to = endOfDay(y);
                break;
            case 'this_week':
                const w1 = new Date();
                const day = w1.getDay() || 7;
                w1.setDate(w1.getDate() - day + 1);
                from = startOfDay(w1);
                to = endOfDay(new Date());
                break;
            case 'this_month':
                from = new Date(now.getFullYear(), now.getMonth(), 1);
                to = endOfDay(new Date());
                break;
            case 'all':
                from = null;
                to = null;
                break;
            // Bạn có thể thêm các case last_week, last_month tương tự như mẫu bạn gửi
        }

        window.filters.from = from ? Math.floor(from.getTime() / 1000) : null;
        window.filters.to   = to   ? Math.floor(to.getTime() / 1000) : null;

        // Reset ô DateRange nếu chọn Preset
        $('#dateRange').val('');
        
        applyFilters();
    }

    function applyFilters() {
        const rows = document.querySelectorAll('.contact-info');
        
        rows.forEach(row => {
            let match = true;

            // 🔍 Lọc theo mã liên hệ (search-input[0])
            if (filters.code && !row.dataset.code.includes(filters.code)) {
                match = false;
            }

            // 🔍 Lọc theo tên khách hàng (search-input[1])
            if (match && filters.name && !row.dataset.name.includes(filters.name)) {
                match = false;
            }

            // 🔍 Lọc theo số điện thoại (search-input[2])
            if (match && filters.phone && !row.dataset.phone.includes(filters.phone)) {
                match = false;
            }

            // ⚙️ Lọc theo trạng thái (Radio)
            if (match && filters.status !== 'all') {
                // Map value: serving -> pending, completed -> processed
                const mappedStatus = filters.status === 'serving' ? 'pending' : 'processed';
                if (row.dataset.status !== mappedStatus) match = false;
            }

            // 🏷️ Lọc theo loại liên hệ (Type Filter buttons)
            if (match && filters.type !== 'all' && row.dataset.type !== filters.type) {
                match = false;
            }

            // ⏰ Lọc theo thời gian (Timestamp)
            if (match && filters.from && filters.to) {
                const rowTime = Number(row.dataset.time); // Bạn cần thêm data-time vào thẻ <tr>
                if (rowTime < filters.from || rowTime > filters.to) match = false;
            }

            row.setAttribute('data-filtered', match ? '1' : '0');
            // Luôn ẩn đi để renderPagination quyết định hàng nào được hiện theo trang
            row.style.display = 'none';
        });
        currentPage = 1;
        renderPagination();
    }

    const inputs = document.querySelectorAll('.search-input');
    inputs[0].addEventListener('input', e => { filters.code = e.target.value.trim().toLowerCase(); applyFilters(); });
    inputs[1].addEventListener('input', e => { filters.name = e.target.value.trim().toLowerCase(); applyFilters(); });
    inputs[2].addEventListener('input', e => { filters.phone = e.target.value.trim().toLowerCase(); applyFilters(); });

    // Trạng thái Radio
    document.querySelectorAll('input[name="status"]').forEach(radio => {
        radio.addEventListener('change', e => {
            filters.status = e.target.value;
            applyFilters();
        });
    });

    // Loại liên hệ (Tất cả, Phản ánh, Hợp tác)
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            filters.type = this.dataset.type;
            applyFilters();
        });
    });

    $(function () {
        $('#dateRange').daterangepicker({
            autoUpdateInput: false,
            locale: { format: 'DD/MM/YYYY', applyLabel: 'Áp dụng', cancelLabel: 'Hủy' }
        });

        $('#dateRange').on('apply.daterangepicker', function (ev, picker) {
            $(this).val(picker.startDate.format('DD/MM/YYYY') + ' - ' + picker.endDate.format('DD/MM/YYYY'));
            
            window.filters.from = picker.startDate.startOf('day').unix();
            window.filters.to = picker.endDate.endOf('day').unix();
            
            document.getElementById('timeBtn').innerHTML = `Tùy chỉnh <i class="fa fa-chevron-down"></i>`;
            applyFilters();
        });

        $('#dateRange').on('cancel.daterangepicker', function () {
            $(this).val('');
            filters.from = null;
            filters.to = null;
            applyFilters();
        });
    });

    function getContactRows() {
        return Array.from(document.querySelectorAll('.contact-info'))
                    .filter(row => row.getAttribute('data-filtered') === '1');
    }

    function renderPagination() {
        const rows = getContactRows();
        const totalPages = Math.ceil(rows.length / rowsPerPage) || 1;

        // Kiểm tra nếu trang hiện tại vượt quá tổng số trang sau khi lọc
        if (currentPage > totalPages) currentPage = totalPages;
        if (currentPage < 1) currentPage = 1;

        // Ẩn tất cả hàng trước
        document.querySelectorAll('.contact-info').forEach(r => r.style.display = 'none');

        // Hiển thị chỉ những hàng thuộc trang hiện tại
        rows.forEach((row, index) => {
            const start = (currentPage - 1) * rowsPerPage;
            const end = start + rowsPerPage;

            if (index >= start && index < end) {
                row.style.display = '';
            }
        });

        // Cập nhật thông tin số trang
        const pageInfo = document.getElementById('pageInfo');
        if (pageInfo) {
            pageInfo.innerText = `Trang ${currentPage} / ${totalPages}`;
        }

        // Xử lý nút bấm
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');
        if (prevBtn) prevBtn.disabled = (currentPage === 1);
        if (nextBtn) nextBtn.disabled = (currentPage === totalPages);

        // Ẩn/Hiện container phân trang nếu chỉ có 1 trang
        const paginationContainer = document.getElementById('pagination');
        if (paginationContainer) {
            if (totalPages <= 1) {
                paginationContainer.classList.add('d-none');
            } else {
                paginationContainer.classList.remove('d-none');
            }
        }
    }

    document.getElementById('prevPage').onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            renderPagination();
        }
    };

    document.getElementById('nextPage').onclick = () => {
        const rows = getContactRows();
        const totalPages = Math.ceil(rows.length / rowsPerPage) || 1;
        if (currentPage < totalPages) {
            currentPage++;
            renderPagination();
        }
    };

    applyFilters();
});