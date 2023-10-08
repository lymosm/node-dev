import { Page, IndexTable, Layout, Card, EmptyState } from "@shopify/polaris";
import { json } from "@remix-run/node";
import { useNavigate, useLoaderData } from "@remix-run/react";

import { authenticate } from "../shopify.server";
import { getQRcodes } from "../models/QRCode.server";

export const loader = async ({request}) => {
    const { admin, session } = await authenticate.admin(request);
    // const qrcodes = await getQRcodes(session.shop, admin.graphql);
    const qrcodes = [];
    return json({ qrcodes });
}

const EmptyQRState = ({onAction}) => (
    <EmptyState
        heading="Create unique qrcode for your product"
        action={{
            content: "Create QRCode",
            onAction
        }}
        image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
        >
            <p>Allow customers scan qrcode and buy product use phones.</p>
        </EmptyState>
);

const QRTable = ({qrcodes}) => (
    <IndexTable
        itemCount={qrcodes.length}
        headings={[
            { title: "Thumbnail"},
            { title: "Title" },
            { title: "Product" },
            { title: "Date Created" },
            { title: "Scans" }
        ]
        }
    >

    </IndexTable>
);

export default function Index(){
    const { qrcodes } = useLoaderData();
    const navigate = useNavigate();
    
    return (
        <Page>
            <ui-title-bar title="QRCode List">
                <button variant="primary" onClick = {() => navigate("/app/qrcodes/new")}>Create QR Code</button>
            </ui-title-bar>
            <Layout>
                <Layout.Section>
                    <Card>
                        {qrcodes.length === 0 ? (<EmptyQRState onAction={() => navigate("qrcodes/new")}></EmptyQRState>) : (<QRTable qrcodes={qrcodes}></QRTable>)}
                    </Card>
                </Layout.Section>
            </Layout>
        </Page>
    );
}