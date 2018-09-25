import setup from "../../../helpers/vuex-setup"
import LiValidator from "renderer/components/staking/LiValidator"

describe("LiValidator", () => {
  let wrapper, store, delegate
  let instance = setup()

  beforeEach(async () => {
    let test = instance.mount(LiValidator, {
      propsData: {
        delegate: {
          id: "abc",
          description: {}
        }
      }
    })
    wrapper = test.wrapper
    store = test.store

    store.commit("setAtoms", 1337)
    await store.dispatch("getDelegates")
    delegate = store.state.delegates.delegates[0]
    delegate.percent_of_vote = "22%"
    wrapper.setData({ delegate })
  })

  it("has the expected html structure", () => {
    expect(wrapper.vm.$el).toMatchSnapshot()
  })

  it("should show the voting power", () => {
    expect(wrapper.html()).toContain("22%")
  })

  it("should show the type of the candidate", () => {
    wrapper.vm.delegate = {
      revoked: false,
      isValidator: false
    }
    expect(wrapper.vm.delegateType).toBe("Candidate")
    wrapper.vm.delegate = {
      revoked: false,
      isValidator: true
    }
    expect(wrapper.vm.delegateType).toBe("Validator")
    wrapper.vm.delegate = {
      revoked: true,
      isValidator: false
    }
    expect(wrapper.vm.delegateType).toBe("Revoked")
    wrapper.vm.delegate = {
      revoked: true,
      isValidator: true
    }
    expect(wrapper.vm.delegateType).toBe("Revoked")
  })
})
