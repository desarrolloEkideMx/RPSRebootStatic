// const toastTrigger = document.getElementById('liveToastBtn')
// const toastLiveExample = document.getElementById('liveToast')

// if (toastTrigger) {
//     const toastBootstrap = bootstrap.Toast.getOrCreateInstance(toastLiveExample)
//     toastTrigger.addEventListener('click', () => {
//         toastBootstrap.show()
//     })
// }

document.addEventListener('DOMContentLoaded', (event) => {
    const socket = new WebSocket('ws://' + window.location.host + '/ws/notifications/');
  
    socket.onmessage = function(e) {
        const data = JSON.parse(e.data);
        showToast(data.message);
    };

    socket.onclose = function(e) {
        console.error('Chat socket closed unexpectedly');
    };

    function showToast(message) {
        const toastHTML = 
        `
            <div class="toast" role="alert" aria-live="assertive" aria-atomic="true">
                <div class="toast-header me-2">
                    <i class='bx bxs-notification rounded me-2' style="color: #BD0000;"></i>
                    <img src="" alt="">
                    <strong class="me-auto">Alerta</strong>
                    <small>Justo ahora</small>

                    <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
                <div class="toast-body">
                    ${message}
                </div>
            </div>
        `;
        document.getElementById('toast-container').innerHTML += toastHTML;
        $('.toast').toast('show');
    }

    
});

$('#notify-btn').on('click', function() {
    $.ajax({
        url: notificationUrl,
        method: 'POST',
        data: {
            'message': 'This is a test notification',
            'csrfmiddlewaretoken': '{{ csrf_token }}'
        },
        success: function(response) {
            console.log(response);
        }
    });
});