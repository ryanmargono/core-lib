import { Flex, type FlexProps } from 'antd';

export const Div = (props: FlexProps & { backgroundImage?: any }) => {
  let styleProps: any = {
    boxSizing: 'border-box',
    padding: 0,
    margin: 0,
    ...props.style,
  };
  if (props.backgroundImage) {
    styleProps = {
      backgroundImage: `url(${props.backgroundImage})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      ...styleProps,
    };
  }

  return (
    <Flex {...props} style={styleProps}>
      {props.children}
    </Flex>
  );
};
