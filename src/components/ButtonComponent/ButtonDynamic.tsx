import { Button } from 'antd';

interface ButtonDynamicProps {
    bttnType?: "link" | "text" | "primary" | "default" | "dashed" | undefined;
    bttnHtmlType?: "button" | "submit" | "reset" | undefined;
    bttnTitle: string;
}

function ButtonDynamic(props:ButtonDynamicProps) {
    return (
        <Button
            type={props?.bttnType || 'primary'}
            htmlType={props?.bttnHtmlType || 'submit'}
            block
            className='rjb-bttn-component'
        >
            {props.bttnTitle}
        </Button>
    )
}

export default ButtonDynamic