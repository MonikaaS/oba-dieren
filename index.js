d3.json("./data.json")
    .then(function dataStore(data) {

            //Get all the data and make objects with it
            let dataStore = data.map(books => {

                var animalsInSummary = animalsArray.filter(val => books.summary.includes(" " + val + " "));

                return {
                    year: books.publication.year,
                    gender: (books.author.gender === null) ? "geslacht onbekend" : books.author.gender,
                    pages: books.characteristics.pages,
                    animals: (animalsInSummary.length == 0) ? undefined : animalsInSummary[0], //get only the first animal, because if a summary has multiple animals, it will return an array within an array (don't know how to fix it)
                    titel: books.title
                }
            })

            // filter out all the undefined animals
            let filteredData = dataStore.filter(data => data.animals)

            //get the animals for each year
            var animalsPerYear = d3.nest() // 
                .key(d => d.year)
                .sortKeys(d3.ascending)
                .key(d => d.animals)
                .entries(filteredData) //entries gets the data what you gonna nest

            //get all the unique animals
            var uniqueAnimals = d3.nest()
                .key(d => d.animals)
                .sortKeys(d3.ascending)
                .entries(filteredData)

            //get the genders of the writers
            var genderWriters = d3.nest()
                .key(d => d.gender)
                .sortKeys(d3.ascending)
                .key(d => d.animals)
                .entries(filteredData)

            // Set up the chart, used the example from Mike Bostock: https://beta.observablehq.com/@mbostock/d3-bar-chart & a tutorial from freeCodeCamp to understand it better: https://medium.freecodecamp.org/how-to-create-your-first-bar-chart-with-d3-js-a0e8ea2df386
            function animalsChart(dataSet) {
                d3.selectAll("g").remove();
                d3.selectAll("rect").remove();
                d3.selectAll("text").remove();

                var width = 1300;
                var height = 600;

                var margin = ({
                    top: 50,
                    right: 20,
                    bottom: 100,
                    left: 70
                })

                var svg = d3.select('svg')
                    .attr("width", width)
                    .attr("height", height)
                    .attr("class", "bar-chart");

                var x = d3.scaleBand()
                    .domain(dataSet.map(d => d.key))
                    .range([margin.left, width - margin.right])
                    .padding(0.1)

                var y = d3.scaleLinear()
                    .domain([0, d3.max(dataSet, d => d.values.length)])
                    .range([height - margin.bottom, margin.top])

                var xAxis = g => g
                    .attr("transform", `translate(0,${height - margin.bottom})`)
                    .call(d3.axisBottom(x)
                        .tickSizeOuter(0))

                var yAxis = g => g
                    .attr("transform", `translate(${margin.left},0)`)
                    .call(d3.axisLeft(y).ticks(null, "s"))
                    .call(g => g.selectAll(".domain").remove())

                //Text for explaining the interaction in the graph
                svg.append("text")
                    .style("font-size", "7pt")
                    .style("postition", "absolute")
                    .style("font-family", "helvetica")
                    .style("fill", "#01AAFE")
                    .attr("x", 110)
                    .attr("transform", `translate(0,${margin.top})`)
                    .text((dataSet == animalsPerYear) ? "Klik op de bars om de diersoorten te zien van een specifiek jaar" : (dataSet == genderWriters) ? "Klik op de bars om te zien wie over welk dier schrijft" : "");

                // Axis labels made with D3noob's example: https://bl.ocks.org/d3noob/23e42c8f67210ac6c678db2cd07a747e
                // text label for the x axis
                svg.append("text")
                    .attr("transform",
                        "translate(" + (width / 2) + " ," +
                        (height + margin.top + -60) + ")")
                    .style("text-anchor", "middle")
                    .style("font-size", "6pt")
                    .style("font-family", "helvetica")
                    .text((dataSet == animalsPerYear) ? "Jaren" : (dataSet == uniqueAnimals) ? "Diersoorten" : "Geslacht schrijvers");

                // text label for the y axis
                svg.append("text")
                    .attr("transform", "rotate(-90)")
                    .attr("y", 80 - margin.left)
                    .attr("x", 0 - (height / 2))
                    .attr("dy", "1em")
                    .style("text-anchor", "middle")
                    .style("font-size", "6pt")
                    .style("font-family", "helvetica")
                    .text((dataSet == animalsPerYear) ? "Aantal dieren" : (dataSet == uniqueAnimals) ? "Aantal dieren" : "Aantal dieren per geslacht");

                var bars = svg.selectAll("rect")

                bars
                    .data(dataSet)
                    .enter()
                    .append("rect")
                    .attr("fill", "#01AAFE")
                    .attr("rx", 1.2)
                    .attr("x", d => x(d.key))
                    .attr("y", d => y(d.values.length))
                    .attr("height", d => y(0) - y(d.values.length))
                    .attr("width", x.bandwidth())
                    .on("click", function (d, i) { // select a bar to see the animals in a specific year
                            // adding interaction with Chi-loong's example: https://bl.ocks.org/Chi-Loong/e3389dfb6873c85caf445f0faba52ec4
                            if (dataSet == animalsPerYear || dataSet == genderWriters) {
                                //clean up the chart before the update
                                d3.selectAll("g").remove();
                                d3.selectAll("rect").remove();
                                d3.selectAll("text").remove();

                                //Text to show the selected option
                                svg.append("text")
                                    .style("font-size", "15pt")
                                    .style("font-family", "helvetica")
                                    .style("fill", "#01AAFE")
                                    .attr("x", 50)
                                    .attr("transform", `translate(0,30)`)
                                    .text((dataSet == animalsPerYear) ? "Dier(en) in: " + d.key : "Dierenboeken geschreven door: " + d.key);

                                //xAxis label
                                svg.append("text")
                                    .attr("transform", "/2") + " ," +
                                        (height + margin.top + "translate(" + (width + -50) + ")")
                                        .style("text-anchor", "middle")
                                        .style("font-size", "6pt")
                                        .style("font-family", "helvetica")
                                        .text("Diersoorten");

                                        //yAxis label
                                        svg.append("text")
                                        .attr("transform", "rotate(-90)")
                                        .attr("y", 80 - margin.left)
                                        .attr("x", 0 - (height / 2))
                                        .attr("dy", "1em")
                                        .style("text-anchor", "middle")
                                        .style("font-size", "6pt")
                                        .style("font-family", "helvetica")
                                        .text("Aantal dieren");

                                        x.domain(d.values.map(d => d.key)); y.domain([0, d3.max(d.values.map(d => d.values.length))]);

                                        bars = bars.data(d.values)
                                        // enter
                                        bars
                                        .enter()
                                        .append("rect")
                                        .attr("fill", "#01AAFE")
                                        .attr("rx", 1.2)
                                        .attr("x", d => x(d.key)) //Thanks to Folkert-Jan van der Pol! (It didn't work because I mapped over the values first and then selected the key)
                                        .attr("y", d => y(d.values.length))
                                        .transition().duration(400)
                                        .attr("height", d => y(0) - y(d.values.length))
                                        .attr("width", x.bandwidth())

                                        // update
                                        bars
                                        .attr("rx", 1.2)
                                        .attr("x", d => x(d.values.map(d => (d.key))))
                                        .attr("y", d => y(d.values.length))
                                        .attr("height", d => y(0) - y(d.values.length))
                                        .attr("width", x.bandwidth())

                                        // exit
                                        bars.exit().remove()

                                        svg.append("g")
                                        .call(xAxis)
                                        .selectAll("text")
                                        .style('text-anchor', 'end')
                                        .attr('dx', '-1em')
                                        .attr('dy', '-0.6em')
                                        .attr('transform', 'rotate(-90)');

                                        svg.append("g")
                                        .call(yAxis)
                                    }
                            })
                        .on("mouseover", function (d) {
                            d3.select(this)
                                .attr("fill", "Aquamarine")
                                .transition().duration(400)
                        })
                        .on("mouseout", function (d, i) {
                            d3.select(this)
                                .transition()
                                .attr("fill", "#01AAFE")
                        });

                        //Rotated ticks with Wooorm's example: https://github.com/cmda-tt/course-17-18/blob/master/site/class-4/axis/index.js
                        svg.append("g")
                        .call(xAxis)
                        .selectAll("text")
                        .style('text-anchor', 'end')
                        .attr('dx', '-1em')
                        .attr('dy', '-0.6em')
                        .attr('transform', 'rotate(-90)');

                        svg.append("g")
                        .call(yAxis)

                    }

                //render the chart
                animalsChart(animalsPerYear);

                //Render the specific data with an onclick button, used this from Chi-loong's example: https://bl.ocks.org/Chi-Loong/e3389dfb6873c85caf445f0faba52ec4
                d3.select("#bt1").on("click", function () {
                    animalsChart(animalsPerYear);
                });

                d3.select("#bt2").on("click", function () {
                    animalsChart(uniqueAnimals);
                });

                d3.select("#bt3").on("click", function () {
                    animalsChart(genderWriters);
                });
            })
        .catch(err => {
            if (err.response) {
                console.log(err.response.status, err.response.statusText)
            } else {
                console.log(err)
            }
        });