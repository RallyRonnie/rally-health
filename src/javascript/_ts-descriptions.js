/**
 * make a method for each dataIndex from the column that needs a description
 * 
 */

 Ext.define('TSDescriptions', {
    singleton: true,
    defaultF: function(value,metaData,record,rowIndex,colIndex,store,view){
        return value;
    },
    getAdjustor: function(column,cell_renderer){
        var colors = ["yellow","green"];
        var field_label = "Range (Red/Yellow/Green)"
        
        var values = [50,75];
        if ( cell_renderer && cell_renderer.ranges[column.dataIndex] ) {
            var ranges = cell_renderer.ranges[column.dataIndex];
            if ( ranges.direction == 'gyr' ) {
                colors = ["yellow","red"];
                field_label = "Range (Green/Yellow/Red)";
            }
            
            values = [ranges[colors[0]],ranges[colors[1]]];

            
            return {
                xtype:'multislider',
                fieldLabel: field_label,
                width: 400,
                values: values,
                increment: 5,
                minValue: 0,
                maxValue: 100,
                tipText:function(thumb){ return colors[thumb.index] + ": above " + thumb.value; },
                listeners: {
                    changecomplete: function(slider,new_value,thumb){
                        values[thumb.index] = new_value;
                        ranges[colors[thumb.index]] = new_value;
                        cell_renderer.setRanges(column.dataIndex,ranges);
                        
                    }
                }
            };
        }
        
        return null;
    },
    getDescription: function(column) {
        var me = this;
        
        var data_index = column;
        var data_name = null;
        if ( typeof(column) !== "string" ) {
            data_index = column.dataIndex;
        } else {
            column = {
                dataIndex: data_index,
                text: null
            }
        }
        
        if ( typeof this[data_index] == "string") {
            var tpl = new Ext.XTemplate( me[data_index] );
            
            return tpl.apply(column);
        } else {
            return data_name;
        }
    },
    health_churn: "<h1>Description</h1>" +
            "Churn is a measure of the change in the iteration's scope." +
            "<h1>How it is calculated</h1>" +
            "It is defined as the standard deviation of the total scheduled into the sprint divided by the average daily total.",
    health_churn_direction: "<h1>Description</h1>" +
            "Churn Direction is an indicator of the general direction of scope change.  Churn is defined as a standard deviation, which " +
            "is always zero or positive, so this added indicator provides an indication of whether scope tended to be added or removed " +
            "<h1>How it is calculated</h1>" +
            "It is determined by examining every day's change from the day before and adding or subtracting the delta to determine " +
            "whether scope has been added more often than subtracted. (The first day of the iteration is excluded from this calculation.)",
    health_churn_task: "<h1>Description</h1>" +
            "An additional metric indicating when tasks have been added or removed on the last day of the iteration.  If a signivicant" +
            "percentage of tasks are removed, it could be an indicator that the team is moving committed work items to another iteration." +
            "<h1>How it is calculated</h1>" +
            "The number of estimated hours for the tasks scheduled in the iteration on the last day are subtracted from the total estimated " +
            "hours of tasks scheduled on the next-to-last day, then divided by the next-to-last-day totals to create a percentage.  Note " +
            "that this is calculated from the <b>estimates</b> of all the tasks, not the hours remaining to-do",
    number_of_days_in_sprint: "The number of full days in the iteration " +
            "(Excluding weekends)",
    health_ratio_estimated: "<h1>Description</h1>" +
        "Represents the ratio of work items (stories and defects) that have estimates." +
        "<h1>How it is calculated</h1>" +
        "Divide the number of work items (stories and defects) in the iteration that have a plan " +
        "estimate that is not null by the total number of items in the iteration multiplied by 100. " +
        "<h1>Coaching Tip</h1>" + 
        "If there is a very high percentage or stories without estimates, other measures will not " + 
        "be meaningful.  This is really only useful for the beginning of an iteration, and perhaps " + 
        "for an iteration in early flight, but not for an iteration that has ended.  The idea is to " + 
        "catch this early in an iteration so other charts/graphs etc are useful for teams.  A good " + 
        "practice is to have a ready backlog as and entrance criteria to an iteration planning session, " + 
        "a ready backlog means three things, sized, ranked, and stories are elaborated sufficiently with " + 
        "acceptance criteria to enable conversation and confirmation during planning.",
    health_end_acceptance_ratio: "<h1>Description</h1>" +
        "Indicates whether teams met their commitment, assuming work items have not been removed from the iteration. " +
        "<h1>How it is calculated</h1>" +
        "Divide the plan estimates of the work items in the iteration that were accepted on the last day of the iteration " +
        "by the total plan estimate of all work items in the iteration.  If analysis type is set to 'counts', the calculation " +
        "is based on the number of work items, not the plan estimate of the work items.",
    health_ratio_in_progress: "<h1>Description</h1>" + 
        "This is an indication of how much work is in progress (WIP).  It is the ratio of the average of " +
        "the work items in the in-Progress state on a daily basis. " +
        "<h1>How it is calculated</h1>" +
        "Divide the plan estimate of all the work items in the 'in-progress' state by the total plan estimate " +
        "of the work items in the iteration, divided by the number of days.  If the iteration is in-flight, we'll " +
        "divide by the number of days so far.   If analysis type is set to “counts”, the calculation is based on the " +
        "count of the work items, not the plan estimate of the work items." +
        "<h1>Coaching Tip</h1>" +
        "A high percentage here would mean that there is a high degree of daily WIP on average.  Keeping WIP small, " +
        "reduces context switching and helps team focus on the most important items to reach acceptance.",
    health_half_accepted_ratio:"<h1>Description</h1>" +
        "This is an indication of how well teams are doing with accepting work throughout the iteration.  A high " +
        "percentage would mean that half of the work is being accepted near the end of the iteration.  100% would mean " +
        "that on the last day of the iteration, the team has accepted at least 1/2 of the committed work.  For a 10 day " +
        "iteration, for example, 25% would mean that 1/2 of the committed work was accepted before day 3." +
        "<h1>How it is calculated</h1>" +
        "Find the percentage of plan estimate points that are accepted at the end of every day of the sprint and determine " +
        "what part of the sprint that number passes 50%.  If analysis type is set to “counts”, the calculation is based on " +
        "the count of the work items, not the plan estimate of the work items.  Should the percentage of points accepted " +
        "drop below 50%, the point at which 50% acceptance is achieved is reset, until 50% is once again achieved." +
        "<h1>Coaching Tip</h1>" +
        "Common causes of work being accepted late are:  Product Owner is absent or at least not actively participating with the " +
        "team on a daily basis.  Stories do not have clear acceptance criteria.  Teams lack a clear definition of done for stories, " +
        "to name a few.  A team that tends to accept work items late in the iteration may risk meeting commitment. ",
    health_end_incompletion_ratio:"<b>{text}</b>",
    health_end_completion_ratio: "<h1>Description</h1>" +
            "Represent the ratio of work completed by iteration end.  A low percentage migh imply that there is work planned into an " +
            "iteration that was left in a schedule state lower than completed." +
            "<h1>How it is Calculated</h1>" +
            "Divide the plan estimates of the work items in the iteration that are in a schedule state that is Completed " +
            "or higher at the end of the last day of the iteration by the total plan estimate of all work items in the iteration. " +
            "If analysis type is set to 'counts', the calculation is based on the count of the work items, not the plan estimate " +
            "of the work items."

});