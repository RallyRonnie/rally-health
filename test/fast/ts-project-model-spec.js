describe("Fast Project Model tests",function(){
    describe("When testing models,",function(){
        it('should set defaults',function() {
            var pm = Ext.create('Rally.technicalservices.ProjectModel',{});
            expect(pm).not.toBe(null);
            expect(pm.get('Name')).toEqual("");
            expect(pm.get('ObjectID')).toEqual(0);
            expect(pm.get('parent_id')).toBe(0);
        });
        it('should set easy values',function() {
            var pm = Ext.create('Rally.technicalservices.ProjectModel',{
                Name: 'Project Model',
                ObjectID: 1234
            });
            expect(pm).not.toBe(null);
            expect(pm.get('Name')).toEqual("Project Model");
            expect(pm.get('ObjectID')).toEqual(1234);
            expect(pm.get('parent_id')).toBe(0);
            
            expect(pm.get('text')).toEqual('Project Model');
            expect(pm.get('id')).toEqual(1234);
        });
    //        
        it('should set associations',function() {
            var parent = Ext.create('Rally.technicalservices.ProjectModel',{
                Name: 'Parent',
                ObjectID: 1234
            });
            var child = Ext.create('Rally.technicalservices.ProjectModel',{
                Name: 'Child',
                ObjectID: 1235
            });
            var child2 = Ext.create('Rally.technicalservices.ProjectModel',{
                Name: 'Child 2',
                ObjectID: 1236,
                parent_id:1234
            });
            parent.addChild(child);
            parent.addChild(child2);
            
            expect(parent).not.toBe(null);
            expect(child).not.toBe(null);
            expect(parent.get('children').length).toEqual(2);
            expect(child.get('parent_id')).toEqual(1234);
            expect(child2.get('parent_id')).toEqual(1234);
        });
    });
    
    describe("When combined with _ts-utilities.js", function(){
        
        it('should use utility to create a structured list of projects', function() {
            var grandchild = Ext.create('Rally.technicalservices.ProjectModel',{
                Name: 'Grandkid',
                ObjectID: 1234,
                parent_id: 1235
            });
            var child = Ext.create('Rally.technicalservices.ProjectModel',{
                Name: 'Child',
                ObjectID: 1235,
                parent_id: 1236
            });
            var parent = Ext.create('Rally.technicalservices.ProjectModel',{
                Name: 'Parent',
                ObjectID: 1236,
                parent_id: null
            });
            var project_hash = {
                1234: grandchild,
                1235: child,
                1236: parent
            };
            var projects = Rally.technicalservices.util.Utilities.structureProjects(project_hash);
            expect(projects.length).toEqual(3);
        });
        
        it('should use utility to create a structured list of projects with an added root', function() {
            var grandchild = Ext.create('Rally.technicalservices.ProjectModel',{
                Name: 'Grandkid',
                ObjectID: 1234,
                parent_id: 1235
            });
            var child = Ext.create('Rally.technicalservices.ProjectModel',{
                Name: 'Child',
                ObjectID: 1235,
                parent_id: 1236
            });
            var parent = Ext.create('Rally.technicalservices.ProjectModel',{
                Name: 'Parent',
                ObjectID: 1236,
                parent_id: null
            });
            var project_hash = {
                1234: grandchild,
                1235: child,
                1236: parent
            };
            var projects = Rally.technicalservices.util.Utilities.structureProjects(project_hash,true);
            expect(projects.length).toEqual(4);
            expect(projects[0].get('Name')).toEqual("Workspace");
        });
        
            
        it('should return a hash via getData', function() {
            var grandchild = Ext.create('Rally.technicalservices.ProjectModel',{
                Name: 'Grandkid',
                ObjectID: 1234,
                parent_id: 1235
            });
            var child = Ext.create('Rally.technicalservices.ProjectModel',{
                Name: 'Child',
                ObjectID: 1235,
                parent_id: 1236
            });
            var parent = Ext.create('Rally.technicalservices.ProjectModel',{
                Name: 'Parent',
                ObjectID: 1236,
                parent_id: null
            });
            var project_hash = {
                1234: grandchild,
                1235: child,
                1236: parent
            };
            var projects = Rally.technicalservices.util.Utilities.structureProjects(project_hash,true);
            expect(projects.length).toEqual(4);
            var tree_hash = projects[0].getData(true);
            
            expect(tree_hash['text']).toEqual("Workspace");
            expect(tree_hash['children'].length).toEqual(1);
            expect(tree_hash['children'][0]['children'][0]['Name']).toEqual("Child");
        });
            
        it('should return branch of the hash by ObjectID', function() {
            var grandchild = Ext.create('Rally.technicalservices.ProjectModel',{
                Name: 'Grandkid',
                ObjectID: 1234,
                parent_id: 1235
            });
            var child = Ext.create('Rally.technicalservices.ProjectModel',{
                Name: 'Child',
                ObjectID: 1235,
                parent_id: 1236
            });
            var parent = Ext.create('Rally.technicalservices.ProjectModel',{
                Name: 'Parent',
                ObjectID: 1236,
                parent_id: null
            });
            var project_hash = {
                1234: grandchild,
                1235: child,
                1236: parent
            };
            var structured_projects = Rally.technicalservices.util.Utilities.structureProjects(project_hash,true);
            var selected_project = Rally.technicalservices.util.Utilities.getProjectById(structured_projects,1235);
            
            expect(selected_project.get('Name')).toEqual("Child");
            expect(selected_project.get('children').length).toEqual(1);
            
            var tree_hash = selected_project.getData(true);
            
            expect(tree_hash['text']).toEqual("Child");
            expect(tree_hash['children'].length).toEqual(1);
            expect(tree_hash['children'][0]['Name']).toEqual("Grandkid");
        });
        
    });
});