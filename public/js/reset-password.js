document.getElementById('resetPasswordForm').addEventListener('submit', function(e) {
  e.preventDefault();

  var token = this.getAttribute('data-token');
  var newPassword = document.getElementById('newPassword').value;

  fetch('/user/reset-password/' + token, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ password: newPassword })
  })
  .then(response => {
    if (!response.ok) {
      return response.json().catch(() => response.text());
    }
    return response.json();
  })
  .then(data => {
    if (typeof data === 'string') {
      throw new Error(data);
    } else {
      alert(data.message);
      window.location.href = '/user/login';
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('Error resetting password: ' + error.message);
  });
});
