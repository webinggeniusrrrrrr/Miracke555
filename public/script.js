// SIGNUP
document.getElementById('signupForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const data = {
    username: form.username.value,
    password: form.password.value,
    referred_by: form.referred_by.value || null
  };

  const res = await fetch('/api/users/register', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data)
  });
  const json = await res.json();

  if (res.ok) {
    alert(`Signup successful! Your referral code is ${json.referral_code}`);
  } else {
    alert(json.error);
  }
});

// LOGIN
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const form = e.target;
  const data = {
    username: form.username.value,
    password: form.password.value
  };

  const res = await fetch('/api/users/login', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(data)
  });
  const json = await res.json();

  if (res.ok) {
    localStorage.setItem('user_id', json.id);
    window.location.href = '/tasks.html';
  } else {
    alert(json.error);
  }
});

// TASK COMPLETION
async function completeTask(type, task_id) {
  const user_id = localStorage.getItem('user_id');
  const res = await fetch('/api/tasks/complete', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ user_id, type, task_id })
  });
  const json = await res.json();
  alert(json.message || json.error);
}
