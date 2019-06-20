/**
 * @author pieper
 *
 * derived from three.js/editor/ui from:
 * @author mrdoob / http://mrdoob.com/
 */

class STEP {
  constructor() {
    this.applicationName = "STEP";
  }
}

class UIItem {
  constructor(application) {
    this.application = application;
  }
  get dom() {
    return this.container.dom;
  }
}

class Menubar extends UIItem {
  constructor() {
    super();
    this.container = new UI.Panel();
    this.container.setId('menubar');
  }
}

class stepMenubar extends Menubar {
  constructor(step, options) {
    super();
    this.container.add(new stepFileMenu(step,options).container);
    this.container.add(new stepDatabaseMenu(step,options).container);
    this.container.add(new stepViewMenu(step,options).container);
    this.container.add(new stepDisplayMenu(step,options).container);
    this.container.add(new stepOperationMenu(step,options).container);
    this.container.add(new stepAboutMenu(step,options).container);
  }
}

class MenuPanel extends UIItem {
  constructor(application, options) {
    super();
    this.container = new UI.Panel();
    this.container.setClass( 'menu' );
    // title
    let title = new UI.Panel();
    title.setClass( 'title' );
    title.setTextContent(options.title);
    this.container.add( title );
    // panel
    this.menuPanel = new UI.Panel();
    this.menuPanel.setClass( 'options' );
    this.container.add( this.menuPanel );
  }
}

class stepFileMenu extends MenuPanel {
  constructor(step,options) {
    super(step, {title: 'File'});

    // demos
    let demos = [
      /*
      { name: "Prostate Example",
        seriesKeys: ['[["UnspecifiedInstitution","QIN-PROSTATE-01-0002"],["MS2197/BD/PRO   Pelvis w&w/o","1.3.6.1.4.1.14519.5.2.1.3671.7001.267069126134560539593081476574"],["MR","AX FRFSE-XL T2","1.3.6.1.4.1.14519.5.2.1.3671.7001.311804128593572138452599822764"]]'],
      },
      */
      { name: "Prostate Example",
        seriesKeys: [
          '[["UnspecifiedInstitution","QIN-PROSTATE-01-0001"],["PELVIS W/O CONT","1.3.6.1.4.1.14519.5.2.1.3671.7001.133687106572018334063091507027"],["MR","Apparent Diffusion Coefficient (mm?/s)","1.3.6.1.4.1.14519.5.2.1.3671.7001.261913302903961139526297576821"]]',
          '[["UnspecifiedInstitution","QIN-PROSTATE-01-0001"],["PELVIS W/O CONT","1.3.6.1.4.1.14519.5.2.1.3671.7001.133687106572018334063091507027"],["SEG","UnspecifiedSeriesDescription","1.2.276.0.7230010.3.1.3.0.19185.1476720200.384250"]]',
          ],
      },
      { name: "Head and Neck Example",
        seriesKeys: ['[["UnspecifiedInstitution","QIN-HEADNECK-01-0003"],["Thorax^1HEAD_NECK_PETCT","1.3.6.1.4.1.14519.5.2.1.2744.7002.150059977302243314164020079415"],["CT","CT WB 5.0 B40s_CHEST","1.3.6.1.4.1.14519.5.2.1.2744.7002.248974378224961074547541151175"]]'],
      },
      { name: "QIN 139 PET Segmentation",
        seriesKeys: [
          '[["UnspecifiedInstitution","QIN-HEADNECK-01-0139"],["CT CHEST W/O CONTRAST","1.3.6.1.4.1.14519.5.2.1.2744.7002.373729467545468642229382466905"],["SEG","tumor segmentation - User3 SemiAuto trial 1","1.2.276.0.7230010.3.1.3.8323329.20009.1440004784.9295"]]',
          /* the PT */
          '[["UnspecifiedInstitution","QIN-HEADNECK-01-0139"],["CT CHEST W/O CONTRAST","1.3.6.1.4.1.14519.5.2.1.2744.7002.373729467545468642229382466905"],["PT","PET HeadNeck_0","1.3.6.1.4.1.14519.5.2.1.2744.7002.886851941687931416391879144903"]]'
          /* the CT
          '[["UnspecifiedInstitution","QIN-HEADNECK-01-0139"],["CT CHEST W/O CONTRAST","1.3.6.1.4.1.14519.5.2.1.2744.7002.373729467545468642229382466905"],["CT","CT HeadNeck  3.0  B30f_CHEST","1.3.6.1.4.1.14519.5.2.1.2744.7002.182837959725425690842769990419"]]',
          */
        ],
      },
      { name: "MRHead",
        seriesKeys: [
          '[["UnspecifiedInstitution","123456"],["Slicer Sample Data","1.2.826.0.1.3680043.2.1125.1.34027065691713096181869243555208536"],["MR","No series description","1.2.826.0.1.3680043.2.1125.1.60570920072252354871500178658621494"]]',
        ],
      },
    ];

    let option;
    demos.forEach(demo => {
      option = new UI.Row();
      option.setClass( 'option' );
      option.setTextContent( demo.name );
      option.onClick( function () {
        demo.seriesKeys.forEach(seriesKey => {
          options.chronicle.seriesOperation({
            chronicle: options.chronicle,
            key: JSON.parse(seriesKey),
            operation: options.requestSeries
          });
        });
      });
      this.menuPanel.add( option );
    });

    // spacer - tests
    this.menuPanel.add( new UI.HorizontalRule() );

    // File -> load from github
    option = new UI.Row();
    option.setClass( 'option' );
    option.setTextContent( 'Load MRHead from NRRD' );
    option.onClick( function () {
      options.loadNRRDFromURL();
    } );
    this.menuPanel.add( option );

    // File -> Slicer Volumes
    option = new UI.Row();
    option.setClass( 'option' );
    option.setTextContent( 'Load volume from Slicer' );
    option.onClick( function () {
      options.loadVolumeFromSlicer();
    } );
    this.menuPanel.add( option );

    option = new UI.Row();
    option.setClass( 'option' );
    option.setTextContent( 'Load all volumes from Slicer' );
    option.onClick( function () {
      options.loadVolumesFromSlicer();
    } );
    this.menuPanel.add( option );

    option = new UI.Row();
    option.setClass( 'option' );
    option.setTextContent( 'Send visible volumes to Slicer' );
    option.onClick( function () {
      options.sendVolumesToSlicer();
    } );
    this.menuPanel.add( option );

    // spacer - tests
    this.menuPanel.add( new UI.HorizontalRule() );

    // File -> Add Fiducials
    option = new UI.Row();
    option.setClass( 'option' );
    option.setTextContent( 'Add 3 Random Fiducials' );
    option.onClick( function () {
      options.addRandomFiducials();
    } );
    this.menuPanel.add( option );

    // File -> Fiducials from Slicer
    option = new UI.Row();
    option.setClass( 'option' );
    option.setTextContent( 'Fiducials from Slicer' );
    option.onClick( function () {
      options.fiducialsFromSlicer();
    } );
    this.menuPanel.add( option );

    // File -> Add Transform
    option = new UI.Row();
    option.setClass( 'option' );
    option.setTextContent( 'Add Transform' );
    option.onClick( function () {
      options.addTransformField();
    } );
    this.menuPanel.add( option );

    // File -> Animate Transform
    option = new UI.Row();
    option.setClass( 'option' );
    option.setTextContent( 'Animate Transform' );
    option.onClick( function () {
      options.animateTransform();
    } );
    this.menuPanel.add( option );

    // spacer - save/clear
    this.menuPanel.add( new UI.HorizontalRule() );
    // File -> Save
    option = new UI.Row();
    option.setClass( 'option' );
    option.setTextContent( 'Save' );
    option.onClick( function () {
      options.save();
    } );
    this.menuPanel.add( option );

    // File -> Clear
    option = new UI.Row();
    option.setClass( 'option' );
    option.setTextContent( 'Clear' );
    option.onClick( function () {
      if ( confirm( 'Any unsaved data will be lost. Are you sure?' ) ) {
        step.generator = null;
        step.renderer.inputFields = [];
        step.renderer.updateProgram();
        step.renderer.requestRender(step.view);
      }
    });
    this.menuPanel.add( option );
  }
}

class stepDatabaseMenu extends MenuPanel {
  constructor(step, options) {
    options = options || {};
    options.requestSeries = options.requestSeries || function(){};
    super(step, {title: 'Database'});
    this.menuPanel.setClass('database');

    // status
    let statusEntry = new UI.Row();
    statusEntry.setClass( 'option' );
    let url = options.chronicle.url;
    statusEntry.setTextContent( `Status: Fetching study list from ${url}...` );
    this.menuPanel.add( statusEntry );

    let studyTableUI = new UI.Table();
    studyTableUI.setId('studyTable');
    this.menuPanel.add( studyTableUI );

    let seriesTableUI = new UI.Table();
    seriesTableUI.setId('seriesTable');
    this.menuPanel.add( seriesTableUI );

    let seriesTable = null;
    let instanceTable = null;
    let studyTable = null;

    //
    // get and display list of studies
    //
    options.chronicle.chronicle.query("instances/context", {
      reduce : true,
      group_level : 2,
      stale : 'update_after',
    }).then(function(data) {
      statusEntry.setTextContent( `${data.rows.length} studies from ${url}...` );
      let studyList = [];
      for (let rowIndex = 0; rowIndex < data.rows.length; rowIndex += 1) {
        let row = data.rows[rowIndex].key;
        let studyEntry = [];
        studyEntry.push(row);
        studyEntry.push(row[0][0]);
        studyEntry.push(row[0][1]);
        studyEntry.push(row[1][0]);
        studyEntry.push(data.rows[rowIndex].value);
        studyList.push(studyEntry);
      };

      if (studyTable) {
        studyTable.destroy();
      }
      studyTable = $('#studyTable').DataTable({
        data : studyList,
        columns : [
          { title: "studyKey" }, // hidden, used for drill down
          { title: "Institution" },
          { title: "Subject" },
          { title: "Description" },
          { title: "Instance Count" },
        ],
        scrollY : "350px",
        scrollCollapse : true,
        paging : true,
        rowID : "StudyUID",
        initComplete : function () {
          let api = this.api();
          api.column(0).visible( false );
          api.$('tr').click( function () {
            let row = api.row(this)[0][0];
            let studyKey = studyTable.data()[row][0];
            showStudy(studyKey);
          });
        },
      });
    }).catch(function (err) {
      console.error(err);
    });

    function showStudy(key) {
      let endKey = key.slice(0);
      endKey.push({});
      options.chronicle.chronicle.query("instances/context", {
        start_key : key,
        end_key : endKey,
        reduce : true,
        group_level : 3,
        stale : 'update_after',
      }).then(function(data) {
        let seriesList = [];
        for (let rowIndex = 0; rowIndex < data.rows.length; rowIndex += 1) {
          let row = data.rows[rowIndex].key;
          let seriesEntry = [];
          seriesEntry.push(row);
          seriesEntry.push(row[2][0]);
          seriesEntry.push(row[2][1]);
          seriesEntry.push(data.rows[rowIndex].value);
          seriesList.push(seriesEntry);
        };

        if (seriesTable) {
          seriesTable.destroy();
        }

        seriesTable = $('#seriesTable').DataTable({
          data : seriesList,
          columns : [
            { title: "seriesKey" }, // hidden, used for drill down
            { title: "Modality" },
            { title: "Description" },
            { title: "Instance Count" },
          ],
          scrollY : "350px",
          scrollCollapse : true,
          paging : false,
          rowID : "StudyUID",
          initComplete : function () {
            let api = this.api();
            api.column(0).visible( false );
            api.$('tr').click( function () {
              let row = api.row(this)[0][0];
              let seriesKey = seriesTable.data()[row][0];
              showSeries(seriesKey);
            });
          },
        });
      }).catch(function (err) {
        console.error(err);
      });
    };

    function showSeries(key) {
      console.log('series', JSON.stringify(key));
      options.chronicle.seriesOperation({
        chronicle: options.chronicle,
        key: key,
        operation: options.requestSeries
      });
    };
  }
}

// Transfer function editor
class stepDisplayMenu extends MenuPanel {
  constructor(step, options) {
    options = options || {};
    options.updateTransferFunction = options.updateTransferFunction || function(){};
    super(step, {title: 'Display'});
    this.menuPanel.setClass('display');

    // TODO:
    // - add field selector
    // - add visibility toggle
    // - populate ui from field
    // - add save and restore presets with preview rendering
    // gradientOpacityScale
    let toolText = new UI.Text('Gradient Opacity: ').setWidth('150px');
    toolText.dom.style.textAlign = 'right';
    this.menuPanel.add(toolText);
    this.gradientOpacityScale = new UI.Number();
    this.gradientOpacityScale.min = 0;
    this.gradientOpacityScale.precision = 6;
    this.gradientOpacityScale.step = .00001;
    if (options.onGradientOpacityScaleChange) {
      this.gradientOpacityScale.onChange(options.onGradientOpacityScaleChange);
    }
    this.gradientOpacityScale.setValue(0.0001);
    this.menuPanel.add( this.gradientOpacityScale );

    // scalar transfer function editor
    let transferFunctionUI = new UI.Span();
    this.menuPanel.add( transferFunctionUI );
    let tfDiv = document.createElement('div');
    tfDiv.style.position = 'relative';
    tfDiv.style.width = '750px';
    tfDiv.style.height = '150px';
    transferFunctionUI.dom.appendChild(tfDiv);
    step.tf = new TF_panel({
      container: tfDiv,
      width: 750,
      height: 150,
      widgets : [{
        controlPoints: [
          {value: 0, alpha: 0, color: {r: 0, g: 0,b: 0}},
          {value: 1, alpha: 1, color: {r: 255, g: 255,b: 255}},
        ],
      }],
    });
    step.tf.registerCallback(options.updateTransferFunction);

    toolText = new UI.Text('Field: ').setWidth('50px');
    toolText.dom.style.textAlign = 'right';
    this.menuPanel.add(toolText);
    this.fieldSelect = new UI.Select().setOptions({
      selectField: "Select a field",
    }).setValue('selectField');
    this.menuPanel.add( this.fieldSelect );
  }

  // TODO:
  populateFieldSelector() {
    let fieldOptions = { selectField: "Select a field" };
    step.renderer.inputFields.forEach(field => {
      fieldOptions[field.id] = field.id;
    });
    this.fieldSelect.setOptions(fieldOptions);
    this.fieldSelect.setValue('selectField');
  }

  selectField(field) {
  }
}

class stepOperationMenu extends MenuPanel {
  constructor(step, options) {
    options = options || {};
    options.performPDE = options.performPDE || function(){};
    options.performGrowCut = options.performGrowCut || function(){};
    super(step, {title: 'Operations'});
    this.options = options;

    let option;

    // Operations -> bilateral
    option = new UI.Row();
    option.setClass( 'option' );
    option.setTextContent( 'Bilateral' );
    option.onClick(this.bilateralPanel.bind(this));
    this.menuPanel.add( option );

    // Operations -> similarity
    option = new UI.Row();
    option.setClass( 'option' );
    option.setTextContent( 'Similarity' );
    option.onClick(this.similarityPanel.bind(this));
    this.menuPanel.add( option );

    // Operations -> gabor
    option = new UI.Row();
    option.setClass( 'option' );
    option.setTextContent( 'Gabor' );
    option.onClick(this.gaborPanel.bind(this));
    this.menuPanel.add( option );

    // Operations -> nonlocalmeans
    option = new UI.Row();
    option.setClass( 'option' );
    option.setTextContent( 'Non-local Means' );
    option.onClick(this.nonlocalmeansPanel.bind(this));
    this.menuPanel.add( option );

    // Operations -> pde
    option = new UI.Row();
    option.setClass( 'option' );
    option.setTextContent( 'PDE' );
    option.onClick(this.pdePanel.bind(this));
    this.menuPanel.add( option );

    // Operations -> GrowCut
    option = new UI.Row();
    option.setClass( 'option' );
    option.setTextContent( 'GrowCut' );
    option.onClick( function () {
      options.performGrowCut();
    } );
    this.menuPanel.add( option );

    // Operations -> Registration
    option = new UI.Row();
    option.setClass( 'option' );
    option.setTextContent( 'Registration' );
    option.onClick( function () {
      options.performRegistration();
    } );
    this.menuPanel.add( option );
  }

  bilateralPanel() {

    this.container = new UI.Panel();
    this.container.setId('bilateralPanel');

    this.bilateralOptions = this.bilateralOptions || {
      sigmaRange : 1000.,
      sigmaSpace : 5.,
      kernelSize : 3,
    };

    // kernel size integer
    this.kernelUI = new UI.Integer();
    this.kernelUI.min = 1;
    this.kernelUI.max = 50;
    this.kernelUI.precision = 1;
    this.kernelUI.step = 1;
    this.kernelUI.unit = "pixels";
    this.container.add( this.kernelUI );
    this.kernelUI.setValue(this.bilateralOptions.kernelSize);

    // space sigma number
    this.sigmaSpaceUI = new UI.Number();
    this.sigmaSpaceUI.min = 0.1;
    this.sigmaSpaceUI.max = 50;
    this.sigmaSpaceUI.precision = 1;
    this.sigmaSpaceUI.step = 0.1;
    this.sigmaSpaceUI.unit = "sigma space";
    this.container.add( this.sigmaSpaceUI );
    this.sigmaSpaceUI.setValue(this.bilateralOptions.sigmaSpace);

    // range sigma number
    this.sigmaRangeUI = new UI.Number();
    this.sigmaRangeUI.value = this.bilateralOptions.sigmaRange;
    this.sigmaRangeUI.min = 0.1;
    this.sigmaRangeUI.max = 5000;
    this.sigmaRangeUI.precision = 1;
    this.sigmaRangeUI.step = 10;
    this.sigmaRangeUI.unit = "sigma range";
    this.container.add( this.sigmaRangeUI );
    this.sigmaRangeUI.setValue(this.bilateralOptions.sigmaRange);

    let apply = function() {
      this.bilateralOptions.kernelSize = this.kernelUI.getValue();
      this.bilateralOptions.sigmaSpace = this.sigmaSpaceUI.getValue();
      this.bilateralOptions.sigmaRange = this.sigmaRangeUI.getValue();
      this.bilateralOptions = this.options.performBilateral(this.bilateralOptions);
    }
    this.applyButton = new UI.Button("Apply");
    this.container.add( this.applyButton );
    this.applyButton.onClick(apply.bind(this));

    let cancel = function() {
      step.ui.sideBar.dom.removeChild(this.container.dom);
    }
    this.cancelButton = new UI.Button("Cancel");
    this.container.add( this.cancelButton );
    this.cancelButton.onClick(cancel.bind(this));

    step.ui.sideBar.dom.appendChild(this.container.dom);
  }

  similarityPanel() {

    this.container = new UI.Panel();
    this.container.setId('similarityPanel');

    this.similarityOptions = this.similarityOptions || {
      referenceTextureCoordinate : [.5, .5, .5],
      rotationSamples : 10,
      kernelSize : 5,
    };

    // kernel size integer
    this.kernelUI = new UI.Integer();
    this.kernelUI.min = 1;
    this.kernelUI.max = 50;
    this.kernelUI.precision = 1;
    this.kernelUI.step = 1;
    this.kernelUI.unit = "pixels";
    this.container.add( this.kernelUI );
    this.kernelUI.setValue(this.similarityOptions.kernelSize);

    // rotationSamples
    this.rotationSamples = new UI.Integer();
    this.rotationSamples.min = 1;
    this.rotationSamples.max = 500;
    this.rotationSamples.precision = 1;
    this.rotationSamples.step = 1;
    this.rotationSamples.unit = "rotation samples";
    this.container.add( this.rotationSamples );
    this.rotationSamples.setValue(this.similarityOptions.rotationSamples);

    let apply = function() {
      this.similarityOptions.kernelSize = this.kernelUI.getValue();
      this.similarityOptions.rotationSamples = this.rotationSamples.getValue();
      this.similarityOptions = this.options.performSimilarity(this.similarityOptions);
    }
    this.applyButton = new UI.Button("Apply");
    this.container.add( this.applyButton );
    this.applyButton.onClick(apply.bind(this));

    let cancel = function() {
      step.ui.sideBar.dom.removeChild(this.container.dom);
    }
    this.cancelButton = new UI.Button("Cancel");
    this.container.add( this.cancelButton );
    this.cancelButton.onClick(cancel.bind(this));

    step.ui.sideBar.dom.appendChild(this.container.dom);
  }

  gaborPanel() {

    this.container = new UI.Panel();
    this.container.setId('gaborPanel');

    this.gaborOptions = this.gaborOptions || {
      sigma : 1,
      frequency : 1,
      phase : 0,
      kernelSize : 5,
    };

    // kernel size integer
    this.kernelUI = new UI.Integer();
    this.kernelUI.min = 1;
    this.kernelUI.max = 50;
    this.kernelUI.precision = 1;
    this.kernelUI.step = 1;
    this.kernelUI.unit = "pixels";
    this.container.add( this.kernelUI );
    this.kernelUI.setValue(this.gaborOptions.kernelSize);

    // space sigma number
    this.sigmaUI = new UI.Number();
    this.sigmaUI.min = 0.001;
    this.sigmaUI.max = 50;
    this.sigmaUI.precision = 3;
    this.sigmaUI.step = 0.001;
    this.sigmaUI.unit = "sigma (pixels)";
    this.container.add( this.sigmaUI );
    this.sigmaUI.setValue(this.gaborOptions.sigma);

    // space frequency number
    this.frequencyUI = new UI.Number();
    this.frequencyUI.min = 0.1;
    this.frequencyUI.max = 50;
    this.frequencyUI.precision = 1;
    this.frequencyUI.step = 0.1;
    this.frequencyUI.unit = "frequency (pixels)";
    this.container.add( this.frequencyUI );
    this.frequencyUI.setValue(this.gaborOptions.frequency);

    // space phase number
    this.phaseUI = new UI.Number();
    this.phaseUI.min = 0;
    this.phaseUI.max = 50;
    this.phaseUI.precision = 1;
    this.phaseUI.step = 0.1;
    this.phaseUI.unit = "phase (pixels)";
    this.container.add( this.phaseUI );
    this.phaseUI.setValue(this.gaborOptions.phase);

    // rotation sample integer
    this.rotationSampleUI = new UI.Integer();
    this.rotationSampleUI.min = 0;
    this.rotationSampleUI.max = 50;
    this.rotationSampleUI.precision = 1;
    this.rotationSampleUI.step = 1;
    this.rotationSampleUI.unit = "index";
    this.container.add( this.rotationSampleUI );
    this.rotationSampleUI.setValue(this.gaborOptions.rotationSample);

    let apply = function() {
      this.gaborOptions.kernelSize = this.kernelUI.getValue();
      this.gaborOptions.sigma = this.sigmaUI.getValue();
      this.gaborOptions.frequency = this.frequencyUI.getValue();
      this.gaborOptions.phase = this.phaseUI.getValue();
      this.gaborOptions.rotationSample = this.rotationSampleUI.getValue();
      this.gaborOptions = this.options.performGabor(this.gaborOptions);
    }
    this.applyButton = new UI.Button("Apply");
    this.container.add( this.applyButton );
    this.applyButton.onClick(apply.bind(this));

    let cancel = function() {
      step.ui.sideBar.dom.removeChild(this.container.dom);
    }
    this.cancelButton = new UI.Button("Cancel");
    this.container.add( this.cancelButton );
    this.cancelButton.onClick(cancel.bind(this));

    step.ui.sideBar.dom.appendChild(this.container.dom);
  }

  nonlocalmeansPanel() {

    this.container = new UI.Panel();
    this.container.setId('nonlocalmeansPanel');

    this.nonlocalmeansOptions = this.nonlocalmeansOptions || {
      patchRadius : 1,
      searchRadius : 5,
      bandwidth : 10.,
      sigma : .5,
    };

    // Label
    this.labelUI = new UI.Text ( "Non-local Means");
    this.container.add ( this.labelUI );
    // window radius integer
    this.patchUI = new UI.Integer();
    this.patchUI.min = 1;
    this.patchUI.max = 50;
    this.patchUI.precision = 1;
    this.patchUI.step = 1;
    this.patchUI.unit = "patch radius (pixels)";
    this.container.add( this.patchUI );
    this.patchUI.setValue(this.nonlocalmeansOptions.patchRadius);

    // search radius integer
    this.searchUI = new UI.Integer();
    this.searchUI.min = 1;
    this.searchUI.max = 50;
    this.searchUI.precision = 1;
    this.searchUI.step = 1;
    this.searchUI.unit = "search radius (pixels)";
    this.container.add( this.searchUI );
    this.searchUI.setValue(this.nonlocalmeansOptions.searchRadius);

    // space sigma number
    this.sigmaUI = new UI.Number();
    this.sigmaUI.min = 0.1;
    this.sigmaUI.max = 50;
    this.sigmaUI.precision = 1;
    this.sigmaUI.step = 0.1;
    this.sigmaUI.unit = "sigma (pixels)";
    this.container.add( this.sigmaUI );
    this.sigmaUI.setValue(this.nonlocalmeansOptions.sigma);

    // bandwidth number
    this.bandwidthUI = new UI.Number();
    this.bandwidthUI.value = this.nonlocalmeansOptions.bandwidth;
    this.bandwidthUI.min = 0.1;
    this.bandwidthUI.max = 50;
    this.bandwidthUI.precision = .1;
    this.bandwidthUI.step = 1;
    this.bandwidthUI.unit = "bandwidth (unitless)";
    this.container.add( this.bandwidthUI );
    this.bandwidthUI.setValue(this.nonlocalmeansOptions.bandwidth);

    let apply = function() {
      this.nonlocalmeansOptions.patchRadius = this.patchUI.getValue();
      this.nonlocalmeansOptions.searchRadius = this.searchUI.getValue();
      this.nonlocalmeansOptions.sigma = this.sigmaUI.getValue();
      this.nonlocalmeansOptions.bandwidth = this.bandwidthUI.getValue();
      this.nonlocalmeansOptions = this.options.performNonlocalmeans(this.nonlocalmeansOptions);
    }
    this.applyButton = new UI.Button("Apply");
    this.container.add( this.applyButton );
    this.applyButton.onClick(apply.bind(this));

    let cancel = function() {
      step.ui.sideBar.dom.removeChild(this.container.dom);
    }
    this.cancelButton = new UI.Button("Cancel");
    this.container.add( this.cancelButton );
    this.cancelButton.onClick(cancel.bind(this));

    step.ui.sideBar.dom.appendChild(this.container.dom);
  }

  pdePanel() {

    this.container = new UI.Panel();
    this.container.setId('pdePanel');

    this.pdeOptions = this.pdeOptions || {
      edgeWeight : 1.,
      deltaT : 1.,
      iterations : 100.,
    };

    // TODO: refactor out common ui elements of this and bilateral cli-style
    // edgeWeight number
    this.edgeWeightUI = new UI.Number();
    this.edgeWeightUI.min = 0.01;
    this.edgeWeightUI.max = 50;
    this.edgeWeightUI.precision = 2;
    this.edgeWeightUI.step = 0.1;
    this.edgeWeightUI.unit = "edge weight";
    this.container.add( this.edgeWeightUI );
    this.edgeWeightUI.setValue(this.pdeOptions.edgeWeight);

    // deltaT number
    this.deltaTUI = new UI.Number();
    this.deltaTUI.min = 0.1;
    this.deltaTUI.max = 50;
    this.deltaTUI.precision = 1;
    this.deltaTUI.step = 0.1;
    this.deltaTUI.unit = "deltaT";
    this.container.add( this.deltaTUI );
    this.deltaTUI.setValue(this.pdeOptions.deltaT);

    // iterations size integer
    this.iterationsUI = new UI.Integer();
    this.iterationsUI.min = 1;
    this.iterationsUI.max = 500;
    this.iterationsUI.precision = 1;
    this.iterationsUI.step = 1;
    this.iterationsUI.unit = "iterations";
    this.container.add( this.iterationsUI );
    this.iterationsUI.setValue(this.pdeOptions.iterations);

    let apply = function() {
      console.log(this);
      this.pdeOptions.edgeWeight = this.edgeWeightUI.getValue();
      this.pdeOptions.deltaT = this.deltaTUI.getValue();
      this.pdeOptions.iterations = this.iterationsUI.getValue();
      this.pdeOptions = this.options.performPDE(this.pdeOptions);
    }
    this.applyButton = new UI.Button("Apply");
    this.container.add( this.applyButton );
    this.applyButton.onClick(apply.bind(this));

    let cancel = function() {
      step.ui.sideBar.dom.removeChild(this.container.dom);
    }
    this.cancelButton = new UI.Button("Cancel");
    this.container.add( this.cancelButton );
    this.cancelButton.onClick(cancel.bind(this));

    step.ui.sideBar.dom.appendChild(this.container.dom);
  }
}

class stepViewMenu extends MenuPanel {
  constructor(step, options) {
    options = options || {};
    super(step, {title: 'View'});
    this.options = options;

    let option;

    ['Axial', 'Sagittal', 'Coronal'].forEach(view => {
      option = new UI.Row();
      option.setClass( 'option' );
      option.setTextContent( view );
      option.onClick(() => {
        step.view.slice({plane: view.toLowerCase(), offset: 0.5, thickness: 1});
        step.uniforms.sliceMode.value = 1;
        step.renderer.requestRender(step.view);
      });
      this.menuPanel.add( option );
    });

    option = new UI.Row();
    option.setClass( 'option' );
    option.setTextContent( 'Volume' );
    option.onClick(() => {
      step.view.viewNear = 0;
      step.view.viewFar = Linear.LARGE_NUMBER;
      step.uniforms.sliceMode.value = 0;
      step.renderer.requestRender(step.view);
    });
    this.menuPanel.add( option );

    // spacer
    this.menuPanel.add( new UI.HorizontalRule() );

    option = new UI.Row();
    option.setClass( 'option' );
    option.setTextContent( 'Ray Integration' );
    option.onClick(() => {
      step.renderer.rayCompositing = 'integration';
      step.renderer.updateProgram();
      step.renderer.requestRender(step.view);
    });
    this.menuPanel.add( option );

    option = new UI.Row();
    option.setClass( 'option' );
    option.setTextContent( 'Ray Maximum' );
    option.onClick(() => {
      step.renderer.rayCompositing = 'maximum';
      step.renderer.updateProgram();
      step.renderer.requestRender(step.view);
    });
    this.menuPanel.add( option );

  }
}

class stepAboutMenu extends MenuPanel {
  constructor(step, options) {
    options = options || {};
    super(step, {title: 'About'});
    this.options = options;

    let option;

    option = new UI.Row();
    option.setClass( 'option' );
    option.setTextContent('This is a very experimental implementation of image viewing and manipulation using WebGL 2.0.' );
    this.menuPanel.add( option );
  }
}

class stepSideBar extends UIItem {
  constructor(step, options) {
    options = options || {};
    super(step);
    this.container = new UI.CollapsiblePanel();
    this.container.setId('sideBar');

    let histogramUI = new UI.Panel();
    histogramUI.setId('displayPanel');
    this.container.add( histogramUI );

    let histogram = document.createElement('canvas');
    histogram.width = 150;
    histogram.height = 128;
    histogram.id = 'histogram';
    histogramUI.dom.appendChild(histogram);

    let context = histogram.getContext('2d');
    context.fillStyle = 'black';
    context.fillRect(0, 0, histogram.width, histogram.height);
  }

  drawHistogram() {
    let imageField = step.controls.selectedImageField();
    if (!imageField) {
      return;
    }

    if (imageField != this.currentImageField) {
      this.imageStatistics = imageField.statistics();
      this.currentImageField = imageField;
    }

    let context = histogram.getContext('2d');
    context.fillStyle = 'black';
    context.fillRect(0, 0, histogram.width, histogram.height);
    context.lineWidth =1;
    context.strokeStyle = 'rgb(128,128,128)';
    context.beginPath();
    let xScale = this.imageStatistics.bins / histogram.width;
    let yScale = histogram.height * .8 / this.imageStatistics.maxBinValue;
    for(let bin = 0; bin < this.imageStatistics.bins; bin++) {
      context.moveTo(xScale * bin, histogram.height);
      context.lineTo(xScale * bin,
                     histogram.height - yScale * this.imageStatistics.histogram[bin]);
    }
    context.stroke();

    context.fillStyle = 'rgba(128,128,0,0.7)';
    let range = this.imageStatistics.range;
    let valueScale = histogram.width / (range.max - range.min);
    let halfWidth = imageField.windowWidth / 2.;
    let x = valueScale * (imageField.windowCenter - halfWidth - range.min);
    let width = valueScale * imageField.windowWidth;
    context.fillRect(x, 0, width, histogram.height);
  }
}

class stepBottomBar extends UIItem {
  constructor(step, options) {
    options = options || {};
    super(step);
    this.container = new UI.Panel();
    this.container.setId('bottomBar');

    // offset number
    this.sliceOffsetUI = new UI.Number();
    this.sliceOffsetUI.value = .5;
    this.sliceOffsetUI.min = 0;
    this.sliceOffsetUI.max = 1;
    this.sliceOffsetUI.precision = 2;
    this.sliceOffsetUI.step = .25;
    this.sliceOffsetUI.unit = "offset";

    if (options.onSliceOffetChange) {
      this.sliceOffsetUI.onChange(options.onSliceOffetChange);
    }

    this.container.add( this.sliceOffsetUI );

    // tool select
    this.toolText = new UI.Text('Tool:').setWidth('50px');
    this.toolText.dom.style.textAlign = 'right';
    this.container.add(this.toolText);
    this.toolSelectUI = new UI.Select().setOptions({
      windowLevel: "Window/Level",
      trackball: "Trackball",
      /* paint: "Paint", */
    }).setValue('windowLevel');
    this.container.add( this.toolSelectUI );

    this.progressTextUI = new UI.Text('');
    this.progressTextUI.dom.style.textAlign = 'right';
    this.container.add(this.progressTextUI);
  }

  get sliceOffset() {
    return this.sliceOffsetUI.getValue();
  }
  set sliceOffset(value) {
    this.sliceOffsetUI.setValue(value);
  }

  get progress() {
    return this.progressTextUI.getValue();
  }

  set progress(text) {
    this.progressTextUI.setValue(text);
    this.dom.style.opacity = 1;
    let restoreProgress = function() {
      this.progressTextUI.setValue('');
      this.dom.removeAttribute('style');
    };
    clearTimeout(this.progressTimeout);
    this.progressTimeout = setTimeout(restoreProgress.bind(this), 2000);
  }
}
