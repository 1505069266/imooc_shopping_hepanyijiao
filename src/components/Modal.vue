<template>
  <div>
     <div class="md-modal modal-msg md-modal-transition" v-bind:class="{'md-show':mdShow}">
          <div class="md-modal-inner">
            <div class="md-top">
              <div class="md-title"><slot name="header"></slot></div>
              <button class="md-close" @click="closeModal">Close</button>
            </div>
            <div class="md-content">
              <div class="confirm-tips">
                <slot name="msg"></slot>
              </div>
              <div class="btn-wrap">
                <slot name="btnGroup"></slot>
              </div>
            </div>
          </div>
        </div>
        <div class="md-overlay" v-if="mdShow" @click="closeModal"></div>
  </div>
</template>

<script>
export default {
  name:"",
  props: ["mdShow"],
  components: {},
  data() {
    return {

    };
  },
  created() {},
  computed: {},
  methods: {
    closeModal(){
      this.$emit("close")
    }
  },
};
</script>

<style scoped>

</style>
