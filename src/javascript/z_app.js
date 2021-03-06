Ext.define('CustomApp', {
    extend: 'Rally.app.App',
    componentCls: 'app',
    use_saved_ranges: false,
    skip_zero_for_estimation_ratio: true,
    logger: new Rally.technicalservices.logger(),
    items: [ 
        { xtype:'container',itemId:'selector_box', padding: 5, defaults: { padding: 5 }, layout: { type:'hbox'} }, 
        { xtype:'container', itemId:'grid_box', padding: 5 }
    ],
    _project_store: null,
    launch: function() {
        var me = this;
        this._projectIsParentSwitch(
            function() { 
                // if it's a parent, do this:
                this.down('#selector_box').add({
                    xtype:'container',
                    html:'This app is designed for use at the team level.' +
                        '<br/>Change the context selector to a leaf team node.'
                    });
            }, 
            function(){ 
                // if it's not a parent, do this:
                if ( this.getAppId() && this.use_saved_ranges ) {
                    Rally.data.PreferenceManager.load({
                        appID: this.getAppId(),
                        success: function(prefs) {
                            me.logger.log(me,"prefs",prefs);
                            if ( prefs && prefs['rally-tech-services-ranges'] ) {
                                me.saved_ranges = Ext.JSON.decode(prefs['rally-tech-services-ranges']);
                                me.logger.log(me,"saved",me.saved_ranges);
                            }
                            me._definePageDisplay();
                        }
                    });
                } else {
                    me.logger.log(this, "Preferences will not be saved");
                    this._definePageDisplay();
                }

            });
        

    },
    _definePageDisplay: function() {
        this.number_of_iterations = 3;
        this._addIterationCountSelector();
        this._addMetricSelector();
    },
    _projectIsParentSwitch: function(is_parent_callback, is_not_parent_callback) {
        var project_oid = this.getContext().getProject().ObjectID;
        
        Ext.create('Rally.data.WsapiDataStore',{
            model:'Project',
            filters: [{property:'Parent.ObjectID',value:project_oid}],
            autoLoad: true,
            listeners: {
                load: function(store,records){
                    if (records.length > 0) {
                       is_parent_callback.call(this);
                    } else {
                        is_not_parent_callback.call(this);
                    }
                }, 
                scope: this
            }
        });
    },
    _addMetricSelector: function() {
        var me = this;
        var metrics = Ext.create('Ext.data.Store', {
            fields: ['name', 'value'],
            data : [
                {"name":"By Points", "value":"estimate"},
                {"name":"By Count", "value":"count"}
            ]
        });
        
        this.down('#selector_box').add({
            itemId: 'metric_selector',
            xtype: 'combobox',
            fieldLabel: 'Metric:',
            store: metrics,
            displayField: 'name',
            valueField:'value',
            labelWidth: 50,
            listeners: {
                change: function(cb,new_value) {
                    if ( me._project_store ) {
                        var projects = me._project_store.getRecords();
                        me.logger.log(this,"Set metric to ", new_value);
                        Ext.Array.each(projects,function(project){
                            project.resetHealth();
                            project.setMetric(new_value);
                            me._setArtifactHealth(project.get('iteration_name'),project);
                        });
                    }
                }
            }
        }).setValue('estimate');

    },
    _addIterationCountSelector: function() {
        
        var counter_store = Ext.create('Rally.data.custom.Store',{
            data: [
                {
                    Name: 3
                },
                {
                    Name: 4
                },
                {
                    Name: 5
                },
                {
                    Name: 6
                },
                {
                    Name: 7
                },
                {
                    Name: 8
                },
                {
                    Name: 9
                },
                {
                    Name: 10
                },
                {
                    Name: 15
                },
                {
                    Name: 20
                }
            ]
        });
        var me = this;
        
        this.down('#selector_box').add({
            xtype: 'rallycombobox',
            fieldLabel: 'Number of Iterations',
            store: counter_store,
            displayField: 'Name',
            valueField: 'Name',
            width: 150,
            labelWidth: 100,
            value: me.number_of_iterations,
            listeners: {
                scope: this,
                ready: function(cb) {
                    me.logger.log(this,"ready",cb.getValue());
                    me.number_of_iterations = cb.getValue();
                    me._getIterations();
                },
                change: function(cb) {
                    me.logger.log(this,"change",cb.getValue());
                    me.number_of_iterations = cb.getValue();
                    me._getIterations();
                }
            }
        });
    },
    _getIterations: function() {
        var me = this;
        var number_of_iterations = this.number_of_iterations;
        var today_iso = Rally.util.DateTime.toIsoString(new Date());
        Ext.create('Rally.data.WsapiDataStore',{
            model:'Iteration',
            limit: number_of_iterations,
            pageSize: number_of_iterations,
            autoLoad: true,
            sorters: [{ property: 'EndDate', direction: 'DESC' }],
            filters: [{ property: 'EndDate', operator: '<', value: today_iso}],
            context: { projectScopeDown: false, projectScopeUp: false },
            listeners: {
                scope: this,
                load: function(store,iterations){
                    this.logger.log(this,iterations);
                    var ts_iterations = this._makeTSIterationArray(iterations);
                    this.logger.log(this,ts_iterations);
                    
                    this._project_store = Ext.create('Rally.technicalservices.ProjectStore',{
                        data: ts_iterations
                    });
                    
                    this._project_store.load(function() { me._processData(); } );
                }
            }
        });
    },
    _getProjects: function() {
        var me = this;
        this._projects = [];
        var selected_project_oid = this.getContext().getProject().ObjectID;

        Ext.create('Rally.data.WsapiDataStore',{
            model:'Project',
            limit: 'Infinity',
            autoLoad: true,
            listeners: {
                load: function(store,projects) {
                    var ts_project_hash = this._makeTSProjectHash(projects);
                    var ts_project_array = Rally.technicalservices.util.Utilities.structureProjects(ts_project_hash,true);
                    var ts_selected_project = Rally.technicalservices.util.Utilities.getProjectById(ts_project_array,selected_project_oid);
                    var ts_selected_projects = Rally.technicalservices.util.Utilities.hashToOrderedArray(ts_selected_project.getData(true),"children");

                    this._project_store = Ext.create('Rally.technicalservices.ProjectStore',{
                        data: ts_selected_projects
                    });
                    
                    this._project_store.load(function() { me._processData(); } );
                },
                scope: this
            }
        });
        
    },
    _addIterationSelector: function() {
        this.iteration_selector = this.down("#selector_box").add({
            xtype:'rallyiterationcombobox',
            listeners: {
                ready: function(cb){
                    this.logger.log(this,"ready");
                    if ( cb.getValue() ) {
                        this.getEl().mask("Loading");
                        this._updateIterationDisplay(cb);
                    } else {
                        this.logger.log(this,"No iteration selected");
                    }
                },
                change: function(cb,new_value,old_value){
                    this.logger.log(this,"change");
                    if ( cb.getValue() ) {
                        this.getEl().mask("Loading");
                        this._updateIterationDisplay(cb);
                    } else {
                        this.logger.log(this,"No iteration selected");
                    }
                },
                scope: this
            }
        });
        this.down('#selector_box').add({
            xtype:'container',
            itemId: 'iteration_range_box',
            tpl: [
                "{start_date} - {end_date} ({number_of_days} days)",
                '<tpl if="day_counter &gt; -1">',
                "<br/>This is day {day_counter} of the iteration",
                '</tpl>'
            ]
        });
    },
    _updateIterationDisplay: function(combobox) {
        this._selected_timebox = combobox.getRecord();
        var start_date = this._selected_timebox.get(combobox.getStartDateField());
        var end_date = this._selected_timebox.get(combobox.getEndDateField());
        var day_counter = -1;
        var today = new Date();
        if ( today >= start_date && today <= end_date ) {
            day_counter = Rally.technicalservices.util.Utilities.daysBetween(today,start_date,"true") + 1;
        }
        var number_of_days_in_sprint = Rally.technicalservices.util.Utilities.daysBetween(end_date,start_date,"true") + 1;
        
        this._selected_timebox.set('number_of_days_in_sprint',number_of_days_in_sprint);
        
        var formatted_start_date = Rally.util.DateTime.formatWithNoYearWithDefault(start_date);
        var formatted_end_date = Rally.util.DateTime.formatWithNoYearWithDefault(end_date);
        
        this.down('#iteration_range_box').update({
            start_date:formatted_start_date,
            end_date:formatted_end_date,
            day_counter:day_counter,
            number_of_days: number_of_days_in_sprint
        });
        
        this._processData();
    },
    _processData:function() {
        this.logger.log(this,"Processing Data");
        var me = this;
        if ( me._project_store ) {
            me._return_counter = 0; // the calls for iterations are asynchronous, so we need to count returns
            var projects = me._project_store.getRecords();
            
            Ext.Array.each(projects,function(project){
                project.resetHealth();
                project.setMetric(me.down('#metric_selector').getValue());
               
                me._setArtifactHealth(project.get('iteration_name'),project);
                me._setCumulativeHealth(project.get('iteration_name'),project);
            });

            this._makeGrid(this._project_store);
        }
    },
    /*
     * (health related to data we can get from the cumulative flow records)
     * 
     * Given the name of an iteration and a TSProject, go get the iteration cumulative flow records
     * 
     */
    _setCumulativeHealth:function(iteration_name,project){
        var me = this;
        
        // we've switched to the "project" object have the id of the iteration
        var iteration_oid = project.get('ObjectID');
        Ext.create('Rally.data.WsapiDataStore',{
            model:'IterationCumulativeFlowData',
            autoLoad: true,
            filters: [{property:'IterationObjectID',value:iteration_oid}],
            fetch: ['CardCount','CardEstimateTotal','CreationDate','IterationObjectID','TaskEstimateTotal','CardToDoTotal','CardState'],
            listeners: {
                load: function(store,records){
                    if ( records.length === 0 ) {
                        me.logger.log(this, project.get('Name'), "No cumulative flow data found for project ");
                        project.setIterationCumulativeFlowData(records);
                    } else {
                        me.logger.log(this,project.get('Name'),'CFD',records);
                        project.setIterationCumulativeFlowData(records);
                    }
                }
            }
        });
              
    },
    /*
     * (health related to data we can get from the artifacts themselves)
     * Given the name of an iteration and a TSProject, go get the iteration stories and defects
     * associated with an iteration with that name, then let the TSProject calculate various metrics
     */
    _setArtifactHealth: function(iteration_name,project) {
        this.logger.log(this,"_setArtifactHealth",iteration_name,project);
        var me = this;
        
        var candidate_artifacts = []; // have to get both stories and defects
        var filters = [
            {property:'Iteration.Name',value:iteration_name}
        ];
        
        var fetch = ['ObjectID','PlanEstimate','ScheduleState'];
        
        Ext.create('Rally.data.WsapiDataStore',{
            model: 'UserStory',
            autoLoad: true,
            filters: filters,
            fetch: fetch,
            listeners: {
                load: function(store,records){
                    candidate_artifacts = records;
                    Ext.create('Rally.data.WsapiDataStore',{
                        model:'Defect',
                        autoLoad: true,
                        filters: filters,
                        fetch: fetch,
                        listeners: {
                            load: function(store,records){
                                candidate_artifacts = Ext.Array.push(candidate_artifacts,records);
                                if ( me.skip_zero_for_estimation_ratio ) {
                                    var artifacts = [];
                                    Ext.Array.each(candidate_artifacts, function(artifact){
                                        if ( artifact.get('PlanEstimate') !== 0 ) {
                                            artifacts.push(artifact);
                                        }
                                    });
                                } else {
                                    artifacts = candidate_artifacts;
                                }
                                
                                project.setIterationArtifacts(artifacts);
                            }
                        }
                    });
                }
            }
        });
        
    },
    // given a set of Rally project objects, turn them into TS projects
    // the key of the hash is the project's ObjectID
    _makeTSProjectHash: function(projects) {
        var structured_projects = {}; // key is oid
        
        // change into our version of the project model
        // and put into a hash so we can find them easily for adding children
        Ext.Array.each(projects,function(project){
            var parent = project.get('Parent');
            var parent_oid = null;
            
            if ( parent ) { 
                parent_oid = parent.ObjectID; 
            }
            structured_projects[project.get('ObjectID')] = Ext.create('Rally.technicalservices.ProjectModel',{
                ObjectID: project.get('ObjectID'),
                parent_id: parent_oid,
                Name: project.get('Name')
            });
        });
        return structured_projects;
    },
    // given a set of Rally iteration objects, turn them into TS projects
    // the key of the hash is the project's ObjectID
    _makeTSIterationArray: function(iterations) {
        var iteration_array = []; // key is oid
        
        // change into our version of the project model
        Ext.Array.each(iterations,function(iteration){
            
            var iteration_row = Ext.create('Rally.technicalservices.ProjectModel',{
                ObjectID: iteration.get('ObjectID'),
                Name: iteration.get('Name')
            });
            
            iteration_row.addIteration(iteration);
            iteration_array.push(iteration_row);
            
        });
        
        return iteration_array;
    },
    /*
     * Given an array of projects, make a grid
     */
    _makeGrid: function(store) {
        var me = this;
        if ( this.grid ) { this.grid.destroy(); }
        
        
        var cell_renderer = Ext.create('TSRenderers',{
            listeners: {
                rangechanged: function(renderer,new_ranges){
                    if ( me.use_saved_ranges ) {
                        me.logger.log(this,this.getAppId(),renderer.ranges);
                        Rally.data.PreferenceManager.update({
                            appID: this.getAppId(),
                            settings: {
                                'rally-tech-services-ranges': Ext.JSON.encode(renderer.ranges)
                            },
                            success: function(updatedRecords, notUpdatedRecords) {
                                me.logger.log(this,"successfully saved preference 'rally-tech-services-ranges'");
                            }
                        });
                    }
                    if ( me.grid ) {
                        me.grid.refresh();
                    }
                },
                scope: this
            }
        });
        // apply saved values
        if (me.saved_ranges) {
            Ext.Object.each(me.saved_ranges,function(key,value){
                cell_renderer.setRanges(key,value); 
            });
        }
        
        var render_cell = function(value,metaData,record,row_index,col_index,store,view){
            var column = columns[col_index];
            var column_data_index = column.dataIndex;
            
            return cell_renderer.getValueForColumn(column_data_index,value,metaData,record,row_index,col_index,store,view);
        }
        
        var column_listeners = {
            scope: this,
            headerclick: function( ct, column, evt, target_element, eOpts ) {
                if (this.dialog){this.dialog.destroy();}
                this.dialog = Ext.create('Rally.ui.dialog.Dialog',{
                    defaults: { padding: 5, margin: 5 },
                    closable: true,
                    draggable: true,
                    title: column.text,
                    items: [{
                        cls: 'ts_popover_description',
                        xtype:'container',
                        html:TSDescriptions.getDescription(column)
                    },
                    TSDescriptions.getAdjustor(column,cell_renderer)
                    ]
                });
                this.dialog.show();

            }
        };
        
        var columns = [
            {text:'Iteration',dataIndex:'iteration_name',flex: 2},
            {text:'Start Date',dataIndex:'iteration_start_date',renderer:cell_renderer.shortDate},
            {text:'End Date',dataIndex:'iteration_end_date',renderer:cell_renderer.shortDate},
            {text:'# Days',dataIndex:'number_of_days_in_sprint',listeners: column_listeners},
            {text:'Estimation Ratio (Current)',dataIndex:'health_ratio_estimated',renderer:render_cell,listeners: column_listeners},
            {text:'Average Daily In-Progress',dataIndex:'health_ratio_in_progress',renderer:render_cell,listeners: column_listeners},
            {text:'50% Accepted Point', dataIndex:'health_half_accepted_ratio',renderer:render_cell,listeners: column_listeners},
            {text:'Last Day Completion Ratio',dataIndex:'health_end_completion_ratio',renderer:render_cell,listeners: column_listeners},
            {text:'Last Day Acceptance Ratio',dataIndex:'health_end_acceptance_ratio',renderer:render_cell,listeners: column_listeners},
            {text:'Scope Churn',dataIndex:'health_churn',renderer:render_cell,listeners: column_listeners },
            {text:'Scope Churn Direction',dataIndex:'health_churn_direction',renderer:render_cell,listeners: column_listeners},
            {text:'Task Churn',dataIndex:'health_churn_task',renderer:render_cell,listeners: column_listeners}
            
        ];
            

        this.grid = Ext.create('Rally.ui.grid.Grid',{
            store: store,
            height: 400,
            sortableColumns: false,
            columnCfgs: columns
        });
        this.down('#grid_box').add(this.grid);
        this.getEl().unmask();
    }
});