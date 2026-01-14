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
    const form = document.getElementById("importForm");
    const timeInput = document.getElementById("import_time_display");
    const timeHiddenInput = document.getElementById("import_time");

    let selectedIngredients = [];

    /* ==========================
       DATETIME PICKER
    ========================== */
    if (timeInput && window.jQuery && jQuery.fn && jQuery.fn.daterangepicker) {
        const $timeInput = jQuery(timeInput);
        const syncTimeInputs = function (momentValue) {
            if (!momentValue) {
                return;
            }
            const displayValue = momentValue.format("DD/MM/YYYY HH:mm");
            $timeInput.val(displayValue);
            if (timeHiddenInput) {
                timeHiddenInput.value = momentValue.format("YYYY-MM-DD HH:mm");
            }
        };

        const setupMonthYearControls = function (picker) {
            if (!picker || !picker.container) {
                return;
            }
            const calendar = picker.container.find(".drp-calendar").first();
            const headerCell = picker.container.find(".calendar-table th.month");
            if (!headerCell.length || !calendar.length) {
                return;
            }
            headerCell.attr("colspan", 7);
            if (!headerCell.find(".vnt-month-year").length) {
                headerCell.empty().append(`
                    <div class="vnt-month-year">
                        <button type="button" class="vnt-nav vnt-prev" aria-label="Prev month">&#10094;</button>
                        <button type="button" class="vnt-title" aria-haspopup="true" aria-expanded="false"></button>
                        <button type="button" class="vnt-nav vnt-next" aria-label="Next month">&#10095;</button>
                    </div>
                `);
            }
            if (!calendar.find(".vnt-panel").length) {
                calendar.append(`
                    <div class="vnt-panel">
                        <div class="vnt-month-grid"></div>
                        <div class="vnt-year-list"></div>
                    </div>
                `);
            }

            const header = headerCell.find(".vnt-month-year");
            const titleBtn = header.find(".vnt-title");
            const monthGrid = calendar.find(".vnt-month-grid");
            const yearList = calendar.find(".vnt-year-list");

            const monthNames = [
                "Tháng Giêng", "Tháng Hai", "Tháng Ba", "Tháng Tư",
                "Tháng Năm", "Tháng Sáu", "Tháng Bảy", "Tháng Tám",
                "Tháng Chín", "Tháng Mười", "Tháng Mười Một", "Tháng Mười Hai"
            ];
            const monthShorts = [
                "Thg1", "Thg2", "Thg3", "Thg4", "Thg5", "Thg6",
                "Thg7", "Thg8", "Thg9", "Thg10", "Thg11", "Thg12"
            ];

            const getView = function () {
                return picker.container.data("vnt-view") || "day";
            };

            const buildMonthGrid = function () {
                const current = picker.leftCalendar.month.clone();
                monthGrid.html(monthShorts.map((label, index) => {
                    const isSelected = index === current.month();
                    return `<button type="button" class="vnt-month-item${isSelected ? " is-selected" : ""}" data-month="${index}">${label}</button>`;
                }).join(""));
            };

            const buildYearList = function () {
                const current = picker.leftCalendar.month.clone();
                const range = 12;
                let startYear = Number(picker.container.data("vnt-year-start"));
                if (!startYear || Number.isNaN(startYear)) {
                    startYear = current.year() - Math.floor(range / 2);
                }
                const endYear = startYear + range - 1;
                picker.container.data("vnt-year-start", startYear);
                const items = [];
                for (let year = startYear; year <= endYear; year++) {
                    const isSelected = year === current.year();
                    items.push(`<button type="button" class="vnt-year-item${isSelected ? " is-selected" : ""}" data-year="${year}">${year}</button>`);
                }
                yearList.html(items.join(""));
                return { startYear: startYear, endYear: endYear };
            };

            const updateTitle = function (view) {
                const current = picker.leftCalendar.month.clone();
                if (view === "day") {
                    titleBtn.text(`${monthNames[current.month()]} ${current.year()}`);
                } else {
                    titleBtn.text(`${current.year()}`);
                }
                titleBtn.attr("aria-expanded", view !== "day");
            };

            const applyView = function (view) {
                picker.container
                    .removeClass("vnt-view-day vnt-view-month vnt-view-year")
                    .addClass(`vnt-view-${view}`)
                    .data("vnt-view", view);
                calendar
                    .removeClass("vnt-view-day vnt-view-month vnt-view-year")
                    .addClass(`vnt-view-${view}`);
                if (view === "month") {
                    buildMonthGrid();
                }
                if (view === "year") {
                    buildYearList();
                }
                updateTitle(view);
            };

            const setCurrentDate = function (momentValue, viewAfter) {
                if (viewAfter) {
                    picker.container.data("vnt-view", viewAfter);
                }
                picker.setStartDate(momentValue);
                picker.setEndDate(momentValue);
                picker.updateCalendars();
                syncTimeInputs(momentValue);
            };

            applyView(getView());

            header.off("click.vntMonthYear");
            header.on("click.vntMonthYear", ".vnt-prev", function (event) {
                event.preventDefault();
                const view = getView();
                if (view === "year") {
                    const range = 12;
                    let startYear = Number(picker.container.data("vnt-year-start"));
                    if (!startYear || Number.isNaN(startYear)) {
                        startYear = picker.leftCalendar.month.year() - Math.floor(range / 2);
                    }
                    picker.container.data("vnt-year-start", startYear - range);
                    applyView("year");
                    return;
                }
                const unit = view === "month" ? "year" : "month";
                const current = picker.leftCalendar.month.clone().subtract(1, unit);
                picker.leftCalendar.month = current;
                picker.updateCalendars();
                picker.container.data("vnt-view", view);
            });
            header.on("click.vntMonthYear", ".vnt-next", function (event) {
                event.preventDefault();
                const view = getView();
                if (view === "year") {
                    const range = 12;
                    let startYear = Number(picker.container.data("vnt-year-start"));
                    if (!startYear || Number.isNaN(startYear)) {
                        startYear = picker.leftCalendar.month.year() - Math.floor(range / 2);
                    }
                    picker.container.data("vnt-year-start", startYear + range);
                    applyView("year");
                    return;
                }
                const unit = view === "month" ? "year" : "month";
                const current = picker.leftCalendar.month.clone().add(1, unit);
                picker.leftCalendar.month = current;
                picker.updateCalendars();
                picker.container.data("vnt-view", view);
            });
            header.on("click.vntMonthYear", ".vnt-title", function (event) {
                event.preventDefault();
                const view = getView();
                if (view === "day") {
                    applyView("month");
                    return;
                }
                if (view === "month") {
                    applyView("year");
                    return;
                }
                applyView("month");
            });

            monthGrid.off("click.vntMonthGrid").on("click.vntMonthGrid", ".vnt-month-item", function (event) {
                event.preventDefault();
                const monthIndex = Number(jQuery(this).data("month"));
                const base = picker.startDate ? picker.startDate.clone() : picker.leftCalendar.month.clone();
                base.month(monthIndex);
                setCurrentDate(base, "day");
            });

            yearList.off("click.vntYearList").on("click.vntYearList", ".vnt-year-item", function (event) {
                event.preventDefault();
                const yearValue = Number(jQuery(this).data("year"));
                const base = picker.startDate ? picker.startDate.clone() : picker.leftCalendar.month.clone();
                base.year(yearValue);
                setCurrentDate(base, "month");
            });
        };

        const setupTimeSelectControls = function (picker) {
            if (!picker || !picker.container) {
                return;
            }
            const timeWrap = picker.container.find(".calendar-time");
            if (!timeWrap.length) {
                return;
            }

            const closeTimeMenus = function () {
                timeWrap.find(".vnt-time-select.open").each(function () {
                    const wrapper = jQuery(this);
                    wrapper.removeClass("open");
                    wrapper.find(".vnt-time-trigger").attr("aria-expanded", "false");
                });
            };

            timeWrap.find(".vnt-time-select").remove();

            timeWrap.find("select").each(function () {
                const select = jQuery(this);
                const isHour = select.hasClass("hourselect");
                const isMinute = select.hasClass("minuteselect");
                const type = isHour ? "hour" : (isMinute ? "minute" : "ampm");

                select.addClass("vnt-native-time");
                select.off("change.vntTime");

                const wrapper = jQuery(`
                    <div class="vnt-time-select" data-type="${type}">
                        <button type="button" class="vnt-time-trigger" aria-haspopup="true" aria-expanded="false"></button>
                        <div class="vnt-time-menu" role="listbox"></div>
                    </div>
                `);

                select.after(wrapper);

                const trigger = wrapper.find(".vnt-time-trigger");
                const menu = wrapper.find(".vnt-time-menu");

                const buildMenu = function () {
                    const items = select.find("option").map(function () {
                        const option = jQuery(this);
                        const value = option.val();
                        const text = option.text();
                        return `<button type="button" class="vnt-time-option" data-value="${value}" role="option">${text}</button>`;
                    }).get();
                    menu.html(items.join(""));
                };

                const updateTrigger = function () {
                    const selected = select.find("option:selected");
                    const value = selected.val();
                    trigger.text(selected.text());
                    menu.find(".vnt-time-option").removeClass("is-selected");
                    menu.find(`.vnt-time-option[data-value="${value}"]`).addClass("is-selected");
                };

                trigger.on("click", function (event) {
                    event.preventDefault();
                    event.stopPropagation();
                    const isOpen = wrapper.hasClass("open");
                    closeTimeMenus();
                    if (!isOpen) {
                        wrapper.addClass("open");
                        trigger.attr("aria-expanded", "true");
                    }
                });

                menu.on("click", ".vnt-time-option", function (event) {
                    event.preventDefault();
                    const value = jQuery(this).data("value");
                    select.val(value).trigger("change");
                    updateTrigger();
                    closeTimeMenus();
                });

                menu.on("click", function (event) {
                    event.stopPropagation();
                });

                select.on("change.vntTime", updateTrigger);

                buildMenu();
                updateTrigger();
            });

            jQuery(document).off("click.vntTimeDropdown").on("click.vntTimeDropdown", function (event) {
                if (!jQuery(event.target).closest(".vnt-time-select").length) {
                    closeTimeMenus();
                }
            });
        };

        const patchPickerUpdate = function (picker) {
            if (!picker || picker._vntPatched) {
                return;
            }
            const originalUpdate = picker.updateCalendars;
            picker.updateCalendars = function () {
                const result = originalUpdate.call(picker);
                setupMonthYearControls(picker);
                setupTimeSelectControls(picker);
                return result;
            };
            if (typeof picker.renderTimePicker === "function") {
                const originalRenderTime = picker.renderTimePicker;
                picker.renderTimePicker = function () {
                    const result = originalRenderTime.apply(picker, arguments);
                    setupTimeSelectControls(picker);
                    return result;
                };
            }
            picker._vntPatched = true;
        };

        $timeInput.daterangepicker({
            singleDatePicker: true,
            timePicker: true,
            timePicker24Hour: true,
            autoUpdateInput: false,
            showDropdowns: false,
            autoApply: true,
            locale: {
                format: "DD/MM/YYYY HH:mm"
            }
        }, function (start) {
            syncTimeInputs(start);
        });

        $timeInput.off("click.daterangepicker");
        $timeInput.off("focus.daterangepicker");

        $timeInput.on("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            const picker = jQuery(this).data("daterangepicker");
            if (!picker) {
                return;
            }
            if (picker.isShowing) {
                picker.hide();
            } else {
                picker.show();
            }
        });

        $timeInput.on("show.daterangepicker", function (event, picker) {
            patchPickerUpdate(picker);
            setupMonthYearControls(picker);
            setupTimeSelectControls(picker);
        });

        $timeInput.on("change", function () {
            if (!timeHiddenInput || !window.moment) {
                return;
            }
            const parsed = moment($timeInput.val(), "DD/MM/YYYY HH:mm", true);
            if (parsed.isValid()) {
                syncTimeInputs(parsed);
            }
        });
    }

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
                <td>${item.name}</td>

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
            ing.qty = parseFloat(input.value) || 0;

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
                    data-unit="${item.unit}">
                    <strong>${item.name}</strong> - ${item.code}
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
                showToast("Nhập hàng thành công!", "success");
                // Nếu muốn reset form:
                selectedIngredients = [];
                renderIngredientTable();
            } else {
                showToast(data.message || "Nhập hàng thất bại!", "error");
            }
        } catch (err) {
            console.error(err);
            showToast("Lỗi server!", "error");
        }
    });
});
