@extends('layout.pos')

@section('title', 'VNT Pos - Phân tích bán hàng')

@section('content')
  @push('css')
    <link rel="stylesheet" href="{{ asset('css/pos/sales-analysis.css') }}">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/daterangepicker/daterangepicker.css">
  @endpush

  @php
    $formatCurrency = fn ($value) => number_format($value, 0, ',', '.');
    $formatPercent = fn ($value) => number_format($value * 100, 2, '.', '') . '%';
    $selectedLocationIds = $selectedLocationIds ?? [];
    $selectedLocations = count($selectedLocationIds) ? $selectedLocationIds : $locations->pluck('id')->all();
    $isAllSelected = count($selectedLocations) === $locations->count();
  @endphp

  <div class="sales-analysis-page" data-analysis='@json($analysisData)'>
    <div class="analysis-top">
      <div class="analysis-title">
        <h1>Phân tích bán hàng</h1>
      </div>
      <div class="analysis-filters">
        <div class="filter-group date-filter">
          <i class="fa-regular fa-calendar"></i>
          <input
            type="text"
            id="analysisDateRange"
            value="{{ $dateRange }}"
            data-from="{{ $fromDate }}"
            data-to="{{ $toDate }}"
            readonly
          >
        </div>
        <div class="filter-group branch-filter" id="branchFilter">
          <button type="button" class="branch-trigger" aria-expanded="false">
            <span class="branch-label" id="branchLabel">Tất cả chi nhánh</span>
            <i class="fa-solid fa-chevron-down"></i>
          </button>
          <div class="branch-menu" aria-hidden="true">
            <div class="branch-search">
              <i class="fa-solid fa-magnifying-glass"></i>
              <input type="text" id="branchSearch" placeholder="Tìm chi nhánh">
            </div>
            <label class="branch-option">
              <input type="checkbox" data-value="all" {{ $isAllSelected ? 'checked' : '' }}>
              <span>Chọn tất cả</span>
            </label>
            <div class="branch-options" id="branchOptions">
              @forelse ($locations as $location)
                <label class="branch-option">
                  <input type="checkbox" data-value="{{ $location->id }}" {{ in_array($location->id, $selectedLocations, true) ? 'checked' : '' }}>
                  <span>{{ $location->name }}</span>
                </label>
              @empty
                <div class="branch-empty">Không có chi nhánh</div>
              @endforelse
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="analysis-meta">
      Dữ liệu tổng hợp đến 23:59 ngày {{ $metaEndLabel }}
    </div>

    <div class="metrics-grid">
      @foreach ($analysisData['metrics'] as $metric)
        <div class="metric-card tone-{{ $metric['tone'] }}">
          <div class="metric-content">
            <div class="metric-label">{{ $metric['label'] }}</div>
            <div class="metric-value">{{ $metric['value'] }}</div>
            <div class="metric-sub">{{ $metric['sub'] }}</div>
          </div>
          <div class="metric-icon">
            <i class="{{ $metric['icon'] }}"></i>
          </div>
        </div>
      @endforeach
    </div>

    <div class="panel wide">
      <div class="panel-header">Doanh thu bán và lợi nhuận theo thời gian</div>
      <div class="panel-body chart-wrap">
        <canvas id="trendChart"></canvas>
      </div>
    </div>

    <div class="panel-grid three">
      <div class="panel">
        <div class="panel-header">Doanh thu theo kênh bán</div>
        <div class="panel-body chart-wrap">
          <canvas id="channelChart"></canvas>
        </div>
      </div>
      <div class="panel">
        <div class="panel-header">TB doanh thu mỗi ngày theo các thứ trong tuần</div>
        <div class="panel-body chart-wrap">
          <canvas id="weekdayChart"></canvas>
        </div>
      </div>
      <div class="panel">
        <div class="panel-header">TB doanh thu mỗi ngày theo khung giờ</div>
        <div class="panel-body chart-wrap">
          <canvas id="hourChart"></canvas>
        </div>
      </div>
    </div>

    <div class="panel-grid two">
      <div class="panel">
        <div class="panel-header">Doanh thu theo nhóm khách hàng</div>
        <div class="panel-body empty-card">
          <div class="empty-icon">
            <i class="fa-solid fa-box-open"></i>
          </div>
          <div class="empty-text">Không có dữ liệu</div>
        </div>
      </div>
      <div class="panel">
        <div class="panel-header">Doanh thu theo nhân viên</div>
        <div class="panel-body chart-wrap">
          <canvas id="staffChart"></canvas>
        </div>
      </div>
    </div>

    <div class="panel">
      <div class="panel-header">Tình hình kinh doanh theo chi nhánh bán hàng</div>
      <div class="panel-body">
        <table class="analysis-table">
          <thead>
            <tr>
              <th>Chi nhánh</th>
              <th>Doanh thu</th>
              <th>Giá trị trả hàng</th>
              <th>Doanh thu thuần</th>
              <th>Lợi nhuận</th>
              <th>Tỷ suất lợi nhuận</th>
            </tr>
          </thead>
          <tbody>
            @forelse ($analysisData['branch'] as $row)
              <tr>
                <td>{{ $row['name'] }}</td>
                <td>{{ $formatCurrency($row['revenue']) }}</td>
                <td>{{ $formatCurrency($row['returns']) }}</td>
                <td>{{ $formatCurrency($row['net']) }}</td>
                <td>{{ $formatCurrency($row['profit']) }}</td>
                <td>{{ $formatPercent($row['margin']) }}</td>
              </tr>
            @empty
              <tr>
                <td colspan="6" class="empty-cell">Không có dữ liệu</td>
              </tr>
            @endforelse
          </tbody>
          <tfoot>
            <tr>
              <td>Tổng cộng</td>
              <td>{{ $formatCurrency($analysisData['totals']['revenue']) }}</td>
              <td>{{ $formatCurrency($analysisData['totals']['returns']) }}</td>
              <td>{{ $formatCurrency($analysisData['totals']['net']) }}</td>
              <td>{{ $formatCurrency($analysisData['totals']['profit']) }}</td>
              <td>{{ $formatPercent($analysisData['totals']['margin']) }}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  </div>

  @push('js')
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/moment@2.29.4/moment.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/daterangepicker/daterangepicker.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="{{ asset('js/pos/sales-analysis.js') }}"></script>
  @endpush
@endsection
