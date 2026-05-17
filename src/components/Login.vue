<template>
  <div class="login-form">
    <h1 class="login-form__title">Fazer Login v{{ appVersion }}</h1>

    <div class="login-form__field">
      <small class="login-form__label">E-mail</small>
      <input
        v-model="email"
        type="text"
        class="login-form__input"
        placeholder="Digite seu e-mail"
        @keydown.enter.exact.prevent
        @keyup.enter.exact="onSubmit"
      />
    </div>

    <div class="login-form__field">
      <small class="login-form__label">Senha</small>
      <div class="login-form__password-wrapper">
        <input
          v-model="password"
          :type="isPasswordVisible ? 'text' : 'password'"
          class="login-form__input login-form__input--password"
          placeholder="Digite sua senha"
          @keydown.enter.exact.prevent
          @keyup.enter.exact="onSubmit"
        />
        <button
          type="button"
          class="login-form__password-toggle"
          :aria-label="isPasswordVisible ? 'Ocultar senha' : 'Mostrar senha'"
          @click="isPasswordVisible = !isPasswordVisible"
        >
          <ion-icon :name="isPasswordVisible ? 'eye-off-outline' : 'eye-outline'" />
        </button>
      </div>
    </div>

    <button
      type="button"
      class="login-form__button"
      :class="{ 'login-form__button--loading': isLoading }"
      :disabled="isLoading"
      @click="onSubmit"
    >
      {{ isLoading ? 'AGUARDE...' : 'ENTRAR' }}
    </button>
  </div>
</template>

<script>
import { mapState, mapMutations } from '@/stores/compat'
import { authApi } from '@/services/auth-api'

export default {
  name: 'AppLogin',
  data() {
    return {
      isLoading: false,
      email: '',
      password: '',
      isPasswordVisible: false,
    }
  },
  computed: {
    ...mapState(['appVersion']),
  },
  methods: {
    ...mapMutations('auth', ['authenticate']),
    async onSubmit() {
      if (this.isLoading) return
      this.isLoading = true
      try {
        const { token, user } = await authApi.login(this.email, this.password)
        this.authenticate({
          token,
          user: {
            id: parseInt(user.id),
            credit: user.credit,
            email: user.email,
            username: user.username,
            maxcoins: user.maxcoins,
            type: user.type,
            group: user.group ? user.group.name : null,
            avatar: user.avatar ? user.avatar.name : null,
            dateCreated: user.dateCreated,
          },
        })
        this.$router.replace('/').catch(() => undefined)
      } catch {
        this.$toast.error('Verifique os seus dados de acesso, ou sua conexão com a Internet.', 'Erro', {
          position: 'topCenter',
        })
      } finally {
        this.isLoading = false
      }
    },
  },
}
</script>

<style lang="scss" scoped>
.login-form {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;

  &__title {
    margin-bottom: 40px;
  }

  &__field {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 30px;

    &:last-of-type {
      margin-bottom: 0;
    }
  }

  &__label {
    color: rgba(255, 255, 255, 0.5);
  }

  &__input {
    background-color: transparent;
    outline: 0;
    border: 0;
    border-bottom: 2px solid #fff;
    padding: 5px 0 10px;
    color: #fff;
    width: 360px;
    font-size: 16px;
    font-weight: bold;
    transition: border-color 0.2s ease;
    caret-color: rgb(133, 208, 255);

    &:focus {
      border-bottom-color: rgb(133, 208, 255);
    }

    // Hide Edge/IE native password reveal button — we ship our own.
    &::-ms-reveal,
    &::-ms-clear {
      display: none;
    }

    &--password {
      padding-right: 32px;
    }
  }

  &__password-wrapper {
    position: relative;
    display: inline-flex;
    align-items: center;
  }

  &__password-toggle {
    position: absolute;
    right: 0;
    bottom: 8px;
    background: transparent;
    border: 0;
    padding: 0;
    cursor: pointer;
    color: rgba(255, 255, 255, 0.5);
    font-size: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.2s ease;

    &:hover,
    &:focus-visible {
      color: rgb(133, 208, 255);
      outline: 0;
    }
  }

  &__button {
    transition: 0.3s all;
    background-color: rgba(133, 208, 255, 0.7);
    border: 0;
    padding: 8px 15px;
    font-size: 16px;
    border-radius: 8px;
    margin-top: 60px;
    outline: 0;
    cursor: pointer;
    width: 200px;
    box-shadow: inset 0 0 1px rgb(133, 208, 255), 0 0 1px rgb(133, 208, 255);
    color: #fff;

    &:hover,
    &--loading {
      background-color: rgb(133, 208, 255);
      box-shadow: inset 0 0 1px rgb(133, 208, 255), 0 0 3px rgb(133, 208, 255);
    }

    &:disabled {
      cursor: wait;
    }
  }
}
</style>
