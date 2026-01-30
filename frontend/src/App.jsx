// Main App component

import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { getUsers } from './api/users';
import Header from './components/common/Header';
import Footer from './components/common/Footer';
import HomePage from './pages/HomePage';
import ItemListPage from './pages/ItemListPage';
import ItemDetailPage from './pages/ItemDetailPage';
import CreateItemPage from './pages/CreateItemPage';
import MyItemsPage from './pages/MyItemsPage';
import MyReservationsPage from './pages/MyReservationsPage';
import './App.css';

function App() {
  const [users, setUsers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    getUsers()
      .then(data => {
        setUsers(data);
        if (data.length > 0) {
          setCurrentUser(data[0]);
        }
      })
      .catch(console.error);
  }, []);

  return (
    <BrowserRouter>
      <div className="app">
        <Header currentUser={currentUser} users={users} onUserChange={setCurrentUser} />

        <main className="main-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/items" element={<ItemListPage currentUser={currentUser} />} />
            <Route path="/items/new" element={<CreateItemPage currentUser={currentUser} />} />
            <Route path="/items/:id" element={<ItemDetailPage currentUser={currentUser} />} />
            <Route path="/my-items" element={<MyItemsPage currentUser={currentUser} />} />
            <Route path="/my-reservations" element={<MyReservationsPage currentUser={currentUser} />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
