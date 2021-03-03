
var selectedX = null;
var globalData;
var productsTableHeight, productsTableRect;
var activeRow = null;
var hoverRow = null;

var drawCategoryChart = function(container_id){
    var $chartContainer = $('#' + container_id);
    $chartContainer.css('height', parseInt($chartContainer.attr('data-height'))).html('');
    var chart = anychart.bar();
    chart.container(container_id);

    chart.title(null);
    chart.interactivity("by-x");
    chart.padding(15, 0, 5, 0);
    chart.legend().enabled(false);
    chart.xAxis().labels().fontSize(11);
    chart.yAxis().enabled(false);
    chart.interactivity().selectionMode("none");
    var series = chart.bar();
    series.clip(false);
    series.listen('pointClick', function (e) {
        drillDown(e.iterator.get('x'));
    });
    chart.lineMarker(0)
        .stroke({color: colorAxisFont, opacity: 1, thickness: '2 #cecece'})
        .layout('vertical')
        .scale(chart.yScale());

    chart.textMarker(0)
        .textSettings({fontSize: 10})
        .scale(chart.yScale())
        .fontColor(colorAxisFont)
        .align('bottom')
        .anchor('left-bottom')
        .offsetX(5)
        .offsetY(0)
        .text('Average');

    chart.draw();
    return chart;
};

var revenueDataSet = anychart.data.set();
var revenueDataSet_map1 = revenueDataSet.mapAs({'value': 1, 'x': 0});
var changeCategoryData = function(chart, data, index){
    globalData = data;
    revenueDataSet.data(data);

    var average = getAverage(data, 'value');

    chart.getSeries(0).data(revenueDataSet_map1);
    chart.lineMarker(0).value(average);
    chart.textMarker(0).value(average);
    tooltipContentForChart(chart.getSeries(0), 'with_average', average);
    if (!index) drillDown(data[0].x);
    else drillDown(data[index].x)
};

function getGlobalDataByX(x){
    for (var i=0; i<globalData.length; i++) {
        if (globalData[i].x == x) {
          var selectedData = globalData[i];
          break;
        }
    }
    return selectedData
}

function drillDown(x){
    if (selectedX) {
        var selectedData = getGlobalDataByX(selectedX);
        if (selectedData) selectedData['marker'] = {enabled: false};
    }
    selectedX = x;
    selectedData = getGlobalDataByX(selectedX);
    selectedData['marker'] = {enabled: true, type: 'star5', fill: palette.itemAt(3), size: 10, hovered: {size: 10}};
    $('.category-name').html(selectedX);

    revenueDataSet.data(globalData);
    $('.product-name').html('');

    setCategoryMapData(categoryMapChart, selectedData['map_data']);
    setCategoryProductData(categoryProductTable, selectedData['data']);
}

var drawCategoryProductTable = function(container_id){
    var $chartTableContainer = $('#' + container_id);
    productsTableHeight = parseInt($chartTableContainer.attr('data-height'));
    $chartTableContainer.css('height', productsTableHeight).html('');
    var stage = anychart.graphics.create(container_id);

    productsTableRect = anychart.graphics.rect(0, 35,
        parseInt($chartTableContainer.width()),
        mainTableHeight - 50).parent(stage);
    productsTableRect.fill('#fff .0000000001').stroke(null).zIndex(200);

    var table = createTable();
    table.contents([['Product', 'Revenue trend', 'Revenue', 'Variance from<br/>average price', 'Price']]);

    anychart.graphics.events.listen(stage, "stageresize", function(e){
        var bounds = stage.getBounds();
        bounds.top += 35;
        bounds.height -= 55;
        productsTableRect.setBounds(bounds);
    });
    table.getCol(2).hAlign('right');
    table.getCol(3).hAlign('center');
    table.getCol(4).hAlign('right');
    table.getCol(2).width(80);
    table.getCol(4).width(60);
    table.container(stage).draw();
    return table;
};

var drawCategoryMapChart = function(container_id){
    var $chartContainer = $('#' + container_id);
    $chartContainer.css('height', parseInt($chartContainer.attr('data-height'))).html('');
    var map = createMapOfFrance(
        'right',
        'center',
        [{less: 350000},
        {from: 350000, to: 400000},
        {from: 400000, to: 450000},
        {from: 450000, to: 500000},
        {from: 500000, to: 550000},
        {greater: 550000}],
        ['#ffd54f', '#FDC543', '#F9B033', '#F7A028', '#F28110', '#ef6c00']
    );
    map.interactivity().selectionMode('none');
    map.container(container_id);
    map.draw();
    return map
};

var setCategoryMapData = function(map, data){
    map.getSeries(0).data(data);
};

var setCategoryProductData = function(table, data){
    table.getRow(table.rowsCount() - 1).height(null);
    var content = [
        ['Product', 'Revenue trend', 'Revenue', 'Variance from<br/>average price', 'Price']
    ];
    for (var i=0; i<data.length; i++){
        content.push(
            [
                data[i].x,
                createSparkLine(data[i].last),
                '$' + parseInt(data[i].revenue).formatMoney(0, '.', ','),
                createBulletChart(-300, 300, data[i].price, data[i].average_price, false),
                '$' + parseInt(data[i].price).formatMoney(0, '.', ',')]
        )
    }
    content.push(
        [null, null, null, createBulletScale(300, -300, 100, 'x'), null]
    );
    table.contents(content);
    if (activeRow) {
        table.getRow(activeRow).cellFill(null);
        activeRow = null;
    }

    anychart.graphics.events.listen(productsTableRect, "click", function(e){
        var h = (productsTableHeight - 50) / data.length;
        var row = Math.round(e.offsetY/h)-1;
        if (!row)
            return;
        if (activeRow){
            table.getRow(activeRow).cellFill(null);
        }
        activeRow = row;
        table.getRow(activeRow).cellFill("#F7A028 0.3");
        setCategoryMapData(categoryMapChart, data[activeRow-1].map_data);
        $('.product-name').html(data[activeRow-1].x);
    });

    anychart.graphics.events.listen(productsTableRect, "mousemove", function(e){
        var h = (productsTableHeight - 50) / data.length;
        var row = Math.round(e.offsetY/h)-1;
        if (hoverRow && hoverRow != activeRow && table.getRow(hoverRow)){
            table.getRow(hoverRow).cellFill(null);
        }
        hoverRow = row;
        if (hoverRow != activeRow && hoverRow != 0 && table.getRow(hoverRow)) table.getRow(hoverRow).cellFill("#F7A028 0.1");
    });

    anychart.graphics.events.listen(productsTableRect, "mouseout", function(e){
        if (hoverRow && hoverRow != activeRow && table.getRow(hoverRow)){
            table.getRow(hoverRow).cellFill(null);
        }
    });

    table.getCol(0).hAlign('left');
    table.getRow(data.length + 1).vAlign('top');
    table.getRow(data.length + 1).height(15);
};