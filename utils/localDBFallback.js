import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '..', 'data');

// Create local storage folder if it doesn't exist
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const getFile = (modelName) => path.join(DATA_DIR, `${modelName.toLowerCase()}s.json`);

const readData = (modelName) => {
  const file = getFile(modelName);
  if (!fs.existsSync(file)) return [];
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (err) {
    return [];
  }
};

const writeData = (modelName, data) => {
  const file = getFile(modelName);
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
};

// Chained query simulator to support .select(), .sort(), .limit(), and .populate()
class MockQuery {
  constructor(promise) {
    this.promise = Promise.resolve(promise);
  }
  
  then(resolve, reject) {
    return this.promise.then(resolve, reject);
  }
  
  select() {
    return this; 
  }
  
  sort(arg) {
    this.promise = this.promise.then(data => {
      if (Array.isArray(data)) {
        return [...data].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      }
      return data;
    });
    return this;
  }
  
  limit(n) {
    this.promise = this.promise.then(data => {
      if (Array.isArray(data)) {
        return data.slice(0, n);
      }
      return data;
    });
    return this;
  }
  
  populate() {
    return this; 
  }
}

// Override primary static methods on Mongoose Model class
export const setupMongooseMock = () => {
  console.log('------------------------------------------------------------');
  console.log('⚠️  DATABASE FALLBACK ACTIVE: Running in JSON File-Database Mode.');
  console.log(`📁 Saving data to local files in: ${DATA_DIR}`);
  console.log('------------------------------------------------------------');

  // Disable default Mongoose command buffering so it doesn't hang
  mongoose.set('bufferCommands', false);

  // Model.findOne
  mongoose.Model.findOne = function(query = {}) {
    const modelName = this.modelName;
    const data = readData(modelName);
    const result = data.find(item => matchQuery(item, query));
    const doc = result ? createDocInstance(this, result) : null;
    return new MockQuery(doc);
  };

  // Model.findById
  mongoose.Model.findById = function(id) {
    const modelName = this.modelName;
    const data = readData(modelName);
    const result = data.find(item => String(item._id) === String(id));
    const doc = result ? createDocInstance(this, result) : null;
    return new MockQuery(doc);
  };

  // Model.find
  mongoose.Model.find = function(query = {}) {
    const modelName = this.modelName;
    const data = readData(modelName);
    const filtered = data.filter(item => matchQuery(item, query));
    const docs = filtered.map(item => createDocInstance(this, item));
    return new MockQuery(docs);
  };

  // Model.create
  mongoose.Model.create = async function(docData) {
    const modelName = this.modelName;
    const data = readData(modelName);
    
    const newDoc = {
      _id: Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...docData
    };

    // Trigger pre-save password encryption hook for Users
    if (modelName === 'User' && newDoc.password) {
      const salt = await bcrypt.genSalt(10);
      newDoc.password = await bcrypt.hash(newDoc.password, salt);
    }

    data.push(newDoc);
    writeData(modelName, data);
    return createDocInstance(this, newDoc);
  };

  // Model.deleteOne
  mongoose.Model.deleteOne = function(query = {}) {
    const modelName = this.modelName;
    let data = readData(modelName);
    const index = data.findIndex(item => matchQuery(item, query));
    if (index !== -1) {
      data.splice(index, 1);
      writeData(modelName, data);
    }
    return new MockQuery({ deletedCount: index !== -1 ? 1 : 0 });
  };

  // Model.deleteMany
  mongoose.Model.deleteMany = function(query = {}) {
    const modelName = this.modelName;
    let data = readData(modelName);
    const originalCount = data.length;
    data = data.filter(item => !matchQuery(item, query));
    writeData(modelName, data);
    return new MockQuery({ deletedCount: originalCount - data.length });
  };

  // Model.findByIdAndDelete
  mongoose.Model.findByIdAndDelete = function(id) {
    const modelName = this.modelName;
    const data = readData(modelName);
    const index = data.findIndex(item => String(item._id) === String(id));
    let deleted = null;
    if (index !== -1) {
      deleted = data.splice(index, 1)[0];
      writeData(modelName, data);
    }
    return new MockQuery(deleted);
  };

  // Model.findByIdAndUpdate
  mongoose.Model.findByIdAndUpdate = function(id, update, options = {}) {
    const modelName = this.modelName;
    const data = readData(modelName);
    const index = data.findIndex(item => String(item._id) === String(id));
    if (index !== -1) {
      const updated = {
        ...data[index],
        ...update,
        updatedAt: new Date().toISOString()
      };
      data[index] = updated;
      writeData(modelName, data);
      return new MockQuery(createDocInstance(this, updated));
    }
    return new MockQuery(null);
  };

  // Model.countDocuments
  mongoose.Model.countDocuments = function(query = {}) {
    const modelName = this.modelName;
    const data = readData(modelName);
    const count = data.filter(item => matchQuery(item, query)).length;
    return new MockQuery(count);
  };
};

// Match simple query properties (like user ID or email)
const matchQuery = (item, query) => {
  for (const key in query) {
    if (query[key] && typeof query[key] === 'object' && query[key].$regex) {
      const val = item[key] || '';
      const regex = query[key].$regex;
      const flags = query[key].$options || '';
      if (!new RegExp(regex, flags).test(val)) return false;
      continue;
    }
    if (query[key] && typeof query[key] === 'object' && query[key].$gt) {
      const val = new Date(item[key]);
      const check = new Date(query[key].$gt);
      if (!(val > check)) return false;
      continue;
    }
    if (String(item[key]) !== String(query[key])) return false;
  }
  return true;
};

// Wrap document results to inject instance methods (.save() and password matches)
const createDocInstance = (model, dataItem) => {
  const doc = { ...dataItem };
  
  doc.save = async function() {
    const modelName = model.modelName;
    const data = readData(modelName);
    const index = data.findIndex(item => String(item._id) === String(doc._id));
    
    // Hash password if User doc and password changed
    if (modelName === 'User' && doc.password && (!data[index] || data[index].password !== doc.password)) {
      if (!doc.password.startsWith('$2a$')) {
        const salt = await bcrypt.genSalt(10);
        doc.password = await bcrypt.hash(doc.password, salt);
      }
    }

    doc.updatedAt = new Date().toISOString();

    if (index !== -1) {
      data[index] = { ...doc };
    } else {
      data.push({ ...doc });
    }
    
    writeData(modelName, data);
    return doc;
  };

  if (model.modelName === 'User') {
    doc.matchPassword = async function(enteredPassword) {
      return await bcrypt.compare(enteredPassword, this.password);
    };
  }

  return doc;
};
