import React, { useState, useEffect } from "react";
import People from "./components/People";
import PersonForm from "./components/PersonForm";
import Filter from "./components/Filter";
import PersonService from "./services/personService";
import Notification from "./components/Notification";
import "./App.css";

const App = () => {
  const [persons, setPersons] = useState([]);
  const [newName, setNewName] = useState("");
  const [newNumber, setNewNumber] = useState("");
  const [filterValue, setFilterValue] = useState("");
  const [notificationMessage, setNotificationMessage] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  useEffect(() => {
    PersonService.getAll()
      .then((response) => setPersons(response.data))
      .catch((err) => console.log("something went wrong app useEffect ", err));
  }, []);

  useEffect(() => {
    setTimeout(() => {
      setErrorMessage(null);
      setNotificationMessage(null);
    }, 5000);
  }, [notificationMessage, errorMessage]);

  const addName = (e) => {
    e.preventDefault();
    const names = [];
    const nameObject = {
      name: newName.trim(),
      number: newNumber.trim(),
    };

    persons.forEach((person) => names.push(person.name));

    if (newName === "") {
      return;
    }

    const existingPerson = persons.some((person) => person.name === newName);
    if (existingPerson) {
      const newPerson = persons.find((person) => person.name === newName);

      const newDetails = { ...newPerson, number: newNumber };
      const id = newDetails.id;

      const confirmUpdate = window.confirm(
        `${newName} has already been added to phonebook, update number?`
      );

      if (confirmUpdate) {
        PersonService.update(id, newDetails)
          .then((responsePerson) => {
            if (responsePerson !== undefined) {
              setPersons(
                persons.map((person) =>
                  person.id !== id ? person : responsePerson
                )
              );
              setNotificationMessage(
                `The number of ${newName} has been updated!`
              );
            }
          })
          .catch((err) => {
            console.log(err);
            setErrorMessage(err.response.data.error);
          });
      }
      return;
    }

    PersonService.addPerson(nameObject)
      .then((newPerson) => {
        setPersons(persons.concat(newPerson));
        setNotificationMessage(
          `Person ${nameObject.name} has been added to the Phonebook`
        );
      })
      .catch((error) => {
        setErrorMessage(error.response.data.error);
      });

    setNewName("");
    setNewNumber("");
  };

  const handleNameChange = (e) => {
    setNewName(e.target.value);
  };
  const handleNumberChange = (e) => {
    setNewNumber(e.target.value);
  };
  const handleFilterValueChange = (e) => {
    setFilterValue(e.target.value);
  };

  const deletePerson = (id) => {
    const deleted = persons.find((person) => person.id === id);

    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${deleted.name}?`
    );
    if (confirmDelete) {
      PersonService.deletePerson(id)
        .then(() => {
          const updatedList = persons.filter((person) => person.id !== id);
          setPersons(updatedList);
          setNotificationMessage(
            `Person ${deleted.name} has been deleted from the Phonebook`
          );
          setTimeout(() => {
            setNotificationMessage(null);
          }, 5000);
        })
        .catch((err) => {
          console.log(err);
          setErrorMessage(
            `Person ${deleted.name} has already been deleted from server`
          );
          setTimeout(() => {
            setErrorMessage(null);
          }, 5000);
          setPersons(persons.filter((p) => p.id !== id));
        });
    }
  };

  const FilteredPeople = persons.filter((people) =>
    people.name.toLowerCase().includes(filterValue.toLowerCase())
  );

  const error = "error";
  return (
    <div>
      <h1>Phonebook</h1>
      {notificationMessage && <Notification message={notificationMessage} />}
      {errorMessage && (
        <Notification message={errorMessage} className={error} />
      )}
      <Filter
        handleFilterValueChange={handleFilterValueChange}
        filterValue={filterValue}
      />

      <h3>add a new contact</h3>
      <PersonForm
        handleNameChange={handleNameChange}
        handleNumberChange={handleNumberChange}
        addName={addName}
        newName={newName}
        newNumber={newNumber}
      />

      <h2>Numbers</h2>
      <People persons={FilteredPeople} deletePerson={deletePerson} />
    </div>
  );
};

export default App;
