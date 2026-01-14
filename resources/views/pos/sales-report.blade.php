@extends('layout.pos')

@section('title', 'VNT Pos - Báo cáo bán hàng')

@section('content')
  @push('css')
    <link rel="stylesheet" href="{{ asset('css/pos/sales-report.css') }}">
    <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/daterangepicker/daterangepicker.css" />
  @endpush

  <div class="product-report-page">
    <div class="report-header">
      <div class="title-wrap">
        <div class="title-label">Báo cáo bán hàng</div>
        <h2>{{ $dateLabel }}</h2>
        <div class="title-actions">
          <div class="time-custom{{ in_array($groupMode, ['hour', 'day']) ? '' : ' is-hidden' }}" id="dateRangeWrap">
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
          <div
            class="period-select{{ in_array($groupMode, ['hour', 'day']) ? ' is-hidden' : '' }}"
            id="periodSelect"
            data-mode="{{ $groupMode }}"
            data-min-year="{{ $minYear }}"
            data-max-year="{{ $maxYear }}"
            data-from="{{ $fromDate }}"
            data-to="{{ $toDate }}"
          >
            <div class="period-group period-year">
              <select id="fromYear" class="period-input custom-select" data-search="true" data-placeholder="Từ năm"></select>
              <span class="period-sep">→</span>
              <select id="toYear" class="period-input custom-select" data-search="true" data-placeholder="Đến năm"></select>
            </div>
            <div class="period-group period-month">
              <select id="fromMonth" class="period-input custom-select" data-search="true" data-placeholder="Từ tháng"></select>
              <select id="fromMonthYear" class="period-input custom-select" data-search="true" data-placeholder="Năm"></select>
              <span class="period-sep">→</span>
              <select id="toMonth" class="period-input custom-select" data-search="true" data-placeholder="Đến tháng"></select>
              <select id="toMonthYear" class="period-input custom-select" data-search="true" data-placeholder="Năm"></select>
            </div>
            <div class="period-group period-week">
              <select id="fromWeek" class="period-input custom-select" data-search="true" data-placeholder="Từ tuần"></select>
              <select id="fromWeekYear" class="period-input custom-select" data-search="true" data-placeholder="Năm"></select>
              <span class="period-sep">→</span>
              <select id="toWeek" class="period-input custom-select" data-search="true" data-placeholder="Đến tuần"></select>
              <select id="toWeekYear" class="period-input custom-select" data-search="true" data-placeholder="Năm"></select>
            </div>
          </div>
          <div class="group-select has-custom">
            <select id="groupMode" class="group-select-input custom-select" data-search="true" data-placeholder="Chọn mốc thời gian">
              <option value="hour" {{ $groupMode === 'hour' ? 'selected' : '' }}>Theo giờ</option>
              <option value="day" {{ $groupMode === 'day' ? 'selected' : '' }}>Theo ngày</option>
              <option value="week" {{ $groupMode === 'week' ? 'selected' : '' }}>Theo tuần</option>
              <option value="month" {{ $groupMode === 'month' ? 'selected' : '' }}>Theo tháng</option>
              <option value="year" {{ $groupMode === 'year' ? 'selected' : '' }}>Theo năm</option>
            </select>
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
      <div class="subtitle">
        {{ $groupLabel }}
      </div>
    </div>

    @php
      $maxRevenue = $timeBuckets->max('total_revenue') ?: 1;
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
          <div class="metric-title">Mốc thời gian cao nhất</div>
          <div class="metric-value">
            {{ optional($timeBuckets->sortByDesc('total_revenue')->first())->bucket_label ?? '-' }}
          </div>
          <div class="metric-sub">
            Doanh thu: {{ number_format(optional($timeBuckets->sortByDesc('total_revenue')->first())->total_revenue ?? 0, 0, ',', '.') }} ₫
          </div>
        </div>
      </div>

      <div class="cards-grid">
        <div class="panel">
          <div class="panel-title">Doanh thu theo mốc thời gian</div>
          <div class="panel-body">
            @forelse ($timeBuckets as $item)
              <div class="list-row">
                <span class="rank">{{ $item->bucket_label }}</span>
                <span class="name">{{ number_format($item->total_invoices, 0, ',', '.') }} hóa đơn</span>
                <span class="value">{{ number_format($item->total_revenue, 0, ',', '.') }} ₫</span>
              </div>
            @empty
              <div class="empty-state">Chưa có dữ liệu</div>
            @endforelse
          </div>
        </div>

        <div class="panel">
          <div class="panel-title">Tổng quan</div>
          <div class="panel-body">
            <div class="compare-row">
              <span>Tổng hóa đơn</span>
              <strong>{{ number_format($totalInvoices, 0, ',', '.') }}</strong>
            </div>
            <div class="compare-row">
              <span>Tổng doanh thu</span>
              <strong>{{ number_format($totalRevenue, 0, ',', '.') }} ₫</strong>
            </div>
          </div>
        </div>
      </div>
    @elseif ($viewMode === 'chart')
      <div class="chart-section">
        <div class="panel">
          <div class="panel-title">Doanh thu theo mốc thời gian</div>
          <div class="panel-body">
            @forelse ($timeBuckets as $item)
              <div class="bar-row">
                <div class="bar-label">{{ $item->bucket_label }}</div>
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
      </div>
    @else
      <div class="table-section">
        <div class="panel">
          <div class="panel-title">Doanh thu theo mốc thời gian</div>
          <table class="data-table">
            <thead>
              <tr>
                <th>
                  @if ($groupMode === 'hour')
                    Giờ
                  @elseif ($groupMode === 'day')
                    Ngày
                  @elseif ($groupMode === 'week')
                    Tuần
                  @elseif ($groupMode === 'month')
                    Tháng
                  @else
                    Năm
                  @endif
                </th>
                <th>Hóa đơn</th>
                <th>Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              @forelse ($timeBuckets as $item)
                <tr>
                  <td>{{ $item->bucket_label }}</td>
                  <td>{{ number_format($item->total_invoices, 0, ',', '.') }}</td>
                  <td>{{ number_format($item->total_revenue, 0, ',', '.') }} ₫</td>
                </tr>
              @empty
                <tr>
                  <td colspan="3" class="empty-state">Chưa có dữ liệu</td>
                </tr>
              @endforelse
            </tbody>
          </table>
        </div>

        <div class="panel">
          <div class="panel-title">Tổng số liệu</div>
          <div class="panel-body">
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
