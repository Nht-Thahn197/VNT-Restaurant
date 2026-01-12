@extends('layout.pos')

@section('title', 'VNT Pos - Báo cáo hàng hóa')

@section('content')
  @push('css')
    <link rel="stylesheet" href="{{ asset('css/pos/product-report.css') }}">
    <link rel="stylesheet" type="text/css" href="https://cdn.jsdelivr.net/npm/daterangepicker/daterangepicker.css" />
  @endpush

  <div class="product-report-page">
    <div class="report-header">
      <div class="title-wrap">
        <div class="title-label">Báo cáo hàng hóa</div>
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
      $maxQty = $topProducts->max('total_quantity') ?: 1;
      $maxRevenue = $productRevenues->max('total_revenue') ?: 1;
    @endphp

    @if ($viewMode === 'cards')
      <div class="metric-cards">
        <div class="metric-card">
          <div class="metric-title">Tổng số lượng bán</div>
          <div class="metric-value">{{ number_format($totalQuantity, 0, ',', '.') }}</div>
        </div>
        <div class="metric-card">
          <div class="metric-title">Doanh thu theo món</div>
          <div class="metric-value">{{ number_format($totalRevenue, 0, ',', '.') }} ₫</div>
        </div>
        <div class="metric-card highlight">
          <div class="metric-title">Top món bán chạy</div>
          <div class="metric-value">
            {{ optional($topProducts->first())->product_name ?? '-' }}
          </div>
          <div class="metric-sub">Số lượng: {{ number_format(optional($topProducts->first())->total_quantity ?? 0, 0, ',', '.') }}</div>
        </div>
      </div>

      <div class="cards-grid">
        <div class="panel">
          <div class="panel-title">Top món bán chạy</div>
          <div class="panel-body">
            @forelse ($topProducts as $index => $item)
              <div class="list-row">
                <span class="rank">#{{ $index + 1 }}</span>
                <span class="name">{{ $item->product_name }}</span>
                <span class="value">{{ number_format($item->total_quantity, 0, ',', '.') }}</span>
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
          <div class="panel-title">Top món bán chạy</div>
          <div class="panel-body">
            @forelse ($topProducts as $item)
              <div class="bar-row">
                <div class="bar-label">{{ $item->product_name }}</div>
                <div class="bar-track">
                  <div class="bar-fill" style="width: {{ ($item->total_quantity / $maxQty) * 100 }}%"></div>
                </div>
                <div class="bar-value">{{ number_format($item->total_quantity, 0, ',', '.') }}</div>
              </div>
            @empty
              <div class="empty-state">Chưa có dữ liệu</div>
            @endforelse
          </div>
        </div>

        <div class="panel">
          <div class="panel-title">Doanh thu theo món</div>
          <div class="panel-body">
            @forelse ($productRevenues as $item)
              <div class="bar-row">
                <div class="bar-label">{{ $item->product_name }}</div>
                <div class="bar-track">
                  <div class="bar-fill alt" style="width: {{ ($item->total_revenue / $maxRevenue) * 100 }}%"></div>
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
              <div class="bar-value">{{ number_format($prevRevenue, 0, ',', '.') }} d</div>
            </div>
          </div>
        </div>
      </div>
    @else
      <div class="table-section">
        <div class="panel">
          <div class="panel-title">Top món bán chạy</div>
          <table class="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Tên món</th>
                <th>Số lượng bán</th>
                <th>Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              @forelse ($topProducts as $index => $item)
                <tr>
                  <td>{{ $index + 1 }}</td>
                  <td>{{ $item->product_name }}</td>
                  <td>{{ number_format($item->total_quantity, 0, ',', '.') }}</td>
                  <td>{{ number_format($item->total_revenue, 0, ',', '.') }} ₫</td>
                </tr>
              @empty
                <tr>
                  <td colspan="4" class="empty-state">Chưa có dữ liệu</td>
                </tr>
              @endforelse
            </tbody>
          </table>
        </div>

        <div class="panel">
          <div class="panel-title">Tổng số lượng bán</div>
          <div class="panel-body">
            <div class="metric-row">
              <span>Tổng số lượng</span>
              <strong>{{ number_format($totalQuantity, 0, ',', '.') }}</strong>
            </div>
            <div class="metric-row">
              <span>Doanh thu</span>
              <strong>{{ number_format($totalRevenue, 0, ',', '.') }} ₫</strong>
            </div>
          </div>
        </div>

        <div class="panel">
          <div class="panel-title">Doanh thu theo món</div>
          <table class="data-table">
            <thead>
              <tr>
                <th>Tên món</th>
                <th>Số lượng bán</th>
                <th>Doanh thu</th>
              </tr>
            </thead>
            <tbody>
              @forelse ($productRevenues as $item)
                <tr>
                  <td>{{ $item->product_name }}</td>
                  <td>{{ number_format($item->total_quantity, 0, ',', '.') }}</td>
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
