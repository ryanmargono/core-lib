import { Button, type ButtonProps } from 'antd';

export const Btn = (props: ButtonProps & { backgroundImage?: any }) => {
  return (
    <Button
      {...props}
      type='text'
      style={{
        borderRadius: 0,
        border: 'none',
        display: 'flex',
        padding: 0,
        margin: 0,
        boxSizing: 'border-box',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundImage: `url(${props.backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        ...props.style,
      }}
    >
      {props.children}
    </Button>
  );
};
