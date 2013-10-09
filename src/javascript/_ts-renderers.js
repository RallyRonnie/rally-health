/*
 * A simple collection of renderers by name.  
 * 
 * If a property in ranges is named by the columns dataIndex, it'll show a slider bar for modifying
 * the ranges.  The rendering requires that a main property is set for each dataIndex that uses the renderer.
 * 
 */
 
 Ext.define('TSRenderers', {
    extend: 'Ext.Component',
    config: {
        red: '#ff9999',
        yellow: '#ffffcc',
        green: '#ccffcc',
        grey: '#D0D0D0',
        benchmark_green: 90,
        benchmark_field: 'health_ratio_estimated',
        ranges: {
            health_ratio_estimated: { red: 0, yellow: 60, green: 90, direction: 'ryg' },
            health_ratio_in_progress: { green: 0, yellow: 25, red: 35, direction: 'gyr' },
            health_half_accepted_ratio: { green: 0, yellow: 50, red: 75, direction: 'gyr' },
            health_end_completion_ratio: { red: 0, yellow: 95, green: 100, direction: 'ryg' },
            health_end_acceptance_ratio: { red: 0, yellow: 50, green: 91, direction: 'ryg' }
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
            color = this.grey;
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
    health_half_accepted_ratio: function(value,metaData,record) {
        var ranges = this.ranges.health_half_accepted_ratio;
        var color = this.green;
        
        if ( value < 0 ) {
            return " ";
        }
        var percent = parseInt( 100 * value, 10 );
        var accomplished_date = record.get('health_half_accepted_date');
        var text = this.shortDate(accomplished_date) + " (" + percent + "%)";
        
        if ( this.shouldBeGrey(record) ) {
            color = this.grey;
        } else {
            if ( percent > ranges.yellow ) {
                color = this.yellow;
            }
            if ( percent > ranges.red ) {
                color = this.red;
            }
        }
        if ( percent === 200 ) {
            text = "Never";
        }
        metaData.style = "background-color: " + color;
        return text;
    },
    incompletionHealth: function(value,metaData,record) {
        if ( value < 0 ) {
            return " ";
        }
        var percent = parseInt( 100 * value, 10 );
        var text = percent + "%";
        
        var color = TSRenderers.green;
        if ( this.shouldBeGrey(record) ) {
            color = this.grey;
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
        if ( percent == 200 ) {
            color = "white";
            text = "No Data";
        }
        metaData.style = "background-color: " + color;
        return "<div style='text-align:center;background-color:" + color + "'>"+ text + "</div>";
    },
    health_end_completion_ratio: function(value,metaData,record) {
        if ( value < 0 ) {
            return " ";
        }
        var ranges = this.ranges.health_end_completion_ratio;
        var percent = parseInt( 100 * value, 10 );
        var text = percent + "%";
        
        var color = this.red;
        if ( this.shouldBeGrey(record) ) {
            color = this.grey;
        } else {
            if ( percent > ranges.yellow ) {
                color = this.yellow;
            }
            if ( percent >= ranges.green ) {
                color = this.green;
            }
            
            if ( percent == 200 ) {
                color = "white";
            }
        }
        if ( percent == 200 ) {
            text = "No Data";
        }
        metaData.style = "background-color: " + color;
        return text;
    },
    health_end_acceptance_ratio: function(value,metaData,record) {
        if ( value < 0 ) {
            return " ";
        }
        var percent = parseInt( 100 * value, 10 );
        var text = percent + "%";
        var ranges = this.ranges.health_end_acceptance_ratio;
        
        var color = this.red;
        if ( this.shouldBeGrey(record) ) {
            color = this.grey;
        } else {
            
            if ( percent > ranges.yellow ) {
                color = this.yellow;
            }
            if ( percent >= ranges.green ) {
                color = this.green;
            }
            if ( percent == 200 ) {
                color = "white";
            }

        }
        if ( percent == 200 ) {
            text = "No Data";
        }
        metaData.style = "background-color: " + color;
        return text;
    },
    health_churn: function(value,metaData,record) {
        
        var text = "No data";
        var color = "white";
        
        if ( value >= 0 ) {
            var percent = parseInt( 100 * value, 10 );
            text = percent + "%";
        }
        
        if ( this.shouldBeGrey(record) ) {
            color = this.grey;
        }
        metaData.style = "background-color: " + color;
        return text;
    },
    health_churn_task: function(value,metaData,record) {
        var text = "No data";
        var color = "white";
        if ( value >= 0 ) {
            var percent = parseInt( 100 * value, 10 );
            text = percent + "%";
        }
            
        if (this.shouldBeGrey(record)) {
            color = this.grey;
        }
        metaData.style = "background-color: " + color;
        return "<div style='text-align:center;background-color:" + color + ";'>" + text + "</div>";
    },
    health_churn_direction: function(value,metaData,record) {
        var color = "white";
        var display_value = ".";
        if ( value === -2 ) {
            display_value = "No Data";
        } else if ( value < 0 ) { 
            display_value = "<img src='/slm/mashup/1.11/images/minus.gif' title='down'>";
        } else if ( value > 0 ) {
            display_value = "<img src='/slm/mashup/1.11/images/plus.gif' title='up'>";
        }
        if ( this.shouldBeGrey(record) ) {
            color = this.grey;
        }
        metaData.style = "background-color: " + color;
        return "<div style='text-align:center;background-color:" + color + ";'>" + display_value + "</div>";
    },
    shortDate: function(value) {
        return Rally.util.DateTime.formatWithNoYearWithDefault(value);
    }
    
});