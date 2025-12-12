import React from 'react';
import styles from './Footer.module.css';

const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <small>© Web Tuner</small>
    </footer>
  );
};

export default Footer;
