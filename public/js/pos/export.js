window.filters = {
    code: '',
    ingredient: '',
    staff: '',
    status: 'all',
    from: null,
    to: null,
};

document.addEventListener("DOMContentLoaded", () => {

    document.querySelectorAll(".export-row").forEach(row => {
        row.addEventListener("click", () => {

            const id = row.dataset.id;
            const detailRow = document.getElementById("detail-" + id);
            const isOpen = detailRow.style.display === "table-row";

            document.querySelectorAll(".detail-row").forEach(r => {
                r.style.display = "none";
            });

            document.querySelectorAll(".export-row").forEach(r => {
                r.classList.remove("active");
            });

            if (!isOpen) {
                detailRow.style.display = "table-row";
                row.classList.add("active");
            }
        });
    });

});

document.addEventListener('DOMContentLoaded', () => {

    const btn = document.getElementById('timeBtn');
    const menu = document.getElementById('timeMenu');

    btn.addEventListener('click', () => {
        btn.parentElement.classList.toggle('open');
    });

    document.addEventListener('click', e => {
        if (!btn.parentElement.contains(e.target)) {
            btn.parentElement.classList.remove('open');
        }
    });

    document.querySelectorAll('.time-item').forEach(item => {
        item.addEventListener('click', () => {
            const preset = item.dataset.preset;
            applyPreset(preset);
            btn.innerText = item.innerText;
            btn.parentElement.classList.remove('open');
        });
    });

    function applyPreset(preset) {
        const now = new Date();
        let from = null, to = null;

        const startOfDay = d => new Date(d.setHours(0,0,0,0));
        const endOfDay   = d => new Date(d.setHours(23,59,59,999));

        switch (preset) {
            case 'today':
                from = startOfDay(new Date());
                to = endOfDay(new Date());
                break;

            case 'yesterday':
                const y = new Date();
                y.setDate(y.getDate() - 1);
                from = startOfDay(new Date(y));
                to = endOfDay(new Date(y));
                break;

            case 'this_week':
                const w1 = new Date();
                w1.setDate(w1.getDate() - w1.getDay() + 1);
                from = startOfDay(w1);
                to = new Date();
                break;

            case 'last_week':
                const lw = new Date();
                lw.setDate(lw.getDate() - lw.getDay() - 6);
                from = startOfDay(lw);
                const lwEnd = new Date(lw);
                lwEnd.setDate(lwEnd.getDate() + 6);
                to = endOfDay(lwEnd);
                break;

            case 'last_7_days':
                from = startOfDay(new Date(now.setDate(now.getDate() - 7)));
                to = new Date();
                break;

            case 'this_month':
                from = new Date(now.getFullYear(), now.getMonth(), 1);
                to = new Date();
                break;

            case 'last_month':
                from = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                to = new Date(now.getFullYear(), now.getMonth(), 0, 23,59,59);
                break;

            case 'last_30_days':
                from = startOfDay(new Date(now.setDate(now.getDate() - 30)));
                to = new Date();
                break;

            case 'this_year':
                from = new Date(now.getFullYear(), 0, 1);
                to = new Date();
                break;

            case 'last_year':
                from = new Date(now.getFullYear() - 1, 0, 1);
                to = new Date(now.getFullYear() - 1, 11, 31, 23,59,59);
                break;

            case 'all':
                from = null;
                to = null;
                break;
        }
        window.filters.from = from ? Math.floor(from.getTime() / 1000) : null;
        window.filters.to   = to   ? Math.floor(to.getTime() / 1000) : null;

        applyExportFilters(); // hàm filter invoice của bạn
    }

  let currentPage = 1;
  const rowsPerPage = 10;

  // ================= FILTER =================
    function applyExportFilters() {

        document.querySelectorAll('.export-row').forEach(row => {

            let match = true;
            if (filters.code) {
                match = row.children[0].innerText.toLowerCase().includes(filters.code);
            }
            if (match && filters.ingredient) {
                const detail = document.getElementById(`detail-${row.dataset.id}`);
                const text = detail?.innerText.toLowerCase() || '';
                match = text.includes(filters.ingredient);
            }

            if (match && filters.staff) {
                match = row.children[2].innerText.toLowerCase().includes(filters.staff);
            }

            if (match && filters.status !== 'all') {
                match = row.dataset.status === filters.status;
            }

            if (match && filters.from && filters.to && row.dataset.time) {
                const t = Number(row.dataset.time);
                match = t >= filters.from && t <= filters.to;
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
    return Array.from(document.querySelectorAll('.export-row'))
      .filter(r => r.dataset.filtered !== '0');
  }

  // ================= PAGINATION =================
  function renderPagination() {
    const rows = getRows();
    const totalPages = Math.ceil(rows.length / rowsPerPage) || 1;

    document.querySelectorAll('.export-row').forEach(r => {
      r.style.display = 'none';
      const d = document.getElementById(`detail-${r.dataset.id}`);
      if (d) d.style.display = 'none';
    });

    const start = (currentPage - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    rows.slice(start, end).forEach(r => r.style.display = '');

    document.getElementById('prevPage')?.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderPagination();
        }
    });

    document.getElementById('nextPage')?.addEventListener('click', () => {
        const totalRows = getRows().length;
        const totalPages = Math.ceil(totalRows / rowsPerPage) || 1;

        if (currentPage < totalPages) {
            currentPage++;
            renderPagination();
        }
    });

    document.getElementById('pageInfo').innerText =
      `Trang ${currentPage} / ${totalPages}`;

      const paginationContainer = document.getElementById('pagination');
        if (totalPages <= 1) {
        paginationContainer.classList.add('d-none');
        } else {
        paginationContainer.classList.remove('d-none');
        }
  }

  // ================= EVENTS =================
  document.getElementById('searchCode').addEventListener('input', e => {
    filters.code = e.target.value.toLowerCase();
    applyExportFilters();
  });

  document.getElementById('searchIngredient').addEventListener('input', e => {
    filters.ingredient = e.target.value.toLowerCase();
    applyExportFilters();
  });

  document.getElementById('searchStaff').addEventListener('input', e => {
    filters.staff = e.target.value.toLowerCase();
    applyExportFilters();
  });

    function onPresetChange(select) {

        const now = new Date();
        let from = null, to = null;

        if (select.value === 'today') {
            from = new Date(now.setHours(0,0,0,0));
            to   = new Date();
        }

        if (select.value === 'week') {
            const d = new Date();
            d.setDate(d.getDate() - 7);
            from = d;
            to   = new Date();
        }

        if (select.value === 'month') {
            from = new Date(now.getFullYear(), now.getMonth(), 1);
            to   = new Date();
        }

        filters.from = from ? Math.floor(from.getTime() / 1000) : null;
        filters.to   = to   ? Math.floor(to.getTime()   / 1000) : null;

        applyExportFilters();
    }
    $('#dateRange').on('apply.daterangepicker', function (ev, picker) {

        const from = picker.startDate.startOf('day');
        const to   = picker.endDate.endOf('day');

        $(this).val(
            picker.startDate.format('DD/MM/YYYY') +
            ' - ' +
            picker.endDate.format('DD/MM/YYYY')
        );

        filters.from = from.unix();
        filters.to   = to.unix();

        applyExportFilters();
    });

    $('#dateRange').on('cancel.daterangepicker', function () {
        $(this).val('');
        filters.from = null;
        filters.to   = null;
        applyExportFilters();
    });
    $(function () {
        $('#dateRange').daterangepicker({
            autoUpdateInput: false,
            locale: {
                format: 'DD/MM/YYYY',
                applyLabel: 'Áp dụng',
                cancelLabel: 'Hủy',
                fromLabel: 'Từ',
                toLabel: 'Đến',
                customRangeLabel: 'Tùy chọn',
                daysOfWeek: ['CN','T2','T3','T4','T5','T6','T7'],
                monthNames: [
                    'Tháng 1','Tháng 2','Tháng 3','Tháng 4',
                    'Tháng 5','Tháng 6','Tháng 7','Tháng 8',
                    'Tháng 9','Tháng 10','Tháng 11','Tháng 12'
                ]
            }
        });
    });
    const defaultStatus = document.querySelector('input[name="status"]:checked');
    if (defaultStatus) {
        filters.status = defaultStatus.value;
    }
    document.querySelectorAll('input[name="status"]').forEach(radio => {
        radio.addEventListener('change', e => {
            filters.status = e.target.value;
            applyExportFilters();
        });
    });

  // ================= INIT =================
  document.querySelectorAll('.export-row')
    .forEach(r => r.dataset.filtered = '1');

  renderPagination();

  const presetSelect = document.getElementById('presetSelect');
    if (presetSelect) {
        presetSelect.addEventListener('change', function () {
            onPresetChange(this);
        });
    }
});

// ===== COLLAPSE BOX =====
document.querySelectorAll('.box.collapsible').forEach(box => {
    const title = box.querySelector('.box-title');
    if (!title) return;

    title.addEventListener('click', () => {
        box.classList.toggle('collapsed');
    });
});
