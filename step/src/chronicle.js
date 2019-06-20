//
// this class handles routine interactions with chronicle's dicom context views
//
class Chronicle {
  constructor(options={}) {
    this.url = options.url || 'http://quantome.org:5984/chronicle';
    this.chronicle = new PouchDB(this.url);
  }

  seriesOperation(options) {
    let chronicle = this.chronicle;
    let endKey = options.key.slice(0);
    endKey.push({});
    chronicle.query("instances/context", {
      start_key : options.key,
      end_key : endKey,
      reduce : true,
      group_level : 4,
      stale : 'update_after',
    }).then(function(data) {
      let instanceURLs = [];
      for (let rowIndex = 0; rowIndex < data.rows.length; rowIndex += 1) {
        let row = data.rows[rowIndex].key;
        let instanceUID = row[3];
        let instanceURL = chronicle._db_name + "/" + instanceUID + '/object.dcm';
        instanceURLs.push(instanceURL);
      };
      options.operation(instanceURLs);
    }).catch(function (err) {
      console.error(err);
    });
  }

  /* examples:
    step.chronicle.tagValueOperation({ tag: "Modality", value: "SR", operation: console.log, })
    step.chronicle.tagValueOperation({ tag: "SOPClassUID", value: "ComprehensiveSR", operation: console.log, })
  */
  tagValueOperation(options) {
    let chronicle = this.chronicle;
    let name = DicomMetaDictionary.denaturalizeName(options.tag);
    let tagEntry = DicomMetaDictionary.nameMap[name];
    let keyTag = DicomMetaDictionary.unpunctuateTag(tagEntry.tag);
    let value = DicomMetaDictionary.denaturalizeValue(options.value)[0];
    let startKey = [keyTag, value];
    let endKey = startKey.slice(0);
    endKey.push({});
    chronicle.query("tags/byTagAndValue", {
      start_key : startKey,
      end_key : endKey,
      reduce : false,
      stale : 'update_after',
    }).then(function(data) {
      let instanceURLs = [];
      for (let rowIndex = 0; rowIndex < data.rows.length; rowIndex += 1) {
        let row = data.rows[rowIndex];
        let instanceUID = row.id;
        let instanceURL = chronicle._db_name + "/" + instanceUID + '/object.dcm';
        instanceURLs.push(instanceURL);
      };
      options.operation(instanceURLs);
    }).catch(function (err) {
      console.error(err);
    });
  }
}


//
// Uses the operations database to manage requests for
// performance of operations
//
class OperationHandler {
  constructor(payload) {
    this.payload = payload;
  }

  getNRRD(url) {
    return new Promise(function(resolve,reject) {
      let getRequest = new XMLHttpRequest();
      getRequest.responseType = "arraybuffer";
      getRequest.onload = function (event) {
        let nrrd = NRRD.parse(event.target.response);
        resolve(nrrd);
      };
      getRequest.onerror = function () {
        reject({
          status: this.status,
          statusText: getRequest.statusText
        });
      };
      getRequest.open("GET", url, true);
      getRequest.send(null);
    });
  }

  getInputData() {
    throw "getInputData should be overridden by the extending class"
  }

  perform() {
    throw "perform should be overridden by the extending class"
  }

  postOutputData() {
    // single output nrrd n resultArrayBuffer to url
    let payload = this.payload;
    return new Promise(function(resolve,reject) {
      let postRequest = new XMLHttpRequest();
      postRequest.responseType = "json";
      postRequest.onload = function (event) {
        resolve(Date(), 'response', postRequest.response);
      };
      postRequest.onerror = function () {
        reject({
          status: this.status,
          statusText: getRequest.statusText
        });
      };
      console.log('Posting');
      postRequest.open("POST", payload.prov.outputData.url, true);
      postRequest.send(new Uint8Array(payload.resultArrayBuffer));
    });
  }

  handle() {
    this.getInputData()
    .then(this.perform.bind(this))
    .then(this.postOutputData.bind(this))
    .then(console.log)
    .catch( error => {
      console.log('Something went wrong...', error);
    });
    return(`${this.constructor.name} requested`);
  }
}

class FilterHandler extends OperationHandler {

  constructor(payload) {
    super(payload);
  }

  getInputData() {
    let self = this;
    return new Promise(function(resolve,reject) {
      self.getNRRD(self.payload.prov.inputData.url)
      .then((nrrd) => {
        self.payload.nrrd = nrrd;
        resolve();
      });
    });
  }

  nrrdPerformFilter(nrrd) {
    let options = {};
    let dataset = NRRD.nrrdToDICOMDataset(nrrd);
    options.filterField = Field.fromDataset(dataset)[0];

    options = this.filterFunction(options);

    // TODO: possibly changed nrrd header
    nrrd.data = new Uint16Array(options.derivedField0.generatedPixelData);
  }

  perform() {
    let payload =  this.payload;
    let executor = function(resolve,reject) {
      this.nrrdPerformFilter(payload.nrrd);
      payload.resultArrayBuffer = NRRD.format(payload.nrrd);
      resolve(payload);
    }
    return new Promise(executor.bind(this));
  }
}

class BilateralHandler extends FilterHandler {
  constructor(payload) {
    super(payload);
    this.filterFunction = performBilateral; // globally defined
  }
}

class SimilarityHandler extends FilterHandler {
  constructor(payload) {
    super(payload);
    this.filterFunction = performSimilarity; // globally defined
  }
}

class GrowCutHandler extends OperationHandler {

  getInputData() {
    // resolve when both nrrd datasets have arrived
    let self = this;
    return new Promise(function(resolve,reject) {
      self.payload.backgroundNRRD = undefined;
      self.payload.labelMapNRRD = undefined;
      self.getNRRD(self.payload.prov.inputData.backgroundURL)
      .then((nrrd) => {
        self.payload.backgroundNRRD = nrrd;
        if (self.payload.labelMapNRRD) {
          resolve();
        }
      });
      self.getNRRD(self.payload.prov.inputData.labelMapURL)
      .then((nrrd) => {
        self.payload.labelMapNRRD = nrrd;
        if (self.payload.backgroundNRRD) {
          resolve();
        }
      });
    });
  }

  perform() {
    let self = this;
    return new Promise(function(resolve,reject) {
      let backgroundDataset = NRRD.nrrdToDICOMDataset(self.payload.backgroundNRRD);
      let backgroundField = Field.fromDataset(backgroundDataset)[0];
      step.renderer.inputFields.push(backgroundField);
      let labelMapDataset = NRRD.nrrdToDICOMDataset(self.payload.labelMapNRRD);
      let labelMapField = Field.fromDataset(labelMapDataset)[0];
      step.renderer.inputFields.push(labelMapField);
      step.renderer.requestRender(step.view);

      let iterations = self.payload.prov.inputData.iterations;
      let growCutGenerator = new GrowCutGenerator({
        gl: step.renderer.gl,
      });
      performGrowCut(growCutGenerator, backgroundField, labelMapField, iterations);

      let result = growCutGenerator.outputFields[0].generatedPixelData;
      self.payload.labelMapNRRD.data = new Uint16Array(result);
      self.payload.resultArrayBuffer = NRRD.format(self.payload.labelMapNRRD);
      resolve();
    });
  }
}

class OperationPerformer {

  constructor(options={}) {
    this.dbURL = options.dbURL || 'http://localhost:5984/operations';

    this.operations = {
      'bilateral': BilateralHandler,
      'similarity': SimilarityHandler,
      'growcut': GrowCutHandler,
      // TODO: add operation handlers from options
    };

    this.operationsDB = new PouchDB(this.dbURL);
    this.operationsDB.changes({
      live: true,
      include_docs: true,
      since: 'now',
    }).on('change', (changeDoc) => {
      if (this.canHandleOperation(changeDoc.doc)) {
        changeDoc.doc.status = 'working'; // grab the request
        this.operationsDB.put(changeDoc.doc)
        .then(() => {
          let desiredProvenance = changeDoc.doc.desiredProvenance;
          let result = this.handleOperation(changeDoc.doc);
          console.log(result);
          this.operationsDB.get(changeDoc.doc._id)
          .then((doc) => {
            doc.status = 'closed';
            doc.result = result;
            this.operationsDB.put(doc)
            .catch((error) => {
              console.log('Could not put result to the operationsDB', error);
            });
          });
        })
        .catch((error) => {
          console.log('Could not handle operation', error);
        });
      }
    }).on('complete', (info) => {
      console.log ('Database connection canceled', info);
    }).on('error', (err) => {
      console.log ('Database connection error', err);
    });
  }

  canHandleOperation(operation) {
    let prov = operation.desiredProvenance;
    if (operation.type == 'ch.step'
        && operation.status == 'open'
        && prov
        && prov.application == "step"
        && prov.operation in this.operations) {
      return(true);
    } else {
      console.log(`Skipping step that doesn't apply`);
      return(false);
    }
  }

  handleOperation(doc) {
    let prov = doc.desiredProvenance;
    let operation = prov.operation;
    let handler = new this.operations[operation]({prov});
    return(handler.handle());
  }

  testOperations(operationsDB) {

    let similarityOperationsDoc = {
      type: "ch.step",
      status: "open",
      desiredProvenance: {
        application: "step",
        operation: "similarity",
        inputData: {
          url: "http://localhost:2016/slicer/volume?id=MRHead"
        },
        outputData: {
          url: "http://localhost:2016/slicer/volume?id=MRHead-filtered"
        },
      }
    };

    let growcutOperationsDoc = {
      type: "ch.step",
      status: "open",
      desiredProvenance: {
        application: "step",
        operation: "growcut",
        inputData: {
          iterations: 500,
          backgroundURL: "http://localhost:2016/slicer/volume?id=MRHead",
          labelMapURL: "http://localhost:2016/slicer/volume?id=MRHead-label"
        },
        outputData: {
          url: "http://localhost:2016/slicer/volume?id=MRHead-label-growcut"
        },
      }
    };

    //this.operationsDB.post(growcutOperationsDoc);
    this.operationsDB.post(similarityOperationsDoc);
  }
}
