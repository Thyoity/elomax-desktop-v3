import { defineStore } from 'pinia'

interface User {
  id: number
  credit: any
  email: string
  username: string
  maxcoins: any
  type: any
  group: string | null
  avatar: string | null
  dateCreated: any
}

interface State {
  token: string | null
  user: User | null
}

export const useAuthStore = defineStore('auth', {
  state: (): State => ({
    token: null,
    user: null,
  }),
  actions: {
    AUTHENTICATE({ token, user }: { token: string; user: User }) {
      this.token = token
      this.user = user
    },
    SET_USER(rawUser: any) {
      this.user = {
        id: parseInt(rawUser.id),
        credit: rawUser.credit,
        email: rawUser.email,
        username: rawUser.username,
        maxcoins: rawUser.maxcoins,
        type: rawUser.type,
        group: rawUser.group ? rawUser.group.name : null,
        avatar: rawUser.avatar ? rawUser.avatar.name : null,
        dateCreated: rawUser.dateCreated,
      }
    },
    UPDATE_USER_CREDIT(credit: any) {
      if (this.user) this.user.credit = credit
    },
    LOGOUT() {
      this.token = null
      this.user = null
    },
  },
  persist: true,
})
