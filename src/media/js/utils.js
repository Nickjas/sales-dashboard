var generalData, generatedGeneralData;
var generatedProductsData, productsData;
var generatedRegionsData, regionsData;
var generatedSalesTeamData, salesTeamData;

var generalRevenueChart, generalKeyMetricTable;
var top5productsStage, top5salesStage, top5regionsStage;
var top5productsChart, top5salesChart, top5regionsChart;
var categoryChart, categoryMapChart, categoryProductTable;
var teamMainChart, teamPersonalRevenueChart, teamPersonalShareChart, teamPersonalWinRatioChart;
var regionsChart, regionRevenueChart, regionTotalShareChart, regionMarketShareChart;

function changeTab(tab_name, index) {
    $('.menu-wrapper a').removeClass('active');
    $('.menu-wrapper a.' + tab_name).addClass('active');
    $('.tab-pane').removeClass('active');
    $('#' + tab_name).addClass('active');
    if (tab_name == 'products' && index)
        changeCategoryData(categoryChart, productsData['categories_data'], index);
    else if (tab_name == 'sales-team' && index)
        setMainTeamChartData(teamMainChart, salesTeamData, index);
    else if (tab_name == 'regions' && index)
        setRegionsChartData(regionsChart, regionsData, index);
}

function updateData(filter){
    generalData = generatedGeneralData[filter];
    productsData = generatedProductsData[filter];
    regionsData = generatedRegionsData[filter];
    salesTeamData = generatedSalesTeamData[filter];

}


function changeData(filter) {
    updateData(filter);
    setGeneralRevenueData(generalRevenueChart, generalData['revenue_chart']);
    setGeneralKeyMetricData(generalKeyMetricTable, generalData['key_metrics']);
    top5productsChart = changeDataFor5Top(top5productsStage, generalData['five_best']['products'], 'pie', 'topProducts', top5productsChart);
    top5salesChart = changeDataFor5Top(top5salesStage, generalData['five_best']['sales_men'], 'pie', 'topSales', top5salesChart);
    top5regionsChart = changeDataFor5Top(top5regionsStage, generalData['five_best']['regions'], 'pie', 'topRegions', top5regionsChart);

    changeCategoryData(categoryChart, productsData['categories_data']);
    setMainTeamChartData(teamMainChart, salesTeamData);
    setRegionsChartData(regionsChart, regionsData);
}

function drawAllCharts(filter){
    generalRevenueChart = drawGeneralRevenueChart('general-revenue-chart');
    generalKeyMetricTable = drawGeneralKeyMetricTable('general-key-metric-chart');
    top5productsStage = draw5TopChart('top-5-products');
    top5salesStage = draw5TopChart('top-5-sales');
    top5regionsStage = draw5TopChart('top-5-regions');
    categoryChart = drawCategoryChart('category-chart');
    categoryMapChart = drawCategoryMapChart('category-map-chart');
    categoryProductTable = drawCategoryProductTable('category-products-chart');
    teamMainChart = drawTeamMainChart('sales-team-chart');
    teamPersonalRevenueChart = drawTeamPersonalRevenueChart('sales-for-person');
    teamPersonalShareChart = drawTeamPersonalShareChart('total_share_for_person');
    teamPersonalWinRatioChart = drawTeamPersonalWinRatioChart('win_ratio_for_person');

    regionsChart = drawRegionsMapChart('regions-chart');
    regionRevenueChart = drawRegionRevenueChart('sales-in-region-chart');
    regionTotalShareChart = drawRegionTotalShareChart('total_share');
    regionMarketShareChart = drawRegionMarketShareChart('market_share');
    changeData(filter);
}

$(function () {
    drawAllCharts('YTD');
    changeTab('general');
    $(document).keyup(function (e) {
        if (e.keyCode == 27) showBars(false);
    });
    $('.global-shadow').click(function(){showBars(false);});
});

function getDataByX(data, x){
    for ( var i=0; i<data.length; i++){
        if (data[i][0] == x) return data[i];
        if (data[i].id == x) return data[i];
        if (data[i].name == x) return data[i]
    }
    return null
}

function getTooltipContent(params){
    var span_for_names = '<span style="color:' + darkAccentColor + '; font-size: 12px">';
    var strong_for_value = '<span style="color:' + fontColor + '; font-size: 12px"> ';
    var result = '';
    for (var i=0; i<params.length; i++){
        result = result + span_for_names + params[i].text + '</span>' + strong_for_value + params[i].value + '</span>';
        if (i < params.length - 1) result = result + '<br/>'
    }
    return result;
}


function tooltipContentForChart(series, format, data){
    setupBigTooltip(series);
    series.tooltip().title().fontColor(fontColor);
    series.tooltip().separator().margin(0,0,5,0);
    series.tooltip().lineHeight('5px');
    series.tooltip().titleFormat(function(){
        if (format == 'simple_map') {
            return this.name;
        } else {
            return this.x
        }
    });
    series.tooltip().format(function(){
        if (format == 'revenue-sold'){
            var values = getDataByX(data, this.x);
            var params = [
                {'text': 'Units sold:', value: parseInt(values[2]) },
                {'text': 'Revenue:', value: '$' + parseInt(values[1]).formatMoney(0, '.', ',')}
            ];
        }else if (format == 'with_percent'){
            var percent = (this.value * 100 / this.getStat('sum')).toFixed(1);
            params = [
                {'text': percent + '%', value: '$' + parseInt(this.value).formatMoney(0, '.', ',')}
            ];
        }else if (format == 'with_average'){
            params = [
                {'text': 'Revenue:', value: '$' + parseInt(this.value).formatMoney(0, '.', ',')}
            ];
            if (this.value <= data) {
                params.push({'text': 'Less than Average by:', value: '<span style="color: #dd2c00; font-weight: 100"> -$' + (data - this.value).formatMoney(0, '.', ',') + '</span>'});
            } else if (this.value > data) {
                params.push({'text': 'More than Average by:', value: '<span style="color: #1976d2; font-weight: 100"> +$' + (this.value - data).formatMoney(0, '.', ',') + '</span>'});
            }
        }else if (format == 'simple_map'){
            params = [
                {'text': 'Revenue:', value: '$' + parseInt(this.value).formatMoney(0, '.', ',')}
            ];
        }
        return getTooltipContent(params);
    });
}

var createRevenueChart = function () {
    var chart = anychart.column();
    var s1 = anychart.scales.linear();
    var s2 = anychart.scales.linear();
    chart.yAxis().scale(s1);
    chart.yAxis().scale().minimum(0);
    chart.yAxis(1).scale(s2);
    chart.yAxis(1).scale().minimum(0);
    var series = chart.column();
    series.yScale(s1);
    series.name('Revenue, $');
    var series2 = chart.line();
    series2.yScale(s2);
    series2.name('Units sold');
    chart.title(null);
    chart.interactivity("by-x");
    chart.yAxis().orientation('left').title(null);
    chart.yAxis(1).orientation('right').title(null);
    chart.xAxis().title(null);
    chart.yAxis().labels().fontSize(11).format(function () {
        return '$' + Math.abs(parseInt(this.value)).formatMoney(0, '.', ',');
    });
    chart.yAxis(1).labels().padding(0, 0, 0, 5).fontSize(11);
    chart.xAxis().labels().padding(5, 3, 0, 3).fontSize(11);
    chart.legend().position('bottom').enabled(true).tooltip(false).align('center').padding(10, 0, 0, 0);
    chart.padding(20, 0, 0, 0);
    return chart
};

var createSparkLine = function (data) {
    var sparkLine = anychart.sparkline(data);
    sparkLine.seriesType('area');
    var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    sparkLine.tooltip().enabled(true);
    setupBigTooltip(sparkLine);
    sparkLine.tooltip().padding('3px').title().enabled(true).fontColor(fontColor).fontWeight('normal');
    sparkLine.tooltip().fontColor(darkAccentColor);
    sparkLine.tooltip().titleFormat(function(){
        return MONTHS[this.x]
    });
    sparkLine.tooltip().format(function(){
        return this.value
    });
    sparkLine.padding(0);
    sparkLine.margin(5, 0, 5, 0);
    sparkLine.background(null);
    sparkLine.xScale('linear');
    sparkLine.xScale().minimumGap(0).maximumGap(0);
    sparkLine.xScale().ticks().interval(1);
    return sparkLine;
};

var createBulletChart = function (min, max, actual, target, invert) {
    var value = -(100 - Math.round(actual * 100 / target));
    if (invert) value = 100 - Math.round(actual * 100 / target);
    var bullet = anychart.bullet([
        {value: value, type: 'bar', gap: 0.6, fill: palette.itemAt(0), stroke: null},
        {value: 0, 'type': 'line', 'gap': 0.2, fill: palette.itemAt(4), stroke: {thickness: 1.1, color: '#212121'}}
    ]);
    bullet.background(null);
    bullet.axis(null);
    bullet.title().enabled(false);
    bullet.padding(0, -1);
    bullet.margin(0);
    bullet.rangePalette(bullet_range_palette);
    bullet.scale().minimum(min);
    bullet.scale().maximum(max);
    bullet.layout('horizontal');
    return bullet;
};

function createBulletScale(max, min, interval, value_str){
    var axis = anychart.standalones.axes.linear();
    axis.title(null);
    var scale = anychart.scales.linear();
    scale.minimum(min).maximum(max).ticks().interval(interval);
    axis.scale(scale);
    axis.orientation('bottom');
    axis.stroke(colorAxisLines);
    axis.ticks().stroke(colorMinorAxisLines).length(4);
    axis.labels().useHtml(true).padding(0,3,0,10).fontColor(colorAxisFont).fontSize(10)
        .format(function () {
            if (value_str == 'x') return this.value/100 + value_str;
            else return this.value + value_str;
    });
    axis.minorTicks(null);
    return axis
}

function createSolidChart(){
    var gauge = anychart.gauges.circular();
    gauge.background(null);
    gauge.fill(null);
    gauge.stroke(null);
    var axis = gauge.axis().radius(100).width(1).fill(null);
    axis.scale()
        .minimum(0)
        .maximum(100)
        .ticks({interval: 1})
        .minorTicks({interval: 1});
    axis.labels().enabled(false);
    axis.ticks().enabled(false);
    axis.minorTicks().enabled(false);

    var stroke = '1 #e5e4e4';
    gauge.bar(0).dataIndex(0).radius(90).width(50).fill(palette.itemAt(0)).stroke(null).zIndex(5);
    gauge.bar(1).dataIndex(1).radius(90).width(50).fill('#F5F4F4').stroke(stroke).zIndex(4);
    gauge.label()
        .text('')
        .hAlign('center')
        .anchor('center')
        .padding(0)
        .zIndex(1);
    return gauge
}

function createTable(){
    var table = anychart.standalones.table();
    table.cellBorder(null);
    table.fontFamily("'Verdana', Helvetica, Arial, sans-serif")
        .fontSize(11)
        .useHtml(true)
        .fontColor(darkAccentColor)
        // .textWrap("noWrap")
        .textOverflow("..")
        .vAlign('middle');
    table.getRow(0).cellBorder().bottom('1px #dedede');
    table.getRow(0).vAlign('bottom');
    table.getRow(0).height(25);
    return table
}

function createMapOfFrance(colorRangeOrientation, colorRangeAlign, colorRangesSegments, colorRangesSegmentsColors){
    var map = anychart.map();
    map.geoData(anychart.maps["france"]);
    map.background(null);
    map.legend(null);
    map.title(null);

    var cr = map.colorRange().enabled(true);
    cr.removeAllListeners('click');
    cr.orientation(colorRangeOrientation);
    cr.colorLineSize(10);
    cr.marker().size(5);
    cr.align(colorRangeAlign);
    cr.stroke(null);
    cr.ticks().enabled(true).stroke('2 #fff');
    cr.ticks().position('center').length(10);
    cr.labels().fontSize(11).padding(0,0,0,5).format(function(){
        var range = this.colorRange;
        var name;
        if (isFinite(range.start + range.end)) {
          name = range.start.formatMoney(0, '.', ',')  + ' - ' + range.end.formatMoney(0, '.', ',');
        } else if (isFinite(range.start)) {
          name = '> ' + range.start.formatMoney(0, '.', ',');
        } else {
          name = '< ' + range.end.formatMoney(0, '.', ',');
        }
        return name
    });

    var s1 = map.choropleth();
    s1.geoIdField('id');
    s1.labels(null);
    tooltipContentForChart(s1, 'simple_map');
    var ocs = anychart.scales.ordinalColor(colorRangesSegments);
    ocs.colors(colorRangesSegmentsColors);
    s1.colorScale(ocs);
    s1.hovered().fill('#CCCFD2');
    s1.selected().fill(darkAccentColor);
    map.padding(15, 0, 5, 0).margin(0);
    return map
}

function getAverage(data, index){
    var sum = 0;
    for (var i=0; i<data.length; i++){
        sum += data[i][index];
    }
    return Math.round(sum/data.length)
}

Number.prototype.formatMoney = function (c, d, t) {
    var n = this,
        c = isNaN(c = Math.abs(c)) ? 2 : c,
        d = d == undefined ? "." : d,
        t = t == undefined ? "," : t,
        s = n < 0 ? "-" : "",
        i = parseInt(n = Math.abs(+n || 0).toFixed(c)) + "",
        j = (j = i.length) > 3 ? j % 3 : 0;
    return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
};


function showBars(flag) {
    if (flag) {
        $('.menu-dashboard-panel').addClass('shown').css('z-index', 20).animate({left: 0}, 300);
        $('.global-shadow').show();
    } else if ($('.menu-dashboard-panel').hasClass('shown')) {
        $('.menu-dashboard-panel').animate({left: -250}, 300, function () {
            $('.menu-dashboard-panel').removeClass('shown').css('z-index', 10);
        });
        $('.global-shadow').fadeOut();
    }
}
