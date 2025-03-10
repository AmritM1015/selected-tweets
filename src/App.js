import React, { Component } from "react";
import "./App.css";
import FileUpload from "./FileUpload";
import * as d3 from 'd3';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: [],
      selected_data: [],
      sentimentColors: { positive: "green", negative: "red", neutral: "gray" }
    };
  }

  componentDidMount() {
    this.renderChart();
    this.renderText();
  }

  componentDidUpdate() {
    this.renderChart();
    this.renderText();
  }

  set_data = (csv_data) => {
    this.setState({ data: csv_data }, () => {
      this.renderChart();
    });
  }

  renderChart = () => {
    var margin = { left: 50, right: 150, top: 10, bottom: 10 }, width = 600, height = 400;
    var innerWidth = width - margin.left - margin.right;
    var innerHeight = height - margin.top - margin.bottom;
    var chart_data = this.state.data;

    const svg = d3.select(".child1 svg")
      .attr("width", width)
      .attr("height", height);

    svg.selectAll("*").remove();

    var xScale = d3.scaleLinear()
      .domain(d3.extent(chart_data, d => d["Dimension 1"]))
      .range([0, innerWidth]);
    var yScale = d3.scaleLinear()
      .domain(d3.extent(chart_data, d => d["Dimension 2"]))
      .range([innerHeight, 0]);

    svg.selectAll("circle").data(chart_data).join("circle")
      .attr("cx", d => xScale(d["Dimension 1"]) + margin.left)
      .attr("cy", d => yScale(d["Dimension 2"]) + margin.top)
      .attr("r", 5)
      .attr("fill", d => this.state.sentimentColors[d.PredictedSentiment]);

    if (chart_data.length > 0) {
      const legend = svg.selectAll(".legend")
        .data(Object.keys(this.state.sentimentColors))
        .join("g")
        .attr("class", "legend")
        .attr("transform", (d, i) => `translate(450,${i * 20})`);

      legend.append("circle")
        .attr("r", 5)
        .attr("cy", 10)
        .attr("fill", d => this.state.sentimentColors[d]);

      legend.append("text")
        .attr("x", 10)
        .attr("y", 15)
        .style("font-size", "12px")
        .attr("fill", "black")
        .text(d => d);
    }

    var brush = d3.brush().on('start brush', (e) => {
      if (e.selection) {
        var selection = chart_data.filter(d => {
          const x = xScale(d["Dimension 1"]) + margin.left;
          const y = yScale(d["Dimension 2"]) + margin.top;
          return x >= e.selection[0][0] && x <= e.selection[1][0] &&
            y >= e.selection[0][1] && y <= e.selection[1][1];
        });
        this.setState({ selected_data: selection });
      } else {
        this.setState({ selected_data: [] });
      }
    });

    d3.select(".child1 svg").call(brush);
  }

  renderText = () => {
    var selected_data = this.state.selected_data;
    var selected_svg = d3.select(".child2 svg")
      .attr("width", 1000)
      .attr("height", 400);

    selected_svg.selectAll("*").remove();
    selected_svg.selectAll("text").data(selected_data).join("text")
      .attr("x", 50)
      .attr("y", (d, i) => 20 + i * 20)
      .attr("dy", ".35em")
      .text(d => d.Tweets) // Display the tweet text
      .attr("fill", d => this.state.sentimentColors[d.PredictedSentiment])
      .attr("font-family", "Times New Roman")
      .attr("font-size", "20px")
      .attr("text-anchor", "start");
  }

  render() {
    return (
      <div>
        <FileUpload set_data={this.set_data}></FileUpload>
        <div className="parent">
          <div className="child1 item">
            <h2 style={{fontFamily: "Times New Roman"}}>Projected Tweets</h2>
            <svg></svg>
          </div>
          <div className="child2 item">
            <h2 style={{fontFamily: "Times New Roman"}}>Selected Tweets</h2>
            <svg></svg>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
