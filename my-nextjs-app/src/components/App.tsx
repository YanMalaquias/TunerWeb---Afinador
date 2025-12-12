import React from 'react';
import Tuner from './Tuner/Tuner';
import ErrorBoundary from './ErrorBoundary';
import Header from './Header/Header';
import './App.css';

const App: React.FC = () => {
    return (
        <ErrorBoundary>
            <div className="App">
                <Header />
                <Tuner />
            </div>
        </ErrorBoundary>
    );
};

export default App;