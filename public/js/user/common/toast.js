function showToast(message, type = 'info', duration = 3200) {
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.setProperty('--toast-duration', `${duration}ms`);
    toast.innerHTML = `
        <div class="toast-body">
            <div class="toast-message">${message}</div>
            <button class="toast-close" type="button" aria-label="Close">&times;</button>
        </div>
        <div class="toast-progress"></div>
    `;

    const closeBtn = toast.querySelector('.toast-close');

    const removeToast = () => {
        if (toast.classList.contains('toast-hide')) return;
        toast.classList.add('toast-hide');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.parentNode.removeChild(toast);
            }
        }, 220);
    };

    if (closeBtn) {
        closeBtn.addEventListener('click', removeToast);
    }

    container.appendChild(toast);
    setTimeout(removeToast, duration);
}
