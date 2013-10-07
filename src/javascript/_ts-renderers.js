/*
 * A simple collection of renderers by name.  Note that "this" is NOT this singleton
 * 
 */
 
 Ext.define('TSRenderers', {
    singleton: true,
    red: '#ff9999',
    yellow: '#ffffcc',
    green: '#ccffcc',
    health_green_limit: 0.91,
    defaultF: function(value,metaData,record,rowIndex,colIndex,store,view){
        return value;
    },
    estimateHealth: function(value,metaData) {
        
        if ( value < 0 ) {
            return " ";
        }
        var percent = parseInt( 100 * value, 10 );
        var color = TSRenderers.green;
        if ( value < TSRenderers.health_green_limit ) {
            color = TSRenderers.yellow;
        }
        if ( value < 0.61 ) {
            color = TSRenderers.red;
        }
        metaData.style = "background-color: " + color;
        return "<div style='text-align:center;background-color:" + color + "'>"+ percent + "%</div>";
    },
    inProgressHealth: function(value,metaData,record) {
        var color = TSRenderers.green;

        var percent = parseInt( 100 * value, 10 );
        if ( record.get('health_ratio_estimated') < TSRenderers.health_green_limit ) {
            color = '#D0D0D0';
        } else {
            if ( value < 0 ) {
                return " ";
            }
            if ( percent > 25 ) {
                color = TSRenderers.yellow;
            }
            if ( percent > 35 ) {
                color = TSRenderers.red;
            }
        }
        metaData.style = "background-color: " + color;
        return "<div style='text-align:center;background-color:" + color + "'>"+ percent + "%</div>";
    },
    halfAcceptedHealth: function(value,metaData,record) {
        if ( value < 0 ) {
            return " ";
        }
        var percent = parseInt( 100 * value, 10 );
        var accomplished_date = record.get('health_half_accepted_date');
        var text = TSRenderers.shortDate(accomplished_date) + " (" + percent + "%)";
        
        
        var color = TSRenderers.green;
        if ( record.get('health_ratio_estimated') < TSRenderers.health_green_limit ) {
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
        if ( record.get('health_ratio_estimated') < TSRenderers.health_green_limit ) {
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
    acceptanceHealth: function(value,metaData,record) {
        if ( value < 0 ) {
            return " ";
        }
        var percent = parseInt( 100 * value, 10 );
        var text = percent + "%";
        
        var color = TSRenderers.green;
        if ( record.get('health_ratio_estimated') < TSRenderers.health_green_limit ) {
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
        
        if ( record.get('health_ratio_estimated') < TSRenderers.health_green_limit ) {
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
            
        if ( record.get('health_ratio_estimated') < TSRenderers.health_green_limit ) {
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
        if ( record.get('health_ratio_estimated') < TSRenderers.health_green_limit ) {
            color = '#D0D0D0';
        }
        metaData.style = "background-color: " + color;
        return "<div style='text-align:center;background-color:" + color + ";'>" + display_value + "</div>";
    },
    shortDate: function(value) {
        return Rally.util.DateTime.formatWithNoYearWithDefault(value);
    }
    
});