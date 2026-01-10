let currentPage = 1;
const rowsPerPage = 11;

const filters = {
  keyword: '',
  types: [],
  category: ''
};

// ===================== Apply Filter =====================
function applyFilters() {
  const allRows = document.querySelectorAll('.product-item');
  
  allRows.forEach(row => {
    let match = true;

    // 🔍 Search keyword
    if (filters.keyword) {
      const name = row.dataset.name ? row.dataset.name.toLowerCase() : '';
      const code = row.dataset.code ? row.dataset.code.toLowerCase() : '';
      match = name.includes(filters.keyword) || code.includes(filters.keyword);
    }

    // 🍽 Filter types
    if (match && filters.types.length > 0) {
      const rowType = row.dataset.type ? row.dataset.type.toLowerCase() : '';
      match = filters.types.includes(rowType);
    }

    // 📦 Filter category
    if (match && filters.category) {
      match = row.dataset.categoryId === filters.category;
    }

    row.dataset.filtered = match ? '1' : '0';
    // QUAN TRỌNG: Ẩn ngay lập tức những item không khớp filter
    if (!match) row.style.display = 'none'; 
  });

  currentPage = 1;
  renderPagination();
}

// ===================== Get filtered rows =====================
function getFilteredRows() {
  return Array.from(document.querySelectorAll('.product-item'))
    .filter(row => row.dataset.filtered !== '0');
}

// ===================== Pagination =====================
function renderPagination() {
  const allRows = document.querySelectorAll('.product-item');
  const filteredRows = getFilteredRows();
  const totalPages = Math.ceil(filteredRows.length / rowsPerPage) || 1;

  if (currentPage > totalPages) currentPage = totalPages;

  // Bước 1: Ẩn tất cả trước
  allRows.forEach(row => row.style.display = 'none');

  // Bước 2: Chỉ hiển thị những row thuộc trang hiện tại trong danh sách đã lọc
  const start = (currentPage - 1) * rowsPerPage;
  const end = start + rowsPerPage;

  filteredRows.forEach((row, i) => {
    if (i >= start && i < end) {
      row.style.display = ''; // Hiển thị
    }
    
    // Ẩn detail row nếu có
    const detail = document.getElementById(`detail-${row.dataset.id}`);
    if (detail) detail.style.display = 'none';
  });

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

// ===================== Pagination buttons =====================
document.getElementById('prevPage').addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    renderPagination();
  }
});
document.getElementById('nextPage').addEventListener('click', () => {
  currentPage++;
  renderPagination();
});

// ===================== Search input =====================
document.getElementById('product-search').addEventListener('input', e => {
  filters.keyword = e.target.value.trim().toLowerCase();
  applyFilters();
});

// ===================== Type filter =====================
document.querySelectorAll('.filter-content input[type="checkbox"]').forEach(cb => {
  cb.addEventListener('change', () => {
    filters.types = Array.from(document.querySelectorAll('.filter-content input[type="checkbox"]:checked'))
      .map(i => i.value.toLowerCase());
    applyFilters();
  });
});

// ===================== Category filter =====================
document.querySelectorAll('.category-item').forEach(item => {
  item.addEventListener('click', () => {
    document.querySelectorAll('.category-item').forEach(i => i.classList.remove('active'));
    item.classList.add('active');

    filters.category = item.dataset.category;
    applyFilters();
  });
});

// "Tất cả" category
document.querySelector('.group-all').addEventListener('click', () => {
  document.querySelectorAll('.category-item').forEach(i => i.classList.remove('active'));
  filters.category = '';
  applyFilters();
});

// ===================== Init =====================
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.product-item').forEach(r => r.dataset.filtered = '1');
  renderPagination();
});


// Open/close box select type menu
document.querySelectorAll('.filter-box').forEach(box => {
  const arrow = box.querySelector('.arrow');
  const content = box.querySelector('.filter-content');

  arrow.addEventListener('click', (e) => {
    e.stopPropagation();
    box.classList.toggle('collapsed');
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

document.addEventListener('DOMContentLoaded', () => {
  // ====== CẤU HÌNH CHUNG ======
  const BASE_URL = window.location.origin + "/VNT-Restaurant/public/pos";
  const overlay = document.getElementById('productFormOverlay');
  const btnOpen = document.getElementById('btnOpenForm');
  const btnCloseHeader = document.getElementById('btnCloseHeader');
  const cancelBtns = document.querySelectorAll('.prd-cancel');
  const firstFocusable = document.querySelector('#productInfoForm [name="product_name"]');
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');
  const priceInput = document.getElementById("price");
  const searchInput = document.getElementById("ingredientSearch");
  const suggestBox = document.getElementById("ingredientSuggest");
  const ingredientList = document.getElementById("ingredientList");
  const imageBox = document.getElementById("imageBox");
  const imageInput = document.getElementById("imageInput");
  const previewImage = document.getElementById("previewImage");
  const removeImageBtn = document.getElementById("removeImageBtn");
  const addText = document.querySelector(".add-text");

  let selectedIngredients = [];
  let editingProductId = null;

  // ====== FORMAT TIỀN ======
  function formatMoney(value) {
    if (!value) return "";
    return Number(value).toLocaleString("vi-VN");
  }
  function unformatMoney(value) {
    return value.replace(/\./g, "");
  }
  if (priceInput) {
    priceInput.addEventListener("input", () => {
      let raw = priceInput.value.replace(/\./g, "");
      priceInput.value = raw ? Number(raw).toLocaleString("vi-VN") : "";
    });
  }

  // ====== MỞ / ĐÓNG FORM ======
  function openProductForm() {
    overlay.classList.add('active');
    document.body.classList.add('modal-open');
    setTimeout(() => { if (firstFocusable) firstFocusable.focus(); }, 120);
    document.addEventListener('keydown', escHandler);
  }
  function closeProductForm() {
    overlay.classList.remove('active');
    document.body.classList.remove('modal-open');
    document.removeEventListener('keydown', escHandler);
    resetForm();
  }
  function escHandler(e) { if (e.key === 'Escape') closeProductForm(); }
  if (btnOpen) btnOpen.addEventListener('click', e => { e.preventDefault(); openProductForm(); });
  if (btnCloseHeader) btnCloseHeader.addEventListener('click', e => { e.preventDefault(); closeProductForm(); });
  cancelBtns.forEach(b => b.addEventListener('click', e => { e.preventDefault(); closeProductForm(); }));

  // ====== TAB ======
  function activateTab(tabName) {
    tabs.forEach(t => t.classList.remove('active'));
    tabContents.forEach(c => c.classList.remove('active'));
    document.querySelector(`.tab[data-tab="${tabName}"]`)?.classList.add('active');
    document.getElementById(`tab-${tabName}`)?.classList.add('active');
  }
  tabs.forEach(tab => tab.addEventListener('click', () => activateTab(tab.dataset.tab)));

  // ====== RESET FORM ======
  function resetForm() {
    document.getElementById('productInfoForm').reset();
    selectedIngredients = [];
    renderIngredientTable();
    editingProductId = null;
    activateTab("info");
    resetImageBox();
  }

  function resetImageBox() {
    previewImage.src = "";
    previewImage.style.display = "none";
    removeImageBtn.style.display = "none";
    addText.style.display = "block";
    imageInput.value = "";

    document.getElementById('delete_image').value = 0; // reset
  }

  // ====== INGREDIENT TABLE ======
  function renderIngredientTable() {
    ingredientList.innerHTML = selectedIngredients.map((item, index) => `
      <tr>
        <td>${index + 1}</td>
        <td>${item.code}</td>
        <td>${item.name}</td>
        <td><input type="number" min="0.1" step="0.1" value="${item.qty}" data-id="${item.id}" class="ing-qty"><span>${item.unit}</span></td>
        <td>${Number(item.price).toLocaleString()}</td>
        <td class="ing-total">${(item.qty * item.price).toLocaleString()}</td>
        <td><button class="remove-ingredient-btn">✖</button></td>
      </tr>
    `).join('');
    bindQtyEvents();
  }
  function bindQtyEvents() {
    document.querySelectorAll(".ing-qty").forEach(input => {
      input.addEventListener('input', () => {
      const id = input.dataset.id;
      const ing = selectedIngredients.find(x => x.id == id);
      ing.qty = parseFloat(input.value) || 0;
      input.closest('tr').querySelector('.ing-total').textContent = (ing.qty * ing.price).toLocaleString();
      });
    });
  }
  ingredientList.addEventListener("click", e => {
    if (!e.target.classList.contains("remove-ingredient-btn")) return;
    const row = e.target.closest("tr");
    const code = row.children[1].innerText;
    selectedIngredients = selectedIngredients.filter(i => i.code !== code);
    renderIngredientTable();
  });

  // ====== SEARCH INGREDIENT ======
  searchInput.addEventListener("input", async () => {
    const keyword = searchInput.value.trim();
    if (!keyword) { suggestBox.innerHTML = ""; suggestBox.style.display = "none"; return; }
    try {
      const res = await fetch(`${BASE_URL}/ingredients/search?keyword=${keyword}`);
      const data = await res.json();
      if (!data.length) {
        suggestBox.innerHTML = `<div class="no-result">Không tìm thấy</div>`;
        suggestBox.style.display = "block";
        return;
      }
      suggestBox.innerHTML = data.map(item => `
        <div class="suggest-item" data-id="${item.id}" data-name="${item.name}" data-code="${item.code}" data-price="${item.price}" data-unit="${item.unit}">
          <strong>${item.name}</strong> - <span>${item.code}</span>
        </div>
        `).join('');
        suggestBox.style.display = "block";
      } catch (err) { console.error(err); }
  });
  suggestBox.addEventListener("click", e => {
    const item = e.target.closest(".suggest-item");
    if (!item) return;
    if (selectedIngredients.some(x => x.id == item.dataset.id)) { suggestBox.style.display = "none"; searchInput.value = ""; return; }
    selectedIngredients.push({
      id: item.dataset.id,
      code: item.dataset.code,
      name: item.dataset.name,
      price: item.dataset.price,
      unit: item.dataset.unit,
      qty: 1
    });
    renderIngredientTable();
      suggestBox.style.display = "none";
      searchInput.value = "";
    });

    // Click vào ô ảnh => mở file dialog
    imageBox.addEventListener("click", function (e) {
    // Nếu click vào nút X thì không mở input
    if (e.target === removeImageBtn) return;
    imageInput.click();
    });

    // Khi chọn ảnh
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
      }
    });
    // Nút X – xóa ảnh (không đóng form!)
    removeImageBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    e.preventDefault();

    previewImage.src = "";
    previewImage.style.display = "none";
    removeImageBtn.style.display = "none";
    addText.style.display = "block";

    imageInput.value = "";

    // 🔥 Báo backend là user muốn xoá ảnh
    document.getElementById('delete_image').value = 1;
    });

    // ====== SAVE PRODUCT ======
    document.querySelectorAll('#save-popup').forEach(btn => {
      btn.addEventListener('click', async () => {
        const product_name = document.getElementById('product_name').value.trim();
        const category_id = document.getElementById('category_id').value;
        const type_menu_id = document.getElementById('type_menu').value;
        const price = document.getElementById('price').value;
        const unit = document.getElementById('unit').value;
        const file = imageInput.files[0];

        if (!product_name) return showToast('Tên hàng không được để trống', 'warning');

        const formData = new FormData();
        formData.append('_token', document.querySelector('meta[name="csrf-token"]').content);
        formData.append('product_name', product_name);
        formData.append('category_id', category_id);
        formData.append('type_menu_id', type_menu_id);
        formData.append('price', unformatMoney(price));
        formData.append('unit', unit);
        formData.append('ingredients', JSON.stringify(selectedIngredients));
        formData.append('delete_image', document.getElementById('delete_image').value);
        if (file) formData.append('img', file);

        const url = editingProductId ? `${BASE_URL}/products/${editingProductId}/update` : `${BASE_URL}/products/store`;
        try {
          const res = await fetch(url, { method: 'POST', body: formData });
          const data = await res.json();
          if (data.status) {
            showToast('Lưu sản phẩm thành công', 'success');
            closeProductForm();
            setTimeout(() => {
                location.reload();
            }, 800);
          } else {
            showToast('Lưu thất bại', 'error');
          }
        } catch (err) { console.error('Lỗi lưu sản phẩm:', err); 
          showToast('Lỗi server!', 'error');
        }
      });
    });

    // ====== EDIT PRODUCT ======
    document.querySelectorAll('.prd-update').forEach(btn => {
      btn.addEventListener('click', async e => {
        e.preventDefault();
        e.stopPropagation();
        const detailRow = btn.closest('.detail-row');
        const id = detailRow.id.replace('detail-', '');
        editingProductId = id;

        try {
          const res = await fetch(`${BASE_URL}/products/${id}`);
          const data = await res.json();
          const p = data.product;
          // LOAD ẢNH CŨ
          resetImageBox();

          if (p.img) {
            const fullPath = `${window.location.origin}/VNT-Restaurant/public/${p.img}`;
            previewImage.src = fullPath;
            previewImage.style.display = "block";
            removeImageBtn.style.display = "block";
            addText.style.display = "none";
          }
          document.getElementById('product_name').value = p.name;
          document.getElementById('category_id').value = p.category_id;
          document.getElementById('type_menu').value = p.type_menu;
          document.getElementById('price').value = formatMoney(p.price);
          document.getElementById('unit').value = p.unit;

          selectedIngredients = data.ingredients.map(ing => ({
            id: ing.id,
            code: ing.code,
            name: ing.name,
            price: parseFloat(ing.price) || 0,
            unit: ing.unit,
            qty: parseFloat(ing.qty ?? ing.quantity) || 0
          }));
          renderIngredientTable();
          openProductForm();
        } catch (err) { console.error('Lỗi load sản phẩm:', err); 
          showToast('Lỗi server!', 'error');
        }
      });
    });

    // ====== DELETE PRODUCT ======
    document.querySelectorAll('.prd-delete').forEach(btn => {
        btn.addEventListener('click', async e => {
            e.preventDefault();
            e.stopPropagation();
            const detailRow = btn.closest('.detail-row');
            if (!detailRow) return;
            const id = detailRow.id.replace('detail-', '');
            if (!id) return;
            if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;

            try {
                const res = await fetch(`${BASE_URL}/products/${id}`, {
                    method: 'DELETE',
                    headers: { 
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                        'Accept': 'application/json'
                    }
                });
                const data = await res.json();
                if (data.status) {
                    showToast('Xóa sản phẩm thành công', 'success');
                    const productRow = detailRow.previousElementSibling;
                    productRow?.remove();
                    detailRow.remove();
                } else {
                  showToast('Xóa thất bại', 'error');
                }
            } catch (err) { console.error('Lỗi xóa sản phẩm:', err); 
              showToast('Lỗi server!', 'error');
            }
        });
    });

    // ====== DROPDOWN DETAIL PRODUCT ======
    const rows = document.querySelectorAll(".product-item");
    rows.forEach(row => {
        row.addEventListener("click", () => {
            const id = row.dataset.id;
            const detailRow = document.getElementById("detail-" + id);

            document.querySelectorAll(".detail-row").forEach(r => { if (r !== detailRow) r.style.display = "none"; });
            document.querySelectorAll(".product-item").forEach(r => { if (r !== row) r.classList.remove("active"); });

            if (!detailRow.style.display || detailRow.style.display === "none") {
                detailRow.style.display = "table-row";
                row.classList.add("active");
            } else {
                detailRow.style.display = "none";
                row.classList.remove("active");
            }
        });
    });
});

// JS Add Edit Delete Category Product
document.addEventListener("DOMContentLoaded", function () {
  const overlay = document.getElementById("popup-overlay");
  const popup = document.getElementById("popup-add-group");
  const nameInput = document.getElementById("group-name");
  const saveBtn = document.getElementById("cat-save");
  const cancelBtn = document.getElementById("cat-cancel");
  const deleteBtn = document.getElementById("cat-delete");
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
      document.querySelectorAll(".product-item").forEach(r => {
        r.style.display = "";
      });
      return;
    }
  });

  function loadCategoryItems(categoryId) {
    const rows = document.querySelectorAll(".product-item");
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
    const name = nameInput.value.trim();
    if (!name) {
      showToast("Vui lòng nhập tên nhóm!", "warning");
      return;
    }
    if (editId) {
      fetch(`/VNT-Restaurant/public/pos/product-category/update/${editId}`, {
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
    const storeCategoryUrl = window.routes.storeCategory;
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
    fetch(`/VNT-Restaurant/public/pos/product-category/delete/${editId}`, {
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

