document.addEventListener("DOMContentLoaded", function () {
    const searchInput = document.getElementById("role-search");
    const rows = Array.from(document.querySelectorAll(".role-row"));
    const overlay = document.getElementById("popup-overlay");
    const popup = document.getElementById("popup-role");
    const nameInput = document.getElementById("role-name");
    const saveBtn = document.getElementById("save-role");
    const cancelBtn = document.getElementById("cancel-role");
    const deleteBtn = document.getElementById("delete-role");
    const addBtn = document.getElementById("btnAddRole");

    let editId = null;
    let currentPage = 1;
    const rowsPerPage = 10;

    const filters = {
        keyword: ""
    };

    function notify(message, type = "success") {
        if (typeof showToast === "function") {
            showToast(message, type);
        }
    }

    function applyRoleFilters() {
        rows.forEach(row => {
            let match = true;
            if (filters.keyword) {
                match = row.dataset.name.includes(filters.keyword);
            }

            row.dataset.filtered = match ? "1" : "0";
            row.style.display = match ? "" : "none";

            const detail = document.getElementById(`detail-${row.dataset.id}`);
            if (detail) detail.style.display = "none";
        });

        currentPage = 1;
        renderPagination();
    }

    function getRows() {
        return rows.filter(r => r.dataset.filtered !== "0");
    }

    function renderPagination() {
        const list = getRows();
        const totalPages = Math.ceil(list.length / rowsPerPage) || 1;

        list.forEach(r => r.style.display = "none");

        const start = (currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        list.slice(start, end).forEach(r => r.style.display = "");

        const pageInfo = document.getElementById("pageInfo");
        if (pageInfo) pageInfo.innerText = `Trang ${currentPage} / ${totalPages}`;

        const prevBtn = document.getElementById("prevPage");
        const nextBtn = document.getElementById("nextPage");
        if (prevBtn) prevBtn.disabled = currentPage === 1;
        if (nextBtn) nextBtn.disabled = currentPage === totalPages;

        const paginationContainer = document.getElementById("pagination");
        if (paginationContainer) {
            if (totalPages <= 1) {
                paginationContainer.classList.add("d-none");
            } else {
                paginationContainer.classList.remove("d-none");
            }
        }
    }

    if (searchInput) {
        searchInput.addEventListener("input", e => {
            filters.keyword = e.target.value.trim().toLowerCase();
            applyRoleFilters();
        });
    }

    const prevPage = document.getElementById("prevPage");
    const nextPage = document.getElementById("nextPage");
    if (prevPage) {
        prevPage.addEventListener("click", () => {
            if (currentPage > 1) {
                currentPage--;
                renderPagination();
            }
        });
    }
    if (nextPage) {
        nextPage.addEventListener("click", () => {
            const totalPages = Math.ceil(getRows().length / rowsPerPage) || 1;
            if (currentPage < totalPages) {
                currentPage++;
                renderPagination();
            }
        });
    }

    rows.forEach(r => r.dataset.filtered = "1");
    renderPagination();

    rows.forEach(row => {
        row.addEventListener("click", e => {
            if (e.target.closest("a") || e.target.closest("button")) return;
            const detailRow = document.getElementById(`detail-${row.dataset.id}`);
            if (!detailRow) return;

            document.querySelectorAll(".detail-row").forEach(r => {
                if (r !== detailRow) r.style.display = "none";
            });
            document.querySelectorAll(".role-row").forEach(r => {
                if (r !== row) r.classList.remove("active");
            });

            const isOpen = detailRow.style.display === "table-row";
            detailRow.style.display = isOpen ? "none" : "table-row";
            row.classList.toggle("active", !isOpen);
        });
    });

    function openPopup(mode, id = null, name = "") {
        if (!popup) return;
        const title = document.getElementById("popupTitle");

        if (mode === "add") {
            if (title) title.innerText = "Thêm chức vụ";
            if (deleteBtn) deleteBtn.style.display = "none";
            editId = null;
        } else {
            if (title) title.innerText = "Cập nhật chức vụ";
            if (deleteBtn) deleteBtn.style.display = "inline-block";
            editId = id;
        }

        if (nameInput) nameInput.value = name || "";
        if (overlay) overlay.style.display = "block";
        popup.style.display = "block";
    }

    function closePopup() {
        if (overlay) overlay.style.display = "none";
        if (popup) popup.style.display = "none";
        if (nameInput) nameInput.value = "";
        editId = null;
    }

    if (addBtn) {
        addBtn.addEventListener("click", e => {
            e.preventDefault();
            openPopup("add");
        });
    }

    document.querySelectorAll(".role-update").forEach(btn => {
        btn.addEventListener("click", e => {
            e.preventDefault();
            e.stopPropagation();
            openPopup("edit", btn.dataset.id, btn.dataset.name);
        });
    });

    function deleteRole(id) {
        if (!id) {
            notify("Không có chức vụ để xóa", "error");
            return;
        }
        if (!confirm("Bạn có chắc muốn xóa?")) return;

        const deleteUrl = window.routes.role.delete.replace(":id", id);
        fetch(deleteUrl, {
            method: "DELETE",
            headers: {
                "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]').content
            }
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                notify("Xóa chức vụ thành công", "success");
                setTimeout(() => location.reload(), 600);
            } else {
                notify(data.message || "Xóa thất bại", "error");
            }
        })
        .catch(err => {
            console.error(err);
            notify("Lỗi server", "error");
        });
    }

    document.querySelectorAll(".role-delete").forEach(btn => {
        btn.addEventListener("click", e => {
            e.preventDefault();
            e.stopPropagation();
            deleteRole(btn.dataset.id);
        });
    });

    if (saveBtn) {
        saveBtn.addEventListener("click", () => {
            const name = nameInput.value.trim();
            if (!name) {
                notify("Vui lòng nhập tên chức vụ", "warning");
                return;
            }

            if (editId) {
                const updateUrl = window.routes.role.update.replace(":id", editId);
                fetch(updateUrl, {
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
                        notify("Cập nhật thành công", "success");
                        setTimeout(() => location.reload(), 600);
                    } else {
                        notify(data.message || "Cập nhật thất bại", "error");
                    }
                })
                .catch(err => {
                    console.error(err);
                    notify("Lỗi server", "error");
                });
                return;
            }

            const formData = new FormData();
            formData.append("name", name);

            fetch(window.routes.role.store, {
                method: "POST",
                headers: {
                    "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]').content
                },
                body: formData
            })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    notify("Thêm chức vụ thành công", "success");
                    setTimeout(() => location.reload(), 600);
                } else {
                    notify(data.message || "Thêm thất bại", "error");
                }
            })
            .catch(err => {
                console.error(err);
                notify("Lỗi server", "error");
            });
        });
    }

    if (deleteBtn) {
        deleteBtn.addEventListener("click", () => {
            if (!editId) return;
            deleteRole(editId);
        });
    }

    if (cancelBtn) cancelBtn.addEventListener("click", closePopup);
    if (overlay) overlay.addEventListener("click", closePopup);
});
