document.getElementById('forgotPasswordForm').addEventListener('submit', function(e) {
  e.preventDefault();
  var email = document.getElementById('forgotEmail').value;

  fetch('/user/forgot-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ email })
  })
  .then(response => response.text())
  .then(data => {
    alert(data);
  })
  .catch(error => {
    console.error('Error:', error);
    alert('Error sending reset link');
  });
});