let currentPage = 1;
const rowsPerPage = 10;

const filters = {
  keyword: '',
  category: ''
};


document.documentElement.classList.add('js');

var ingredientSelectControls = [];

var closeIngredientSelectMenus = function () {
  ingredientSelectControls.forEach(function (control) {
    control.close();
  });
};

var syncIngredientSelects = function () {
  ingredientSelectControls.forEach(function (control) {
    control.buildMenu();
    control.updateDisplay();
  });
};

var initIngredientSelect = function (wrapper) {
  if (!wrapper) {
    return;
  }
  var select = wrapper.querySelector('select');
  var trigger = wrapper.querySelector('.ingredient-select-trigger');
  var valueText = wrapper.querySelector('.ingredient-select-value');
  var menu = wrapper.querySelector('.ingredient-select-menu');

  if (!select || !trigger || !valueText || !menu) {
    return;
  }

  var buildMenu = function () {
    menu.innerHTML = '';
    Array.prototype.slice.call(select.options).forEach(function (option) {
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'ingredient-select-item';
      button.textContent = option.text;
      button.dataset.value = option.value;
      if (option.selected) {
        button.classList.add('is-selected');
      }
      button.addEventListener('click', function () {
        select.value = option.value;
        select.dispatchEvent(new Event('change', { bubbles: true }));
        closeIngredientSelectMenus();
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
    closeIngredientSelectMenus();
    if (!isOpen) {
      openMenu();
    }
  });

  menu.addEventListener('click', function (event) {
    event.stopPropagation();
  });

  select.addEventListener('change', updateDisplay);

  ingredientSelectControls.push({
    buildMenu: buildMenu,
    updateDisplay: updateDisplay,
    close: closeMenu
  });

  buildMenu();
  updateDisplay();
};

document.addEventListener('DOMContentLoaded', function () {
  document.querySelectorAll('[data-ingredient-select]').forEach(function (wrapper) {
    initIngredientSelect(wrapper);
  });
  syncIngredientSelects();
});

document.addEventListener('click', closeIngredientSelectMenus);
document.addEventListener('keydown', function (event) {
  if (event.key === 'Escape') {
    closeIngredientSelectMenus();
  }
});

// ===================== Filter & Render =====================
function applyIngredientFilters() {
    const allRows = document.querySelectorAll('.ingredient-item');
    
    allRows.forEach(row => {
        let match = true;

        // 🔍 Search theo name/code (Thêm kiểm tra để tránh lỗi undefined)
        if (filters.keyword) {
            const name = (row.dataset.name || '').toLowerCase();
            const code = (row.dataset.code || '').toLowerCase();
            match = name.includes(filters.keyword) || code.includes(filters.keyword);
        }

        // 📦 Category
        if (match && filters.category) {
            // Lưu ý: dataset.categoryId tương ứng với data-category-id trong HTML
            match = row.dataset.categoryId === filters.category;
        }

        row.dataset.filtered = match ? '1' : '0';
        
        // QUAN TRỌNG: Nếu không khớp, ẩn ngay lập tức để không chiếm chỗ
        if (!match) row.style.display = 'none';
    });

    currentPage = 1;
    renderIngredientPagination();
}

// Lấy các row được phép hiển thị
function getIngredientRows() {
    return Array.from(document.querySelectorAll('.ingredient-item'))
        .filter(row => row.dataset.filtered !== '0');
}

// ===================== Pagination =====================
function renderIngredientPagination() {
    const allRows = document.querySelectorAll('.ingredient-item');
    const filteredRows = getIngredientRows();
    const totalPages = Math.ceil(filteredRows.length / rowsPerPage) || 1;

    if (currentPage > totalPages) currentPage = totalPages;

    // Bước 1: Ẩn TẤT CẢ các hàng trước khi hiển thị trang mới
    allRows.forEach(row => {
        row.style.display = 'none';
        const detail = document.getElementById(`detail-${row.dataset.id}`);
        if (detail) detail.style.display = 'none';
    });

    // Bước 2: Chỉ hiển thị các hàng thuộc trang hiện tại
    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    filteredRows.forEach((row, i) => {
        if (i >= start && i < end) {
            row.style.display = ''; // Hiển thị lại
        }
    });

    // Cập nhật UI phân trang
    const pageInfo = document.getElementById('pageInfo');
    if(pageInfo) pageInfo.innerText = `Trang ${currentPage} / ${totalPages}`;
    
    document.getElementById('prevPage').disabled = (currentPage === 1);
    document.getElementById('nextPage').disabled = (currentPage === totalPages);

    const paginationContainer = document.getElementById('pagination');
    if (totalPages <= 1) {
      paginationContainer.classList.add('d-none');
    } else {
      paginationContainer.classList.remove('d-none');
    }
}

// ===================== Pagination Buttons =====================
document.getElementById('prevPage').onclick = () => {
  if (currentPage > 1) {
    currentPage--;
    renderIngredientPagination();
  }
};
document.getElementById('nextPage').onclick = () => {
  currentPage++;
  renderIngredientPagination();
};

// ===================== Init =====================
document.querySelectorAll('.ingredient-item').forEach(r => r.dataset.filtered = '1');
renderIngredientPagination();

// ===================== Search =====================
document.getElementById('ingredient-search').addEventListener('input', e => {
  filters.keyword = e.target.value.trim().toLowerCase();
  applyIngredientFilters();
});

// ===================== Category Filter =====================
document.querySelectorAll('.category-item').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.category-item').forEach(i => i.classList.remove('active'));
    item.classList.add('active');
    filters.category = item.dataset.category;
    applyIngredientFilters();
  });
});

// Click "Tất cả"
document.querySelector('.group-all').addEventListener('click', () => {
  document.querySelectorAll('.category-item').forEach(i => i.classList.remove('active'));
  filters.category = '';
  applyIngredientFilters();
});

// Category search input
document.querySelector('.group-search').addEventListener('input', e => {
  const keyword = e.target.value.toLowerCase();
  document.querySelectorAll('.category-item').forEach(item => {
    const name = item.querySelector('.cat-name').innerText.toLowerCase();
    item.style.display = name.includes(keyword) ? '' : 'none';
  });
});

//Js open/close category
document.querySelectorAll('.group-box').forEach(box => {
  const arrow = box.querySelector('.group-arrow');
  arrow.addEventListener('click', (e) => {
    e.stopPropagation();
    box.classList.toggle('collapsed');
  });
});

// JS Add Edit Delete Category Ingredient
document.addEventListener("DOMContentLoaded", function () {
  const overlay = document.getElementById("popup-overlay");
  const popup = document.getElementById("popup-add-group");
  const nameInput = document.getElementById("group-name");
  const saveBtn = document.getElementById("save-popup");
  const cancelBtn = document.getElementById("cancel-popup");
  const deleteBtn = document.getElementById("delete-popup");
  const addBtn = document.querySelector(".add-group");
  const showAllBtn = document.getElementById("showAll");
  const storeCategoryUrl = document.querySelector('meta[name="csrf-token"]').dataset.storeUrl;

  let editId = null;

  if (addBtn) {
    addBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      openPopup("add");
    });
  }


  function openPopup(mode, id = null, name = "") {
    if (mode === "add") {
      popup.querySelector("h2").innerText = "Thêm Nhóm Hàng";
      if (deleteBtn) deleteBtn.style.display = "none";
      editId = null;
    } else {
      popup.querySelector("h2").innerText = "Sửa Nhóm Hàng";
      if (deleteBtn) deleteBtn.style.display = "inline-block";
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
    popup.removeAttribute("data-edit-id");
  }

  if (cancelBtn) cancelBtn.addEventListener("click", closePopup);
  if (overlay) overlay.addEventListener("click", closePopup);

  // JS LIST & ADD EDIT DELETE CATEGORY
  document.addEventListener("click", function (e) {
    if (e.target.closest && e.target.closest(".edit-icon")) {
      e.stopPropagation();
      const li = e.target.closest(".category-item");
      if (!li) return;
      const id = li.getAttribute("data-category");
      const name = li.querySelector(".cat-name")?.textContent.trim() || "";
      openPopup("edit", id, name);
      return;
    }
    const cat = e.target.closest && e.target.closest(".category-item");
    if (cat) {
      const categoryId = String(cat.getAttribute("data-category") ?? "");
      document.querySelectorAll(".category-item").forEach(c => c.classList.remove("active"));
      cat.classList.add("active");
      if (showAllBtn) showAllBtn.classList.remove("active");
      loadCategoryItems(categoryId);
      return;
    }
    if (e.target === showAllBtn) {
      document.querySelectorAll(".category-item").forEach(c => c.classList.remove("active"));
      showAllBtn.classList.add("active");
      document.querySelectorAll(".ingredient-item").forEach(r => {
        r.style.display = "";
      });
      return;
    }
  });
  function loadCategoryItems(categoryId) {
    const rows = document.querySelectorAll(".ingredient-item");
    rows.forEach(row => {
      const rowCategory = String(row.getAttribute("data-category-id") ?? "");
      if (rowCategory === categoryId) {
        row.style.display = "";
      } else {
        row.style.display = "none";
      }
    });
  }
  
  if (saveBtn) saveBtn.addEventListener("click", function () {
    const storeCategoryUrl = window.routes.storeCategory;
    const name = nameInput.value.trim();
    if (!name) {
      showToast("Vui lòng nhập tên nhóm!", "warning");
      return;
    }
    if (editId) {
      fetch(`/VNT-Restaurant/public/pos/ingredient-category/update/${editId}`, {
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
          const li = document.querySelector(`.group-list li[data-category="${editId}"]`);
          if (li) li.querySelector(".cat-name").textContent = name;
          closePopup();
          showToast("Cập nhật nhóm thành công", "success");
        } else showToast(data.message || "Cập nhật thất bại", "error");
      })
      .catch(err => {
        console.error(err);
        showToast("Lỗi server!", "error");
      });
      return;
    }
    const formData = new FormData();
    formData.append("name", name);
    fetch(storeCategoryUrl, {
      method: "POST",
      headers: { "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]').content },
      body: formData
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        const ul = document.querySelector(".group-list");
        ul.insertAdjacentHTML("beforeend", `
          <li class="category-item" data-category="${data.category.id}">
            <span class="cat-name">${data.category.name}</span>
            <i class="fa-regular fa-pen-to-square edit-icon"></i>
          </li>
        `);
        closePopup();
        showToast("Thêm nhóm thành công", "success");
      } else showToast(data.message || "Thêm thất bại", "error");
    })
    .catch(err => {
      console.error(err);
      showToast("Lỗi server!", "error");
    });
  });
  if (deleteBtn) deleteBtn.addEventListener("click", function () {
    if (!editId) {
      showToast("Không có nhóm để xóa", "warning");
      return;
    }
    if (!confirm("Bạn có chắc muốn xóa?")) return;
    fetch(`/VNT-Restaurant/public/pos/ingredient-category/delete/${editId}`, {
      method: "DELETE",
      headers: { "X-CSRF-TOKEN": document.querySelector('meta[name="csrf-token"]').content }
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        const li = document.querySelector(`.group-list li[data-category="${editId}"]`);
        if (li) li.remove();
        closePopup();
        showToast("Xóa nhóm thành công", "success");
      } else showToast(data.message || "Xóa thất bại", "error");
    })
    .catch(err => {
      console.error(err);
      alert("Lỗi server!");
      showToast("Lỗi server!", "error");
    });
  });
});

// JS ADD EDIT DELETE INGREDIENT
document.addEventListener("DOMContentLoaded", function () {

    // ====== FORMAT MONEY ======
    function formatMoney(value) {
        if (!value) return "";
        return Number(value).toLocaleString("vi-VN");
    }

    function unformatMoney(value) {
        return value.replace(/\./g, "");
    }

    // ====== ELEMENTS ======
    const btnOpenForm = document.getElementById("btnOpenForm");
    const ingredientFormOverlay = document.getElementById("ingredientFormOverlay");
    const btnCloseHeader = document.getElementById("btnCloseHeader");
    const cancelBtn = document.getElementById("cancelBtn");
    const ingsaveBtn = document.getElementById("ing-save");
    const idInput = document.getElementById("ingredient_id");
    const nameInput = document.getElementById("ingredient_name");
    const categorySelect = document.getElementById("category_id");
    const priceInput = document.getElementById("price");
    const unitInput = document.getElementById("unit");
    const formTitle = document.getElementById("formTitle");
    const csrfToken = document.querySelector('meta[name="csrf-token"]').content;

    const STORE_URL = "/VNT-Restaurant/public/pos/ingredient/store";
    const SHOW_URL = "/VNT-Restaurant/public/pos/ingredient/";
    const UPDATE_URL = "/VNT-Restaurant/public/pos/ingredient/";
    const DELETE_URL = "/VNT-Restaurant/public/pos/ingredient/";

    // ====== OPEN FORM ADD ======
    if (btnOpenForm) btnOpenForm.addEventListener("click", () => {
        resetForm();
        formTitle.textContent = "Thêm Nguyên liệu";
        ingredientFormOverlay.style.display = "flex";
    });

    // ====== CLOSE FORM ======
    function closeForm() {
        ingredientFormOverlay.style.display = "none";
    }
    if (btnCloseHeader) btnCloseHeader.onclick = closeForm;
    if (cancelBtn) cancelBtn.onclick = closeForm;

    // ====== RESET FORM ======
    function resetForm() {
        idInput.value = "";
        nameInput.value = "";
        categorySelect.value = "";
        priceInput.value = "";
        unitInput.value = "";
        syncIngredientSelects();
    }

    // ====== TOGGLE DETAIL ROW ======
    // ====== DROPDOWN DETAIL PRODUCT ======
    const rows = document.querySelectorAll(".ingredient-item");
    rows.forEach(row => {
        row.addEventListener("click", () => {
            const id = row.dataset.id;
            const detailRow = document.getElementById("detail-" + id);

            document.querySelectorAll(".detail-row").forEach(r => { if (r !== detailRow) r.style.display = "none"; });
            document.querySelectorAll(".ingredient-item").forEach(r => { if (r !== row) r.classList.remove("active"); });

            if (!detailRow.style.display || detailRow.style.display === "none") {
                detailRow.style.display = "table-row";
                row.classList.add("active");
            } else {
                detailRow.style.display = "none";
                row.classList.remove("active");
            }
        });
    });

    // ====== EDIT BUTTON ======
    document.querySelectorAll(".ing-update").forEach(btn => {
        btn.addEventListener("click", async function (e) {
            e.preventDefault();
            const id = this.closest(".detail-row").id.replace("detail-", "");

            try {
                const res = await fetch(SHOW_URL + id);
                const json = await res.json();
                if (!json.status) return;

                const ing = json.data;

                idInput.value = ing.id;
                nameInput.value = ing.name;
                categorySelect.value = ing.category_id;
                syncIngredientSelects();

                // ✔ FORMAT PRICE
                priceInput.value = formatMoney(ing.price);

                unitInput.value = ing.unit;

                formTitle.textContent = "Cập nhật nguyên liệu";
                ingredientFormOverlay.style.display = "flex";
            } catch (err) {
                console.error("Lỗi load ingredient:", err);
            }
        });
    });

    // ====== AUTO FORMAT INPUT PRICE WHEN TYPING ======
    priceInput.addEventListener("input", function () {
        let val = this.value.replace(/\D/g, ""); // xóa ký tự không phải số
        this.value = val ? formatMoney(val) : "";
    });

    // ====== SAVE (ADD + UPDATE) ======
    if (ingsaveBtn) ingsaveBtn.addEventListener("click", async () => {

        const id = idInput.value;
        const isEdit = id !== "";
        const url = isEdit ? UPDATE_URL + id + "/update" : STORE_URL;

        const formData = new FormData();
        formData.append("_token", csrfToken);
        formData.append("name", nameInput.value);
        formData.append("category_id", categorySelect.value);

        // ✔ REMOVE DOT BEFORE SEND
        formData.append("price", unformatMoney(priceInput.value));

        formData.append("unit", unitInput.value);

        try {
            const res = await fetch(url, { method: "POST", body: formData });
            const json = await res.json();

            if (json.status) {
                alert(isEdit ? "Cập nhật thành công!" : "Thêm thành công!");
                setTimeout(() => location.reload(), 800);
            }
        } catch (err) {
            console.error("Lỗi lưu:", err);
        }
    });

    // ====== DELETE ======
    document.querySelectorAll(".ing-delete").forEach(btn => {
        btn.addEventListener("click", async function (e) {
            e.preventDefault();

            if (!confirm("Bạn có chắc muốn xóa nguyên liệu này?")) return;

            const id = this.closest(".detail-row").id.replace("detail-", "");

            try {
                const res = await fetch(DELETE_URL + id, {
                    method: "DELETE",
                    headers: { "X-CSRF-TOKEN": csrfToken }
                });

                const json = await res.json();

                if (json.status) {
                    alert("Xóa thành công!");
                    setTimeout(() => location.reload(), 800);
                }
            } catch (err) {
                console.error("Lỗi xóa:", err);
            }
        });
    });

});
