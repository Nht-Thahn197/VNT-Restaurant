@extends('layout.pos')

@section('title', 'VNT Pos - Lịch làm việc')

@section('content')
  @push('css')
    <link rel="stylesheet" href="{{ asset('css/pos/work-schedule.css') }}">
  @endpush

  <div class="schedule-page" data-view="shift" data-endpoint="{{ url('/pos/work-schedule/data') }}"
       data-store-endpoint="{{ url('/pos/work-schedule/store') }}"
       data-delete-endpoint="{{ url('/pos/work-schedule/delete') }}">
    <div class="schedule-header">
      <div class="header-left">
        <h1 class="page-title">Lịch làm việc</h1>
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input type="text" id="staffSearch" placeholder="Tìm kiếm nhân viên">
        </div>
      </div>
      <div class="header-right">
        <div class="week-controls">
          <button class="nav-btn" id="prevWeek" aria-label="Tuần trước">
            <i class="fas fa-chevron-left"></i>
          </button>
          <button class="week-label" id="weekLabel"></button>
          <button class="nav-btn" id="nextWeek" aria-label="Tuần sau">
            <i class="fas fa-chevron-right"></i>
          </button>
          <button class="btn-outline" id="btnCurrentWeek">Tuần này</button>
        </div>
        <div class="view-switcher">
          <button class="view-btn active" data-view="shift">
            <i class="far fa-clock"></i>
            Xem theo ca
          </button>
          <button class="view-btn" data-view="staff">
            <i class="far fa-user"></i>
            Xem theo nhân viên
          </button>
        </div>
        <div class="action-buttons">
          <button class="btn-outline">
            <i class="fas fa-file-import"></i> Import
          </button>
          <button class="btn-outline">
            <i class="fas fa-file-export"></i> Xuất file
          </button>
        </div>
      </div>
    </div>

    <div class="schedule-board">
      <div class="schedule-table">
        <div class="schedule-row header-row" id="scheduleHeader"></div>
        <div class="schedule-body" id="scheduleBody"></div>
      </div>
    </div>
  </div>

  <div class="schedule-modal" id="shiftModal">
    <div class="modal-card">
      <div class="modal-header">
        <h2>Thêm lịch làm việc</h2>
        <button class="modal-close" data-close="shiftModal">×</button>
      </div>
      <div class="modal-meta">
        <span><i class="far fa-clock"></i> <span id="modalShiftInfo"></span></span>
        <span><i class="far fa-calendar"></i> <span id="modalShiftDate"></span></span>
      </div>
      <div class="modal-section">
        <div class="section-title">
          Chọn nhân viên
          <button class="icon-btn">+</button>
        </div>
        <div class="modal-search">
          <i class="fas fa-search"></i>
          <input type="text" placeholder="Tìm kiếm nhân viên">
        </div>
        <div class="picker-grid" id="shiftStaffList"></div>
      </div>
      <div class="modal-section">
        <div class="toggle-row">
          <div>
            <strong>Lặp lại hàng tuần</strong>
            <div class="hint-text">Lịch làm việc sẽ được tự động lặp lại vào các ngày trong tuần</div>
          </div>
          <label class="switch">
            <input type="checkbox" class="repeat-toggle">
            <span class="slider"></span>
          </label>
        </div>
      </div>
      <div class="modal-actions">
        <button class="btn-outline" data-close="shiftModal">Bỏ qua</button>
        <button class="btn-primary" id="saveShiftSchedule">Lưu</button>
      </div>
    </div>
  </div>

  <div class="schedule-modal" id="staffModal">
    <div class="modal-card">
      <div class="modal-header">
        <h2>Thêm lịch làm việc</h2>
        <button class="modal-close" data-close="staffModal">×</button>
      </div>
      <div class="modal-meta">
        <span><i class="far fa-user"></i> <span id="modalStaffInfo"></span></span>
        <span><i class="far fa-calendar"></i> <span id="modalStaffDate"></span></span>
      </div>
      <div class="modal-section">
        <div class="section-title">
          Chọn ca làm việc
          <button class="icon-btn">+</button>
        </div>
        <div class="picker-grid" id="staffShiftList"></div>
      </div>
      <div class="modal-section">
        <div class="toggle-row">
          <div>
            <strong>Lặp lại hàng tuần</strong>
            <div class="hint-text">Lịch làm việc sẽ được tự động lặp lại vào các ngày trong tuần</div>
          </div>
          <label class="switch">
            <input type="checkbox" class="repeat-toggle">
            <span class="slider"></span>
          </label>
        </div>
        <div class="toggle-row">
          <div>
            <strong>Thêm lịch tương tự cho nhân viên khác</strong>
            <div class="hint-text">Lịch làm việc sẽ được áp dụng cho các nhân viên được chọn</div>
          </div>
          <label class="switch">
            <input type="checkbox" class="apply-toggle">
            <span class="slider"></span>
          </label>
        </div>
      </div>
      <div class="modal-actions">
        <button class="btn-outline" data-close="staffModal">Bỏ qua</button>
        <button class="btn-primary" id="saveStaffSchedule">Lưu</button>
      </div>
    </div>
  </div>

  <div class="schedule-modal" id="deleteModal">
    <div class="modal-card small">
      <div class="modal-header">
        <h2>Xóa lịch làm việc</h2>
        <button class="modal-close" data-close="deleteModal">×</button>
      </div>
      <div class="modal-meta" id="deleteMeta"></div>
      <div class="modal-actions">
        <button class="btn-outline" data-close="deleteModal">Bỏ qua</button>
        <button class="btn-primary" id="confirmDeleteSchedule">Xóa</button>
      </div>
    </div>
  </div>

  @push('js')
    <script src="{{ asset('js/pos/work-schedule.js') }}"></script>
  @endpush
@endsection
