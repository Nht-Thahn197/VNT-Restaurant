@extends('layout.pos')

@section('title', 'VNT Pos - Bảng chấm công')

@section('content')
  @push('css')
    <link rel="stylesheet" href="{{ asset('css/pos/attendance.css') }}">
  @endpush

  <div class="attendance-page" data-endpoint="{{ url('/pos/attendance/data') }}"
       data-update-endpoint="{{ url('/pos/attendance/update') }}"
       data-clock-endpoint="{{ url('/pos/attendance/clock') }}"
       data-can-manage="{{ $canManageAttendance ? '1' : '0' }}"
       data-staff-id="{{ $staffId }}">
    <div class="attendance-header">
      <h1>Bảng chấm công</h1>
      <div class="header-controls">
        <div class="search-box">
          <i class="fas fa-search"></i>
          <input type="text" id="attendanceSearch" placeholder="Tìm kiếm nhân viên">
        </div>
        <select class="period-select" disabled>
          <option>Theo tuần</option>
        </select>
        <div class="week-controls">
          <button class="nav-btn" id="prevWeek" aria-label="Tuần trước">
            <i class="fas fa-chevron-left"></i>
          </button>
          <button class="week-label" id="weekLabel">Tuần 1 - Th. 01/2026</button>
          <button class="nav-btn" id="nextWeek" aria-label="Tuần sau">
            <i class="fas fa-chevron-right"></i>
          </button>
        </div>
      </div>
    </div>

    <div class="attendance-board">
      <div class="attendance-table">
        <div class="attendance-row header-row" id="attendanceHeader"></div>
        <div class="attendance-body" id="attendanceBody"></div>
      </div>
    </div>

    <div class="attendance-legend">
      <span class="legend-item status-ok">Đúng giờ</span>
      <span class="legend-item status-late">Đi muộn / Về sớm</span>
      <span class="legend-item status-missing">Chấm công thiếu</span>
      <span class="legend-item status-none">Chưa chấm công</span>
      <span class="legend-item status-future">Chưa đến ca</span>
    </div>
  </div>

  <div class="attendance-modal" id="attendanceModal">
    <div class="modal-card">
      <div class="modal-header">
        <h2>Chấm công</h2>
        <button class="modal-close" data-close="attendanceModal">×</button>
      </div>
      <div class="modal-meta">
        <div><strong id="modalStaffName">--</strong> <span id="modalStaffCode"></span></div>
        <div class="status-pill" id="modalStatusPill">Chưa chấm công</div>
      </div>
      <div class="modal-row">
        <div><strong>Thời gian</strong> <span id="modalWorkDate">--</span></div>
        <div>
          <strong>Ca làm việc</strong>
          <div class="custom-select" id="modalShiftSelectWrap">
            <button type="button" class="custom-select-trigger">
              <span id="modalShiftText">--</span>
              <i class="fas fa-chevron-down"></i>
            </button>
            <div class="custom-select-menu" id="modalShiftMenu"></div>
          </div>
          <select id="modalShiftSelect" class="hidden-select"></select>
        </div>
      </div>
      <div class="modal-row">
        <label>Ghi chú</label>
        <input type="text" id="modalNote" placeholder="Nhập ghi chú nếu có">
      </div>

      <div class="modal-tabs">
        <button class="tab-btn active" data-tab="attendance">Chấm công</button>
        <button class="tab-btn" data-tab="history">Lịch sử chấm công</button>
        <button class="tab-btn" data-tab="penalty">Phạt vi phạm</button>
        <button class="tab-btn" data-tab="reward">Thưởng</button>
      </div>

      <div class="tab-content active" data-content="attendance">
        <div class="radio-row">
          <label><input type="radio" name="modalStatus" value="working" checked> Đi làm</label>
          <label><input type="radio" name="modalStatus" value="leave_paid"> Nghỉ có phép</label>
          <label><input type="radio" name="modalStatus" value="leave_unpaid"> Nghỉ không phép</label>
        </div>
        <div class="time-row">
          <label class="toggle-time"><input type="checkbox" id="modalCheckInToggle"> Vào</label>
          <div class="time-input-wrap" id="modalCheckInWrap">
            <input type="time" id="modalCheckIn">
          </div>
          <label class="toggle-time"><input type="checkbox" id="modalCheckOutToggle"> Ra</label>
          <div class="time-input-wrap" id="modalCheckOutWrap">
            <input type="time" id="modalCheckOut">
          </div>
        </div>
      </div>
      <div class="tab-content" data-content="history">Chưa có dữ liệu.</div>
      <div class="tab-content" data-content="penalty">Chưa có dữ liệu.</div>
      <div class="tab-content" data-content="reward">Chưa có dữ liệu.</div>

      <div class="modal-actions">
        <button class="btn-outline" id="btnCancelShift">Hủy ca</button>
        <button class="btn-outline" data-close="attendanceModal">Bỏ qua</button>
        <button class="btn-outline" id="btnClock">Chấm công</button>
        <button class="btn-primary" id="btnSaveAttendance">Lưu</button>
      </div>
    </div>
  </div>

  @push('js')
    <script src="{{ asset('js/pos/attendance.js') }}"></script>
  @endpush
@endsection
