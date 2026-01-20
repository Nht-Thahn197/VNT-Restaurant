(() => {
  const page = document.querySelector('.sales-analysis-page');
  if (!page) return;

  const analysisData = page.dataset.analysis ? JSON.parse(page.dataset.analysis) : null;
  if (!analysisData) return;

  const formatCompact = (value) => {
    const abs = Math.abs(value);
    if (abs >= 1_000_000_000) return `${trimDecimal(value / 1_000_000_000)} tỷ`;
    if (abs >= 1_000_000) return `${trimDecimal(value / 1_000_000)} triệu`;
    if (abs >= 1_000) return `${trimDecimal(value / 1_000)} nghìn`;
    return value.toLocaleString('vi-VN');
  };

  const formatAxis = (value) => {
    const abs = Math.abs(value);
    if (abs >= 1_000_000) return `${trimDecimal(value / 1_000_000)} Tr`;
    if (abs >= 1_000) return `${trimDecimal(value / 1_000)} N`;
    return value;
  };

  const trimDecimal = (value) => {
    return Number.parseFloat(value).toFixed(2).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1');
  };

  const buildLineChart = () => {
    const ctx = document.getElementById('trendChart');
    if (!ctx) return;

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: analysisData.trend.labels,
        datasets: [
          {
            label: 'Doanh thu',
            data: analysisData.trend.revenue,
            borderColor: '#1d6ae5',
            backgroundColor: 'rgba(29, 106, 229, 0.12)',
            tension: 0.35,
            pointRadius: 2,
            pointHoverRadius: 5,
            fill: false,
          },
          {
            label: 'Trả hàng',
            data: analysisData.trend.returns,
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            tension: 0.35,
            pointRadius: 2,
            pointHoverRadius: 5,
            fill: false,
          },
          {
            label: 'Tổng giá vốn',
            data: analysisData.trend.cost,
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.12)',
            tension: 0.35,
            pointRadius: 2,
            pointHoverRadius: 5,
            fill: false,
          },
          {
            label: 'Lợi nhuận',
            data: analysisData.trend.profit,
            borderColor: '#22c55e',
            backgroundColor: 'rgba(34, 197, 94, 0.12)',
            tension: 0.35,
            pointRadius: 2,
            pointHoverRadius: 5,
            fill: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            position: 'bottom',
            labels: { usePointStyle: true, pointStyle: 'circle' },
          },
          tooltip: {
            callbacks: {
              label: (context) => `${context.dataset.label}: ${formatCompact(context.parsed.y)}`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { maxTicksLimit: 8 },
          },
          y: {
            ticks: {
              callback: (value) => formatAxis(value),
            },
          },
        },
      },
    });
  };

  const buildChannelChart = () => {
    const ctx = document.getElementById('channelChart');
    if (!ctx) return;
    const labels = analysisData.channels.map(item => item.label);
    const values = analysisData.channels.map(item => item.value);

    new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: ['#2f66d4', '#dc3c14'],
            borderColor: '#ffffff',
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '60%',
        plugins: {
          legend: {
            position: 'right',
            labels: { usePointStyle: true, pointStyle: 'circle' },
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const total = values.reduce((sum, val) => sum + val, 0) || 1;
                const value = context.parsed;
                const percent = (value / total) * 100;
                return `${context.label}: ${formatCompact(value)} (${trimDecimal(percent)}%)`;
              },
            },
          },
        },
      },
    });
  };

  const buildWeekdayChart = () => {
    const ctx = document.getElementById('weekdayChart');
    if (!ctx) return;
    const labels = analysisData.weekday.map(item => item.label);
    const values = analysisData.weekday.map(item => item.value);

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: '#3f6edb',
            borderRadius: 8,
            maxBarThickness: 34,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => `TB/ngày: ${formatCompact(context.parsed.y)}`,
            },
          },
        },
        scales: {
          x: { grid: { display: false } },
          y: {
            ticks: { callback: (value) => formatAxis(value) },
          },
        },
      },
    });
  };

  const buildHourChart = () => {
    const ctx = document.getElementById('hourChart');
    if (!ctx) return;
    const labels = analysisData.hour.map(item => item.label);
    const values = analysisData.hour.map(item => item.value);

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: '#3f6edb',
            borderRadius: 8,
            maxBarThickness: 20,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => `TB/giờ: ${formatCompact(context.parsed.y)}`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
          },
          y: {
            ticks: { callback: (value) => formatAxis(value) },
          },
        },
      },
    });
  };

  const buildStaffChart = () => {
    const ctx = document.getElementById('staffChart');
    if (!ctx) return;
    const labels = analysisData.staff.map(item => item.label);
    const values = analysisData.staff.map(item => item.value);

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: '#3f6edb',
            borderRadius: 8,
            maxBarThickness: 26,
          },
        ],
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (context) => `Doanh thu: ${formatCompact(context.parsed.x)}`,
            },
          },
        },
        scales: {
          x: {
            ticks: { callback: (value) => formatAxis(value) },
          },
          y: { grid: { display: false } },
        },
      },
    });
  };

  const initDateRange = () => {
    const dateInput = document.getElementById('analysisDateRange');
    if (!dateInput || typeof $ === 'undefined' || !$.fn.daterangepicker) return;

    const start = dateInput.dataset.from
      ? moment(dateInput.dataset.from, 'YYYY-MM-DD')
      : moment().subtract(29, 'days');
    const end = dateInput.dataset.to
      ? moment(dateInput.dataset.to, 'YYYY-MM-DD')
      : moment();

    $(dateInput).daterangepicker({
      startDate: start,
      endDate: end,
      autoUpdateInput: false,
      locale: {
        format: 'DD/MM/YYYY',
        applyLabel: 'Áp dụng',
        cancelLabel: 'Bỏ qua',
        daysOfWeek: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
        monthNames: [
          'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
          'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
        ],
        firstDay: 1,
      },
    });

    $(dateInput).on('apply.daterangepicker', (ev, picker) => {
      dateInput.value = `${picker.startDate.format('DD/MM/YYYY')} - ${picker.endDate.format('DD/MM/YYYY')}`;
      dateInput.dataset.from = picker.startDate.format('YYYY-MM-DD');
      dateInput.dataset.to = picker.endDate.format('YYYY-MM-DD');
    });
  };

  const initBranchFilter = () => {
    const filter = document.getElementById('branchFilter');
    if (!filter) return;
    const trigger = filter.querySelector('.branch-trigger');
    const label = document.getElementById('branchLabel');
    const searchInput = document.getElementById('branchSearch');
    const options = Array.from(filter.querySelectorAll('.branch-options input[type="checkbox"]'));
    const allOption = filter.querySelector('input[data-value="all"]');

    const updateLabel = () => {
      const selected = options.filter(opt => opt.checked);
      if (selected.length === options.length) {
        label.textContent = 'Tất cả chi nhánh';
        return;
      }
      if (!selected.length) {
        label.textContent = 'Chưa chọn chi nhánh';
        return;
      }
      if (selected.length === 1) {
        label.textContent = selected[0].parentElement?.textContent?.trim() || 'Đã chọn 1';
        return;
      }
      label.textContent = `Đã chọn ${selected.length} chi nhánh`;
    };

    const syncAllOption = () => {
      if (!allOption) return;
      allOption.checked = options.every(opt => opt.checked);
    };

    const filterOptions = () => {
      if (!searchInput) return;
      const keyword = searchInput.value.trim().toLowerCase();
      options.forEach(opt => {
        const text = opt.parentElement?.textContent?.trim().toLowerCase() || '';
        opt.parentElement.style.display = text.includes(keyword) ? '' : 'none';
      });
    };

    trigger?.addEventListener('click', (event) => {
      event.stopPropagation();
      filter.classList.toggle('open');
      trigger.setAttribute('aria-expanded', filter.classList.contains('open'));
    });

    filter.querySelector('.branch-menu')?.addEventListener('click', (event) => {
      event.stopPropagation();
    });

    document.addEventListener('click', () => {
      if (filter.classList.contains('open')) {
        filter.classList.remove('open');
        trigger?.setAttribute('aria-expanded', 'false');
      }
    });

    searchInput?.addEventListener('input', filterOptions);

    allOption?.addEventListener('change', () => {
      options.forEach(opt => {
        opt.checked = allOption.checked;
      });
      updateLabel();
    });

    options.forEach(opt => {
      opt.addEventListener('change', () => {
        syncAllOption();
        updateLabel();
      });
    });

    updateLabel();
  };

  buildLineChart();
  buildChannelChart();
  buildWeekdayChart();
  buildHourChart();
  buildStaffChart();
  initDateRange();
  initBranchFilter();
})();
