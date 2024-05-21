let registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || {};

const tabBtns = document.querySelectorAll('.tab-btn');
const forms = document.querySelectorAll('.form');
const loader = document.getElementById('loader');

// Function to switch between forms
const switchForm = (e) => {
  const targetTab = e.target.getAttribute('data-tab');
  tabBtns.forEach(btn => btn.classList.remove('active'));
  e.target.classList.add('active');
  forms.forEach(form => {
    if (form.id === `${targetTab}Form`) {
      form.classList.add('active');
      resetFormValidation(form); // Reset validation when switching forms
    } else {
      form.classList.remove('active');
    }
  });
};

// Function to reset form validation
const resetFormValidation = (form) => {
  const fields = form.querySelectorAll('input:not([type="submit"])');
  fields.forEach(field => {
    field.classList.remove('invalid', 'valid');
    field.nextElementSibling.textContent = '';
  });
  form.querySelectorAll('.show-password').forEach(icon => icon.textContent = '🔒');
};

// Function to toggle password visibility
const togglePassword = (e) => {
  const passwordField = e.target.closest('.password-field').querySelector('input');
  const icon = e.target;
  if (passwordField.type === 'password') {
    passwordField.type = 'text';
    icon.textContent = '🔓';
  } else {
    passwordField.type = 'password';
    icon.textContent = '🔒';
  }
};

// Function to initialize password visibility icons
const initializePasswordIcons = () => {
  document.querySelectorAll('.password-field').forEach(field => {
    const input = field.querySelector('input');
    const icon = field.querySelector('.show-password');
    if (input.type === 'password') {
      icon.textContent = '🔒';
    } else {
      icon.textContent = '🔓';
    }
  });
};

// Function to validate a field
const validateField = (field, regex, errorMessage) => {
  const value = field.value.trim();
  const errorEl = field.nextElementSibling;
  if (value === '' || !regex.test(value)) {
    field.classList.add('invalid');
    errorEl.textContent = errorMessage;
    return false;
  } else {
    field.classList.remove('invalid');
    field.classList.add('valid');
    errorEl.textContent = '';
    return true;
  }
};

// Function to validate the registration form
const validateRegistrationForm = (form) => {
  let isValid = true;
  const fields = form.querySelectorAll('input:not([type="submit"])');
  const passwordField = form.querySelector('input[name="password"]');
  const confirmPasswordField = form.querySelector('input[name="confirmPassword"]');
  const username = form.querySelector('input[name="username"]').value.trim();
  const email = form.querySelector('input[name="email"]').value.trim();

  // Check if a user with the same username or email already exists
  const existingUser = Object.values(registeredUsers).find(
    user => user.username === username || user.email === email
  );

  if (existingUser) {
    const usernameField = form.querySelector('input[name="username"]');
    const emailField = form.querySelector('input[name="email"]');
    if (existingUser.username === username) {
      usernameField.classList.add('invalid');
      usernameField.nextElementSibling.textContent = 'Користувач з таким іменем вже існує';
      isValid = false;
    }
    if (existingUser.email === email) {
      emailField.classList.add('invalid');
      emailField.nextElementSibling.textContent = 'Користувач з такою поштою вже існує';
      isValid = false;
    }
  }

  if (passwordField.value !== confirmPasswordField.value) {
    confirmPasswordField.classList.add('invalid');
    confirmPasswordField.nextElementSibling.textContent = 'Паролі не співпадають';
    isValid = false;
  } else {
    confirmPasswordField.classList.remove('invalid');
    confirmPasswordField.nextElementSibling.textContent = '';
  }

  fields.forEach(field => {
    const regex = field.getAttribute('data-regex');
    const errorMessage = field.getAttribute('data-error');
    if (!validateField(field, new RegExp(regex), errorMessage)) {
      isValid = false;
    }
  });

  return isValid;
};

// Function to validate the login form
const validateLoginForm = (form) => {
  let isValid = true;
  const fields = form.querySelectorAll('input:not([type="submit"])');
  fields.forEach(field => {
    const regex = field.getAttribute('data-regex');
    const errorMessage = field.getAttribute('data-error');
    if (!validateField(field, new RegExp(regex), errorMessage)) {
      isValid = false;
    }
  });
  return isValid;
};

// Function to simulate sending data to the server
const sendData = (formData) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const success = Math.random() > 0.01;
      if (success) {
        resolve('Успішно зареєстровано!');
      } else {
        reject('Помилка серверу. Спробуйте пізніше.');
      }
    }, 1500);
  });
};

// Registration form submission handler
const handleRegistrationSubmit = (e) => {
  e.preventDefault();
  const form = e.target;
  if (validateRegistrationForm(form)) {
    loader.classList.remove('hidden');
    const formData = new FormData(form);
    const username = formData.get('username');
    const password = formData.get('password');
    const email = formData.get('email');

    // Save data to localStorage before form submission
    saveCredentials(username, password, email);

    sendData(formData)
      .then(message => {
        alert(message);
        form.reset();
        resetFormValidation(form); // Reset validation after successful registration
      })
      .catch(error => {
        alert(error);
      })
      .finally(() => {
        loader.classList.add('hidden');
      });
  } else {
    alert('Паролі не співпадають або користувач вже існує. Будь ласка, введіть інші дані.');
    resetFormValidation(form); // Reset validation after failed registration
  }
};

// Login form submission handler
const handleLoginSubmit = (e) => {
  e.preventDefault();
  const form = e.target;
  const usernameField = form.querySelector('#loginUsername');
  const passwordField = form.querySelector('#loginPassword');
  const username = usernameField.value.trim();
  const password = passwordField.value.trim();

  if (checkCredentials(username, password)) {
    alert('Успішно авторизовано!');
    form.reset();
    resetFormValidation(form); // Reset validation after successful login
  } else {
    alert('Невірне ім\'я користувача або пароль.');
    resetFormValidation(form); // Reset validation after failed login
  }
};

// Function to save user credentials in localStorage
const saveCredentials = (username, password, email) => {
  registeredUsers[username] = { password, email };
  localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
};

// Function to check user credentials
const checkCredentials = (username, password) => {
  const user = registeredUsers[username];
  return user && user.password === password;
};

// Add event listeners
tabBtns.forEach(btn => btn.addEventListener('click', switchForm));
document.querySelectorAll('.show-password').forEach(icon => icon.addEventListener('click', togglePassword));
document.querySelector('#registerForm').addEventListener('submit', handleRegistrationSubmit);
document.querySelector('#loginForm').addEventListener('submit', handleLoginSubmit);

// Initialize password icons on page load
document.addEventListener('DOMContentLoaded', initializePasswordIcons);
