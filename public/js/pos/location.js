document.documentElement.classList.add("js");

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
    return fallback || "Request failed.";
}

async function readJsonResponse(res) {
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
        await res.text();
        throw new Error(`Unexpected response (${res.status}).`);
    }
    return res.json();
}

var locationSelectControls = [];

let selectedFile = null;

var closeLocationSelectMenus = function () {
    locationSelectControls.forEach(function (control) {
        control.close();
    });
};

var syncLocationSelects = function () {
    locationSelectControls.forEach(function (control) {
        control.buildMenu();
        control.updateDisplay();
    });
};

var initLocationSelect = function (wrapper) {
    if (!wrapper) {
        return;
    }
    var select = wrapper.querySelector("select");
    var trigger = wrapper.querySelector(".staff-select-trigger");
    var valueText = wrapper.querySelector(".staff-select-value");
    var menu = wrapper.querySelector(".staff-select-menu");

    if (!select || !trigger || !valueText || !menu) {
        return;
    }

    var buildMenu = function () {
        menu.innerHTML = "";
        Array.prototype.slice.call(select.options).forEach(function (option) {
            var button = document.createElement("button");
            button.type = "button";
            button.className = "staff-select-item";
            button.textContent = option.text;
            button.dataset.value = option.value;
            if (option.selected) {
                button.classList.add("is-selected");
            }
            button.addEventListener("click", function () {
                select.value = option.value;
                select.dispatchEvent(new Event("change", { bubbles: true }));
                closeLocationSelectMenus();
            });
            menu.appendChild(button);
        });
    };

    var updateDisplay = function () {
        var selectedOption = select.options[select.selectedIndex];
        valueText.textContent = selectedOption ? selectedOption.text : "";
        if (selectedOption && selectedOption.value === "") {
            valueText.classList.add("is-placeholder");
        } else {
            valueText.classList.remove("is-placeholder");
        }
        Array.prototype.slice.call(menu.children).forEach(function (child) {
            if (child.dataset.value === select.value) {
                child.classList.add("is-selected");
            } else {
                child.classList.remove("is-selected");
            }
        });
    };

    var closeMenu = function () {
        menu.classList.remove("open");
        menu.setAttribute("aria-hidden", "true");
        trigger.setAttribute("aria-expanded", "false");
    };

    var openMenu = function () {
        buildMenu();
        menu.classList.add("open");
        menu.setAttribute("aria-hidden", "false");
        trigger.setAttribute("aria-expanded", "true");
    };

    trigger.addEventListener("click", function (event) {
        event.stopPropagation();
        var isOpen = menu.classList.contains("open");
        closeLocationSelectMenus();
        if (!isOpen) {
            openMenu();
        }
    });

    menu.addEventListener("click", function (event) {
        event.stopPropagation();
    });

    select.addEventListener("change", updateDisplay);

    locationSelectControls.push({
        buildMenu: buildMenu,
        updateDisplay: updateDisplay,
        close: closeMenu
    });

    buildMenu();
    updateDisplay();
};

document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll("[data-location-select]").forEach(function (wrapper) {
        initLocationSelect(wrapper);
    });
    syncLocationSelects();
});

document.addEventListener("click", closeLocationSelectMenus);
document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
        closeLocationSelectMenus();
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const csrfToken = document
        .querySelector('meta[name="csrf-token"]')
        .getAttribute("content");

    const searchInput = document.getElementById("location-search");
    const statusRadios = document.querySelectorAll("input[name='status']");
    const regionDropdown = document.getElementById("regionDropdown");
    const regionDisplay = regionDropdown?.querySelector(".selected-display");
    const regionItems = regionDropdown
        ? Array.from(regionDropdown.querySelectorAll(".dropdown-list li"))
        : [];
    const regionHidden = document.getElementById("regionSelect");
    const regionCurrentValue = document.getElementById("regionCurrentValue");
    const editRegionBtn = document.getElementById("editRegionBtn");
    const addRegionBtn = document.querySelector(".add-region-btn");
    const overlay = document.getElementById("popup-overlay");
    const regionPopup = document.getElementById("popup-add-region");
    const regionPopupTitle = document.getElementById("regionPopupTitle");
    const regionNameInput = document.getElementById("region-name");
    const regionSaveBtn = document.getElementById("save-popup");
    const regionCancelBtn = document.getElementById("cancel-popup");
    const regionDeleteBtn = document.getElementById("delete-popup");

    const pagination = document.getElementById("pagination");
    const pageInfo = document.getElementById("pageInfo");
    const prevPage = document.getElementById("prevPage");
    const nextPage = document.getElementById("nextPage");

    const locationFormOverlay = document.getElementById("locationFormOverlay");
    const locationFormTitle = document.getElementById("locationFormTitle");
    const locationForm = document.getElementById("locationForm");
    const locationFormClose = document.getElementById("locationFormClose");
    const locationSaveBtn = document.getElementById("locationSave");
    const locationCancelBtn = document.getElementById("locationCancel");
    const addLocationBtn = document.getElementById("addLocationBtn");
    const locationIdInput = document.getElementById("location_id");
    const locationCodeInput = document.getElementById("location_code");
    const locationNameInput = document.getElementById("location_name");
    const locationRegionSelect = document.getElementById("location_region");
    const locationThumbnailInput = document.getElementById("location_thumbnail");
    const locationCapacityInput = document.getElementById("location_capacity");
    const locationAreaInput = document.getElementById("location_area");
    const locationFloorsInput = document.getElementById("location_floors");
    const locationTimeStartInput = document.getElementById("location_time_start");
    const locationTimeEndInput = document.getElementById("location_time_end");
    const locationStatusSelect = document.getElementById("location_status");
    const locationMapUrlInput = document.getElementById("location_map_url");
    const locationImageInput = document.getElementById("locationImageInput");
    const locationPreviewImage = document.getElementById("locationPreviewImage");
    const locationImageBox = document.getElementById("locationImageBox");
    const locationAddImageText = document.getElementById("locationAddImageText");
    const locationRemoveImageBtn = document.getElementById("locationRemoveImageBtn");
    const locationChooseImageBtn = document.getElementById("locationChooseImage");

    const normalizeTimeValue = (value) => {
        if (!value) return "";
        const match = value.match(/^(\d{1,2}):(\d{2})/);
        if (!match) return value;
        return `${match[1].padStart(2, "0")}:${match[2]}`;
    };

    const rowsPerPage = 10;
    let currentPage = 1;
    let filters = {
        keyword: "",
        region: "",
        status: "all"
    };
    let editingRegionId = null;

    if (regionDisplay) {
        regionDisplay.addEventListener("click", (event) => {
            event.stopPropagation();
            regionDropdown.classList.toggle("active");
        });
    }

    regionItems.forEach((item) => {
        item.addEventListener("click", () => {
            const value = item.getAttribute("data-value");
            const text = item.textContent.trim();
            regionHidden.value = value;
            regionCurrentValue.textContent = text;
            regionDropdown.classList.remove("active");
            filters.region = value;
            if (value) {
                regionDropdown.classList.add("area-has-value");
                editRegionBtn?.classList.remove("d-none");
            } else {
                regionDropdown.classList.remove("area-has-value");
                editRegionBtn?.classList.add("d-none");
            }
            applyFilters();
        });
    });

    window.addEventListener("click", (event) => {
        if (regionDropdown && !regionDropdown.contains(event.target)) {
            regionDropdown.classList.remove("active");
        }
    });

    if (addRegionBtn) {
        addRegionBtn.addEventListener("click", (event) => {
            event.stopPropagation();
            openRegionPopup("add");
        });
    }

    if (editRegionBtn) {
        editRegionBtn.addEventListener("click", () => {
            const selectedId = regionHidden.value;
            const selectedText = regionCurrentValue.textContent.trim();
            if (!selectedId) {
                showToast("Vui lòng chọn khu vực cần chỉnh sửa.", "warning");
                return;
            }
            openRegionPopup("edit", selectedId, selectedText);
        });
    }

    if (overlay) {
        overlay.addEventListener("click", closeRegionPopup);
    }

    if (regionCancelBtn) {
        regionCancelBtn.addEventListener("click", closeRegionPopup);
    }

    if (regionSaveBtn) {
        regionSaveBtn.addEventListener("click", async () => {
            const name = regionNameInput.value.trim();
            if (!name) {
                showToast("Vui lòng nhập tên khu vực.", "warning");
                return;
            }
            const url = editingRegionId
                ? window.routes.region.updatePattern.replace("__ID__", editingRegionId)
                : window.routes.region.store;
            try {
                const res = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRF-TOKEN": csrfToken,
                        "Accept": "application/json",
                        "X-Requested-With": "XMLHttpRequest"
                    },
                    body: JSON.stringify({ name })
                });
                const data = await readJsonResponse(res);
                if (res.ok && data.success) {
                    showToast(editingRegionId ? "Cập nhật khu vực thành công" : "Thêm khu vực thành công");
                    closeRegionPopup();
                    setTimeout(() => {
                        location.reload();
                    }, 600);
                } else {
                    showToast(data.message || "Có lỗi xảy ra", "error");
                }
            } catch (error) {
                console.error(error);
                showToast("Lỗi server", "error");
            }
        });
    }

    if (regionDeleteBtn) {
        regionDeleteBtn.addEventListener("click", async () => {
            if (!editingRegionId) {
                showToast("Không có khu vực nào để xóa", "warning");
                return;
            }
            if (!await openConfirmDialog("Bạn có chắc chắn muốn xóa khu vực này?")) return;

            try {
                const res = await fetch(window.routes.region.deletePattern.replace("__ID__", editingRegionId), {
                    method: "DELETE",
                    headers: {
                        "X-CSRF-TOKEN": csrfToken,
                        "Accept": "application/json",
                        "X-Requested-With": "XMLHttpRequest"
                    }
                });
                const data = await readJsonResponse(res);
                if (res.ok && data.success) {
                    showToast("Xóa khu vực thành công");
                    closeRegionPopup();
                    setTimeout(() => location.reload(), 600);
                } else {
                    showToast(data.message || "Không thể xóa khu vực", "error");
                }
            } catch (err) {
                console.error(err);
                showToast("Lỗi server", "error");
            }
        });
    }

    function openRegionPopup(mode, id = null, name = "") {
        editingRegionId = mode === "edit" ? id : null;
        overlay.style.display = "block";
        regionPopup.style.display = "block";
        regionPopupTitle.textContent = mode === "edit" ? "Sửa khu vực" : "Thêm khu vực";
        regionNameInput.value = name;
        if (mode === "add") {
            regionDeleteBtn?.setAttribute("style", "display:none");
        } else {
            regionDeleteBtn?.setAttribute("style", "display:inline-block");
        }
    }

    function closeRegionPopup() {
        if (!overlay || !regionPopup) return;
        overlay.style.display = "none";
        regionPopup.style.display = "none";
        regionNameInput.value = "";
        editingRegionId = null;
    }

    searchInput?.addEventListener("input", (event) => {
        filters.keyword = event.target.value.trim().toLowerCase();
        applyFilters();
    });

    statusRadios.forEach(radio => {
        radio.addEventListener("change", () => {
            filters.status = document.querySelector("input[name='status']:checked").value;
            applyFilters();
        });
    });

    prevPage?.addEventListener("click", () => {
        if (currentPage > 1) {
            currentPage--;
            renderPagination();
        }
    });

    nextPage?.addEventListener("click", () => {
        currentPage++;
        renderPagination();
    });

    function applyFilters() {
        document.querySelectorAll(".location-row").forEach(row => {
            const text = `${row.dataset.name || ""} ${row.dataset.code || ""}`.toLowerCase();
            let match = true;
            if (filters.keyword && !text.includes(filters.keyword)) {
                match = false;
            }
            if (match && filters.region) {
                match = row.dataset.region === filters.region;
            }
            if (match && filters.status !== "all") {
                match = row.dataset.status === filters.status;
            }
            row.dataset.filtered = match ? "1" : "0";
        });
        currentPage = 1;
        renderPagination();
    }

    function getFilteredRows() {
        return Array.from(document.querySelectorAll(".location-row"))
            .filter(row => row.dataset.filtered === "1");
    }

    function renderPagination() {
        const filtered = getFilteredRows();
        const totalPages = Math.max(Math.ceil(filtered.length / rowsPerPage), 1);
        if (currentPage > totalPages) currentPage = totalPages;

        document.querySelectorAll(".location-row").forEach(row => {
            row.style.display = "none";
            const detail = document.getElementById(`detail-${row.dataset.id}`);
            if (detail) detail.style.display = "none";
            row.classList.remove("active");
        });

        const start = (currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        filtered.slice(start, end).forEach(row => {
            row.style.display = "";
        });

        pageInfo && (pageInfo.textContent = `Trang ${currentPage} / ${totalPages}`);
        prevPage && (prevPage.disabled = currentPage <= 1);
        nextPage && (nextPage.disabled = currentPage >= totalPages);
        pagination?.classList.toggle("d-none", totalPages <= 1);
    }

    document.querySelectorAll(".location-row").forEach(row => {
        row.addEventListener("click", () => {
            const id = row.dataset.id;
            const detail = document.getElementById(`detail-${id}`);
            if (!detail) return;
            const wasVisible = detail.style.display === "table-row";
            document.querySelectorAll(".detail-row").forEach(d => d.style.display = "none");
            document.querySelectorAll(".location-row").forEach(r => r.classList.remove("active"));
            if (!wasVisible) {
                detail.style.display = "table-row";
                row.classList.add("active");
                initDetailButtons(id, detail);
            }
        });
    });

    function initDetailButtons(id, detailRow) {
        const btnUpdate = detailRow.querySelector(".tb-update");
        const btnDelete = detailRow.querySelector(".tb-delete");
        const btnStatus = detailRow.querySelector(".tb-status");

        if (btnStatus) {
            updateStatusButtonUI(btnStatus, btnStatus.dataset.status);
            btnStatus.onclick = async (event) => {
                event.preventDefault();
                try {
                    const res = await fetch(window.routes.location.toggleStatusPattern.replace("__ID__", id), {
                        method: "POST",
                        headers: {
                            "X-CSRF-TOKEN": csrfToken,
                            "Accept": "application/json",
                            "X-Requested-With": "XMLHttpRequest"
                        }
                    });
                    const data = await readJsonResponse(res);
                    if (res.ok && data.success) {
                        const row = document.querySelector(`.location-row[data-id="${id}"]`);
                        if (row) {
                            row.dataset.status = data.status;
                            const statusCell = row.children[row.children.length - 1];
                            if (statusCell) {
                                statusCell.textContent = data.status === "active" ? "Đang hoạt động" : "Ngừng hoạt động";
                            }
                        }
                        updateStatusButtonUI(btnStatus, data.status);
                        showToast("Đã cập nhật trạng thái", "success");
                    } else {
                        showToast(data.message || "Không thể cập nhật trạng thái", "error");
                    }
                } catch (err) {
                    console.error(err);
                    showToast("Lỗi server", "error");
                }
            };
        }

        if (btnUpdate) {
            btnUpdate.onclick = async (event) => {
                event.preventDefault();
                await loadLocationInfo(id);
            };
        }

        if (btnDelete) {
            btnDelete.onclick = async (event) => {
                event.preventDefault();
                if (!await openConfirmDialog("Bạn có chắc chắn muốn xóa địa điểm này?")) return;
                try {
                    const res = await fetch(window.routes.location.deletePattern.replace("__ID__", id), {
                        method: "DELETE",
                        headers: {
                            "X-CSRF-TOKEN": csrfToken,
                            "Accept": "application/json",
                            "X-Requested-With": "XMLHttpRequest"
                        }
                    });
                    const data = await readJsonResponse(res);
                    if (res.ok && data.success) {
                        showToast("Xóa địa điểm thành công", "success");
                        setTimeout(() => location.reload(), 600);
                    } else {
                        showToast(data.message || "Không thể xóa địa điểm", "error");
                    }
                } catch (err) {
                    console.error(err);
                    showToast("Lỗi server", "error");
                }
            };
        }
    }

    function updateStatusButtonUI(btn, status) {
        if (!btn) return;
        btn.dataset.status = status;
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

    async function loadLocationInfo(id) {
        try {
            const url = window.routes.location.showPattern.replace("__ID__", id);
            const res = await fetch(url, {
                headers: {
                    "Accept": "application/json",
                    "X-Requested-With": "XMLHttpRequest"
                }
            });
            const data = await readJsonResponse(res);
            if (!res.ok || !data.success) {
                showToast("Không thể tải thông tin", "error");
                return;
            }
            const location = data.data;
            locationIdInput.value = location.id;
            locationCodeInput.value = location.code || "";
            locationNameInput.value = location.name || "";
            locationRegionSelect.value = location.region_id || "";
            if (location.thumbnail) {
                locationThumbnailInput.value = location.thumbnail;
                updateLocationPreview(location.thumbnail);
            } else {
                locationThumbnailInput.value = "";
                clearLocationPreview();
            }
            selectedFile = null;
            locationCapacityInput.value = location.capacity || "";
            locationAreaInput.value = location.area || "";
            locationFloorsInput.value = location.floors || "";
            locationTimeStartInput.value = normalizeTimeValue(location.time_start || "");
            locationTimeEndInput.value = normalizeTimeValue(location.time_end || "");
            locationStatusSelect.value = location.status || "active";
            if (locationMapUrlInput) {
                locationMapUrlInput.value = location.map_url || "";
            }
            if (typeof syncLocationSelects === "function") {
                syncLocationSelects();
            }
            openLocationForm(true);
        } catch (err) {
            console.error("Lỗi load địa điểm:", err);
            showToast("Không thể tải thông tin địa điểm", "error");
        }
    }

    function updateLocationPreview(src) {
        if (!locationPreviewImage || !locationAddImageText) return;
        locationPreviewImage.src = window.routes.assetUrl + src;
        locationPreviewImage.style.display = "block";
        locationAddImageText.style.display = "none";
        locationRemoveImageBtn && (locationRemoveImageBtn.style.display = "inline-flex");
    }

    function clearLocationPreview() {
        if (!locationPreviewImage || !locationAddImageText) return;
        locationPreviewImage.src = "";
        locationPreviewImage.style.display = "none";
        locationAddImageText.style.display = "block";
        if (locationRemoveImageBtn) locationRemoveImageBtn.style.display = "none";
        if (locationImageInput) locationImageInput.value = "";
        if (locationThumbnailInput) locationThumbnailInput.value = "";
    }

    function openLocationForm(isEdit = false) {
        locationFormTitle.textContent = isEdit ? "Cập nhật địa điểm" : "Thêm địa điểm";
        locationFormOverlay.style.display = "flex";
        if (typeof syncLocationSelects === "function") {
            syncLocationSelects();
        }
    }

    function closeLocationForm() {
        locationFormOverlay.style.display = "none";
        locationForm.reset();
        locationIdInput.value = "";
        clearLocationPreview();
    }

    locationFormClose?.addEventListener("click", closeLocationForm);
    locationCancelBtn?.addEventListener("click", closeLocationForm);

    addLocationBtn?.addEventListener("click", () => {
        locationForm.reset();
        locationIdInput.value = "";
        clearLocationPreview();
        selectedFile = null;
        openLocationForm(false);
    });

    locationChooseImageBtn?.addEventListener("click", () => {
        locationImageInput?.click();
    });

    locationImageInput?.addEventListener("change", () => {
        const file = locationImageInput.files?.[0];
        if (!file) return;
        selectedFile = file;
        locationThumbnailInput.value = "";
        const reader = new FileReader();
        reader.onload = (e) => {
            const result = e.target.result;
            locationPreviewImage.src = result;
            locationPreviewImage.style.display = "block";
            locationAddImageText.style.display = "none";
            locationRemoveImageBtn && (locationRemoveImageBtn.style.display = "inline-flex");
        };
        reader.readAsDataURL(file);
    });

    locationRemoveImageBtn?.addEventListener("click", (event) => {
        event.preventDefault();
        clearLocationPreview();
        selectedFile = null;
        locationThumbnailInput.value = "";
    });

    locationSaveBtn?.addEventListener("click", async () => {
        const id = locationIdInput.value;
        const payload = {
            code: locationCodeInput.value.trim(),
            name: locationNameInput.value.trim(),
            region_id: locationRegionSelect.value,
            thumbnail: locationThumbnailInput.value.trim(),
            capacity: locationCapacityInput.value ? Number(locationCapacityInput.value) : null,
            area: locationAreaInput.value ? Number(locationAreaInput.value) : null,
            floors: locationFloorsInput.value ? Number(locationFloorsInput.value) : null,
            time_start: locationTimeStartInput.value || null,
            time_end: locationTimeEndInput.value || null,
            status: locationStatusSelect.value,
            map_url: locationMapUrlInput ? locationMapUrlInput.value.trim() : ""
        };

        if (!payload.code || !payload.name || !payload.region_id) {
            showToast("Vui lòng điền đầy đủ mã, tên và khu vực", "warning");
            return;
        }

        const url = id
            ? window.routes.location.updatePattern.replace("__ID__", id)
            : window.routes.location.store;

        let body, headers;
        if (selectedFile) {
            const formData = new FormData();
            for (let key in payload) {
                formData.append(key, payload[key]);
            }
            formData.append('thumbnail', selectedFile);
            body = formData;
            headers = {
                "X-CSRF-TOKEN": csrfToken,
                "Accept": "application/json",
                "X-Requested-With": "XMLHttpRequest"
            };
        } else {
            body = JSON.stringify(payload);
            headers = {
                "Content-Type": "application/json",
                "X-CSRF-TOKEN": csrfToken,
                "Accept": "application/json",
                "X-Requested-With": "XMLHttpRequest"
            };
        }

        try {
            const res = await fetch(url, {
                method: "POST",
                headers,
                body
            });
            const data = await readJsonResponse(res);
            if (res.ok && data.success) {
                showToast(id ? "Cập nhật địa điểm thành công" : "Thêm địa điểm thành công", "success");
                selectedFile = null;
                closeLocationForm();
                setTimeout(() => location.reload(), 600);
            } else {
                showToast(data.message || "Không thể lưu địa điểm", "error");
            }
        } catch (err) {
            console.error(err);
            showToast("Lỗi server", "error");
        }
    });

    applyFilters();
});
