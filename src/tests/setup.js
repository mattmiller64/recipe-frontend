import { config } from "@vue/test-utils";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import "vuetify/styles";

const vuetify = createVuetify({
  components,
  directives,
});

config.global.plugins = [vuetify];
config.global.stubs = {
  "router-link": true,
  "router-view": true,
};
