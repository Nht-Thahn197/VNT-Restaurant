@extends('layout.pos')

@section('title', 'VNT Pos - Phân quyền')

@section('content')
  @push('css')
    <link rel="stylesheet" href="{{ asset('css/pos/permissions.css') }}">
  @endpush

  <div class="permissions-page">
    <div class="permissions-header">
      <div class="title-wrap">
        <div class="title-label">Phân quyền</div>
        <h2>{{ $role->name }}</h2>
      </div>
      <div class="subtitle">Cập nhật quyền truy cập cho chức vụ này</div>
    </div>

    <form method="POST" class="permissions-form" action="{{ route('pos.roles.permissions.update', $role) }}">
      @csrf

      @foreach($permissions as $group => $items)
        <div class="permission-group">
          <div class="group-title">{{ $group }}</div>
          <div class="permission-grid">
            @foreach($items as $key => $label)
              <label class="permission-item">
                <input
                  type="checkbox"
                  name="permissions[]"
                  value="{{ $key }}"
                  {{ in_array($key, $role->permission ?? []) ? 'checked' : '' }}
                  {{ $isAdminRole ? 'disabled' : '' }}
                >
                <span>{{ $label }}</span>
              </label>
            @endforeach
          </div>
        </div>
      @endforeach

      <div class="permissions-actions">
        @if (!$isAdminRole)
          <button type="submit" class="btn-save">
            <i class="fas fa-save"></i> Lưu quyền
          </button>
        @else
          <div class="note">Admin role is locked.</div>
        @endif
      </div>
    </form>
  </div>
@endsection
