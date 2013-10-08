/*
 * A simple collection of renderers by name.  Note that "this" is NOT this singleton
 * 
 */
 
 Ext.define('TSRenderers', {
    extend: 'Ext.Component',
    config: {
        red: '#ff9999',
        yellow: '#ffffcc',
        green: '#ccffcc',
        benchmark_green: 90,
        benchmark_field: 'health_ratio_estimated',
        ranges: {
            health_ratio_estimated: { red: 0, yellow: 60, green: 90, direction: 'ryg' },
            health_ratio_in_progress: { green: 0, yellow: 25, red: 35, direction: 'gyr' }
        }
    },
    
    defaultF: function(value,metaData,record,rowIndex,colIndex,store,view){
        return value;
    },
    constructor: function(config) {
        this.mergeConfig(config);
        this.addEvents(
            /**
             * @event
             * Fires after the range marker has changed
             * @param {TSRenderers} this
             * @param {Object} new_value
             */
            'rangechanged'
        );
        this.callParent([this.config]);
    },
    getValueForColumn:function(column_data_index,value,metaData,record,row_index,col_index,store,view){
        var return_value = value;
        if ( typeof this[column_data_index] === "function" ) {
            return this[column_data_index](value,metaData,record,row_index,col_index,store,view);
        } else {
            return  column_data_index + " has no renderer";
        }
    },
    setRanges: function(column_data_index,ranges) {
        this.ranges[column_data_index] = ranges;
        console.log('comparing',column_data_index, this.benchmark_field);
        if ( column_data_index == this.benchmark_field ) {
            this.benchmark_green = ranges.green;
        }
        this.fireEvent('rangechanged',this,ranges);
    },
    shouldBeGrey: function(record){
        var check_percent = record.get(this.benchmark_field) * 100;
        return ( check_percent < this.benchmark_green && record.get('metric') != 'count');
    },
    health_ratio_estimated: function(value,metaData,record){
        if (record.get('metric')=='count'){
            return "N/A";
        }
        if ( value < 0 ) {
            return " ";
        }
        var percent = parseInt( 100 * value, 10 );
        var ranges = this.ranges.health_ratio_estimated;
        
        var color = this.red;
        if ( percent > ranges.yellow ) {
            color = this.yellow;
        }
        if ( percent > ranges.green ) {
            color = this.green;
        }
        
        metaData.style = 'background-color:'+color;
        return percent + "%";
    },
    health_ratio_in_progress: function(value,metaData,record) {
        var color = this.green;
        var percent = parseInt( 100 * value, 10 );
        var ranges = this.ranges.health_ratio_in_progress;
        
        if ( this.shouldBeGrey(record) ) {
            color = '#D0D0D0';
        } else {
            if ( value < 0 ) {
                return " ";
            }
            if ( percent > ranges.yellow ) {
                color = this.yellow;
            }
            if ( percent > ranges.red ) {
                color = this.red;
            }
        }
        metaData.style = "background-color: " + color;
        return percent + "%";
    },
    halfAcceptedHealth: function(value,metaData,record) {
        if ( value < 0 ) {
            return " ";
        }
        var percent = parseInt( 100 * value, 10 );
        var accomplished_date = record.get('health_half_accepted_date');
        var text = TSRenderers.shortDate(accomplished_date) + " (" + percent + "%)";
        
        
        var color = TSRenderers.green;
        if ( record.get('health_ratio_estimated') < TSRenderers.health_green_limit  && record.get('metric') != 'count') {
            color = '#D0D0D0';
        } else {
            if ( percent > 50 ) {
                color = TSRenderers.yellow;
            }
            if ( percent > 75 ) {
                color = TSRenderers.red;
            }

        }
        if ( percent === 200 ) {
            text = "Never";
        }
        metaData.style = "background-color: " + color;
        return "<div style='text-align:center;background-color:" + color + "'>"+ text + "</div>";
    },
    incompletionHealth: function(value,metaData,record) {
        if ( value < 0 ) {
            return " ";
        }
        var percent = parseInt( 100 * value, 10 );
        var text = percent + "%";
        
        var color = TSRenderers.green;
        if ( record.get('health_ratio_estimated') < TSRenderers.health_green_limit  && record.get('metric') != 'count') {
            color = '#D0D0D0';
        } else {
            if ( percent > 9 ) {
                color = TSRenderers.yellow;
            }
            if ( percent > 20 ) {
                color = TSRenderers.red;
            }
            if ( percent === 200 ) {
                color = "white";
                text = "No Data";
            }
        }
        metaData.style = "background-color: " + color;
        return "<div style='text-align:center;background-color:" + color + "'>"+ text + "</div>";
    },
    completionHealth: function(value,metaData,record) {
        if ( value < 0 ) {
            return " ";
        }
        var percent = parseInt( 100 * value, 10 );
        var text = percent + "%";
        
        var color = TSRenderers.green;
        if ( record.get('health_ratio_estimated') < TSRenderers.health_green_limit  && record.get('metric') != 'count') {
            color = '#D0D0D0';
        } else {
            if ( percent < 100 ) {
                color = TSRenderers.yellow;
            }
            if ( percent < 95 ) {
                color = TSRenderers.red;
            }
            if ( percent === 200 ) {
                color = "white";
                text = "No Data";
            }
        }
        metaData.style = "background-color: " + color;
        return "<div style='text-align:center;background-color:" + color + "'>"+ text + "</div>";
    },
    acceptanceHealth: function(value,metaData,record) {
        if ( value < 0 ) {
            return " ";
        }
        var percent = parseInt( 100 * value, 10 );
        var text = percent + "%";
        
        var color = TSRenderers.green;
        if ( record.get('health_ratio_estimated') < TSRenderers.health_green_limit  && record.get('metric') != 'count') {
            color = '#D0D0D0';
        } else {
            
            if ( percent < 91 ) {
                color = TSRenderers.yellow;
            }
            if ( percent < 50 ) {
                color = TSRenderers.red;
            }
            if ( percent === 200 ) {
                color = "white";
                text = "No Data";
            }
        }
        metaData.style = "background-color: " + color;
        return "<div style='text-align:center;background-color:" + color + "'>"+ text + "</div>";
    },
    churnHealth: function(value,metaData,record) {
        
        var text = "No data";
        var color = "white";
        
        if ( value >= 0 ) {
            var percent = parseInt( 100 * value, 10 );
            text = percent + "%";
        }
        
        if ( record.get('health_ratio_estimated') < TSRenderers.health_green_limit  && record.get('metric') != 'count') {
            color = '#D0D0D0';
        }
        metaData.style = "background-color: " + color;
        return "<div style='text-align:center;background-color:" + color + ";'>" + text + "</div>";
    },
    churnTaskHealth: function(value,metaData,record) {
        var text = "No data";
        var color = "white";
        if ( value >= 0 ) {
            var percent = parseInt( 100 * value, 10 );
            text = percent + "%";
        }
            
        if ( record.get('health_ratio_estimated') < TSRenderers.health_green_limit  && record.get('metric') != 'count') {
            color = '#D0D0D0';
        }
        metaData.style = "background-color: " + color;
        return "<div style='text-align:center;background-color:" + color + ";'>" + text + "</div>";
    },
    churnDirection: function(value,metaData,record) {
        var color = "white";
        var display_value = ".";
        if ( value === -2 ) {
            display_value = "No Data";
        } else if ( value < 0 ) { 
            display_value = "<img src='/slm/mashup/1.11/images/minus.gif' title='down'>";
        } else if ( value > 0 ) {
            display_value = "<img src='/slm/mashup/1.11/images/plus.gif' title='up'>";
        }
        if ( record.get('health_ratio_estimated') < TSRenderers.health_green_limit  && record.get('metric') != 'count') {
            color = '#D0D0D0';
        }
        metaData.style = "background-color: " + color;
        return "<div style='text-align:center;background-color:" + color + ";'>" + display_value + "</div>";
    },
    shortDate: function(value) {
        return Rally.util.DateTime.formatWithNoYearWithDefault(value);
    }
    
});