import React from "react";
import "./App.css";
import firebase from "firebase";
import base, { firebaseApp } from "./Base";
import Login from "./login";

class App extends React.Component {
  constructor(props) {
    super(props);
    //setting the state
    this.state = {
      chores: {},
      finChores: {},
      uid: null,
      owner: null
    };
  }

  componentDidMount() {
    this.ref = base.syncState(`localhost:3000/chores`, {
      context: this,
      state: "chores"
    });

    this.ref = base.syncState(`localhost:3000/finChores`, {
      context: this,
      state: "finChores"
    });

    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.authHandler({ user });
      }
    });
  }

  addChore = () => {
    //assigning a variable to the value of the input from refs
    const usrChore = this.refs.name.value;

    //catching the error if a user tries to enter a blank string
    if (usrChore === "") {
      return alert("Please enter a chore first");
    } else {
      //Adding the new chore to state object
      const chores = { ...this.state.chores };
      chores[`chore${Date.now()}`] = usrChore;
      this.refs.name.value = "";
      return this.setState({ chores });
    }
  };

  submitChore = event => {
    event.preventDefault();
  };

  showEdit = event => {
    var keys = event.target.id;
    var edited = this.state.chores[keys];
    const editChores = { ...this.state.chores };
    console.log(edited);
    var editChore = prompt("Please edit Chore", edited);
    if (editChore === null || editChore === "") {
      alert("Field cannot be blank");
      editChore = prompt("Please edit Chore", edited);
    } else {
      editChores[keys] = editChore;
    }

    this.setState({ chores: editChores });
  };

  finishChore = event => {
    //Deleting the finished chore from chores object and adding it to the finChores object
    const finished = event.target.id;
    const finchore = { ...this.state.chores };

    const doneChores = { ...this.state.finChores };

    doneChores[finished] = finchore[finished];
    this.setState({ finChores: doneChores });

    finchore[finished] = null;

    this.setState({ chores: finchore });
  };

  deleteChore = event => {
    //deleting a chore from the chores object
    const delChore = event.target.id;
    const choresDel = { ...this.state.chores };

    choresDel[delChore] = null;

    this.setState({ chores: choresDel });
  };

  clearFinished = () => {
    var clearFin = { ...this.state.finChores };

    clearFin = null;
    this.setState({ finChores: clearFin });
  };

  choreClear = () => {
    //clearing every entry in both objects
    this.setState({ chores: null });
    this.setState({ finChores: null });
  };
  authHandler = async authData => {
    //1.Look up the current object in firebase database
    const obj = await base.fetch("localhost:3000", { context: this });
    //2.Claim it if there is no owner
    if (!obj.owner) {
      await base.post(`"localhost:3000"/owner`, {
        data: authData.user.uid
      });
    }
    //3. set the state of the component to reflect the user
    this.setState({
      uid: authData.user.uid,
      owner: obj.owner || authData.user.uid
    });
  };
  authenticate = provider => {
    const authProvider = new firebase.auth[`${provider}AuthProvider`]();
    firebaseApp
      .auth()
      .signInWithPopup(authProvider)
      .then(this.authHandler);
  };

  logout = async () => {
    if (window.confirm("Are you sure you want to Log Out?")) {
      await firebase.auth().signOut();
      this.setState({ uid: null });
    }
  };

  render() {
    const logout = <button onClick={this.logout}>Log Out</button>;
    // check if they are logged in
    if (!this.state.uid) {
      return <Login authenticate={this.authenticate} />;
    }
    return (
      <form onSubmit={this.submitChore}>
        {logout}
        <input type="text" name="input1" ref="name" placeholder="Enter Chore" />
        <button type="Submit" onClick={this.addChore}>
          Submit
        </button>
        {Object.keys(this.state.chores).map(key => (
          <li key={key} ref={this.state.chores.key}>
            {this.state.chores[key]}
            <button class="line" onClick={this.showEdit} id={key}>
              Edit
            </button>
            <button class="line" onClick={this.finishChore} id={key}>
              Finished
            </button>
            <button class="line" onClick={this.deleteChore} id={key}>
              Delete
            </button>
            <p> </p>
          </li>
        ))}

        <p>Finished Chores:</p>
        {Object.keys(this.state.finChores).map(key => (
          <li key={key} ref={this.state.finChores.key}>
            {this.state.finChores[key]}
            <p> </p>
          </li>
        ))}

        <button onClick={this.clearFinished}>Clear Finished</button>

        <button class="clear" onClick={this.choreClear}>
          Clear All
        </button>
      </form>
    );
  }
}
export default App;
