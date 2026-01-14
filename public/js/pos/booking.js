document.documentElement.classList.add('js');

var bookingSelectControls = [];

var closeBookingSelectMenus = function () {
    bookingSelectControls.forEach(function (control) {
        control.close();
    });
};

var syncBookingSelects = function () {
    bookingSelectControls.forEach(function (control) {
        control.buildMenu();
        control.updateDisplay();
    });
};

var initBookingSelect = function (wrapper) {
    if (!wrapper) {
        return;
    }
    var select = wrapper.querySelector('select');
    var trigger = wrapper.querySelector('.booking-select-trigger');
    var valueText = wrapper.querySelector('.booking-select-value');
    var menu = wrapper.querySelector('.booking-select-menu');

    if (!select || !trigger || !valueText || !menu) {
        return;
    }

    var buildMenu = function () {
        menu.innerHTML = '';
        Array.prototype.slice.call(select.options).forEach(function (option) {
            var button = document.createElement('button');
            button.type = 'button';
            button.className = 'booking-select-item';
            button.textContent = option.text;
            button.dataset.value = option.value;
            if (option.selected) {
                button.classList.add('is-selected');
            }
            button.addEventListener('click', function () {
                select.value = option.value;
                select.dispatchEvent(new Event('change', { bubbles: true }));
                closeBookingSelectMenus();
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
        closeBookingSelectMenus();
        if (!isOpen) {
            openMenu();
        }
    });

    menu.addEventListener('click', function (event) {
        event.stopPropagation();
    });

    select.addEventListener('change', updateDisplay);

    bookingSelectControls.push({
        buildMenu: buildMenu,
        updateDisplay: updateDisplay,
        close: closeMenu
    });

    buildMenu();
    updateDisplay();
};

document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('[data-booking-select]').forEach(function (wrapper) {
        initBookingSelect(wrapper);
    });
    syncBookingSelects();
});

document.addEventListener('click', closeBookingSelectMenus);
document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
        closeBookingSelectMenus();
    }
});

// ===== CONFIG =====
const BASE_URL = document
    .querySelector('meta[name="base-url"]')
    .getAttribute('content');

const CSRF_TOKEN = document
    .querySelector('meta[name="csrf-token"]')
    .getAttribute('content');

// ===== ELEMENTS =====
const menuBtn = document.getElementById('menuBtn');
const dropdownMenu = document.getElementById('dropdownMenu');
const logoutLink = document.getElementById('logoutLink');
const modal = document.getElementById('bookingModal');
const btnCreate = document.querySelector('.btn-create');
const btnClose = document.getElementById('closeBookingModal');
const btnCancel = document.getElementById('cancelBooking');

const phoneInput = document.querySelector('input[name="phone"]');
const nameInput = document.querySelector('input[name="customer_name"]');
const customerIdInput = document.querySelector('input[name="customer_id"]');

const preorderModal = document.getElementById('preorderModal');
const btnAddPreorder = document.getElementById('btnAddPreorder');
const closePreorderModal = document.getElementById('closePreorderModal');
const cancelPreorder = document.getElementById('cancelPreorder');

const searchInput = document.getElementById('searchPreorderProduct');
const listEl = document.getElementById('preorderProductList');
const searchResultBox = document.getElementById('preorderSearchResult');

const savePreorderBtn = document.getElementById('savePreorder');
const cancelBookingBtn = document.getElementById('cancelBookingBtn');
const statusCheckboxes = document.querySelectorAll('.status-checkbox');
const arrivalTimeDisplay = document.getElementById('arrival_time_display');
const arrivalTimeHidden = document.getElementById('arrival_time');
const bookingTableSelect = document.getElementById('table_id');

nameInput.disabled = true;
let preorderItems = {};
let phoneTimeout = null;
let searchTimeout = null;
let lastSearchKeyword = '';
let currentBookingId = null;

const parseBookingTime = (value) => {
    if (!value) return null;
    if (window.moment) {
        const parsed = moment(value, [
            moment.ISO_8601,
            'YYYY-MM-DD HH:mm:ss',
            'YYYY-MM-DD HH:mm',
            'YYYY-MM-DDTHH:mm',
            'DD/MM/YYYY HH:mm'
        ], true);
        if (parsed.isValid()) return parsed;
    }
    const date = new Date(value);
    return isNaN(date.getTime()) ? null : date;
};

const formatBookingTimeForHidden = (value) => {
    const parsed = parseBookingTime(value);
    if (!parsed) return '';
    if (window.moment && parsed.format) {
        return parsed.format('YYYY-MM-DD HH:mm');
    }
    const yyyy = parsed.getFullYear();
    const mm = String(parsed.getMonth() + 1).padStart(2, '0');
    const dd = String(parsed.getDate()).padStart(2, '0');
    const hh = String(parsed.getHours()).padStart(2, '0');
    const min = String(parsed.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd} ${hh}:${min}`;
};

const formatBookingTimeForDisplay = (value) => {
    const parsed = parseBookingTime(value);
    if (!parsed) return '';
    if (window.moment && parsed.format) {
        return parsed.format('DD/MM/YYYY HH:mm');
    }
    const dd = String(parsed.getDate()).padStart(2, '0');
    const mm = String(parsed.getMonth() + 1).padStart(2, '0');
    const yyyy = parsed.getFullYear();
    const hh = String(parsed.getHours()).padStart(2, '0');
    const min = String(parsed.getMinutes()).padStart(2, '0');
    return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
};

const syncArrivalTimeDisplay = () => {
    if (!arrivalTimeHidden || !arrivalTimeDisplay) return;
    if (!arrivalTimeHidden.value) {
        arrivalTimeDisplay.value = '';
        return;
    }
    arrivalTimeDisplay.value = formatBookingTimeForDisplay(arrivalTimeHidden.value);
    if (window.jQuery && window.moment) {
        const picker = jQuery(arrivalTimeDisplay).data('daterangepicker');
        const parsed = moment(arrivalTimeHidden.value, ['YYYY-MM-DD HH:mm', 'YYYY-MM-DD HH:mm:ss'], true);
        if (picker && parsed.isValid()) {
            picker.setStartDate(parsed);
            picker.setEndDate(parsed);
        }
    }
};

const initArrivalTimePicker = () => {
    if (!arrivalTimeDisplay || !arrivalTimeHidden) return;
    if (!window.jQuery || !jQuery.fn || !jQuery.fn.daterangepicker) return;

    const $arrivalInput = jQuery(arrivalTimeDisplay);
    const syncArrivalTimeInputs = (momentValue) => {
        if (!momentValue) return;
        $arrivalInput.val(momentValue.format('DD/MM/YYYY HH:mm'));
        arrivalTimeHidden.value = momentValue.format('YYYY-MM-DD HH:mm');
    };
    const ensureArrivalPickerValue = (picker) => {
        if (!picker || !window.moment) return;
        const currentValue = $arrivalInput.val().trim();
        if (currentValue) return;
        const now = moment();
        picker.setStartDate(now);
        picker.setEndDate(now);
        if (typeof picker.updateCalendars === 'function') {
            picker.updateCalendars();
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
            return { startYear, endYear };
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
        };

        const setCurrentDate = (momentValue, viewAfter) => {
            if (viewAfter) {
                picker.container.data('vnt-view', viewAfter);
            }
            picker.setStartDate(momentValue);
            picker.setEndDate(momentValue);
            picker.updateCalendars();
            syncArrivalTimeInputs(momentValue);
        };

        const currentView = getView();
        applyView(currentView);

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
            const current = picker.leftCalendar.month.clone().subtract(1, view === 'month' ? 'year' : 'month');
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
            const current = picker.leftCalendar.month.clone().add(1, view === 'month' ? 'year' : 'month');
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

    const setupTimeSelectControls = (picker) => {
        if (!picker || !picker.container) return;
        const timeWrap = picker.container.find('.calendar-time');
        if (!timeWrap.length) return;

        const closeTimeMenus = () => {
            timeWrap.find('.vnt-time-select.open').each(function () {
                const wrapper = jQuery(this);
                wrapper.removeClass('open');
                wrapper.find('.vnt-time-trigger').attr('aria-expanded', 'false');
            });
        };

        timeWrap.find('.vnt-time-select').remove();

        timeWrap.find('select').each(function () {
            const select = jQuery(this);
            const isHour = select.hasClass('hourselect');
            const isMinute = select.hasClass('minuteselect');
            const type = isHour ? 'hour' : (isMinute ? 'minute' : 'ampm');

            select.addClass('vnt-native-time');
            select.off('change.vntTime');

            const wrapper = jQuery(`
                <div class="vnt-time-select" data-type="${type}">
                    <button type="button" class="vnt-time-trigger" aria-haspopup="true" aria-expanded="false"></button>
                    <div class="vnt-time-menu" role="listbox"></div>
                </div>
            `);

            select.after(wrapper);

            const trigger = wrapper.find('.vnt-time-trigger');
            const menu = wrapper.find('.vnt-time-menu');

            const buildMenu = () => {
                const items = select.find('option').map(function () {
                    const option = jQuery(this);
                    const value = option.val();
                    const text = option.text();
                    return `<button type="button" class="vnt-time-option" data-value="${value}" role="option">${text}</button>`;
                }).get();
                menu.html(items.join(''));
            };

            const updateTrigger = () => {
                const selected = select.find('option:selected');
                const value = selected.val();
                trigger.text(selected.text());
                menu.find('.vnt-time-option').removeClass('is-selected');
                menu.find(`.vnt-time-option[data-value="${value}"]`).addClass('is-selected');
            };

            trigger.on('click', (event) => {
                event.preventDefault();
                event.stopPropagation();
                const isOpen = wrapper.hasClass('open');
                closeTimeMenus();
                if (!isOpen) {
                    wrapper.addClass('open');
                    trigger.attr('aria-expanded', 'true');
                }
            });

            menu.on('click', '.vnt-time-option', function (event) {
                event.preventDefault();
                const value = jQuery(this).data('value');
                select.val(value).trigger('change');
                updateTrigger();
                closeTimeMenus();
            });

            menu.on('click', function (event) {
                event.stopPropagation();
            });

            select.on('change.vntTime', updateTrigger);

            buildMenu();
            updateTrigger();
        });

        jQuery(document).off('click.vntTimeDropdown').on('click.vntTimeDropdown', (event) => {
            if (!jQuery(event.target).closest('.vnt-time-select').length) {
                closeTimeMenus();
            }
        });
    };

    const repositionArrivalPicker = (picker) => {
        if (!picker || !arrivalTimeDisplay) return;
        if (!picker.container || !picker.container.length) return;
        const inputRect = arrivalTimeDisplay.getBoundingClientRect();
        const pickerEl = picker.container[0];
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        const spaceBelow = viewportHeight - inputRect.bottom;
        const spaceAbove = inputRect.top;
        const pickerHeight = pickerEl.offsetHeight || 0;
        const desired = spaceBelow < pickerHeight && spaceAbove > spaceBelow ? 'up' : 'down';
        if (picker.drops !== desired) {
            picker.drops = desired;
        }
        if (typeof picker.move === 'function') {
            picker.move();
        }
    };

    const patchPickerUpdate = (picker) => {
        if (!picker || picker._vntPatched) return;
        const originalUpdate = picker.updateCalendars;
        picker.updateCalendars = function () {
            const result = originalUpdate.call(picker);
            setupMonthYearControls(picker);
            setupTimeSelectControls(picker);
            repositionArrivalPicker(picker);
            return result;
        };
        if (typeof picker.renderTimePicker === 'function') {
            const originalRenderTime = picker.renderTimePicker;
            picker.renderTimePicker = function () {
                const result = originalRenderTime.apply(picker, arguments);
                setupTimeSelectControls(picker);
                repositionArrivalPicker(picker);
                return result;
            };
        }
        picker._vntPatched = true;
    };

    $arrivalInput.daterangepicker({
        singleDatePicker: true,
        timePicker: true,
        timePicker24Hour: true,
        autoUpdateInput: false,
        showDropdowns: false,
        autoApply: true,
        parentEl: '#bookingModal',
        opens: 'left',
        locale: {
            format: 'DD/MM/YYYY HH:mm'
        }
    }, function (start) {
        syncArrivalTimeInputs(start);
    });

    $arrivalInput.off('click.daterangepicker');
    $arrivalInput.off('focus.daterangepicker');

    $arrivalInput.on('click', function (event) {
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

    $arrivalInput.on('show.daterangepicker', function (event, picker) {
        patchPickerUpdate(picker);
        ensureArrivalPickerValue(picker);
        setupMonthYearControls(picker);
        setupTimeSelectControls(picker);
        repositionArrivalPicker(picker);
    });

    $arrivalInput.off('apply.daterangepicker');
    $arrivalInput.on('apply.daterangepicker', function (event, picker) {
        if (!picker || !picker.startDate) return;
        ensureArrivalPickerValue(picker);
        syncArrivalTimeInputs(picker.startDate.clone ? picker.startDate.clone() : picker.startDate);
    });

    $arrivalInput.on('change', function () {
        if (!window.moment) {
            return;
        }
        const parsed = moment($arrivalInput.val(), 'DD/MM/YYYY HH:mm', true);
        if (parsed.isValid()) {
            syncArrivalTimeInputs(parsed);
        }
    });

    syncArrivalTimeDisplay();
};

document.addEventListener('DOMContentLoaded', () => {
    const btnTime = document.getElementById('timeBtn');
    const menuTime = document.getElementById('timeMenu');
    const inputSearch = document.querySelectorAll('.sidebar .input-text');
    const rows = document.querySelectorAll('.booking-info');
    const btnTable = document.getElementById('tableBtn');
    const tableSearch = document.getElementById('tableSearch');

    initArrivalTimePicker();
    
    let currentPage = 1;
    const rowsPerPage = 15;

    window.filters = {
        code: '',
        name: '',
        phone: '',
        from: null,
        to: null,
        tableId: 'all',
        status: ['waiting', 'assigned', 'received']
    };

    btnTime.addEventListener('click', (e) => {
        e.stopPropagation();
        btnTime.parentElement.classList.toggle('open');
    });

    btnTable.addEventListener('click', (e) => {
        e.stopPropagation();
        document.getElementById('timeBtn').parentElement.classList.remove('open');
        btnTable.parentElement.classList.toggle('open');
    });

    tableSearch.addEventListener('input', function() {
        const val = this.value.toLowerCase();
        document.querySelectorAll('.table-item').forEach(item => {
            const text = item.innerText.toLowerCase();
            item.style.display = text.includes(val) ? '' : 'none';
        });
    });

    document.addEventListener('click', e => {
        if (!btnTime.parentElement.contains(e.target)) {
            btnTime.parentElement.classList.remove('open');
        }

        if (btnTable && !btnTable.parentElement.contains(e.target)) {
            btnTable.parentElement.classList.remove('open');
        }
    });

    document.querySelectorAll('.time-item').forEach(item => {
        item.addEventListener('click', () => {
            const preset = item.dataset.preset;
            btnTime.innerHTML = `${item.innerText} <i class="fa fa-chevron-down"></i>`;
            applyPreset(preset);
            btnTime.parentElement.classList.remove('open');
            $('#dateRange').val('');
        });
    });

    document.querySelectorAll('.table-item').forEach(item => {
        item.addEventListener('click', function() {
            document.querySelectorAll('.table-item').forEach(i => i.classList.remove('active'));
            this.classList.add('active');
            btnTable.innerHTML = `${this.innerText} <i class="fa fa-chevron-down"></i>`;
            btnTable.parentElement.classList.remove('open');

            window.filters.tableId = this.dataset.id;
            applyBookingFilters();
        });
    });
    function applyPreset(preset) {
        const now = new Date();
        let from = null, to = null;

        const startOfDay = d => {
            const date = new Date(d);
            date.setHours(0, 0, 0, 0);
            return date;
        };
        const endOfDay = d => {
            const date = new Date(d);
            date.setHours(23, 59, 59, 999);
            return date;
        };

        switch (preset) {
            case 'today':
                from = startOfDay(now);
                to = endOfDay(now);
                break;
            case 'yesterday':
                const yesterday = new Date();
                yesterday.setDate(now.getDate() - 1);
                from = startOfDay(yesterday);
                to = endOfDay(yesterday);
                break;
            case 'this_week':
                const first = now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1);
                const monday = new Date(now.setDate(first));
                from = startOfDay(monday);
                to = endOfDay(new Date());
                break;
            case 'last_week':
                const lastMon = new Date();
                lastMon.setDate(now.getDate() - (now.getDay() === 0 ? 6 : now.getDay() - 1) - 7);
                const lastSun = new Date(lastMon);
                lastSun.setDate(lastMon.getDate() + 6);
                from = startOfDay(lastMon);
                to = endOfDay(lastSun);
                break;
            case 'this_month':
                from = new Date(now.getFullYear(), now.getMonth(), 1);
                to = endOfDay(new Date());
                break;
            case 'all':
                from = null;
                to = null;
                break;
        }
        window.filters.from = from ? Math.floor(from.getTime() / 1000) : null;
        window.filters.to   = to   ? Math.floor(to.getTime() / 1000) : null;

        applyBookingFilters();
    }
    function applyBookingFilters() {
        rows.forEach(row => {
            let match = true;
            if (window.filters.code) {
                const codeTxt = (row.dataset.code || '').toLowerCase();
                if (!codeTxt.includes(window.filters.code)) match = false;
            }
            if (match && window.filters.name) {
                const nameTxt = (row.dataset.name || '').toLowerCase();
                if (!nameTxt.includes(window.filters.name)) match = false;
            }
            if (match && window.filters.phone) {
                const phoneTxt = (row.dataset.phone || '').toLowerCase();
                if (!phoneTxt.includes(window.filters.phone)) match = false;
            }
            if (match && window.filters.from && window.filters.to) {
                const rowTime = Number(row.dataset.time);
                if (rowTime < window.filters.from || rowTime > window.filters.to) match = false;
            }
            if (match && window.filters.tableId !== 'all') {
                if (row.dataset.tableId !== window.filters.tableId) {
                    match = false;
                }
            }
            if (match) {
                const rowStatus = row.dataset.status;
                if (window.filters.status && window.filters.status.length > 0) {
                    if (!window.filters.status.includes(rowStatus)) {
                        match = false;
                    }
                }
            }
            row.dataset.filtered = match ? '1' : '0';
        });

        currentPage = 1;
        renderPagination();
    }

    function renderPagination() {
        const filteredRows = Array.from(rows).filter(r => r.dataset.filtered !== '0');
        const totalPages = Math.ceil(filteredRows.length / rowsPerPage) || 1;
        rows.forEach(r => {
            r.style.display = 'none';
            const detail = document.getElementById(`detail-${r.dataset.id}`);
            if (detail) detail.style.display = 'none';
        });

        const start = (currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        filteredRows.slice(start, end).forEach(r => r.style.display = '');
        const pageInfo = document.getElementById('pageInfo');
        if (pageInfo) pageInfo.innerText = `Trang ${currentPage} / ${totalPages}`;
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');
        if(prevBtn) prevBtn.disabled = (currentPage === 1);
        if(nextBtn) nextBtn.disabled = (currentPage === totalPages);
        const paginationContainer = document.getElementById('pagination');
        if (totalPages <= 1) {
            paginationContainer.classList.add('d-none');
        } else {
            paginationContainer.classList.remove('d-none');
        }
    }

    const searchInputs = document.querySelectorAll('.filter-box .input-text');
    if (searchInputs.length >= 3) {
        searchInputs[0].addEventListener('input', e => { window.filters.code = e.target.value.toLowerCase(); applyBookingFilters(); });
        searchInputs[1].addEventListener('input', e => { window.filters.name = e.target.value.toLowerCase(); applyBookingFilters(); });
        searchInputs[2].addEventListener('input', e => { window.filters.phone = e.target.value.toLowerCase(); applyBookingFilters(); });
    }

    // Nút phân trang (Xử lý sự kiện 1 lần)
    document.getElementById('prevPage')?.addEventListener('click', () => {
        if (currentPage > 1) { currentPage--; renderPagination(); }
    });
    document.getElementById('nextPage')?.addEventListener('click', () => {
        const filteredRowsCount = Array.from(rows).filter(r => r.dataset.filtered !== '0').length;
        if (currentPage < Math.ceil(filteredRowsCount / rowsPerPage)) { currentPage++; renderPagination(); }
    });

    // DateRangePicker
    $('#dateRange').daterangepicker({
        autoUpdateInput: false,
        locale: { format: 'DD/MM/YYYY', applyLabel: 'Áp dụng', cancelLabel: 'Hủy' }
    }).on('apply.daterangepicker', function(ev, picker) {
        $(this).val(picker.startDate.format('DD/MM/YYYY') + ' - ' + picker.endDate.format('DD/MM/YYYY'));
        window.filters.from = picker.startDate.startOf('day').unix();
        window.filters.to = picker.endDate.endOf('day').unix();
        btnTime.innerHTML = `Tùy chọn <i class="fa fa-chevron-down"></i>`;
        applyBookingFilters();
    }).on('cancel.daterangepicker', function() {
        $(this).val('');
        window.filters.from = null;
        window.filters.to = null;
        applyBookingFilters();
    });

    statusCheckboxes.forEach(ck => {
        ck.addEventListener('change', () => {
            // Lấy tất cả các giá trị của checkbox đang được check
            const checkedValues = Array.from(statusCheckboxes)
                .filter(c => c.checked)
                .map(c => c.value);
            
            window.filters.status = checkedValues;
            applyBookingFilters();
        });
    });

    // Khởi tạo
    applyBookingFilters();
});

menuBtn.addEventListener('click', function(e) {
    e.stopPropagation(); // Ngăn sự kiện nổi bọt
    dropdownMenu.classList.toggle('show');
});

document.addEventListener('click', function() {
    dropdownMenu.classList.remove('show');
});

if (logoutLink) {
    logoutLink.addEventListener('click', function(e) {
        e.preventDefault();
        if (confirm('Bạn có chắc chắn muốn đăng xuất?')) {
            document.getElementById('logout-form').submit();
        }
    });
}

// ===== OPEN / CLOSE MODAL =====
btnCreate.addEventListener('click',  () => {

    currentBookingId = null;
    document.getElementById('bookingForm').reset();
    if (arrivalTimeHidden) arrivalTimeHidden.value = '';
    if (arrivalTimeDisplay) arrivalTimeDisplay.value = '';
    syncArrivalTimeDisplay();

    phoneInput.value = '';
    nameInput.value = '';
    customerIdInput.value = '';

    nameInput.disabled = true;
    phoneInput.disabled = false;

    nameInput.placeholder = 'Nhập số điện thoại trước';
    nameInput.classList.remove('new-customer', 'input-readonly');

    if (bookingTableSelect) bookingTableSelect.value = '';
    if (typeof syncBookingSelects === 'function') {
        syncBookingSelects();
    }

    preorderItems = {};
    renderPreorderSummary();

    const st = document.getElementById('bookingStatusLine');
    if (st) st.remove();

    cancelBookingBtn.style.display = 'none';

    modal.querySelector('h3').textContent = 'Thêm mới đặt bàn';

    resetSaveButton(async () => await createBooking());

    modal.style.display = 'flex';

});


btnClose.addEventListener('click', closeModal);
btnCancel.addEventListener('click', closeModal);

function closeModal() {
    modal.style.display = 'none';
}

async function checkCustomerByPhone() {
    const phone = phoneInput.value.trim();

    // chỉ check khi đủ 9–10 số
    if (!/^\d{9,10}$/.test(phone)) return;

    try {
        const res = await fetch(
            `${BASE_URL}/pos/customer/check?phone=${encodeURIComponent(phone)}`,
            { headers: { 'Accept': 'application/json' } }
        );

        if (!res.ok) return;

        const data = await res.json();

        if (data.exists) {
            // ===== KHÁCH CŨ =====
            customerIdInput.value = data.customer.id;
            nameInput.value = data.customer.name;

            nameInput.disabled = true;
            nameInput.classList.remove('new-customer');
            nameInput.classList.add('input-readonly');
        } else {
            // ===== KHÁCH MỚI =====
            customerIdInput.value = '';
            nameInput.value = '';

            nameInput.disabled = false;
            nameInput.placeholder = 'Nhập tên khách mới';
            nameInput.classList.remove('input-readonly');
            nameInput.classList.add('new-customer');

            nameInput.focus();
        }

    } catch (err) {
        console.error('CHECK PHONE ERROR:', err);
    }
}

// Blur khỏi ô SĐT
phoneInput.addEventListener('blur', checkCustomerByPhone);

// Nhấn Enter trong ô SĐT
phoneInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        checkCustomerByPhone();
    }
});

btnAddPreorder.onclick = () => preorderModal.style.display = 'flex';
closePreorderModal.onclick = cancelPreorder.onclick = () => {
    preorderModal.style.display = 'none';
};

searchInput.addEventListener('input', () => {
    clearTimeout(searchTimeout);

    const keyword = searchInput.value.trim();

    if (!keyword) {
        searchResultBox.innerHTML = '';
        return;
    }

    searchTimeout = setTimeout(async () => {
        lastSearchKeyword = keyword;
        searchResultBox.innerHTML = '';

        try {
            const res = await fetch(
                `${BASE_URL}/pos/booking/search-product?q=${encodeURIComponent(keyword)}`,
                { headers: { 'Accept': 'application/json' } }
            );

            if (!res.ok) return;

            const products = await res.json();

            // ⛔ nếu keyword đã đổi → bỏ response cũ
            if (keyword !== lastSearchKeyword) return;

            products.forEach(p => {
                const li = document.createElement('li');
                li.textContent = `${p.name} – ${Number(p.price).toLocaleString()}đ`;

                li.onclick = () => {
                    addPreorderItem(p);
                    searchInput.value = '';
                    searchResultBox.innerHTML = '';
                };

                searchResultBox.appendChild(li);
            });

        } catch (err) {
            console.error('SEARCH PREORDER ERROR:', err);
        }
    }, 300); // debounce 300ms
});

document.addEventListener('click', (e) => {
    if (!searchInput.contains(e.target) && !searchResultBox.contains(e.target)) {
        searchResultBox.innerHTML = '';
    }
});

function addPreorderItem(product) {
    if (!preorderItems[product.id]) {
        preorderItems[product.id] = {
            product_id: product.id,
            product_code: product.code,
            product_name: product.name,
            price: product.price,
            qty: 1,
            note: ''
        };
    } else {
        preorderItems[product.id].qty += 1;
    }

    renderPreorderTable();
}

function renderPreorderTable() {
    listEl.innerHTML = '';

    Object.values(preorderItems).forEach(item => {
        listEl.insertAdjacentHTML('beforeend', `
            <tr>
                <td>${item.product_code}</td>
                <td>${item.product_name}</td>
                <td>${Number(item.price).toLocaleString()}</td>
                <td>
                    <button onclick="changeQty(${item.product_id}, -1)">−</button>
                    <span class="mx-2">${item.qty}</span>
                    <button onclick="changeQty(${item.product_id}, 1)">+</button>
                </td>
                <td>
                    <input
                        type="text"
                        value="${item.note}"
                        onchange="updateNote(${item.product_id}, this.value)"
                        placeholder="Ghi chú"
                    >
                </td>
                <td>
                    <button onclick="removePreorder(${item.product_id})">
                        <i class="far fa-trash-alt delete-icon"></i>
                    </button>
                </td>
            </tr>
        `);
    });
}

function changeQty(id, delta) {
    if (!preorderItems[id]) return;

    preorderItems[id].qty += delta;

    if (preorderItems[id].qty < 1) {
        preorderItems[id].qty = 1;
    }

    renderPreorderTable();
}

function updateNote(id, note) {
    if (!preorderItems[id]) return;

    preorderItems[id].note = note;
}

function removePreorder(id) {
    if (!preorderItems[id]) return;

    delete preorderItems[id];
    renderPreorderTable();
}

savePreorderBtn.addEventListener('click', () => {
    renderPreorderSummary();
    preorderModal.style.display = 'none';
});

function renderPreorderSummary() {
    const box = document.getElementById('preorderSummary');
    const items = Object.values(preorderItems);

    if (items.length === 0) {
        box.innerHTML = '<em class="text-muted">Chưa có món đặt trước</em>';
        return;
    }

    const showItems = items.slice(0, 3);
    const remain = items.length - showItems.length;

    let html = '<div class="preorder-inline">';

    showItems.forEach(item => {
        html += `
            <div class="preorder-line">
                ${item.product_name} x ${item.qty}
            </div>
        `;
    });

    if (remain > 0) {
        html += `
            <div class="preorder-more">
                <a href="javascript:void(0)" onclick="showPreorderPopup()">
                    + ${remain} món khác
                </a>
            </div>
        `;
    }

    html += `
    </div>`;

    box.innerHTML = html;
}

function showPreorderPopup() {
    let popup = document.getElementById('preorderPopup');

    if (!popup) {
        popup = document.createElement('div');
        popup.id = 'preorderPopup';
        popup.className = 'preorder-popup';
        document.body.appendChild(popup);
    }

    let html = '<strong>Món đặt trước:</strong><ul>';

    Object.values(preorderItems).forEach(item => {
        html += `
            <li>
                ${item.qty} ${item.product_name}
            </li>
        `;
    });

    html += '</ul>';

    popup.innerHTML = html;
    popup.style.display = 'block';
}

document.addEventListener('click', (e) => {
    const popup = document.getElementById('preorderPopup');
    if (!popup) return;

    if (
        !popup.contains(e.target) &&
        !e.target.closest('.preorder-more')
    ) {
        popup.style.display = 'none';
    }
});

btnAddPreorder.onclick = () => {
    preorderModal.style.display = 'flex';
    renderPreorderTable(); // load lại món cũ
};

// ===== SAVE BOOKING =====
document.getElementById('saveBooking').onclick = async () => {
    if (currentBookingId) {
        await updateBooking(currentBookingId);
    } else {
        await createBooking();
    }
};

async function createBooking() {
    const form = document.getElementById('bookingForm');

    const phone = phoneInput.value.trim();
    const name = nameInput.value.trim();

    if (!phone) {
        showToast('⚠️ Vui lòng nhập số điện thoại', 'warning');
        return;
    }

    if (!customerIdInput.value && !name) {
        showToast('⚠️ Vui lòng nhập tên khách hàng mới', 'warning');
        return;
    }

    const formData = new FormData(form);

    const promoInput = document.getElementById('promotion_id');
    if (promoInput) {
        formData.append('promotion_id', promoInput.value || '');
    }

    const arrivalTime = form.querySelector('[name="arrival_time"]')?.value;
    if (arrivalTime) formData.append('booking_time', arrivalTime);

    const adult = Number(form.querySelector('[name="adult"]').value || 0);
    const child = Number(form.querySelector('[name="child"]').value || 0);

    formData.append('guest_count', adult + child);
    formData.append(
        'preorder_items',
        JSON.stringify(Object.values(preorderItems))
    );

    try {
        const res = await fetch(`${BASE_URL}/pos/booking/store`, {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': CSRF_TOKEN,
                'Accept': 'application/json'
            },
            body: formData
        });

        const data = await res.json();

        if (!data.success) {
            showToast(data.message || 'Lỗi server', 'error');
            return;
        }

        showToast('Đặt bàn thành công', 'success');
        setTimeout(() => {
            location.reload();
        }, 800);

    } catch (err) {
        console.error(err);
        showToast('Lỗi server', 'error');
    }
}

document.querySelectorAll('.edit-icon').forEach(icon => {
    icon.addEventListener('click', async () => {
        const id = icon.dataset.id;

        try {
            const res = await fetch(`${BASE_URL}/pos/booking/${id}`, {
                headers: { 'Accept': 'application/json' }
            });

            if (!res.ok) {
                throw new Error('HTTP ' + res.status);
            }

            const data = await res.json();

            if (!data.success) {
                alert(data.message || 'Không load được booking');
                return;
            }

            openEditBookingModal(data.booking);

        } catch (err) {
            console.error(err);
            showToast('Lỗi server', 'error');
        }
    });
});

function resetSaveButton(handler) {
    const oldBtn = document.getElementById('saveBooking');
    const newBtn = oldBtn.cloneNode(true);
    oldBtn.parentNode.replaceChild(newBtn, oldBtn);
    newBtn.onclick = handler;
}

function openEditBookingModal(booking) {
    console.log('booking.table_id =', booking.table_id);

    const tableSelect = bookingTableSelect || document.querySelector('[name="table_id"]');
    
    
    currentBookingId = booking.id;

    modal.style.display = 'flex';
    modal.querySelector('h3').textContent = 'Chỉnh sửa đặt bàn';

    nameInput.value = booking.customer_name;
    phoneInput.value = booking.phone;

    nameInput.disabled = true;
    phoneInput.disabled = true;

    cancelBookingBtn.style.display =
        ['received', 'cancel'].includes(booking.status)
            ? 'none'
            : 'inline-block';

    document.getElementById('customer_id').value = booking.customer_id;

    if (arrivalTimeHidden) {
        arrivalTimeHidden.value = formatBookingTimeForHidden(booking.booking_time);
    }
    syncArrivalTimeDisplay();

    document.querySelector('[name="note"]').value = booking.note || '';

    if (tableSelect) {
        tableSelect.value = booking.table_id
        ? String(booking.table_id)
        : '';
    }
    if (typeof syncBookingSelects === 'function') {
        syncBookingSelects();
    }

    // ===== PROMOTION =====
    document.getElementById('promotion_name').value =
        booking.promotion_name ?? 'Không có ưu đãi';

    document.getElementById('promotion_id').value =
        booking.promotion_id ?? '';

    document.querySelector('[name="adult"]').value = booking.guest_count;
    document.querySelector('[name="child"]').value = 0;

    renderStatusLine(booking.status);

    preorderItems = {};
    booking.items.forEach(i => {
        preorderItems[i.product_id] = {
            product_id: i.product_id,
            product_name: i.product_name,
            price: i.price,
            qty: i.qty,
            note: i.note || ''
        };
    });

    renderPreorderSummary();
}

async function updateBooking(id) {
    const formData = new FormData();

    formData.append('booking_time',
        (arrivalTimeHidden && arrivalTimeHidden.value) || ''
    );

    const adult = Number(document.querySelector('[name="adult"]').value || 0);
    const child = Number(document.querySelector('[name="child"]').value || 0);

    formData.append('guest_count', adult + child);
    formData.append('table_id',
        (bookingTableSelect && bookingTableSelect.value) || ''
    );

    formData.append(
        'promotion_id',
        document.getElementById('promotion_id').value || ''
    );
    formData.append('note',
        document.querySelector('[name="note"]').value
    );
    formData.append(
        'preorder_items',
        JSON.stringify(Object.values(preorderItems))
    );

    const res = await fetch(`${BASE_URL}/pos/booking/${id}/update`, {
        method: 'POST',
        headers: {
            'X-CSRF-TOKEN': CSRF_TOKEN,
            'Accept': 'application/json'
        },
        body: formData
    });

    const data = await res.json();

    if (!data.success) {
        showToast(data.message || 'Lỗi server', 'error');
        return;
    }

    showToast('Xếp bàn thành công', 'success');
    setTimeout(() => {
        location.reload();
    }, 800);
}

function openCreateBookingModal() {
    currentBookingId = null;
    nameInput.disabled = false;
    phoneInput.disabled = false;
    modal.querySelector('h3').textContent = 'Thêm mới đặt bàn';
}

function renderStatusLine(status) {
    const map = {
        waiting: '⏳ Chờ xếp bàn',
        assigned: '📌 Đã xếp bàn',
        received: '✅ Đã nhận bàn',
        cancel: '❌ Đã hủy'
    };
    let el = document.getElementById('bookingStatusLine');
    if (!el) {
        el = document.createElement('div');
        el.id = 'bookingStatusLine';
        el.className = 'booking-status';
        document.querySelector('.modal-body').prepend(el);
    }
    el.textContent = map[status] || status;
}

async function cancelBooking(id) {
    if (!confirm('❌ Xác nhận hủy đặt bàn?')) return;
    try {
        const res = await fetch(`${BASE_URL}/pos/booking/${id}/cancel`, {
            method: 'POST',
            headers: {
                'X-CSRF-TOKEN': CSRF_TOKEN,
                'Accept': 'application/json'
            }
        });
        const data = await res.json();
        if (!res.ok || data.success === false) {
            showToast(data.message || 'Không thể hủy bàn đã xếp', 'error');
            return;
        }
        showToast('Đã hủy bàn đặt', 'success');
        setTimeout(() => {
            location.reload();
        }, 800);
    } catch (err) {
        console.error(err);
        showToast('Lỗi server', 'error');
    }
}

document.querySelectorAll('.delete-icon').forEach(icon => {
    icon.addEventListener('click', () => {
        const id = icon.dataset.id;
        cancelBooking(id);
    });
});

cancelBookingBtn.onclick = () => {
    if (!currentBookingId) return;
    cancelBooking(currentBookingId);
};

document.querySelectorAll('.receive-icon').forEach(icon => {
    icon.addEventListener('click', async function() {
        const id = this.dataset.id;
        if (!confirm('Xác nhận khách đã đến và nhận bàn?')) return;

        try {
            const res = await fetch(`/VNT-Restaurant/public/pos/booking/${id}/receive`, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                    'Accept': 'application/json'
                }
            });
            const data = await res.json();
            if (data.success) {
                // Chuyển trang sang Cashier
                window.location.href = data.redirect;
            }
        } catch (err) {
            showToast('Lỗi server', 'error');
        }
    });
});

