

document.documentElement.classList.add('js');

var tableSelectControls = [];

var closeTableSelectMenus = function () {
  tableSelectControls.forEach(function (control) {
    control.close();
  });
};

var syncTableSelects = function () {
  tableSelectControls.forEach(function (control) {
    control.buildMenu();
    control.updateDisplay();
  });
};

var initTableSelect = function (wrapper) {
  if (!wrapper) {
    return;
  }
  var select = wrapper.querySelector('select');
  var trigger = wrapper.querySelector('.table-select-trigger');
  var valueText = wrapper.querySelector('.table-select-value');
  var menu = wrapper.querySelector('.table-select-menu');

  if (!select || !trigger || !valueText || !menu) {
    return;
  }

  var buildMenu = function () {
    menu.innerHTML = '';
    Array.prototype.slice.call(select.options).forEach(function (option) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'table-select-item';
      button.textContent = option.text;
      button.dataset.value = option.value;
      if (option.selected) {
        button.classList.add('is-selected');
      }
      button.addEventListener('click', function () {
        select.value = option.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        closeTableSelectMenus();
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
    closeTableSelectMenus();
    if (!isOpen) {
      openMenu();
    }
  });

  menu.addEventListener('click', function (event) {
    event.stopPropagation();
  });

  select.addEventListener('change', updateDisplay);

  tableSelectControls.push({
    buildMenu: buildMenu,
    updateDisplay: updateDisplay,
    close: closeMenu
  });

  buildMenu();
  updateDisplay();
};

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-table-select]').forEach(function (wrapper) {
    initTableSelect(wrapper);
  });
  syncTableSelects();
});

document.addEventListener('click', closeTableSelectMenus);
document.addEventListener('keydown', function (event) {
  if (event.key === 'Escape') {
    closeTableSelectMenus();
  }
});
document.addEventListener("DOMContentLoaded", function () {
    
    const storeAreaUrl = window.routes.area.store;
    const baseUrl = window.routes.baseUrl;
    // ELEMENTS
    const searchInput = document.getElementById("table-search");
    const statusRadios = document.querySelectorAll("input[name='status']");
    const areaSelect = document.getElementById("areaSelect");
    const tableRows = document.querySelectorAll(".table-info");

    const overlay = document.getElementById("popup-overlay");
    const popup = document.getElementById("popup-add-area");
    const nameInput = document.getElementById("area-name");
    const saveBtn = document.getElementById("save-popup");
    const cancelBtn = document.getElementById("cancel-popup");
    const deleteBtn = document.getElementById("delete-popup");
    const addBtn = document.querySelector(".add-area-btn");
    const dropdown = document.getElementById('areaDropdown');
    const display = dropdown.querySelector('.selected-display');
    const listItems = dropdown.querySelectorAll('.dropdown-list li');
    const hiddenInput = document.getElementById('areaSelect');
    const currentValue = document.getElementById('currentValue');
    const editBtn = document.getElementById('editAreaBtn');

    let editId = null;
    let currentPage = 1;
    const rowsPerPage = 10;

    const filters = {
    keyword: '',
    area: '',
    status: 'all'
    };

    if (display) display.addEventListener('click', () => {
        dropdown.classList.toggle('active');
    });

    listItems.forEach(item => {
        item.addEventListener('click', () => {
            const value = item.getAttribute('data-value');
            const text = item.innerText;
            
            currentValue.innerText = text;
            hiddenInput.value = value;
            dropdown.classList.remove('active');
            
            // Hiện icon edit nếu có chọn giá trị
            if (value !== "") {
                // ĐÂY LÀ CHỖ THÊM CLASS ĐỂ CSS THU NHỎ 85%
                dropdown.classList.add('area-has-value');
                if (editBtn) editBtn.classList.remove('d-none');
            } else {
                // Nếu chọn "Tất cả" thì quay lại 100%
                dropdown.classList.remove('area-has-value');
                if (editBtn) editBtn.classList.add('d-none');
            }
            filters.area = value; 
            applyTableFilters();
        });
    });

    if (dropdown) window.addEventListener('click', (e) => {
        if (!dropdown.contains(e.target)) dropdown.classList.remove('active');
    });

    // ===================== Filter & Render =====================
    function applyTableFilters() {
        const rows = document.querySelectorAll('.table-info');
        rows.forEach(row => {
            let match = true;

            // 🔍 keyword
            const text = (row.dataset.name + ' ' + row.dataset.areaName).toLowerCase();
            if (filters.keyword) {
                match = text.includes(filters.keyword);
            }

            // 🏠 area
            if (match && filters.area) {
                match = row.dataset.area === filters.area;
            }

            // 🔘 status
            if (match && filters.status !== 'all') {
                match = row.dataset.status === filters.status;
            }

            row.dataset.filtered = match ? '1' : '0';
        });

        currentPage = 1;
        renderTablePagination();
    }

    function getFilteredRows() {
        return Array.from(document.querySelectorAll('.table-info'))
            .filter(row => row.dataset.filtered === '1');
    }

    function renderTablePagination() {
        const allRows = document.querySelectorAll('.table-info');
        const filteredRows = getFilteredRows();
        const totalPages = Math.ceil(filteredRows.length / rowsPerPage) || 1;
        if (currentPage > totalPages) currentPage = totalPages;

        // Ẩn tất cả trước
        allRows.forEach(row => {
            row.style.display = 'none';
            const detail = document.getElementById(`detail-${row.dataset.id}`);
            if (detail) detail.style.display = 'none';
        });

        // Hiển thị row đúng page
        const start = (currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        filteredRows.slice(start, end).forEach(row => row.style.display = '');
        
        // Cập nhật thông tin pagination
        document.getElementById('pageInfo').innerText = `Trang ${currentPage} / ${totalPages}`;
        document.getElementById('prevPage').disabled = currentPage === 1;
        document.getElementById('nextPage').disabled = currentPage === totalPages;

        const paginationContainer = document.getElementById('pagination');
        if (totalPages <= 1) {
        paginationContainer.classList.add('d-none');
        } else {
        paginationContainer.classList.remove('d-none');
        }
    }

    // INIT
    document.querySelectorAll('.table-info').forEach(r => r.dataset.filtered = '1');
    renderTablePagination();

    // EVENTS
    if (searchInput) searchInput.addEventListener('input', e => {
        filters.keyword = e.target.value.trim().toLowerCase();
        applyTableFilters();
    });

    if (areaSelect) areaSelect.addEventListener('change', e => {
        filters.area = e.target.value;
        applyTableFilters();
    });

    statusRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            filters.status = document.querySelector('input[name="status"]:checked').value;
            applyTableFilters();
        });
    });

    // PAGINATION BUTTONS
    document.getElementById('prevPage').addEventListener('click', () => {
        if (currentPage > 1) currentPage--;
        renderTablePagination();
    });

    document.getElementById('nextPage').addEventListener('click', () => {
        currentPage++;
        renderTablePagination();
    });


    // ===========================
    // OPEN/CLOSE POPUP
    // ===========================
    if (addBtn) addBtn.addEventListener("click", function (e) {
        e.stopPropagation();
        openPopup("add");
    });

    function openPopup(mode, id = null, name = "") {
        if (mode === "add") {
            popup.querySelector("h2").innerText = "Thêm Khu Vực";
            if (deleteBtn) deleteBtn.style.display = "none";
            editId = null;
        } else {
            popup.querySelector("h2").innerText = "Sửa Khu Vực";
            if (deleteBtn) deleteBtn.style.display = "inline-block";
            editId = id;
        }
        nameInput.value = name || "";
        overlay.style.display = "block";
        popup.style.display = "block";
    }

    function updateAreaUI() {
        const areaInput = document.getElementById("areaSelect");
        if (!areaInput) return; // tránh crash

        const selectedAreaId = areaInput.value; // "" hoặc area_id
        const tableRows = document.querySelectorAll(".table-row");

        tableRows.forEach(row => {
            const rowAreaId = row.dataset.areaId;

            if (!selectedAreaId || rowAreaId === selectedAreaId) {
                row.style.display = "";
            } else {
                row.style.display = "none";
            }
        });
    }

    function closePopup() {
        overlay.style.display = "none";
        popup.style.display = "none";
        nameInput.value = "";
        editId = null;
    }

    if (cancelBtn) cancelBtn.addEventListener("click", closePopup);
    if (overlay) overlay.addEventListener("click", closePopup);

    // =========================== EDIT AREA =========================== //
    document.addEventListener("click", function (e) {
        if (e.target.closest(".edit-icon")) {
            const areaSelectInput = document.getElementById("areaSelect");
            const id = areaSelectInput.value;
            const currentValueSpan = document.getElementById("currentValue");
            const name = currentValueSpan.textContent.trim();
            if (!id || id === "") {
                showToast("Vui lòng chọn khu vực để sửa", "warning");
                return;
            }
            openPopup("edit", id, name);
        }
    });

    // =========================== SAVE AREA (ADD/UPDATE)  =========================== //
    if (saveBtn) saveBtn.addEventListener("click", function () {
        const name = nameInput.value.trim();
        if (!name) {
            showToast("Vui lòng nhập tên khu vực!", "warning");
            return;
        }

        // UPDATE
        if (editId) {
            fetch(`/VNT-Restaurant/public/pos/area/update/${editId}`, {
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
                    const option = areaSelect.querySelector(`option[value="${editId}"]`);
                    if (option) option.textContent = name;
                    showToast("Cập nhật khu vực thành công");
                    closePopup();
                } else {
                    showToast(data.message || "Cập nhật thất bại", "error");
                }
            })
            .catch(err => { console.error(err); showToast("Lỗi server!", "error"); });
            return;
        }

        // ADD NEW
        const formData = new FormData();
        formData.append("name", name);

        fetch(storeAreaUrl, {
        method: "POST",
        headers: { "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]').content },
        body: formData
        })
        .then(res => res.json())
        .then(data => {
        if (data.success) {
            // Thêm option mới vào select
            const newOption = document.createElement("option");
            newOption.value = data.area.id;
            newOption.textContent = data.area.name;
            areaSelect.appendChild(newOption);

            // Giữ select ở "-- Tất cả --"
            areaSelect.value = "";
            updateAreaUI();

            // Hiện tất cả table
            tableRows.forEach(row => row.style.display = "");
            showToast("Thêm khu vực thành công");
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
    if (deleteBtn) deleteBtn.addEventListener("click", function () {
        if (!editId) {
        showToast("Không có khu vực để xóa", "warning");
        return;
        }
        if (!confirm("Bạn có chắc muốn xóa?")) return;

        fetch(`/VNT-Restaurant/public/pos/area/delete/${editId}`, {
        method: "DELETE",
        headers: { "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]').content }
        })
        .then(res => res.json())
        .then(data => {
        if (data.success) {
            // Xóa option trong select
            const option = document.querySelector(`#areaSelect option[value="${editId}"]`);
            if (option) option.remove();

            // Reset select về "Tất cả"
            areaSelect.value = "";
            updateAreaUI(); // update width + icon

            // Hiện tất cả table
            tableRows.forEach(row => row.style.display = "");
            showToast("Xóa khu vực thành công");
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

document.addEventListener("DOMContentLoaded", function () {
    const CSRF_TOKEN = document
        .querySelector('meta[name="csrf-token"]')
        .getAttribute("content");

    const BASE_URL = window.routes.baseUrl;
    const tableFormOverlay = document.getElementById("tableFormOverlay");
    const btnCreate = document.querySelector(".btn-create");
    const btnCloseHeader = document.getElementById("btnCloseHeader");
    const cancelBtn = document.getElementById("cancelBtn");
    const saveBtn = document.getElementById("table-save");
    const tableIdInput = document.getElementById("table_id");
    const nameInput = document.getElementById("table_name");
    const areaSelect = document.getElementById("area_id");
    let currentDetailOpen = null;
    if (btnCreate) btnCreate.addEventListener("click", function () {
        openForm();
    });
    if (btnCloseHeader) btnCloseHeader.addEventListener("click", closeForm);
    if (cancelBtn) cancelBtn.addEventListener("click", closeForm);
    function openForm(isEdit = false) {
        document.getElementById("formTitle").innerText = isEdit ? "Cập nhật phòng/bàn" : "Thêm phòng/bàn";
        if (!isEdit) {
            tableIdInput.value = "";
            nameInput.value = "";
            areaSelect.value = "";
        }
        tableFormOverlay.style.display = "flex";
        if (typeof syncTableSelects === 'function') { syncTableSelects(); }
    }
    function closeForm() {
        tableFormOverlay.style.display = "none";
    }
    const rows = document.querySelectorAll(".table-info");
    rows.forEach(row => {
        row.addEventListener("click", function () {
            const id = this.dataset.id;
            const detailRow = document.getElementById(`detail-${id}`);
            document.querySelectorAll(".detail-row").forEach(r => { 
                if (r !== detailRow) r.style.display = "none"; 
            }); 
            document.querySelectorAll(".table-info").forEach(r => {
                 if (r !== this) r.classList.remove("active"); }); 
            // Toggle row chi tiết của chính nó 
            if (detailRow.style.display === "none" || detailRow.style.display === "") { 
                detailRow.style.display = "table-row"; 
                this.classList.add("active");
                initDetailButtons(id, detailRow);
                } else { 
                    detailRow.style.display = "none"; 
                    this.classList.remove("active");
                }
            });
        });
    function initDetailButtons(id, detailRow) {
        const btnUpdate = detailRow.querySelector(".tb-update");
        const btnDelete = detailRow.querySelector(".tb-delete");
        const btnStatus = detailRow.querySelector(".tb-status");
        if (btnStatus) {
            const currentStatus = btnStatus.dataset.status;
            updateStatusButtonUI(btnStatus, currentStatus);
        }
        if (btnUpdate) btnUpdate.addEventListener("click", async function (e) {
            e.preventDefault();
            await loadTableInfo(id);
        });
        if (btnDelete) btnDelete.addEventListener("click", async function (e) {
            e.preventDefault();
            if (!confirm("Bạn có chắc muốn xoá phòng/bàn này?")) return;
            try {
                const res = await fetch(`${BASE_URL}/pos/table/${id}`, {
                    method: "DELETE",
                    headers: { "X-CSRF-TOKEN": CSRF_TOKEN }
                });
                if (!res.ok) throw new Error();
                    showToast("Đã xoá phòng/bàn!", "success");
                    setTimeout(() => location.reload(), 800);
                } catch {
                    showToast("Không thể xoá phòng/bàn!", "error");
                }
        });
        if (btnStatus) btnStatus.addEventListener("click", async function (e) {
            e.preventDefault();

            const res = await fetch(`${BASE_URL}/pos/table/${id}/toggle-status`, {
                method: "POST",
                headers: {
                    "X-CSRF-TOKEN": CSRF_TOKEN
                }
            });
            const data = await res.json();
            if (res.ok) {
            updateStatusButtonUI(btnStatus, data.status);
            location.reload();
            }
        });
        if (btnStatus) updateStatusButtonStyle(btnStatus);
    }
    function updateStatusButtonUI(btn, status) {
    if (status === "active") {
        btn.innerHTML = `<i class="fa fa-lock"></i> Ngừng hoạt động`;
        btn.style.background = "#ff0000";
        btn.style.color = "#fff";
    } else {
        btn.innerHTML = `<i class="fa fa-check"></i> Cho phép hoạt động`;
        btn.style.background = "#00B63E";
        btn.style.color = "#fff";
    }
    }
    async function loadTableInfo(id) {
        try {
            const res = await fetch(`${BASE_URL}/pos/table/${id}`);
            const json = await res.json();

            const t = json.data; // lấy đúng object chứa dữ liệu

            tableIdInput.value = t.id;
            nameInput.value = t.name;
            areaSelect.value = t.area_id;
            if (typeof syncTableSelects === 'function') { syncTableSelects(); }

            openForm(true);
        } catch (err) {
            console.error("Lỗi load table:", err);
        }
    }
    if (saveBtn) saveBtn.addEventListener("click", async function () {
        const id = tableIdInput.value;
        const name = nameInput.value.trim();
        const area_id = areaSelect.value;

        if (!name || !area_id) {
            showToast("Vui lòng nhập đầy đủ thông tin!", "warning");
            return;
        }

        const url = id
            ? `${BASE_URL}/pos/table/${id}/update`
            : `${BASE_URL}/pos/table/store`;

        try {
            const res = await fetch(url, {
                method: "POST",
                headers: {
                    "X-CSRF-TOKEN": CSRF_TOKEN,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ name, area_id })
            });

            if (!res.ok) throw new Error();

            showToast(id ? "Cập nhật bàn thành công!" : "Thêm bàn thành công!", "success");
            closeForm();

            setTimeout(() => {
                location.reload();
            }, 800);

        } catch {
            showToast("Có lỗi xảy ra, vui lòng thử lại!", "error");
        }
    });
    function updateStatusButtonStyle(btn) {
        const text = btn.innerText.trim();
        if (text.includes("Ngừng")) {
            // ACTIVE → nút đỏ
            btn.style.background = "#ff0000";
            btn.style.color = "#fff";
        } else {
            // INACTIVE → nút xanh
            btn.style.background = "#00B63E";
            btn.style.color = "#fff";
        }
    }
});