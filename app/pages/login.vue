<script setup lang="ts">
import { reactive, ref } from "vue";
import { createBeaverHandoffRequest } from "~/services/auth.service";
import { getApiErrorMessage } from "~/services/errors";

definePageMeta({
  layout: "login",
  middleware: "guest",
});

const auth = useAuth();
const errorMessage = ref("");
const submitting = ref(false);
const form = reactive({
  username: "",
  password: "",
});

async function handleSubmit() {
  errorMessage.value = "";
  submitting.value = true;

  try {
    const user = await auth.signIn({
      username: form.username,
      password: form.password,
    });

    if (user?.is_superadmin) {
      await navigateTo("/");
      return;
    }

    const handoff = await createBeaverHandoffRequest(
      user?.tenant_id as number | null | undefined,
    );

    if (!handoff.redirect_url || !handoff.code) {
      throw new Error("Invalid Beaver handoff response");
    }

    const url = new URL("/hub-bridge", handoff.redirect_url);
    url.searchParams.set("code", handoff.code);

    if (import.meta.client) {
      window.location.assign(url.toString());
    }
  } catch (error) {
    errorMessage.value = getApiErrorMessage(
      error,
      "No se pudo iniciar sesión.",
    );
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-card">
      <img
        class="login-card__logo"
        src="/images/xercode.svg"
        alt="Xercode"
      >
      <form class="login-form" @submit.prevent="handleSubmit">
        <label>
          <span>Usuario</span>
          <input
            v-model="form.username"
            type="text"
            autocomplete="username"
            required
          />
        </label>

        <label>
          <span>Contraseña</span>
          <input
            v-model="form.password"
            type="password"
            autocomplete="current-password"
            required
          />
        </label>

        <p v-if="errorMessage" class="login-error">
          {{ errorMessage }}
        </p>

        <button type="submit" :disabled="submitting">
          {{ submitting ? "Entrando..." : "Entrar" }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 1.5rem;
}

.login-card {
  width: min(100%, 28rem);
  padding: 2rem;
  border-radius: 1rem;
  border: 1px solid rgba(var(--color-primary-rgb), 0.1);
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 25px 60px rgba(var(--color-primary-rgb), 0.14);
}

.login-card__logo {
  display: block;
  width: min(13rem, 100%);
  height: auto;
  margin: 0 auto 1.5rem;
}

.login-card h1 {
  margin: 0 0 1.5rem;
  color: var(--color-heading);
  font-size: 2rem;
}

.login-form {
  display: grid;
  gap: 1rem;
}

.login-form label {
  display: grid;
  gap: 0.4rem;
}

.login-form input {
  width: 100%;
  border: 1px solid var(--color-gray-300);
  border-radius: 0.75rem;
  padding: 0.85rem 1rem;
  background: var(--color-white);
  color: var(--color-text);
}

.login-form input:focus {
  outline: 3px solid var(--color-focus);
  border-color: var(--color-secondary);
}

.login-form button {
  border: 0;
  border-radius: 0.75rem;
  padding: 0.9rem 1rem;
  background: var(--color-primary);
  color: var(--color-white);
  font-weight: 600;
  cursor: pointer;
}

.login-form button:hover:not(:disabled) {
  background: var(--color-primary-dark);
}

.login-form button:disabled {
  opacity: 0.7;
  cursor: wait;
}

.login-error {
  margin: 0;
  color: var(--color-error);
}
</style>
