function getJsonErrorMessage(payload, fallback) {
    if (payload && payload.errors) {
        const firstKey = Object.keys(payload.errors)[0];
        if (firstKey && payload.errors[firstKey] && payload.errors[firstKey][0]) {
            return payload.errors[firstKey][0];
        }
    }
    if (payload && payload.message) {
        return payload.message;
    }
    return fallback || 'Request failed.';
}

async function readJsonResponse(res) {
    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
        await res.text();
        throw new Error(`Unexpected response (${res.status}).`);
    }
    return res.json();
}

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

    function getJsonErrorMessage(payload, fallback) {
        if (payload && payload.errors) {
            const firstKey = Object.keys(payload.errors)[0];
            if (firstKey && payload.errors[firstKey] && payload.errors[firstKey][0]) {
                return payload.errors[firstKey][0];
            }
        }
        if (payload && payload.message) {
            return payload.message;
        }
        return fallback || 'Request failed.';
    }

    async function readJsonResponse(res) {
        const contentType = res.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
            await res.text();
            throw new Error(`Unexpected response (${res.status}).`);
        }
        return res.json();
    }

    setupRoleDropdown('roleDropdown', 'filter-role', 'currentRoleText', 'role');
    setupSimpleDropdown('salaryTypeDropdown', 'salary_type', 'currentSalaryTypeText');

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
            document.querySelectorAll('.custom-dropdown').forEach(d => d.classList.remove('active'));
            if (isOpening) dropdown.classList.add('active');
        });

        items.forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const val = item.getAttribute('data-value');
                const txt = item.innerText;

                textSpan.innerText = txt;
                hiddenInput.value = val;
                filters[filterKey] = val;

                if (val) {
                    wrapper.classList.add('role-has-value');
                    editIcon.classList.remove('d-none');
                } else {
                    wrapper.classList.remove('role-has-value');
                    editIcon.classList.add('d-none');
                }

                dropdown.classList.remove('active');
                
                if (typeof applyStaffFilters === 'function') applyStaffFilters();
            });
        });
    }

    function setupSimpleDropdown(dropdownId, hiddenInputId, textSpanId) {
        const dropdown = document.getElementById(dropdownId);
        const hiddenInput = document.getElementById(hiddenInputId);
        const textSpan = document.getElementById(textSpanId);

        if (!dropdown || !hiddenInput || !textSpan) return;

        const display = dropdown.querySelector('.selected-display');
        const items = dropdown.querySelectorAll('.dropdown-list li');

        display.addEventListener('click', (e) => {
            e.stopPropagation();
            const isOpening = !dropdown.classList.contains('active');
            document.querySelectorAll('.custom-dropdown').forEach(d => d.classList.remove('active'));
            if (isOpening) dropdown.classList.add('active');
        });

        items.forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const val = item.getAttribute('data-value');
                const txt = item.innerText;

                textSpan.innerText = txt;
                hiddenInput.value = val;
                hiddenInput.dispatchEvent(new Event('change', { bubbles: true }));

                dropdown.classList.remove('active');
            });
        });
    }

    document.addEventListener('click', () => {
        document.querySelectorAll('.custom-dropdown').forEach(d => d.classList.remove('active'));
    });

    function applyStaffFilters() {

        rows.forEach(row => {

            let match = true;

            if (filters.keyword) {
                const text = row.dataset.code + ' ' + row.dataset.name;
                match = text.includes(filters.keyword);
            }

            if (match && filters.status !== 'all') {
                match = row.dataset.status === filters.status;
            }

            if (match && filters.role) {
                match = row.dataset.role === filters.role;
            }

            row.dataset.filtered = match ? '1' : '0';
            row.style.display = match ? '' : 'none';

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
            const id = document.getElementById("filter-role").value;
            const name = document.getElementById("currentRoleText").textContent.trim();
            if (!id || id === "") return;
            if (typeof openPopup === 'function') {
                openPopup("edit", id, name);
            }
        }
    });

    // ===========================
    // SAVE AREA (ADD/UPDATE)
    // ===========================
    saveBtn.addEventListener("click", async function () {
        const name = nameInput.value.trim();
        if (!name) return showToast("Vui lòng nhập tên chức vụ!", "error");

        // UPDATE
        if (editId) {
            try {
                const res = await fetch(`/VNT-Restaurant/public/pos/role/update/${editId}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]').content,
                        "Accept": "application/json",
                        "X-Requested-With": "XMLHttpRequest"
                    },
                    body: JSON.stringify({ name })
                });
                const data = await readJsonResponse(res);
                if (!res.ok || !data.success) {
                    showToast(getJsonErrorMessage(data, "Cập nhật thất bại"), "error");
                    return;
                }
                const option = roleSelect.querySelector(`option[value="${editId}"]`);
                if (option) option.textContent = name;
                showToast("Cập nhật chức vụ thành công", "success");
                closePopup();
                setTimeout(() => {
                    location.reload();
                }, 800);
            } catch (err) {
                console.error(err);
                showToast("Lỗi server!", "error");
            }
            return;
        }
        // ADD NEW
        const formData = new FormData();
        formData.append("name", name);

        try {
            const res = await fetch(window.routes.role.store, {
                method: "POST",
                headers: {
                    "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]').content,
                    "Accept": "application/json",
                    "X-Requested-With": "XMLHttpRequest"
                },
                body: formData
            });
            const data = await readJsonResponse(res);
            if (!res.ok || !data.success) {
                showToast(getJsonErrorMessage(data, "Thêm thất bại"), "error");
                return;
            }
            const dropdownList = document.querySelector('#roleDropdown .dropdown-list');
            const newItem = document.createElement('li');
            newItem.setAttribute('data-value', data.role.id);
            newItem.textContent = data.role.name;
            dropdownList.appendChild(newItem);

            newItem.addEventListener('click', (e) => {
                e.stopPropagation();
                document.getElementById('currentRoleText').innerText = newItem.textContent;
                document.getElementById('filter-role').value = data.role.id;
                filters.role = data.role.id;
                applyStaffFilters();
                document.getElementById('roleDropdown').classList.remove('active');
            });
            document.getElementById('currentRoleText').innerText = "-- Tất cả --";
            document.getElementById('filter-role').value = "";
            filters.role = "";
            applyStaffFilters();

            showToast("Thêm chức vụ thành công", "success");
            closePopup();
            setTimeout(() => {
                location.reload();
            }, 800);
        } catch (err) {
            console.error(err);
            showToast("Lỗi server!", "error");
        }
    });
    // ===========================
    // DELETE ROLE
    // ===========================
    deleteBtn.addEventListener("click", async function () {
        if (!editId) {
            showToast("Không có chức vụ để xóa", "error");
            return;
        }
        if (!await openConfirmDialog("Bạn có chắc chắn muốn xóa?")) return;

        const deleteUrl = window.routes.role.delete.replace(':id', editId);

        try {
            const res = await fetch(deleteUrl, {
                method: "DELETE",
                headers: {
                    "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]').content,
                    "Accept": "application/json",
                    "X-Requested-With": "XMLHttpRequest"
                }
            });
            const data = await readJsonResponse(res);
            if (!res.ok || !data.success) {
                showToast(getJsonErrorMessage(data, "Xóa thất bại"), "error");
                return;
            }
            if (data.success) {
                showToast("Xóa thành công", "success");
                setTimeout(() => {
                    location.reload();
                }, 800);
            }
        } catch (err) {
            console.error(err);
            showToast("Lỗi server!", "error");
        }
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

document.documentElement.classList.add('js');

var staffSelectControls = [];

var closeStaffSelectMenus = function () {
    staffSelectControls.forEach(function (control) {
        control.close();
    });
};

var syncStaffSelects = function () {
    staffSelectControls.forEach(function (control) {
        control.buildMenu();
        control.updateDisplay();
    });
};

var initStaffSelect = function (wrapper) {
    if (!wrapper) {
        return;
    }
    var select = wrapper.querySelector('select');
    var trigger = wrapper.querySelector('.staff-select-trigger');
    var valueText = wrapper.querySelector('.staff-select-value');
    var menu = wrapper.querySelector('.staff-select-menu');

    if (!select || !trigger || !valueText || !menu) {
        return;
    }

    var buildMenu = function () {
        menu.innerHTML = '';
        Array.prototype.slice.call(select.options).forEach(function (option) {
            var button = document.createElement('button');
            button.type = 'button';
            button.className = 'staff-select-item';
            button.textContent = option.text;
            button.dataset.value = option.value;
            if (option.selected) {
                button.classList.add('is-selected');
            }
            button.addEventListener('click', function () {
                select.value = option.value;
                select.dispatchEvent(new Event('change', { bubbles: true }));
                closeStaffSelectMenus();
            });
            menu.appendChild(button);
        });
    };

    var updateDisplay = function () {
        var selectedOption = select.options[select.selectedIndex];
        valueText.textContent = selectedOption ? selectedOption.text : '';
        if (selectedOption && selectedOption.value === '') {
            valueText.classList.add('is-placeholder');
        } else {
            valueText.classList.remove('is-placeholder');
        }
        Array.prototype.slice.call(menu.children).forEach(function (child) {
            if (child.dataset.value === select.value) {
                child.classList.add('is-selected');
            } else {
                child.classList.remove('is-selected');
            }
        });
    };

    var closeMenu = function () {
        menu.classList.remove('open');
        menu.setAttribute('aria-hidden', 'true');
        trigger.setAttribute('aria-expanded', 'false');
    };

    var openMenu = function () {
        buildMenu();
        menu.classList.add('open');
        menu.setAttribute('aria-hidden', 'false');
        trigger.setAttribute('aria-expanded', 'true');
    };

    trigger.addEventListener('click', function (event) {
        event.stopPropagation();
        var isOpen = menu.classList.contains('open');
        closeStaffSelectMenus();
        if (!isOpen) {
            openMenu();
        }
    });

    menu.addEventListener('click', function (event) {
        event.stopPropagation();
    });

    select.addEventListener('change', updateDisplay);

    staffSelectControls.push({
        buildMenu: buildMenu,
        updateDisplay: updateDisplay,
        close: closeMenu
    });

    buildMenu();
    updateDisplay();
};

document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-staff-select]').forEach(function (wrapper) {
        initStaffSelect(wrapper);
    });
    syncStaffSelects();
});

document.addEventListener('click', closeStaffSelectMenus);
document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
        closeStaffSelectMenus();
    }
});

// JS STAFF
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById("btnChooseImage").addEventListener("click", () => {
    document.getElementById("imageInput").click();
    });

    // ====== CẤU HÌNH CHUNG ======
    const BASE_URL = window.location.origin + "/VNT-Restaurant/public/pos";

    // ====== ELEMENTS ======
    const overlay = document.getElementById('staffForm');
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
    const salaryType = document.getElementById('salary_type');
    const salaryRate = document.getElementById('salary_rate');
    const salaryTypeDropdown = document.getElementById('salaryTypeDropdown');
    const salaryTypeText = document.getElementById('currentSalaryTypeText');
    const btnSaveSalary = document.getElementById('btnSaveSalary');
    const roleSelect = document.getElementById('role_id');
    const genderSelect = document.getElementById('gender');
    const dobHiddenInput = document.getElementById('dob');
    const dobDisplayInput = document.getElementById('dob_display');
    const startDateHiddenInput = document.getElementById('start_date');
    const startDateDisplayInput = document.getElementById('start_date_display');


    const salaryConfirmOverlay = document.getElementById('salaryConfirmOverlay');
    const salaryConfirmYes = document.getElementById('salaryConfirmYes');
    const salaryConfirmLater = document.getElementById('salaryConfirmLater');
    const salaryConfirmClose = document.getElementById('salaryConfirmClose');

    let salaryConfirmResolve = null;

    const closeSalaryConfirm = (result) => {
        if (!salaryConfirmOverlay) {
            if (salaryConfirmResolve) {
                salaryConfirmResolve(Boolean(result));
                salaryConfirmResolve = null;
            }
            return;
        }
        salaryConfirmOverlay.classList.remove('active');
        salaryConfirmOverlay.setAttribute('aria-hidden', 'true');
        if (salaryConfirmResolve) {
            salaryConfirmResolve(Boolean(result));
            salaryConfirmResolve = null;
        }
    };

    const openSalaryConfirm = () => {
        if (!salaryConfirmOverlay) return Promise.resolve(false);
        salaryConfirmOverlay.classList.add('active');
        salaryConfirmOverlay.setAttribute('aria-hidden', 'false');
        const focusTarget = salaryConfirmYes || salaryConfirmLater;
        if (focusTarget && typeof focusTarget.focus === 'function') {
            focusTarget.focus();
        }
        return new Promise(resolve => {
            salaryConfirmResolve = resolve;
        });
    };

    if (salaryConfirmOverlay) {
        salaryConfirmOverlay.addEventListener('click', (e) => {
            if (e.target === salaryConfirmOverlay) closeSalaryConfirm(false);
        });
    }
    if (salaryConfirmYes) salaryConfirmYes.addEventListener('click', () => closeSalaryConfirm(true));
    if (salaryConfirmLater) salaryConfirmLater.addEventListener('click', () => closeSalaryConfirm(false));
    if (salaryConfirmClose) salaryConfirmClose.addEventListener('click', () => closeSalaryConfirm(false));

    let editingStaffId = null;

    const syncSalaryRateState = () => {
        if (!salaryType || !salaryRate) return;
        const enabled = Boolean(salaryType.value);
        salaryRate.disabled = !enabled;
        if (!enabled) {
            salaryRate.value = '';
        }
    };

    const parseSalaryValue = (value) => {
        const raw = String(value || '').replace(/[^\d]/g, '');
        return raw ? Number(raw) : 0;
    };

    const formatSalaryValue = (value) => {
        const number = parseSalaryValue(value);
        if (!number) return '';
        return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    const formatSalaryFromApi = (value) => {
        if (value === null || value === undefined || value === '') return '';
        if (typeof value === 'number') {
            if (!Number.isFinite(value) || value <= 0) return '';
            return Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
        }

        let raw = String(value).trim();
        if (!raw) return '';

        if (raw.includes(',') && raw.includes('.')) {
            raw = raw.replace(/\./g, '').replace(',', '.');
        } else if (raw.includes(',')) {
            raw = raw.replace(',', '.');
        }

        const number = parseFloat(raw);
        if (!Number.isFinite(number) || number <= 0) return '';
        return Math.round(number).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    };

    const syncSalaryDisplay = () => {
        if (!salaryRate) return;
        salaryRate.value = formatSalaryValue(salaryRate.value);
    };

    const setSalaryTypeValue = (value) => {
        if (!salaryType || !salaryTypeText || !salaryTypeDropdown) return;
        salaryType.value = value || '';
        const item = salaryTypeDropdown.querySelector(`.dropdown-list li[data-value="${salaryType.value}"]`);
        salaryTypeText.innerText = item ? item.innerText : 'Chọn loại lương';
        salaryType.dispatchEvent(new Event('change', { bubbles: true }));
    };
    function formatDateForInput(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
    }

    const parseStaffDateValue = (dateString) => {
        if (!dateString) return null;
        if (window.moment) {
            const parsed = moment(dateString, [moment.ISO_8601, 'YYYY-MM-DD', 'DD/MM/YYYY'], true);
            if (parsed.isValid()) return parsed;
        }
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? null : date;
    };

    const formatStaffDateForHidden = (dateString) => {
        const parsed = parseStaffDateValue(dateString);
        if (!parsed) return '';
        if (window.moment && parsed.format) {
            return parsed.format('YYYY-MM-DD');
        }
        const yyyy = parsed.getFullYear();
        const mm = String(parsed.getMonth() + 1).padStart(2, '0');
        const dd = String(parsed.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    };

    const formatStaffDateForDisplay = (dateString) => {
        const parsed = parseStaffDateValue(dateString);
        if (!parsed) return '';
        if (window.moment && parsed.format) {
            return parsed.format('DD/MM/YYYY');
        }
        const dd = String(parsed.getDate()).padStart(2, '0');
        const mm = String(parsed.getMonth() + 1).padStart(2, '0');
        const yyyy = parsed.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
    };

    const syncStaffDateDisplay = (hiddenInput, displayInput) => {
        if (!hiddenInput || !displayInput) return;
        if (!hiddenInput.value) {
            displayInput.value = '';
            return;
        }
        displayInput.value = formatStaffDateForDisplay(hiddenInput.value);
        if (window.jQuery && window.moment) {
            const picker = jQuery(displayInput).data('daterangepicker');
            const parsed = moment(hiddenInput.value, 'YYYY-MM-DD', true);
            if (picker && parsed.isValid()) {
                picker.setStartDate(parsed);
                picker.setEndDate(parsed);
            }
        }
    };

    const syncStaffDateDisplays = () => {
        syncStaffDateDisplay(dobHiddenInput, dobDisplayInput);
        syncStaffDateDisplay(startDateHiddenInput, startDateDisplayInput);
    };

    const initStaffDatePicker = (hiddenInput, displayInput, options) => {
        if (!hiddenInput || !displayInput) return;
        if (!window.jQuery || !jQuery.fn || !jQuery.fn.daterangepicker) return;

        const config = options || {};
        const $input = jQuery(displayInput);
        const repositionPicker = (picker) => {
            if (!picker || !picker.container || !picker.container.length) return;
            if (typeof picker.move !== 'function') return;
            const move = () => picker.move();
            if (window.requestAnimationFrame) {
                window.requestAnimationFrame(move);
            } else {
                setTimeout(move, 0);
            }
        };
        const setupMonthYearControls = (picker) => {
            if (!picker || !picker.container) return;
            const calendar = picker.container.find('.drp-calendar').first();
            const headerCell = picker.container.find('.calendar-table th.month');
            if (!headerCell.length || !calendar.length) return;
            headerCell.attr('colspan', 7);

            if (!headerCell.find('.vnt-month-year').length) {
                headerCell.empty().append(`
                    <div class="vnt-month-year">
                        <button type="button" class="vnt-nav vnt-prev" aria-label="Prev month">&#10094;</button>
                        <button type="button" class="vnt-title" aria-haspopup="true" aria-expanded="false"></button>
                        <button type="button" class="vnt-nav vnt-next" aria-label="Next month">&#10095;</button>
                    </div>
                `);
            }

            if (!calendar.find('.vnt-panel').length) {
                calendar.append(`
                    <div class="vnt-panel">
                        <div class="vnt-month-grid"></div>
                        <div class="vnt-year-list"></div>
                    </div>
                `);
            }

            const header = headerCell.find('.vnt-month-year');
            const titleBtn = header.find('.vnt-title');
            const monthGrid = calendar.find('.vnt-month-grid');
            const yearList = calendar.find('.vnt-year-list');

            const monthNames = [
                'Tháng Giêng', 'Tháng Hai', 'Tháng Ba', 'Tháng Tư',
                'Tháng Năm', 'Tháng Sáu', 'Tháng Bảy', 'Tháng Tám',
                'Tháng Chín', 'Tháng Mười', 'Tháng Mười Một', 'Tháng Mười Hai'
            ];
            const monthShorts = [
                'Thg1', 'Thg2', 'Thg3', 'Thg4', 'Thg5', 'Thg6',
                'Thg7', 'Thg8', 'Thg9', 'Thg10', 'Thg11', 'Thg12'
            ];

            const getView = () => picker.container.data('vnt-view') || 'day';

            const buildMonthGrid = () => {
                const current = picker.leftCalendar.month.clone();
                monthGrid.html(monthShorts.map((label, index) => {
                    const isSelected = index === current.month();
                    return `<button type="button" class="vnt-month-item${isSelected ? ' is-selected' : ''}" data-month="${index}">${label}</button>`;
                }).join(''));
            };

            const buildYearList = () => {
                const current = picker.leftCalendar.month.clone();
                const range = 12;
                let startYear = Number(picker.container.data('vnt-year-start'));
                if (!startYear || Number.isNaN(startYear)) {
                    startYear = current.year() - Math.floor(range / 2);
                }
                const endYear = startYear + range - 1;
                picker.container.data('vnt-year-start', startYear);
                const items = [];
                for (let year = startYear; year <= endYear; year++) {
                    const isSelected = year === current.year();
                    items.push(`<button type="button" class="vnt-year-item${isSelected ? ' is-selected' : ''}" data-year="${year}">${year}</button>`);
                }
                yearList.html(items.join(''));
            };

            const updateTitle = (view) => {
                const current = picker.leftCalendar.month.clone();
                if (view === 'day') {
                    titleBtn.text(`${monthNames[current.month()]} ${current.year()}`);
                } else {
                    titleBtn.text(`${current.year()}`);
                }
                titleBtn.attr('aria-expanded', view !== 'day');
            };

            const applyView = (view) => {
                picker.container
                    .removeClass('vnt-view-day vnt-view-month vnt-view-year')
                    .addClass(`vnt-view-${view}`)
                    .data('vnt-view', view);
                calendar
                    .removeClass('vnt-view-day vnt-view-month vnt-view-year')
                    .addClass(`vnt-view-${view}`);
                if (view === 'month') {
                    buildMonthGrid();
                }
                if (view === 'year') {
                    buildYearList();
                }
                updateTitle(view);
                repositionPicker(picker);
            };

            const setCurrentDate = (momentValue, viewAfter) => {
                if (viewAfter) {
                    picker.container.data('vnt-view', viewAfter);
                }
                picker.setStartDate(momentValue);
                picker.setEndDate(momentValue);
                picker.updateCalendars();
                if (hiddenInput) {
                    hiddenInput.value = momentValue.format('YYYY-MM-DD');
                }
                $input.val(momentValue.format('DD/MM/YYYY'));
            };

            applyView(getView());

            header.off('click.vntMonthYear');
            header.on('click.vntMonthYear', '.vnt-prev', (event) => {
                event.preventDefault();
                const view = getView();
                if (view === 'year') {
                    const range = 12;
                    let startYear = Number(picker.container.data('vnt-year-start'));
                    if (!startYear || Number.isNaN(startYear)) {
                        startYear = picker.leftCalendar.month.year() - Math.floor(range / 2);
                    }
                    picker.container.data('vnt-year-start', startYear - range);
                    applyView('year');
                    return;
                }
                const unit = view === 'month' ? 'year' : 'month';
                const current = picker.leftCalendar.month.clone().subtract(1, unit);
                picker.leftCalendar.month = current;
                picker.updateCalendars();
                picker.container.data('vnt-view', view);
            });
            header.on('click.vntMonthYear', '.vnt-next', (event) => {
                event.preventDefault();
                const view = getView();
                if (view === 'year') {
                    const range = 12;
                    let startYear = Number(picker.container.data('vnt-year-start'));
                    if (!startYear || Number.isNaN(startYear)) {
                        startYear = picker.leftCalendar.month.year() - Math.floor(range / 2);
                    }
                    picker.container.data('vnt-year-start', startYear + range);
                    applyView('year');
                    return;
                }
                const unit = view === 'month' ? 'year' : 'month';
                const current = picker.leftCalendar.month.clone().add(1, unit);
                picker.leftCalendar.month = current;
                picker.updateCalendars();
                picker.container.data('vnt-view', view);
            });
            header.on('click.vntMonthYear', '.vnt-title', (event) => {
                event.preventDefault();
                const view = getView();
                if (view === 'day') {
                    applyView('month');
                    return;
                }
                if (view === 'month') {
                    applyView('year');
                    return;
                }
                applyView('month');
            });

            monthGrid.off('click.vntMonthGrid').on('click.vntMonthGrid', '.vnt-month-item', function (event) {
                event.preventDefault();
                const monthIndex = Number(jQuery(this).data('month'));
                const base = picker.startDate ? picker.startDate.clone() : picker.leftCalendar.month.clone();
                base.month(monthIndex);
                setCurrentDate(base, 'day');
            });

            yearList.off('click.vntYearList').on('click.vntYearList', '.vnt-year-item', function (event) {
                event.preventDefault();
                const yearValue = Number(jQuery(this).data('year'));
                const base = picker.startDate ? picker.startDate.clone() : picker.leftCalendar.month.clone();
                base.year(yearValue);
                setCurrentDate(base, 'month');
            });
        };

        const patchPickerUpdate = (picker) => {
            if (!picker || picker._vntPatched) return;
            const originalUpdate = picker.updateCalendars;
            picker.updateCalendars = function () {
                originalUpdate.call(picker);
                setupMonthYearControls(picker);
                repositionPicker(picker);
            };
            picker._vntPatched = true;
        };

        $input.daterangepicker({
            singleDatePicker: true,
            autoUpdateInput: false,
            showDropdowns: false,
            autoApply: true,
            parentEl: '#staffForm',
            drops: config.drops || 'up',
            opens: 'center',
            locale: {
                format: 'DD/MM/YYYY'
            }
        }, function (start) {
            $input.val(start.format('DD/MM/YYYY'));
            hiddenInput.value = start.format('YYYY-MM-DD');
        });

        $input.off('click.daterangepicker');
        $input.off('focus.daterangepicker');

        $input.on('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            const picker = jQuery(this).data('daterangepicker');
            if (!picker) {
                return;
            }
            if (picker.isShowing) {
                picker.hide();
            } else {
                picker.show();
            }
        });

        $input.on('show.daterangepicker', function (event, picker) {
            patchPickerUpdate(picker);
            setupMonthYearControls(picker);
        });

        $input.on('change', function () {
            if (!window.moment) {
                return;
            }
            const parsed = moment($input.val(), 'DD/MM/YYYY', true);
            if (parsed.isValid()) {
                hiddenInput.value = parsed.format('YYYY-MM-DD');
            }
        });

        syncStaffDateDisplay(hiddenInput, displayInput);
    };

    initStaffDatePicker(dobHiddenInput, dobDisplayInput);
    initStaffDatePicker(startDateHiddenInput, startDateDisplayInput, { drops: 'up' });

    // ====== MỞ / ĐÓNG FORM ======
    function openStaffForm() {
        overlay.style.display = "flex";
        activateTab("info");
        const formTitle = document.getElementById('formTitle');
        if (formTitle) {
            formTitle.innerText = editingStaffId ? 'Cập nhật nhân viên' : 'Thêm mới nhân viên';
        }
        if (typeof syncStaffSelects === 'function') {
            syncStaffSelects();
        }
        syncStaffDateDisplays();
        setTimeout(() => { if (firstFocusable) firstFocusable.focus(); }, 120);
        document.addEventListener('keydown', escHandler);
    }
    function closeStaffForm() {
        overlay.style.display = "none";
        document.removeEventListener('keydown', escHandler);
        closeSalaryConfirm(false);
        resetForm();
    }
    function escHandler(e) {
        if (e.key !== 'Escape') return;
        if (salaryConfirmOverlay && salaryConfirmOverlay.classList.contains('active')) {
            closeSalaryConfirm(false);
            return;
        }
        closeStaffForm();
    }

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
        document.querySelector(`.staff-tab[data-tab="${tabName}"]`)?.classList.add('active');
        document.getElementById(`tab-${tabName}`)?.classList.add('active');
    }
    // ====== TAB SWITCH ======
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const target = tab.dataset.tab;

            // remove active
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // add active
            tab.classList.add('active');
            document.getElementById('tab-' + target).classList.add('active');
        });
    });

    if (salaryType) {
        salaryType.addEventListener('change', syncSalaryRateState);
        syncSalaryRateState();
    }

    if (salaryRate) {
        salaryRate.addEventListener('blur', syncSalaryDisplay);
        salaryRate.addEventListener('focus', () => {
            const raw = parseSalaryValue(salaryRate.value);
            salaryRate.value = raw ? String(raw) : '';
        });
        salaryRate.addEventListener('input', () => {
            const raw = parseSalaryValue(salaryRate.value);
            salaryRate.value = raw ? String(raw) : '';
        });
    }
// ====== RESET FORM ======
    function resetForm() {
        document.getElementById('staffInfoForm').reset();
        const salaryForm = document.getElementById('staffSalaryForm');
        if (salaryForm) salaryForm.reset();
        setSalaryTypeValue('');
        editingStaffId = null;
        if (dobHiddenInput) dobHiddenInput.value = '';
        if (dobDisplayInput) dobDisplayInput.value = '';
        if (startDateHiddenInput) startDateHiddenInput.value = '';
        if (startDateDisplayInput) startDateDisplayInput.value = '';
        if (typeof syncStaffSelects === 'function') {
            syncStaffSelects();
        }
        syncStaffDateDisplays();
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
            deleteImageInput.value = 0;
        }
    }

    // ====== IMAGE UPLOAD ======
    imageBox.addEventListener("click", (e) => {
    if (e.target === removeImageBtn) return;
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
        deleteImageInput.value = 0;
    }
    });
    removeImageBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    e.preventDefault();
    resetImageBox();
    deleteImageInput.value = 1;
    });

    // ====== SAVE STAFF ======
    document.querySelectorAll('#staffForm .staff-footer .staff-save').forEach(btn => {
        btn.addEventListener('click', async () => {
            const form = document.getElementById('staffInfoForm');
            const nameValue = form.querySelector('[name="name"]')?.value.trim() || '';
            const phoneValue = form.querySelector('[name="phone"]')?.value.trim() || '';
            const roleValue = roleSelect ? roleSelect.value : '';
            const passwordValue = form.querySelector('[name="password"]')?.value || '';

            if (!nameValue) {
                showToast('Vui lòng nhập tên nhân viên', 'error');
                return;
            }
            if (!phoneValue) {
                showToast('Vui lòng nhập số điện thoại', 'error');
                return;
            }
            if (!roleValue) {
                showToast('Vui lòng chọn chức vụ', 'error');
                return;
            }
            if (!editingStaffId && !passwordValue) {
                showToast('Vui lòng nhập mật khẩu', 'error');
                return;
            }

            const salaryTypeValue = salaryType ? salaryType.value : '';
            const salaryRateValue = salaryRate ? parseSalaryValue(salaryRate.value) : 0;
            let stayForSalary = false;
            if (!editingStaffId && (!salaryTypeValue || !salaryRateValue)) {

                stayForSalary = await openSalaryConfirm();

            }

            const formData = new FormData(form);
            if (imageInput.files[0]) formData.append('img', imageInput.files[0]);
            const url = editingStaffId ? `${BASE_URL}/staff/${editingStaffId}/update` : `${BASE_URL}/staff/store`;

            formData.append('_token', document.querySelector('meta[name="csrf-token"]').content);

            try {
                const res = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: formData
                });
                const data = await readJsonResponse(res);
                if (!res.ok || !data.success) {
                    showToast(getJsonErrorMessage(data, 'Lưu thất bại'), 'error');
                    return;
                }
                if (data.success) {
                    if (!editingStaffId && stayForSalary && data.staff && data.staff.id) {
                        editingStaffId = data.staff.id;
                        const staffIdInput = document.getElementById('staff_id');
                        if (staffIdInput) staffIdInput.value = data.staff.id;
                        const salaryStaffInput = document.getElementById('salary_staff_id');
                        if (salaryStaffInput) salaryStaffInput.value = data.staff.id;
                        const formTitle = document.getElementById('formTitle');
                        if (formTitle) formTitle.innerText = 'Cập nhật nhân viên';
                        activateTab('salary');
                        showToast('Nhân viên đã được tạo. Hay thiết lập lương.', 'info');
                        return;
                    }
                    showToast('Lưu thành công', 'success');
                    setTimeout(() => {
                        location.reload();
                    }, 800);
                }
            } catch (err) { console.error(err); showToast('Lỗi server!', 'error'); }
        });
    });

    if (btnSaveSalary) {
        btnSaveSalary.addEventListener('click', async () => {
            if (!editingStaffId) {
                if (typeof showToast === 'function') {
                    showToast('Vui lòng chọn nhân viên để thiết lập lương', 'error');
                }
                return;
            }

            const salaryTypeValue = salaryType ? salaryType.value : '';
            const salaryRateValue = salaryRate ? parseSalaryValue(salaryRate.value) : '';

            if (!salaryTypeValue) {
                if (typeof showToast === 'function') {
                    showToast('Vui lòng chọn loại lương', 'error');
                }
                return;
            }

            if (!salaryRateValue) {
                if (typeof showToast === 'function') {
                    showToast('Vui lòng nhập mức lương', 'error');
                }
                return;
            }

            const formData = new FormData();
            formData.append('_token', document.querySelector('meta[name="csrf-token"]').content);
            formData.append('salary_type', salaryTypeValue);
            formData.append('salary_rate', salaryRateValue);

            try {
                const res = await fetch(`${BASE_URL}/staff/${editingStaffId}/update`, {
                    method: 'POST',
                    body: formData
                });
                const data = await res.json();
                if (data.success) {
                    if (typeof showToast === 'function') {
                        showToast('Lưu lương thành công', 'success');
                        setTimeout(() => {
                            location.reload();
                        }, 800);
                    }
                } else {
                    if (typeof showToast === 'function') {
                        showToast(data.message || 'Lưu lương thất bại', 'error');
                    }
                }
            } catch (err) {
                console.error(err);
                if (typeof showToast === 'function') {
                    showToast('Lỗi server', 'error');
                }
            }
        });
    }

    // ====== EDIT STAFF ======
    document.querySelectorAll('.btn-update').forEach(btn => {
        btn.addEventListener('click', async e => {
            e.preventDefault(); e.stopPropagation();
            const detailRow = btn.closest('.detail-row');
            if (!detailRow) {
                console.error('Không tìm thấy thông tin chi tiết:', btn);
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
                    if (s.img) {
                        previewImage.src = `${window.location.origin}/VNT-Restaurant/public/images/staff/${s.img}`;
                        previewImage.style.display = "block";
                        removeImageBtn.style.display = "block";
                        addText.style.display = "none";
                        document.getElementById('delete_image').value = 0;
                    } else {
                        resetImageBox();
                    }
                    document.querySelector('#staffInfoForm [name="name"]').value = s.name;
                    if (roleSelect) roleSelect.value = s.role_id || '';
                    document.querySelector('#staffInfoForm [name="cccd"]').value = s.cccd;
                    document.querySelector('#staffInfoForm [name="phone"]').value = s.phone;
                    document.querySelector('#staffInfoForm [name="email"]').value = s.email;
                    if (genderSelect) genderSelect.value = s.gender || '';
                    if (dobHiddenInput) dobHiddenInput.value = formatStaffDateForHidden(s.dob);
                    if (startDateHiddenInput) startDateHiddenInput.value = formatStaffDateForHidden(s.start_date);
                    syncStaffDateDisplays();
                    if (typeof syncStaffSelects === 'function') {
                        syncStaffSelects();
                    }
                    document.querySelector('#staffInfoForm [name="password"]').value = '';
                    const salary = data.salary || null;
                    if (salary && salary.salary_type) {
                        setSalaryTypeValue(salary.salary_type);
                        if (salaryRate) {
                            salaryRate.value = formatSalaryFromApi(salary.salary_rate ?? '');
                        }
                    } else {
                        setSalaryTypeValue('');
                        if (salaryRate) {
                            salaryRate.value = '';
                        }
                    }
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
            if (!await openConfirmDialog('Bạn có chắc muốn xóa nhân viên này?')) return;
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
                    setTimeout(() => {
                        location.reload();
                    }, 800);
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




