

(function( $, wpcustomize ) {
    var $document = $( document );

    var CustomizeBuilder = function( $el ,controlId, items ){
        var Builder = {
            controlId: '',
            cols: 12,
            cellHeight: 45,
            items: [],
            container: null,
            ready: false,
            devices: {'desktop': 'Desktop/Tablet', 'mobile': 'Mobile' },
            activePanel: 'desktop',
            panels: {},
            activeRow: 'main',
            getTemplate: _.memoize(function () {
                var control = this;
                var compiled,
                    /*
                     * Underscore's default ERB-style templates are incompatible with PHP
                     * when asp_tags is enabled, so WordPress uses Mustache-inspired templating syntax.
                     *
                     * @see trac ticket #22344.
                     */
                    options = {
                        evaluate: /<#([\s\S]+?)#>/g,
                        interpolate: /\{\{\{([\s\S]+?)\}\}\}/g,
                        escape: /\{\{([^\}]+?)\}\}(?!\})/g,
                        variable: 'data'
                    };

                return function (data, id, data_variable_name ) {
                    if (_.isUndefined(id)) {
                        id = 'tmpl-customize-control-' + control.type;
                    }
                    if ( ! _.isUndefined( data_variable_name ) && _.isString( data_variable_name ) ) {
                        options.variable = data_variable_name;
                    } else {
                        options.variable = 'data';
                    }
                    compiled = _.template($('#' + id).html(), null, options);
                    return compiled(data);
                };

            }),

            inElement: function( mousePosition, $el ){
                var pos = $el.offset();
                var width = $el.width();
                var height = $el.height();
                var right = pos.left + width;
                var bottom = pos.top + height;

                if (
                    mousePosition.x >= pos.left && mousePosition.y >= pos.top
                    && mousePosition.x <= right
                    && mousePosition.y <= bottom
                ) {
                    return true;
                }

                return false;
            },

            drag_drop: function(){
                var that = this;

                var current_gridster;
                //this is the listener for mouse entry
                $document.on('mousemove', '.gridster', function(e) {
                    // store current_grid

                   // console.log( 'ID', $(this).attr( 'id' ) );
                   // console.log( 'Mouse X-Y', e.pageX + '--'+e.pageY );
                   // console.log( 'E Target', e );


                    if (!$('body').hasClass('gridster-dragging')) {
                        return;
                    }


                    _.each( that.panels[ that.activePanel ], function( setting, id ){
                        if ( that.inElement( { x: e.pageX, y: e.pageY }, setting.container ) ) {
                            var ul = setting.container.find( 'ul' );
                            var gridster = ul.data('gridster');
                            if ( ! gridster.drag_api.is_dragging) {
                                setting.container.addClass('gridster-item--over');
                                console.log('IN', id );
                                current_gridster = ul;
                            }
                        } else {
                            setting.container.removeClass('gridster-item--over');
                        }
                    } );

                    $(this).addClass('gridster-item--over');
                });
                $document.on('mouseleave', '.gridster', function(e) {
                    // store current_grid
                    $(this).removeClass('gridster-item--over');
                });


                _.each( that.devices, function( device_name, device ) {
                    var devicePanel = $( '._beacon--device-panel[data-device="'+device+'"]', that.container );
                    that.panels[ device ] = {};
                    /**
                     * @see https://github.com/gridstack/gridstack.js/tree/develop/doc#addedevent-items
                     *
                     * view-source:http://gridstackjs.com/demo/serialization.html
                     */
                    $('._beacon--cb-items.gridster', devicePanel ).each(function () {
                        var g = $(this);
                       // var appendTo =  $( '._beacon--cb-items.grid-stack', devicePanel ).not( g );

                        var id = $(this).data('id');
                        that.panels[ device ][id] = {};
                        var elID = 'builder-ul-'+device+'-'+id;
                        var ul = $( 'ul', g ).first();
                        g.attr( 'id', elID );


                        var options = {
                            widget_base_dimensions: ['auto', 45],
                            autogenerate_stylesheet: true,

                            widget_margins: [5, 5],
                            max_cols: 12,
                            min_cols: 1,
                            resize: {
                                enabled: true,
                                axes: ['x']
                            },
                            draggable: {
                                start: function(e, data) {
                                    $('body').addClass('gridster-dragging');
                                },
                                stop: function(e, data) {

                                    /*
                                    var outerGrid = $('.gridster-item--over').not( '.dragging' );
                                    if (outerGrid.length) {
                                        var clone = this.$player.clone(),
                                            sizeX = this.$player.data('sizex'),
                                            sizeY = this.$player.data('sizey');
                                        this.$el.data('gridster').remove_widget(this.$player, true, function() {
                                            outerGrid.find('ul').data('gridster').add_widget(clone, sizeX, sizeY);
                                            outerGrid.removeClass('gridster-item--over');
                                        });
                                    }
                                    */

                                    var $el = this.$el;

                                    if ( current_gridster && ! $el.is( current_gridster ) ) {

                                        var clone = this.$player.clone(),
                                            sizeX = this.$player.data('sizex'),
                                            sizeY = this.$player.data('sizey');
                                        var gridster  = current_gridster.data( 'gridster' );
                                        $el.data('gridster').remove_widget(this.$player, true, function() {
                                            gridster.add_widget(clone, sizeX, sizeY);
                                            if ( $el.find( 'li' ).length == 0 ) {
                                                $el.height( '' );
                                            }

                                            console.log( 'add_new' );
                                            $( '.gridster', that.container ) .removeClass('gridster-item--over');
                                        });

                                        //current_gridster =  null;

                                    }

                                    $('body').removeClass('gridster-dragging');
                                }
                            }
                        };
                        options.namespace = '#'+elID;
                        //console.log( 'ul', ul );
                        //console.log( 'options', options );
                         ul.gridster(options);

                        var data_gridster = ul.data('gridster');

                        that.panels[ device ][id].container = g;
                        that.panels[ device ][id].gridster = data_gridster;


                        /*
                        g.on('change', function (event, items) {
                            that.save();

                        });
                        */

                    });
                });

            },

            addExistingRowsItems: function(){

                var that = this;
                var data =  wpcustomize.control( that.controlId ).params.value;

                if ( ! _.isObject( data ) ) {
                    data = {};
                }
                _.each( that.panels, function( settings,  device ) {
                    if( _.isUndefined( data[device] ) ) {
                        data[device] = {};
                    }
                    _.each(settings, function (row, index) {
                        if ( _.isUndefined( data[device][index] ) ) {
                            data[device][index] = {};
                        }
                        var rowData = data[device][index];
                        if (!_.isUndefined(rowData) && !_.isEmpty(rowData)) {
                            _.each(rowData, function (node) {
                               // var $item = $('._beacon-available-items[data-device="'+device+'"] .grid-stack-item[data-id="' + node.id + '"]', that.container).first();
                                var html = '<li data-row="1" data-col="4" data-sizex="1" data-sizey="1"></li>';
                               // console.log( html );
                                that.panels[ device ][index].gridster.add_widget( html );
                            });
                        }
                    });
                });

                that.ready = true;
            },


            findNewPosition: function( new_node ){
                var that = this;
                var $devicePanel = $( '._beacon--device-panel[data-device="'+that.activePanel+'"]', that.container );
                var $main = $('._beacon--row-main ._beacon--cb-items', $devicePanel );
                if ( $('.grid-stack-item', $main ).length === 0 ) {
                    new_node.x = 0;
                    return new_node;
                }
                // if still have space for this item at the end
                var last = $('.grid-stack-item', $main ).last();
                var node = last.data('_gridstack_node');

                var last_note = {
                    x: node.x,
                    y: node.y,
                    width: node.width,
                    height: node.height
                };
                var width = 1;
                var space;
                if ( last_note.x + last_note.width < that.cols ) {
                    space = that.cols - ( last_note.x + last_note.width );
                    if ( space < new_node.width ) {
                        new_node.width = space;
                    }
                    new_node.x =  last_note.x + last_note.width;
                    return new_node;
                }

                return new_node;
            },

            addPanel: function( device ){
                var that = this;
                var template = that.getTemplate();
                var template_id =  'tmpl-_beacon--cb-panel';
                if (  $( '#'+template_id ).length == 0 ) {
                    return ;
                }
                var html = template( {}, template_id );
                return '<div class="_beacon--device-panel _beacon-vertical-panel _beacon--panel-'+device+'" data-device="'+device+'">'+html+'</div>';
            },



            addDevicePanels: function(){
                var that = this;
                _.each( that.devices, function( device_name, device ) {
                    var panelHTML = that.addPanel( device );
                    $( '._beacon--cb-devices-switcher', that.container ).append( '<a href="#" class="switch-to-'+device+'" data-device="'+device+'">'+device_name+'</a>' );
                    $( '._beacon--cb-body', that.container ).append( panelHTML );
                } );

            },

            addItem: function( node ){
                var that = this;
                var template = that.getTemplate();
                var template_id =  'tmpl-_beacon--cb-item';
                if (  $( '#'+template_id ).length == 0 ) {
                  return ;
                }
                var html = template( node, template_id );
                return $( html );
            },

            addAvailableItems: function(){
                var that = this;

                // <div class="_beacon-available-items"></div>
                _.each( that.devices, function(device_name, device ){
                    var $itemWrapper = $( '<ul class="_beacon-available-items _beacon-available-items-'+device+' _beacon--panel-hide" data-device="'+device+'"></ul>' );
                    $( '._beacon--cb-footer' ).append( $itemWrapper );
                    _.each( that.items, function( node ) {
                        var item = that.addItem( node );
                        $itemWrapper.append( item );
                    } );
                } );

            },

            switchToDevice: function( device ){
                var that = this;
                $( '._beacon--cb-devices-switcher a', that.container).removeClass('_beacon--tab-active');
                $( '._beacon--cb-devices-switcher .switch-to-'+device, that.container ).addClass( '_beacon--tab-active' );
                $( '._beacon--device-panel, ._beacon-available-items', that.container  ).addClass( '_beacon--panel-hide' );
                $( '._beacon--device-panel._beacon--panel-'+device+ ', ._beacon-available-items-'+device, that.container  ).removeClass( '_beacon--panel-hide' );
                that.activePanel = device;
            },



            addNewWidget: function ( $item ) {
                var node = {
                    si: 0,
                    y: 0,
                    width: $item.data('gs-width') || 3,
                    height: 1
                };
                //node = this.findNewPosition( node );
                //that.panels[ device ][index].gridster.add_widget( html );
                this.panels[ this.activePanel ][ this.activeRow ].gridster.add_widget( $item , node.x, node.y, node.width, node.height, true, 1,12, 1,1 );
            },
            focus: function(){
                $document.on( 'click', '._beacon--cb-item-setting', function( e ) {
                    e.preventDefault();
                    var section = $( this ).data( 'section' ) || '';
                    var control = $( this ).data( 'control' ) || '';
                    var did = false;
                    if ( control ) {
                        if ( ! _.isUndefined(  wpcustomize.control( control ) ) ) {
                            wpcustomize.control( control ).focus();
                            did = true;
                        }
                    }
                    if ( ! did ) {
                        if ( section && ! _.isUndefined(  wpcustomize.section( section ) ) ) {
                            wpcustomize.section( section ).focus();
                            did = true;
                        }
                    }

                } );

            },
            /**
             * @see https://github.com/gridstack/gridstack.js/tree/develop/doc#removewidgetel-detachnode
             */
            remove: function(){
                var that = this;
                $document.on( 'click', '.grid-stack-item ._beacon--cb-item-remove',  function(e){
                    e.preventDefault();
                    var item = $( this ).closest('.grid-stack-item');
                    var layout = item.closest('.grid-stack');
                    var id = layout.data( 'id' );
                    if ( that.panels[that.activePanel][id] ) {
                        $( '._beacon-available-items._beacon-available-items-'+that.activePanel, that.container) .append( item );
                        that.panels[that.activePanel][id].gridstack.batchUpdate();
                        that.panels[that.activePanel][id].gridstack.commit();
                    }
                } );
            },

            encodeValue: function( value ){
                return encodeURI( JSON.stringify( value ) )
            },
            decodeValue: function( value ){
                return JSON.parse( decodeURI( value ) );
            },

            save: function(){
                var that = this;
                if ( ! that.ready  ) {
                    return ;
                }

                var data = {};
                _.each( that.panels, function( settings,  device ) {
                    data[device] = {};
                    _.each( settings, function( row, index ) {
                        var rowData = _.map( $( ' > .grid-stack-item:visible', row.container ), function (el) {
                            el = $(el);
                            var node = el.data('_gridstack_node');
                            if ( ! _.isUndefined( node ) ) {
                                return {
                                    x: node.x,
                                    y: node.y,
                                    width: node.width,
                                    height: node.height,
                                    id: el.data('id') || ''
                                };
                            }

                            return false;

                        });
                        data[device][index] = rowData;
                    });
                });

                wpcustomize.control( that.controlId ).setting.set( that.encodeValue( data ) );
                console.log('Panel Data: ', data );

            },

            init: function( $el, controlId, items ){
                var that = this;
                that.container = $el;
                that.controlId = controlId;
                that.items = items;

                that.addDevicePanels();
                that.addAvailableItems();
                that.switchToDevice( that.activePanel );

                that.drag_drop();

                that.focus();
                that.remove();

                that.addExistingRowsItems();

                $( '._beacon-available-items', that.container ).on( 'click', '.grid-stack-item', function( e ){
                    e.preventDefault();
                    var item = $( this );
                    that.addNewWidget( item );
                } );

                // Switch panel
                that.container.on( 'click', '._beacon--cb-devices-switcher a', function(e){
                    e.preventDefault();
                    var device = $( this ).data('device');
                    that.switchToDevice( device );
                } );


            }
        };

        Builder.init( $el, controlId, items );
        return Builder;
    };


    wpcustomize.bind( 'ready', function( e, b ) {
        var Header = new CustomizeBuilder(
            $( '._beacon--customize-builder' ),
            'header_builder_panel',
            _Beacon_Layout_Builder.header_items
        );
    });


    // When data change
    /*
    wpcustomize.bind( 'change', function( e, b ) {
       console.log( 'Change' );
    });
    */


})( jQuery, wp.customize || null );