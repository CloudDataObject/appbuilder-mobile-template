'use strict';

(function (parent) {
    var listViewModel = kendo.observable({
        jsdoDataSource: undefined,
        jsdoModel: undefined,
        selectedRow: {},
        origRow: {},
        resourceName: undefined,

        // The order of the firing of events is as follows:
        //   before-show
        //   init (fires only once)
        //   show

        onBeforeShow: function(e) {
            var clistView;

            clistView = $("#listListView").data("kendoMobileListView");
            if (clistView == undefined) {
                app.viewModels.listViewModel.onInit(this);
            } else if (clistView.dataSource && clistView.dataSource.data().length == 0) {
                clistView.dataSource.read();
            }

            // Set list title to resource name
            if (app.viewModels.listViewModel.resourceName != undefined) {
                app.changeTitle(app.viewModels.listViewModel.resourceName);
            }
        },

        onInit: function(e) {
            var idx;
            try {
                // Create Data Source
                app.viewModels.listViewModel.createJSDODataSource();

                // Create list
                if (jsdoSettings && jsdoSettings.displayFields) {
                     $("#listListView").kendoMobileListView({
                        dataSource: app.viewModels.listViewModel.jsdoDataSource,
                        autoBind: false,
                        pullToRefresh: true,
                        appendOnRefresh: false,
                        endlessScroll: true,
                        virtualViewSize: 100,
                        template: "#:" + jsdoSettings.displayFields.split(",").join("#</br> #:") + "#",

                        click: function(e) {
                            // console.log("e.dataItem._id " + e.dataItem._id);
                            app.viewModels.listViewModel.set("selectedRow", e.dataItem);
                        }
                    });
                }
                else {
                    console.log("Warning: jsdoSettings.displayFields not specified");
                }
            }
            catch (ex) {
                console.log("Error in initListView: " + ex);
            }
        },

        createJSDODataSource: function( ) {
            try { 
                // create JSDO
                if (jsdoSettings && jsdoSettings.resourceName) {
                    this.jsdoModel = new progress.data.JSDO({ name : jsdoSettings.resourceName,
                        autoFill : false, events : {
                            'afterFill' : [ {
                                scope : this,
                                fn : function (jsdo, success, request) {
                                    // afterFill event handler statements ...
                                }
                            } ],
                            'beforeFill' : [ {
                                scope : this,
                                fn : function (jsdo, success, request) {
                                    // beforeFill event handler statements ...
                                }
                            } ]
                        }
                    });
                    this.jsdoDataSource = new kendo.data.DataSource({
                        type: "jsdo",
                        // TO_DO - Enter your filtering and sorting options
                        //serverFiltering: true,
                        //serverSorting: true,
                        //filter: { field: "State", operator: "startswith", value: "MA" },
                        //sort: [ { field: "Name", dir: "desc" } ],
                        transport: {
                            jsdo: this.jsdoModel
                            // TO_DO - If resource is a multi-table dataset, specify the table name for this data source
                            //, tableRef: jsdoSettings.tableName
                        },
                        error: function(e) {
                            console.log("Error: ", e);
                        }
                    });
                    this.resourceName = jsdoSettings.resourceName;
                }
                else {
                    console.log("Warning: jsdoSettings.resourceName not specified");
                }
           }
           catch(ex) {
               app.viewModels.listViewModel.createDataSourceErrorFn({errorObject: ex});
           }
        },

        createDataSourceErrorFn: function(info) {
            var msg = "Error on create DataSource";
            app.showError(msg);
            if (info.errorObject !== undefined) {
                msg = msg + "\n" + info.errorObject;
            }
            console.log(msg);
        },

        clearData: function () {
            var that = this,
                clistView; 

            if (that.jsdoModel) {
                that.jsdoModel.addRecords([], progress.data.JSDO.MODE_EMPTY);
            }
            clistView = $("#listListView").data("kendoMobileListView");
            if (clistView && clistView.dataSource) {
                // Clear ListView
                clistView.dataSource.data([]);
                clistView.refresh();
            }
       },
    });

    parent.listViewModel = listViewModel;

})(app.viewModels);
