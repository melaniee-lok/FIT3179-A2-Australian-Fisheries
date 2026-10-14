// Chart data, labels and tooltips are defined in the JSON specification.
vegaEmbed("#sector-trend", "charts/sector_trend.vg.json", {
  actions: false,
  renderer: "svg"
}).then(function () {
  document.getElementById("chart-status").hidden = true;
}).catch(function (error) {
  document.getElementById("chart-status").innerHTML =
    "The chart could not load.<br>Reload the page or download the CSV below.";
  console.error(error);
});

// State endpoints, highlights and annotations are defined in the JSON.
vegaEmbed("#state-aquaculture-slope", "charts/state_aquaculture_dumbbell.vg.json", {
  actions: false,
  renderer: "svg"
}).then(function () {
  document.getElementById("state-chart-status").hidden = true;
}).catch(function (error) {
  document.getElementById("state-chart-status").textContent =
    "The state chart could not load. Please reload.";
  console.error(error);
});

vegaEmbed("#state-aquaculture-share", "charts/state_aquaculture_share_map.vg.json", {
  actions: false,
  renderer: "svg"
}).then(function (result) {
  document.getElementById("share-chart-status").hidden = true;
  function showYear(year) {
    document.getElementById("map-selected-year").textContent =
      "Selected year: " + year + "\u2013" + String(year + 1).slice(2);
  }
  showYear(result.view.signal("Year_selection"));
  result.view.addSignalListener("Year_selection", function (name, year) {
    showYear(year);
  });
}).catch(function (error) {
  document.getElementById("share-chart-status").textContent = "The map could not load. Please reload.";
  console.error(error);
});

// Repeat layout adapts to the card width; map encodings stay in JSON.
fetch("charts/state_sector_small_multiples.vg.json")
  .then(function (response) { return response.json(); })
  .then(function (spec) {
    var container = document.getElementById("state-sector-maps");
    var currentView;
    var resizeTimer;
    function renderMaps() {
      var columns = container.clientWidth < 600 ? 1 : 3;
      spec.columns = columns;
      spec.spec.width = Math.max(200, Math.floor((container.clientWidth - 8 * (columns - 1) - 12) / columns));
      spec.spec.height = Math.round(spec.spec.width * 1.04);
      spec.spec.layer[2].encoding.x.value = spec.spec.width / 2;
      spec.spec.layer[1].encoding.size.scale.range = [0, Math.pow(spec.spec.width * 0.17, 2)];
      if (currentView) currentView.finalize();
      return vegaEmbed(container, spec, { actions: false, renderer: "svg" })
        .then(function (result) {
          currentView = result.view;
          document.getElementById("sector-maps-status").hidden = true;
        });
    }
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () { renderMaps().catch(console.error); }, 150);
    });
    return renderMaps();
  }).catch(function (error) {
    document.getElementById("sector-maps-status").textContent = "The production maps could not load. Please reload.";
    console.error(error);
  });

vegaEmbed("#commodity-treemap", "charts/commodity_treemap.vg.json", {
  actions: false,
  renderer: "svg"
}).then(function () {
  document.getElementById("commodity-chart-status").hidden = true;
}).catch(function (error) {
  document.getElementById("commodity-chart-status").textContent = "The commodity chart could not load. Please reload.";
  console.error(error);
});

vegaEmbed("#commodity-rank", "charts/commodity_rank_bump.vg.json", {
  actions: false,
  renderer: "svg"
}).then(function () {
  document.getElementById("rank-chart-status").hidden = true;
}).catch(function (error) {
  document.getElementById("rank-chart-status").textContent = "The ranking chart could not load. Please reload.";
  console.error(error);
});

vegaEmbed("#commodity-value-volume", "charts/commodity_value_volume_slope.vg.json", {
  actions: false,
  renderer: "svg"
}).then(function () {
  document.getElementById("volume-chart-status").hidden = true;
}).catch(function (error) {
  document.getElementById("volume-chart-status").textContent = "The quantity and value chart could not load. Please reload.";
  console.error(error);
});

// Heatmap selections and linked-view filters are defined in the JSON.
fetch("charts/commonwealth_catch_multiview.vg.json")
  .then(function (response) { return response.json(); })
  .then(function (spec) {
    var container = document.getElementById("commonwealth-catch");
    var fisheryNames = {"CTS": "Commonwealth Trawl Sector", "SPF": "Small Pelagic Fishery", "HIMI": "Heard Island and McDonald Islands Fishery", "GHAT": "Gillnet Hook and Trap Sector", "GAB": "Great Australian Bight Trawl Sector", "BSCZSF": "Bass Strait Central Zone Scallop Fishery", "MITF": "Macquarie Island Toothfish Fishery", "SSJF": "Southern Squid Jig Fishery", "ECDW": "East Coast Deepwater Trawl Sector", "STR": "South Tasman Rise Sector", "CSF": "Coral Sea Fishery"};
    var currentView;
    var resizeTimer;
    var history = spec.vconcat[1].hconcat[0];
    var species = spec.vconcat[1].hconcat[1];
    function showSelection() {
      var fishery = currentView.signal("Fishery_select").FisheryCode[0];
      var year = currentView.signal("Year_select").Year[0];
      document.getElementById("catch-selection-label").textContent =
        fisheryNames[fishery] + " \u00b7 " + year;
    }
    function renderCatch() {
      var width = container.clientWidth;
      if (currentView) {
        spec.vconcat[0].layer[1].params[0].value = [{ FisheryCode: currentView.signal("Fishery_select").FisheryCode[0] }];
        spec.vconcat[0].layer[1].params[1].value = [{ Year: currentView.signal("Year_select").Year[0] }];
        currentView.finalize();
      }
      var halfWidth = (width - 12) / 2;
      spec.vconcat[0].width = Math.max(160, width - 235);
      // Twenty-two year columns and eleven fishery rows give square cells.
      var heatmapHeight = spec.vconcat[0].width / 2;
      spec.vconcat[0].height = heatmapHeight;
      history.width = species.width = Math.max(60, halfWidth - 133);
      // Position each panel independently of the heatmap's label gutter.
      var chart = vegaLite.compile(spec).spec;
      delete chart.layout;
      chart.width = width;
      chart.height = heatmapHeight + 348;
      chart.padding = 0;
      chart.autosize = "none";
      Object.assign(chart.marks[0].encode.update, { x: { value: 210 }, y: { value: 65 } });
      var detail = chart.marks[1];
      delete detail.layout;
      detail.encode = { update: { x: { value: 0 }, y: { value: heatmapHeight + 133 } } };
      detail.marks[0].encode.update.x = { value: 90 };
      detail.marks[1].encode.update.x = { value: halfWidth + 12 + 98 };
      // Keep headings independent of changing tick and species-label widths.
      detail.marks.forEach(function (panel, index) {
        var heading = panel.title.text;
        delete panel.title;
        panel.marks.unshift({
          type: "text",
          encode: { update: {
            x: { value: index === 0 ? -84 : -110 },
            y: { value: -28 },
            text: { value: heading },
            font: { value: "Arial" },
            fontSize: { value: 14 },
            fontWeight: { value: 600 },
            fill: { value: "#153a44" }
          } }
        });
        panel.axes.forEach(function (axis) {
          if (axis.orient === "left") {
            axis.labelAlign = "right";
            axis.labelPadding = 8;
            if (axis.title) {
              axis.titleX = -75;
              axis.titleY = history.height / 2;
            }
          }
        });
      });
      chart.legends[0].orient = "none";
      chart.legends[0].legendX = 0;
      chart.legends[0].gradientLength = Math.max(160, width - 20);
      chart.legends[0].legendY = 0;
      return vegaEmbed(container, chart, { actions: false, renderer: "svg" })
        .then(function (result) {
          currentView = result.view;
          showSelection();
          currentView.addSignalListener("Fishery_select", showSelection);
          currentView.addSignalListener("Year_select", showSelection);
          document.getElementById("catch-chart-status").hidden = true;
        });
    }
    window.addEventListener("resize", function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () { renderCatch().catch(console.error); }, 150);
    });
    return renderCatch();
  }).catch(function (error) {
    document.getElementById("catch-chart-status").textContent = "The catch views could not load. Please reload.";
    console.error(error);
  });

vegaEmbed("#stock-status-history", "charts/stock_status_alluvial.vg.json", {
  actions: false,
  renderer: "svg"
}).then(function () {
  document.getElementById("stock-chart-status").hidden = true;
}).catch(function (error) {
  document.getElementById("stock-chart-status").textContent = "The stock assessments could not load. Please reload.";
  console.error(error);
});

vegaEmbed("#commonwealth-fishing-intensity", "charts/commonwealth_fishing_intensity_map.vg.json", {
  actions: false,
  renderer: "svg"
}).then(function (result) {
  function showFishingYear() {
    document.getElementById("intensity-selected-year").textContent =
      "Selected year: " + result.view.signal("SelectedYear");
  }
  showFishingYear();
  result.view.addSignalListener("SelectedYear", showFishingYear);
  document.getElementById("intensity-chart-status").hidden = true;
}).catch(function (error) {
  document.getElementById("intensity-chart-status").textContent = "The fishing-intensity map could not load. Please reload.";
  console.error(error);
});
