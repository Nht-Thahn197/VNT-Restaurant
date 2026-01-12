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

  const onReady = () => {
    initPrint();
    initDateRange();
    initViewSwitch();
  };

  if (window.jQuery) {
    $(onReady);
  } else {
    document.addEventListener('DOMContentLoaded', onReady);
  }
})();
