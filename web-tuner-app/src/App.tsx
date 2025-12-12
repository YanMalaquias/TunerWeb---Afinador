import React from 'react';
import Header from './components/Header/Header';
import Tuner from './components/Tuner/Tuner';
import FrequencyVisualizer from './components/FrequencyVisualizer/FrequencyVisualizer';
import Footer from './components/Footer/Footer';
import './styles/globals.css';

const App = () => {
    return (
        <div className="app">
            <Header />
            <Tuner />
            <FrequencyVisualizer />
            <Footer />
        </div>
    );
};

export default App;
