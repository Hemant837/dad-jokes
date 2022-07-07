import React, { Component } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import Joke from "./Joke";
import "./JokesList.css";

class JokesList extends Component {
  static defaultProps = {
    numJokes: 10,
  };
  constructor(props) {
    super(props);
    this.state = {
      jokes: JSON.parse(window.localStorage.getItem("jokes") || "[]"),
      loading: false,
    };
    this.seenJokes = new Set(this.state.jokes.map((j) => j.text));
    console.log(this.seenJokes);
    this.handleClick = this.handleClick.bind(this);
  }
  componentDidMount() {
    if (this.props.jokes === 0) this.getJokes();
  }

  async getJokes() {
    let jokes = [];
    while (jokes.length < this.props.numJokes) {
      let res = await axios.get("https://icanhazdadjoke.com/", {
        headers: { Accept: "application/json" },
      });
      let newJoke = res.data.joke;
      if (!this.seenJokes.has(newJoke)) {
        jokes.push({ id: uuidv4(), text: newJoke, votes: 0 });
      } else {
        console.log("Found a duplicate");
        console.log(newJoke);
      }
    }
    this.setState(
      (st) => ({
        loading: false,
        jokes: [...st.jokes, ...jokes],
      }),

      () =>
        window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
    );
  }

  handleVote(id, delta) {
    this.setState(
      (st) => ({
        jokes: st.jokes.map((j) =>
          j.id === id ? { ...j, votes: j.votes + delta } : j
        ),
      }),
      () =>
        window.localStorage.setItem("jokes", JSON.stringify(this.state.jokes))
    );
  }
  handleClick() {
    this.setState({ loading: true }, this.getJokes);
  }
  render() {
    if (this.state.loading) {
      return (
        <div className="JokeList-spinner">
          <i className="fas fa-8x fa-laugh fa-spin" />
          <h1 className="JokesList-title">Loading...</h1>
        </div>
      );
    }
    let jokes = this.state.jokes.sort((a, b) => b.votes - a.votes);
    return (
      <div className="JokesList">
        <div className="JokesList-sidebar">
          <h1 className="JokesList-title">
            <span>Dad</span> Jokes
          </h1>
          <img
            className="shake-slow"
            src="https://assets.dryicons.com/uploads/icon/svg/8927/0eb14c71-38f2-433a-bfc8-23d9c99b3647.svg"
          />
          <button className="JokesList-btn " onClick={this.handleClick}>
            Add Jokes
          </button>
        </div>
        <div className="JokesList-jokes">
          {jokes.map((j) => (
            <Joke
              key={j.id}
              votes={j.votes}
              text={j.text}
              upvote={() => this.handleVote(j.id, 1)}
              downvote={() => this.handleVote(j.id, -1)}
            />
          ))}
        </div>
      </div>
    );
  }
}

export default JokesList;
