import React from 'react'
import { hot } from 'react-hot-loader/root'
import './App.css'
import List from './List'

const App = () => {
  return (
    <div className="App">
      <header className="App-header">
        <List />
      </header>
    </div>
  )
}

export default hot(App)
