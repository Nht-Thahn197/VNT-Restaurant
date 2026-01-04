document.addEventListener("DOMContentLoaded", () => {

    /* ==========================
       CONFIG
    ========================== */
    const BASE_URL = document
        .querySelector('meta[name="base-url"]')
        ?.getAttribute("content") || "";

    const searchInput = document.getElementById("ingredientSearch");
    const suggestBox = document.getElementById("ingredientSuggest");
    const ingredientList = document.getElementById("ingredientList");
    const totalAmountInput = document.getElementById("totalAmount");
    const hiddenInputs = document.getElementById("hiddenInputs");
    const form = document.getElementById("exportForm");

    let selectedIngredients = [];

    /* ==========================
       FORMAT TIỀN
    ========================== */
    const formatMoney = num =>
        Number(num || 0).toLocaleString("vi-VN");

    const unformatMoney = str =>
        Number(str.replace(/\./g, "")) || 0;

    /* ==========================
       RENDER TABLE
    ========================== */
    function renderIngredientTable() {
        ingredientList.innerHTML = selectedIngredients.map((item, index) => `
            <tr>
                <td>${index + 1}</td>
                <td>${item.code}</td>
                <td>
                    ${item.name}
                    <div class="stock-info">
                        Còn: ${item.stock} ${item.unit}
                    </div>
                </td>

                <td>
                    <input type="number" min="0.1" step="0.1"
                           value="${item.qty}"
                           data-id="${item.id}"
                           class="ing-qty">
                    <span>${item.unit}</span>
                </td>

                <td>
                    <input type="text"
                           value="${formatMoney(item.price)}"
                           data-id="${item.id}"
                           class="ing-price">
                </td>

                <td class="ing-total">
                    ${formatMoney(item.qty * item.price)}
                </td>

                <td>
                    <button type="button"
                    class="remove-ingredient-btn"
                    data-id="${item.id}">✖</button>
                </td>
            </tr>
        `).join("");

        bindEvents();
        updateTotalAmount();
    }

    /* ==========================
       BIND EVENTS
    ========================== */
function bindEvents() {

    // ===== QTY =====
    document.querySelectorAll(".ing-qty").forEach(input => {
        input.addEventListener("input", () => {
            const ing = selectedIngredients.find(i => i.id == input.dataset.id);
            let val = parseFloat(input.value) || 0;

            if (val > ing.stock) {
                alert(`Chỉ còn ${ing.stock} ${ing.unit} trong kho`);
                val = ing.stock;
                input.value = ing.stock;
            }

            ing.qty = val;

            const row = input.closest("tr");
            row.querySelector(".ing-total").innerText =
                formatMoney(ing.qty * ing.price);

            updateTotalAmount();
        });
    });

    // ===== PRICE =====
    document.querySelectorAll(".ing-price").forEach(input => {

        // khi gõ → KHÔNG format
        input.addEventListener("input", () => {
            const ing = selectedIngredients.find(i => i.id == input.dataset.id);
            ing.price = Number(input.value.replace(/\D/g,'')) || 0;

            const row = input.closest("tr");
            row.querySelector(".ing-total").innerText =
                formatMoney(ing.qty * ing.price);

            updateTotalAmount();
        });

        // khi rời input → format
        input.addEventListener("blur", () => {
            input.value = formatMoney(unformatMoney(input.value));
        });
    });

    // ===== REMOVE =====
    document.querySelectorAll(".remove-ingredient-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            const id = btn.dataset.id;
            selectedIngredients = selectedIngredients.filter(i => i.id != id);
            renderIngredientTable();
        });
    });
}


    /* ==========================
       TỔNG TIỀN
    ========================== */
    function updateTotalAmount() {
        const total = selectedIngredients.reduce(
            (sum, i) => sum + i.qty * i.price, 0
        );
        totalAmountInput.value = formatMoney(total);
    }

    /* ==========================
       SEARCH INGREDIENT
    ========================== */
    searchInput.addEventListener("input", async () => {
        const keyword = searchInput.value.trim();
        if (!keyword) {
            suggestBox.style.display = "none";
            return;
        }

        try {
            const res = await fetch(
                `${BASE_URL}/pos/ingredients/search?keyword=${keyword}`
            );
            const data = await res.json();

            if (!data.length) {
                suggestBox.innerHTML = `<div class="no-result">Không tìm thấy</div>`;
                suggestBox.style.display = "block";
                return;
            }

            suggestBox.innerHTML = data.map(item => `
                <div class="suggest-item"
                    data-id="${item.id}"
                    data-code="${item.code}"
                    data-name="${item.name}"
                    data-price="${item.last_price}"
                    data-unit="${item.unit}"
                    data-stock="${item.stock_qty}">
                    <strong>${item.name}</strong> - ${item.code}
                    <div class="suggest-sub">
                        Tồn: <b>${item.stock_qty}</b> ${item.unit}
                        • Giá gần nhất: <b>${formatMoney(item.last_price)}</b>
                    </div>
                </div>
            `).join("");

            suggestBox.style.display = "block";
        } catch (e) {
            console.error(e);
        }
    });

    /* ==========================
       CHỌN INGREDIENT
    ========================== */
    suggestBox.addEventListener("click", e => {
        const item = e.target.closest(".suggest-item");
        if (!item) return;

        if (selectedIngredients.some(i => i.id == item.dataset.id)) return;

        selectedIngredients.push({
            id: item.dataset.id,
            code: item.dataset.code,
            name: item.dataset.name,
            unit: item.dataset.unit,
            stock: Number(item.dataset.stock),
            qty: 1,
            price: Number(item.dataset.price) || 0
        });

        renderIngredientTable();
        suggestBox.style.display = "none";
        searchInput.value = "";
    });

    /* ==========================
       SUBMIT FORM
    ========================== */
    form.addEventListener("submit", async e => {
        e.preventDefault();

        if (!selectedIngredients.length) {
            showToast("Chưa có nguyên liệu nào!", "warning");
            return;
        }

        hiddenInputs.innerHTML = "";
        selectedIngredients.forEach((item, index) => {
            hiddenInputs.innerHTML += `
                <input type="hidden" name="items[${index}][ingredient_id]" value="${item.id}">
                <input type="hidden" name="items[${index}][quantity]" value="${item.qty}">
                <input type="hidden" name="items[${index}][price]" value="${item.price}">
            `;
        });

        const formData = new FormData(form);

        try {
            const res = await fetch(form.action, {
                method: form.method,
                body: formData
            });
            const data = await res.json();

            if (data.success) {
                showToast("Xuất hàng thành công!", "success");
                selectedIngredients = [];
                renderIngredientTable(); // reset table
            } else {
                showToast(data.message || "Xuất hàng thất bại!", "error");
            }
        } catch (err) {
            console.error(err);
            showToast("Lỗi server!", "error");
        }
    });

});
