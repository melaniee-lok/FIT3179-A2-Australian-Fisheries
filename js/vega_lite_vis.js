var chart1 = "charts/chart1.vg.json";

vegaEmbed("#chart1", chart1, {
    actions: false
}).catch(console.error);