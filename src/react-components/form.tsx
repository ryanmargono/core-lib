import { Form } from 'antd';

export const RequiredFormItem = (props: any) => {
  return <Form.Item {...props} rules={[{ required: true, message: '' }]} />;
};
