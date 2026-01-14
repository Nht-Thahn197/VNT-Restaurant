document.addEventListener('DOMContentLoaded', function () {
  document.documentElement.classList.add('js');

  var monthInput = document.getElementById('payrollMonth');
  var monthDisplay = document.getElementById('payrollMonthDisplay');
  var monthText = document.getElementById('payrollMonthText');
  var monthPanel = document.getElementById('payrollMonthPanel');
  var monthYear = document.getElementById('payrollMonthYear');
  var monthGrid = document.getElementById('payrollMonthGrid');
  var monthClear = document.querySelector('.month-clear');
  var monthCurrent = document.querySelector('.month-current');
  var generateMonth = document.getElementById('payrollGenerateMonth');

  var statusSelect = document.getElementById('payrollStatus');
  var statusTrigger = document.getElementById('payrollStatusDisplay');
  var statusText = document.getElementById('payrollStatusText');
  var statusMenu = document.getElementById('payrollStatusMenu');

  var closePanels = function () {
    if (monthPanel) {
      monthPanel.classList.remove('open');
      monthPanel.setAttribute('aria-hidden', 'true');
    }
    if (monthDisplay) {
      monthDisplay.setAttribute('aria-expanded', 'false');
    }
    if (statusMenu) {
      statusMenu.classList.remove('open');
      statusMenu.setAttribute('aria-hidden', 'true');
    }
    if (statusTrigger) {
      statusTrigger.setAttribute('aria-expanded', 'false');
    }
  };

  var syncGenerate = function () {
    if (generateMonth && monthInput) {
      generateMonth.value = monthInput.value;
    }
  };

  var parseMonthValue = function (value) {
    if (!value) {
      return null;
    }
    var parts = value.split('-');
    if (parts.length !== 2) {
      return null;
    }
    var year = parseInt(parts[0], 10);
    var month = parseInt(parts[1], 10);
    if (!year || !month) {
      return null;
    }
    return { year: year, month: month };
  };

  var updateMonthDisplay = function () {
    if (!monthInput || !monthText) {
      return;
    }
    if (!monthInput.value) {
      monthText.textContent = monthText.dataset.placeholder || '--';
      monthText.classList.add('is-placeholder');
      return;
    }
    var parsed = parseMonthValue(monthInput.value);
    if (!parsed) {
      monthText.textContent = monthText.dataset.placeholder || '--';
      monthText.classList.add('is-placeholder');
      return;
    }
    monthText.textContent = 'Thg ' + parsed.month + '/' + parsed.year;
    monthText.classList.remove('is-placeholder');
  };

  var monthStateYear = null;
  var renderMonthGrid = function () {
    if (!monthGrid || !monthYear) {
      return;
    }
    var selected = monthInput ? parseMonthValue(monthInput.value) : null;
    monthYear.textContent = monthStateYear;
    monthGrid.innerHTML = '';

    var labels = [
      'Thg 1', 'Thg 2', 'Thg 3', 'Thg 4',
      'Thg 5', 'Thg 6', 'Thg 7', 'Thg 8',
      'Thg 9', 'Thg 10', 'Thg 11', 'Thg 12'
    ];

    labels.forEach(function (label, index) {
      var monthNumber = index + 1;
      var button = document.createElement('button');
      button.type = 'button';
      button.className = 'month-item';
      button.textContent = label;
      if (selected && selected.year === monthStateYear && selected.month === monthNumber) {
        button.classList.add('is-active');
      }
      button.addEventListener('click', function () {
        var formatted = monthNumber < 10 ? '0' + monthNumber : '' + monthNumber;
        if (monthInput) {
          monthInput.value = monthStateYear + '-' + formatted;
          monthInput.dispatchEvent(new Event('change', { bubbles: true }));
        }
        updateMonthDisplay();
        renderMonthGrid();
        closePanels();
      });
      monthGrid.appendChild(button);
    });
  };

  if (monthInput && monthDisplay && monthText && monthPanel && monthYear && monthGrid) {
    var today = new Date();
    var selected = parseMonthValue(monthInput.value);
    monthStateYear = selected ? selected.year : today.getFullYear();

    updateMonthDisplay();
    renderMonthGrid();
    syncGenerate();

    monthDisplay.addEventListener('click', function (event) {
      event.stopPropagation();
      var isOpen = monthPanel.classList.contains('open');
      closePanels();
      if (!isOpen) {
        monthPanel.classList.add('open');
        monthPanel.setAttribute('aria-hidden', 'false');
        monthDisplay.setAttribute('aria-expanded', 'true');
      }
    });

    monthPanel.addEventListener('click', function (event) {
      event.stopPropagation();
    });

    var navButtons = monthPanel.querySelectorAll('.month-nav');
    navButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        var dir = parseInt(button.dataset.dir, 10);
        monthStateYear += dir;
        renderMonthGrid();
      });
    });

    if (monthClear) {
      monthClear.addEventListener('click', function () {
        monthInput.value = '';
        monthInput.dispatchEvent(new Event('change', { bubbles: true }));
        updateMonthDisplay();
        renderMonthGrid();
        closePanels();
      });
    }

    if (monthCurrent) {
      monthCurrent.addEventListener('click', function () {
        var currentYear = today.getFullYear();
        var currentMonth = today.getMonth() + 1;
        var formatted = currentMonth < 10 ? '0' + currentMonth : '' + currentMonth;
        monthStateYear = currentYear;
        monthInput.value = currentYear + '-' + formatted;
        monthInput.dispatchEvent(new Event('change', { bubbles: true }));
        updateMonthDisplay();
        renderMonthGrid();
        closePanels();
      });
    }

    monthInput.addEventListener('change', function () {
      updateMonthDisplay();
      syncGenerate();
    });
  }

  if (statusSelect && statusTrigger && statusText && statusMenu) {
    var buildStatusMenu = function () {
      statusMenu.innerHTML = '';
      Array.prototype.slice.call(statusSelect.options).forEach(function (option) {
        var button = document.createElement('button');
        button.type = 'button';
        button.textContent = option.text;
        button.dataset.value = option.value;
        if (option.selected) {
          button.classList.add('is-selected');
        }
        button.addEventListener('click', function () {
          statusSelect.value = option.value;
          statusSelect.dispatchEvent(new Event('change', { bubbles: true }));
          closePanels();
        });
        statusMenu.appendChild(button);
      });
    };

    var updateStatusDisplay = function () {
      var selectedOption = statusSelect.options[statusSelect.selectedIndex];
      statusText.textContent = selectedOption ? selectedOption.text : '';
      Array.prototype.slice.call(statusMenu.children).forEach(function (child) {
        if (child.dataset.value === statusSelect.value) {
          child.classList.add('is-selected');
        } else {
          child.classList.remove('is-selected');
        }
      });
    };

    buildStatusMenu();
    updateStatusDisplay();

    statusTrigger.addEventListener('click', function (event) {
      event.stopPropagation();
      var isOpen = statusMenu.classList.contains('open');
      closePanels();
      if (!isOpen) {
        statusMenu.classList.add('open');
        statusMenu.setAttribute('aria-hidden', 'false');
        statusTrigger.setAttribute('aria-expanded', 'true');
      }
    });

    statusMenu.addEventListener('click', function (event) {
      event.stopPropagation();
    });

    statusSelect.addEventListener('change', updateStatusDisplay);
  }

  document.addEventListener('click', closePanels);
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
      closePanels();
    }
  });

  var moneyInputs = document.querySelectorAll('input[data-money]');
  var formatter = new Intl.NumberFormat('vi-VN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  });

  var parseNumber = function (value) {
    var raw = (value || '').toString().trim();
    if (!raw) {
      return 0;
    }
    raw = raw.replace(/\s/g, '');
    var lastComma = raw.lastIndexOf(',');
    var lastDot = raw.lastIndexOf('.');
    if (lastComma > -1 && lastDot > -1) {
      if (lastComma > lastDot) {
        raw = raw.replace(/\./g, '');
        raw = raw.replace(/,/g, '.');
      } else {
        raw = raw.replace(/,/g, '');
      }
    } else if (lastComma > -1) {
      raw = raw.replace(/,/g, '.');
    } else {
      raw = raw.replace(/[^0-9.-]/g, '');
    }
    var parsed = parseFloat(raw);
    return isNaN(parsed) ? 0 : parsed;
  };

  var formatMoneyInput = function (input) {
    var number = parseNumber(input.value);
    input.dataset.raw = number.toString();
    input.value = formatter.format(number);
  };

  moneyInputs.forEach(function (input) {
    formatMoneyInput(input);
    input.addEventListener('focus', function () {
      if (input.dataset.raw) {
        input.value = input.dataset.raw;
      }
    });
    input.addEventListener('blur', function () {
      formatMoneyInput(input);
    });
  });

  var rowForms = document.querySelectorAll('form[id^="payroll-form-"]');
  rowForms.forEach(function (form) {
    form.addEventListener('submit', function () {
      var inputs = document.querySelectorAll('input[data-money][form="' + form.id + '"]');
      inputs.forEach(function (input) {
        var number = parseNumber(input.value);
        input.value = number.toFixed(2);
      });
    });
  });

  var generateForm = document.getElementById('payrollGenerateForm');
  var generateButton = document.getElementById('payrollGenerateBtn');
  if (generateForm) {
    generateForm.addEventListener('submit', function (event) {
      if (generateForm.dataset.submitting === '1') {
        event.preventDefault();
        return;
      }
      generateForm.dataset.submitting = '1';
      if (generateButton) {
        generateButton.disabled = true;
        generateButton.textContent = 'Dang tong hop...';
      }
    });
  }
});
