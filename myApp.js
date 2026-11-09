'use strict';

const mongoose = require('mongoose');
require('dotenv').config();

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/persons';

const connectToDatabase = () => {
  // The checkpoint uses the legacy options syntax. Newer MongoDB drivers reject those
  // options, so we retry without them when the first connection attempt fails.
  mongoose
    .connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .catch((error) => {
      console.warn('Falling back to the modern MongoDB connection options:', error.message);
      return mongoose.connect(mongoURI);
    })
    .catch((connectError) => {
      console.error('MongoDB connection error:', connectError.message);
    });

  mongoose.connection.on('error', (error) => {
    console.error('MongoDB connection error:', error.message);
  });
};

connectToDatabase();

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  age: Number,
  favoriteFoods: {
    type: [String],
    default: [],
  },
});

const Person = mongoose.model('Person', personSchema);

// Create and save one person document.
const createAndSavePerson = (done) => {
  const person = new Person({
    name: 'John',
    age: 30,
    favoriteFoods: ['pizza', 'pasta'],
  });

  person.save((err, data) => {
    if (err) {
      return done(err);
    }

    done(null, data);
  });
};

// Create multiple people documents in one operation.
const createManyPeople = (arrayOfPeople, done) => {
  Person.create(arrayOfPeople, (err, people) => {
    if (err) {
      return done(err);
    }

    done(null, people);
  });
};

// Find all people with a specific name.
const findPeopleByName = (personName, done) => {
  Person.find({ name: personName }, (err, people) => {
    if (err) {
      return done(err);
    }

    done(null, people);
  });
};

// Find one person who has a given favorite food.
const findOneByFood = (food, done) => {
  Person.findOne({ favoriteFoods: food }, (err, person) => {
    if (err) {
      return done(err);
    }

    done(null, person);
  });
};

// Find one person by their _id.
const findPersonById = (personId, done) => {
  Person.findById(personId, (err, person) => {
    if (err) {
      return done(err);
    }

    done(null, person);
  });
};

// Find a person, update favoriteFoods, and save it.
const findEditThenSave = (personId, done) => {
  Person.findById(personId, (err, person) => {
    if (err) {
      return done(err);
    }

    person.favoriteFoods.push('hamburger');

    person.save((saveErr, updatedPerson) => {
      if (saveErr) {
        return done(saveErr);
      }

      done(null, updatedPerson);
    });
  });
};

// Find one person by name and update their age to 20.
const findAndUpdate = (personName, done) => {
  Person.findOneAndUpdate(
    { name: personName },
    { age: 20 },
    { new: true },
    (err, updatedPerson) => {
      if (err) {
        return done(err);
      }

      done(null, updatedPerson);
    }
  );
};

// Delete one person by _id.
const removeById = (personId, done) => {
  Person.findByIdAndRemove(personId, (err, removedPerson) => {
    if (err) {
      return done(err);
    }

    done(null, removedPerson);
  });
};

// Delete all people named Mary.
const removeManyPeople = (done) => {
  Person.remove({ name: 'Mary' }, (err, result) => {
    if (err) {
      return done(err);
    }

    done(null, result);
  });
};

// Find burrito lovers, sort, limit, hide age, and execute.
const queryChain = (done) => {
  Person.find({ favoriteFoods: 'burrito' })
    .sort({ name: 1 })
    .limit(2)
    .select({ age: 0 })
    .exec((err, data) => {
      if (err) {
        return done(err);
      }

      done(null, data);
    });
};

module.exports = {
  Person,
  createAndSavePerson,
  createManyPeople,
  findPeopleByName,
  findOneByFood,
  findPersonById,
  findEditThenSave,
  findAndUpdate,
  removeById,
  removeManyPeople,
  queryChain,
};
