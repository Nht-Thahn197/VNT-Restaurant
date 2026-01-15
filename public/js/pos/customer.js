

document.documentElement.classList.add('js');

var customerSelectControls = [];

var closeCustomerSelectMenus = function () {
  customerSelectControls.forEach(function (control) {
    control.close();
  });
};

var syncCustomerSelects = function () {
  customerSelectControls.forEach(function (control) {
    control.buildMenu();
    control.updateDisplay();
  });
};

var initCustomerSelect = function (wrapper) {
  if (!wrapper) {
    return;
  }
  var select = wrapper.querySelector('select');
  var trigger = wrapper.querySelector('.customer-select-trigger');
  var valueText = wrapper.querySelector('.customer-select-value');
  var menu = wrapper.querySelector('.customer-select-menu');

  if (!select || !trigger || !valueText || !menu) {
    return;
  }

  var buildMenu = function () {
    menu.innerHTML = '';
    Array.prototype.slice.call(select.options).forEach(function (option) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'customer-select-item';
      button.textContent = option.text;
      button.dataset.value = option.value;
      if (option.selected) {
        button.classList.add('is-selected');
      }
      button.addEventListener('click', function () {
        select.value = option.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        closeCustomerSelectMenus();
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
    closeCustomerSelectMenus();
    if (!isOpen) {
      openMenu();
    }
  });

  menu.addEventListener('click', function (event) {
    event.stopPropagation();
  });

  select.addEventListener('change', updateDisplay);

  customerSelectControls.push({
    buildMenu: buildMenu,
    updateDisplay: updateDisplay,
    close: closeMenu
  });

  buildMenu();
  updateDisplay();
};

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-customer-select]').forEach(function (wrapper) {
    initCustomerSelect(wrapper);
  });
  syncCustomerSelects();
});

document.addEventListener('click', closeCustomerSelectMenus);
document.addEventListener('keydown', function (event) {
  if (event.key === 'Escape') {
    closeCustomerSelectMenus();
  }
});
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
    const genderSelect = document.getElementById('gender');
    const dobHiddenInput = document.getElementById('dob');
    const dobDisplayInput = document.getElementById('dob_display');

    let editingCustomerId = null;

    function parseDobValue(dateString) {
        if (!dateString) return null;
        if (window.moment) {
            const parsed = moment(dateString, [moment.ISO_8601, 'YYYY-MM-DD', 'DD/MM/YYYY'], true);
            if (parsed.isValid()) return parsed;
        }
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? null : date;
    }

    function formatDobForHidden(dateString) {
        const parsed = parseDobValue(dateString);
        if (!parsed) return '';
        if (window.moment && parsed.format) {
            return parsed.format('YYYY-MM-DD');
        }
        const yyyy = parsed.getFullYear();
        const mm = String(parsed.getMonth() + 1).padStart(2, '0');
        const dd = String(parsed.getDate()).padStart(2, '0');
        return `${yyyy}-${mm}-${dd}`;
    }

    function formatDobForDisplay(dateString) {
        const parsed = parseDobValue(dateString);
        if (!parsed) return '';
        if (window.moment && parsed.format) {
            return parsed.format('DD/MM/YYYY');
        }
        const dd = String(parsed.getDate()).padStart(2, '0');
        const mm = String(parsed.getMonth() + 1).padStart(2, '0');
        const yyyy = parsed.getFullYear();
        return `${dd}/${mm}/${yyyy}`;
    }

    function syncDobDisplayFromHidden() {
        if (!dobHiddenInput || !dobDisplayInput) return;
        if (!dobHiddenInput.value) {
            dobDisplayInput.value = '';
            return;
        }
        dobDisplayInput.value = formatDobForDisplay(dobHiddenInput.value);
        if (window.jQuery && window.moment) {
            const picker = jQuery(dobDisplayInput).data('daterangepicker');
            const parsed = moment(dobHiddenInput.value, 'YYYY-MM-DD', true);
            if (picker && parsed.isValid()) {
                picker.setStartDate(parsed);
                picker.setEndDate(parsed);
            }
        }
    }

    // ====== DOB PICKER ======
    if (dobDisplayInput && window.jQuery && jQuery.fn && jQuery.fn.daterangepicker) {
        const $dobInput = jQuery(dobDisplayInput);
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
                if (dobHiddenInput) {
                    dobHiddenInput.value = momentValue.format('YYYY-MM-DD');
                }
                $dobInput.val(momentValue.format('DD/MM/YYYY'));
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

        $dobInput.daterangepicker({
            singleDatePicker: true,
            autoUpdateInput: false,
            showDropdowns: false,
            autoApply: true,
            parentEl: '#customerFormOverlay',
            drops: 'up',
            locale: {
                format: 'DD/MM/YYYY'
            }
        }, function (start) {
            const displayValue = start.format('DD/MM/YYYY');
            $dobInput.val(displayValue);
            if (dobHiddenInput) {
                dobHiddenInput.value = start.format('YYYY-MM-DD');
            }
        });

        $dobInput.off('click.daterangepicker');
        $dobInput.off('focus.daterangepicker');

        $dobInput.on('click', function (event) {
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

        $dobInput.on('show.daterangepicker', function (event, picker) {
            patchPickerUpdate(picker);
            setupMonthYearControls(picker);
        });

        $dobInput.on('change', function () {
            if (!dobHiddenInput || !window.moment) {
                return;
            }
            const parsed = moment($dobInput.val(), 'DD/MM/YYYY', true);
            if (parsed.isValid()) {
                dobHiddenInput.value = parsed.format('YYYY-MM-DD');
            }
        });

        syncDobDisplayFromHidden();
    }

    function resetForm() {
        const form = document.getElementById('customerInfoForm');
        if (form) form.reset();
        if (dobHiddenInput) dobHiddenInput.value = '';
        if (dobDisplayInput) dobDisplayInput.value = '';
        if (typeof syncCustomerSelects === 'function') {
            syncCustomerSelects();
        }
    }

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


// ====== MỞ / ĐÓNG FORM ======
    function openCustomerForm() {
        overlay.style.display = "flex";
        setTimeout(() => { if (firstFocusable) firstFocusable.focus(); }, 120);
        document.addEventListener('keydown', escHandler);
        if (typeof syncCustomerSelects === 'function') {
            syncCustomerSelects();
        }
        syncDobDisplayFromHidden();
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
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: formData
            });

            const data = await readJsonResponse(res);

            if (!res.ok || !data.success) {
                showToast(getJsonErrorMessage(data, 'Luu that bai!'), 'error');
                return;
            }

            if (data.success) {
                showToast('Lưu thành công!', 'success');
                setTimeout(() => {
                    location.reload();
                }, 800);
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
                const res = await fetch(`${BASE_URL}/customer/${id}`, {
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });
                const data = await readJsonResponse(res);
                if (!res.ok || !data.success) {
                    showToast(getJsonErrorMessage(data, 'Loi tai khach hang!'), 'error');
                    return;
                }
                if (data.success) {
                    const cus = data.customer;
                    document.querySelector('#customerInfoForm [name="name"]').value = cus.name;
                    document.querySelector('#customerInfoForm [name="phone"]').value = cus.phone;
                    document.querySelector('#customerInfoForm [name="email"]').value = cus.email;
                    if (genderSelect) genderSelect.value = cus.gender || '';
                    if (dobHiddenInput) {
                        dobHiddenInput.value = formatDobForHidden(cus.dob);
                    }
                    syncDobDisplayFromHidden();
                    if (typeof syncCustomerSelects === 'function') {
                        syncCustomerSelects();
                    }
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
