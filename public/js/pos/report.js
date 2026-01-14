(() => {
  const initPrint = () => {
    const btn = document.getElementById('btnPrintReport');
    if (btn) {
      btn.addEventListener('click', () => {
        window.print();
      });
    }
  };

  const initDateRange = () => {
    if (!window.jQuery || !$.fn.daterangepicker) {
      return;
    }

    const $input = $('#dateRange');
    if (!$input.length) {
      return;
    }

    const from = $input.data('from');
    const to = $input.data('to');
    const options = {
      autoUpdateInput: false,
      locale: {
        format: 'DD/MM/YYYY',
        applyLabel: 'Áp dụng',
        cancelLabel: 'Hủy',
        fromLabel: 'Từ',
        toLabel: 'Đến',
        customRangeLabel: 'Tùy chọn',
        daysOfWeek: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
        monthNames: [
          'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4',
          'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8',
          'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
        ]
      }
    };

    if (from && to) {
      options.startDate = moment(from, 'YYYY-MM-DD');
      options.endDate = moment(to, 'YYYY-MM-DD');
    }

    $input.daterangepicker(options);

    $input.on('apply.daterangepicker', function (event, picker) {
      const fromDate = picker.startDate.format('YYYY-MM-DD');
      const toDate = picker.endDate.format('YYYY-MM-DD');
      const displayValue = picker.startDate.format('DD/MM/YYYY') + ' - ' + picker.endDate.format('DD/MM/YYYY');

      $('#fromDate').val(fromDate);
      $('#toDate').val(toDate);
      $(this).val(displayValue).addClass('has-value');

      const url = new URL(window.location.href);
      url.searchParams.set('fromDate', fromDate);
      url.searchParams.set('toDate', toDate);
      window.location.href = url.toString();
    });

    $input.on('cancel.daterangepicker', function () {
      $(this).val('').removeClass('has-value');
      $('#fromDate').val('');
      $('#toDate').val('');

      const url = new URL(window.location.href);
      url.searchParams.delete('fromDate');
      url.searchParams.delete('toDate');
      window.location.href = url.toString();
    });
  };

  const initViewSwitch = () => {
    const buttons = document.querySelectorAll('.view-btn');
    if (!buttons.length) {
      return;
    }

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const view = btn.getAttribute('data-view');
        if (!view) {
          return;
        }

        const url = new URL(window.location.href);
        url.searchParams.set('view', view);
        window.location.href = url.toString();
      });
    });
  };

  const initGroupSwitch = () => {
    const buttons = document.querySelectorAll('.group-btn');
    const select = document.getElementById('groupMode');

    if (!buttons.length && !select) {
      return;
    }

    buttons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const group = btn.getAttribute('data-group');
        if (!group) {
          return;
        }

        const url = new URL(window.location.href);
        url.searchParams.set('group', group);
        window.location.href = url.toString();
      });
    });

    if (select) {
      select.addEventListener('change', () => {
        const group = select.value;
        if (!group) {
          return;
        }

        const url = new URL(window.location.href);
        url.searchParams.set('group', group);
        window.location.href = url.toString();
      });
    }
  };

  const initPeriodSelect = () => {
    const container = document.getElementById('periodSelect');
    if (!container || !window.moment) {
      return;
    }

    const dateRangeWrap = document.getElementById('dateRangeWrap');
    const mode = container.dataset.mode || 'day';
    const minYear = parseInt(container.dataset.minYear, 10);
    const maxYear = parseInt(container.dataset.maxYear, 10);
    const fromDate = container.dataset.from || '';
    const toDate = container.dataset.to || '';
    const now = moment();
    const yearStart = Number.isFinite(minYear) ? minYear : now.year();
    const yearEnd = Number.isFinite(maxYear) ? maxYear : now.year();
    const initialFrom = fromDate ? moment(fromDate, 'YYYY-MM-DD') : now.clone();
    const initialTo = toDate ? moment(toDate, 'YYYY-MM-DD') : now.clone();

    const yearGroup = container.querySelector('.period-year');
    const monthGroup = container.querySelector('.period-month');
    const weekGroup = container.querySelector('.period-week');

    const fromYear = document.getElementById('fromYear');
    const toYear = document.getElementById('toYear');
    const fromMonth = document.getElementById('fromMonth');
    const toMonth = document.getElementById('toMonth');
    const fromMonthYear = document.getElementById('fromMonthYear');
    const toMonthYear = document.getElementById('toMonthYear');
    const fromWeek = document.getElementById('fromWeek');
    const toWeek = document.getElementById('toWeek');
    const fromWeekYear = document.getElementById('fromWeekYear');
    const toWeekYear = document.getElementById('toWeekYear');

    const monthNames = [
      'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
      'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ];

    const buildOptions = (select, items, selected) => {
      if (!select) {
        return;
      }
      select.innerHTML = '';
      items.forEach((item) => {
        const option = document.createElement('option');
        option.value = String(item.value);
        option.textContent = item.label;
        if (String(item.value) === String(selected)) {
          option.selected = true;
        }
        select.appendChild(option);
      });
    };

    const buildYearOptions = (select, selected) => {
      const items = [];
      for (let year = yearStart; year <= yearEnd; year += 1) {
        items.push({ value: year, label: year });
      }
      buildOptions(select, items, selected);
    };

    const buildMonthOptions = (select, selected) => {
      const items = monthNames.map((name, index) => ({
        value: index + 1,
        label: name
      }));
      buildOptions(select, items, selected);
    };

    const buildWeekOptions = (select, year, selected) => {
      if (!select) {
        return;
      }
      const weeksInYear = moment().year(year).isoWeeksInYear();
      const items = [];
      for (let week = 1; week <= weeksInYear; week += 1) {
        items.push({ value: week, label: `Tuần ${week}` });
      }
      buildOptions(select, items, selected);
    };

    const updateUrl = (startDate, endDate) => {
      const url = new URL(window.location.href);
      url.searchParams.set('fromDate', startDate.format('YYYY-MM-DD'));
      url.searchParams.set('toDate', endDate.format('YYYY-MM-DD'));
      window.location.href = url.toString();
    };

    const swapValues = (a, b) => {
      return [b, a];
    };

    const syncYearRange = () => {
      let fromValue = parseInt(fromYear.value, 10);
      let toValue = parseInt(toYear.value, 10);
      if (fromValue > toValue) {
        [fromValue, toValue] = swapValues(fromValue, toValue);
        fromYear.value = String(fromValue);
        toYear.value = String(toValue);
      }
      const start = moment({ year: fromValue, month: 0, day: 1 }).startOf('year');
      const end = moment({ year: toValue, month: 0, day: 1 }).endOf('year');
      updateUrl(start, end);
    };

    const syncMonthRange = () => {
      let fromValue = moment({
        year: parseInt(fromMonthYear.value, 10),
        month: parseInt(fromMonth.value, 10) - 1,
        day: 1
      }).startOf('month');
      let toValue = moment({
        year: parseInt(toMonthYear.value, 10),
        month: parseInt(toMonth.value, 10) - 1,
        day: 1
      }).endOf('month');

      if (fromValue.isAfter(toValue)) {
        const fromMonthVal = fromMonth.value;
        const fromYearVal = fromMonthYear.value;
        fromMonth.value = toMonth.value;
        fromMonthYear.value = toMonthYear.value;
        toMonth.value = fromMonthVal;
        toMonthYear.value = fromYearVal;
        fromValue = moment({
          year: parseInt(fromMonthYear.value, 10),
          month: parseInt(fromMonth.value, 10) - 1,
          day: 1
        }).startOf('month');
        toValue = moment({
          year: parseInt(toMonthYear.value, 10),
          month: parseInt(toMonth.value, 10) - 1,
          day: 1
        }).endOf('month');
      }

      updateUrl(fromValue, toValue);
    };

    const syncWeekRange = () => {
      let fromYearValue = parseInt(fromWeekYear.value, 10);
      let toYearValue = parseInt(toWeekYear.value, 10);
      let fromWeekValue = parseInt(fromWeek.value, 10);
      let toWeekValue = parseInt(toWeek.value, 10);

      let fromValue = moment().isoWeekYear(fromYearValue).isoWeek(fromWeekValue).startOf('isoWeek');
      let toValue = moment().isoWeekYear(toYearValue).isoWeek(toWeekValue).endOf('isoWeek');

      if (fromValue.isAfter(toValue)) {
        [fromYearValue, toYearValue] = swapValues(fromYearValue, toYearValue);
        [fromWeekValue, toWeekValue] = swapValues(fromWeekValue, toWeekValue);
        fromWeekYear.value = String(fromYearValue);
        toWeekYear.value = String(toYearValue);
        buildWeekOptions(fromWeek, fromYearValue, fromWeekValue);
        buildWeekOptions(toWeek, toYearValue, toWeekValue);
        fromValue = moment().isoWeekYear(fromYearValue).isoWeek(fromWeekValue).startOf('isoWeek');
        toValue = moment().isoWeekYear(toYearValue).isoWeek(toWeekValue).endOf('isoWeek');
      }

      updateUrl(fromValue, toValue);
    };

    const setActiveGroup = (groupMode) => {
      const isDateRange = groupMode === 'hour' || groupMode === 'day';
      if (dateRangeWrap) {
        dateRangeWrap.classList.toggle('is-hidden', !isDateRange);
      }
      container.classList.toggle('is-hidden', isDateRange);

      if (yearGroup) {
        yearGroup.classList.toggle('is-active', groupMode === 'year');
      }
      if (monthGroup) {
        monthGroup.classList.toggle('is-active', groupMode === 'month');
      }
      if (weekGroup) {
        weekGroup.classList.toggle('is-active', groupMode === 'week');
      }
    };

    buildYearOptions(fromYear, initialFrom.year());
    buildYearOptions(toYear, initialTo.year());
    buildMonthOptions(fromMonth, initialFrom.month() + 1);
    buildMonthOptions(toMonth, initialTo.month() + 1);
    buildYearOptions(fromMonthYear, initialFrom.year());
    buildYearOptions(toMonthYear, initialTo.year());
    buildYearOptions(fromWeekYear, initialFrom.isoWeekYear());
    buildYearOptions(toWeekYear, initialTo.isoWeekYear());
    buildWeekOptions(fromWeek, initialFrom.isoWeekYear(), initialFrom.isoWeek());
    buildWeekOptions(toWeek, initialTo.isoWeekYear(), initialTo.isoWeek());

    setActiveGroup(mode);

    if (fromYear && toYear) {
      fromYear.addEventListener('change', syncYearRange);
      toYear.addEventListener('change', syncYearRange);
    }

    if (fromMonth && toMonth && fromMonthYear && toMonthYear) {
      fromMonth.addEventListener('change', syncMonthRange);
      toMonth.addEventListener('change', syncMonthRange);
      fromMonthYear.addEventListener('change', syncMonthRange);
      toMonthYear.addEventListener('change', syncMonthRange);
    }

    if (fromWeek && toWeek && fromWeekYear && toWeekYear) {
      fromWeek.addEventListener('change', syncWeekRange);
      toWeek.addEventListener('change', syncWeekRange);
      fromWeekYear.addEventListener('change', () => {
        const yearValue = parseInt(fromWeekYear.value, 10);
        buildWeekOptions(fromWeek, yearValue, 1);
        syncWeekRange();
      });
      toWeekYear.addEventListener('change', () => {
        const yearValue = parseInt(toWeekYear.value, 10);
        buildWeekOptions(toWeek, yearValue, 1);
        syncWeekRange();
      });
    }
  };

  const initCustomSelects = () => {
    const selects = document.querySelectorAll('select.custom-select');
    if (!selects.length) {
      return;
    }

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

      const label = document.createElement('span');
      label.className = 'label';

      const arrow = document.createElement('span');
      arrow.className = 'arrow';
      arrow.textContent = '▾';

      trigger.appendChild(label);
      trigger.appendChild(arrow);

      const dropdown = document.createElement('div');
      dropdown.className = 'custom-select-dropdown';

      const searchEnabled = select.dataset.search === 'true';
      let searchInput = null;
      if (searchEnabled) {
        searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.className = 'custom-select-search';
        searchInput.placeholder = select.dataset.placeholder || 'Tìm kiếm...';
        dropdown.appendChild(searchInput);
      }

      const list = document.createElement('div');
      list.className = 'custom-select-list';
      dropdown.appendChild(list);

      const emptyState = document.createElement('div');
      emptyState.className = 'custom-select-empty';
      emptyState.textContent = 'Không có kết quả';
      dropdown.appendChild(emptyState);

      const syncLabel = () => {
        const selected = select.options[select.selectedIndex];
        label.textContent = selected ? selected.textContent : select.dataset.placeholder || 'Chọn';
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

  const onReady = () => {
    initPrint();
    initDateRange();
    initViewSwitch();
    initGroupSwitch();
    initPeriodSelect();
    initCustomSelects();
  };

  if (window.jQuery) {
    $(onReady);
  } else {
    document.addEventListener('DOMContentLoaded', onReady);
  }
})();
