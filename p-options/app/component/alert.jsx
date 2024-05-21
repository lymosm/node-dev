import { Modal, TitleBar, useAppBridge } from "@shopify/app-bridge-react";

export const Alert = (msg, callback) => {
    const shopify = useAppBridge();
    return (
        <>
        <button onClick={() => shopify.modal.show('op-alert')}>Open Modal</button>
        <Modal id="op-alert">
            <p>898989</p>
            <TitleBar title="Tips">
                <button variant="primary">Ok</button>
                <button>Cancel</button>
            </TitleBar>
        </Modal>
        </>
    )
}