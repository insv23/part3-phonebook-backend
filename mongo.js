const mongoose = require("mongoose");

const personSchema = new mongoose.Schema({
  name: String,
  number: String,
});

const Person = mongoose.model("Person", personSchema);

if (process.argv.length === 3) {
  const password = process.argv[2];
  const dbName = "phonebook";
  const dbUrl = `mongodb+srv://Shrank9895:${password}@cluster0.vledjnd.mongodb.net/${dbName}?retryWrites=true&w=majority&appName=Cluster0`;

  mongoose
    .connect(dbUrl)
    .then(() => {
      console.log("connected to MongoDB");

      console.log("phonebook:");
      Person.find({}).then((result) => {
        result.forEach((person) => {
          console.log(`${person.name} ${person.number}`);
        });
        mongoose.connection.close();
      });
    })
    .catch((error) => {
      console.error("error connecting to MongoDB:", error.message);
    });
} else if (process.argv.length === 5) {
  const password = process.argv[2];
  const name = process.argv[3];
  const number = process.argv[4];
  const dbName = "phonebook";
  const dbUrl = `mongodb+srv://Shrank9895:${password}@cluster0.vledjnd.mongodb.net/${dbName}?retryWrites=true&w=majority&appName=Cluster0`;

    mongoose.connect(dbUrl).then(() => {
        console.log('connected to MongoDB');

        const person = new Person({
            name,
            number,
        });

        person.save().then(result => {
            console.log(`Added ${result.name} number ${result.number} to phonebook`);
            mongoose.connection.close();
        });

    }).catch(error => {
        console.error('error connecting to MongoDB:', error.message);
    });
} else {

    console.log("Please provide the password as an argument: node mongo.js <password> or node mongo.js <password> <name> <number>");
    process.exit(1);
}
