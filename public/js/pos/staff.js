document.addEventListener("DOMContentLoaded", function () {
    // ELEMENTS
    const searchInput = document.querySelector(".input-text");
    const statusRadios = document.querySelectorAll("input[name='status']");
    const rows = Array.from(document.querySelectorAll('.staff-info'));

    const overlay = document.getElementById("popup-overlay");
    const popup = document.getElementById("popup-add-role");
    const nameInput = document.getElementById("role-name");
    const saveBtn = document.getElementById("save-popup");
    const cancelBtn = document.getElementById("cancel-popup");
    const deleteBtn = document.getElementById("delete-popup");
    const addBtn = document.querySelector(".add-role-btn");
    const showAllBtn = document.getElementById("showAll");

    let currentPage = 1;
    const rowsPerPage = 6;
        
    const filters = {
        keyword: '',
        status: 'all',
        role: ''
    };

    setupRoleDropdown('roleDropdown', 'filter-role', 'currentRoleText', 'role');

    function setupRoleDropdown(dropdownId, hiddenInputId, textSpanId, filterKey) {
        const dropdown = document.getElementById(dropdownId);
        const wrapper = document.getElementById('roleWrapper');
        const editIcon = document.getElementById('editRoleBtn');
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

                // Xử lý co giãn khung (Role UI Logic)
                if (val) {
                    wrapper.classList.add('role-has-value');
                    editIcon.classList.remove('d-none');
                } else {
                    wrapper.classList.remove('role-has-value');
                    editIcon.classList.add('d-none');
                }

                dropdown.classList.remove('active');
                
                // Gọi hàm lọc nhân viên
                if (typeof applyStaffFilters === 'function') applyStaffFilters();
            });
        });
    }

    document.addEventListener('click', () => {
        document.querySelectorAll('.custom-dropdown').forEach(d => d.classList.remove('active'));
    });

    function applyStaffFilters() {

        rows.forEach(row => {

            let match = true;

            // 🔍 search mã + tên
            if (filters.keyword) {
                const text = row.dataset.code + ' ' + row.dataset.name;
                match = text.includes(filters.keyword);
            }

            // ⚙️ trạng thái
            if (match && filters.status !== 'all') {
                match = row.dataset.status === filters.status;
            }

            // 🧑‍💼 chức vụ
            if (match && filters.role) {
                match = row.dataset.role === filters.role;
            }

            row.dataset.filtered = match ? '1' : '0';
            row.style.display = match ? '' : 'none';

            // ẩn detail
            const detail = document.getElementById(`detail-${row.dataset.id}`);
            if (detail) detail.style.display = 'none';
        });

        currentPage = 1;
        renderPagination();
    }

    // ================= GET ROWS =================
    function getRows() {
        return rows.filter(r => r.dataset.filtered !== '0');
    }

    // ================= PAGINATION =================
    function renderPagination() {
        const list = getRows();
        const totalPages = Math.ceil(list.length / rowsPerPage) || 1;

        list.forEach(r => r.style.display = 'none');

        const start = (currentPage - 1) * rowsPerPage;
        const end   = start + rowsPerPage;

        list.slice(start, end).forEach(r => r.style.display = '');

        document.getElementById('pageInfo').innerText =
            `Trang ${currentPage} / ${totalPages}`;

        document.getElementById('prevPage').disabled = currentPage === 1;
        document.getElementById('nextPage').disabled = currentPage === totalPages;

        const pageInfo = document.getElementById('pageInfo');
            if (pageInfo) pageInfo.innerText = `Trang ${currentPage} / ${totalPages}`;
            const paginationContainer = document.getElementById('pagination');
            if (totalPages <= 1) {
            paginationContainer.classList.add('d-none');
            } else {
            paginationContainer.classList.remove('d-none');
            }
    }

    // ================= EVENTS =================

    // search
    document.querySelector('.input-text').addEventListener('input', e => {
        filters.keyword = e.target.value.trim().toLowerCase();
        applyStaffFilters();
    });

    // status
    document.querySelectorAll('input[name="status"]').forEach(radio => {
        radio.addEventListener('change', e => {
            filters.status = e.target.value;
            applyStaffFilters();
        });
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

    // ===========================
    // OPEN/CLOSE POPUP
    // ===========================
    addBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        openPopup("add");
    });

    function openPopup(mode, id = null, name = "") {
        if (mode === "add") {
            popup.querySelector("h2").innerText = "Thêm Chức Vụ";
            deleteBtn.style.display = "none";
            editId = null;
        } else {
            popup.querySelector("h2").innerText = "Sửa Chức Vụ";
            deleteBtn.style.display = "inline-block";
            editId = id;
        }
        nameInput.value = name || "";
        overlay.style.display = "block";
        popup.style.display = "block";
    }

    function closePopup() {
        overlay.style.display = "none";
        popup.style.display = "none";
        nameInput.value = "";
        editId = null;
    }

    cancelBtn.addEventListener("click", closePopup);
    overlay.addEventListener("click", closePopup);

    // ===========================
    // EDIT ROLE
    // ===========================
    document.addEventListener("click", function (e) {
        if (e.target.closest("#editRoleBtn")) {
            // Lấy ID từ input hidden
            const id = document.getElementById("filter-role").value;
            // Lấy tên hiển thị từ span
            const name = document.getElementById("currentRoleText").textContent.trim();

            // Kiểm tra nếu không có ID (đang chọn "-- Tất cả --") thì không mở popup
            if (!id || id === "") return;

            // Mở popup ở chế độ sửa
            if (typeof openPopup === 'function') {
                openPopup("edit", id, name);
            }
        }
    });

    // ===========================
    // SAVE AREA (ADD/UPDATE)
    // ===========================
    saveBtn.addEventListener("click", function () {
        const name = nameInput.value.trim();
        if (!name) return showToast("Vui lòng nhập tên chức vụ!", "error");

        // UPDATE
        if (editId) {
            fetch(`/VNT-Restaurant/public/pos/role/update/${editId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]').content
                },
                body: JSON.stringify({ name })
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {

                    const option = roleSelect.querySelector(`option[value="${editId}"]`);
                    if (option) option.textContent = name;
                    showToast("Cập nhật chức vụ thành công", "success");
                    closePopup();
                } else showToast(data.message || "Cập nhật thất bại", "error");
            })
            .catch(err => { console.error(err); showToast("Lỗi server!", "error"); });
            return;
        }

        // ADD NEW
        const formData = new FormData();
        formData.append("name", name);

        fetch(window.routes.role.store, {
        method: "POST",
        headers: { "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]').content },
        body: formData
        })
        .then(res => res.json())
        .then(data => {
        if (data.success) {
            // Thêm vào custom dropdown
            const dropdownList = document.querySelector('#roleDropdown .dropdown-list');
            const newItem = document.createElement('li');
            newItem.setAttribute('data-value', data.role.id);
            newItem.textContent = data.role.name;
            dropdownList.appendChild(newItem);

            // Cập nhật event listener cho item mới
            newItem.addEventListener('click', (e) => {
                e.stopPropagation();
                document.getElementById('currentRoleText').innerText = newItem.textContent;
                document.getElementById('filter-role').value = data.role.id;
                filters.role = data.role.id;
                applyStaffFilters();
                document.getElementById('roleDropdown').classList.remove('active');
            });

            // Reset hiển thị về "-- Tất cả --"
            document.getElementById('currentRoleText').innerText = "-- Tất cả --";
            document.getElementById('filter-role').value = "";
            filters.role = "";
            applyStaffFilters();

            showToast("Thêm chức vụ thành công", "success");
            closePopup();
        } else {
            showToast(data.message || "Thêm thất bại", "error");
        }
        })
        .catch(err => {
            console.error(err);
            showToast("Lỗi server!", "error");
        });
    });

    // ===========================
    // DELETE AREA
    // ===========================
    deleteBtn.addEventListener("click", function () {
        if (!editId) {
        showToast("Không có role để xóa", "error");
        return;
        }
        if (!confirm("Bạn có chắc muốn xóa?")) return;

        const deleteUrl = window.routes.role.delete.replace(':id', editId);

        fetch(deleteUrl, {
        method: "DELETE",
        headers: { "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]').content }
        })
        .then(res => res.json())
        .then(data => {
        if (data.success) {
            // Xóa role trong custom dropdown
            const li = document.querySelector(`#roleDropdown .dropdown-list li[data-value="${editId}"]`);
            if (li) li.remove();

            // Reset dropdown về mặc định
            document.getElementById('filter-role').value = '';
            document.getElementById('currentRoleText').textContent = '-- Tất cả --';

            // Hiện tất cả nhân viên
            const tableRows = Array.from(document.querySelectorAll('.staff-info'));
            tableRows.forEach(row => row.style.display = '');

            showToast("Xóa chức vụ thành công", "success");
            closePopup();
        } else {
            showToast(data.message || "Xóa thất bại", "error");
        }
        })
        .catch(err => {
            console.error(err);
            showToast("Lỗi server!", "error");
        });
    });


    // ===========================
    // STATUS BOX COLLAPSE
    // ===========================
    document.querySelectorAll('.status-box .box-title').forEach(title => {
        const box = title.closest('.status-box');
        const arrow = title.querySelector('.status-arrow');
        arrow.addEventListener('click', (e) => {
            e.stopPropagation();
            box.classList.toggle('collapsed');
        });
    });
});

// JS STAFF
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById("btnChooseImage").addEventListener("click", () => {
    document.getElementById("imageInput").click();
    });

    // ====== CẤU HÌNH CHUNG ======
    const BASE_URL = window.location.origin + "/VNT-Restaurant/public/pos";

    // ====== ELEMENTS ======
    const overlay = document.getElementById('staffForm'); // ID overlay từ HTML của bạn
    const btnOpen = document.querySelector('.btn-create');
    const btnCloseHeader = document.getElementById('btnCloseHeader');
    const cancelBtns = document.querySelectorAll('.staff-cancel');
    const firstFocusable = document.querySelector('#staffInfoForm [name="name"]');
    const tabs = document.querySelectorAll('.staff-tab');
    const tabContents = document.querySelectorAll('.tab-content');
    const imageBox = document.getElementById("imageBox");
    const imageInput = document.getElementById("imageInput");
    const previewImage = document.getElementById("previewImage");
    const removeImageBtn = document.getElementById("removeImageBtn");
    const addText = document.querySelector(".add-text");
    const deleteImageInput = document.getElementById('delete_image');

    let editingStaffId = null;
    function formatDateForInput(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0'); // tháng từ 0-11
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
    }

    // ====== MỞ / ĐÓNG FORM ======
    function openStaffForm() {
        overlay.style.display = "flex";
        setTimeout(() => { if (firstFocusable) firstFocusable.focus(); }, 120);
        document.addEventListener('keydown', escHandler);
    }
    function closeStaffForm() {
        overlay.style.display = "none";
        document.removeEventListener('keydown', escHandler);
        resetForm();
    }
    function escHandler(e) { if (e.key === 'Escape') closeStaffForm(); }

    if (btnOpen) btnOpen.addEventListener('click', e => { e.preventDefault(); openStaffForm(); });
    if (btnCloseHeader) btnCloseHeader.addEventListener('click', e => { e.preventDefault(); closeStaffForm(); });
    cancelBtns.forEach(b => b.addEventListener('click', e => { e.preventDefault(); closeStaffForm(); }));

    // Reset ảnh về trạng thái mặc định
    function resetImageBox() {
        previewImage.src = "";
        previewImage.style.display = "none";
        removeImageBtn.style.display = "none";
        addText.style.display = "block";
        imageInput.value = "";
        deleteImageInput.value = 0;
    }

    // ====== TAB ======
    function activateTab(tabName) {
        tabs.forEach(t => t.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        document.querySelector(`.staff-tab#tab-${tabName}-btn`)?.classList.add('active');
        document.getElementById(`tab-${tabName}`)?.classList.add('active');
    }
    // ====== TAB SWITCH ======
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab; // info hoặc salary

            // remove active
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // add active
            tab.classList.add('active');
            document.getElementById('tab-' + target).classList.add('active');
        });
    });

    // ====== RESET FORM ======
    function resetForm() {
        document.getElementById('staffInfoForm').reset();
        editingStaffId = null;
        activateTab("info");
        resetImageBox();
    }

    function resetImageBox() {
        if (previewImage) previewImage.src = "";
        if (removeImageBtn) removeImageBtn.style.display = "none";
        if (addText) addText.style.display = "block";
        if (imageInput) imageInput.value = "";
        const deleteImage = document.getElementById('delete_image');
        if (deleteImage) deleteImage.value = 0;
    }
    // Load ảnh khi edit
    function loadStaffImage(imgFileName) {
        resetImageBox();
        if (imgFileName) {
            previewImage.src = `/VNT-Restaurant/public/images/staff/${imgFileName}`;
            previewImage.style.display = "block";
            removeImageBtn.style.display = "block";
            addText.style.display = "none";
            deleteImageInput.value = 0; // chưa xóa
        }
    }

    // ====== IMAGE UPLOAD ======
    imageBox.addEventListener("click", (e) => {
    if (e.target === removeImageBtn) return; // không mở file khi click X
    imageInput.click();
    });
    imageInput.addEventListener("change", function () {
    if (this.files && this.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
            previewImage.src = e.target.result;
            previewImage.style.display = "block";
            removeImageBtn.style.display = "block";
            addText.style.display = "none";
        };
        reader.readAsDataURL(this.files[0]);
        deleteImageInput.value = 0; // chọn ảnh mới → chưa xóa
    }
    });
    removeImageBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    e.preventDefault();
    resetImageBox();
    deleteImageInput.value = 1; // thông báo backend xóa ảnh
    });

    // ====== SAVE STAFF ======
    document.querySelectorAll('#save-popup').forEach(btn => {
        btn.addEventListener('click', async () => {
            const form = document.getElementById('staffInfoForm');
            const formData = new FormData(form);
            if (imageInput.files[0]) formData.append('img', imageInput.files[0]);
            const url = editingStaffId ? `${BASE_URL}/staff/${editingStaffId}/update` : `${BASE_URL}/staff/store`;

            formData.append('_token', document.querySelector('meta[name="csrf-token"]').content);

            try {
                const res = await fetch(url, { method: 'POST', body: formData });
                const data = await res.json();
                if (data.success) {
                    showToast('Lưu thành công', 'success');
                    setTimeout(() => {
                        location.reload();
                    }, 800);
                } else showToast(data.message || 'Lưu thất bại', 'error');
            } catch (err) { console.error(err); showToast('Lỗi server!', 'error'); }
        });
    });

    // ====== EDIT STAFF ======
    document.querySelectorAll('.btn-update').forEach(btn => {
        btn.addEventListener('click', async e => {
            e.preventDefault(); e.stopPropagation();
            const detailRow = btn.closest('.detail-row');
            if (!detailRow) {
                console.error('Không tìm thấy detailRow cho nút này:', btn);
                return;
            }
            const id = detailRow.id.replace('detail-', '');
            editingStaffId = id;

            try {
                const res = await fetch(`${BASE_URL}/staff/${id}`);
                const data = await res.json();
                if (data.success) {
                    const s = data.staff;
                    resetImageBox();
                    // Nếu nhân viên có ảnh
                    if (s.img) {
                        previewImage.src = `${window.location.origin}/VNT-Restaurant/public/images/staff/${s.img}`;
                        previewImage.style.display = "block";
                        removeImageBtn.style.display = "block";
                        addText.style.display = "none";
                        document.getElementById('delete_image').value = 0; // chưa xoá
                    } else {
                        resetImageBox();
                    }
                    document.querySelector('#staffInfoForm [name="name"]').value = s.name;
                    document.querySelector('#staffInfoForm [name="role_id"]').value = s.role_id;
                    document.querySelector('#staffInfoForm [name="cccd"]').value = s.cccd;
                    document.querySelector('#staffInfoForm [name="phone"]').value = s.phone;
                    document.querySelector('#staffInfoForm [name="email"]').value = s.email;
                    document.querySelector('#staffInfoForm [name="gender"]').value = s.gender;
                    document.getElementById('dob').value = formatDateForInput(s.dob);
                    document.getElementById('start_date').value = formatDateForInput(s.start_date);
                    document.querySelector('#staffInfoForm [name="password"]').value = '';
                    openStaffForm();
                }
            } catch(err) { console.error(err); }
        });
    });
    document.querySelectorAll('.detail-row').forEach(detail => {
        const id = detail.id.replace("detail-", ""); 
        const staffRow = document.querySelector(`.staff-info[data-id="${id}"]`);
        const updateBtn = detail.querySelector('.btn-update');
        const deleteBtn = detail.querySelector('.btn-delete');
        const statusBtn = detail.querySelector('.btn-status');

        if (staffRow.dataset.status === "active") {
            deleteBtn.style.display = "none";
            updateBtn.style.display = "inline-block";
            statusBtn.innerHTML = '<i class="fa fa-user-slash"></i> Ngừng làm việc';
            statusBtn.style.background = "#ff0000";
        } else {
            deleteBtn.style.display = "inline-block";
            updateBtn.style.display = "none";
            statusBtn.innerHTML = '<i class="fa-solid fa-arrow-rotate-left"></i> Quay lại làm việc';
            statusBtn.style.background = "#00B63E";
        }
    });


    // ====== CHANGE STATUS ======
    document.querySelectorAll('.btn-status').forEach(btn => {
    btn.addEventListener('click', e => {
        e.preventDefault();
        e.stopPropagation();

        const detailRow = btn.closest('.detail-row');
        const id = detailRow.id.replace('detail-', '');
        const staffRow = document.querySelector(`.staff-info[data-id='${id}']`);
        const currentStatus = staffRow.dataset.status;
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';

        // Hiển thị popup xác nhận
        const overlay = document.getElementById('statusConfirmOverlay');
        const text = document.getElementById('statusConfirmText');
        const btnYes = document.getElementById('statusConfirmYes');
        const btnNo = document.getElementById('statusConfirmNo');

        text.textContent = newStatus === 'inactive'
            ? `Bạn có chắc muốn cho nhân viên này ngừng làm việc?`
            : `Bạn có chắc muốn cho nhân viên này quay lại làm việc?`;

        overlay.style.display = 'flex';

        btnNo.onclick = () => {
            overlay.style.display = 'none';
        };

        btnYes.onclick = async () => {
            overlay.style.display = 'none';
            try {
                const res = await fetch(`${BASE_URL}/staff/${id}/status`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content
                    },
                    body: JSON.stringify({ status: newStatus })
                });
                const data = await res.json();
                if (data.success) 
                    showToast('Cập nhật trạng thái thành công', 'success');
                    else showToast('Đổi trạng thái thất bại!', 'error');
                    setTimeout(() => {
                        location.reload();
                    }, 800);
            } catch(err){
                console.error(err);
                showToast('Có lỗi xảy ra, vui lòng thử lại!', 'error');
            }
        };
    });

});

    // ====== DELETE STAFF ======
    document.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', async e => {
            e.preventDefault(); e.stopPropagation();
            const detailRow = btn.closest('.detail-row');
            if (!detailRow) {
                console.error('Không tìm thấy detailRow cho nút này:', btn);
                return;
            }
            const id = detailRow.id.replace('detail-', '');
            if (!confirm('Bạn có chắc muốn xóa nhân viên này?')) return;
            try {
                const res = await fetch(`${BASE_URL}/staff/${id}`, {
                    method: 'DELETE',
                    headers: { 
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                        'Accept': 'application/json'
                    }
                });
                const data = await res.json();
                if (data.success) {
                    detailRow.previousElementSibling.remove();
                    detailRow.remove();
                    showToast('Xóa nhân viên thành công', 'success');
                } else showToast('Xóa thất bại', 'error');
            } catch(err){ console.error(err); }
        });
    });

    // ====== DROPDOWN DETAIL STAFF ======
    document.querySelectorAll(".staff-info").forEach(row => {
        row.addEventListener("click", () => {
            const id = row.dataset.id;
            const detailRow = document.getElementById("detail-" + id);
            document.querySelectorAll(".detail-row").forEach(r => { if(r!==detailRow) r.style.display="none"; });
            document.querySelectorAll(".staff-info").forEach(r => { if(r!==row) r.classList.remove("active"); });
            if(!detailRow.style.display || detailRow.style.display==="none") {
                detailRow.style.display="table-row"; row.classList.add("active");
            } else {
                detailRow.style.display="none"; row.classList.remove("active");
            }
        });
    });

});