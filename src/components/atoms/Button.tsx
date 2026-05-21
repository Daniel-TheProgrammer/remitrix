'use client';

import styles from './Button.module.scss';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({ className = '', ...props }: ButtonProps) {
  const classes = [styles.button, className].filter(Boolean).join(' ');
  return <button className={classes} {...props} />;
}
