<template>
  <div class="tm-session">
    <TmFormStruct :submit="onSubmit" class="tm-session-container">
      <div class="tm-session-header">
        <a @click="goToWelcome()">
          <i class="material-icons">arrow_back</i>
        </a>
        <div class="tm-session-title">
          Sign In
        </div>
        <a @click="$store.commit(`toggleSessionModal`, false)">
          <i class="material-icons">close</i>
        </a>
      </div>
      <div class="tm-session-main">
        <TmFormGroup field-id="sign-in-name" field-label="Select Account">
          <TmField
            id="sign-in-name"
            v-model="signInName"
            :options="accounts"
            type="select"
            placeholder="Select account…"
            vue-focus="vue-focus"
          />
          <TmFormMsg
            v-if="$v.signInName.$error && !$v.signInName.required"
            name="Name"
            type="required"
          />
        </TmFormGroup>
        <TmFormGroup
          :error="$v.signInPassword.$error"
          field-id="sign-in-password"
          field-label="Password"
        >
          <TmField
            id="sign-in-password"
            v-model="signInPassword"
            type="password"
          />
          <TmFormMsg
            v-if="$v.signInPassword.$error && !$v.signInPassword.required"
            name="Password"
            type="required"
          />
          <TmFormMsg
            v-if="$v.signInPassword.$error && !$v.signInPassword.minLength"
            name="Password"
            type="minLength"
            min="10"
          />
          <TmFormMsg v-if="error" type="custom" :msg="error" />
        </TmFormGroup>
      </div>
      <div class="tm-session-footer">
        <TmBtn value="Next" size="lg" />
      </div>
    </TmFormStruct>
  </div>
</template>

<script>
import { mapGetters } from "vuex"
import { required, minLength } from "vuelidate/lib/validators"
import TmBtn from "common/TmBtn"
import TmFormGroup from "common/TmFormGroup"
import TmFormStruct from "common/TmFormStruct"
import TmField from "common/TmField"
import TmFormMsg from "common/TmFormMsg"
export default {
  name: `tm-session-sign-in`,
  components: {
    TmBtn,
    TmField,
    TmFormGroup,
    TmFormMsg,
    TmFormStruct
  },
  data: () => ({
    signInName: ``,
    signInPassword: ``,
    error: ``
  }),
  computed: {
    ...mapGetters([`session`]),
    accounts() {
      let accounts = this.session.accounts
      accounts = accounts.filter(({ name }) => name !== `trunk`)
      return accounts.map(({ name }) => ({ key: name, value: name }))
    }
  },
  mounted() {
    this.setDefaultAccount(this.accounts)
  },
  methods: {
    goToWelcome() {
      this.$store.commit(`setSessionModalView`, `welcome`)
    },
    async onSubmit() {
      this.$v.$touch()
      if (this.$v.$error) return
      const sessionCorrect = await this.$store.dispatch(`testLogin`, {
        password: this.signInPassword,
        localKeyPairName: this.signInName
      })
      if (sessionCorrect) {
        this.$store.dispatch(`signIn`, {
          password: this.signInPassword,
          localKeyPairName: this.signInName,
          sessionType: "local"
        })
        localStorage.setItem(`prevAccountKey`, this.signInName)
        this.$store.commit(`toggleSessionModal`, false)
      } else {
        this.error = `The provided username or password is wrong.`
      }
    },
    setDefaultAccount() {
      const prevAccountKey = localStorage.getItem(`prevAccountKey`)
      const prevAccountExists = this.accounts.find(
        a => a.key === prevAccountKey
      )

      if (this.accounts.length === 1) {
        this.signInName = this.accounts[0].key
      } else if (prevAccountExists) {
        this.signInName = prevAccountKey
      }

      if (this.signInName) {
        this.$el.querySelector(`#sign-in-password`).focus()
      } else {
        this.$el.querySelector(`#sign-in-name`).focus()
      }
    }
  },
  validations: () => ({
    signInName: { required },
    signInPassword: { required, minLength: minLength(10) }
  })
}
</script>
<style>
.tm-form-group a {
  cursor: pointer;
}
</style>
