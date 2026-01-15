document.addEventListener('DOMContentLoaded', function() {
    const addBtn = document.querySelector('.add-type-btn');
    const modal = document.getElementById('addTypeModal');
    const closeBtn = document.getElementById('closeTypeModal');
    const editBtn = document.getElementById('editTypeBtn');
    const deleteBtn = document.getElementById('delete-popup');
    const cancelBtn = document.getElementById('cancel-popup');
    const createBtn = document.querySelector('.btn-create'); 
    const modalpr = document.getElementById('addPromotionModal'); 
    const closeprBtn = document.getElementById('closePromotionModal');
    const deletePromotionBtn = document.getElementById('deletePromotionBtn');
    const formPromotion = modalpr.querySelector('form');
    const typeForm = document.getElementById('addTypeForm');
    const searchInputs = document.querySelectorAll('.search-input');
    const statusRadios = document.querySelectorAll('input[name="status"]');
    const pagination = document.getElementById('pagination');
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    const pageInfo = document.getElementById('pageInfo');
    const rows = Array.from(document.querySelectorAll('.promotion-info'));

    const filters = {
        code: '',
        name: '', 
        status: 'all',
        type: '' 
    };

    let currentPage = 1;
    const pageSize = 10;

    searchInputs[0].addEventListener('input', e => {
        filters.code = e.target.value.toLowerCase();
        applyPromotionFilters();
    });

    searchInputs[1].addEventListener('input', e => {
        filters.name = e.target.value.toLowerCase();
        applyPromotionFilters();
    });

    statusRadios.forEach(radio => { 
        radio.addEventListener('change', e => { 
            filters.status = e.target.value; // all | active | expired 
            applyPromotionFilters(); 
        }); 
    });

    function applyPromotionFilters() {
        let filtered = rows.filter(row => {
            const code = row.querySelector('td:nth-child(1)').innerText.toLowerCase();
            const name = row.querySelector('td:nth-child(4)').innerText.toLowerCase();
            const startDate = new Date(row.querySelector('td:nth-child(7)').innerText);
            const endDateText = row.querySelector('td:nth-child(8)').innerText.trim();
            const endDate = endDateText ? new Date(endDateText) : null;
            const now = new Date();

            let statusOk = true;
            if (filters.status === 'active') {
                statusOk = (endDate === null) || (endDate >= now);
            } else if (filters.status === 'expired') {
                statusOk = (endDate !== null) && (endDate < now);
            }

            let typeOk = true;
            if (filters.type) {
                typeOk = row.dataset.type == filters.type;
            }

            return code.includes(filters.code) &&
                name.includes(filters.name) &&
                statusOk &&
                typeOk;
        });

        const totalPages = Math.ceil(filtered.length / pageSize);
        if (currentPage > totalPages) currentPage = totalPages || 1;

        const start = (currentPage - 1) * pageSize;
        const end = start + pageSize;
        const pageItems = filtered.slice(start, end);

        rows.forEach(r => r.style.display = 'none');
        pageItems.forEach(r => r.style.display = '');

        pageInfo.innerText = `Trang ${currentPage}/${totalPages || 1}`;
        prevBtn.disabled = currentPage === 1;
        nextBtn.disabled = currentPage === totalPages || totalPages === 0;

        const paginationWrapper = document.getElementById('pagination');
        if (totalPages <= 1) {
            paginationWrapper.style.display = 'none';
        } else {
            paginationWrapper.style.display = 'flex';
        }
    }

    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            applyPromotionFilters();
        }
    });

    nextBtn.addEventListener('click', () => {
        currentPage++;
        applyPromotionFilters(); 
    });

    applyPromotionFilters();

    setupTypeDropdown('typeDropdown', 'filter-type', 'currentTypeText', 'type');

    function setupTypeDropdown(dropdownId, hiddenInputId, textSpanId, filterKey) {
        const dropdown = document.getElementById(dropdownId);
        const wrapper = document.getElementById('typeWrapper');
        const editIcon = document.getElementById('editTypeBtn');
        const hiddenInput = document.getElementById(hiddenInputId);
        const textSpan = document.getElementById(textSpanId);

        if (!dropdown) return;

        const display = dropdown.querySelector('.selected-display');
        const items = dropdown.querySelectorAll('.dropdown-list li');

        display.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpening = !dropdown.classList.contains('active');
            // Đóng các dropdown khác
            document.querySelectorAll('.custom-dropdown').forEach(d => d.classList.remove('active'));
            if (isOpening) dropdown.classList.add('active');
        });

        items.forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const val = item.getAttribute('data-value');
                const txt = item.innerText;

                // Cập nhật giá trị
                textSpan.innerText = txt;
                hiddenInput.value = val;
                filters[filterKey] = val;

                // Xử lý co giãn khung (Type UI Logic)
                if (val) {
                    wrapper.classList.add('type-has-value');
                    editIcon.classList.remove('d-none');
                } else {
                    wrapper.classList.remove('type-has-value');
                    editIcon.classList.add('d-none');
                }

                dropdown.classList.remove('active');
                
                // Gọi hàm lọc type
                if (typeof applyPromotionFilters === 'function') applyPromotionFilters();
            });
        });
    }

    document.addEventListener('click', () => {
        document.querySelectorAll('.custom-dropdown').forEach(d => d.classList.remove('active'));
    });

    document.querySelectorAll('.collapsible .box-title').forEach(title => {
        const box = title.closest('.collapsible');
        const arrow = title.querySelector('.arrow');
        arrow.addEventListener('click', (e) => {
            e.stopPropagation();
            box.classList.toggle('collapsed');
        });
    });
    
    // ===== TYPE PROMOTION =====
    addBtn.addEventListener('click', function() { 
        resetTypeForm(); 
        deleteBtn.style.display = 'none'; 
        modal.style.display = 'flex';
        typeForm.action = '/VNT-Restaurant/public/pos/promotion-type';
        typeForm.method = 'POST';
    });

    editBtn.addEventListener('click', function() {
        const selectedId = document.getElementById('filter-type').value;
        if (!selectedId) return showToast('Vui lòng chọn loại khuyến mãi để sửa', 'warning');

        const selectedItem = document.querySelector(`#typeDropdown li[data-value="${selectedId}"]`);
        typeForm.querySelector('#code').value = selectedItem.dataset.code; 
        typeForm.querySelector('#name').value = selectedItem.dataset.name; 
        typeForm.querySelector('#description').value = selectedItem.dataset.description || '';

        deleteBtn.style.display = 'inline-block';
        modal.style.display = 'flex';

        typeForm.action = `/VNT-Restaurant/public/pos/promotion-type/${selectedId}`;
        typeForm.method = 'POST';

        let methodInput = typeForm.querySelector('input[name="_method"]'); 
        if (!methodInput) {
            methodInput = document.createElement('input');
            methodInput.type = 'hidden';
            methodInput.name = '_method';
            methodInput.value = 'PUT';
            typeForm.appendChild(methodInput);
        } else {
            methodInput.value = 'PUT';
        }
    });

    deleteBtn.addEventListener('click', async function() {
        const selectedId = document.getElementById('filter-type').value;
        if (!selectedId) return showToast('Vui lòng chọn loại khuyến mãi để xóa', 'warning');
        if (!await openConfirmDialog('Bạn có chắc chắn muốn xóa loại khuyến mãi này?')) return;

        const formData = new FormData(typeForm);
        formData.append('_method', 'DELETE');

        fetch(`/VNT-Restaurant/public/pos/promotion-type/${selectedId}`, {
            method: 'POST',
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            showToast("Đã xóa loại khuyến mãi!", 'success');
            modal.style.display = 'none';
            setTimeout(() => {
                location.reload();
            }, 800);
        })
        .catch(err => { console.error(err); showToast("Lỗi server!", 'error'); });
    });

    typeForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(typeForm);

        fetch(typeForm.action, {
            method: typeForm.method,
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            showToast("Loại khuyến mãi đã được lưu!", 'success');
            modal.style.display = 'none';
            setTimeout(() => {
                location.reload();
            }, 800);
        })
        .catch(err => { console.error(err); showToast("Lỗi server!", 'error'); });
    });


    function resetTypeForm() {
        typeForm.reset();
        const methodInput = typeForm.querySelector('input[name="_method"]');
        if (methodInput) methodInput.remove();
    }

    // ===== PROMOTION =====
    createBtn.addEventListener('click', function() { 
        resetPromotionForm();
        modalpr.style.display = 'flex'; 
    });

    document.querySelectorAll('.promotion-info').forEach(row => {
        row.addEventListener('click', function() {
            const id = this.dataset.id;
            formPromotion.querySelector('#name').value = this.dataset.name;
            formPromotion.querySelector('#type_id').value = this.dataset.type;
            formPromotion.querySelector('#location_id').value = this.dataset.type;
            formPromotion.querySelector('#description').value = this.dataset.description;
            formPromotion.querySelector('#discount').value = this.dataset.discount;
            formPromotion.querySelector('#start_date').value = this.querySelector('td:nth-child(7)').innerText;
            formPromotion.querySelector('#end_date').value = this.querySelector('td:nth-child(8)').innerText;

            formPromotion.action = `/VNT-Restaurant/public/pos/promotion/${id}`;
            formPromotion.method = 'POST';

            let methodInput = formPromotion.querySelector('input[name="_method"]');
            if (!methodInput) {
                methodInput = document.createElement('input');
                methodInput.type = 'hidden';
                methodInput.name = '_method';
                methodInput.value = 'PUT';
                formPromotion.appendChild(methodInput);
            } else {
                methodInput.value = 'PUT';
            }

            deletePromotionBtn.style.display = 'inline-block';
            modalpr.style.display = 'flex';
        });
    });

    deletePromotionBtn.addEventListener('click', async function() {
        const id = formPromotion.action.split('/').pop();
        if (!await openConfirmDialog('Bạn có chắc chắn muốn xóa chương trình này?')) return;

        const formData = new FormData(formPromotion);
        formData.append('_method', 'DELETE');

        fetch(`/VNT-Restaurant/public/pos/promotion/${id}`, {
            method: 'POST',
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            showToast("Đã xóa chương trình!", 'success');
            modalpr.style.display = 'none';
            setTimeout(() => {
                location.reload();
            }, 800);
        })
        .catch(err => { console.error(err); showToast("Lỗi server!", 'error'); });
    });

    formPromotion.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData(formPromotion);

        fetch(formPromotion.action, {
            method: formPromotion.method,
            body: formData
        })
        .then(res => res.json())
        .then(data => {
            showToast("Tạo chương trình thành công!", 'success');
            modalpr.style.display = 'none';
            setTimeout(() => {
                location.reload();
            }, 800);
        })
        .catch(err => { console.error(err); showToast("Lỗi server!", 'error'); });
    });

    function resetPromotionForm() {
        formPromotion.reset();
        const methodInput = formPromotion.querySelector('input[name="_method"]');
        if (methodInput) methodInput.remove();
        formPromotion.action = '/VNT-Restaurant/public/pos/promotion';
        formPromotion.method = 'POST';
        deletePromotionBtn.style.display = 'none';
    }

    // ===== Đóng modal =====
    closeBtn.addEventListener('click', () => modal.style.display = 'none');
    cancelBtn.addEventListener('click', () => modal.style.display = 'none');
    closeprBtn.addEventListener('click', () => modalpr.style.display = 'none');
    window.addEventListener('click', e => {
        if (e.target === modal) modal.style.display = 'none';
        if (e.target === modalpr) modalpr.style.display = 'none';
    });
});
