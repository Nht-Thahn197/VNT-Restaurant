@extends('layout.pos')

@section('title', 'VNT Pos - Chức vụ')

@section('content')
  @push('css')
    <link rel="stylesheet" href="{{ asset('css/pos/role.css') }}">
  @endpush

  <meta name="csrf-token" content="{{ csrf_token() }}">

  <div class="role-page">
    <div class="layout">
      <!-- ==== SIDEBAR ==== -->
      <div class="sidebar">
        <div class="box">
          <div class="box-title">Tìm kiếm</div>
          <input
            type="text"
            id="role-search"
            class="input-text"
            placeholder="Theo tên chức vụ"
          >
        </div>
      </div>

      <!-- ==== MAIN CONTENT ==== -->
      <div class="main-content">
        <div class="header-row">
          <h2>Danh sách chức vụ</h2>
          @can('create_role')
            <button class="btn-create" id="btnAddRole">
              <i class="far fa-plus"></i> Thêm chức vụ
            </button>
          @endcan
        </div>

        <table class="data-table">
          <thead>
            <tr>
              <th>Tên chức vụ</th>
              <th>Số nhân viên</th>
              <th>Số quyền</th>
              <th>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            @foreach($roles as $role)
              <tr class="role-row" data-id="{{ $role->id }}" data-name="{{ strtolower($role->name) }}">
                <td>{{ $role->name }}</td>
                <td>{{ $role->staff_count }}</td>
                <td>{{ count($role->permission ?? []) }}</td>
                <td>
                  @can('manage_role')
                    @if (strtolower($role->name ?? '') !== 'admin')
                      <a class="btn-permission" href="{{ route('pos.roles.permissions.edit', $role) }}">
                        <i class="fa fa-shield"></i> Phân quyền
                      </a>
                    @endif
                  @endcan
                </td>
              </tr>
              <tr class="detail-row" id="detail-{{ $role->id }}" style="display:none;">
                <td colspan="4">
                  <div class="detail-content">
                    <div class="field">
                      <div class="field-label">Tên chức vụ</div>
                      <div class="field-value">{{ $role->name }}</div>
                    </div>
                    <div class="field">
                      <div class="field-label">Số nhân viên</div>
                      <div class="field-value">{{ $role->staff_count }}</div>
                    </div>
                    <div class="field">
                      <div class="field-label">Số quyền</div>
                      <div class="field-value">{{ count($role->permission ?? []) }}</div>
                    </div>
                  </div>
                  <div class="detail-actions">
                    @can('update_role')
                      <a href="#" class="btn-update role-update" data-id="{{ $role->id }}" data-name="{{ $role->name }}">
                        <i class="fa fa-check-square"></i> Cập nhật
                      </a>
                    @endcan
                    @can('delete_role')
                      <a href="#" class="btn-delete role-delete" data-id="{{ $role->id }}">
                        <i class="far fa-trash-alt"></i> Xóa
                      </a>
                    @endcan
                    @can('manage_role')
                      @if (strtolower($role->name ?? '') !== 'admin')
                        <a class="btn-permission" href="{{ route('pos.roles.permissions.edit', $role) }}">
                          <i class="fa fa-shield"></i> Phân quyền
                        </a>
                      @endif
                    @endcan
                  </div>
                </td>
              </tr>
            @endforeach
          </tbody>
        </table>

        <div class="role-pagination" id="pagination">
          <button id="prevPage" class="page-btn"><i class="fas fa-chevron-left"></i></button>
          <span id="pageInfo"></span>
          <button id="nextPage" class="page-btn"><i class="fas fa-chevron-right"></i></button>
        </div>
      </div>
    </div>
  </div>

  <!-- POPUP ROLE -->
  <div id="popup-overlay" class="popup-overlay"></div>
  <div id="popup-role" class="popup-box">
    <h2 id="popupTitle">Thêm chức vụ</h2>
    <label>Tên chức vụ</label>
    <input type="text" id="role-name" placeholder="Nhập tên chức vụ...">
    <div class="popup-actions">
      @canany(['create_role', 'update_role'])
        <button id="save-role" class="btn-save" type="button"><i class="fas fa-save"></i> Lưu</button>
      @endcanany
      <button id="cancel-role" class="btn-cancel" type="button"><i class="fas fa-ban"></i> Hủy</button>
      @can('delete_role')
        <button id="delete-role" class="btn-delete" type="button"><i class="far fa-trash-alt"></i> Xóa</button>
      @endcan
    </div>
  </div>
@endsection

@push('js')
  <script>
    window.routes = {
      role: {
        store: "{{ route('role.store') }}",
        update: "{{ route('role.update', ':id') }}",
        delete: "{{ route('role.delete', ':id') }}"
      }
    };
  </script>
  <script src="{{ asset('js/pos/role.js') }}"></script>
@endpush
