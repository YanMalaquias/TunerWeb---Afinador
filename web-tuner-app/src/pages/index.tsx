import React from 'react';
import Header from '../components/Header/Header';
import Tuner from '../components/Tuner/Tuner';
import FrequencyVisualizer from '../components/FrequencyVisualizer/FrequencyVisualizer';
import Footer from '../components/Footer/Footer';
import './index.css';

const IndexPage: React.FC = () => {
    return (
        <div className="app-container">
            <Header />
            <Tuner />
            <FrequencyVisualizer />
            <Footer />
        </div>
    );
};

export default IndexPage;