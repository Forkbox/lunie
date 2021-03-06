<template>
  <div class="tm-session">
    <div class="tm-session-container">
      <div class="tm-session-header">
        <a @click="setState('welcome')">
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
        <HardwareState :loading="status === `connect` ? false : true">
          <template v-if="status === `connect` || status === `detect`">
            Please plug in your Ledger&nbsp;Nano and open the Cosmos app
          </template>
          <template v-if="status === `confirmAddress`">
            Sign in with the address
            <span class="address">{{ address }}</span
            >.<br />
            Please confirm on your Ledger.
          </template>
          <p v-if="connectionError" class="error-message">
            {{ connectionError }}
          </p>
        </HardwareState>
      </div>
      <div class="tm-session-footer">
        <div class="install-notes">
          <p class="ledger-install">
            Don't have the Cosmos Ledger App yet? Install it
            <a
              href="https://github.com/cosmos/voyager#ledger-cosmos-app"
              target="_blank"
              rel="noopener noreferrer"
            >
              here</a
            >.
          </p>
          <p class="ledger-install">
            Don't have a Ledger yet?
            <a
              href="https://shop.ledger.com/?r=3dd204ef7508"
              target="_blank"
              rel="noopener noreferrer"
            >
              Get one here</a
            >.
          </p>
        </div>
        <TmBtn
          :value="submitCaption"
          :disabled="status === `connect` ? false : `disabled`"
          @click.native="signIn()"
        />
      </div>
    </div>
  </div>
</template>

<script>
import TmBtn from "common/TmBtn"
import HardwareState from "common/TmHardwareState"
export default {
  name: `tm-session-hardware`,
  components: { TmBtn, HardwareState },
  data: () => ({
    status: `connect`,
    connectionError: null,
    address: null
  }),
  computed: {
    submitCaption() {
      return {
        connect: "Sign In",
        detect: "Waiting for Ledger",
        confirmAddress: "Confirming Address"
      }[this.status]
    }
  },
  methods: {
    setState(value) {
      this.$store.commit(`setSessionModalView`, value)
    },
    async signIn() {
      this.connectionError = null
      this.status = `detect`
      this.address = null
      try {
        this.address = await this.$store.dispatch(`connectLedgerApp`)
      } catch ({ message }) {
        this.status = `connect`
        this.connectionError = message
        return
      }

      this.status = `confirmAddress`
      if (await this.confirmAddress()) {
        await this.$store.dispatch(`signIn`, {
          sessionType: `ledger`,
          address: this.address
        })
        return
      }

      this.status = `connect`
    },
    async confirmAddress() {
      try {
        await this.$store.dispatch("confirmLedgerAddress")
        return true
      } catch ({ message }) {
        this.connectionError = message
      }
      return false
    }
  }
}
</script>
<style scoped>
.error-message {
  color: var(--danger);
  font-size: var(--sm);
  font-style: italic;
  margin-bottom: 0;
  padding-top: 1rem;
}

.install-notes {
  flex-direction: column;
}

.ledger-install {
  font-size: var(--sm);
  margin-bottom: 0;
}

.tm-session-footer {
  padding: 0 1rem;
  justify-content: space-between;
}

.address {
  color: var(--link);
  font-weight: 500;
  font-size: 14px;
  white-space: nowrap;
}
</style>
