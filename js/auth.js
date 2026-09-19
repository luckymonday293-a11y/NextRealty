/* ==========================================================================
   NEXORA REALTY — AUTH.JS
   Drives auth/login.html and auth/signup.html: the password show/hide
   toggle (shared component, could be reused anywhere a password field
   appears later, e.g. a dashboard "change password" form), and simulated
   account creation / login using localStorage as a stand-in database.

   IMPORTANT: this is a frontend-only simulation for a portfolio project.
   Storing plaintext passwords in localStorage is fine for a demo with no
   backend, but is NOT how real authentication should work — a real build
   would replace createAccount()/authenticate() below with actual API
   calls to a backend that hashes passwords server-side, and would swap
   the localStorage "session" for a real auth token/cookie.
   ========================================================================== */

/* ==========================================================================
   PASSWORD VISIBILITY TOGGLE
   Reusable on any `.password-field` wrapper containing one <input> and one
   `.password-toggle` <button>. Both the eye and eye-off icons live in the
   button already (see the SVG markup in the HTML); this just toggles which
   one is visible via a class, and flips the input's type.
   ========================================================================== */

function initPasswordToggles(scope = document) {
  scope.querySelectorAll(".password-toggle").forEach((button) => {
    const field = button.closest(".password-field");
    const input = field ? field.querySelector("input") : null;
    if (!input) return;

    button.addEventListener("click", () => {
      const showing = input.type === "text";

      // Preserve where the user's cursor/selection was so typing can
      // continue seamlessly after the toggle.
      const selectionStart = input.selectionStart;
      const selectionEnd = input.selectionEnd;

      input.type = showing ? "password" : "text";
      button.classList.toggle("is-visible", !showing);
      button.setAttribute("aria-pressed", showing ? "false" : "true");
      button.setAttribute("aria-label", showing ? "Show password" : "Hide password");

      input.focus();
      if (selectionStart !== null && selectionEnd !== null) {
        input.setSelectionRange(selectionStart, selectionEnd);
      }
    });
  });
}

/* ==========================================================================
   SIMULATED ACCOUNTS
   ========================================================================== */

const ACCOUNTS_KEY = "nexora_accounts";
const SESSION_KEY = "nexora_session";

function getAccounts() {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (error) {
    console.warn("Could not read accounts from storage:", error);
    return [];
  }
}

function findAccountByEmail(email) {
  const normalized = email.trim().toLowerCase();
  return getAccounts().find((account) => account.email.toLowerCase() === normalized) || null;
}

function createAccount({ name, email, phone, password, role }) {
  const accounts = getAccounts();
  const account = {
    id: "usr_" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    name,
    email,
    phone,
    password, // demo-only; see file header note
    role, // "owner" | "agent"
    createdAt: new Date().toISOString()
  };
  accounts.push(account);
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  return account;
}

/**
 * Stores the active session. `remember` controls persistence: checked uses
 * localStorage (survives closing the browser), unchecked uses
 * sessionStorage (cleared when the tab closes) — a real, if small, piece
 * of "Remember me" behavior rather than a purely decorative checkbox.
 */
function createSession(account, remember) {
  const session = { name: account.name, email: account.email, role: account.role };
  const store = remember ? localStorage : sessionStorage;
  const other = remember ? sessionStorage : localStorage;
  store.setItem(SESSION_KEY, JSON.stringify(session));
  other.removeItem(SESSION_KEY); // only one store should ever hold the live session
}

/**
 * Reads whichever storage currently holds the session (set by
 * createSession — localStorage if "remember me" was checked, otherwise
 * sessionStorage). Returns null if nobody is signed in.
 */
function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    console.warn("Could not read session from storage:", error);
    return null;
  }
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  sessionStorage.removeItem(SESSION_KEY);
}

/* ==========================================================================
   FORM HELPERS
   ========================================================================== */

function showFormError(form, message) {
  const errorEl = form.querySelector("[data-form-error]");
  if (!errorEl) return;
  errorEl.textContent = message;
  errorEl.hidden = false;
}

function hideFormError(form) {
  const errorEl = form.querySelector("[data-form-error]");
  if (errorEl) errorEl.hidden = true;
}

/**
 * Briefly disables the submit button with a "loading" label so the
 * simulated auth check feels like it's actually doing something, rather
 * than an instant, suspiciously-fast form submit.
 */
function withSimulatedDelay(button, loadingLabel, callback) {
  const originalLabel = button.textContent;
  button.disabled = true;
  button.textContent = loadingLabel;
  setTimeout(() => {
    callback();
    button.disabled = false;
    button.textContent = originalLabel;
  }, 500);
}

/* ==========================================================================
   LOGIN PAGE
   ========================================================================== */

function initLoginForm() {
  const form = document.querySelector("[data-login-form]");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    hideFormError(form);

    const formData = new FormData(form);
    const email = formData.get("email");
    const password = formData.get("password");
    const remember = formData.get("remember") === "on";
    const submitBtn = form.querySelector('button[type="submit"]');

    withSimulatedDelay(submitBtn, "Signing In\u2026", () => {
      const account = findAccountByEmail(email);

      if (!account) {
        showFormError(form, "No account found with that email. Try signing up instead.");
        return;
      }
      if (account.password !== password) {
        showFormError(form, "Incorrect password. Please try again.");
        return;
      }

      createSession(account, remember);
      const successEl = document.querySelector("[data-login-success]");
      if (successEl) {
        form.hidden = true;
        successEl.hidden = false;
      }
      setTimeout(() => {
        window.location.href = "../dashboard/index.html";
      }, 900);
    });
  });
}

function initForgotPassword() {
  const toggleLink = document.querySelector("[data-forgot-toggle]");
  const backLinks = document.querySelectorAll("[data-forgot-back]");
  const loginView = document.querySelector("[data-login-view]");
  const forgotView = document.querySelector("[data-forgot-view]");
  if (!toggleLink || !loginView || !forgotView) return;

  toggleLink.addEventListener("click", (event) => {
    event.preventDefault();
    loginView.hidden = true;
    forgotView.hidden = false;

    // Always reopen to the form, not a leftover success state from last time.
    const formWrap = document.querySelector("[data-forgot-form-wrap]");
    const successEl = document.querySelector("[data-forgot-success]");
    if (formWrap) formWrap.hidden = false;
    if (successEl) successEl.hidden = true;
    const forgotForm = document.querySelector("[data-forgot-form]");
    forgotForm?.reset();
  });

  backLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      forgotView.hidden = true;
      loginView.hidden = false;
    });
  });

  const forgotForm = document.querySelector("[data-forgot-form]");
  forgotForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const formEl = document.querySelector("[data-forgot-form-wrap]");
    const successEl = document.querySelector("[data-forgot-success]");
    if (formEl) formEl.hidden = true;
    if (successEl) successEl.hidden = false;
  });
}

/* ==========================================================================
   SIGNUP PAGE
   ========================================================================== */

function initSignupForm() {
  const form = document.querySelector("[data-signup-form]");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    hideFormError(form);

    const formData = new FormData(form);
    const role = formData.get("role");
    const name = formData.get("name");
    const email = formData.get("email");
    const phone = formData.get("phone");
    const password = formData.get("password");
    const confirmPassword = formData.get("confirmPassword");
    const submitBtn = form.querySelector('button[type="submit"]');

    if (!role) {
      showFormError(form, "Please choose whether you're an owner or an agent.");
      return;
    }
    if (password !== confirmPassword) {
      showFormError(form, "Passwords do not match.");
      return;
    }
    if (findAccountByEmail(email)) {
      showFormError(form, "An account with that email already exists. Try signing in instead.");
      return;
    }

    withSimulatedDelay(submitBtn, "Creating Account\u2026", () => {
      const account = createAccount({ name, email, phone, password, role });
      createSession(account, true);

      const successEl = document.querySelector("[data-signup-success]");
      if (successEl) {
        form.hidden = true;
        successEl.hidden = false;
      }
      setTimeout(() => {
        window.location.href = "../dashboard/index.html";
      }, 900);
    });
  });
}

function initRoleSelector() {
  const roleCards = document.querySelectorAll("[data-role-option]");
  if (!roleCards.length) return;

  roleCards.forEach((card) => {
    const input = card.querySelector("input");
    input?.addEventListener("change", () => {
      roleCards.forEach((c) => c.classList.toggle("is-selected", c === card));
    });
  });
}

function initGoogleAuth() {
  document.querySelectorAll("[data-google-auth]").forEach((button) => {
    button.addEventListener("click", () => {
      const form = button.closest(".auth-card")?.querySelector("form");
      if (form) {
        showFormError(
          form,
          "Google authentication will be available when the backend OAuth connection is added."
        );
      }
    });
  });
}

/* ---------- Init ---------- */
document.addEventListener("DOMContentLoaded", () => {
  initPasswordToggles();
  initLoginForm();
  initForgotPassword();
  initSignupForm();
  initRoleSelector();
  initGoogleAuth();
});
