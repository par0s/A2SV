<template>
  <v-container class="my-5 pt-8 v-card--shaped grey lighten-5 shadow-in">
    <v-row class="mx-md-5" dense>
      <v-col class="px-2" cols="12" md="6" data-v-step="2">
        <v-autocomplete
          class="v-card--shaped"
          v-model="country"
          :items="countries"
          :label="$t('country')"
          item-text="name"
          outlined
          dense
          return-object
          @input="fetchData"
        />
      </v-col>
      <v-col class="px-2" cols="12" md="6">
        <v-menu
          :close-on-content-click="false"
          transition="scale-transition"
          max-width="290px"
          min-width="290px"
        >
          <template v-slot:activator="{ on }">
            <v-text-field
              class="v-card--shaped"
              color="primary"
              outlined
              dense
              v-model="dateRangeText"
              :label="$t('dateRange')"
              :prepend-inner-icon="mdiCalendar"
              readonly
              v-on="on"
            />
          </template>
          <v-date-picker
            color="primary"
            :min="date_range.length === 1 ? date_range[0] : null"
            :max="maxDate"
            range
            no-title
            v-model="date_range"
            @input="
              () => {
                if (date_range.length === 2 && date_range[0] && date_range[1])
                  fetchData();
              }
            "
          />
        </v-menu>
      </v-col>
    </v-row>
    <v-row>
      <v-col cols="12" md="9" class="overflow-auto pl-md-10">
        <loader
          v-if="graphLoaders[mode] > 0"
          style="position:absolute; left: 35%; top: 45%"
        />
        <line-chart
          :style="`opacity: ${graphLoaders[mode] > 0 ? 0.5 : 1}`"
          class="pb-6 px-1"
          ref="graph"
          :chart-data="data"
          :options="chartOptions"
        />
        <v-fade-transition hide-on-leave>
          <div class="ma-2" v-if="graphLoaders.descriptions">
            <v-skeleton-loader
              ref="skeleton"
              type="text,text"
              class="mx-auto my-3"
            />
          </div>
          <small
            v-else-if="!short_description"
            class="d-block grey--text my-3 text--darken-1"
            v-text="'No Description'"
          />
          <small
            v-else
            class="d-block grey--text my-3 text--darken-2"
            v-text="short_description"
          />
        </v-fade-transition>
      </v-col>
      <v-col cols="12" md="3">
        <country-resources :country="country" />
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import { ChartMixin, LineChart } from "./charts.js";
import CountryResources from "../CountryResources";
import Loader from "@/components/core/Loader.vue";
import store from "@/store";
import { mdiCalendar } from "@mdi/js";

export default {
  components: { LineChart, Loader, CountryResources },
  mixins: [ChartMixin],
  props: {
    mode: {
      type: String,
      default() {
        return "counts";
      }
    }
  },
  data() {
    return {
      mdiCalendar,
      data: null,
      date_range: [this.defaultDate(), this.defaultDate("end")],
      country: { name: this.$t("World"), slug: "World" },
      age_range: "All",
      social_distancing: 50
    };
  },
  methods: {
    fillGraph() {
      let datasets = [];
      let load = this.mode === "counts" ? this.counts : this.rates;
      this.criteria[this.mode].forEach(cr => {
        let input = {
          label: cr.label,
          color: cr.color,
          data: load[cr.label]
        };
        datasets.push(this.makeDataSet(input));
      });
      this.data = {
        datasets: datasets
      };
    },
    fetchData() {
      store.dispatch("setDisplayData", {
        criteria: this.criteria[this.mode],
        makeDataSet: this.makeDataSet,
        mode: this.mode,
        country: this.country.slug,
        start_date: this.date_range[0] || this.defaultDate(),
        end_date: this.date_range[1] || this.defaultDate("end")
      });
    }
  },
  watch: {
    counts: {
      deep: true,
      handler() {
        this.fillGraph();
      }
    },
    rates: {
      deep: true,
      handler() {
        this.fillGraph();
      }
    }
  },
  mounted() {
    this.fetchData();
  },
  computed: {
    counts: () => store.getters.getDisplayCounts,
    rates: () => store.getters.getDisplayRates,
    graphLoaders: () => store.getters.getGraphLoaders,
    dateRangeText() {
      return this.rangeToText(this.date_range[0], this.date_range[1]);
    }
  }
};
</script>
