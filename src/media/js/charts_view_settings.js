var colorAxisLines = '#CECECE';
var colorMinorAxisLines = '#EAEAEA';
var colorAxisFont = '#7c868e';
var darkAccentColor = '#545f69';
var fontColor = '#212121';
var tooltipContourColor = '#c1c1c1';

var palette = anychart.palettes.distinctColors().items([
    '#64b5f6', '#1976d2', '#ef6c00', '#ffd54f',
    '#455a64', '#96a6a6', '#dd2c00', '#00838f',
    '#00bfa5', '#ffa000'
]);

var bullet_range_palette = anychart.palettes.distinctColors().items(['#8C8B8B', '#a8a8a8', '#bababa', '#d8d8d8', '#e5e4e4', '#F5F4F4']);

var bigTooltipSettings = {
    background: {fill: 'white', stroke: tooltipContourColor, corners: 3, cornerType: 'ROUND'},
    padding: [8, 13, 5, 13],
    anchor: 'LEFT_TOP',
    offsetX: 10,
    offsetY: 15
};

var bigTooltipTitleSettings = {
    fontWeight: 'normal',
    fontSize: '12px',
    hAlign: 'left',
    fontColor: fontColor
};

var setupBigTooltip = function (series) {
    series.tooltip(true);
    series.tooltip();
    series.tooltip(bigTooltipSettings);
    series.tooltip().useHtml(true).textSettings(bigTooltipTitleSettings);

};
