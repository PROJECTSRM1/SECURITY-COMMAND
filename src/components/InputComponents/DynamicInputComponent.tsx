import { Input } from "antd";

interface DynamicInputProps {
  placeholder?: string;
  size?: "small" | "middle" | "large";
  prefixIcon?: React.ReactNode;
  suffixIcon?: React.ReactNode;
  inputType?: string;
  value: string;
  onChange: any;
}

function DynamicInputComponent(props: DynamicInputProps) {
  return (
    <>
      {props?.inputType === 'password' ? <Input.Password
      className="rjb-dynamic-inputbox"
        type={props?.inputType || "text"}
        placeholder={props?.placeholder || "Enter text"}
        size={props?.size || "large"}
        prefix={props?.prefixIcon}
        suffix={props?.suffixIcon}
        value={props.value}
        onChange={props.onChange}
      /> : <Input
      className="rjb-dynamic-inputbox"
        type={props?.inputType || "text"}
        placeholder={props?.placeholder || "Enter text"}
        size={props?.size || "large"}
        prefix={props?.prefixIcon}
        suffix={props?.suffixIcon}
        value={props.value}
        onChange={props.onChange}
      />}
    </>
  )
}

export default DynamicInputComponent