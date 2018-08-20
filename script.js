Promise.all([
  d3.json(
    "https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/counties.json"
  ),
  d3.json(
    "https://raw.githubusercontent.com/no-stack-dub-sack/testable-projects-fcc/master/src/data/choropleth_map/for_user_education.json"
  )
]).then(json => {
  const w = 1000;
  const h = 800;
  const padding = 100;
  const tool = d3
    .select("body")
    .append("div")
    .attr("id", "tooltip");
  const svg = d3
    .select("body")
    .append("svg")
    .attr("width", w)
    .attr("height", h);
  svg
    .append("text")
    .attr("x", w / 2)
    .attr("y", padding * 0.4)
    .attr("id", "title")
    .text("United States Educational Attainment");
  svg
    .append("text")
    .attr("x", w / 2)
    .attr("y", padding * 0.7)
    .attr("id", "description")
    .text(
      "Percentage of adults age 25 and older with a bachelor's degree or higher (2010-2014)"
    );
  const dPath = d3.geoPath();
  json[0].transform.translate[1] = 100;
  const featuresC = topojson.feature(json[0], json[0].objects.counties)
    .features;
  featuresC.sort(function(a, b) {
    if (a.id > b.id) {
      return 1;
    }
    if (a.id < b.id) {
      return -1;
    }
    return 0;
  });
  const featuresN = topojson.feature(json[0], json[0].objects.nation);
  const featuresS = topojson.feature(json[0], json[0].objects.states);
  const edu = json[1].map(val => val.bachelorsOrHigher);
  const exEdu = d3.extent(edu);
  const averige = (exEdu[1] - exEdu[0]) / 10;
  const colors = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
  const values = [];
  for (let i = 1; i < 11; i++) {
    values.push(exEdu[0] + i * averige);
  }
  const scaleCol = d3
    .scaleLinear()
    .domain(d3.extent(colors))
    .range(["yellow", "green"]);
  svg
    .selectAll(".county")
    .data(featuresC)
    .enter()
    .append("path")
    .attr("d", dPath)
    .attr("class", "county")
    .attr("data-fips", (d, i) => json[1][i].fips)
    .attr("data-education", (d, i) => json[1][i].bachelorsOrHigher)
    .style("fill", (d, i) => {
      for (let j = 0; j < values.length; j++) {
        if (json[1][i].bachelorsOrHigher <= values[j]) {
          return scaleCol(colors[j]);
        }
      }
    })
    .on("mouseover", function(d, i) {
      tool
        .attr("data-education", json[1][i].bachelorsOrHigher)
        .style("top", event.pageY - 35 + "px")
        .style("left", event.pageX + 20 + "px")
        .html(
          `<span>${json[1][i].state}</span><br><span>${
            json[1][i].area_name
          }</span><br><span>${json[1][i].bachelorsOrHigher}%</span>`
        )
        .style("display", "block");
    })
    .on("mouseout", function(d) {
      tool.style("display", "none");
    });
  svg
    .append("path")
    .datum(featuresS)
    .attr("d", dPath)
    .attr("class", "state");
  svg
    .append("path")
    .datum(featuresN)
    .attr("d", dPath)
    .attr("class", "nation");
  const legend = svg
    .append("g")
    .attr("id", "legend")
    .attr(
      "transform",
      `translate(${(w - 50 * colors.length) / 2},${h - padding})`
    );
  legend
    .selectAll("rect")
    .data(colors)
    .enter()
    .append("rect")
    .attr("x", (d, i) => i * 50)
    .attr("y", 10)
    .attr("width", 50)
    .attr("height", 30)
    .style("fill", d => scaleCol(d));
  legend
    .selectAll("text")
    .data(values)
    .enter()
    .append("text")
    .attr("x", (d, i) => i * 50 + 25)
    .attr("y", 60)
    .text(d => d);
});
