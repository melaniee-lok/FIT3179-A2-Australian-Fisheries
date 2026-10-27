# Australia's fisheries: From catch to cultivation

An Australian fisheries and aquaculture data story by Melanie Lok Huey Xin for FIT3179 Data Visualisation 2.

The story follows the shift from wild catch towards aquaculture, regional differences in production value, and the commodities driving change. Commonwealth catch records, stock assessments and satellite-tracked fishing activity provide further perspectives on wild fisheries.

Static HTML, CSS and JavaScript using Vega, Vega-Lite and Vega-Embed. There is no build step. Chart specifications, prepared data and map geometry are local; the Vega libraries load from jsDelivr and the Fraunces font loads from Google Fonts.

## Charts

Each chart has a readable JSON specification. Listed in page order:

1. [Sector production-value trend](charts/1_sector_trend.vg.json) â€” line chart, 1998â€“99 to 2024â€“25.
2. [State aquaculture growth](charts/2_state_aquaculture_dumbbell.vg.json) â€” connected dot plot comparing 1998â€“99 and 2024â€“25.
3. [Aquaculture dependence](charts/3_state_aquaculture_share_map.vg.json) â€” state choropleth with a financial-year slider.
4. [Production-value geography](charts/4_state_sector_small_multiples.vg.json) â€” three proportional-symbol maps sharing one circle-area scale.
5. [Commodity production value](charts/5_commodity_treemap.vg.json) â€” hierarchical treemap of 13 commodity groups.
6. [Commodity rankings](charts/6_commodity_rank_bump.vg.json) â€” bump chart showing the nine leading commodities in 2024â€“25 and their earlier ranks.
7. [Contributions to value growth](charts/11_commodity_growth_waterfall.vg.json) â€” waterfall of commodity changes between 1998â€“99 and 2024â€“25.
8. [Quantity and value shares](charts/7_commodity_value_volume_slope.vg.json) â€” slope chart comparing all 13 commodities, with the top five by value highlighted.
9. [Commonwealth catch patterns](charts/8_commonwealth_catch_multiview.vg.json) â€” annual heatmap linked to a selected fishery's top-six species bars, 2002â€“2023.
10. [Catch concentration](charts/12_catch_concentration_pareto.vg.json) â€” Pareto chart combining individual and cumulative catch shares in 2023.
11. [Stock-status pathways](charts/9_stock_status_alluvial.vg.json) â€” alluvial diagram following the same 107 stocks in 2004, 2014 and 2025.
12. [Tracked fishing activity](charts/10_tracked_fishing_hours_map.vg.json) â€” equal-area hex-bin map of estimated fishing hours, 2014â€“2024, with year, zoom and regional controls.

## Reading the code

- `index.html` contains the narrative, chart containers, supporting text, source acknowledgements and footer.
- `css/style.css` controls layout, typography, chart controls and tooltips.
- `js/vega_lite_vis.js` embeds the charts, loads lower charts near the viewport, handles responsive layouts and updates summaries from chart selections.
- `js/colour-palette.json` documents the colour assignments; chart specifications contain their explicit colour scales.
- `charts/` contains nine Vega-Lite specifications and three Vega specifications. The treemap uses Vega's hierarchical layout, while the alluvial diagram and fishing-hours map use Vega.
- `data/` contains the prepared CSV extracts used by the charts. `maps/` contains the map geometry.

The state-share slider updates its map and highest-share summary through Vega signals. Selecting a heatmap cell updates the species breakdown. The fishing-hours controls update the map and the year-specific summaries alongside it. Chart action menus provide image export and specification inspection.

## Data sources

- [ABARES Australian Fisheries and Aquaculture Statistics](https://www.agriculture.gov.au/abares/research-topics/fisheries/fisheries-and-aquaculture-statistics) â€” 2025 publication, Tables 1 and 2; production values and quantities through 2024â€“25. Monetary values are nominal, and 2024â€“25 figures are preliminary.
- [AFMA annual catch and effort data](https://www.afma.gov.au/resources/commonwealth-fisheries-annual-catch-and-effort-data) â€” Commonwealth landed catch records, 2002â€“2023.
- [ABARES Fishery Status Reports](https://www.agriculture.gov.au/abares/research-topics/fisheries/fishery-status) â€” 2026 historical stock-status workbook, with assessments through 2025.
- [Global Fishing Watch apparent fishing effort v3.0](https://doi.org/10.5281/zenodo.14982712) â€” March 2025 static release, used for 2014â€“2024 fishing-hour estimates; CC BY-NC 4.0. Tracking coverage varies, and unfilled areas do not establish an absence of fishing.
- [ABS ASGS 2021 state and territory boundaries](https://geo.abs.gov.au/arcgis/rest/services/ASGS2021/STE/MapServer/1) â€” generalised map outlines.
- [Marine Regions / VLIZ Australian Exclusive Economic Zone](https://www.marineregions.org/gazetteer.php?p=details&id=8323) â€” version 12 (2023), MRGID 8323, used to define the mapped fishing-activity extract.

Source attribution also appears at the bottom of the visualisation. Catch weight, production value, stock condition and tracked fishing hours measure different things and should be interpreted separately.

