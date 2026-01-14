@extends('layout.pos')

@section('title', 'VNT Pos - Báo cáo nhân viên')

@section('content')
  @push('css')
    <link rel="stylesheet" href="{{ asset('css/pos/product-report.css') }}">
    <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/daterangepicker/daterangepicker.css" />
  @endpush

  <div class="product-report-page">
    <div class="report-header">
      <div class="title-wrap">
        <div class="title-label">Báo cáo nhân viên</div>
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
          <div class="view-switch" data-view="{{ $viewMode }}">
            <button type="button" class="view-btn{{ $viewMode === 'table' ? ' active' : '' }}" data-view="table">Bảng</button>
            <button type="button" class="view-btn{{ $viewMode === 'cards' ? ' active' : '' }}" data-view="cards">Thẻ</button>
            <button type="button" class="view-btn{{ $viewMode === 'chart' ? ' active' : '' }}" data-view="chart">Biểu đồ</button>
          </div>
        </div>
      </div>
      <div class="subtitle">
        Từ {{ $startTime->format('d/m/Y 00:00') }} đến {{ $endTime->format('d/m/Y H:i') }}
      </div>
    </div>

    @php
      $maxRevenue = $staffStats->max('total_revenue') ?: 1;
    @endphp

    @if ($viewMode === 'cards')
      <div class="metric-cards">
        <div class="metric-card">
          <div class="metric-title">Tổng doanh thu</div>
          <div class="metric-value">{{ number_format($totalRevenue, 0, ',', '.') }} ₫</div>
        </div>
        <div class="metric-card">
          <div class="metric-title">Tổng hóa đơn</div>
          <div class="metric-value">{{ number_format($totalInvoices, 0, ',', '.') }}</div>
        </div>
        <div class="metric-card highlight">
          <div class="metric-title">Nhân viên bán tốt nhất</div>
          <div class="metric-value">
            {{ optional($staffStats->first())->staff_name ?? '-' }}
          </div>
          <div class="metric-sub">Doanh thu: {{ number_format(optional($staffStats->first())->total_revenue ?? 0, 0, ',', '.') }} ₫</div>
        </div>
      </div>

      <div class="cards-grid">
        <div class="panel">
          <div class="panel-title">Top nhân viên theo doanh thu</div>
          <div class="panel-body">
            @forelse ($staffStats as $index => $item)
              <div class="list-row">
                <span class="rank">#{{ $index + 1 }}</span>
                <span class="name">{{ $item->staff_name }}</span>
                <span class="value">{{ number_format($item->total_revenue, 0, ',', '.') }} ₫</span>
              </div>
            @empty
              <div class="empty-state">Chưa có dữ liệu</div>
            @endforelse
          </div>
        </div>

        <div class="panel">
          <div class="panel-title">So sánh theo thời gian</div>
          <div class="panel-body">
            <div class="compare-row">
              <span>Hiện tại</span>
              <strong>{{ number_format($totalRevenue, 0, ',', '.') }} ₫</strong>
            </div>
            <div class="compare-row">
              <span>Kỳ trước ({{ $prevStart->format('d/m/Y') }} - {{ $prevEnd->format('d/m/Y') }})</span>
              <strong>{{ number_format($prevRevenue, 0, ',', '.') }} ₫</strong>
            </div>
          </div>
        </div>
      </div>
    @elseif ($viewMode === 'chart')
      <div class="chart-section">
        <div class="panel">
          <div class="panel-title">Top nhân viên theo doanh thu</div>
          <div class="panel-body">
            @forelse ($staffStats as $item)
              <div class="bar-row">
                <div class="bar-label">{{ $item->staff_name }}</div>
                <div class="bar-track">
                  <div class="bar-fill" style="width: {{ ($item->total_revenue / $maxRevenue) * 100 }}%"></div>
                </div>
                <div class="bar-value">{{ number_format($item->total_revenue, 0, ',', '.') }} ₫</div>
              </div>
            @empty
              <div class="empty-state">Chưa có dữ liệu</div>
            @endforelse
          </div>
        </div>

        <div class="panel">
          <div class="panel-title">So sánh theo thời gian</div>
          <div class="panel-body">
            @php
              $compareMax = max($totalRevenue, $prevRevenue, 1);
            @endphp
            <div class="bar-row">
              <div class="bar-label">Hiện tại</div>
              <div class="bar-track">
                <div class="bar-fill" style="width: {{ ($totalRevenue / $compareMax) * 100 }}%"></div>
              </div>
              <div class="bar-value">{{ number_format($totalRevenue, 0, ',', '.') }} ₫</div>
            </div>
            <div class="bar-row">
              <div class="bar-label">Kỳ trước</div>
              <div class="bar-track">
                <div class="bar-fill muted" style="width: {{ ($prevRevenue / $compareMax) * 100 }}%"></div>
              </div>
              <div class="bar-value">{{ number_format($prevRevenue, 0, ',', '.') }} ₫</div>
            </div>
          </div>
        </div>
      </div>
    @else
      <div class="table-section">
        <div class="panel">
          <div class="panel-title">Top nhân viên theo doanh thu</div>
          <table class="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Tên nhân viên</th>
                <th>Số lượng bán</th>
                <th>Hóa đơn</th>
                <th>Doanh thu</th>
                <th>TB/hóa đơn</th>
              </tr>
            </thead>
            <tbody>
              @forelse ($staffStats as $index => $item)
                <tr>
                  <td>{{ $index + 1 }}</td>
                  <td>{{ $item->staff_name }}</td>
                  <td>{{ number_format($item->total_quantity, 0, ',', '.') }}</td>
                  <td>{{ number_format($item->total_invoices, 0, ',', '.') }}</td>
                  <td>{{ number_format($item->total_revenue, 0, ',', '.') }} ₫</td>
                  <td>
                    {{ number_format(($item->total_revenue / max($item->total_invoices, 1)), 0, ',', '.') }} ₫
                  </td>
                </tr>
              @empty
                <tr>
                  <td colspan="6" class="empty-state">Chưa có dữ liệu</td>
                </tr>
              @endforelse
            </tbody>
          </table>
        </div>

        <div class="panel">
          <div class="panel-title">Tổng số liệu</div>
          <div class="panel-body">
            <div class="metric-row">
              <span>Tổng số lượng</span>
              <strong>{{ number_format($totalQuantity, 0, ',', '.') }}</strong>
            </div>
            <div class="metric-row">
              <span>Tổng hóa đơn</span>
              <strong>{{ number_format($totalInvoices, 0, ',', '.') }}</strong>
            </div>
            <div class="metric-row">
              <span>Tổng doanh thu</span>
              <strong>{{ number_format($totalRevenue, 0, ',', '.') }} ₫</strong>
            </div>
          </div>
        </div>

        <div class="panel">
          <div class="panel-title">So sánh theo thời gian</div>
          <div class="panel-body">
            <div class="compare-row">
              <span>Hiện tại</span>
              <strong>{{ number_format($totalRevenue, 0, ',', '.') }} ₫</strong>
            </div>
            <div class="compare-row">
              <span>Kỳ trước ({{ $prevStart->format('d/m/Y') }} - {{ $prevEnd->format('d/m/Y') }})</span>
              <strong>{{ number_format($prevRevenue, 0, ',', '.') }} ₫</strong>
            </div>
          </div>
        </div>
      </div>
    @endif
  </div>

  @push('js')
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/moment@2.29.4/moment.min.js"></script>
    <script type="text/javascript" src="https://cdn.jsdelivr.net/npm/daterangepicker/daterangepicker.min.js"></script>
    <script src="{{ asset('js/pos/report.js') }}"></script>
  @endpush
@endsection
