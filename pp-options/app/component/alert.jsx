import { Modal, TitleBar, useAppBridge } from "@shopify/app-bridge-react";

export const Alert = ({msg, callback}) => {
    const shopify = useAppBridge();
    const handleOk = () => {
        callback.apply();
        shopify.modal.hide("op-alert");
    }
    return (
        <>
        <Modal id="op-alert">
            <p>{msg}</p>
            <TitleBar title="Tips">
                <button variant="primary" onClick={handleOk}>Ok</button>
                <button onClick={() => shopify.modal.hide("op-alert")}>Cancel</button>
            </TitleBar>
        </Modal>
        </>
    )
}

export const ShowAlert = () => {
    const shopify = useAppBridge();
    shopify.modal.show("op-alert");
};