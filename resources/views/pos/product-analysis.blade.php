@extends('layout.pos')

@section('title', 'VNT Pos - Phân tích hàng hóa')

@section('content')
  @push('css')
    <link rel="stylesheet" href="{{ asset('css/pos/product-analysis.css') }}">
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/daterangepicker/daterangepicker.css">
  @endpush

  @php
    $selectedLocationIds = $selectedLocationIds ?? [];
    $selectedLocations = count($selectedLocationIds) ? $selectedLocationIds : $locations->pluck('id')->all();
    $isAllLocationsSelected = count($selectedLocations) === $locations->count();
    $selectedCategoryIds = $selectedCategoryIds ?? [];
    $selectedCategories = count($selectedCategoryIds) ? $selectedCategoryIds : $categories->pluck('id')->all();
    $isAllCategoriesSelected = count($selectedCategories) === $categories->count();
  @endphp

  <div
    class="product-analysis-page"
    data-analysis='@json($analysisData)'
    data-locations="{{ implode(',', $selectedLocations) }}"
    data-categories="{{ implode(',', $selectedCategories) }}"
    data-from="{{ $fromDate }}"
    data-to="{{ $toDate }}"
    data-returns="{{ $returnMode }}"
  >
    <div class="analysis-top">
      <div class="analysis-title">
        <h1>Phân tích hàng hóa</h1>
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
        <div class="filter-group multi-filter" id="branchFilter">
          <button type="button" class="filter-trigger" aria-expanded="false">
            <span class="filter-label" id="branchLabel">Tất cả chi nhánh</span>
            <i class="fa-solid fa-chevron-down"></i>
          </button>
          <div class="filter-menu" aria-hidden="true">
            <div class="filter-search">
              <i class="fa-solid fa-magnifying-glass"></i>
              <input type="text" id="branchSearch" placeholder="Tìm chi nhánh">
            </div>
            <label class="filter-option">
              <input type="checkbox" data-value="all" {{ $isAllLocationsSelected ? 'checked' : '' }}>
              <span>Chọn tất cả</span>
            </label>
            <div class="filter-options">
              @forelse ($locations as $location)
                <label class="filter-option">
                  <input type="checkbox" data-value="{{ $location->id }}" {{ in_array($location->id, $selectedLocations, true) ? 'checked' : '' }}>
                  <span>{{ $location->name }}</span>
                </label>
              @empty
                <div class="filter-empty">Không có chi nhánh</div>
              @endforelse
            </div>
          </div>
        </div>
        <div class="filter-group multi-filter" id="categoryFilter">
          <button type="button" class="filter-trigger" aria-expanded="false">
            <span class="filter-label" id="categoryLabel">Tất cả nhóm hàng</span>
            <i class="fa-solid fa-chevron-down"></i>
          </button>
          <div class="filter-menu" aria-hidden="true">
            <div class="filter-search">
              <i class="fa-solid fa-magnifying-glass"></i>
              <input type="text" id="categorySearch" placeholder="Tìm nhóm hàng">
            </div>
            <label class="filter-option">
              <input type="checkbox" data-value="all" {{ $isAllCategoriesSelected ? 'checked' : '' }}>
              <span>Chọn tất cả</span>
            </label>
            <div class="filter-options">
              @forelse ($categories as $category)
                <label class="filter-option">
                  <input type="checkbox" data-value="{{ $category->id }}" {{ in_array($category->id, $selectedCategories, true) ? 'checked' : '' }}>
                  <span>{{ $category->name }}</span>
                </label>
              @empty
                <div class="filter-empty">Không có nhóm hàng</div>
              @endforelse
            </div>
          </div>
        </div>
        <div class="filter-group return-filter">
          <select id="returnFilter" class="custom-select" data-icon="fa-solid fa-rotate-left">
            <option value="exclude" {{ $returnMode === 'exclude' ? 'selected' : '' }}>
              Dữ liệu không tính phần trả hàng
            </option>
            <option value="include" {{ $returnMode === 'include' ? 'selected' : '' }}>
              Tính phần trả hàng
            </option>
          </select>
        </div>
      </div>
    </div>

    <div class="analysis-meta">
      Dữ liệu tổng hợp đến 23:59 ngày {{ $metaEndLabel }}
    </div>

    <div class="metrics-row">
      <div class="metrics-main">
        <div class="metric-card">
          <div class="metric-head">
            <span class="metric-label">Sản phẩm đã bán</span>
            <i class="fa-regular fa-circle-question"></i>
          </div>
          <div class="metric-value">{{ $summary['products_sold'] }}</div>
          <div class="metric-chart">
            <canvas id="productsSoldChart"></canvas>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-head">
            <span class="metric-label">Số lượng đã bán</span>
            <i class="fa-regular fa-circle-question"></i>
          </div>
          <div class="metric-value">{{ $summary['quantity_sold'] }}</div>
          <div class="metric-chart">
            <canvas id="quantitySoldChart"></canvas>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-head">
            <span class="metric-label">Doanh thu TB/sản phẩm</span>
            <i class="fa-regular fa-circle-question"></i>
          </div>
          <div class="metric-value">{{ $summary['avg_revenue'] }}</div>
          <div class="metric-chart">
            <canvas id="avgRevenueChart"></canvas>
          </div>
        </div>
        <div class="metric-card">
          <div class="metric-head">
            <span class="metric-label">Lợi nhuận TB/sản phẩm</span>
            <i class="fa-regular fa-circle-question"></i>
          </div>
          <div class="metric-value">{{ $summary['avg_profit'] }}</div>
          <div class="metric-chart">
            <canvas id="avgProfitChart"></canvas>
          </div>
        </div>
      </div>
      <div class="metrics-side">
        <div class="metric-card inventory-card">
          <div class="metric-head">
            <span class="metric-label">Số lượng tồn kho</span>
            <i class="fa-regular fa-circle-question"></i>
          </div>
          <div class="metric-value">{{ $summary['inventory_qty'] }}</div>
        </div>
        <div class="metric-card inventory-card">
          <div class="metric-head">
            <span class="metric-label">Giá trị tồn kho</span>
            <i class="fa-regular fa-circle-question"></i>
          </div>
          <div class="metric-value">{{ $summary['inventory_value'] }}</div>
        </div>
      </div>
    </div>

    <div class="panel">
      <div class="panel-header">
        Doanh thu và lợi nhuận theo nhóm hàng
        <i class="fa-regular fa-circle-question"></i>
      </div>
      <div class="panel-body chart-wrap tall">
        <canvas id="categoryPerformanceChart"></canvas>
      </div>
    </div>

    <div class="panel-grid two">
      <div class="panel">
        <div class="panel-header">
          Giá trị tồn kho của nhóm hàng
          <i class="fa-regular fa-circle-question"></i>
        </div>
        <div class="panel-body chart-wrap tall">
          <canvas id="inventoryCategoryChart"></canvas>
        </div>
      </div>
      <div class="panel">
        <div class="panel-header panel-header-row">
          <span>Sản phẩm bán chạy</span>
          <select id="topMetricSelect" class="metric-select custom-select">
            <option value="revenue">Doanh thu</option>
            <option value="quantity">Số lượng bán</option>
          </select>
        </div>
        <div class="panel-body chart-wrap tall">
          <canvas id="topProductsChart"></canvas>
        </div>
      </div>
    </div>
  </div>

  @push('js')
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/moment@2.29.4/moment.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/daterangepicker/daterangepicker.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="{{ asset('js/pos/product-analysis.js') }}"></script>
  @endpush
@endsection
