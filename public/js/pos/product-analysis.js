(() => {
  const page = document.querySelector('.product-analysis-page');
  if (!page) return;

  const analysisData = page.dataset.analysis ? JSON.parse(page.dataset.analysis) : null;
  const hasChart = typeof Chart !== 'undefined';

  const trimDecimal = (value) => {
    return Number.parseFloat(value).toFixed(2).replace(/\.00$/, '').replace(/(\.\d)0$/, '$1');
  };

  const formatNumber = (value) => {
    const number = Number(value) || 0;
    return number.toLocaleString('vi-VN');
  };

  const formatCompact = (value) => {
    const abs = Math.abs(value);
    if (abs >= 1_000_000_000) return `${trimDecimal(value / 1_000_000_000)} tỷ`;
    if (abs >= 1_000_000) return `${trimDecimal(value / 1_000_000)} triệu`;
    if (abs >= 1_000) return `${trimDecimal(value / 1_000)} nghìn`;
    return formatNumber(value);
  };

  const formatAxis = (value) => {
    const abs = Math.abs(value);
    if (abs >= 1_000_000_000) return `${trimDecimal(value / 1_000_000_000)} Tỷ`;
    if (abs >= 1_000_000) return `${trimDecimal(value / 1_000_000)} Tr`;
    if (abs >= 1_000) return `${trimDecimal(value / 1_000)} N`;
    return value;
  };

  const formatPercent = (value) => `${trimDecimal(value)}%`;

  const applyFilters = () => {
    const dateInput = document.getElementById('analysisDateRange');
    const fromDate = dateInput?.dataset.from || '';
    const toDate = dateInput?.dataset.to || '';
    const locationIds = getSelectedIds(document.getElementById('branchFilter'));
    const categoryIds = getSelectedIds(document.getElementById('categoryFilter'));
    const returnSelect = document.getElementById('returnFilter');
    const returnMode = returnSelect ? returnSelect.value : '';

    const url = new URL(window.location.href);
    if (fromDate) {
      url.searchParams.set('fromDate', fromDate);
    } else {
      url.searchParams.delete('fromDate');
    }
    if (toDate) {
      url.searchParams.set('toDate', toDate);
    } else {
      url.searchParams.delete('toDate');
    }
    if (locationIds.length) {
      url.searchParams.set('locations', locationIds.join(','));
    } else {
      url.searchParams.delete('locations');
    }
    if (categoryIds.length) {
      url.searchParams.set('categories', categoryIds.join(','));
    } else {
      url.searchParams.delete('categories');
    }
    if (returnMode) {
      url.searchParams.set('returns', returnMode);
    } else {
      url.searchParams.delete('returns');
    }

    const nextUrl = url.toString();
    if (nextUrl !== window.location.href) {
      window.location.href = nextUrl;
    }
  };

  const getSelectedIds = (container) => {
    if (!container) return [];
    const options = Array.from(container.querySelectorAll('.filter-options input[type="checkbox"]'));
    const allOption = container.querySelector('input[data-value="all"]');
    if (!options.length) return [];
    const selected = options.filter(opt => opt.checked).map(opt => opt.dataset.value);
    if (allOption && selected.length === options.length) {
      return [];
    }
    return selected;
  };

  const buildSparkline = (id, data, label, formatter) => {
    const ctx = document.getElementById(id);
    if (!ctx || !hasChart || !analysisData?.trend) return;

    new Chart(ctx, {
      type: 'line',
      data: {
        labels: analysisData.trend.labels,
        datasets: [
          {
            data,
            borderColor: '#1d6ae5',
            backgroundColor: 'rgba(29, 106, 229, 0.18)',
            tension: 0.35,
            pointRadius: 0,
            pointHitRadius: 12,
            fill: true,
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
              label: (context) => `${label}: ${formatter(context.parsed.y)}`,
            },
          },
        },
        scales: {
          x: { display: false },
          y: { display: false },
        },
      },
    });
  };

  const buildCategoryChart = () => {
    const ctx = document.getElementById('categoryPerformanceChart');
    if (!ctx || !hasChart || !analysisData?.category) return;

    new Chart(ctx, {
      data: {
        labels: analysisData.category.labels,
        datasets: [
          {
            type: 'bar',
            label: 'Doanh thu',
            data: analysisData.category.revenue,
            backgroundColor: '#2563eb',
            borderRadius: 8,
            maxBarThickness: 34,
          },
          {
            type: 'bar',
            label: 'Lợi nhuận',
            data: analysisData.category.profit,
            backgroundColor: '#22c55e',
            borderRadius: 8,
            maxBarThickness: 34,
          },
          {
            type: 'line',
            label: 'Tỷ suất lợi nhuận',
            data: analysisData.category.margin,
            borderColor: '#166534',
            backgroundColor: '#166534',
            tension: 0.3,
            yAxisID: 'y1',
            pointRadius: 3,
            pointHoverRadius: 5,
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
              label: (context) => {
                if (context.dataset.type === 'line') {
                  return `${context.dataset.label}: ${formatPercent(context.parsed.y)}`;
                }
                return `${context.dataset.label}: ${formatCompact(context.parsed.y)}`;
              },
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { maxRotation: 0, autoSkip: true },
          },
          y: {
            ticks: { callback: (value) => formatAxis(value) },
          },
          y1: {
            position: 'right',
            grid: { drawOnChartArea: false },
            ticks: { callback: (value) => formatPercent(value) },
          },
        },
      },
    });
  };

  const buildInventoryChart = () => {
    const ctx = document.getElementById('inventoryCategoryChart');
    if (!ctx || !hasChart || !analysisData?.inventory) return;

    new Chart(ctx, {
      type: 'bar',
      data: {
        labels: analysisData.inventory.labels,
        datasets: [
          {
            data: analysisData.inventory.values,
            backgroundColor: '#3b82f6',
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
              label: (context) => `Giá trị tồn kho: ${formatCompact(context.parsed.x)}`,
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

  const buildTopProductsChart = () => {
    const ctx = document.getElementById('topProductsChart');
    if (!ctx || !hasChart || !analysisData?.topProducts) return;

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: [],
        datasets: [
          {
            data: [],
            backgroundColor: '#4f7ad6',
            borderRadius: 8,
            maxBarThickness: 24,
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
              label: () => '',
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

    const updateChart = (metric) => {
      const items = analysisData.topProducts?.[metric] || [];
      const isRevenue = metric === 'revenue';
      chart.data.labels = items.map(item => item.label);
      chart.data.datasets[0].data = items.map(item => item.value);
      chart.options.plugins.tooltip.callbacks.label = (context) => {
        if (isRevenue) {
          return `Doanh thu: ${formatCompact(context.parsed.x)}`;
        }
        return `Số lượng bán: ${formatNumber(context.parsed.x)}`;
      };
      chart.options.scales.x.ticks.callback = (value) => formatAxis(value);
      chart.update();
    };

    const select = document.getElementById('topMetricSelect');
    if (select) {
      select.addEventListener('change', () => {
        updateChart(select.value);
      });
    }

    updateChart(select?.value || 'revenue');
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
        applyLabel: '\u00c1p d\u1ee5ng',
        cancelLabel: 'B\u1ecf qua',
        daysOfWeek: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
        monthNames: [
          'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
          'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
          'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12',
        ],
        firstDay: 1,
      },
    });

    $(dateInput).on('apply.daterangepicker', (ev, picker) => {
      dateInput.value = `${picker.startDate.format('DD/MM/YYYY')} - ${picker.endDate.format('DD/MM/YYYY')}`;
      dateInput.dataset.from = picker.startDate.format('YYYY-MM-DD');
      dateInput.dataset.to = picker.endDate.format('YYYY-MM-DD');
      applyFilters();
    });

    $(dateInput).on('cancel.daterangepicker', () => {
      dateInput.value = '';
      dateInput.dataset.from = '';
      dateInput.dataset.to = '';
      applyFilters();
    });
  };

  const initMultiFilter = (config) => {
    const filter = document.getElementById(config.containerId);
    if (!filter) return;

    const trigger = filter.querySelector('.filter-trigger');
    const label = document.getElementById(config.labelId);
    const searchInput = document.getElementById(config.searchId);
    const options = Array.from(filter.querySelectorAll('.filter-options input[type="checkbox"]'));
    const allOption = filter.querySelector('input[data-value="all"]');
    let pending = false;

    const updateLabel = () => {
      if (!label) return;
      const selected = options.filter(opt => opt.checked);
      if (selected.length === options.length && options.length) {
        label.textContent = config.allLabel;
        return;
      }
      if (!selected.length) {
        label.textContent = config.noneLabel;
        return;
      }
      if (selected.length === 1) {
        label.textContent = selected[0].parentElement?.textContent?.trim() || config.noneLabel;
        return;
      }
      label.textContent = `${config.selectedLabel} ${selected.length} ${config.unitLabel}`;
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

    filter.querySelector('.filter-menu')?.addEventListener('click', (event) => {
      event.stopPropagation();
    });

    document.addEventListener('click', () => {
      if (filter.classList.contains('open')) {
        filter.classList.remove('open');
        trigger?.setAttribute('aria-expanded', 'false');
        if (pending) {
          pending = false;
          applyFilters();
        }
      }
    });

    searchInput?.addEventListener('input', filterOptions);

    allOption?.addEventListener('change', () => {
      options.forEach(opt => {
        opt.checked = allOption.checked;
      });
      pending = true;
      updateLabel();
    });

    options.forEach(opt => {
      opt.addEventListener('change', () => {
        syncAllOption();
        pending = true;
        updateLabel();
      });
    });

    updateLabel();
  };

  const initCustomSelects = () => {
    const selects = document.querySelectorAll('select.custom-select');
    if (!selects.length) return;

    const closeAll = () => {
      document.querySelectorAll('.custom-select-trigger.is-open').forEach((trigger) => {
        trigger.classList.remove('is-open');
      });
      document.querySelectorAll('.custom-select-dropdown.is-open').forEach((dropdown) => {
        dropdown.classList.remove('is-open');
      });
    };

    const buildSelect = (select) => {
      if (select.dataset.customized === 'true') {
        return;
      }

      select.dataset.customized = 'true';
      select.classList.add('custom-select-hidden');

      const wrapper = document.createElement('div');
      wrapper.className = 'custom-select-wrapper';

      const trigger = document.createElement('button');
      trigger.type = 'button';
      trigger.className = 'custom-select-trigger';
      trigger.setAttribute('aria-haspopup', 'listbox');

      const leading = document.createElement('span');
      leading.className = 'custom-select-leading';

      const label = document.createElement('span');
      label.className = 'label';

      const iconClass = select.dataset.icon;
      if (iconClass) {
        const iconWrap = document.createElement('span');
        iconWrap.className = 'custom-select-icon';
        const icon = document.createElement('i');
        icon.className = iconClass;
        icon.setAttribute('aria-hidden', 'true');
        iconWrap.appendChild(icon);
        leading.appendChild(iconWrap);
      }

      leading.appendChild(label);

      const arrow = document.createElement('span');
      arrow.className = 'arrow';
      arrow.innerHTML = '<i class="fa-solid fa-chevron-down"></i>';

      trigger.appendChild(leading);
      trigger.appendChild(arrow);

      const dropdown = document.createElement('div');
      dropdown.className = 'custom-select-dropdown';

      const searchEnabled = select.dataset.search === 'true';
      let searchInput = null;
      if (searchEnabled) {
        searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.className = 'custom-select-search';
        searchInput.placeholder = select.dataset.placeholder || 'Tim kiem...';
        dropdown.appendChild(searchInput);
      }

      const list = document.createElement('div');
      list.className = 'custom-select-list';
      dropdown.appendChild(list);

      const emptyState = document.createElement('div');
      emptyState.className = 'custom-select-empty';
      emptyState.textContent = 'Khong co ket qua';
      dropdown.appendChild(emptyState);

      const syncLabel = () => {
        const selected = select.options[select.selectedIndex];
        label.textContent = selected ? selected.textContent : select.dataset.placeholder || 'Chon';
      };

      const renderOptions = (filterValue) => {
        const filter = (filterValue || '').toLowerCase();
        list.innerHTML = '';
        let matches = 0;

        Array.from(select.options).forEach((option) => {
          const text = option.textContent || '';
          if (filter && !text.toLowerCase().includes(filter)) {
            return;
          }

          const item = document.createElement('div');
          item.className = 'custom-select-option';
          item.textContent = text;
          item.dataset.value = option.value;
          if (option.selected) {
            item.classList.add('is-active');
          }

          item.addEventListener('click', () => {
            select.value = option.value;
            select.dispatchEvent(new Event('change', { bubbles: true }));
            closeAll();
          });

          list.appendChild(item);
          matches += 1;
        });

        emptyState.style.display = matches ? 'none' : 'block';
      };

      syncLabel();
      renderOptions('');

      select.addEventListener('change', () => {
        syncLabel();
        renderOptions(searchInput ? searchInput.value : '');
      });

      trigger.addEventListener('click', (event) => {
        event.stopPropagation();
        const isOpen = trigger.classList.contains('is-open');
        closeAll();
        if (!isOpen) {
          trigger.classList.add('is-open');
          dropdown.classList.add('is-open');
          if (searchInput) {
            searchInput.value = '';
            renderOptions('');
            searchInput.focus();
          }
        }
      });

      if (searchInput) {
        searchInput.addEventListener('input', () => {
          renderOptions(searchInput.value);
        });
      }

      wrapper.appendChild(trigger);
      wrapper.appendChild(dropdown);
      select.parentNode.insertBefore(wrapper, select.nextSibling);
    };

    selects.forEach((select) => buildSelect(select));

    document.addEventListener('click', () => {
      closeAll();
    });
  };

  const initReturnFilter = () => {
    const select = document.getElementById('returnFilter');
    if (!select) return;
    select.addEventListener('change', () => {
      applyFilters();
    });
  };

  if (analysisData) {
    buildSparkline('productsSoldChart', analysisData.trend?.products || [], 'Sản phẩm đã bán', formatNumber);
    buildSparkline('quantitySoldChart', analysisData.trend?.quantity || [], 'Số lượng đã bán', formatNumber);
    buildSparkline('avgRevenueChart', analysisData.trend?.avgRevenue || [], 'Doanh thu TB', formatCompact);
    buildSparkline('avgProfitChart', analysisData.trend?.avgProfit || [], 'Lợi nhuận TB', formatCompact);
    buildCategoryChart();
    buildInventoryChart();
    buildTopProductsChart();
  }

  initDateRange();
  initMultiFilter({
    containerId: 'branchFilter',
    labelId: 'branchLabel',
    searchId: 'branchSearch',
    allLabel: 'Tất cả chi nhánh',
    noneLabel: 'Chưa chọn chi nhánh',
    selectedLabel: 'Đã chọn',
    unitLabel: 'chi nhánh',
  });
  initMultiFilter({
    containerId: 'categoryFilter',
    labelId: 'categoryLabel',
    searchId: 'categorySearch',
    allLabel: 'Tất cả nhóm hàng',
    noneLabel: 'Chưa chọn nhóm hàng',
    selectedLabel: 'Đã chọn',
    unitLabel: 'nhóm hàng',
  });
  initCustomSelects();
  initReturnFilter();
})();
