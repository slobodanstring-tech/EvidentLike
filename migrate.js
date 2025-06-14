// migrate.js
const mongoose = require('mongoose');
const Client = require('./models/client');
const Customer = require('./models/customer');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Povezan sa MongoDB');

    try {
      // Pronađi sve jedinstvene klijente po imenu
      const clients = await Client.find().distinct('name');
      console.log('Pronađeni klijenti:', clients);

      // Kreiraj Customer za svakog klijenta
      for (const name of clients) {
        const existingCustomer = await Customer.findOne({ full_name: name });
        if (!existingCustomer) {
          const customer = new Customer({ full_name: name, phone: '' });
          await customer.save();
          console.log(`Kreiran klijent: ${name}`);
        }
      }

      // Ažuriraj Client dokumente sa customer_id
      const clientsToUpdate = await Client.find();
      for (const client of clientsToUpdate) {
        if (!client.customer_id) {
          const customer = await Customer.findOne({ full_name: client.name });
          if (customer) {
            client.customer_id = customer._id;
            await client.save();
            console.log(`Ažuriran client ${client._id} sa customer_id: ${customer._id}`);
          }
        }
      }

      console.log('Migracija završena');
      mongoose.disconnect();
    } catch (err) {
      console.error('Greška pri migraciji:', err);
      mongoose.disconnect();
    }
  })
  .catch((err) => console.error('Greška pri povezivanju:', err));