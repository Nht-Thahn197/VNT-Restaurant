@extends('layout.pos')

@section('title', 'VNT Pos - Báo cáo cuối ngày')

@section('content')
  @push('css')
    <link rel="stylesheet" href="{{ asset('css/pos/daily-report.css') }}">
    <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/daterangepicker/daterangepicker.css" />
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/flatpickr/dist/flatpickr.min.css">
  @endpush

  <div class="daily-report-page">
    <div class="report-header">
      <div class="title-wrap">
        <div class="title-label">Báo cáo cuối ngày</div>
        <h2>{{ $dateLabel }}</h2>
        <div class="title-actions">
          <div class="time-custom">
            <input
              type="text"
              id="dateRange"
              class="input-text{{ $dateRangeValue ? ' has-value' : '' }}"
              placeholder="Lựa chọn khác"
              value="{{ $dateRangeValue }}"
              data-from="{{ $fromDate }}"
              data-to="{{ $toDate }}"
              readonly
            >
            <input type="hidden" id="fromDate" value="{{ $fromDate }}">
            <input type="hidden" id="toDate" value="{{ $toDate }}">
          </div>
          <div class="report-actions">
            <button type="button" class="btn-print" id="btnPrintReport">
              <i class="fas fa-print"></i> In báo cáo
            </button>
          </div>
        </div>
      </div>
      <div class="subtitle">
        Từ {{ $startTime->format('d/m/Y 00:00') }} đến {{ $endTime->format('d/m/Y H:i') }}
      </div>
    </div>

    <div class="report-cards">
      <div class="card">
        <div class="card-title">Doanh thu gộp (trước giảm giá)</div>
        <div class="card-value">{{ number_format($report['gross_revenue'], 0, ',', '.') }}₫</div>
      </div>
      <div class="card">
        <div class="card-title">Chiết khấu</div>
        <div class="card-value">{{ number_format($report['discount'], 0, ',', '.') }}₫</div>
      </div>
      <div class="card">
        <div class="card-title">Doanh thu thực tế (sau giảm giá)</div>
        <div class="card-value">{{ number_format($report['net_revenue'], 0, ',', '.') }}₫</div>
      </div>
      <div class="card">
        <div class="card-title">Chi phí nhập hàng</div>
        <div class="card-value">{{ number_format($report['total_expense'], 0, ',', '.') }}₫</div>
      </div>
      <div class="card highlight">
        <div class="card-title">Lợi nhuận</div>
        <div class="card-value">{{ number_format($report['profit'], 0, ',', '.') }}₫</div>
      </div>
    </div>

    <div class="report-grid">
      <div class="panel">
        <div class="panel-title">Tổng hợp thanh toán</div>
        <div class="panel-body">
          <div class="metric-row">
            <span>Tiền mặt</span>
            <strong>{{ number_format($report['cash'], 0, ',', '.') }}₫</strong>
          </div>
          <div class="metric-row">
            <span>Chuyển khoản</span>
            <strong>{{ number_format($report['transfer'], 0, ',', '.') }}₫</strong>
          </div>
          <div class="metric-row">
            <span>Thẻ</span>
            <strong>{{ number_format($report['card'], 0, ',', '.') }}₫</strong>
          </div>
        </div>
      </div>

      <div class="panel">
        <div class="panel-title">Tình trạng hóa đơn</div>
        <div class="panel-body">
          <div class="metric-row">
            <span>Hoàn thành</span>
            <strong>{{ $report['success_invoice'] }}</strong>
          </div>
          <div class="metric-row">
            <span>Hủy</span>
            <strong>{{ $report['cancel_invoice'] }}</strong>
          </div>
          <div class="metric-row">
            <span>Thời điểm chốt</span>
            <strong>{{ $report['closed_at']->format('d/m/Y H:i') }}</strong>
          </div>
        </div>
      </div>
    </div>

    <div class="imports-section">
      <div class="section-title">Chi phí nhập hàng</div>
      <table class="data-table">
        <thead>
          <tr>
            <th>Thời gian</th>
            <th>Ghi chú</th>
            <th>Tổng tiền</th>
          </tr>
        </thead>
        <tbody>
          @forelse($imports as $import)
            <tr>
              <td>{{ \Carbon\Carbon::parse($import->created_at)->format('d/m/Y H:i') }}</td>
              <td>Phiếu nhập</td>
              <td>{{ number_format($import->total_price ?? 0, 0, ',', '.') }}₫</td>
            </tr>
          @empty
            <tr>
              <td colspan="3" class="empty-state">Chưa có phiếu nhập trong ngày</td>
            </tr>
          @endforelse
        </tbody>
      </table>
    </div>
  </div>

    @push('js')
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/moment@2.29.4/moment.min.js"></script>
    <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/daterangepicker/daterangepicker.min.js"></script>
    <script src="{{ asset('js/pos/report.js') }}"></script>
  @endpush

@endsection
