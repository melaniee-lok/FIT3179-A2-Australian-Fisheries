// Prevent a repeated panel's sector colour from colouring the shared size key.
function neutralSizeLegend(chart) {
  function allowHoverThroughLabels(marks) {
    (marks || []).forEach(function (mark) {
      if (mark.type === "text") mark.interactive = false;
      allowHoverThroughLabels(mark.marks);
    });
  }
  allowHoverThroughLabels(chart.marks);
  (chart.legends || []).forEach(function (legend) {
    if (!legend.size) return;
    legend.encode = legend.encode || {};
    legend.encode.symbols = legend.encode.symbols || {};
    var update = legend.encode.symbols.update || {};
    update.fill = { value: "#777777" };
    update.stroke = { value: "#777777" };
    update.fillOpacity = { value: 1 };
    legend.encode.symbols.update = update;
  });
  return chart;
}

// Load lower charts near the viewport instead of all at startup.
function loadWhenVisible(id, render) {
  var container = document.getElementById(id);
  if (!container) {
    console.error("Chart container not found: " + id);
    return;
  }
  container.style.minHeight = id === "commonwealth-catch" ? "580px" : "420px";
  function load() {
    Promise.resolve(render()).finally(function () {
      container.style.minHeight = "";
    });
  }
  if (!("IntersectionObserver" in window)) return load();
  var observer = new IntersectionObserver(function (entries) {
    if (entries.some(function (entry) { return entry.isIntersecting; })) {
      observer.disconnect();
      load();
    }
  }, { rootMargin: "300px 0px" });
  observer.observe(container.closest("figure"));
}

// Chart data, labels and tooltips are defined in the JSON specification.
vegaEmbed("#sector-trend", "charts/1_sector_trend.vg.json", {
  actions: true,
  renderer: "svg"
}).then(function () {
  document.getElementById("chart-status").hidden = true;
}).catch(function (error) {
  document.getElementById("chart-status").innerHTML =
    "The chart could not load.<br>Reload the page or download the CSV below.";
  console.error(error);
});

// State endpoints, highlights and annotations are defined in the JSON.

loadWhenVisible("state-aquaculture-slope", function () {
  return vegaEmbed("#state-aquaculture-slope", "charts/2_state_aquaculture_dumbbell.vg.json", {
  actions: true,
  renderer: "svg"
}).then(function () {
  document.getElementById("state-chart-status").hidden = true;
}).catch(function (error) {
  document.getElementById("state-chart-status").textContent =
    "The state chart could not load. Please reload.";
  console.error(error);
});
});

loadWhenVisible("state-aquaculture-share", function () {
  return vegaEmbed("#state-aquaculture-share", "charts/3_state_aquaculture_share_map.vg.json", {
  actions: true,
  renderer: "svg",
  patch: function (chart) {
    function passThroughLabels(marks) {
      (marks || []).forEach(function (mark) {
        if (mark.type === "text") mark.interactive = false;
        passThroughLabels(mark.marks);
      });
    }
    passThroughLabels(chart.marks);
    return chart;
  }
}).then(async function (result) {
  var shareRows = vega.read(await (await fetch("data/3_state_aquaculture_share_yearly.csv")).text(), {type: "csv", parse: {YearStart: "number", AquacultureShare: "number"}});
  document.getElementById("share-chart-status").hidden = true;
  function showYear(year) {
    var leader = shareRows.filter(function (row) { return row.YearStart === year; }).sort(function (a, b) { return b.AquacultureShare - a.AquacultureShare; })[0];
    document.getElementById("map-highest-share").textContent = leader ? "Highest aquaculture share: " + leader.State + " \u2014 " + Math.round(leader.AquacultureShare) + "%" : "";
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
});

loadWhenVisible("state-sector-maps", function () {
  return fetch("charts/4_state_sector_small_multiples.vg.json")
  .then(function (response) { return response.json(); })
  .then(function (spec) {
    var container = document.getElementById("state-sector-maps");
    var currentView;
    var resizeTimer;
    function renderMaps() {
      var columns = container.clientWidth < 600 ? 1 : 3;
      spec.columns = columns;
      spec.spec.width = Math.max(200, Math.floor((container.clientWidth - 8 * (columns - 1) - 12) / columns));
      spec.spec.height = columns === 3 ? 350 : Math.round(spec.spec.width * 1.04);
      spec.spec.layer[2].encoding.x.value = spec.spec.width / 2;
      spec.spec.layer[1].encoding.size.scale.range = [0, Math.pow(spec.spec.width * 0.17, 2)];
      if (currentView) currentView.finalize();
      return vegaEmbed(container, spec, {
        actions: true,
        renderer: "svg",
        patch: neutralSizeLegend
      })
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
});

loadWhenVisible("commodity-treemap", function () {
  return vegaEmbed("#commodity-treemap", "charts/5_commodity_treemap.vg.json", {
  actions: true,
  renderer: "svg"
}).then(function () {
  document.getElementById("commodity-chart-status").hidden = true;
}).catch(function (error) {
  document.getElementById("commodity-chart-status").textContent = "The commodity chart could not load. Please reload.";
  console.error(error);
});
});

loadWhenVisible("commodity-rank", function () {
  return vegaEmbed("#commodity-rank", "charts/6_commodity_rank_bump.vg.json", {
  actions: true,
  renderer: "svg"
}).then(function () {
  document.getElementById("rank-chart-status").hidden = true;
}).catch(function (error) {
  document.getElementById("rank-chart-status").textContent = "The ranking chart could not load. Please reload.";
  console.error(error);
});
});

loadWhenVisible("commodity-value-volume", function () {
  return vegaEmbed("#commodity-value-volume", "charts/7_commodity_value_volume_slope.vg.json", {
  actions: true,
  renderer: "svg",
  tooltip: {
    formatTooltip: function (value, sanitize) {
      return '<table class="slope-tooltip"><tbody>' + Object.keys(value).map(function (key) {
        var label = key.indexOf("Implied production value") === 0
          ? 'Implied production value<span class="tooltip-unit">(A$ per kilogram)</span>'
          : sanitize(key);
        return '<tr><td class="key">' + label + '</td><td class="value">' + sanitize(String(value[key])) + '</td></tr>';
      }).join('') + '</tbody></table>';
    }
  }
}).then(function () {
  document.getElementById("volume-chart-status").hidden = true;
}).catch(function (error) {
  document.getElementById("volume-chart-status").textContent = "The quantity and value chart could not load. Please reload.";
  console.error(error);
});

// Heatmap selections and linked-view filters are defined in the JSON.
});

loadWhenVisible("commonwealth-catch", function () {
  return fetch("charts/8_commonwealth_catch_multiview.vg.json")
  .then(function (response) { return response.json(); })
  .then(function (spec) {
    var container = document.getElementById("commonwealth-catch");
    var fisheryNames = {"CTS": "Commonwealth Trawl Sector", "SPF": "Small Pelagic Fishery", "HIMI": "Heard Island and McDonald Islands Fishery", "GHAT": "Gillnet Hook and Trap Sector", "GAB": "Great Australian Bight Trawl Sector", "BSCZSF": "Bass Strait Central Zone Scallop Fishery", "MITF": "Macquarie Island Toothfish Fishery", "SSJF": "Southern Squid Jig Fishery", "ECDW": "East Coast Deepwater Trawl Sector", "STR": "South Tasman Rise Sector", "CSF": "Coral Sea Fishery"};
    var currentView;
    var resizeTimer;
    var species = spec.vconcat[1].hconcat[0];
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
      spec.vconcat[0].width = Math.max(160, width - 235);
      // Twenty-two year columns and eleven fishery rows give square cells.
      var heatmapHeight = spec.vconcat[0].width / 2;
      spec.vconcat[0].height = heatmapHeight;
      species.width = Math.max(60, width - 235);
      species.height = 160;
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
      detail.marks[0].encode.update.x = { value: 210 };
      // Keep headings independent of changing tick and species-label widths.
      detail.marks.forEach(function (panel, index) {
        var heading = panel.title.text;
        delete panel.title;
        panel.marks.unshift({
          type: "text",
          encode: { update: {
            x: { value: -210 },
            y: { value: -28 },
            text: { value: heading },
            font: { value: "Arial" },
            fontSize: { value: 14 },
            fontWeight: { value: 600 },
            fill: { value: "#292929" }
          } }
        });
        panel.axes.forEach(function (axis) {
          if (axis.orient === "left") {
            axis.labelAlign = "right";
            axis.labelPadding = 8;
            if (axis.title) {
              axis.titleX = -75;
              axis.titleY = species.height / 2;
            }
          }
        });
      });
      chart.marks.push({
        type: "rect", interactive: false,
        encode: {update: {x: {value: width - 155}, y: {value: 0}, width: {value: 14}, height: {value: 14}, fill: {value: "#c6c6c6"}}}
      }, {
        type: "text", interactive: false,
        encode: {update: {x: {value: width - 20}, y: {value: 7}, align: {value: "right"}, baseline: {value: "middle"}, text: {value: "No reported data"}, font: {value: "Arial"}, fontSize: {value: 13}, fill: {value: "#606060"}}}
      });
      chart.legends[0].orient = "none";
      chart.legends[0].legendX = 0;
      chart.legends[0].gradientLength = Math.max(160, width - 20);
      chart.legends[0].legendY = 0;
      return vegaEmbed(container, chart, { actions: true, renderer: "svg" })
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
});

loadWhenVisible("stock-status-history", function () {
  return vegaEmbed("#stock-status-history", "charts/9_stock_status_alluvial.vg.json", {
  actions: true,
  renderer: "svg"
}).then(function () {
  document.getElementById("stock-chart-status").hidden = true;
}).catch(function (error) {
  document.getElementById("stock-chart-status").textContent = "The stock assessments could not load. Please reload.";
  console.error(error);
});
});

loadWhenVisible("commonwealth-fishing-intensity", function () {
  return vegaEmbed("#commonwealth-fishing-intensity", "charts/10_tracked_fishing_hours_map.vg.json", {
  actions: true,
  renderer: "canvas"
}).then(function (result) {
  function showFishingYear() {
    var year = result.view.signal("SelectedYear");
    document.getElementById("fishing-share-year").textContent = year;
    document.getElementById("fishing-total-year").textContent = year;
    var summary = result.view.data("annual_summary").find(function (row) {
      return row.Year === year;
    });
    document.getElementById("intensity-selected-year").textContent =
      "Selected year: " + year + " · satellite-tracked fishing vessels";
    if (summary) {
      document.getElementById("fishing-hours-share").textContent =
        Math.round(summary.BusyTenthShare * 100) + "%";
      document.getElementById("fishing-hours-total").textContent =
        Math.round(summary.EstimatedHours).toLocaleString("en-AU") + " estimated fishing hours";
    }
  }
  showFishingYear();
  result.view.addSignalListener("SelectedYear", showFishingYear);

  document.getElementById("intensity-chart-status").hidden = true;
}).catch(function (error) {
  document.getElementById("intensity-chart-status").textContent = "The fishing-hours map could not load. Please reload.";
  console.error(error);
});
});

loadWhenVisible("commodity-growth", function () {
  return vegaEmbed("#commodity-growth", "charts/11_commodity_growth_waterfall.vg.json", {
    actions: true,
    renderer: "svg"
  }).then(function () {
    document.getElementById("growth-chart-status").hidden = true;
  }).catch(function (error) {
    document.getElementById("growth-chart-status").textContent = "The chart could not load. Please reload.";
    console.error(error);
  });
});

loadWhenVisible("catch-concentration", function () {
  return vegaEmbed("#catch-concentration", "charts/12_catch_concentration_pareto.vg.json", {
    actions: true,
    renderer: "svg"
  }).then(function () {
    document.getElementById("concentration-chart-status").hidden = true;
  }).catch(function (error) {
    document.getElementById("concentration-chart-status").textContent = "The chart could not load. Please reload.";
    console.error(error);
  });
});
