@extends('layout.pos')

@section('title', 'VNT Pos - Hàng Hóa')

@section('content')

  @push('css')
    <link rel="stylesheet" href="{{ asset('css/pos/product.css') }}">
  @endpush

  <meta name="csrf-token" content="{{ csrf_token() }}" data-store-url="{{ route('product.category.store') }}">

  <!-- CONTENT START -->
  <div class="page-container">
    <!-- Sidebar -->
    <div class="sidebar">
      <!-- 🔍 SEARCH -->
      <div class="box">
        <h3>Tìm kiếm</h3>
        <input type="text" id="product-search" placeholder="Nhập tên món, mã hàng...">
      </div>

      <!-- 🍽 TYPE FILTER -->
      <div class="box filter-box">
        <div class="filter-header">
          <span>Loại thực đơn</span>
          <span class="arrow"></span>
        </div>
        <div class="filter-content">
          <label><input type="checkbox" value="food"> Món ăn</label>
          <label><input type="checkbox" value="drink"> Đồ uống</label>
          <label><input type="checkbox" value="other"> Khác</label>
        </div>
      </div>

        <!-- 📦 CATEGORY -->
        <div class="box group-box">
          <div class="group-header">
            <span>Nhóm hàng</span>
            <div class="group-actions">
              @can('create_category_product')
              <button type="button" class="add-group">＋</button>
              @endcan
              <span class="group-arrow"></span>
            </div>
          </div>

          <div class="group-content">
            <input type="text" class="group-search" placeholder="🔍 Tìm kiếm nhóm hàng">

            <div class="group-all {{ request('category') ? '' : 'active' }}">
              <a href="{{ route('pos.product', request()->except('category')) }}">Tất cả</a>
            </div>

            <ul class="group-list">
              @foreach($categories as $category)
                <li class="category-item" data-category="{{ $category->id }}">
                  <span class="cat-name">{{ $category->name }}</span>
                  @can('update_category_product')
                  <i class="fa-regular fa-pen-to-square edit-icon"></i>
                  @endcan
                </li>
              @endforeach
            </ul>
          </div>
        </div>
    </div>


    <!-- Main content -->
    <div class="main-content">
      <div class="top-bar">
        <h2>Hàng Hóa</h2>
          @can('create_product')
          <button id="btnOpenForm" class="btn-add"><i class="far fa-plus"></i> Thêm Hàng Hóa</button>
          @endcan
      </div>

      <table class="product-table">
        <thead>
          <tr>
            <th>Mã HH</th>
            <th>Tên Hàng</th>
            <th>Loại Thực Đơn</th>
            <th>Giá Vốn</th>
            <th>Giá Bán</th>
            <th>Tồn Kho</th>
          </tr>
        </thead>
        <tbody>
          @foreach($products as $product)
            <tr class="product-item" data-id="{{ $product->id }}" data-code="{{ strtolower($product->code) }}" data-name="{{ strtolower($product->name) }}"
               data-category-id="{{ $product->category_id }}" data-type="{{ strtolower($product->type_menu) }}">
              <td class="product-code">{{ $product->code }}</td>
              <td class="product-name">{{ $product->name }}  ({{ $product->unit }})</td>
              <td>{{ $product->type_menu }}</td>
              <td>{{ number_format($product->cost_per_dish, 0, ',', '.') }}</td>
              <td>{{ number_format($product->price, 0, ',', '.') }}</td>
              <td>{{ $product->available_qty ?? 0 }}</td>
            </tr>
            <!-- Row chi tiết (ẩn) -->
            <tr class="detail-row" id="detail-{{ $product->id }}" style="display:none;">
              <td class="detail" colspan="6">
                  <h3>{{ $product->name }}</h3>
                  <div class="detail-content">
                    <!-- Ảnh -->
                    <div class="detail-col pic">
                      <img src="{{ asset($product->img ?? 'images/product/default-product.png') }}" class="detail-img">
                    </div>
                    <!-- Thông tin -->
                    <div class="detail-col info">
                      <div class="field">
                        <div class="field-label">Mã hàng hóa:</div>
                        <div class="field-value">{{ $product->code }}</div>
                      </div>
                      <div class="field">
                        <div class="field-label">Loại thực đơn:</div>
                        <div class="field-value">{{ $product->type_menu }}</div>
                      </div>
                      <div class="field">
                        <div class="field-label">Nhóm hàng:</div>
                        <div class="field-value">{{ $product->category->name ?? '---' }}</div>
                      </div>
                      <div class="field">
                        <div class="field-label">Tồn kho:</div>
                        <div class="field-value">{{ $product->available_qty ?? 0 }}</div>
                      </div>
                      <div class="field">
                        <div class="field-label">Giá vốn:</div>
                        <div class="field-value">{{ number_format($product->cost_per_dish, 0, ',', '.') }}</div>
                      </div>
                      <div class="field">
                        <div class="field-label">Giá bán:</div>
                        <div class="field-value">{{ number_format($product->price, 0, ',', '.') }}</div>
                      </div>
                    </div>
                    <!-- Mô tả -->
                    
                  </div>
                  <!-- Nút -->
                  <div class="detail-actions">
                    @can('update_product')
                    <a href="#" class="btn prd-update"><i class="fa fa-check-square"></i> Cập nhật</a>
                    @endcan
                    @can('delete_product')
                    <a href="#" class="btn prd-delete"><i class="far fa-trash-alt"></i> Xoá</a>
                    @endcan
                  </div>
              </td>
            </tr>
          @endforeach
        </tbody>
      </table>
      <div class="prd-pagination" id="pagination">
        <button id="prevPage" class="page-btn"><i class="fas fa-chevron-left"></i></button>
          <span id="pageInfo"></span>
          <button id="nextPage" class="page-btn"><i class="fas fa-chevron-right"></i></button>
      </div>
    </div>
  </div>

  <!-- FORM Add & Edit & Delete CATEGORY START -->
  <!-- Overlay nền mờ -->
  <div id="popup-overlay" class="popup-overlay"></div>
  <!-- Popup form -->
  <div id="popup-add-group" class="popup-box">
    <h2>Thêm Nhóm Hàng</h2>
    <label>Tên nhóm</label>
    <input type="text" id="group-name" placeholder="Nhập tên nhóm...">
    <div class="popup-actions">
      @canany(['create_category_product', 'update_category_product'])
      <button id="cat-save" class="btn-save" type="button"><i class="fas fa-save"></i> Lưu</button>
      @endcanany
      <button id="cat-cancel" class="btn-cancel" type="button"><i class="fas fa-ban"></i> Hủy</button>
      @can('delete_category_product')
      <button id="cat-delete" class="btn-delete" type="button"><i class="far fa-trash-alt"></i> Xóa</button>
      @endcan
    </div>
  </div>
  <!-- FORM Add & Edit & Delete CATEGORY END -->

  <!-- FORM ADD & EDIT & DELETE PRODUCT START -->
  <div id="productFormOverlay" class="overlay">
    <div class="modal">
      <div class="modal-header">
        <h3 id="formTitle">Thêm hàng hóa</h3>
        <button id="btnCloseHeader" class="close-btn">×</button>
      </div>
      <div class="tabs">
        <button class="tab active" data-tab="info">Thông tin</button>
        <button class="tab" data-tab="ingredient">Thành phần</button>
      </div>

      <!-- TAB: THÔNG TIN -->
      <div class="tab-content active" id="tab-info">
        <form id="productInfoForm">
          <input type="hidden" id="product_id">
          <div class="form-group">
            <label>Mã hàng hóa</label>
            <input class="write" type="text" placeholder="Mã hàng tự động" disabled>
          </div>

          <div class="form-group">
            <label>Tên hàng</label>
            <input class="write" type="text" name="product_name" id="product_name">
          </div>

          <div class="form-group">
            <label>Loại thực đơn</label>
            <select class="choose" name="type_menu_id" id="type_menu">
              <option value="">-- Chọn loại --</option>
              <option value="Food"> Đồ ăn </option>
              <option value="Drink"> Đồ uống </option>
              <option value="Other"> Khác </option>
            </select>
          </div>

          <div class="form-group">
            <label>Nhóm hàng</label>
            <select class="choose" name="category_id" id="category_id">
              <option value="">-- Lựa chọn --</option>
              @foreach($categories as $category) 
              <option value="{{ $category->id }}">{{ $category->name }}</option>
            @endforeach
            </select>
          </div>

          <div class="form-group">
            <label>Giá bán</label>
            <input class="write" type="text" name="price" id="price">
          </div>

          <div class="form-group">
            <label>Đơn vị tính</label>
            <input class="write" type="text" name="unit" id="unit">
          </div>

          <div class="image-upload-wrap" id="uploadWrap">
            <div id="imageBox" class="image-box">
                <span class="add-text">Thêm</span>

                <img id="previewImage" src="" alt="" style="display:none;">
                <button id="removeImageBtn" class="remove-btn" style="display:none;">✖</button>
            </div>

            <input type="file" id="imageInput" accept="image/*" hidden>
            <input type="hidden" id="delete_image" name="delete_image" value="0">
          </div>

          <div class="form-actions">
            @canany(['create_product', 'update_product'])
            <button id="save-popup" class="prd-save" type="button"><i class="fas fa-save"></i> Lưu</button>
            @endcanany
            <button id="cancelBtn" class="prd-cancel" type="button"><i class="fas fa-ban"></i> Hủy</button>
          </div>
        </form>
      </div>

      <!-- TAB: THÀNH PHẦN -->
      <div class="tab-content" id="tab-ingredient">
        <div class="ingredient-search">
          <input type="text" placeholder="Tìm nguyên liệu..." id="ingredientSearch">
          <div id="ingredientSuggest" class="suggest-box"></div>
        </div>

        <table class="ingredient-table">
          <thead>
            <tr>
              <th>STT</th>
              <th>Mã</th>
              <th>Tên nguyên liệu</th>
              <th>Định lượng</th>
              <th>Giá vốn</th>
              <th>Thành tiền</th>
              <th></th>
            </tr>
          </thead>
          <tbody id="ingredientList">
            <!-- Render bằng JS -->
          </tbody>
        </table>

        <div class="form-actions">
          @canany(['create_product', 'update_product'])
          <button id="save-popup" class="prd-save" type="button"><i class="fas fa-save"></i> Lưu</button>
          @endcanany
          <button id="cancel-popup" class="prd-cancel" type="button"><i class="fas fa-ban"></i> Hủy</button>
        </div>
      </div>
    </div>
  </div>
  <!-- FORM ADD & EDIT & DELETE PRODUCT END -->
@endsection

@push('js')
  <script>
    window.routes = {
      storeCategory: "{{ route('product.category.store') }}",
      updateCategory: "{{ route('product.category.update', ':id') }}",
      deleteCategory: "{{ route('product.category.delete', ':id') }}"
    };
  </script>
  <script src="{{ asset('js/pos/product.js') }}"></script>
@endpush
