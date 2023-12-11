document.getElementById('updateForm').addEventListener('submit', function(e) {
  e.preventDefault();

  var email = document.getElementById('updateEmail').value;
  var password = document.getElementById('updatePassword').value;

  fetch('/user/update', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'same-origin',
    body: JSON.stringify({ email, password })
  })
  .then(response => response.json())
  .then(data => {
    if (data.message === 'Profile updated successfully') {
      alert('Profile updated successfully');
      if(email) document.querySelector('h2').textContent = 'Welcome, ' + email + '!';
    } else {
      alert(data.message);
    }
  })
  .catch(error => {
    console.error('Error:', error);
    alert('Update failed');
  });
});
