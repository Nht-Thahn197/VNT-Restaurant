<?php

function can($permissionKey) {
    $user = auth()->user();
    if (!$user || !$user->role) return false;

    return in_array(
        $permissionKey,
        $user->role->permission ?? []
    );
}
