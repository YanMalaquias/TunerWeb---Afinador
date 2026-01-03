import React from 'react';
import styles from './Header.module.css';

const Header: React.FC = () => {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>TunerWeb</h1>
      <p className={styles.subtitle}>Um Afinador Musical Preciso para a Web</p>
    </header>
  );
};

export default Header;