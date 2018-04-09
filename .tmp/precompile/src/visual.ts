"use strict";


/**
 * Interface for BarChart data points.
 *
 * @interface
 * @property {number} value    - Data value for point.
 * @property {string} category - Coresponding category of data value.
 */
interface BarChartDataPoint {
    value: number;
    category: string;
    color: string;
}

/**
 * Interface for BarCharts viewmodel.
 *
 * @interface
 * @property {BarChartDataPoint[]} dataPoints - Set of data points the visual will render.
 * @property {number} dataMax                 - Maximum data value in the set of data points.
 */
interface BarChartViewModel {
    dataPoints: BarChartDataPoint[];
    dataMax: number;
}




module powerbi.extensibility.visual.jQueryPOCBEE1DEBC061B4D99B73AF02818555FAA  {

    function visualTransform(options: VisualUpdateOptions, host: IVisualHost): BarChartViewModel {
        let dataViews = options.dataViews;
        let viewModel: BarChartViewModel = {
            dataPoints: [],
            dataMax: 0
        };

        if(!dataViews
            || !dataViews[0]
            || !dataViews[0].categorical
            || !dataViews[0].categorical.categories
            || !dataViews[0].categorical.categories[0].source
            || !dataViews[0].categorical.values)
            return viewModel;

        let categorical = dataViews[0].categorical;
        let category = categorical.categories[0];
        let dataValue = categorical.values[0];

        let barChartDataPoints: BarChartDataPoint[] = [];
        let dataMax: number;
        let colorPalette: IColorPalette = host.colorPalette;

        for (let i = 0, len = Math.max(category.values.length, dataValue.values.length); i < len; i++) {
            barChartDataPoints.push({
                category: <string>category.values[i],
                value: <number>dataValue.values[i],
                color: colorPalette.getColor(<string>category.values[i]).value
            });
        }
        dataMax = <number>dataValue.maxLocal;
        return {
            dataPoints: barChartDataPoints,
            dataMax: dataMax
        }
    }


    export class Visual implements IVisual {

        private settings: VisualSettings;
        private textNode: Text;

        private svg: d3.Selection<SVGAElement>;
        private host: IVisualHost;
        private  barChartContainer: d3.Selection<SVGAElement>;
        private barContainer: d3.Selection<SVGAElement>;
        private bars: d3.Selection<SVGAElement>;

        static Config ={
            xScalePadding: 0.1
        };


        constructor(options: VisualConstructorOptions) {
            // this.updateCountContainer = $('<div>');
            // this.categoryList = $('<ul>');
            // let categoryListContainer = $('<div>').append('<h3>Categories</h3>').append(this.categoryList);
            // $(options.element)
            // //Display jquery version in visual
            //     .append(`<p>JQuery Version: <em>${$.fn.jquery}</em></p>`)
            //     //Display lodash version in visual
            //     //Add container for update count
            //     .append(this.updateCountContainer)
            //     //add container for category list
            //     .append(categoryListContainer);
            //


            // this.target = options.element;
            // this.updateCount = 0;
            // if (typeof document !== "undefined") {
            //     const new_p: HTMLElement = document.createElement("p");
            //     new_p.appendChild(document.createTextNode("Update count:"));
            //     const new_em: HTMLElement = document.createElement("em");
            //     this.textNode = document.createTextNode(this.updateCount.toString());
            //     new_em.appendChild(this.textNode);
            //     new_p.appendChild(new_em);
            //     this.target.appendChild(new_p);
            // }

            this.host = options.host;
            let svg = this.svg = d3.select(options.element)
                .append('svg')
                .classed('barChart', true);
            this.barContainer = svg.append('g')
                .classed('barContainer', true);
        }

        public update(options: VisualUpdateOptions) {
            // this.settings = Visual.parseSettings(options && options.dataViews && options.dataViews[0]);
            // console.log('Visual update', options);
            // console.log("Settings", this.settings);
            // if (typeof this.textNode !== "undefined") {
            //     this.textNode.textContent = (this.updateCount++).toString();
            // }

            let viewModel: BarChartViewModel = visualTransform(options, this.host);

            let width = options.viewport.width;
            let height = options.viewport.height;

            this.svg.attr({
                width: width,
                height:height
            });

            let yScale = d3.scale.linear()
                .domain([0, viewModel.dataMax])
                .range([height, 0]);

            let xScale = d3.scale.ordinal()
                .domain(viewModel.dataPoints.map(d=> d.category))
                .rangeRoundBands([0,width], Visual.Config.xScalePadding);

            let bars = this.barContainer.selectAll('.bar').data(viewModel.dataPoints);
            bars.enter()
                .append('rect')
                .classed('bar', true);
            bars.attr({
                width: xScale.rangeBand(),
                height: d => height - yScale(d.value),
                y: d=> yScale(d.value),
                x: d=> xScale(d.category),
                fill: d => d.color
            });

            bars.exit().remove();

        }

        public destroy(): void {

        }

        private static parseSettings(dataView: DataView): VisualSettings {
            return VisualSettings.parse(dataView) as VisualSettings;
        }

        /**
         * This function gets called for each of the objects defined in the capabilities files and allows you to select which of the
         * objects and properties you want to expose to the users in the property pane.
         *
         */
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
            return VisualSettings.enumerateObjectInstances(this.settings || VisualSettings.getDefault(), options);
        }
    }
}