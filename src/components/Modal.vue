<template>
<div @submit.prevent="preventEnter" class="modal fade" ref="modalID" tabindex="-1" role="dialog" aria-labelledby="dt-add-filter-modal-title"
     aria-hidden="true">
  <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title">
	  <slot name="title"></slot>
	</h5>
        <div class="modal-close">
          <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close">
          </button>
        </div>
      </div>
      <div class="modal-body">
	<slot name="body"></slot>
      </div>
      <div class="modal-footer">
        <div class="mr-auto">
        </div>
	<slot name="footer"></slot>
        <div class="alert alert-info test-feedback w-100" style="display: none;">
        </div>
      </div>
    </div>
  </div>
</div>
</template>

<script>
import { defineComponent } from 'vue';
export default defineComponent({
    components: {
    },
    props: {
    },
    emits: ["hidden", "showed"],
    created() {
    },
    data() {
	return {
	};
    },
    mounted() {
	let me = this;
	$(this.$refs["modalID"]).on('shown.bs.modal', function (e) {
	    me.$emit("showed");
	});
	$(this.$refs["modalID"]).on('hidden.bs.modal', function (e) {
	    me.$emit("hidden");
	});
    },
    methods: {
	show: function() {
	    $(this.$refs["modalID"]).modal("show");
	},
	preventEnter: function() {},
	close: function() {
	    $(this.$refs["modalID"]).modal("hide");
	},
    },
});
</script>

